/**
 * Dados do tenant (TenantContext). Tema dinâmico via TenantTheme.
 */
export interface Tenant {
  tenantId: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor?: string;
  active: boolean;
}
