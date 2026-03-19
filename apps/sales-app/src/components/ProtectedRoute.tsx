import * as React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AuthLoadingScreen } from './AuthLoadingScreen';

/**
 * Bloqueia render até o Keycloak inicializar.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authenticated, loading, login } = useAuth();
  const didTriggerLogin = React.useRef(false);

  React.useEffect(() => {
    if (!loading && !authenticated && !didTriggerLogin.current) {
      didTriggerLogin.current = true;
      login();
    }
  }, [loading, authenticated, login]);

  if (loading || !authenticated) {
    return <AuthLoadingScreen />;
  }

  return <>{children}</>;
}
