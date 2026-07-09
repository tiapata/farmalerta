// Aplica um CanonicalBundle ao banco. Compartilhado por todos os drivers
// atuais e futuros (Tier 2 hoje; Tiers 1/3/4 reaproveitam isto amanhã).
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import type { CanonicalBundle, CanonicalCustomer, CanonicalProduct, CanonicalSale } from "../_shared/erp-driver.ts";

export interface ApplyBundleSummary {
  recordsProcessed: number;
  recordsFailed: number;
  errors: string[];
}

export async function applyBundle(
  client: SupabaseClient,
  pharmacyId: string,
  bundle: CanonicalBundle,
): Promise<ApplyBundleSummary> {
  const errors: string[] = [];
  let recordsProcessed = 0;
  let recordsFailed = 0;

  const customerIdByKey = new Map<string, string>();
  for (const customer of bundle.customers) {
    try {
      customerIdByKey.set(customerKey(customer), await upsertCustomer(client, pharmacyId, customer));
    } catch (error) {
      errors.push(`Cliente "${customer.name}": ${String(error)}`);
    }
  }

  const productIdByKey = new Map<string, string>();
  for (const product of bundle.products) {
    try {
      productIdByKey.set(productKey(product), await upsertProduct(client, pharmacyId, product));
    } catch (error) {
      errors.push(`Produto "${product.name}": ${String(error)}`);
    }
  }

  for (const sale of bundle.sales) {
    try {
      await applySale(client, pharmacyId, sale, customerIdByKey, productIdByKey);
      recordsProcessed++;
    } catch (error) {
      recordsFailed++;
      errors.push(`Venda ${sale.externalId ?? "(sem id)"}: ${String(error)}`);
    }
  }

  return { recordsProcessed, recordsFailed, errors };
}

function customerKey(c: { externalId: string | null; phone?: string | null }): string {
  return c.externalId ? `id:${c.externalId}` : `phone:${c.phone ?? ""}`;
}

function productKey(p: { externalId: string | null; name: string }): string {
  return p.externalId ? `id:${p.externalId}` : `name:${p.name.trim().toLowerCase()}`;
}

async function upsertCustomer(
  client: SupabaseClient,
  pharmacyId: string,
  customer: CanonicalCustomer,
): Promise<string> {
  if (customer.externalId) {
    const { data, error } = await client
      .from("customers")
      .upsert(
        {
          pharmacy_id: pharmacyId,
          external_id: customer.externalId,
          name: customer.name,
          phone: customer.phone,
          email: customer.email ?? null,
          cpf: customer.cpf ?? null,
        },
        { onConflict: "pharmacy_id,external_id" },
      )
      .select("id")
      .single();
    if (error) throw error;
    return data.id;
  }

  const { data: existing } = await client
    .from("customers")
    .select("id")
    .eq("pharmacy_id", pharmacyId)
    .eq("phone", customer.phone)
    .maybeSingle();
  if (existing) return existing.id;

  const { data, error } = await client
    .from("customers")
    .insert([{ pharmacy_id: pharmacyId, name: customer.name, phone: customer.phone, email: customer.email ?? null, cpf: customer.cpf ?? null }])
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function upsertProduct(
  client: SupabaseClient,
  pharmacyId: string,
  product: CanonicalProduct,
): Promise<string> {
  if (product.externalId) {
    const { data, error } = await client
      .from("products")
      .upsert(
        {
          pharmacy_id: pharmacyId,
          external_id: product.externalId,
          name: product.name,
          active_ingredient: product.activeIngredient ?? null,
          is_continuous_use: product.isContinuousUse ?? false,
        },
        { onConflict: "pharmacy_id,external_id" },
      )
      .select("id")
      .single();
    if (error) throw error;
    return data.id;
  }

  const { data: existing } = await client
    .from("products")
    .select("id")
    .eq("pharmacy_id", pharmacyId)
    .ilike("name", product.name)
    .maybeSingle();
  if (existing) return existing.id;

  const { data, error } = await client
    .from("products")
    .insert([{ pharmacy_id: pharmacyId, name: product.name, active_ingredient: product.activeIngredient ?? null, is_continuous_use: product.isContinuousUse ?? false }])
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function applySale(
  client: SupabaseClient,
  pharmacyId: string,
  sale: CanonicalSale,
  customerIdByKey: Map<string, string>,
  productIdByKey: Map<string, string>,
) {
  if (sale.externalId) {
    const { data: existingSale } = await client
      .from("sales")
      .select("id")
      .eq("pharmacy_id", pharmacyId)
      .eq("external_id", sale.externalId)
      .maybeSingle();
    if (existingSale) return; // já sincronizada em uma execução anterior
  }

  const customerId = sale.customerExternalId
    ? customerIdByKey.get(`id:${sale.customerExternalId}`)
    : sale.customerPhone
      ? customerIdByKey.get(`phone:${sale.customerPhone}`)
      : undefined;

  const { data: insertedSale, error: saleError } = await client
    .from("sales")
    .insert([{
      pharmacy_id: pharmacyId,
      customer_id: customerId ?? null,
      external_id: sale.externalId,
      total_amount: sale.totalAmount,
      items_count: sale.items.length,
      payment_method: sale.paymentMethod ?? null,
      sale_date: sale.saleDate,
    }])
    .select("id")
    .single();
  if (saleError) throw saleError;

  const items = sale.items.map((item) => ({
    sale_id: insertedSale.id,
    pharmacy_id: pharmacyId,
    product_id: item.productExternalId
      ? productIdByKey.get(`id:${item.productExternalId}`)
      : productIdByKey.get(`name:${item.productName.trim().toLowerCase()}`),
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total_price: item.totalPrice,
  }));

  if (items.length > 0) {
    const { error: itemsError } = await client.from("sale_items").insert(items);
    if (itemsError) throw itemsError;
  }
}
