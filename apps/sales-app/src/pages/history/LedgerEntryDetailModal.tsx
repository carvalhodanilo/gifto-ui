import * as React from 'react';
import { Button } from '@core-ui/ui';
import { Dialog } from '../../components/sales/Dialog';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { generateIdempotencyKey } from '../../utils/idempotency';
import { postReversal } from '../../api/ledger';
import { useAuth } from '../../contexts/AuthContext';
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

/** Modal de detalhes do lançamento; Extornar chama POST /v1/vouchers/reversal usando ledgerEntryId. */
export function LedgerEntryDetailModal({
  open,
  onClose,
  entry,
  onReversalSuccess,
}: LedgerEntryDetailModalProps) {
  const { tenantId, merchantId } = useAuth();
  const [reversing, setReversing] = React.useState(false);
  const [reversalError, setReversalError] = React.useState<string | null>(null);

  if (!entry) return null;

  const typeLabel = TYPE_LABELS[entry.type] ?? entry.type;
  const extornoDisabled = isOlderThan7Days(entry.createdAt);

  const handleExtornar = async () => {
    if (extornoDisabled || reversing || !tenantId || !merchantId) return;
    setReversalError(null);
    setReversing(true);
    const idempotencyKey = generateIdempotencyKey('reversal');
    try {
      await postReversal({
        tenantId,
        merchantId,
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
        {reversalError && <p className="mt-3 text-sm text-destructive">{reversalError}</p>}
        {!tenantId || !merchantId ? (
          <p className="mt-3 text-xs text-destructive">
            Não foi possível identificar parceiro e loja no token. Faça login novamente.
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={extornoDisabled || reversing || !tenantId || !merchantId}
            onClick={handleExtornar}
            title={extornoDisabled ? 'Extorno permitido apenas para lançamentos de até 7 dias' : undefined}
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

