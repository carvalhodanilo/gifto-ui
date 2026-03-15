import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Estado vazio reutilizável: ícone, título, descrição e CTA.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 py-16 px-6 text-center ${className}`}
    >
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-full text-white [&>*]:size-7"
        style={{ backgroundColor: 'var(--brand-primary)' }}
      >
        {icon}
      </div>
      <h2 className="text-lg font-medium text-foreground">{title}</h2>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
