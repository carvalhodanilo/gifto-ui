import { Button } from '@core-ui/ui';
import { LogOut } from 'lucide-react';
import { useTenant } from '../contexts/TenantContext';
import { useMerchant } from '../contexts/MerchantContext';
import { useAuth } from '../contexts/AuthContext';
import { TenantBranding } from './TenantBranding';

/**
 * Top bar: tenant (esquerda), merchant + logout (direita) — mesmo padrão do sales-app.
 */
export function TopBar() {
  const { tenant, resetTenant } = useTenant();
  const { merchant, resetMerchant } = useMerchant();
  const { username, email, logout } = useAuth();

  const handleLogout = () => {
    resetTenant();
    resetMerchant();
    logout();
  };

  const brandingTenant =
    tenant && merchant?.merchantName ? { ...tenant, name: merchant.merchantName } : tenant;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between bg-card px-4 shadow-sm">
      <TenantBranding tenant={brandingTenant} size="sm" />
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {username ?? email ?? ''}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </header>
  );
}
