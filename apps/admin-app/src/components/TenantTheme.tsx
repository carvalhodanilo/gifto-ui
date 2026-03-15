import * as React from 'react';
import type { Tenant } from '../types/tenant';

interface TenantThemeProps {
  tenant: Tenant | null;
  children: React.ReactNode;
}

/**
 * Aplica tema do tenant em variáveis CSS quando tenant existir.
 * Aceita null para manter a árvore estável e evitar remount ao selecionar tenant no login.
 */
export function TenantTheme({ tenant, children }: TenantThemeProps) {
  React.useEffect(() => {
    const root = document.documentElement;
    if (!tenant) {
      root.style.removeProperty('--brand-primary');
      root.style.removeProperty('--brand-secondary');
      root.style.removeProperty('--brand-logo-url');
      return;
    }
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
  }, [tenant?.primaryColor, tenant?.secondaryColor, tenant?.logoUrl]);

  return <>{children}</>;
}
