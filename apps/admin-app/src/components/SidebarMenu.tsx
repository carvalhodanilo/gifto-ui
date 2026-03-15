import { NavLink } from 'react-router-dom';
import { cn } from '@core-ui/ui';
import { LayoutDashboard, Gift, History, type LucideIcon } from 'lucide-react';

export interface SidebarMenuItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const defaultItems: SidebarMenuItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/redeem', label: 'Resgate', icon: Gift },
  { to: '/history', label: 'Histórico', icon: History },
];

interface SidebarMenuProps {
  items?: SidebarMenuItem[];
  className?: string;
}

/**
 * Sidebar: Dashboard, Resgate, Histórico. Mesmo padrão visual do sales-app.
 */
export function SidebarMenu({ items = defaultItems, className }: SidebarMenuProps) {
  return (
    <aside className={cn('w-52 shrink-0 bg-card/50 p-3', className)}>
      <nav className="flex flex-col gap-0.5">
        {items.map(({ to, label, icon: Icon, end }) => (
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
