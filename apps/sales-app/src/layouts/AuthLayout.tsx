import { useTenant } from '../contexts/TenantContext';
import { TenantBranding } from '../components/TenantBranding';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

/**
 * Layout para telas de autenticação: branding do tenant no topo, conteúdo centralizado.
 */
export function AuthLayout({ children, title, className }: AuthLayoutProps) {
  const { tenant } = useTenant();

  return (
    <div
      className={
        className ??
        'min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-muted/20'
      }
    >
      <div className="mb-8 flex flex-col items-center gap-3">
        <TenantBranding tenant={tenant} size="md" />
        {title && <h1 className="text-lg font-medium text-foreground">{title}</h1>}
      </div>
      {children}
    </div>
  );
}
