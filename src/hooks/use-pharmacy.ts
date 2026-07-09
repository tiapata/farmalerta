import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Pharmacy {
  id: string;
  name: string;
  cnpj: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  updated_at?: string;
}

export function usePharmacy() {
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPharmacy = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPharmacy(null);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("pharmacy_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile?.pharmacy_id) {
        // Usuário autenticado, mas ainda não associado a nenhuma farmácia.
        setPharmacy(null);
        return;
      }

      const { data, error } = await supabase
        .from("pharmacies")
        .select("*")
        .eq("id", profile.pharmacy_id)
        .maybeSingle();

      if (error) throw error;
      setPharmacy(data as any);
    } catch (error: any) {
      console.error("Error fetching pharmacy:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePharmacy = async (updates: Partial<Pharmacy>) => {
    if (!pharmacy?.id) {
      toast.error("Nenhuma farmácia carregada para atualizar");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("pharmacies")
        .update(updates as any)
        .eq("id", pharmacy.id)
        .select()
        .single();

      if (error) throw error;
      setPharmacy(data as any);
      toast.success("Configurações salvas com sucesso!");
      return data;
    } catch (error: any) {
      console.error("Error updating pharmacy:", error);
      toast.error("Erro ao salvar alterações: " + (error.message || "Verifique as permissões RLS"));
      throw error;
    }
  };

  useEffect(() => {
    fetchPharmacy();
  }, []);

  return { pharmacy, loading, updatePharmacy, refresh: fetchPharmacy };
}
