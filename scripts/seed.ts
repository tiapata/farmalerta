// Dev-only seed script. NEVER imported by src/ — never ships in the browser bundle.
// Uses the Supabase service-role key (bypasses RLS), so it must only run locally.
//
// Setup: create a .env.local (gitignored via the existing `*.local` rule) with:
//   SUPABASE_SERVICE_ROLE_KEY=...   (Project Settings > API in the Supabase dashboard)
// VITE_SUPABASE_URL is already available from the committed .env.
//
// Usage:
//   bun run seed                          # creates/reuses "Farmácia Central" and seeds it
//   bun run seed -- --pharmacy=<uuid>      # seeds an existing pharmacy by id

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/integrations/supabase/types";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Faltam variáveis de ambiente. Defina VITE_SUPABASE_URL (já está em .env) e SUPABASE_SERVICE_ROLE_KEY em um .env.local local.",
  );
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);

const pharmacyIdArg = process.argv.find((a) => a.startsWith("--pharmacy="))?.split("=")[1];

async function resolvePharmacyId(): Promise<string> {
  if (pharmacyIdArg) return pharmacyIdArg;

  const { data: existing } = await supabase
    .from("pharmacies")
    .select("id")
    .eq("name", "Farmácia Central")
    .maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("pharmacies")
    .insert([{ name: "Farmácia Central", email: "contato@farmaciacentral.com.br" }])
    .select("id")
    .single();
  if (error) throw error;
  return created.id;
}

async function seedProducts(pharmacyId: string) {
  const products = [
    { name: "Losartana 50mg", active_ingredient: "Losartana Potássica", is_continuous_use: true, default_repurchase_days: 30 },
    { name: "Metformina 850mg", active_ingredient: "Cloridrato de Metformina", is_continuous_use: true, default_repurchase_days: 30 },
    { name: "Vitamina D3 2000UI", active_ingredient: "Colecalciferol", is_continuous_use: true, default_repurchase_days: 60 },
    { name: "Dipirona 500mg", active_ingredient: "Dipirona Sódica", is_continuous_use: false, default_repurchase_days: null },
    { name: "Protetor Solar FPS 60", active_ingredient: null, is_continuous_use: false, default_repurchase_days: null },
  ];

  const { data, error } = await supabase
    .from("products")
    .insert(products.map((p) => ({ ...p, pharmacy_id: pharmacyId })))
    .select();
  if (error) throw error;
  return data;
}

async function seedCustomers(pharmacyId: string) {
  const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

  const customers = [
    { name: "Helena Matos", phone: "(11) 98888-7777", status: "Ativo", vip_level: "Ouro", last_purchase_at: daysAgo(29) },
    { name: "Carlos Pereira", phone: "(11) 97777-6666", status: "Ativo", vip_level: "Prata", last_purchase_at: daysAgo(27) },
    { name: "Fernando Costa", phone: "(11) 96666-5555", status: "Ativo", vip_level: "Bronze", last_purchase_at: daysAgo(23) },
    { name: "Roberto Silva", phone: "(11) 94444-5555", status: "Ativo", vip_level: "Ouro", last_purchase_at: daysAgo(30) },
    { name: "Lucia Santos", phone: "(11) 93333-4444", status: "Ativo", vip_level: "Prata", last_purchase_at: daysAgo(30) },
    { name: "Marta Rocha", phone: "(11) 92265-4327", status: "Recuperável", vip_level: "Ouro", last_purchase_at: daysAgo(35) },
    { name: "Paulo Amaral", phone: "(11) 91165-4328", status: "Inativo", vip_level: "Prata", last_purchase_at: daysAgo(62) },
    { name: "Júlia Ferreira", phone: "(11) 90065-4329", status: "Inativo", vip_level: "Ouro", last_purchase_at: daysAgo(68) },
  ];

  const { data, error } = await supabase
    .from("customers")
    .insert(customers.map((c) => ({ ...c, pharmacy_id: pharmacyId, whatsapp_consent: true, consent_source: "manual" as const })))
    .select();
  if (error) throw error;
  return data;
}

async function seedSales(
  pharmacyId: string,
  customers: { id: string }[],
  products: { id: string; name: string }[],
) {
  for (const customer of customers) {
    const numSales = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < numSales; i++) {
      const items = Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(() => {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 2) + 1;
        const unitPrice = Math.round((Math.random() * 60 + 15) * 100) / 100;
        return { product_id: product.id, quantity, unit_price: unitPrice, total_price: Math.round(quantity * unitPrice * 100) / 100 };
      });
      const totalAmount = items.reduce((sum, it) => sum + it.total_price, 0);

      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert([{
          pharmacy_id: pharmacyId,
          customer_id: customer.id,
          total_amount: totalAmount,
          items_count: items.length,
          payment_method: ["Cartão", "Dinheiro", "Pix"][Math.floor(Math.random() * 3)],
          sale_date: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString(),
        }])
        .select("id")
        .single();
      if (saleError) throw saleError;

      const { error: itemsError } = await supabase
        .from("sale_items")
        .insert(items.map((it) => ({ ...it, sale_id: sale.id, pharmacy_id: pharmacyId })));
      if (itemsError) throw itemsError;
    }
  }
}

async function main() {
  console.log("Resolvendo farmácia...");
  const pharmacyId = await resolvePharmacyId();
  console.log(`Farmácia: ${pharmacyId}`);

  console.log("Semeando produtos...");
  const products = await seedProducts(pharmacyId);

  console.log("Semeando clientes...");
  const customers = await seedCustomers(pharmacyId);

  console.log("Semeando vendas e itens de venda...");
  await seedSales(pharmacyId, customers, products);

  console.log(`Pronto: ${customers.length} clientes, ${products.length} produtos, vendas com itens criadas.`);
}

main().catch((error) => {
  console.error("Erro ao semear dados:", error);
  process.exit(1);
});
