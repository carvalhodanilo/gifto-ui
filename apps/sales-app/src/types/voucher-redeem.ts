/** Resposta de GET /v1/vouchers/display-code/{displayCode} */
export interface VoucherByDisplayCode {
  voucherId: string;
  campaignName: string;
  displayCode: string;
  status: string;
  expiresAt: string;
  balanceCents: number;
}

/** Payload de POST /v1/vouchers/redeem */
export interface RedeemVoucherPayload {
  tenantId: string;
  merchantId: string;
  amountCents: number;
  displayCode: string;
  idempotencyKey: string;
}

/** Resposta de POST /v1/vouchers/redeem */
export interface RedeemVoucherResult {
  voucherId: string;
  newBalanceCents: number;
}

