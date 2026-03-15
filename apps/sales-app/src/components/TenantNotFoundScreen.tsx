import { Button } from '@core-ui/ui';
import { RefreshCw } from 'lucide-react';

interface TenantNotFoundScreenProps {
  onRetry: () => void;
  hostname?: string;
  message?: string | null;
}

export function TenantNotFoundScreen({ onRetry, hostname, message }: TenantNotFoundScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-muted/20">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-2xl font-semibold text-foreground">Tenant não encontrado</h1>
        <p className="text-muted-foreground">
          {message ?? 'O shopping associado a este endereço não foi encontrado ou está indisponível.'}
        </p>
        <Button onClick={onRetry} size="lg" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Recarregar
        </Button>
        {hostname && (
          <p className="text-xs text-muted-foreground/70 pt-4 font-mono" title="Debug">
            {hostname}
          </p>
        )}
      </div>
    </div>
  );
}
