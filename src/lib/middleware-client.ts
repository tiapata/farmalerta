import { supabase } from "@/integrations/supabase/client";

export interface SyncRunSummary {
  recordsProcessed: number;
  recordsFailed: number;
  errors: string[];
  syncRunId: string;
}

export async function uploadErpExport(file: File): Promise<SyncRunSummary> {
  const formData = new FormData();
  formData.append("file", file);

  const { data, error } = await supabase.functions.invoke("middleware-import", {
    body: formData,
  });

  if (error) throw error;
  return data as SyncRunSummary;
}
