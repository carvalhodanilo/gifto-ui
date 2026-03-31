import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@core-ui/ui';
import {
  LayoutDashboard,
  Ticket,
  Megaphone,
  FileText,
  Store,
  Gift,
  History,
  Building2,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export interface SidebarMenuItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  /**
   * Papéis que permitem ver este item.
   * - Se `undefined`, o item é sempre visível.
   * - Se informado, será exibido quando o usuário tiver QUALQUER um dos papéis.
   */
  allowedRoles?: string[];
}

const defaultItems: SidebarMenuItem[] = [
  // Sales -> Dashboard: tenant_admin
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true, allowedRoles: ['tenant_admin'] },
  // Sales -> Vendas: tenant_admin e tenant_operator
  { to: '/sales', label: 'Vendas', icon: Ticket, allowedRoles: ['tenant_admin', 'tenant_operator'] },
  // Sales -> Campanhas: tenant_admin
  { to: '/campaigns', label: 'Campanhas', icon: Megaphone, allowedRoles: ['tenant_admin'] },
  // Merchant -> Resgate: merchant_admin e merchant_operator
  { to: '/redeem', label: 'Resgate', icon: Gift, allowedRoles: ['merchant_admin', 'merchant_operator'] },
  // Merchant -> Histórico: merchant_admin e merchant_operator
  { to: '/history', label: 'Histórico', icon: History, allowedRoles: ['merchant_admin', 'merchant_operator'] },
  // Sales -> Liquidação: system_admin
  { to: '/settlement', label: 'Liquidação', icon: FileText, allowedRoles: ['system_admin'] },
  // Admin -> Tenants: system_admin
  { to: '/admin/tenants', label: 'Tenants', icon: Building2, allowedRoles: ['system_admin'] },
  // Sales -> Lojas: tenant_admin
  { to: '/merchants', label: 'Lojas', icon: Store, allowedRoles: ['tenant_admin'] },
];

interface SidebarMenuProps {
  items?: SidebarMenuItem[];
  className?: string;
}

/**
 * Sidebar navigation menu. Uses NavLink for active state.
 */
export function SidebarMenu({ items = defaultItems, className }: SidebarMenuProps) {
  const { roles } = useAuth();

  const visibleItems = React.useMemo(() => {
    return items.filter((item) => {
      if (!item.allowedRoles || item.allowedRoles.length === 0) return true;
      return item.allowedRoles.some((role) => roles.includes(role));
    });
  }, [items, roles]);

  return (
    <aside className={cn('w-52 shrink-0 bg-card/50 p-3', className)}>
      <nav className="flex flex-col gap-0.5">
        {visibleItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]'
                  : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
