import { apiUrl } from '../config/api';
import type { GetActiveMerchantsResponse } from '../types/merchant-api';
import { authHeaders } from './authHeaders';

export interface MerchantDetail {
  merchantId: string;
  /** alguns backends retornam como merchantName; outros como fantasyName */
  merchantName?: string;
  fantasyName?: string;
}

/**
 * GET /merchants/active - merchants ativos do tenant.
 * Header obrigatório: tenant: <tenantId>
 */
export async function getActiveMerchants(): Promise<GetActiveMerchantsResponse> {
  const url = apiUrl('/merchants/active');
  const res = await fetch(url, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ao carregar merchants: ${res.status}`);
  }
  return res.json() as Promise<GetActiveMerchantsResponse>;
}

/**
 * GET /merchants/:merchantId - detalhe do merchant.
 * Obs: escopo e tenant/merchant são resolvidos via token no backend.
 */
export async function getMerchantById(merchantId: string): Promise<MerchantDetail> {
  const url = apiUrl(`/merchants/${encodeURIComponent(merchantId)}`);
  const res = await fetch(url, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ao carregar merchant: ${res.status}`);
  }
  return res.json() as Promise<MerchantDetail>;
}
