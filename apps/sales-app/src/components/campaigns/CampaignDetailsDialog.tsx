import * as React from 'react';
import { Button } from '@core-ui/ui';
import { useTenant } from '../../contexts/TenantContext';
import { updateCampaign, activateCampaign, pauseCampaign } from '../../api/campaigns';
import { Dialog } from '../sales/Dialog';
import { ConfirmDialog } from '../ConfirmDialog';
import { StatusMessage } from '../StatusMessage';
import { campaignInputClass, isoToDateInputValue } from './campaignFormStyles';
import { CampaignStatusBadge } from './CampaignStatusBadge';
import { formatDateOnly } from '../../utils/format';
import type { CampaignListItem } from '../../types/campaign-api';

type ConfirmAction = 'activate' | 'pause';

function isWithinCampaignWindow(startsAtIso: string, endsAtIso: string, nowMs: number = Date.now()): boolean {
  const start = new Date(startsAtIso).getTime();
  const end = new Date(endsAtIso).getTime();
  return nowMs >= start && nowMs <= end;
}

interface CampaignDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  campaign: CampaignListItem | null;
  onActionSuccess: () => void;
}

/**
 * Modal de detalhes: ACTIVE só pode ser pausada; DRAFT/PAUSED podem ser ativadas (sem exclusão — só pausar).
 */
