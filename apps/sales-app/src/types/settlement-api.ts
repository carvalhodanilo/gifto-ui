/**
 * Tipos do contrato da API de Settlement (/v1/settlements).
 * periodKey: ISO week YYYY-Wnn (ex.: 2026-W11).
 */

export interface SettlementEntry {
  entryId: string;
  merchantId: string;
  merchantName: string | null;
  grossCents: number;
  reversalsCents: number;
  feesCents: number;
  netCents: number;
  status: 'PENDING' | 'PAID';
  paidAt: string | null; // ISO 8601
  paymentRef: string | null;
}

export interface SettlementBatchResponse {
  settlementBatchId: string;
  periodKey: string;
  status: 'OPEN' | 'CLOSED';
  closedAt: string | null; // ISO 8601
  entries: SettlementEntry[];
}

export interface RunBatchResponse {
  settlementBatchId: string;
}

export interface MarkEntryPaidResponse {
  settlementBatchId: string;
  entryId: string;
}
