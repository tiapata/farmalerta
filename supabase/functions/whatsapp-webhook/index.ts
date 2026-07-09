// Entrada pública do webhook da Evolution API — NÃO é um chamador
// autenticado por JWT do Supabase (é o próprio servidor da Evolution API
// chamando), então a autenticação é por um token embutido na URL do
// webhook (?instance=...&token=...), gerado por nós em whatsapp-instance e
// conferido contra whatsapp_instances.webhook_token. Requer
// `verify_jwt = false` para esta função em supabase/config.toml.
import { corsHeaders } from "../_shared/cors.ts";
import { createServiceRoleClient } from "../_shared/supabase-clients.ts";
import {
  handleConnectionUpdate,
  handleInboundMessage,
  handleMessageStatusUpdate,
  handleQrCodeUpdate,
} from "./orchestrator.ts";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Método não suportado" }, 405);
  }

  const url = new URL(req.url);
  const instanceName = url.searchParams.get("instance");
  const token = url.searchParams.get("token");
  if (!instanceName || !token) {
    return json({ error: "Parâmetros instance/token ausentes" }, 400);
  }

  const service = createServiceRoleClient();

  const { data: instance, error: instanceError } = await service
    .from("whatsapp_instances")
    .select("id, pharmacy_id, webhook_token")
    .eq("evolution_instance_name", instanceName)
    .maybeSingle();

  if (instanceError || !instance) {
    return json({ error: "Instância não encontrada" }, 404);
  }
  if (!timingSafeEqual(token, instance.webhook_token)) {
    return json({ error: "Token inválido" }, 401);
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Corpo inválido, esperado JSON" }, 400);
  }

  // A Evolution API entrega o nome do evento em minúsculo-com-ponto no
  // corpo (ex.: "messages.upsert"), mesmo a configuração usando constantes
  // maiúsculas (MESSAGES_UPSERT) — normalizamos pra maiúsculo aqui pra não
  // depender de qual das duas grafias chega.
  const event: string = String(payload?.event ?? "").toUpperCase().replace(/\./g, "_");
  const data = payload?.data;

  try {
    switch (event) {
      case "MESSAGES_UPSERT":
        await handleInboundMessage(service, instance, data);
        break;
      case "CONNECTION_UPDATE":
        await handleConnectionUpdate(service, instance, data);
        break;
      case "QRCODE_UPDATED":
        await handleQrCodeUpdate(service, instance, data);
        break;
      case "MESSAGES_UPDATE":
        await handleMessageStatusUpdate(service, instance, data);
        break;
      default:
        // Eventos não tratados (contatos, grupos, presença etc.) são
        // aceitos e ignorados — não é erro.
        break;
    }
    return json({ ok: true });
  } catch (error) {
    console.error("Erro ao processar webhook da Evolution API:", event, error);
    // Responde 200 mesmo em erro interno: evita que a Evolution API entre
    // em loop de retry por um evento que vamos sempre falhar em processar
    // (ex.: payload inesperado) — o erro já foi logado para investigação.
    return json({ ok: false, error: String(error) });
  }
});
