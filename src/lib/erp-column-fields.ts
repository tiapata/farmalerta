// Campos canônicos que o driver de Exportação Automática (Tier 2) entende.
// As `key`s aqui precisam bater exatamente com as chaves de
// DEFAULT_COLUMN_MAPPING em supabase/functions/middleware-import/drivers/automated-export.ts.
export interface ErpColumnField {
  key: string;
  label: string;
  required: boolean;
}

export const ERP_COLUMN_FIELDS: ErpColumnField[] = [
  { key: "customer_name", label: "Nome do cliente", required: true },
  { key: "customer_phone", label: "Telefone do cliente", required: true },
  { key: "customer_external_id", label: "Código do cliente (ERP)", required: false },
  { key: "sale_external_id", label: "Código da venda (ERP)", required: false },
  { key: "sale_date", label: "Data da venda", required: true },
  { key: "product_name", label: "Nome do produto", required: true },
  { key: "product_external_id", label: "Código do produto (ERP)", required: false },
  { key: "quantity", label: "Quantidade", required: true },
  { key: "unit_price", label: "Valor unitário", required: true },
  { key: "payment_method", label: "Forma de pagamento", required: false },
];

const FIELD_KEYWORDS: Record<string, string[]> = {
  customer_name: ["nome cliente", "cliente", "nome do cliente", "razao social"],
  customer_phone: ["telefone", "celular", "fone", "whatsapp"],
  customer_external_id: ["codigo cliente", "cod cliente", "id cliente"],
  sale_external_id: ["codigo venda", "cod venda", "numero venda", "pedido", "nota"],
  sale_date: ["data venda", "data da venda", "data"],
  product_name: ["produto", "descricao", "item", "medicamento"],
  product_external_id: ["codigo produto", "cod produto", "sku", "ean"],
  quantity: ["quantidade", "qtd", "qtde"],
  unit_price: ["valor unitario", "preco unitario", "valor unit", "preco"],
  payment_method: ["forma pagamento", "pagamento", "meio pagamento"],
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

/** Sugere um mapeamento inicial comparando os cabeçalhos detectados com palavras-chave conhecidas. */
export function suggestColumnMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  for (const field of ERP_COLUMN_FIELDS) {
    const keywords = FIELD_KEYWORDS[field.key] ?? [];
    const match = headers.find((header) => {
      const normalized = normalize(header);
      return keywords.some((keyword) => normalized.includes(keyword));
    });
    if (match) mapping[field.key] = match;
  }
  return mapping;
}
