import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../contexts/TenantContext';
import { useCampaignsList } from '../hooks/useCampaignsList';
import { CampaignsHeader } from '../components/campaigns/CampaignsHeader';
import { CampaignsEmptyState } from '../components/campaigns/CampaignsEmptyState';
import { CampaignsTable } from '../components/campaigns/CampaignsTable';
import { StatusMessage } from '../components/StatusMessage';
import type { CampaignListItem } from '../types/campaign-api';

/**
 * Página de Campanhas: listagem; criar e detalhe em rotas dedicadas.
 */
export function CampaignsPage() {
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const tenantId = tenant?.tenantId ?? null;
  const { list, loading, error, refetch } = useCampaignsList(tenantId);

  const goToNew = React.useCallback(() => {
    navigate('/campaigns/new');
  }, [navigate]);

  const handleRowClick = React.useCallback(
    (item: CampaignListItem) => {
      navigate(`/campaigns/${encodeURIComponent(item.id)}`);
    },
    [navigate]
  );

  const showEmpty = !loading && !error && list.length === 0;
  const showTable = !error && (list.length > 0 || loading);

  return (
    <div className="space-y-6">
      <CampaignsHeader onNewCampaign={goToNew} />

      {error && (
        <StatusMessage message={error} variant="error" onDismiss={() => refetch()} />
      )}

      {showEmpty && <CampaignsEmptyState onNewCampaign={goToNew} />}
      {showTable && (
        <CampaignsTable items={list} loading={loading} onRowClick={handleRowClick} />
      )}
    </div>
  );
}
