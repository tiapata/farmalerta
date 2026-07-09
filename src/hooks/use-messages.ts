import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { sendWhatsappMessage } from "@/lib/whatsapp-client";
import type { Tables } from "@/integrations/supabase/types";

export type Message = Tables<"messages">;

async function fetchMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export function useMessages(conversationId: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ["messages", conversationId];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchMessages(conversationId as string),
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          queryClient.setQueryData<Message[]>(queryKey, (old) => {
            const incoming = payload.new as Message;
            if (old?.some((m) => m.id === incoming.id)) return old;
            return [...(old ?? []), incoming];
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const updated = payload.new as Message;
          queryClient.setQueryData<Message[]>(queryKey, (old) =>
            old?.map((m) => (m.id === updated.id ? updated : m)),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, queryClient]);

  const sendMutation = useMutation({
    mutationFn: (text: string) => sendWhatsappMessage(conversationId as string, text),
    onMutate: async (text: string) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Message[]>(queryKey);
      const optimistic: Message = {
        id: `optimistic-${Date.now()}`,
        pharmacy_id: "",
        conversation_id: conversationId as string,
        direction: "outbound",
        content_type: "text",
        body: text,
        media_url: null,
        evolution_message_id: null,
        status: "pending",
        sent_by: null,
        error_message: null,
        raw_payload: null,
        created_at: new Date().toISOString(),
      };
      queryClient.setQueryData<Message[]>(queryKey, (old) => [...(old ?? []), optimistic]);
      return { previous, optimisticId: optimistic.id };
    },
    onError: (_err, _text, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSuccess: (message, _text, context) => {
      queryClient.setQueryData<Message[]>(queryKey, (old) =>
        old?.map((m) => (m.id === context?.optimisticId ? message : m)),
      );
    },
  });

  return {
    messages: query.data ?? [],
    loading: query.isLoading,
    sendMessage: sendMutation.mutateAsync,
    sending: sendMutation.isPending,
  };
}
