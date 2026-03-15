import * as React from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useCampaignsList } from '../hooks/useCampaignsList';
import { CampaignsHeader } from '../components/campaigns/CampaignsHeader';
import { CampaignsEmptyState } from '../components/campaigns/CampaignsEmptyState';
import { CampaignsTable } from '../components/campaigns/CampaignsTable';
import { NewCampaignDialog } from '../components/campaigns/NewCampaignDialog';
import { CampaignDetailsDialog } from '../components/campaigns/CampaignDetailsDialog';
import { StatusMessage } from '../components/StatusMessage';
import type { CampaignListItem } from '../types/campaign-api';

/**
 * Página de Campanhas: listagem, criar, detalhes com edição/ativação/pausa conforme status.
 */
export function CampaignsPage() {
  const { tenant } = useTenant();
  const tenantId = tenant?.tenantId ?? null;
  const { list, loading, error, refetch } = useCampaignsList(tenantId);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [detailsCampaign, setDetailsCampaign] = React.useState<CampaignListItem | null>(null);

  const handleNewCampaign = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const handleCreateSuccess = React.useCallback(() => {
    refetch();
  }, [refetch]);

  const handleRowClick = React.useCallback((item: CampaignListItem) => {
    setDetailsCampaign(item);
  }, []);

  const handleDetailsActionSuccess = React.useCallback(() => {
    refetch();
  }, [refetch]);

  React.useEffect(() => {
    setDetailsCampaign((prev) => {
      if (!prev) return prev;
      const updated = list.find((c) => c.id === prev.id);
      return updated ?? prev;
    });
  }, [list]);

  const showEmpty = !loading && !error && list.length === 0;
  const showTable = !error && (list.length > 0 || loading);

  return (
    <div className="space-y-6">
      <CampaignsHeader onNewCampaign={handleNewCampaign} />

      {error && (
        <StatusMessage message={error} variant="error" onDismiss={() => refetch()} />
      )}

      {showEmpty && <CampaignsEmptyState onNewCampaign={handleNewCampaign} />}
      {showTable && (
        <CampaignsTable items={list} loading={loading} onRowClick={handleRowClick} />
      )}

      <NewCampaignDialog
        open={modalOpen}
        onClose={handleCloseModal}
        onSuccess={handleCreateSuccess}
      />

      <CampaignDetailsDialog
        open={detailsCampaign !== null}
        onClose={() => setDetailsCampaign(null)}
        campaign={detailsCampaign}
        onActionSuccess={handleDetailsActionSuccess}
      />
    </div>
  );
}
