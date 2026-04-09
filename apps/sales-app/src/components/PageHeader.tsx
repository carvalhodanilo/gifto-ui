import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@core-ui/ui';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** À esquerda do título, mesma linha (ex.: Voltar). */
  back?: ReactNode;
  action?: ReactNode;
  className?: string;
}

interface PageBackControlProps {
  onClick: () => void;
  label?: string;
}

/**
 * Controle compacto de voltar para usar em `PageHeader` (`back={...}`).
 */
export function PageBackControl({ onClick, label = 'Voltar' }: PageBackControlProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="-ml-2 h-9 shrink-0 gap-1 px-2 text-muted-foreground hover:text-foreground"
      onClick={onClick}
    >
      <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
      {label}
    </Button>
  );
}

/**
 * Cabeçalho de página: opcionalmente voltar + título na mesma linha, subtítulo abaixo, ação à direita.
 */
export function PageHeader({ title, subtitle, back, action, className = '' }: PageHeaderProps) {
  return (
    <div className={`flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {back}
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        </div>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
