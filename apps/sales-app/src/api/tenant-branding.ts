import { apiUrl } from '../config/api';
import { authHeaders } from './authHeaders';
import { authFetch } from './authFetch';

export interface TenantBrandingDto {
  tenantId: string;
  name: string;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
}

/** GET /tenants/me/branding — tenant_* e merchant_* autenticados. */
export async function getTenantBranding(): Promise<TenantBrandingDto> {
  const res = await authFetch(apiUrl('/tenants/me/branding'), { headers: authHeaders() });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ao carregar branding: ${res.status}`);
  }
  const data = (await res.json()) as TenantBrandingDto;
  return {
    tenantId: data.tenantId,
    name: data.name,
    logoUrl: data.logoUrl ?? null,
    primaryColor: data.primaryColor ?? null,
    secondaryColor: data.secondaryColor ?? null,
  };
}
