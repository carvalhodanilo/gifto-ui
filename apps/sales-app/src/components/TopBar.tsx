import { Button } from '@core-ui/ui';
import { LogOut } from 'lucide-react';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import { TenantBranding } from './TenantBranding';

/**
 * Top bar: branding do tenant (esquerda), user + logout (direita).
 */
export function TopBar() {
  const { tenant, resetTenant } = useTenant();
  const { username, email, logout } = useAuth();

  const handleLogout = () => {
    resetTenant();
    logout();
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between bg-card px-4 shadow-sm">
      <TenantBranding tenant={tenant} size="sm" />
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
