// Entrada HTTP do driver Tier 2 (Exportação Automática, upload manual v1).
// Autentica o chamador, resolve a farmácia via profiles (nunca confia em
// pharmacy_id vindo do corpo da requisição), interpreta o arquivo enviado,
// aplica o CanonicalBundle resultante e registra tudo em sync_runs.
import { corsHeaders } from "../_shared/cors.ts";
import { createCallerClient, createServiceRoleClient } from "../_shared/supabase-clients.ts";
import { parseCsv } from "./parsers/csv.ts";
import { parseXlsx } from "./parsers/xlsx.ts";
import { buildBundleFromRows, DEFAULT_COLUMN_MAPPING } from "./drivers/automated-export.ts";
import { applyBundle } from "./orchestrator.ts";

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
    .select("pharmacy_id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile?.pharmacy_id) {
    return json({ error: "Usuário sem farmácia associada" }, 403);
  }
  if (profile.role !== "admin") {
    return json({ error: "Apenas administradores podem importar dados do ERP" }, 403);
  }

  const pharmacyId = profile.pharmacy_id as string;
  const service = createServiceRoleClient();

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return json({ error: "Requisição inválida: esperado multipart/form-data" }, 400);
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return json({ error: "Nenhum arquivo enviado" }, 400);
  }

  // Garante uma integration_configs para este driver, criando com o
  // mapeamento padrão se a farmácia ainda não configurou nada.
  const { data: existingConfig } = await service
    .from("integration_configs")
    .select("*")
    .eq("pharmacy_id", pharmacyId)
    .eq("driver_type", "automated_export")
    .maybeSingle();

  let integrationConfig = existingConfig;
  if (!integrationConfig) {
    const { data: created, error: createError } = await service
      .from("integration_configs")
      .insert([{
        pharmacy_id: pharmacyId,
        driver_type: "automated_export",
        priority: 2,
        status: "not_configured",
        config: { column_mapping: DEFAULT_COLUMN_MAPPING },
      }])
      .select()
      .single();
    if (createError || !created) {
      return json({ error: "Falha ao criar configuração de integração" }, 500);
    }
    integrationConfig = created;
  }

  const columnMapping =
    (integrationConfig.config as Record<string, unknown> | null)?.column_mapping as
      | Record<string, string>
      | undefined ?? DEFAULT_COLUMN_MAPPING;

  const { data: syncRun, error: syncRunError } = await service
    .from("sync_runs")
    .insert([{
      integration_config_id: integrationConfig.id,
      pharmacy_id: pharmacyId,
      status: "running",
      source_file_name: file.name,
    }])
    .select()
    .single();
  if (syncRunError || !syncRun) {
    return json({ error: "Falha ao iniciar sincronização" }, 500);
  }

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const rows = file.name.toLowerCase().endsWith(".csv") ? parseCsv(bytes) : parseXlsx(bytes);
    const bundle = buildBundleFromRows(rows, columnMapping);
    const summary = await applyBundle(service, pharmacyId, bundle);

    await service
      .from("sync_runs")
      .update({
        status: summary.recordsFailed > 0 ? "partial" : "success",
        finished_at: new Date().toISOString(),
        records_processed: summary.recordsProcessed,
        records_failed: summary.recordsFailed,
        error_details: summary.errors.length ? { errors: summary.errors } : null,
      })
      .eq("id", syncRun.id);

    await service
      .from("integration_configs")
      .update({
        status: "active",
        last_sync_at: new Date().toISOString(),
        last_error: summary.errors[0] ?? null,
      })
      .eq("id", integrationConfig.id);

    return json({ ...summary, syncRunId: syncRun.id });
  } catch (error) {
    const message = String(error instanceof Error ? error.message : error);

    await service
      .from("sync_runs")
      .update({
        status: "failed",
        finished_at: new Date().toISOString(),
        error_details: { message },
      })
      .eq("id", syncRun.id);

    await service
      .from("integration_configs")
      .update({ status: "error", last_error: message })
      .eq("id", integrationConfig.id);

    console.error(error);
    return json({ error: "Erro ao processar importação: " + message }, 500);
  }
});
