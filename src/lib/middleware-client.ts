import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface SyncRunSummary {
  recordsProcessed: number;
  recordsFailed: number;
  errors: string[];
  syncRunId: string;
}

/** supabase-js only exposes a generic "non-2xx status code" message by default —
 * the real reason is in the response body, which has to be read separately. */
async function describeError(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = await error.context.json();
      if (typeof body?.error === "string") return body.error;
    } catch {
      // corpo não era JSON — cai no fallback abaixo
    }
  }
  return error instanceof Error ? error.message : String(error);
}

export async function uploadErpExport(file: File, columnMapping?: Record<string, string>): Promise<SyncRunSummary> {
  const formData = new FormData();
  formData.append("file", file);
  if (columnMapping) {
    formData.append("column_mapping", JSON.stringify(columnMapping));
  }

  const { data, error } = await supabase.functions.invoke("middleware-import", {
    body: formData,
  });

  if (error) throw new Error(await describeError(error));
  return data as SyncRunSummary;
}
