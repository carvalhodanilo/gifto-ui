import { apiUrl } from '../config/api';
import type {
  GetCampaignsResponse,
  GetAllByTenantOutput,
  CreateCampaignRequest,
} from '../types/campaign-api';
import type { Campaign } from '../types/voucher';

/**
 * Lista de campanhas do tenant para o seletor no modal de vendas.
 * GET {baseUrl}/campaigns?tenantId=<tenantId>
 */
export async function getCampaigns(tenantId: string): Promise<Campaign[]> {
  const url = new URL(apiUrl('/campaigns'));
  url.searchParams.set('tenantId', tenantId);

  const res = await fetch(url.toString());

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
 * Header: tenant: tenantId
 */
export async function getAllCampaigns(tenantId: string): Promise<GetAllByTenantOutput['campaignList']> {
  const url = apiUrl('/campaigns/all');
  const res = await fetch(url, {
    headers: { tenant: tenantId },
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
 * Cria uma campanha. POST /campaigns
 * Header: tenant: tenantId
 */
export async function createCampaign(
  tenantId: string,
  body: CreateCampaignRequest
): Promise<void> {
  const url = apiUrl('/campaigns');
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      tenant: tenantId,
    },
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
}

/**
 * Atualiza uma campanha. PUT /campaigns/{campaignId}/update
 * Header: tenant: tenantId
 */
export async function updateCampaign(
  tenantId: string,
  campaignId: string,
  body: CreateCampaignRequest
): Promise<void> {
  const url = apiUrl(`/campaigns/${encodeURIComponent(campaignId)}/update`);
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      tenant: tenantId,
    },
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
 * Header: tenant: tenantId. Sem body.
 */
export async function activateCampaign(
  tenantId: string,
  campaignId: string
): Promise<void> {
  const url = apiUrl(`/campaigns/${encodeURIComponent(campaignId)}/activate`);
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { tenant: tenantId },
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
 * Header: tenant: tenantId. Sem body.
 */
export async function pauseCampaign(
  tenantId: string,
  campaignId: string
): Promise<void> {
  const url = apiUrl(`/campaigns/${encodeURIComponent(campaignId)}/pause`);
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { tenant: tenantId },
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

/**
 * Suspende uma campanha. PATCH /campaigns/{campaignId}/suspend
 * Header: tenant: tenantId. Sem body.
 */
export async function suspendCampaign(
  tenantId: string,
  campaignId: string
): Promise<void> {
  const url = apiUrl(`/campaigns/${encodeURIComponent(campaignId)}/suspend`);
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { tenant: tenantId },
  });

  if (!res.ok) {
    const text = await res.text();
    let message = `Erro ao suspender campanha: ${res.status}`;
    try {
      const data = text ? JSON.parse(text) : null;
      if (data?.message) message = data.message;
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }
}
