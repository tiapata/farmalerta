import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Pipeline = Tables<"pipelines">;
export type PipelineStage = Tables<"pipeline_stages">;

export function usePipelines() {
  const query = useQuery({
    queryKey: ["pipelines"],
    queryFn: async (): Promise<Pipeline[]> => {
      const { data, error } = await supabase.from("pipelines").select("*").order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  return { pipelines: query.data ?? [], loading: query.isLoading };
}

export function usePipelineStages(pipelineId: string | null) {
  const query = useQuery({
    queryKey: ["pipeline-stages", pipelineId],
    queryFn: async (): Promise<PipelineStage[]> => {
      const { data, error } = await supabase
        .from("pipeline_stages")
        .select("*")
        .eq("pipeline_id", pipelineId as string)
        .order("position");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!pipelineId,
  });

  return { stages: query.data ?? [], loading: query.isLoading };
}
