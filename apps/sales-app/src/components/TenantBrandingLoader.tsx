import * as React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import { getTenantBranding } from '../api/tenant-branding';

const SHOPPING_ROLES = new Set([
  'tenant_admin',
  'tenant_operator',
  'merchant_admin',
  'merchant_operator',
]);

/**
 * Após autenticação, carrega nome + logo do tenant na API para o header (TenantBranding).
 */
export function TenantBrandingLoader({ children }: { children: React.ReactNode }) {
  const { authenticated, token, tenantId, roles } = useAuth();
  const { mergeTenantBranding } = useTenant();
  const lastFetchedTenantIdRef = React.useRef<string | null>(null);

  const canLoad = React.useMemo(
    () => roles.some((r) => SHOPPING_ROLES.has(r)),
    [roles]
  );

  React.useEffect(() => {
    if (!authenticated || !token || !tenantId || !canLoad) {
      lastFetchedTenantIdRef.current = null;
      return;
    }
    if (lastFetchedTenantIdRef.current === tenantId) {
      return;
    }

    let cancelled = false;
    void getTenantBranding()
      .then((b) => {
        if (cancelled) return;
        lastFetchedTenantIdRef.current = tenantId;
        mergeTenantBranding({ name: b.name, logoUrl: b.logoUrl });
      })
      .catch(() => {
        /* mantém mock / fallback visual */
      });

    return () => {
      cancelled = true;
    };
  }, [authenticated, token, tenantId, canLoad, mergeTenantBranding]);

  return <>{children}</>;
}
