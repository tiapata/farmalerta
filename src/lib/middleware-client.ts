import { supabase } from "@/integrations/supabase/client";
import { describeEdgeFunctionError } from "@/lib/edge-function-error";

export interface SyncRunSummary {
  recordsProcessed: number;
  recordsFailed: number;
  errors: string[];
  syncRunId: string;
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

  if (error) throw new Error(await describeEdgeFunctionError(error));
  return data as SyncRunSummary;
}
