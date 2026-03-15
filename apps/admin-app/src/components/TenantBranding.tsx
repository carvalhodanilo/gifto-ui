import { ShoppingBag } from 'lucide-react';
import type { Tenant } from '../types/tenant';

interface TenantBrandingProps {
  tenant: Tenant | null;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Logo + nome do tenant (TopBar, AuthLayout).
 */
export function TenantBranding({ tenant, size = 'sm', className = '' }: TenantBrandingProps) {
  const isSm = size === 'sm';
  const logoSize = isSm ? 'h-9 w-9' : 'h-14 w-14';
  const iconSize = isSm ? 'h-5 w-5' : 'h-8 w-8';

  if (!tenant) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div
          className={`flex ${logoSize} shrink-0 items-center justify-center rounded-lg`}
          style={{ backgroundColor: 'var(--brand-primary, #0f172a)' }}
        >
          <ShoppingBag className={`${iconSize} text-white`} />
        </div>
        <span
          className="text-sm font-semibold"
          style={{ color: 'var(--brand-primary, #0f172a)' }}
        >
          Admin
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
        className={isSm ? 'text-sm font-semibold' : 'text-lg font-medium text-foreground'}
        style={isSm ? { color: 'var(--brand-primary)' } : undefined}
      >
        {tenant.name}
      </span>
    </div>
  );
}
