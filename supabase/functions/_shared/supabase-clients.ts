import { createClient } from "npm:@supabase/supabase-js@2";

/** Cliente escopado pelo JWT de quem chamou — respeita RLS, usado para identidade/tenant. */
export function createCallerClient(authHeader: string) {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
}

/** Cliente com service role — ignora RLS. Só usar depois de resolver pharmacyId via createCallerClient. */
export function createServiceRoleClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}
