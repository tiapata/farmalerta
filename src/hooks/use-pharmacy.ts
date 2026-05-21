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
      // We'll use any here because the generated types might not be up to date with the migration
      const { data, error } = await supabase
        .from("pharmacies")
        .select("*")
        .limit(1)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          const { data: newData, error: createError } = await supabase
            .from("pharmacies")
            .insert([{ name: "Farmácia Central" }])
            .select()
            .single();

          if (createError) throw createError;
          setPharmacy(newData as any);
        } else {
          throw error;
        }
      } else {
        setPharmacy(data as any);
      }
    } catch (error: any) {
      console.error("Error fetching pharmacy:", error);
      toast.error("Erro ao carregar dados da farmácia");
    } finally {
      setLoading(false);
    }
  };

  const updatePharmacy = async (updates: Partial<Pharmacy>) => {
    if (!pharmacy?.id) return;

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
      toast.error("Erro ao salvar alterações");
      throw error;
    }
  };

  useEffect(() => {
    fetchPharmacy();
  }, []);

  return { pharmacy, loading, updatePharmacy, refresh: fetchPharmacy };
}
