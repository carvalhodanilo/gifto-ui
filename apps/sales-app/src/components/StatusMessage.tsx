import { Card, CardContent } from '@core-ui/ui';

interface StatusMessageProps {
  message: string;
  variant?: 'error' | 'success';
  onDismiss?: () => void;
  className?: string;
}

/**
 * Mensagem de feedback (erro ou sucesso). Reutilizável em formulários e modais.
 */
export function StatusMessage({
  message,
  variant = 'error',
  onDismiss,
  className = '',
}: StatusMessageProps) {
  const isError = variant === 'error';
  return (
    <Card
      className={`${isError ? 'border-destructive/50 bg-destructive/5' : 'border-green-200 bg-green-50/50'} ${className}`}
    >
      <CardContent className="flex items-center justify-between gap-3 py-3">
        <p className={`text-sm ${isError ? 'text-destructive' : 'text-green-800 dark:text-green-400'}`}>
          {message}
        </p>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className={`text-sm font-medium underline hover:no-underline ${isError ? 'text-destructive' : 'text-green-800 dark:text-green-400'}`}
          >
            Fechar
          </button>
        )}
      </CardContent>
    </Card>
  );
}
