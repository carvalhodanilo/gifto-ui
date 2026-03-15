import * as React from 'react';
import type { Tenant } from '../types/tenant';
import type { TenantOption } from '../types/tenant-api';
import { DEFAULT_PRIMARY_COLOR, DEFAULT_SECONDARY_COLOR } from '../config/default-tenant-theme';

export interface TenantState {
  tenant: Tenant | null;
  /** Define o tenant a partir da seleção no login (lista GET /tenants). */
  setTenantFromSelection: (option: TenantOption) => void;
  resetTenant: () => void;
}

const defaultState: TenantState = {
  tenant: null,
  setTenantFromSelection: () => {},
  resetTenant: () => {},
};

const TenantContext = React.createContext<TenantState>(defaultState);

function tenantFromOption(option: TenantOption): Tenant {
  return {
    tenantId: option.id,
    name: option.fantasyName,
    slug: option.id,
    logoUrl: null,
    primaryColor: DEFAULT_PRIMARY_COLOR,
    secondaryColor: DEFAULT_SECONDARY_COLOR,
    active: true,
  };
}

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = React.useState<Tenant | null>(null);

  const setTenantFromSelection = React.useCallback((option: TenantOption) => {
    setTenant(tenantFromOption(option));
  }, []);

  const resetTenant = React.useCallback(() => {
    setTenant(null);
  }, []);

  const value = React.useMemo(
    () => ({ tenant, setTenantFromSelection, resetTenant }),
    [tenant, setTenantFromSelection, resetTenant]
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
