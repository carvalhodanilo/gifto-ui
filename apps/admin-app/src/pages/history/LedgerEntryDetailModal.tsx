import * as React from 'react';
import { Button } from '@core-ui/ui';
import { Dialog } from '../../components/Dialog';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { generateIdempotencyKey } from '../../utils/idempotency';
import { postReversal } from '../../api/ledger';
import { useTenant } from '../../contexts/TenantContext';
import { useMerchant } from '../../contexts/MerchantContext';
import type { LedgerEntry } from '../../types/ledger';

const TYPE_LABELS: Record<string, string> = {
  REDEEM: 'Resgate',
  REVERSAL: 'Extorno',
};

/** Lançamento com mais de 7 dias não pode ser extornado (regra de negócio). */
function isOlderThan7Days(createdAt: string): boolean {
  const created = new Date(createdAt).getTime();
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return created < sevenDaysAgo;
}

interface LedgerEntryDetailModalProps {
  open: boolean;
  onClose: () => void;
  entry: LedgerEntry | null;
  /** Chamado após extorno com sucesso: fechar modal e dar refresh na tabela. */
  onReversalSuccess?: () => void;
}

/** Modal de detalhes do lançamento; Extornar chama POST /vouchers/reversal usando ledgerEntryId. */
export function LedgerEntryDetailModal({
  open,
  onClose,
  entry,
  onReversalSuccess,
}: LedgerEntryDetailModalProps) {
  const { tenant } = useTenant();
  const { merchant } = useMerchant();
  const [reversing, setReversing] = React.useState(false);
  const [reversalError, setReversalError] = React.useState<string | null>(null);

  if (!entry) return null;

  const typeLabel = TYPE_LABELS[entry.type] ?? entry.type;
  const extornoDisabled = isOlderThan7Days(entry.createdAt);

  const handleExtornar = async () => {
    if (extornoDisabled || reversing || !tenant?.tenantId || !merchant?.merchantId) return;
    setReversalError(null);
    setReversing(true);
    const idempotencyKey = generateIdempotencyKey('reversal');
    try {
      await postReversal({
        tenantId: tenant.tenantId,
        merchantId: merchant.merchantId,
        refLedgerEntryId: entry.ledgerEntryId,
        publicToken: null,
        displayCode: entry.displayCode ?? '',
        idempotencyKey,
      });
      onReversalSuccess?.();
      onClose();
    } catch (err) {
      setReversalError(err instanceof Error ? err.message : 'Erro ao extornar');
    } finally {
      setReversing(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">Detalhes do lançamento</h2>
        <dl className="mt-3 grid gap-2 text-sm">
          <div>
            <dt className="text-muted-foreground">Tipo</dt>
            <dd className="font-medium text-foreground">{typeLabel}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Valor</dt>
            <dd className="font-medium text-foreground">{formatCurrency(entry.amountCents)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Data</dt>
            <dd className="text-foreground">{formatDateTime(entry.createdAt)}</dd>
          </div>
        </dl>
        {reversalError && (
          <p className="mt-3 text-sm text-destructive">{reversalError}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={extornoDisabled || reversing}
            onClick={handleExtornar}
            title={
              extornoDisabled
                ? 'Extorno permitido apenas para lançamentos de até 7 dias'
                : undefined
            }
          >
            {reversing ? 'Extornando...' : 'Extornar'}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={reversing}>
            Fechar
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
