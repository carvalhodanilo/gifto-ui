import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import type { Tenant } from '../types/tenant';

interface TenantBrandingProps {
  tenant: Tenant | null;
  /** sm = header/topbar, md = auth layout */
  size?: 'sm' | 'md';
  /** Só logo / ícone, sem texto do tenant (ex.: header principal). */
  hideName?: boolean;
  /** Em telas pequenas, exibe apenas o logo para economizar espaço. */
  hideNameOnMobile?: boolean;
  /** Se definido, a área do logo (imagem ou ícone) vira link (ex.: `/dashboard`). */
  logoLinkTo?: string;
  className?: string;
}

const logoLinkClassName =
  'inline-flex shrink-0 rounded-md outline-none ring-offset-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

/**
 * Logo + nome do tenant. Reutilizado em TopBar, AuthLayout e onde precisar de identidade visual.
 */
export function TenantBranding({
  tenant,
  size = 'sm',
  hideName = false,
  hideNameOnMobile = false,
  logoLinkTo,
  className = '',
}: TenantBrandingProps) {
  const isSm = size === 'sm';
  const logoSize = isSm ? 'h-9 w-9' : 'h-14 w-14';
  const iconSize = isSm ? 'h-5 w-5' : 'h-8 w-8';
  const showName = !hideName;
  const nameClassName = hideNameOnMobile ? 'hidden sm:inline' : 'inline';

  function wrapLogo(node: ReactNode) {
    if (!logoLinkTo) return node;
    return (
      <Link to={logoLinkTo} className={logoLinkClassName} aria-label="Ir para o dashboard">
        {node}
      </Link>
    );
  }

  if (!tenant) {
    const fallbackLogo = (
      <div
        className={`flex ${logoSize} shrink-0 items-center justify-center rounded-lg`}
        style={{ backgroundColor: 'var(--brand-primary)' }}
      >
        <ShoppingBag className={`${iconSize} text-white`} />
      </div>
    );
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {wrapLogo(fallbackLogo)}
        {showName && (
          <span
            className={`${nameClassName} text-sm font-semibold`}
            style={{ color: 'var(--brand-primary)' }}
          >
            Gift Shop
          </span>
        )}
      </div>
    );
  }

  const logoBlock = tenant.logoUrl ? (
    <img
      src={tenant.logoUrl}
      alt={tenant.name}
      className={`${isSm ? 'h-9' : 'h-14'} w-auto max-w-[200px] object-contain`}
    />
  ) : (
    <div
      className={`flex ${logoSize} shrink-0 items-center justify-center rounded-lg`}
      style={{ backgroundColor: 'var(--brand-primary)' }}
    >
      <ShoppingBag className={`${iconSize} text-white`} />
    </div>
  );

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {wrapLogo(logoBlock)}
      {showName && (
        <span
          className={`${nameClassName} ${isSm ? 'text-sm font-semibold' : 'text-lg font-medium text-foreground'}`}
          style={isSm ? { color: 'var(--brand-primary)' } : undefined}
        >
          {tenant.name}
        </span>
      )}
    </div>
  );
}
