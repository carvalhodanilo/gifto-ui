/**
 * Dados do tenant (fonte central: TenantContext).
 * tenantId é usado em todas as requests (campanhas, vouchers, etc.).
 * Tema dinâmico via --brand-primary, --brand-secondary (TenantTheme).
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

export type TenantResolveResponse = Tenant;
