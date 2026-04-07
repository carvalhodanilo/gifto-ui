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

type DialogState = 'form' | 'loading' | 'success' | 'error';

interface NewVoucherDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Modal "Novo voucher": campanha, valor, nome e telefone do comprador → POST /v1/vouchers/issue.
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
  const [buyerName, setBuyerName] = React.useState('');
  const [buyerPhone, setBuyerPhone] = React.useState('');
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
    buyerName.trim().length > 0 &&
    buyerPhone.trim().length > 0 &&
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
    setBuyerName('');
    setBuyerPhone('');
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
    const name = buyerName.trim();
    const phone = buyerPhone.trim();
    if (!name || !phone) return;
    setState('loading');
    setErrorMessage(null);
    try {
      const data = await issueVoucher({
        campaignId,
        amountCents,
        buyerName: name,
        buyerPhone: phone,
      });
      const campaignName = campaigns.find((c) => c.id === campaignId)?.name ?? campaignId;
      onSuccess();
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
            <div className="space-y-1">
              <label htmlFor="voucher-buyer-name" className="text-sm font-medium text-foreground">
                Nome do comprador
              </label>
              <input
                id="voucher-buyer-name"
                type="text"
                autoComplete="name"
                placeholder="Nome completo"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                disabled={state === 'loading'}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="voucher-buyer-phone" className="text-sm font-medium text-foreground">
                Telefone do comprador
              </label>
              <input
                id="voucher-buyer-phone"
                type="tel"
                autoComplete="tel"
                placeholder="Ex: 11999990000"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                disabled={state === 'loading'}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <Button
              size="lg"
              variant="brand"
              className="w-full disabled:opacity-50"
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
