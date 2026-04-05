import { apiUrl } from '../config/api';
import { authFetch } from './authFetch';
import { authHeaders } from './authHeaders';
import type {
  SystemAdminTenantsPagedResponse,
  SystemAdminTenantDetail,
  CreateTenantPayload,
  UpdateTenantPayload,
  TenantBankAccount,
} from '../types/system-admin-tenant-api';
import type { UpdateBankAccountPayload } from '../types/merchant-api';
import type { MerchantsListResponse } from '../types/merchant-api';

function buildTenantsQuery(params: {
  page?: number;
  perPage?: number;
  name?: string;
  document?: string;
}): string {
  const sp = new URLSearchParams();
  if (params.page != null) sp.set('page', String(params.page));
  if (params.perPage != null) sp.set('perPage', String(params.perPage));
  if (params.name != null && params.name !== '') sp.set('name', params.name);
  if (params.document != null && params.document !== '') sp.set('document', params.document);
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

export async function getTenantsPaged(params: {
  page: number;
  perPage: number;
  name?: string;
  document?: string;
}): Promise<SystemAdminTenantsPagedResponse> {
  const url = apiUrl('/tenants/paged') + buildTenantsQuery(params);
  const res = await authFetch(url, { headers: authHeaders() });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ao carregar parceiros: ${res.status}`);
  }
  return res.json() as Promise<SystemAdminTenantsPagedResponse>;
}

export async function getTenantById(tenantId: string): Promise<SystemAdminTenantDetail> {
  const url = apiUrl(`/tenants/${encodeURIComponent(tenantId)}`);
  const res = await authFetch(url, { headers: authHeaders() });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ao carregar parceiro: ${res.status}`);
  }
  return res.json() as Promise<SystemAdminTenantDetail>;
}

export async function updateTenant(
  tenantId: string,
  payload: UpdateTenantPayload
): Promise<{ tenantId: string } | unknown> {
  const url = apiUrl(`/tenants/${encodeURIComponent(tenantId)}`);
  const res = await authFetch(url, {
    method: 'PATCH',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ao atualizar parceiro: ${res.status}`);
  }
  return res.json();
}

/**
 * System_ADMIN: envia logo do parceiro (multipart).
 * POST /tenants/{tenantId}/logo
 */
/**
 * GET /tenants/{tenantId}/bank-account — system_admin.
 * 204 = sem conta cadastrada (retorno vazio para o formulário).
 */
export async function getTenantBankAccount(tenantId: string): Promise<TenantBankAccount> {
  const url = apiUrl(`/tenants/${encodeURIComponent(tenantId)}/bank-account`);
  const res = await authFetch(url, { headers: authHeaders() });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ao carregar dados bancários: ${res.status}`);
  }
  if (res.status === 204) {
    return {
      tenantId,
      bankCode: null,
      bankName: null,
      branch: null,
      accountNumber: null,
      accountDigit: null,
      accountType: null,
      holderName: null,
      holderDocument: null,
      pixKeyType: null,
      pixKeyValue: null,
    };
  }
  return res.json() as Promise<TenantBankAccount>;
}

/**
 * PUT /tenants/{tenantId}/bank-account — system_admin.
 */
export async function updateTenantBankAccount(
  tenantId: string,
  payload: UpdateBankAccountPayload
): Promise<{ tenantId: string }> {
  const url = apiUrl(`/tenants/${encodeURIComponent(tenantId)}/bank-account`);
  const res = await authFetch(url, {
    method: 'PUT',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ao atualizar dados bancários: ${res.status}`);
  }
  return res.json() as Promise<{ tenantId: string }>;
}

export async function uploadTenantLogo(tenantId: string, file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const url = apiUrl(`/tenants/${encodeURIComponent(tenantId)}/logo`);
  const res = await authFetch(url, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ao enviar logo: ${res.status}`);
  }
  return res.json() as Promise<{ url: string }>;
}

/**
 * System_ADMIN: cria tenant.
 * POST /tenants
 */
export async function createTenant(payload: CreateTenantPayload): Promise<{ tenantId: string } | unknown> {
  const url = apiUrl('/tenants');
  const res = await authFetch(url, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ao criar parceiro: ${res.status}`);
  }
  return res.json();
}

function buildMerchantsQuery(params: {
  page?: number;
  perPage?: number;
  terms?: string;
  status?: string | null;
}): string {
  const sp = new URLSearchParams();
  if (params.page != null) sp.set('page', String(params.page));
  if (params.perPage != null) sp.set('perPage', String(params.perPage));
  if (params.terms != null && params.terms !== '') sp.set('terms', params.terms);
  if (params.status != null && params.status !== '') sp.set('status', String(params.status));
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

/**
 * System_ADMIN: lista merchants de um tenant específico (somente leitura).
 * GET /tenants/{tenantId}/merchants
 */
export async function getMerchantsByTenantAsSystemAdmin(
  tenantId: string,
  params: { page: number; perPage: number; terms?: string; status?: string | null }
): Promise<MerchantsListResponse> {
  const url =
    apiUrl(`/tenants/${encodeURIComponent(tenantId)}/merchants`) + buildMerchantsQuery(params);
  const res = await authFetch(url, { headers: authHeaders() });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ao carregar lojas do parceiro: ${res.status}`);
  }
  const raw = (await res.json()) as {
    currentPage: number;
    perPage: number;
    total: number;
    items: { merchantId?: string; id?: string; fantasyName: string | null; status: string }[];
  };
  // Backend devolve ListMerchantsByTenantOutput (id, fantasyName, status). Normaliza para MerchantListItem.
  return {
    currentPage: raw.currentPage,
    perPage: raw.perPage,
    total: raw.total,
    items: raw.items.map((i) => ({
      merchantId: i.merchantId ?? i.id ?? '',
      fantasyName: i.fantasyName ?? null,
      status: (i.status as 'ACTIVE' | 'SUSPENDED') ?? 'ACTIVE',
    })),
  };
}

