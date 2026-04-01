/**
 * Campanha. MVP: mockadas no front. Futuro: GET /campanhas ou similar.
 */
export interface Campaign {
  id: string;
  name: string;
}

/** Body enviado em POST /v1/vouchers/issue (tenant vem do JWT). */
export interface IssueVoucherRequest {
  campaignId: string;
  amountCents: number;
  buyerName: string;
  buyerPhone: string;
}

/** Resposta da API de emissão de voucher. */
export interface IssueVoucherResponse {
  voucherId: string;
  publicToken: string;
  displayCode: string;
  expiresAt: string; // ISO 8601
}

/** Item do histórico local de vendas (para reimpressão). */
export interface RecentSale {
  displayCode: string;
  amountCents: number;
  issuedAt: string; // ISO 8601
  /** Futuro: usar para reimpressão */
  voucherId?: string;
}

/**
 * Item da lista de vouchers emitidos (página principal de Vendas).
 * Usado pelo modal de sucesso ao emitir (pode ter amountCents local).
 */
export interface VoucherListItem {
  voucherId: string;
  displayCode: string;
  campaignName: string;
  amountCents?: number;
  issuedAt: string; // ISO 8601
  status?: string;
}

/** Item retornado por GET /v1/vouchers/list (listagem por tenant; tenant via header). */
export interface TenantVoucherItem {
  voucherId: string;
  campaignId: string;
  campaignName: string;
  displayCode?: string;
  status: string;
  amountCents?: number;
  issuedAt: string; // ISO 8601
  expiresAt: string; // ISO 8601
  buyerName?: string | null;
  buyerPhone?: string | null;
}

/** Resposta paginada de GET /v1/vouchers/list. */
export interface TenantVouchersResponse {
  currentPage: number;
  perPage: number;
  total: number;
  items: TenantVoucherItem[];
}

/** Parâmetros de query para listagem de vouchers do tenant. */
export interface TenantVouchersParams {
  page?: number;
  perPage?: number;
  active?: boolean;
  campaignName?: string;
  displayCode?: string;
  buyerName?: string;
  buyerPhone?: string;
}
