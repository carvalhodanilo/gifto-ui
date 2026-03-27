import { apiUrl } from '../config/api';
import type { TenantVouchersParams, TenantVouchersResponse } from '../types/voucher';
import { authHeaders } from './authHeaders';
import { authFetch } from './authFetch';

/**
 * Monta query string para GET /v1/vouchers/list.
 * Apenas inclui parâmetros definidos.
 */
function buildQuery(params: TenantVouchersParams): string {
  const search = new URLSearchParams();
  if (params.page !== undefined) search.set('page', String(params.page));
  if (params.perPage !== undefined) search.set('perPage', String(params.perPage));
  if (params.active !== undefined) search.set('active', String(params.active));
  if (params.campaignName != null && params.campaignName !== '')
    search.set('campaignName', params.campaignName);
  if (params.displayCode != null && params.displayCode !== '')
    search.set('displayCode', params.displayCode);
  const q = search.toString();
  return q ? `?${q}` : '';
}

/**
 * Lista vouchers do tenant. GET /v1/vouchers/list
 * Header obrigatório: tenant (sempre do TenantContext).
 */
export async function getTenantVouchers(
  _tenantId: string,
  params: TenantVouchersParams = {}
): Promise<TenantVouchersResponse> {
  const path = `/v1/vouchers/list${buildQuery(params)}`;
  const url = apiUrl(path);
  const res = await authFetch(url, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    let message = `Erro ao carregar vouchers: ${res.status}`;
    try {
      const data = text ? JSON.parse(text) : null;
      if (data?.message) message = data.message;
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }

  return res.json() as Promise<TenantVouchersResponse>;
}
