import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  cpf: string | null;
  status: string | null;
  vip_level: string | null;
  last_purchase_at: string | null;
  total_spent: number | null;
  orders_count: number | null;
  pharmacy_id: string;
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("name");

      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      console.error("Error fetching customers:", error);
      // toast.error("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (customer: { name: string, phone: string } & Partial<Customer>) => {
    try {
      // Busca a farmácia disponível
      const { data: pharmacy } = await supabase.from("pharmacies").select("id").limit(1).maybeSingle();
      
      if (!pharmacy) {
        toast.error("É necessário configurar a farmácia antes de cadastrar clientes");
        return;
      }

      const { data, error } = await supabase
        .from("customers")
        .insert([{ ...customer, pharmacy_id: pharmacy.id } as any])
        .select()
        .single();

      if (error) throw error;
      
      setCustomers(prev => [...prev, data]);
      toast.success("Cliente cadastrado com sucesso!");
      return data;
    } catch (error: any) {
      console.error("Error adding customer:", error);
      toast.error("Erro ao cadastrar cliente: " + (error.message || "Verifique o banco de dados"));
      throw error;
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return { customers, loading, addCustomer, refresh: fetchCustomers };
}
