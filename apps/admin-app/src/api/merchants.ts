import { apiUrl } from '../config/api';
import type { GetActiveMerchantsResponse } from '../types/merchant-api';

/**
 * GET /merchants/active - merchants ativos do tenant.
 * Header obrigatório: tenant: <tenantId>
 */
export async function getActiveMerchants(tenantId: string): Promise<GetActiveMerchantsResponse> {
  const url = apiUrl('/merchants/active');
  const res = await fetch(url, {
    headers: {
      tenant: tenantId,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ao carregar merchants: ${res.status}`);
  }
  return res.json() as Promise<GetActiveMerchantsResponse>;
}
