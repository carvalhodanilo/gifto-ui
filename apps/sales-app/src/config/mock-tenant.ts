import type { Tenant } from '../types/tenant';

/**
 * =============================================================================
 * CONFIGURAÇÃO MOCKADA DO SHOPPING (MVP)
 * =============================================================================
 *
 * ÚNICO LUGAR PARA ALTERAR IDENTIDADE VISUAL DO KIOSK:
 * - Paleta de cores (primaryColor, secondaryColor)
 * - Nome do shopping (name)
 * - Logo (logoUrl: string | null — use URL da imagem ou null para ícone padrão)
 * - Slug (slug) — usado no futuro para resolução por subdomínio
 *
 * O TenantTheme aplica esses valores em variáveis CSS (--brand-primary, etc.);
 * todo o layout (header, botões, ícones) usa essas variáveis. Alterar aqui
 * atualiza o tema em toda a aplicação.
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
  primaryColor: '#0f172a',
  secondaryColor: '#64748b',
  active: true,
};

/** Retorna o tenant mockado. No futuro: remover e usar resposta da API. */
export function getMockTenantConfig(): Tenant {
  return { ...MOCK_TENANT };
}
