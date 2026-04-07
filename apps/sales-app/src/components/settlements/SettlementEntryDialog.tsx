import * as React from 'react';
import { Button } from '@core-ui/ui';
import { markEntryPaid } from '../../api/settlements';
import { Dialog } from '../sales/Dialog';
import { StatusMessage } from '../StatusMessage';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { SettlementStatusBadge } from './SettlementStatusBadge';
import type { SettlementEntry } from '../../types/settlement-api';

interface SettlementEntryDialogProps {
  open: boolean;
  onClose: () => void;
  entry: SettlementEntry | null;
  batchId: string | null;
  tenantId: string | null;
  onPaidSuccess: () => void;
}

/**
 * Modal de detalhes da entry: bruto, reversões, taxas, líquido, status.
 * Se status = PENDING, exibe botão "Dar baixa" com campo de referência de pagamento.
 */
export function SettlementEntryDialog({
  open,
  onClose,
  entry,
  batchId,
  tenantId,
  onPaidSuccess,
}: SettlementEntryDialogProps) {
  const [paymentRef, setPaymentRef] = React.useState('');
  const [paidLoading, setPaidLoading] = React.useState(false);
  const [paidError, setPaidError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (entry) {
      setPaymentRef(entry.paymentRef ?? '');
      setPaidError(null);
    }
  }, [entry]);

  const handleMarkPaid = async () => {
    if (!tenantId || !batchId || !entry || !paymentRef.trim()) return;
    setPaidLoading(true);
    setPaidError(null);
    try {
      await markEntryPaid(tenantId, batchId, entry.entryId, paymentRef.trim());
      onPaidSuccess();
      onClose();
    } catch (err) {
      setPaidError(err instanceof Error ? err.message : 'Erro ao dar baixa.');
    } finally {
      setPaidLoading(false);
    }
  };

  const handleOpenChange = React.useCallback(() => {
    if (!open) return;
    onClose();
  }, [open, onClose]);

  if (!entry) return null;

  const canMarkPaid = entry.status === 'PENDING' && batchId && tenantId;

  return (
    <Dialog open={open} onClose={handleOpenChange}>
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            {entry.merchantName ?? entry.merchantId}
          </h2>
          <SettlementStatusBadge status={entry.status} />
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bruto (redemptions)</span>
            <span className="font-medium text-foreground">{formatCurrency(entry.grossCents)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Reversões</span>
            <span className="font-medium text-foreground">
              {formatCurrency(entry.reversalsCents)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Taxas</span>
            <span className="font-medium text-foreground">{formatCurrency(entry.feesCents)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-3">
            <span className="text-foreground font-medium">Líquido</span>
            <span className="font-semibold text-foreground">{formatCurrency(entry.netCents)}</span>
          </div>
          {entry.paidAt && (
            <div className="flex justify-between text-muted-foreground">
              <span>Pago em</span>
              <span>{formatDateTime(entry.paidAt)}</span>
            </div>
          )}
          {entry.paymentRef && (
            <div className="flex justify-between text-muted-foreground">
              <span>Ref. pagamento</span>
              <span>{entry.paymentRef}</span>
            </div>
          )}
        </div>

        {canMarkPaid && (
          <>
            {paidError && (
              <StatusMessage
                message={paidError}
                variant="error"
                onDismiss={() => setPaidError(null)}
                className="mt-4"
              />
            )}
            <div className="mt-4 space-y-2">
              <label className="text-muted-foreground text-xs block">
                Referência do pagamento (ex.: PIX, boleto)
              </label>
              <input
                type="text"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                disabled={paidLoading}
                placeholder="Ex: PIX-12345678"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              />
              <Button
                size="lg"
                variant="brand"
                className="w-full disabled:opacity-50"
                onClick={handleMarkPaid}
                disabled={paidLoading || !paymentRef.trim()}
              >
                {paidLoading ? 'Salvando…' : 'Dar baixa'}
              </Button>
            </div>
          </>
        )}

        <div className="mt-6 flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
