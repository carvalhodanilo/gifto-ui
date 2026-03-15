import * as React from 'react';
import { getCampaigns } from '../api/campaigns';
import type { Campaign } from '../types/voucher';

interface UseCampaignsOptions {
  /** Só dispara a requisição quando true (ex.: modal aberto). */
  enabled?: boolean;
}

/**
 * Hook reutilizável: carrega campanhas por tenantId.
 * GET /campaigns?tenantId= — retorno mapeado para Campaign[] (id, name).
 */
export function useCampaigns(
  tenantId: string | null,
  options: UseCampaignsOptions = {}
): { campaigns: Campaign[]; loading: boolean; error: string | null } {
  const { enabled = true } = options;
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!enabled || !tenantId) {
      setCampaigns([]);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getCampaigns(tenantId)
      .then((list) => {
        if (!cancelled) setCampaigns(list);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar campanhas');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tenantId, enabled]);

  return { campaigns, loading, error };
}
