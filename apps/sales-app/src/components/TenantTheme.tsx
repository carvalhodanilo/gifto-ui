import * as React from 'react';
import { OFFICIAL_BRAND_PALETTE, resolveTenantLogoUrl } from '@core-ui/ui';
import type { Tenant } from '../types/tenant';

interface TenantThemeProps {
  tenant: Tenant;
  children: React.ReactNode;
}

/**
 * Aplica o tema do tenant em variáveis CSS na raiz do document.
 * Assim, alterar primaryColor/secondaryColor/logoUrl no tenant (mock ou API)
 * atualiza automaticamente header, botões e qualquer elemento que use:
 *   --brand-primary            (cor principal)
 *   --brand-primary-foreground (texto sobre botões/header com marca)
 *   --brand-secondary          (cor secundária)
 *   --brand-logo-url           (imagem do logo; fallback global se a API não enviar)
 * Fonte dos dados: mock/API; defaults em `@core-ui/ui` (`OFFICIAL_BRAND_PALETTE`, `resolveTenantLogoUrl`).
 */
export function TenantTheme({ tenant, children }: TenantThemeProps) {
  React.useEffect(() => {
    const root = document.documentElement;
    const logoUrl = resolveTenantLogoUrl(tenant.logoUrl);
    root.style.setProperty('--brand-primary', tenant.primaryColor);
    root.style.setProperty('--brand-primary-foreground', OFFICIAL_BRAND_PALETTE.onBrandPrimary);
    if (tenant.secondaryColor) {
      root.style.setProperty('--brand-secondary', tenant.secondaryColor);
    }
    root.style.setProperty('--brand-logo-url', `url(${logoUrl})`);
    return () => {
      root.style.removeProperty('--brand-primary');
      root.style.removeProperty('--brand-primary-foreground');
      root.style.removeProperty('--brand-secondary');
      root.style.removeProperty('--brand-logo-url');
    };
  }, [tenant.primaryColor, tenant.secondaryColor, tenant.logoUrl]);

  return <>{children}</>;
}
