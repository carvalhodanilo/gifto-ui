import { apiUrl } from '../config/api';
import type {
  MerchantsListParams,
  MerchantsListResponse,
  MerchantDetail,
  CreateMerchantPayload,
  UpdateMerchantPayload,
  MerchantBankAccount,
  UpdateBankAccountPayload,
} from '../types/merchant-api';
import { authHeaders } from './authHeaders';
import { authFetch } from './authFetch';

/**
 * Monta query string para listagem de merchants (page, perPage, terms, status).
 */
function buildMerchantsQuery(params: MerchantsListParams): string {
  const searchParams = new URLSearchParams();
  if (params.page != null) searchParams.set('page', String(params.page));
  if (params.perPage != null) searchParams.set('perPage', String(params.perPage));
  if (params.terms != null && params.terms !== '') searchParams.set('terms', params.terms);
  if (params.status != null && params.status !== '') searchParams.set('status', params.status);
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

/**
 * GET /merchants - lista paginada de merchants do tenant.
 * Headers: tenant. Query: page, perPage, terms, status (status pode ser null).
 */
export async function getMerchants(
  _tenantId: string,
  params: MerchantsListParams = {}
): Promise<MerchantsListResponse> {
  const url = apiUrl('/merchants') + buildMerchantsQuery(params);
  const res = await authFetch(url, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ao carregar lojas: ${res.status}`);
  }
  return res.json() as Promise<MerchantsListResponse>;
}

/**
 * GET /merchants/:merchantId - detalhes do merchant (sem dados bancários).
 * Header obrigatório: tenant.
 */
export async function getMerchantById(
  _tenantId: string,
  merchantId: string
): Promise<MerchantDetail> {
  const url = apiUrl(`/merchants/${encodeURIComponent(merchantId)}`);
  const res = await authFetch(url, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ao carregar loja: ${res.status}`);
  }
  return res.json() as Promise<MerchantDetail>;
}

/**
 * POST /merchants - criar merchant.
 * Refatorar quando o backend expor o endpoint (contrato pode variar).
 */
export async function createMerchant(
  _tenantId: string,
  payload: CreateMerchantPayload
): Promise<MerchantDetail> {
  const url = apiUrl('/merchants');
  const res = await authFetch(url, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ao criar loja: ${res.status}`);
  }
  return res.json() as Promise<MerchantDetail>;
}

/**
 * PUT /merchants/:merchantId - atualizar merchant.
 * Refatorar quando o backend expor o endpoint (contrato pode variar).
 */
export async function updateMerchant(
  _tenantId: string,
  merchantId: string,
  payload: UpdateMerchantPayload
): Promise<MerchantDetail> {
  const url = apiUrl(`/merchants/${encodeURIComponent(merchantId)}`);
  const res = await authFetch(url, {
    method: 'PUT',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ao atualizar loja: ${res.status}`);
  }
  return res.json() as Promise<MerchantDetail>;
}

/**
 * GET /merchants/:merchantId/bank-account - dados bancários do merchant.
 * Endpoint separado por segurança; futura permissão específica para esta aba.
 */
export async function getMerchantBankAccount(
  _tenantId: string,
  merchantId: string
): Promise<MerchantBankAccount> {
  const url = apiUrl(`/merchants/${encodeURIComponent(merchantId)}/bank-account`);
  const res = await authFetch(url, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ao carregar dados bancários: ${res.status}`);
  }
  // 204 No Content = merchant sem conta cadastrada; retorna estrutura vazia para não lançar erro na tela
  if (res.status === 204) {
    return Promise.resolve({
      merchantId,
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
    } as MerchantBankAccount);
  }
  return res.json() as Promise<MerchantBankAccount>;
}

/**
 * PUT /merchants/:merchantId/bank-account - atualizar dados bancários.
 * Endpoint separado do PUT do merchant (permissionamento futuro).
 */
export async function updateMerchantBankAccount(
  _tenantId: string,
  merchantId: string,
  payload: UpdateBankAccountPayload
): Promise<{ merchantId: string; tenantId: string }> {
  const url = apiUrl(`/merchants/${encodeURIComponent(merchantId)}/bank-account`);
  const res = await authFetch(url, {
    method: 'PUT',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ao atualizar dados bancários: ${res.status}`);
  }
  return res.json() as Promise<{ merchantId: string; tenantId: string }>;
}

/**
 * POST /merchants/:merchantId/activate - ativa o merchant (status → ACTIVE).
 * Resposta: 204 No Content. Idempotente se já estiver ativo.
 */
export async function activateMerchant(
  _tenantId: string,
  merchantId: string
): Promise<void> {
  const url = apiUrl(`/merchants/${encodeURIComponent(merchantId)}/activate`);
  const res = await authFetch(url, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ao ativar loja: ${res.status}`);
  }
}

/**
 * POST /merchants/:merchantId/suspend - suspende o merchant (status → SUSPENDED).
 * Resposta: 204 No Content. Idempotente se já estiver suspenso.
 */
export async function suspendMerchant(
  _tenantId: string,
  merchantId: string
): Promise<void> {
  const url = apiUrl(`/merchants/${encodeURIComponent(merchantId)}/suspend`);
  const res = await authFetch(url, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ao suspender loja: ${res.status}`);
  }
}

/**
 * POST /merchants/:merchantId/landing-logo — multipart field "file".
 * Resposta: { url } (URL pública do asset).
 */
export async function uploadMerchantLandingLogo(
  _tenantId: string,
  merchantId: string,
  file: File
): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const url = apiUrl(`/merchants/${encodeURIComponent(merchantId)}/landing-logo`);
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
