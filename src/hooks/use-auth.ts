import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileName, setProfileName] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // O profile é criado automaticamente pelo trigger handle_new_user() no signup;
    // aqui só lemos o nome para exibição.
    if (user?.id) {
      supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.full_name) {
            setProfileName(data.full_name);
          }
        });
    }
  }, [user]);

  const userName = profileName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Usuário";

  return { user, userName, loading };
}
