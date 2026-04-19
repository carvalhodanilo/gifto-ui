/**
 * Paleta oficial Gift Shop — **único sítio** para alterar os defaults de cor no monorepo `core-ui`.
 *
 * - **sales-app:** `TenantContext`, `mock-tenant.ts`, `index.css` (fallbacks antes do `TenantTheme`), `DEFAULT_TENANT_LOGO_URL` / `resolveTenantLogoUrl`.
 * - **campaign-landing-app:** defaults quando a API não envia `primaryBrandColor` / `secondaryBrandColor`.
 *
 * **Multi-tenant:** cada shopping pode continuar a definir cores na API; estes valores aplicam-se
 * como padrão global e como fallback quando o tenant deixa campos vazios.
 *
 * @see `OFFICIAL_BRAND_PALETTE` abaixo para nomes e HEX (altere só aqui e sincronize CSS se duplicar variáveis).
 */
export const OFFICIAL_BRAND_PALETTE = {
  /** Navy — logo, títulos, elementos principais, textos sobre fundos claros */
  navy: '#003366',
  /** Cyan — destaques, CTAs, acentos */
  cyan: '#00D4FF',
  /** Cinza claro — backgrounds secundários */
  grayLight: '#E4E4E4',
  /** Textos secundários, divisores (etiqueta no guia: “cinza médio”; HEX é azul-acinzentado) */
  grayMid: '#4A6DBA',
  /** Branco — fundos e texto sobre navy em contextos específicos */
  white: '#FFFFFF',
  /** Texto sobre fundo `--brand-primary` (ex.: `<Button variant="brand" />`) */
  onBrandPrimary: '#FFFFFF',
} as const;

export type OfficialBrandPaletteKey = keyof typeof OFFICIAL_BRAND_PALETTE;

/** Fallback quando o tenant/API não define `primaryColor` (marca principal). */
export const DEFAULT_TENANT_PRIMARY_COLOR = OFFICIAL_BRAND_PALETTE.navy;

/** Fallback quando o tenant/API não define `secondaryColor` (acentos / CTAs). */
export const DEFAULT_TENANT_SECONDARY_COLOR = OFFICIAL_BRAND_PALETTE.cyan;

/**
 * Imagem padrão do header / logo quando o tenant (ou loja no mesmo escopo) não envia `logoUrl`.
 * Em `sales-app`, o ficheiro vive em `public/header.jpg` (Vite → URL absoluta `/header.jpg`).
 */
export const DEFAULT_TENANT_LOGO_URL = '/header.jpg';

/** Resolve URL do logo: valor da API ou imagem oficial por defeito (qualquer entidade sem logo próprio). */
export function resolveTenantLogoUrl(logoUrl: string | null | undefined): string {
  const t = logoUrl?.trim();
  return t ? t : DEFAULT_TENANT_LOGO_URL;
}
