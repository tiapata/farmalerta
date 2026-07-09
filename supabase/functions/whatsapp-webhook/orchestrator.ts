// Lógica de negócio dos eventos recebidos da Evolution API. Os nomes/forma
// exata dos campos abaixo (data.key.remoteJid, data.message.conversation
// etc.) seguem a convenção mais comum documentada da Evolution API v2
// (que por sua vez espelha a lib Baileys) — confirmar com uma mensagem de
// teste real na primeira integração e ajustar os pontos marcados abaixo se
// necessário, sem precisar reestruturar o resto do fluxo.
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { digitsOnly, phoneFromJid } from "../_shared/phone.ts";

interface WhatsappInstanceRow {
  id: string;
  pharmacy_id: string;
}

function extractTextBody(message: Record<string, unknown> | undefined): string | null {
  if (!message) return null;
  if (typeof message.conversation === "string") return message.conversation;
  const extended = message.extendedTextMessage as { text?: string } | undefined;
  if (extended?.text) return extended.text;
  return null;
}

function detectContentType(message: Record<string, unknown> | undefined): {
  contentType: "text" | "image" | "audio" | "video" | "document" | "location" | "other";
  mediaUrl: string | null;
} {
  if (!message) return { contentType: "other", mediaUrl: null };
  if (message.conversation || message.extendedTextMessage) return { contentType: "text", mediaUrl: null };
  const mediaKeys: Array<["image" | "audio" | "video" | "document", string]> = [
    ["image", "imageMessage"],
    ["audio", "audioMessage"],
    ["video", "videoMessage"],
    ["document", "documentMessage"],
  ];
  for (const [contentType, key] of mediaKeys) {
    const media = message[key] as { url?: string } | undefined;
    if (media) return { contentType, mediaUrl: media.url ?? null };
  }
  if (message.locationMessage) return { contentType: "location", mediaUrl: null };
  return { contentType: "other", mediaUrl: null };
}

async function findOrCreateConversation(
  client: SupabaseClient,
  instance: WhatsappInstanceRow,
  contactPhone: string,
  contactName: string | null,
): Promise<{ id: string; isNew: boolean }> {
  const { data: existing } = await client
    .from("conversations")
    .select("id")
    .eq("pharmacy_id", instance.pharmacy_id)
    .eq("contact_phone", contactPhone)
    .maybeSingle();

  if (existing) return { id: existing.id, isNew: false };

  const { data: customerMatch } = await client
    .from("customers")
    .select("id")
    .eq("pharmacy_id", instance.pharmacy_id)
    .eq("phone_digits", contactPhone)
    .maybeSingle();

  const { data: created, error } = await client
    .from("conversations")
    .insert([{
      pharmacy_id: instance.pharmacy_id,
      whatsapp_instance_id: instance.id,
      customer_id: customerMatch?.id ?? null,
      contact_phone: contactPhone,
      contact_name: contactName,
    }])
    .select("id")
    .single();
  if (error) throw error;

  return { id: created.id, isNew: true };
}

async function ensureDefaultPipelineCard(client: SupabaseClient, pharmacyId: string, conversationId: string) {
  const { data: pipeline } = await client
    .from("pipelines")
    .select("id")
    .eq("pharmacy_id", pharmacyId)
    .eq("is_default", true)
    .maybeSingle();
  if (!pipeline) return; // farmácia sem pipeline padrão (não deveria acontecer, mas não é fatal)

  const { data: firstStage } = await client
    .from("pipeline_stages")
    .select("id")
    .eq("pipeline_id", pipeline.id)
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!firstStage) return;

  await client.from("pipeline_cards").insert([{
    pharmacy_id: pharmacyId,
    pipeline_id: pipeline.id,
    stage_id: firstStage.id,
    conversation_id: conversationId,
  }]);
  // Conflito de unique (pipeline_id, conversation_id) é esperado se o
  // webhook reprocessar o mesmo evento — ignorar silenciosamente não é
  // necessário aqui pois só chamamos isso quando a conversa é nova.
}

export async function handleInboundMessage(client: SupabaseClient, instance: WhatsappInstanceRow, data: any) {
  const remoteJid: string | undefined = data?.key?.remoteJid;
  if (!remoteJid || data?.key?.fromMe) return; // ignora eco de mensagens enviadas por nós mesmos

  const contactPhone = phoneFromJid(remoteJid);
  const contactName: string | null = data?.pushName ?? null;
  const { contentType, mediaUrl } = detectContentType(data?.message);
  const body = extractTextBody(data?.message);

  const { id: conversationId, isNew } = await findOrCreateConversation(client, instance, contactPhone, contactName);

  await client.from("messages").insert([{
    pharmacy_id: instance.pharmacy_id,
    conversation_id: conversationId,
    direction: "inbound",
    content_type: contentType,
    body,
    media_url: mediaUrl,
    evolution_message_id: data?.key?.id ?? null,
    status: "delivered",
    raw_payload: data,
  }]);

  const preview = body ?? `[${contentType}]`;
  await client
    .from("conversations")
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: preview.slice(0, 200),
      unread_count: isNew ? 1 : undefined,
      contact_name: contactName ?? undefined,
    })
    .eq("id", conversationId);

  if (isNew) {
    await ensureDefaultPipelineCard(client, instance.pharmacy_id, conversationId);
  } else {
    await client.rpc("increment_conversation_unread", { p_conversation_id: conversationId });
  }
}

export async function handleConnectionUpdate(client: SupabaseClient, instance: WhatsappInstanceRow, data: any) {
  const state: string | undefined = data?.state;
  const statusMap: Record<string, string> = {
    open: "connected",
    connecting: "connecting",
    close: "disconnected",
  };
  const status = (state && statusMap[state]) || "error";

  await client
    .from("whatsapp_instances")
    .update({
      status,
      phone_number: status === "connected" ? digitsOnly(data?.wuid ?? data?.number) || undefined : undefined,
      last_connected_at: status === "connected" ? new Date().toISOString() : undefined,
      qr_code_data: status === "connected" ? null : undefined,
    })
    .eq("id", instance.id);
}

export async function handleQrCodeUpdate(client: SupabaseClient, instance: WhatsappInstanceRow, data: any) {
  const qrBase64: string | undefined = data?.qrcode?.base64 ?? data?.base64;
  await client
    .from("whatsapp_instances")
    .update({ status: "qr_pending", qr_code_data: qrBase64 ?? null })
    .eq("id", instance.id);
}

export async function handleMessageStatusUpdate(client: SupabaseClient, _instance: WhatsappInstanceRow, data: any) {
  const evolutionMessageId: string | undefined = data?.key?.id ?? data?.messageId;
  const rawStatus: string | undefined = data?.status ?? data?.update?.status;
  if (!evolutionMessageId || !rawStatus) return;

  const statusMap: Record<string, string> = {
    DELIVERY_ACK: "delivered",
    READ: "read",
    SERVER_ACK: "sent",
    ERROR: "failed",
  };
  const status = statusMap[rawStatus] ?? undefined;
  if (!status) return;

  await client.from("messages").update({ status }).eq("evolution_message_id", evolutionMessageId);
}
