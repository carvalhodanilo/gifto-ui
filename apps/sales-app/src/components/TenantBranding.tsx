import { ShoppingBag } from 'lucide-react';
import type { Tenant } from '../types/tenant';

interface TenantBrandingProps {
  tenant: Tenant | null;
  /** sm = header/topbar, md = auth layout */
  size?: 'sm' | 'md';
  /** Em telas pequenas, exibe apenas o logo para economizar espaço. */
  hideNameOnMobile?: boolean;
  className?: string;
}

/**
 * Logo + nome do tenant. Reutilizado em TopBar, AuthLayout e onde precisar de identidade visual.
 */
export function TenantBranding({
  tenant,
  size = 'sm',
  hideNameOnMobile = false,
  className = '',
}: TenantBrandingProps) {
  const isSm = size === 'sm';
  const logoSize = isSm ? 'h-9 w-9' : 'h-14 w-14';
  const iconSize = isSm ? 'h-5 w-5' : 'h-8 w-8';
  const nameClassName = hideNameOnMobile ? 'hidden sm:inline' : 'inline';

  if (!tenant) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div
          className={`flex ${logoSize} shrink-0 items-center justify-center rounded-lg`}
          style={{ backgroundColor: 'var(--brand-primary)' }}
        >
          <ShoppingBag className={`${iconSize} text-white`} />
        </div>
        <span
          className={`${nameClassName} text-sm font-semibold`}
          style={{ color: 'var(--brand-primary)' }}
        >
          Gift Shop
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {tenant.logoUrl ? (
        <img
          src={tenant.logoUrl}
          alt={tenant.name}
          className={`${isSm ? 'h-9' : 'h-14'} w-auto object-contain`}
        />
      ) : (
        <div
          className={`flex ${logoSize} shrink-0 items-center justify-center rounded-lg`}
          style={{ backgroundColor: 'var(--brand-primary)' }}
        >
          <ShoppingBag className={`${iconSize} text-white`} />
        </div>
      )}
      <span
        className={`${nameClassName} ${isSm ? 'text-sm font-semibold' : 'text-lg font-medium text-foreground'}`}
        style={isSm ? { color: 'var(--brand-primary)' } : undefined}
      >
        {tenant.name}
      </span>
    </div>
  );
}
