// Modelo Canônico + contrato de driver do Middleware Universal.
// Todo ERP integrado precisa converter seus dados para estas formas antes
// de chegar ao orquestrador — ver crm-farmacia-ai-documentos-iniciais/CLAUDE.md
// ("Todo ERP deve possuir um Driver que converta dados para o Modelo Canônico").

export type DriverType =
  | "official_api" // Tier 1
  | "automated_export" // Tier 2 (v1)
  | "readonly_db" // Tier 3
  | "nfce_xml" // Tier 4
  | "rpa_ui"; // Tier 5

export interface CanonicalCustomer {
  externalId: string | null;
  name: string;
  phone: string;
  email?: string | null;
  cpf?: string | null;
  birthDate?: string | null; // ISO date
}

export interface CanonicalProduct {
  externalId: string | null;
  name: string;
  activeIngredient?: string | null;
  isContinuousUse?: boolean;
}

export interface CanonicalSaleItem {
  productExternalId: string | null;
  productName: string; // usado para casar por nome quando não há externalId
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CanonicalSale {
  externalId: string | null;
  customerExternalId: string | null;
  customerPhone?: string | null; // usado para casar por telefone quando não há externalId
  totalAmount: number;
  paymentMethod?: string | null;
  saleDate: string; // ISO datetime
  items: CanonicalSaleItem[];
}

export interface CanonicalBundle {
  customers: CanonicalCustomer[];
  products: CanonicalProduct[];
  sales: CanonicalSale[];
}

export interface ERPDriverContext {
  pharmacyId: string;
  config: Record<string, unknown>;
}

export interface ERPDriver {
  readonly driverType: DriverType;
  /** Tiers 1/3: busca ativa numa fonte remota (API oficial ou banco somente leitura). */
  fetch?(ctx: ERPDriverContext): Promise<CanonicalBundle>;
  /** Tiers 2/4: interpreta um arquivo já recebido (export CSV/XLSX ou XML de NFC-e). */
  parseFile?(file: { name: string; bytes: Uint8Array }, ctx: ERPDriverContext): Promise<CanonicalBundle>;
}
