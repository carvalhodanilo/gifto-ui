import { apiUrl } from '../config/api';
import type { GetTenantsResponse } from '../types/tenant-api';
import { authHeaders } from './authHeaders';
import { authFetch } from './authFetch';

/**
 * Lista de empresas (tenants) para o seletor no login.
 * GET {baseUrl}/tenants
 */
export async function getTenants(): Promise<GetTenantsResponse> {
  const url = apiUrl('/tenants');
  const res = await authFetch(url, { headers: authHeaders() });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ao carregar empresas: ${res.status}`);
  }

  return res.json() as Promise<GetTenantsResponse>;
}
