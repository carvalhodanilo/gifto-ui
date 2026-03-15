import * as React from 'react';
import { getMockTenantConfig } from '../config/mock-tenant';
import type { Tenant } from '../types/tenant';

export type TenantStatus = 'idle' | 'loading' | 'success' | 'error';

export interface TenantState {
  status: TenantStatus;
  tenant: Tenant | null;
  error: string | null;
  slug: string;
  retry: () => void;
  /** Atualiza tenant com id e nome selecionados no login (mantém tema). */
  setTenantFromLogin: (tenantId: string, name: string) => void;
  /** Restaura tenant para o estado inicial (ex.: após logout). */
  resetTenant: () => void;
}

const defaultState: TenantState = {
  status: 'idle',
  tenant: null,
  error: null,
  slug: '',
  retry: () => {},
  setTenantFromLogin: () => {},
  resetTenant: () => {},
};

const TenantContext = React.createContext<TenantState>(defaultState);

const MOCK_LOADING_MS = 400;

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [initialTenant] = React.useState(() => getMockTenantConfig());
  const [tenant, setTenant] = React.useState<Tenant | null>(null);
  const [status, setStatus] = React.useState<TenantStatus>('idle');
  const [error, setError] = React.useState<string | null>(null);
  const [slug] = React.useState(() => initialTenant.slug);

  const resolve = React.useCallback(async () => {
    setStatus('loading');
    setError(null);
    await new Promise((r) => setTimeout(r, MOCK_LOADING_MS));
    setTenant({ ...initialTenant });
    setStatus('success');
  }, [initialTenant]);

  React.useEffect(() => {
    resolve();
  }, [resolve]);

  const setTenantFromLogin = React.useCallback((tenantId: string, name: string) => {
    setTenant((prev) => (prev ? { ...prev, tenantId, name } : null));
  }, []);

  const resetTenant = React.useCallback(() => {
    setTenant({ ...initialTenant });
  }, [initialTenant]);

  const retry = React.useCallback(() => resolve(), [resolve]);

  const value: TenantState = React.useMemo(
    () => ({
      status,
      tenant,
      error,
      slug,
      retry,
      setTenantFromLogin,
      resetTenant,
    }),
    [status, tenant, error, slug, retry, setTenantFromLogin, resetTenant]
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant(): TenantState {
  const ctx = React.useContext(TenantContext);
  if (ctx === undefined) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return ctx;
}
