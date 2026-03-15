import type { Campaign } from '../types/voucher';

/**
 * Campanhas mockadas para o MVP.
 * Futuro: substituir por chamada à API de campanhas (ex.: GET /v1/campaigns).
 * A SalesPage ou um hook poderá carregar campanhas da API e passar ao CampaignSelector.
 */
export const MOCK_CAMPAIGNS: Campaign[] = [
  { id: 'campaign-1', name: 'Natal 2025' },
  { id: 'campaign-2', name: 'Dia das Mães' },
  { id: 'campaign-3', name: 'Black Friday' },
];
