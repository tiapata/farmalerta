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
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (customer: { name: string, phone: string } & Partial<Customer>) => {
    try {
      const { data: pharmacy } = await supabase.from("pharmacies").select("id").limit(1).maybeSingle();
      
      if (!pharmacy) {
        toast.error("É necessário configurar a farmácia antes de cadastrar clientes");
        return;
      }

      const { data, error } = await supabase
        .from("customers")
        .insert([{ ...customer, pharmacy_id: pharmacy.id, status: customer.status || 'Ativo' } as any])
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

  const seedData = async () => {
    try {
      setLoading(true);
      
      // 1. Garantir que a farmácia existe
      const { data: pharmacy } = await supabase.from("pharmacies").select("id").limit(1).maybeSingle();
      let pharmacyId = pharmacy?.id;
      
      if (!pharmacyId) {
        const { data: newPharmacy, error: pError } = await supabase
          .from("pharmacies")
          .insert([{ name: "Farmácia Central" }])
          .select()
          .single();
        if (pError) throw pError;
        pharmacyId = newPharmacy.id;
      }

      // 2. Limpar dados antigos para o teste ser limpo (opcional, mas bom para teste)
      // await supabase.from("sales").delete().eq("pharmacy_id", pharmacyId);
      // await supabase.from("customers").delete().eq("pharmacy_id", pharmacyId);

      // 3. Inserir Clientes
      const dummyCustomers = [
        { name: 'Zaqueu Fernandes', phone: '(11) 98765-4321', status: 'Ativo', vip_level: 'Ouro', total_spent: 2500, orders_count: 15, last_purchase_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'Maria Oliveira', phone: '(11) 97765-4322', status: 'Ativo', vip_level: 'Prata', total_spent: 850, orders_count: 5, last_purchase_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'João Santos', phone: '(11) 96665-4323', status: 'Ativo', vip_level: 'Bronze', total_spent: 120, orders_count: 2, last_purchase_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'Ana Costa', phone: '(11) 95565-4324', status: 'Ativo', vip_level: 'Prata', total_spent: 540, orders_count: 4, last_purchase_at: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'Carlos Pereira', phone: '(11) 94465-4325', status: 'Inativo', vip_level: 'Bronze', total_spent: 310, orders_count: 3, last_purchase_at: new Date(Date.now() - 62 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'Sérgio Mendes', phone: '(11) 93365-4326', status: 'Recuperável', vip_level: 'Bronze', total_spent: 450, orders_count: 4, last_purchase_at: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'Marta Rocha', phone: '(11) 92265-4327', status: 'Recuperável', vip_level: 'Ouro', total_spent: 1200, orders_count: 12, last_purchase_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'Paulo Amaral', phone: '(11) 91165-4328', status: 'Inativo', vip_level: 'Prata', total_spent: 210, orders_count: 2, last_purchase_at: new Date(Date.now() - 62 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'Júlia Ferreira', phone: '(11) 90065-4329', status: 'Inativo', vip_level: 'Ouro', total_spent: 890, orders_count: 6, last_purchase_at: new Date(Date.now() - 68 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'Fernando Costa', phone: '(11) 89965-4330', status: 'Inativo', vip_level: 'Ouro', total_spent: 3400, orders_count: 20, last_purchase_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'Helena Matos', phone: '(11) 88865-4331', status: 'Inativo', vip_level: 'Bronze', total_spent: 120, orders_count: 1, last_purchase_at: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString() }
      ];

      const { data: insertedCustomers, error: cError } = await supabase
        .from("customers")
        .insert(dummyCustomers.map(c => ({ ...c, pharmacy_id: pharmacyId })))
        .select();

      if (cError) throw cError;

      // 4. Inserir Vendas (Sales) para os clientes inseridos
      if (insertedCustomers && insertedCustomers.length > 0) {
        const dummySales = insertedCustomers.flatMap(customer => {
          // Criar 1 a 3 vendas para cada cliente
          const numSales = Math.floor(Math.random() * 3) + 1;
          return Array.from({ length: numSales }).map((_, i) => ({
            pharmacy_id: pharmacyId,
            customer_id: customer.id,
            total_amount: Math.random() * 200 + 50,
            items_count: Math.floor(Math.random() * 5) + 1,
            payment_method: ['Cartão', 'Dinheiro', 'Pix'][Math.floor(Math.random() * 3)],
            sale_date: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString()
          }));
        });

        const { error: sError } = await supabase.from("sales").insert(dummySales);
        if (sError) console.error("Erro ao inserir vendas:", sError);
      }

      // 5. Inserir Campanhas
      const dummyCampaigns = [
        { 
          pharmacy_id: pharmacyId, 
          title: 'Recuperação de Inativos - 15% OFF', 
          type: 'Recuperação', 
          status: 'Ativa', 
          description: 'Cupom SAUDADES para clientes sem compra há 60 dias' 
        },
        { 
          pharmacy_id: pharmacyId, 
          title: 'Lembrete de Medicamento Contínuo', 
          type: 'Recompra', 
          status: 'Ativa', 
          description: 'Aviso de renovação de receita para Losartana' 
        },
        { 
          pharmacy_id: pharmacyId, 
          title: 'Promoção VIP Ouro', 
          type: 'VIP', 
          status: 'Rascunho', 
          description: 'Brinde exclusivo para clientes Ouro em compras acima de R$ 200' 
        }
      ];

      const { error: cpError } = await supabase.from("campaigns").insert(dummyCampaigns);
      if (cpError) console.error("Erro ao inserir campanhas:", cpError);
      
      toast.success("Todas as tabelas foram populadas com sucesso!");
      await fetchCustomers();
    } catch (error: any) {
      console.error("Error seeding data:", error);
      toast.error("Erro ao popular dados: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return { customers, loading, addCustomer, seedData, refresh: fetchCustomers };
}
