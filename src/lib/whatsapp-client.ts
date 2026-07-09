import { supabase } from "@/integrations/supabase/client";
import { describeEdgeFunctionError } from "@/lib/edge-function-error";
import type { Tables } from "@/integrations/supabase/types";

export async function sendWhatsappMessage(conversationId: string, text: string): Promise<Tables<"messages">> {
  const { data, error } = await supabase.functions.invoke("whatsapp-send", {
    body: { conversation_id: conversationId, text },
  });
  if (error) throw new Error(await describeEdgeFunctionError(error));
  return data as Tables<"messages">;
}

export type WhatsappInstanceAction = "create" | "qr" | "status" | "disconnect";

export async function callWhatsappInstance(action: WhatsappInstanceAction): Promise<Tables<"whatsapp_instances"> | { ok: true }> {
  const { data, error } = await supabase.functions.invoke("whatsapp-instance", {
    body: { action },
  });
  if (error) throw new Error(await describeEdgeFunctionError(error));
  return data;
}
