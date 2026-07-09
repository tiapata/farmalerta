import { FunctionsHttpError } from "@supabase/supabase-js";

/** supabase-js só expõe "Edge Function returned a non-2xx status code" por
 * padrão — o motivo real fica no corpo da resposta, que precisa ser lido à
 * parte. */
export async function describeEdgeFunctionError(error: unknown): Promise<string> {
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
