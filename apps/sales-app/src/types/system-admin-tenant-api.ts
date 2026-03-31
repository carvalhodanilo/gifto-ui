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
  status: string;
}

export interface UpdateTenantPayload {
  name: string;
  fantasyName?: string | null;
  phone1?: string | null;
  phone2?: string | null;
  email: string;
  url: string;
}

