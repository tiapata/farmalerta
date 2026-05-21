import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Profile {
  id: string;
  full_name: string | null;
  role: string | null;
  pharmacy_id: string | null;
  email?: string; // We'll fetch this from the profiles joined with auth (if possible) or just assume it exists
}

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      // Since we can't easily join with auth.users from the client easily without a function
      // we'll just fetch from the public.profiles table
      const { data, error } = await supabase
        .from("profiles")
        .select("*");

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      console.error("Error fetching profiles:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (id: string, updates: Partial<Profile>) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
      toast.success("Usuário atualizado com sucesso!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Erro ao atualizar usuário");
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  return { profiles, loading, updateProfile, refresh: fetchProfiles };
}
