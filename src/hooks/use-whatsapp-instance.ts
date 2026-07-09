import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { callWhatsappInstance, type WhatsappInstanceAction } from "@/lib/whatsapp-client";
import type { Tables } from "@/integrations/supabase/types";

export type WhatsappInstance = Tables<"whatsapp_instances">;

export function useWhatsappInstance() {
  const queryClient = useQueryClient();
  const queryKey = ["whatsapp-instance"];

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<WhatsappInstance | null> => {
      const { data, error } = await supabase.from("whatsapp_instances").select("*").maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const action = useMutation({
    mutationFn: (action: WhatsappInstanceAction) => callWhatsappInstance(action),
    onSuccess: (result) => {
      if (result && "id" in result) {
        queryClient.setQueryData(queryKey, result);
      } else {
        queryClient.setQueryData(queryKey, null);
      }
    },
  });

  return {
    instance: query.data ?? null,
    loading: query.isLoading,
    refresh: () => queryClient.invalidateQueries({ queryKey }),
    runAction: action.mutateAsync,
    running: action.isPending,
  };
}
