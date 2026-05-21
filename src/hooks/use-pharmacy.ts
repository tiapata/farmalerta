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
      // Tenta buscar a primeira farmácia. 
      // Em um cenário real, cada usuário pertenceria a uma farmácia específica.
      const { data, error } = await supabase
        .from("pharmacies")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Se não existir, tenta criar uma inicial
        const { data: newData, error: createError } = await supabase
          .from("pharmacies")
          .insert([{ name: "Farmácia Central" }])
          .select()
          .single();

        if (createError) {
          console.error("Erro ao criar farmácia inicial:", createError);
          // Se falhar (ex: RLS), não tratamos aqui para não travar o app
        } else {
          setPharmacy(newData as any);
        }
      } else {
        setPharmacy(data as any);
      }
    } catch (error: any) {
      console.error("Error fetching pharmacy:", error);
      // Removendo toast de erro aqui para não irritar o usuário se for apenas falta de permissão RLS inicial
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
