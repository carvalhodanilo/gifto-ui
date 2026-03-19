/**
 * Item retornado em GET /v1/vouchers/ledger-entries.
 * ledgerEntryId: uso interno (ex.: extorno); não exibido na tabela.
 * displayCode: exibido na listagem.
 */
export interface LedgerEntry {
  ledgerEntryId: string;
  type: string;
  amountCents: number;
  createdAt: string;
  displayCode?: string;
}

/** Payload de POST /v1/vouchers/reversal */
export interface ReversalPayload {
  tenantId: string;
  merchantId: string;
  refLedgerEntryId: string;
  publicToken: string | null;
  displayCode: string | null;
  idempotencyKey: string;
}

/** Resposta de sucesso de POST /v1/vouchers/reversal */
export interface ReversalResult {
  voucherId: string;
  balanceCents: number;
}

/** Resposta paginada do ledger */
export interface LedgerEntriesResponse {
  currentPage: number;
  perPage: number;
  total: number;
  items: LedgerEntry[];
}

/** Query params da listagem (sort: campo; dir: asc | desc) */
export interface LedgerEntriesParams {
  search?: string;
  page?: number;
  perPage?: number;
  sort?: string;
  dir?: 'asc' | 'desc';
}

