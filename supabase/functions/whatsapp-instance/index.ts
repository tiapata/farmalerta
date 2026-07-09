// Admin-only: cria/conecta/consulta/desconecta a instância de WhatsApp da
// farmácia. Alimenta o card de conexão em Configurações.
import { corsHeaders } from "../_shared/cors.ts";
import { createCallerClient, createServiceRoleClient } from "../_shared/supabase-clients.ts";
import { connectInstance, createInstance, deleteInstance, getConnectionState } from "../_shared/evolution-client.ts";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function generateToken(): string {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
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
    .select("pharmacy_id, role")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError || !profile?.pharmacy_id) {
    return json({ error: "Usuário sem farmácia associada" }, 403);
  }
  if (profile.role !== "admin") {
    return json({ error: "Apenas administradores podem gerenciar a conexão de WhatsApp" }, 403);
  }
  const pharmacyId = profile.pharmacy_id as string;

  let body: { action?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Corpo inválido, esperado JSON" }, 400);
  }

  const service = createServiceRoleClient();
  const supabaseUrl = Deno.env.get("SUPABASE_URL");

  switch (body.action) {
    case "create": {
      const { data: existing } = await service
        .from("whatsapp_instances")
        .select("id")
        .eq("pharmacy_id", pharmacyId)
        .maybeSingle();
      if (existing) {
        return json({ error: "Já existe uma instância configurada para esta farmácia" }, 409);
      }

      const evolutionInstanceName = `pharmacy_${pharmacyId}`;
      const webhookToken = generateToken();
      const webhookUrl = `${supabaseUrl}/functions/v1/whatsapp-webhook?instance=${evolutionInstanceName}&token=${webhookToken}`;

      try {
        const result = await createInstance(evolutionInstanceName, webhookUrl);
        const { data: created, error } = await service
          .from("whatsapp_instances")
          .insert([{
            pharmacy_id: pharmacyId,
            evolution_instance_name: evolutionInstanceName,
            webhook_token: webhookToken,
            status: "qr_pending",
            qr_code_data: result?.qrcode?.base64 ?? null,
          }])
          .select()
          .single();
        if (error) throw error;
        return json(created);
      } catch (error) {
        console.error("Erro ao criar instância na Evolution API:", error);
        return json({ error: "Erro ao criar instância: " + String(error) }, 502);
      }
    }

    case "qr": {
      const { data: instance } = await service
        .from("whatsapp_instances")
        .select("*")
        .eq("pharmacy_id", pharmacyId)
        .maybeSingle();
      if (!instance) return json({ error: "Nenhuma instância configurada" }, 404);

      try {
        const result = await connectInstance(instance.evolution_instance_name);
        const qr = result?.base64 ?? result?.qrcode?.base64 ?? null;
        const { data: updated, error } = await service
          .from("whatsapp_instances")
          .update({ status: "qr_pending", qr_code_data: qr })
          .eq("id", instance.id)
          .select()
          .single();
        if (error) throw error;
        return json(updated);
      } catch (error) {
        console.error("Erro ao buscar QR code:", error);
        return json({ error: "Erro ao buscar QR code: " + String(error) }, 502);
      }
    }

    case "status": {
      const { data: instance } = await service
        .from("whatsapp_instances")
        .select("*")
        .eq("pharmacy_id", pharmacyId)
        .maybeSingle();
      if (!instance) return json({ error: "Nenhuma instância configurada" }, 404);

      try {
        const result = await getConnectionState(instance.evolution_instance_name);
        const state: string | undefined = result?.instance?.state ?? result?.state;
        const statusMap: Record<string, string> = { open: "connected", connecting: "connecting", close: "disconnected" };
        const status = (state && statusMap[state]) || instance.status;

        const { data: updated, error } = await service
          .from("whatsapp_instances")
          .update({ status })
          .eq("id", instance.id)
          .select()
          .single();
        if (error) throw error;
        return json(updated);
      } catch (error) {
        console.error("Erro ao consultar status da instância:", error);
        return json(instance); // devolve o último estado conhecido em vez de falhar a tela
      }
    }

    case "disconnect": {
      const { data: instance } = await service
        .from("whatsapp_instances")
        .select("*")
        .eq("pharmacy_id", pharmacyId)
        .maybeSingle();
      if (!instance) return json({ error: "Nenhuma instância configurada" }, 404);

      try {
        await deleteInstance(instance.evolution_instance_name);
      } catch (error) {
        console.error("Erro ao remover instância na Evolution API (prosseguindo com limpeza local):", error);
      }
      await service.from("whatsapp_instances").delete().eq("id", instance.id);
      return json({ ok: true });
    }

    default:
      return json({ error: "Ação inválida. Use: create, qr, status ou disconnect" }, 400);
  }
});
