import * as React from 'react';
import { getAllCampaigns } from '../api/campaigns';
import type { CampaignListItem } from '../types/campaign-api';

export interface UseCampaignsListResult {
  list: CampaignListItem[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Carrega a lista de campanhas do tenant (GET /campaigns/all).
 * tenantId deve vir do TenantContext.
 */
export function useCampaignsList(tenantId: string | null): UseCampaignsListResult {
  const [list, setList] = React.useState<CampaignListItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fetchRef = React.useRef(0);

  const fetchList = React.useCallback(() => {
    if (!tenantId) {
      setList([]);
      setError(null);
      return;
    }
    const id = ++fetchRef.current;
    setLoading(true);
    setError(null);
    getAllCampaigns(tenantId)
      .then((data) => {
        if (id === fetchRef.current) setList(data);
      })
      .catch((err) => {
        if (id === fetchRef.current) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar campanhas');
          setList([]);
        }
      })
      .finally(() => {
        if (id === fetchRef.current) setLoading(false);
      });
  }, [tenantId]);

  React.useEffect(() => {
    fetchList();
  }, [fetchList]);

  return { list, loading, error, refetch: fetchList };
}