export function CampaignDetailsDialog({
  open,
  onClose,
  campaign,
  onActionSuccess,
}: CampaignDetailsDialogProps) {
  const { tenant } = useTenant();
  const tenantId = tenant?.tenantId ?? null;

  const isDraft = campaign?.status === 'DRAFT';
  const canEdit = isDraft;
  const showActivate = campaign?.status === 'DRAFT' || campaign?.status === 'PAUSED';
  const showPauseOnly = campaign?.status === 'ACTIVE';

  const [name, setName] = React.useState('');
  const [expirationDays, setExpirationDays] = React.useState(0);
  const [startsAt, setStartsAt] = React.useState('');
  const [endsAt, setEndsAt] = React.useState('');
  const [saveLoading, setSaveLoading] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [confirm, setConfirm] = React.useState<ConfirmAction | null>(null);

  React.useEffect(() => {
    if (campaign) {
      setName(campaign.name);
      setExpirationDays(campaign.expirationDays);
      setStartsAt(isoToDateInputValue(campaign.startsAt));
      setEndsAt(isoToDateInputValue(campaign.endsAt));
      setSaveError(null);
      setActionError(null);
    }
  }, [campaign]);

  const hasFormChanges =
    campaign &&
    (name !== campaign.name ||
      expirationDays !== campaign.expirationDays ||
      startsAt !== isoToDateInputValue(campaign.startsAt) ||
      endsAt !== isoToDateInputValue(campaign.endsAt));

  const scheduleDirty =
    !!campaign &&
    canEdit &&
    (startsAt !== isoToDateInputValue(campaign.startsAt) ||
      endsAt !== isoToDateInputValue(campaign.endsAt));

  const persistedWindowOk =
    !!campaign && isWithinCampaignWindow(campaign.startsAt, campaign.endsAt);

  const activateBlockedReason = (() => {
    if (!campaign || !showActivate) return null;
    if (scheduleDirty) {
      return 'Salve as alterações de início e fim antes de ativar — a API usa as datas já gravadas.';
    }
    if (!persistedWindowOk) {
      const now = Date.now();
      if (now < new Date(campaign.startsAt).getTime()) {
        return `Só é possível ativar a partir de ${formatDateOnly(campaign.startsAt)}.`;
      }
      return `Não é possível ativar: o período da campanha já terminou (${formatDateOnly(campaign.endsAt)}).`;
    }
    return null;
  })();

  const handleSaveChanges = async () => {
    if (!tenantId || !campaign || !hasFormChanges) return;
    setSaveLoading(true);
    setSaveError(null);
    try {
      await updateCampaign(tenantId, campaign.id, {
        name: name.trim(),
        expirationDays,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
      });
      onActionSuccess();
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Erro ao atualizar campanha.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!tenantId || !campaign || !confirm) return;
    setActionLoading(true);
    setActionError(null);
    try {
      if (confirm === 'activate') {
        await activateCampaign(tenantId, campaign.id);
        onActionSuccess();
        onClose();
      } else if (confirm === 'pause') {
        await pauseCampaign(tenantId, campaign.id);
        onActionSuccess();
        onClose();
      }
      setConfirm(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erro ao executar ação.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenChange = React.useCallback(() => {
    if (!open) return;
    onClose();
  }, [open, onClose]);

  if (!campaign) return null;

  return (
    <>
      <Dialog open={open} onClose={handleOpenChange}>
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-foreground">{campaign.name}</h2>
            <CampaignStatusBadge status={campaign.status} />
          </div>

          {saveError && (
            <StatusMessage
              message={saveError}
              variant="error"
              onDismiss={() => setSaveError(null)}
              className="mb-4"
            />
          )}

          <div className="space-y-4">
            <div>
              <label className="text-muted-foreground text-xs">Nome</label>
              {canEdit ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={saveLoading}
                  placeholder="Ex: Campanha Natal"
                  className={`${campaignInputClass} mt-1`}
                />
              ) : (
                <p className="mt-1 text-sm text-foreground">{campaign.name}</p>
              )}
            </div>
            <div>
              <label className="text-muted-foreground text-xs">Validade do voucher (dias)</label>
              {canEdit ? (
                <input
                  type="number"
                  min={1}
                  value={expirationDays}
                  onChange={(e) => setExpirationDays(parseInt(e.target.value, 10) || 0)}
                  disabled={saveLoading}
                  className={`${campaignInputClass} mt-1`}
                />
              ) : (
                <p className="mt-1 text-sm text-foreground">{campaign.expirationDays}</p>
              )}
            </div>
            <div>
              <label className="text-muted-foreground text-xs">Início</label>
              {canEdit ? (
                <input
                  type="date"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  disabled={saveLoading}
                  className={`${campaignInputClass} mt-1`}
                />
              ) : (
                <p className="mt-1 text-sm text-foreground">{formatDateOnly(campaign.startsAt)}</p>
              )}
            </div>
            <div>
              <label className="text-muted-foreground text-xs">Fim</label>
              {canEdit ? (
                <input
                  type="date"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  disabled={saveLoading}
                  className={`${campaignInputClass} mt-1`}
                />
              ) : (
                <p className="mt-1 text-sm text-foreground">{formatDateOnly(campaign.endsAt)}</p>
              )}
            </div>

            {canEdit && hasFormChanges && (
              <Button
                size="lg"
                className="w-full bg-[var(--brand-primary)] hover:opacity-90 disabled:opacity-50"
                onClick={handleSaveChanges}
                disabled={saveLoading}
              >
                {saveLoading ? 'Salvando…' : 'Salvar alterações'}
              </Button>
            )}
          </div>

          {actionError && (
            <StatusMessage
              message={actionError}
              variant="error"
              onDismiss={() => setActionError(null)}
              className="mb-4"
            />
          )}

          <div className="mt-6 pt-4 border-t border-border flex flex-wrap gap-2">
            {showActivate && (
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <Button
                  className="bg-[var(--brand-primary)] hover:opacity-90"
                  onClick={() => setConfirm('activate')}
                  disabled={actionLoading || !!activateBlockedReason}
                  title={
                    activateBlockedReason ??
                    'Ativa a campanha no período configurado (conforme datas gravadas).'
                  }
                >
                  Ativar campanha
                </Button>
                {activateBlockedReason && (
                  <p className="text-xs text-muted-foreground max-w-md">{activateBlockedReason}</p>
                )}
              </div>
            )}
            {showPauseOnly && (
              <Button
                variant="outline"
                onClick={() => setConfirm('pause')}
                disabled={actionLoading}
              >
                Pausar campanha
              </Button>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <Button variant="ghost" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={confirm === 'activate'}
        title="Ativar campanha"
        message="Tem certeza que deseja ativar esta campanha?"
        confirmLabel="Ativar"
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirm(null)}
        loading={actionLoading}
      />
      <ConfirmDialog
        open={confirm === 'pause'}
        title="Pausar campanha"
        message="Tem certeza que deseja pausar esta campanha?"
        confirmLabel="Pausar"
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirm(null)}
        loading={actionLoading}
      />
    </>
  );
}
