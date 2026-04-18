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

/** Tempo (ms) com o cursor sobre a sidebar antes de expandir os rótulos no desktop. Ajuste aqui ou via prop `hoverExpandDelayMs`. */
export const SIDEBAR_HOVER_EXPAND_DELAY_MS = 1500;

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
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/sales', label: 'Vendas', icon: Ticket, allowedRoles: ['tenant_admin', 'tenant_operator'] },
  { to: '/campaigns', label: 'Campanhas', icon: Megaphone, allowedRoles: ['tenant_admin'] },
  { to: '/redeem', label: 'Resgate', icon: Gift, allowedRoles: ['merchant_admin', 'merchant_operator'] },
  { to: '/history', label: 'Histórico', icon: History, allowedRoles: ['merchant_admin', 'merchant_operator'] },
  { to: '/settlement', label: 'Liquidação', icon: FileText, allowedRoles: ['system_admin'] },
  { to: '/admin/tenants', label: 'Parceiros', icon: Building2, allowedRoles: ['system_admin'] },
  { to: '/merchants', label: 'Lojas', icon: Store, allowedRoles: ['tenant_admin'] },
];

interface SidebarMenuProps {
  items?: SidebarMenuItem[];
  className?: string;
  /** Sobrescreve `SIDEBAR_HOVER_EXPAND_DELAY_MS` (desktop: atraso antes de mostrar rótulos). */
  hoverExpandDelayMs?: number;
}

function useIsDesktopMinMd(): boolean {
  const [desktop, setDesktop] = React.useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : true
  );

  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return desktop;
}

/**
 * Sidebar: em desktop (md+), recolhida por padrão e expande após o cursor ficar sobre ela por um tempo; no mobile, sempre com rótulos.
 */
export function SidebarMenu({
  items = defaultItems,
  className,
  hoverExpandDelayMs = SIDEBAR_HOVER_EXPAND_DELAY_MS,
}: SidebarMenuProps) {
  const { roles } = useAuth();
  const isDesktop = useIsDesktopMinMd();
  const [hoverOpen, setHoverOpen] = React.useState(false);
  const hoverExpandTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHoverExpandTimer = React.useCallback(() => {
    if (hoverExpandTimerRef.current) {
      clearTimeout(hoverExpandTimerRef.current);
      hoverExpandTimerRef.current = null;
    }
  }, []);

  React.useEffect(() => () => clearHoverExpandTimer(), [clearHoverExpandTimer]);

  const visibleItems = React.useMemo(() => {
    return items.filter((item) => {
      if (!item.allowedRoles || item.allowedRoles.length === 0) return true;
      return item.allowedRoles.some((role) => roles.includes(role));
    });
  }, [items, roles]);

  const collapsed = isDesktop && !hoverOpen;

  return (
    <aside
      className={cn(
        collapsed ? 'w-14 p-2' : 'w-52 p-3',
        'shrink-0 bg-card/50 transition-[width,padding] duration-200',
        className
      )}
      onMouseEnter={() => {
        if (!isDesktop) return;
        clearHoverExpandTimer();
        hoverExpandTimerRef.current = setTimeout(() => {
          setHoverOpen(true);
          hoverExpandTimerRef.current = null;
        }, hoverExpandDelayMs);
      }}
      onMouseLeave={() => {
        clearHoverExpandTimer();
        if (isDesktop) setHoverOpen(false);
      }}
    >
      <nav className={cn('flex flex-col gap-0.5', collapsed && 'items-stretch')}>
        {visibleItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors',
                collapsed ? 'justify-center px-2' : 'gap-2 px-3',
                isActive
                  ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]'
                  : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              )
            }
          >
            <Icon className={cn(collapsed ? 'h-5 w-5' : 'h-4 w-4')} />
            <span className={cn(collapsed ? 'sr-only' : 'inline')}>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
