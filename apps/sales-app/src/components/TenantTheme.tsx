import * as React from 'react';
import type { Tenant } from '../types/tenant';

interface TenantThemeProps {
  tenant: Tenant;
  children: React.ReactNode;
}

/**
 * Aplica o tema do tenant em variáveis CSS na raiz do document.
 * Assim, alterar primaryColor/secondaryColor/logoUrl no tenant (mock ou API)
 * atualiza automaticamente header, botões e qualquer elemento que use:
 *   --brand-primary   (cor principal)
 *   --brand-secondary (cor secundária)
 *   --brand-logo-url  (imagem do logo, se houver)
 * Fonte dos dados: mock/API; defaults em `@core-ui/ui` (`OFFICIAL_BRAND_PALETTE`).
 */
export function TenantTheme({ tenant, children }: TenantThemeProps) {
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', tenant.primaryColor);
    if (tenant.secondaryColor) {
      root.style.setProperty('--brand-secondary', tenant.secondaryColor);
    }
    if (tenant.logoUrl) {
      root.style.setProperty('--brand-logo-url', `url(${tenant.logoUrl})`);
    } else {
      root.style.removeProperty('--brand-logo-url');
    }
    return () => {
      root.style.removeProperty('--brand-primary');
      root.style.removeProperty('--brand-secondary');
      root.style.removeProperty('--brand-logo-url');
    };
  }, [tenant.primaryColor, tenant.secondaryColor, tenant.logoUrl]);

  return <>{children}</>;
}
