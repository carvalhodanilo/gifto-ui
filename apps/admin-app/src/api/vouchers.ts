import { apiUrl } from '../config/api';
import { withIdempotencyKey } from '../utils/idempotency';
import type { VoucherByDisplayCode } from '../types/voucher-redeem';
import type { RedeemVoucherPayload, RedeemVoucherResult } from '../types/voucher-redeem';

/**
 * GET /v1/vouchers/display-code/{displayCode}
 * Opcional: header tenant para escopo.
 */
export async function getVoucherByDisplayCode(
  displayCode: string,
  tenantId?: string
): Promise<VoucherByDisplayCode> {
  const code = encodeURIComponent(displayCode.trim());
  const url = apiUrl(`/v1/vouchers/display-code/${code}`);
  const headers: HeadersInit = {};
  if (tenantId) headers['tenant'] = tenantId;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Voucher não encontrado: ${res.status}`);
  }
  return res.json() as Promise<VoucherByDisplayCode>;
}

/**
 * POST /v1/vouchers/redeem
 * Idempotency-Key vai no header (obrigatório); payload.idempotencyKey não é enviado no body.
 */
export async function redeemVoucher(
  payload: RedeemVoucherPayload
): Promise<RedeemVoucherResult> {
  const { idempotencyKey, ...body } = payload;
  const url = apiUrl('/v1/vouchers/redeem');
  const res = await fetch(url, {
    method: 'POST',
    headers: withIdempotencyKey(
      { 'Content-Type': 'application/json' },
      idempotencyKey
    ),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ao resgatar: ${res.status}`);
  }
  return res.json() as Promise<RedeemVoucherResult>;
}
