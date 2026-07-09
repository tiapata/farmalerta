// Envio de mensagem pelo staff a partir do Inbox. Mesmo padrão de auth de
// middleware-import: resolve pharmacyId a partir do JWT do chamador, nunca
// confia em pharmacy_id vindo do corpo da requisição. Qualquer usuário da
// farmácia pode responder (não é admin-only, como criar/editar automações).
import { corsHeaders } from "../_shared/cors.ts";
import { createCallerClient, createServiceRoleClient } from "../_shared/supabase-clients.ts";
import { sendText } from "../_shared/evolution-client.ts";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Método não suportado" }, 405);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return json({ error: "Não autenticado" }, 401);
  }

  const callerClient = createCallerClient(authHeader);
  const { data: { user }, error: userError } = await callerClient.auth.getUser();
  if (userError || !user) {
    return json({ error: "Não autenticado" }, 401);
  }

  const { data: profile, error: profileError } = await callerClient
    .from("profiles")
    .select("pharmacy_id")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError || !profile?.pharmacy_id) {
    return json({ error: "Usuário sem farmácia associada" }, 403);
  }
  const pharmacyId = profile.pharmacy_id as string;

  let body: { conversation_id?: string; text?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Corpo inválido, esperado JSON" }, 400);
  }
  if (!body.conversation_id || !body.text?.trim()) {
    return json({ error: "conversation_id e text são obrigatórios" }, 400);
  }

  const service = createServiceRoleClient();

  const { data: conversation, error: conversationError } = await service
    .from("conversations")
    .select("id, pharmacy_id, contact_phone, whatsapp_instance_id")
    .eq("id", body.conversation_id)
    .maybeSingle();

  if (conversationError || !conversation || conversation.pharmacy_id !== pharmacyId) {
    return json({ error: "Conversa não encontrada" }, 404);
  }

  const { data: instance } = await service
    .from("whatsapp_instances")
    .select("evolution_instance_name, status")
    .eq("id", conversation.whatsapp_instance_id)
    .maybeSingle();

  if (!instance || instance.status !== "connected") {
    return json({ error: "WhatsApp não está conectado" }, 409);
  }

  try {
    const result = await sendText(instance.evolution_instance_name, conversation.contact_phone, body.text.trim());

    const { data: message, error: insertError } = await service
      .from("messages")
      .insert([{
        pharmacy_id: pharmacyId,
        conversation_id: conversation.id,
        direction: "outbound",
        content_type: "text",
        body: body.text.trim(),
        evolution_message_id: result?.key?.id ?? null,
        status: "sent",
        sent_by: user.id,
      }])
      .select()
      .single();
    if (insertError) throw insertError;

    await service
      .from("conversations")
      .update({
        last_message_at: new Date().toISOString(),
        last_message_preview: body.text.trim().slice(0, 200),
      })
      .eq("id", conversation.id);

    return json(message);
  } catch (error) {
    console.error("Erro ao enviar mensagem via Evolution API:", error);
    return json({ error: "Erro ao enviar mensagem: " + String(error) }, 502);
  }
});
