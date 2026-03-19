import { apiUrl } from '../config/api';
import type { IssueVoucherRequest, IssueVoucherResponse } from '../types/voucher';
import { authHeaders } from './authHeaders';

function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}

/**
 * Emite um voucher. POST {baseUrl}/v1/vouchers/issue
 * Headers: Idempotency-Key (UUID por tentativa).
 * Body: tenantId (sempre do TenantContext), campaignId, amountCents.
 */
export async function issueVoucher(
  request: IssueVoucherRequest
): Promise<IssueVoucherResponse> {
  const url = apiUrl('/v1/vouchers/issue');
  const idempotencyKey = generateIdempotencyKey();

  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders({
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    }),
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const text = await res.text();
    let message = `Erro ao emitir voucher: ${res.status}`;
    try {
      const data = text ? JSON.parse(text) : null;
      if (data?.message) message = data.message;
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }

  return res.json() as Promise<IssueVoucherResponse>;
}
