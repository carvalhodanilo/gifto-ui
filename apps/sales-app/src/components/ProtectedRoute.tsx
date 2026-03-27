import * as React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AuthLoadingScreen } from './AuthLoadingScreen';

/**
 * Bloqueia render até o Keycloak inicializar.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authenticated, loading, login } = useAuth();
  const didTriggerLogin = React.useRef(false);
  const oidcError = React.useMemo(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    if (!error) return null;
    return { error, errorDescription };
  }, []);

  React.useEffect(() => {
    if (!loading && !authenticated && !didTriggerLogin.current && !oidcError) {
      didTriggerLogin.current = true;
      login();
    }
  }, [loading, authenticated, login, oidcError]);

  if (loading || !authenticated) {
    if (oidcError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20 px-4">
          <div className="max-w-xl rounded-md border bg-background p-4 shadow-sm">
            <p className="text-sm font-medium text-red-600">Falha ao autenticar com o Keycloak.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              <strong>Erro:</strong> {oidcError.error}
            </p>
            {oidcError.errorDescription && (
              <p className="mt-1 text-sm text-muted-foreground">
                <strong>Detalhe:</strong> {oidcError.errorDescription}
              </p>
            )}
            <button
              type="button"
              className="mt-4 rounded-md border px-3 py-2 text-sm hover:bg-muted"
              onClick={() => {
                window.history.replaceState(window.history.state, '', window.location.pathname);
                login();
              }}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }
    return <AuthLoadingScreen />;
  }

  return <>{children}</>;
}
