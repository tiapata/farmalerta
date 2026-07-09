// Driver Tier 2 (Exportação Automática): converte linhas de um CSV/XLSX
// exportado pelo ERP em um CanonicalBundle. Não há um formato universal de
// export de ERP de farmácia, então o mapeamento de colunas é configurável
// via integration_configs.config.column_mapping — este é só o padrão
// genérico usado até você calibrar com um arquivo real.
import type {
  CanonicalBundle,
  CanonicalCustomer,
  CanonicalProduct,
  CanonicalSale,
  CanonicalSaleItem,
} from "../../_shared/erp-driver.ts";

export const DEFAULT_COLUMN_MAPPING: Record<string, string> = {
  customer_name: "Nome Cliente",
  customer_phone: "Telefone",
  customer_external_id: "Codigo Cliente",
  sale_external_id: "Codigo Venda",
  sale_date: "Data",
  product_name: "Produto",
  product_external_id: "Codigo Produto",
  quantity: "Quantidade",
  unit_price: "Valor Unitario",
  payment_method: "Forma Pagamento",
};

function col(row: Record<string, string>, mapping: Record<string, string>, key: string): string {
  const columnName = mapping[key];
  return columnName ? String(row[columnName] ?? "").trim() : "";
}

function parseNumber(value: string): number {
  if (!value) return 0;
  // Aceita tanto "1.234,56" (padrão BR) quanto "1234.56".
  const normalized = value.includes(",")
    ? value.replace(/\./g, "").replace(",", ".")
    : value;
  const parsed = Number(normalized.replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDate(value: string): string {
  if (!value) return new Date().toISOString();
  const brMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (brMatch) {
    const [, day, month, year] = brMatch;
    return new Date(`${year}-${month}-${day}T00:00:00`).toISOString();
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

export function buildBundleFromRows(
  rows: Record<string, string>[],
  columnMapping: Record<string, string>,
): CanonicalBundle {
  const customersByKey = new Map<string, CanonicalCustomer>();
  const productsByKey = new Map<string, CanonicalProduct>();
  const salesByKey = new Map<string, CanonicalSale>();

  for (const row of rows) {
    const customerName = col(row, columnMapping, "customer_name");
    const customerPhone = col(row, columnMapping, "customer_phone") || null;
    const customerExternalId = col(row, columnMapping, "customer_external_id") || null;
    if (!customerName && !customerPhone && !customerExternalId) continue; // linha vazia/inválida

    const customerKey = customerExternalId ? `id:${customerExternalId}` : `phone:${customerPhone ?? ""}`;
    if (!customersByKey.has(customerKey)) {
      customersByKey.set(customerKey, {
        externalId: customerExternalId,
        name: customerName || "Cliente sem nome",
        phone: customerPhone ?? "",
      });
    }

    const productName = col(row, columnMapping, "product_name");
    const productExternalId = col(row, columnMapping, "product_external_id") || null;
    const productKey = productExternalId ? `id:${productExternalId}` : `name:${productName.trim().toLowerCase()}`;
    if (productName && !productsByKey.has(productKey)) {
      productsByKey.set(productKey, { externalId: productExternalId, name: productName });
    }

    const saleExternalId = col(row, columnMapping, "sale_external_id") || null;
    const saleDate = parseDate(col(row, columnMapping, "sale_date"));
    const saleKey = saleExternalId ?? `${customerKey}|${saleDate}`;

    const quantity = parseNumber(col(row, columnMapping, "quantity")) || 1;
    const unitPrice = parseNumber(col(row, columnMapping, "unit_price"));
    const item: CanonicalSaleItem = {
      productExternalId,
      productName: productName || "Produto não identificado",
      quantity,
      unitPrice,
      totalPrice: Math.round(quantity * unitPrice * 100) / 100,
    };

    const existingSale = salesByKey.get(saleKey);
    if (existingSale) {
      existingSale.items.push(item);
      existingSale.totalAmount = Math.round((existingSale.totalAmount + item.totalPrice) * 100) / 100;
    } else {
      salesByKey.set(saleKey, {
        externalId: saleExternalId,
        customerExternalId,
        customerPhone,
        totalAmount: item.totalPrice,
        paymentMethod: col(row, columnMapping, "payment_method") || null,
        saleDate,
        items: [item],
      });
    }
  }

  return {
    customers: [...customersByKey.values()],
    products: [...productsByKey.values()],
    sales: [...salesByKey.values()],
  };
}
