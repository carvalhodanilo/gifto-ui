import { Button } from '@core-ui/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import { TenantBranding } from './TenantBranding';
import { useSidebarCollapse } from '../contexts/SidebarCollapseContext';
import { UserMenu } from './UserMenu';

/**
 * Top bar: branding do tenant (esquerda), user + logout (direita).
 */
export function TopBar() {
  const { tenant, resetTenant } = useTenant();
  const { username, email, logout } = useAuth();
  const { collapsed, toggleCollapsed } = useSidebarCollapse();

  const handleLogout = () => {
    // Dispara primeiro o fluxo Keycloak (marca “Saindo…”); reset do tenant é só estado local.
    logout();
    resetTenant();
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between bg-card px-4 shadow-sm">
      <div className="flex items-center gap-2">
        {/* Mobile-first: no celular a sidebar começa recolhida; esse botão alterna expandir/recolher. */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="md:hidden h-9 w-9 p-0 text-muted-foreground hover:text-foreground"
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
        <TenantBranding tenant={tenant} size="sm" hideName />
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
