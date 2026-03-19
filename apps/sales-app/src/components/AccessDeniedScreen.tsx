import { Button } from '@core-ui/ui';
import { useNavigate } from 'react-router-dom';

interface AccessDeniedScreenProps {
  title?: string;
  message?: string;
  redirectTo?: string;
  redirectLabel?: string;
}

export function AccessDeniedScreen({
  title = 'Acesso negado',
  message = 'Você não tem permissão para acessar esta página.',
  redirectTo = '/dashboard',
  redirectLabel = 'Voltar ao Dashboard',
}: AccessDeniedScreenProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <p className="text-muted-foreground">{message}</p>
        <div className="pt-2">
          <Button size="lg" onClick={() => navigate(redirectTo, { replace: true })}>
            {redirectLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

