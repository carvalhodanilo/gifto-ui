import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import { TenantBranding } from './TenantBranding';
import { UserMenu } from './UserMenu';

/**
 * Top bar: branding do tenant (esquerda), user + logout (direita).
 */
export function TopBar() {
  const { tenant, resetTenant } = useTenant();
  const { username, email, logout } = useAuth();

  const handleLogout = () => {
    logout();
    resetTenant();
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between bg-card px-5 shadow-sm">
      <div className="flex items-center gap-2">
        <TenantBranding tenant={tenant} size="sm" hideName logoLinkTo="/dashboard" />
      </div>
      <div className="flex items-center gap-2">
        <UserMenu
          tenantName={tenant?.name ?? 'Gift Shop'}
          username={username}
          email={email}
          onLogout={handleLogout}
        />
      </div>
    </header>
  );
}
