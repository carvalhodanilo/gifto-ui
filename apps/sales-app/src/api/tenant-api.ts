/**
 * API de resolução de tenant/shopping — PARA USO FUTURO.
 *
 * Hoje: o kiosk usa config/mock-tenant.ts (sem HTTP). Este arquivo não é chamado.
 *
 * Quando a API existir:
 *   1. Em TenantContext: trocar getMockTenantConfig() por resolveTenant(slug).
 *   2. Slug obtido com getTenantSlugFromHostname() (lib/tenant.ts).
 *   3. GET /public/shoppings/resolve?slug=<slug>
 *   4. Resposta deve seguir o tipo Tenant (tenantId, name, slug, logoUrl, primaryColor, secondaryColor, active).
 */

import type { TenantResolveResponse } from '../types/tenant';
import { authHeaders } from './authHeaders';
import { authFetch } from './authFetch';

export class TenantNotFoundError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'TenantNotFoundError';
  }
}

/** Mock para desenvolvimento quando a API ainda não existe (slug local). */
function getMockTenant(slug: string): TenantResolveResponse {
  return {
    tenantId: 'dev-1',
    name: 'Gift Shop (Dev)',
    slug,
    logoUrl: null,
    primaryColor: '#0f172a',
    secondaryColor: '#64748b',
    active: true,
  };
}

/**
 * Resolve o tenant pelo slug (subdomínio).
 * GET /public/tenants/resolve?slug=<slug>
 * @throws TenantNotFoundError em 404 ou tenant inativo
 */
export async function resolveTenant(slug: string): Promise<TenantResolveResponse> {
  const isDev = import.meta.env.DEV;
  const useMock = isDev && slug === 'local';

  if (useMock) {
    return Promise.resolve(getMockTenant(slug));
  }

  try {
    const base = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '') || '';
    const url = base
      ? `${base}/public/shoppings/resolve?slug=${encodeURIComponent(slug)}`
      : `/api/public/shoppings/resolve?slug=${encodeURIComponent(slug)}`;
    const res = await authFetch(url, { headers: authHeaders() });

    if (res.status === 404) {
      throw new TenantNotFoundError('Tenant não encontrado', 404);
    }

    if (!res.ok) {
      const text = await res.text();
      let message = `Erro ao resolver tenant: ${res.status}`;
      try {
        const data = text ? JSON.parse(text) : null;
        if (data?.message) message = data.message;
      } catch {
        if (text) message = text;
      }
      throw new TenantNotFoundError(message, res.status);
    }

    const data = (await res.json()) as TenantResolveResponse;
    if (data.active === false) {
      throw new TenantNotFoundError('Tenant inativo', 410);
    }
    return data;
  } catch (err) {
    if (err instanceof TenantNotFoundError) throw err;
    throw new TenantNotFoundError(
      err instanceof Error ? err.message : 'Falha ao resolver tenant',
      0
    );
  }
}
