import type { Tenant } from '../types/tenant';
import {
  DEFAULT_TENANT_PRIMARY_COLOR,
  DEFAULT_TENANT_SECONDARY_COLOR,
  OFFICIAL_BRAND_PALETTE,
} from '@core-ui/ui';

/** Reexport: imports existentes continuam a usar `config/mock-tenant`. */
export {
  DEFAULT_TENANT_PRIMARY_COLOR,
  DEFAULT_TENANT_SECONDARY_COLOR,
  OFFICIAL_BRAND_PALETTE,
};

/**
 * =============================================================================
 * CONFIGURAÇÃO MOCKADA DO SHOPPING (MVP)
 * =============================================================================
 *
 * Defaults de identidade vêm de **`@core-ui/ui`** (`OFFICIAL_BRAND_PALETTE` — um único sítio para HEX).
 * Aqui só se ajusta o que for específico do mock (slug, tenantId, etc.).
 *
 * O TenantTheme aplica `primaryColor` / `secondaryColor` em `--brand-primary` / `--brand-secondary`;
 * o restante do tema Shadcn está em `src/index.css` (:root).
 *
 * -----------------------------------------------------------------------------
 * MUDANÇA FUTURA (quando existir API):
 * -----------------------------------------------------------------------------
 * 1. Slug será extraído de window.location.hostname
 *    (ex.: iguatemishopping.vale-presente.com.br → slug "iguatemishopping").
 * 2. Chamada: GET /public/shoppings/resolve?slug=<slug>
 * 3. A resposta da API deve ter o mesmo formato do tipo Tenant (tenantId, name,
 *    slug, logoUrl, primaryColor, secondaryColor, active).
 * 4. No TenantContext.tsx: trocar getMockTenantConfig() por resolveTenant(slug)
 *    (ver api/tenant-api.ts). O restante do código (TenantTheme, header, etc.)
 *    permanece igual — já consome o objeto tenant.
 * 5. Este arquivo (mock) pode ser removido ou mantido só para fallback/dev.
 */

export const MOCK_TENANT: Tenant = {
  tenantId: 'mock-shopping-1',
  name: 'Iguatemi Gift Shop',
  slug: 'iguatemishopping',
  logoUrl: null,
  primaryColor: DEFAULT_TENANT_PRIMARY_COLOR,
  secondaryColor: DEFAULT_TENANT_SECONDARY_COLOR,
  active: true,
};

/** Retorna o tenant mockado. No futuro: remover e usar resposta da API. */
export function getMockTenantConfig(): Tenant {
  return { ...MOCK_TENANT };
}
