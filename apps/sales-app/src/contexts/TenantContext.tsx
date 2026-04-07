import * as React from 'react';
import {
  getMockTenantConfig,
  DEFAULT_TENANT_PRIMARY_COLOR,
  DEFAULT_TENANT_SECONDARY_COLOR,
} from '../config/mock-tenant';
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
  /** Nome, logo e cores vindos da API (GET /tenants/me/branding). Null nas cores = paleta padrão do mock. */
  mergeTenantBranding: (patch: {
    name: string;
    logoUrl: string | null;
    primaryColor: string | null;
    secondaryColor: string | null;
  }) => void;
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
  mergeTenantBranding: () => {},
  resetTenant: () => {},
};

const TenantContext = React.createContext<TenantState>(defaultState);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [initialTenant] = React.useState(() => getMockTenantConfig());
  const [tenant, setTenant] = React.useState<Tenant | null>(null);
  const [status, setStatus] = React.useState<TenantStatus>('idle');
  const [error, setError] = React.useState<string | null>(null);
  const [slug] = React.useState(() => initialTenant.slug);

  const resolve = React.useCallback(async () => {
    setStatus('loading');
    setError(null);
    // Tenant vem do mock local — sem `setTimeout` artificial (400 ms antes), que deixava
    // logout/reload perceptivelmente “travados”. Com fetch real, o loading cobre a rede.
    // Não sobrescreve tenantId vindo do token (AuthContext pode ter setado antes).
    setTenant((prev) => prev ?? { ...initialTenant });
    setStatus('success');
  }, [initialTenant]);

  React.useEffect(() => {
    resolve();
  }, [resolve]);

  const setTenantFromLogin = React.useCallback(
    (tenantId: string, _name?: string) => {
      void _name; // Mantém compatibilidade com AuthContext; por enquanto não usamos o "name" do token.
      // O tema (nome/logo/cores) vem do tenant mock (por enquanto) e o backend resolve o escopo por JWT.
      // Então: atualizamos apenas `tenantId` para usar nas chamadas autenticadas.
      setTenant((prev) => {
        if (prev) return { ...prev, tenantId };
        return { ...initialTenant, tenantId };
      });
    },
    [initialTenant]
  );

  const mergeTenantBranding = React.useCallback(
    (patch: {
      name: string;
      logoUrl: string | null;
      primaryColor: string | null;
      secondaryColor: string | null;
    }) => {
      setTenant((prev) => {
        if (!prev) return prev;
        const primary =
          patch.primaryColor != null && patch.primaryColor.trim() !== ''
            ? patch.primaryColor.trim()
            : DEFAULT_TENANT_PRIMARY_COLOR;
        const secondary =
          patch.secondaryColor != null && patch.secondaryColor.trim() !== ''
            ? patch.secondaryColor.trim()
            : DEFAULT_TENANT_SECONDARY_COLOR;
        return {
          ...prev,
          name: patch.name,
          logoUrl: patch.logoUrl,
          primaryColor: primary,
          secondaryColor: secondary,
        };
      });
    },
    []
  );

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
      mergeTenantBranding,
      resetTenant,
    }),
    [status, tenant, error, slug, retry, setTenantFromLogin, mergeTenantBranding, resetTenant]
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
