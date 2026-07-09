import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type PipelineCard = Tables<"pipeline_cards"> & {
  conversations: Pick<Tables<"conversations">, "contact_name" | "contact_phone" | "last_message_preview"> | null;
  customers: Pick<Tables<"customers">, "name" | "phone"> | null;
};

async function fetchCards(pipelineId: string): Promise<PipelineCard[]> {
  const { data, error } = await supabase
    .from("pipeline_cards")
    .select("*, conversations(contact_name, contact_phone, last_message_preview), customers(name, phone)")
    .eq("pipeline_id", pipelineId)
    .order("position");
  if (error) throw error;
  return (data ?? []) as PipelineCard[];
}

export function usePipelineCards(pipelineId: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ["pipeline-cards", pipelineId];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchCards(pipelineId as string),
    enabled: !!pipelineId,
  });

  useEffect(() => {
    if (!pipelineId) return;

    const channel = supabase
      .channel(`pipeline-cards-${pipelineId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pipeline_cards", filter: `pipeline_id=eq.${pipelineId}` },
        () => {
          queryClient.invalidateQueries({ queryKey });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pipelineId, queryClient]);

  const moveCard = useMutation({
    mutationFn: async ({ cardId, stageId, position }: { cardId: string; stageId: string; position: number }) => {
      const { error } = await supabase.from("pipeline_cards").update({ stage_id: stageId, position }).eq("id", cardId);
      if (error) throw error;
    },
    onMutate: async ({ cardId, stageId, position }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<PipelineCard[]>(queryKey);
      queryClient.setQueryData<PipelineCard[]>(queryKey, (old) =>
        old
          ?.map((card) => (card.id === cardId ? { ...card, stage_id: stageId, position } : card))
          .sort((a, b) => a.position - b.position),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
  });

  return {
    cards: query.data ?? [],
    loading: query.isLoading,
    moveCard: moveCard.mutate,
  };
}
