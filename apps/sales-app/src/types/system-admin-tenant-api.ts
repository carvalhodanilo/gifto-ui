export interface SystemAdminTenantListItem {
  id: string;
  name: string;
  fantasyName: string | null;
  document: string;
  status: string;
}

export interface SystemAdminTenantsPagedResponse {
  currentPage: number;
  perPage: number;
  total: number;
  items: SystemAdminTenantListItem[];
}

export interface SystemAdminTenantDetail {
  id: string;
  name: string;
  fantasyName: string | null;
  document: string;
  phone1: string | null;
  phone2: string | null;
  email: string;
  url: string;
  /** Presente na API GET /tenants/{id} (GetTenantOutput). */
  logoUrl?: string | null;
  status: string;
}

export interface CreateTenantPayload {
  name: string;
  fantasyName?: string | null;
  document: string;
  phone1?: string | null;
  email: string;
  url: string;
}

export interface UpdateTenantPayload {
  name: string;
  fantasyName?: string | null;
  phone1?: string | null;
  phone2?: string | null;
  email: string;
  url: string;
}

/** Resposta de GET /tenants/{tenantId}/bank-account (system_admin). */
export interface TenantBankAccount {
  tenantId: string;
  bankCode: string | null;
  bankName: string | null;
  branch: string | null;
  accountNumber: string | null;
  accountDigit: string | null;
  accountType: string | null;
  holderName: string | null;
  holderDocument: string | null;
  pixKeyType: string | null;
  pixKeyValue: string | null;
}

