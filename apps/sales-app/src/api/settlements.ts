import { apiUrl } from '../config/api';
import type {
  SettlementBatchResponse,
  RunBatchResponse,
  MarkEntryPaidResponse,
} from '../types/settlement-api';
import { authHeaders } from './authHeaders';
import { authFetch } from './authFetch';

function parseErrorResponse(text: string): string {
  try {
    const data = text ? JSON.parse(text) : null;
    if (data?.message) return data.message;
  } catch {
    if (text) return text;
  }
  return '';
}

/**
 * Executa o batch de settlement (período atual no backend).
 * POST /v1/settlements/batch/run — sem body, apenas header tenant.
 */
export async function runSettlementBatch(tenantId: string): Promise<RunBatchResponse> {
  const url = apiUrl('/v1/settlements/batch/run');
  const res = await authFetch(url, {
    method: 'POST',
    headers: authHeaders({ tenant: tenantId }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(parseErrorResponse(text) || `Erro ao executar batch: ${res.status}`);
  }

  return res.json() as Promise<RunBatchResponse>;
}

/**
 * Busca o batch de settlement do tenant para o período.
 * GET /v1/settlements/batch/{periodKey}
 */
export async function getSettlementBatch(
  tenantId: string,
  periodKey: string
): Promise<SettlementBatchResponse | null> {
  const url = apiUrl(`/v1/settlements/batch/${encodeURIComponent(periodKey)}`);
  const res = await authFetch(url, {
    headers: authHeaders({ tenant: tenantId }),
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(parseErrorResponse(text) || `Erro ao carregar settlement: ${res.status}`);
  }

  return res.json() as Promise<SettlementBatchResponse>;
}

/**
 * Marca a entry como paga.
 * PATCH /v1/settlements/batch/{batchId}/entries/{entryId}/paid
 */
export async function markEntryPaid(
  tenantId: string,
  batchId: string,
  entryId: string,
  paymentRef: string
): Promise<MarkEntryPaidResponse> {
  const url = apiUrl(
    `/v1/settlements/batch/${encodeURIComponent(batchId)}/entries/${encodeURIComponent(entryId)}/paid`
  );
  const res = await authFetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(authHeaders({ tenant: tenantId }) as Record<string, string>),
    },
    body: JSON.stringify({ paymentRef }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(parseErrorResponse(text) || `Erro ao marcar como pago: ${res.status}`);
  }

  return res.json() as Promise<MarkEntryPaidResponse>;
}
