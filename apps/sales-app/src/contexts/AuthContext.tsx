import * as React from 'react';
import { useTenant } from './TenantContext';
import {
  initKeycloak,
  getKeycloakInstance,
  logoutUrlRedirectUri,
  ensureFreshToken,
  markLogoutLanding,
  clearLogoutLanding,
} from '../auth/keycloakClient';

export type TokenParsed = unknown;

export interface AuthState {
  authenticated: boolean;
  /** True entre o clique em sair e o redirect do Keycloak (evita mostrar "Autenticando..."). */
  loggingOut: boolean;
  loading: boolean;
  token: string | null;
  tokenParsed: TokenParsed | null;
  username: string | null;
  email: string | null;
  roles: string[];
  tenantId: string | null;
  merchantId: string | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = React.createContext<AuthState | undefined>(undefined);

type TokenParsedRecord = Record<string, unknown>;

function asString(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return null;
}

function toTokenParsedRecord(tokenParsed: unknown): TokenParsedRecord | null {
  if (!tokenParsed || typeof tokenParsed !== 'object') return null;
  return tokenParsed as TokenParsedRecord;
}

function parseRoles(tokenParsed: unknown): string[] {
  const roles = new Set<string>();
  const tp = toTokenParsedRecord(tokenParsed);
  if (!tp) return [];

  const realmAccess = tp['realm_access'];
  if (realmAccess && typeof realmAccess === 'object') {
    const realmRoles = (realmAccess as Record<string, unknown>)['roles'];
    if (Array.isArray(realmRoles)) {
      realmRoles.forEach((r) => {
        const s = asString(r);
        if (s) roles.add(s);
      });
    }
  }

  const resourceAccess = tp['resource_access'];
  if (resourceAccess && typeof resourceAccess === 'object') {
    Object.values(resourceAccess as Record<string, unknown>).forEach((access) => {
      if (!access || typeof access !== 'object') return;
      const rs = (access as Record<string, unknown>)['roles'];
      if (Array.isArray(rs)) {
        rs.forEach((r) => {
          const s = asString(r);
          if (s) roles.add(s);
        });
      }
    });
  }

  return Array.from(roles);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { tenant, setTenantFromLogin } = useTenant();

  const [state, setState] = React.useState<AuthState>({
    authenticated: false,
    loggingOut: false,
    loading: true,
    token: null,
    tokenParsed: null,
    username: null,
    email: null,
    roles: [],
    tenantId: null,
    merchantId: null,
    login: () => {},
    logout: () => {},
  });

  const applyClaimsToContexts = React.useCallback(
    (tokenParsed: unknown) => {
      const tp = toTokenParsedRecord(tokenParsed);
      const tenantId = asString(tp?.tenant_id);
      const merchantId = asString(tp?.merchant_id);

      if (tenantId) {
        // Mantemos o "nome" atual do tenant (mock/tema) e só atualizamos o tenantId para chamadas API.
        setTenantFromLogin(tenantId, tenant?.name ?? tenantId);
      }

      return { tenantId, merchantId };
    },
    [tenant?.name, setTenantFromLogin]
  );

  const applyClaimsRef = React.useRef(applyClaimsToContexts);
  React.useEffect(() => {
    applyClaimsRef.current = applyClaimsToContexts;
  }, [applyClaimsToContexts]);

  const login = React.useCallback(() => {
    const kc = getKeycloakInstance();
    const redirectUri = window.location.href;
    if (kc) {
      kc.login({ redirectUri }).catch(() => {});
      return;
    }
    initKeycloak()
      .then((instance) => instance.login({ redirectUri }))
      .catch(() => {});
  }, []);

  const logout = React.useCallback(() => {
    const resetLoggingOut = () =>
      setState((prev) => (prev.loggingOut ? { ...prev, loggingOut: false } : prev));

    markLogoutLanding();
    setState((prev) => ({ ...prev, loggingOut: true }));

    const kc = getKeycloakInstance();
    const redirectUri = logoutUrlRedirectUri();
    if (kc) {
      kc.logout({ redirectUri }).catch(resetLoggingOut);
      return;
    }
    initKeycloak()
      .then((instance) => instance.logout({ redirectUri }))
      .catch(resetLoggingOut);
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    initKeycloak()
      .then((kc) => {
        if (cancelled) return;
        const tp = kc.tokenParsed;
        const tpRecord = toTokenParsedRecord(tp);
        const username = asString(tpRecord?.preferred_username);
        const email = asString(tpRecord?.email);
        const roles = parseRoles(tp);
        const { tenantId, merchantId } = applyClaimsRef.current(tp);

        setState((prev) => ({
          ...prev,
          authenticated: kc.authenticated ?? false,
          loggingOut: (kc.authenticated ?? false) ? false : prev.loggingOut,
          loading: false,
          token: kc.token ?? null,
          tokenParsed: tp ?? null,
          username,
          email,
          roles,
          tenantId,
          merchantId,
          login,
          logout,
        }));

        kc.onAuthRefreshSuccess = () => {
          if (cancelled) return;
          const refreshedTp = kc.tokenParsed;
          const refreshedTpRecord = toTokenParsedRecord(refreshedTp);
          const refreshedUsername = asString(refreshedTpRecord?.preferred_username);
          const refreshedEmail = asString(refreshedTpRecord?.email);
          const refreshedRoles = parseRoles(refreshedTp);
          const { tenantId: refreshedTenantId, merchantId: refreshedMerchantId } =
            applyClaimsRef.current(refreshedTp);

          setState((prev) => ({
            ...prev,
            authenticated: kc.authenticated ?? false,
            loggingOut: (kc.authenticated ?? false) ? false : prev.loggingOut,
            token: kc.token ?? null,
            tokenParsed: refreshedTp ?? null,
            username: refreshedUsername,
            email: refreshedEmail,
            roles: refreshedRoles,
            tenantId: refreshedTenantId,
            merchantId: refreshedMerchantId,
          }));
        };

        kc.onAuthLogout = () => {
          if (cancelled) return;
          setState((prev) => ({
            ...prev,
            authenticated: false,
            loggingOut: true,
            token: null,
            tokenParsed: null,
            roles: [],
            tenantId: null,
            merchantId: null,
          }));
        };

        kc.onTokenExpired = () => {
          void ensureFreshToken(0);
        };

        clearLogoutLanding();
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[Auth] Keycloak init failed:', err);
        setState((prev) => ({
          ...prev,
          loading: false,
          authenticated: false,
          loggingOut: false,
          login,
          logout,
        }));
        clearLogoutLanding();
      });

    return () => {
      cancelled = true;
    };
  }, [login, logout]);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
