import { apiUrl } from '../config/api';
import { withIdempotencyKey } from '../utils/idempotency';
import type {
  LedgerEntriesResponse,
  LedgerEntriesParams,
  ReversalPayload,
  ReversalResult,
} from '../types/ledger';
import { authHeaders } from './authHeaders';

/**
 * Monta query string a partir dos params (search, page, perPage, sort, dir).
 */
function buildQueryString(params: LedgerEntriesParams): string {
  const searchParams = new URLSearchParams();
  if (params.search != null && params.search !== '') {
    searchParams.set('search', params.search);
  }
  if (params.page != null) searchParams.set('page', String(params.page));
  if (params.perPage != null) searchParams.set('perPage', String(params.perPage));
  if (params.sort != null) searchParams.set('sort', params.sort);
  if (params.dir != null) searchParams.set('dir', params.dir);
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

/**
 * GET /vouchers/ledger-entries
 * Headers: tenant, merchant. Query: search, page, perPage, sort, dir.
 */
export async function getLedgerEntries(
  _tenantId: string,
  _merchantId: string,
  params: LedgerEntriesParams = {}
): Promise<LedgerEntriesResponse> {
  const url = apiUrl('v1/vouchers/ledger-entries') + buildQueryString(params);
  const res = await fetch(url, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ao carregar histórico: ${res.status}`);
  }
  return res.json() as Promise<LedgerEntriesResponse>;
}

/**
 * POST /vouchers/reversal
 * Idempotency-Key no header (obrigatório); mesmo valor em body.idempotencyKey.
 * refLedgerEntryId = ledgerEntryId do item selecionado no histórico.
 */
export async function postReversal(payload: ReversalPayload): Promise<ReversalResult> {
  const { idempotencyKey, ...body } = payload;
  const url = apiUrl('v1/vouchers/reversal');
  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders(
      withIdempotencyKey({ 'Content-Type': 'application/json' }, idempotencyKey)
    ),
    body: JSON.stringify({ ...body, idempotencyKey }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ao extornar: ${res.status}`);
  }
  return res.json() as Promise<ReversalResult>;
}
