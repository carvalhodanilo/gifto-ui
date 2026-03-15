import * as React from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@core-ui/ui';
import { useTenant } from '../../contexts/TenantContext';
import { useCampaigns } from '../../hooks/useCampaigns';
import { issueVoucher } from '../../api/vouchers';
import { StatusMessage } from '../StatusMessage';
import { CampaignSelector } from './CampaignSelector';
import { AmountSelector } from './AmountSelector';
import { VoucherIssueSuccess } from './VoucherIssueSuccess';
import { VoucherPrintLabel } from './VoucherPrintLabel';
import { Dialog } from './Dialog';
import type { IssueVoucherResponse } from '../../types/voucher';
import type { VoucherListItem } from '../../types/voucher';

type DialogState = 'form' | 'loading' | 'success' | 'error';

interface NewVoucherDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (item: VoucherListItem) => void;
}

/**
 * Modal "Novo voucher": formulário (campanha + valor) → loading → sucesso.
 * Integração real: POST /v1/vouchers/issue. tenantId sempre do TenantContext.
 */
export function NewVoucherDialog({ open, onClose, onSuccess }: NewVoucherDialogProps) {
  const { tenant } = useTenant();
  const { campaigns, loading: campaignsLoading, error: campaignsError } = useCampaigns(
    tenant?.tenantId ?? null,
    { enabled: open }
  );
  const [state, setState] = React.useState<DialogState>('form');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [campaignId, setCampaignId] = React.useState<string | null>(null);
  const [amountCents, setAmountCents] = React.useState<number | null>(null);
  const [successData, setSuccessData] = React.useState<{
    data: IssueVoucherResponse;
    amountCents: number;
    campaignName: string;
  } | null>(null);
  const [printData, setPrintData] = React.useState<{
    shoppingName: string;
    publicToken: string;
    displayCode: string;
    amountCents: number;
    expiresAt: string;
  } | null>(null);

  const canSubmit =
    state === 'form' &&
    !!tenant?.tenantId &&
    !!campaignId &&
    amountCents !== null &&
    !campaignsLoading;

  const handleOpenChange = React.useCallback(() => {
    if (!open) return;
    onClose();
  }, [open, onClose]);

  const resetForm = React.useCallback(() => {
    setState('form');
    setErrorMessage(null);
    setCampaignId(null);
    setAmountCents(null);
    setSuccessData(null);
    setPrintData(null);
  }, []);

  const prevOpen = React.useRef(false);
  React.useEffect(() => {
    if (open && !prevOpen.current) resetForm();
    if (!open) setPrintData(null);
    prevOpen.current = open;
  }, [open, resetForm]);

  const handleIssue = async () => {
    if (!tenant?.tenantId || !campaignId || amountCents == null) return;
    setState('loading');
    setErrorMessage(null);
    try {
      const data = await issueVoucher({
        tenantId: tenant.tenantId,
        campaignId,
        amountCents,
      });
      const campaignName = campaigns.find((c) => c.id === campaignId)?.name ?? campaignId;
      const item: VoucherListItem = {
        voucherId: data.voucherId,
        displayCode: data.displayCode,
        campaignName,
        amountCents,
        issuedAt: new Date().toISOString(),
        status: 'Emitido',
      };
      onSuccess(item);
      setSuccessData({ data, amountCents, campaignName });
      setState('success');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao emitir voucher.');
      setState('error');
    }
  };

  const handleEmitAnother = () => {
    resetForm();
  };

  const handleClose = () => {
    onClose();
  };

  const handlePrint = () => {
    if (!successData || !tenant) return;
    let container = document.getElementById('voucher-print-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'voucher-print-container';
      document.body.appendChild(container);
    }
    setPrintData({
      shoppingName: tenant.name,
      publicToken: successData.data.publicToken,
      displayCode: successData.data.displayCode,
      amountCents: successData.amountCents,
      expiresAt: successData.data.expiresAt,
    });
  };

  React.useEffect(() => {
    if (!printData) return;
    const t = window.setTimeout(() => {
      window.print();
      window.setTimeout(() => setPrintData(null), 400);
    }, 200);
    return () => clearTimeout(t);
  }, [printData]);

  React.useEffect(() => {
    if (!printData) {
      const el = document.getElementById('voucher-print-container');
      if (el?.parentNode) el.parentNode.removeChild(el);
    }
  }, [printData]);

  const printContainer =
    typeof document !== 'undefined' ? document.getElementById('voucher-print-container') : null;

  return (
    <>
      {printData &&
        printContainer &&
        createPortal(
          <VoucherPrintLabel
            shoppingName={printData.shoppingName}
            publicToken={printData.publicToken}
            displayCode={printData.displayCode}
            amountCents={printData.amountCents}
            expiresAt={printData.expiresAt}
          />,
          printContainer
        )}
      <Dialog open={open} onClose={handleOpenChange}>
        {state === 'success' && successData && (
        <VoucherIssueSuccess
          data={successData.data}
          amountCents={successData.amountCents}
          campaignName={successData.campaignName}
          onPrint={handlePrint}
          onEmitAnother={handleEmitAnother}
          onClose={handleClose}
        />
      )}

      {(state === 'form' || state === 'loading' || state === 'error') && (
        <div className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Novo voucher</h2>

          {state === 'error' && errorMessage && (
            <StatusMessage
              message={errorMessage}
              variant="error"
              onDismiss={() => setState('form')}
              className="mb-4"
            />
          )}

          {campaignsError && (
            <StatusMessage message={campaignsError} variant="error" className="mb-4" />
          )}

          <div className="space-y-4">
            <CampaignSelector
              campaigns={campaigns}
              value={campaignId}
              onChange={setCampaignId}
              disabled={state === 'loading'}
              loading={campaignsLoading}
            />
            <AmountSelector
              valueCents={amountCents}
              onChange={setAmountCents}
              disabled={state === 'loading'}
            />
            <Button
              size="lg"
              className="w-full bg-[var(--brand-primary)] hover:opacity-90 disabled:opacity-50"
              onClick={handleIssue}
              disabled={!canSubmit}
            >
              {state === 'loading' ? 'Emitindo...' : 'Emitir voucher'}
            </Button>
          </div>

          <div className="mt-4 flex justify-end">
            <Button variant="ghost" onClick={handleClose}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
      </Dialog>
    </>
  );
}
