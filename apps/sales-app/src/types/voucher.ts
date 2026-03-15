/**
 * Campanha. MVP: mockadas no front. Futuro: GET /campanhas ou similar.
 */
export interface Campaign {
  id: string;
  name: string;
}

/** Request para emissão de voucher. POST /v1/vouchers/issue */
export interface IssueVoucherRequest {
  tenantId: string;
  campaignId: string;
  amountCents: number;
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

/** Item retornado por GET /tenants/{tenantId}/vouchers (listagem por tenant). */
export interface TenantVoucherItem {
  voucherId: string;
  campaignId: string;
  campaignName: string;
  displayCode: string;
  status: string;
  issuedAt: string; // ISO 8601
  expiresAt: string; // ISO 8601
}

/** Resposta paginada de GET /tenants/{tenantId}/vouchers. */
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
}
