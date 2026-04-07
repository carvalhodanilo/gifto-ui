import { apiUrl } from '../config/api';
import type {
  GetCampaignsResponse,
  GetAllByTenantOutput,
  CreateCampaignRequest,
  CreateCampaignResponse,
  CampaignListItem,
} from '../types/campaign-api';
import type { Campaign } from '../types/voucher';
import { authHeaders } from './authHeaders';
import { authFetch } from './authFetch';

/**
 * Lista de campanhas do tenant para o seletor no modal de vendas.
 * GET {baseUrl}/campaigns
 */
export async function getCampaigns(_tenantId: string): Promise<Campaign[]> {
  // Tenant é resolvido via claims do token; mantemos o parâmetro por compatibilidade interna.
  void _tenantId;
  const res = await authFetch(apiUrl('/campaigns'), { headers: authHeaders() });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ao carregar campanhas: ${res.status}`);
  }

  const data = (await res.json()) as GetCampaignsResponse;
  const list = data.campaignList ?? [];
  return list.map((c) => ({ id: c.id, name: c.campaignName }));
}

/**
 * Lista todas as campanhas do tenant. GET /campaigns/all
 * Authorization via token
 */
export async function getAllCampaigns(_tenantId: string): Promise<GetAllByTenantOutput['campaignList']> {
  // Tenant é resolvido via claims do token; mantemos o parâmetro por compatibilidade interna.
  void _tenantId;
  const url = apiUrl('/campaigns/all');
  const res = await authFetch(url, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    let message = `Erro ao carregar campanhas: ${res.status}`;
    try {
      const data = text ? JSON.parse(text) : null;
      if (data?.message) message = data.message;
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }

  const data = (await res.json()) as GetAllByTenantOutput;
  return data.campaignList ?? [];
}

/**
 * Detalhe de uma campanha. GET /campaigns/{campaignId}
 */
export async function getCampaignById(
  _tenantId: string,
  campaignId: string
): Promise<CampaignListItem> {
  void _tenantId;
  const url = apiUrl(`/campaigns/${encodeURIComponent(campaignId)}`);
  const res = await authFetch(url, { headers: authHeaders() });

  if (!res.ok) {
    const text = await res.text();
    let message = `Erro ao carregar campanha: ${res.status}`;
    try {
      const data = text ? JSON.parse(text) : null;
      if (data?.message) message = data.message;
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }

  return (await res.json()) as CampaignListItem;
}

/**
 * Cria uma campanha. POST /campaigns
 * Authorization via token
 */
export async function createCampaign(
  _tenantId: string,
  body: CreateCampaignRequest
): Promise<string> {
  const url = apiUrl('/campaigns');
  const res = await authFetch(url, {
    method: 'POST',
    headers: authHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    let message = `Erro ao criar campanha: ${res.status}`;
    try {
      const data = text ? JSON.parse(text) : null;
      if (data?.message) message = data.message;
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }

  const data = (await res.json()) as CreateCampaignResponse;
  if (!data?.campaignId) {
    throw new Error('Resposta inválida: campaignId ausente.');
  }
  return data.campaignId;
}

/**
 * Atualiza uma campanha. PUT /campaigns/{campaignId}/update
 * Authorization via token
 */
export async function updateCampaign(
  _tenantId: string,
  campaignId: string,
  body: CreateCampaignRequest
): Promise<void> {
  const url = apiUrl(`/campaigns/${encodeURIComponent(campaignId)}/update`);
  const res = await authFetch(url, {
    method: 'PUT',
    headers: authHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    let message = `Erro ao atualizar campanha: ${res.status}`;
    try {
      const data = text ? JSON.parse(text) : null;
      if (data?.message) message = data.message;
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }
}

/**
 * Ativa uma campanha. PATCH /campaigns/{campaignId}/activate
 * Authorization via token. Sem body.
 */
export async function activateCampaign(
  _tenantId: string,
  campaignId: string
): Promise<void> {
  const url = apiUrl(`/campaigns/${encodeURIComponent(campaignId)}/activate`);
  const res = await authFetch(url, {
    method: 'PATCH',
    headers: authHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    let message = `Erro ao ativar campanha: ${res.status}`;
    try {
      const data = text ? JSON.parse(text) : null;
      if (data?.message) message = data.message;
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }
}

/**
 * Pausa uma campanha. PATCH /campaigns/{campaignId}/pause
 * Authorization via token. Sem body.
 */
export async function pauseCampaign(
  _tenantId: string,
  campaignId: string
): Promise<void> {
  const url = apiUrl(`/campaigns/${encodeURIComponent(campaignId)}/pause`);
  const res = await authFetch(url, {
    method: 'PATCH',
    headers: authHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    let message = `Erro ao pausar campanha: ${res.status}`;
    try {
      const data = text ? JSON.parse(text) : null;
      if (data?.message) message = data.message;
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }
}

