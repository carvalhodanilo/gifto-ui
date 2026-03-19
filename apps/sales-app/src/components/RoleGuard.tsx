import * as React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AccessDeniedScreen } from './AccessDeniedScreen';

export interface RoleGuardProps {
  /**
   * Mesma semântica do SidebarMenu:
   * - undefined/[] => sempre permitido
   * - caso informado => permitido se tiver QUALQUER uma das roles
   */
  allowedRoles?: string[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { roles } = useAuth();

  const isAllowed = React.useMemo(() => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.some((role) => roles.includes(role));
  }, [allowedRoles, roles]);

  if (!isAllowed) {
    return <AccessDeniedScreen />;
  }

  return <>{children}</>;
}

