import * as React from 'react';
import { Button } from '@core-ui/ui';
import { Dialog } from '../../components/sales/Dialog';
import { formatCurrency, formatExpiry } from '../../utils/format';
import { redeemVoucher } from '../../api/voucher-redeem';
import { useAuth } from '../../contexts/AuthContext';
import type { VoucherByDisplayCode } from '../../types/voucher-redeem';

const inputClassName =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

interface RedeemVoucherModalProps {
  open: boolean;
  onClose: () => void;
  voucher: VoucherByDisplayCode;
  /** Código digitado na busca (fonte de verdade para o resgate). */
  displayCodeUsedForSearch: string;
  onSuccess: (newBalanceCents: number) => void;
}

/** Converte reais (string) em centavos. */
function reaisToCents(value: string): number {
  const n = parseFloat(value.replace(/,/g, '.').replace(/\s/g, ''));
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 100);
}

/** Modal: valor a resgatar, validar, POST redeem, sucesso. */
export function RedeemVoucherModal({
  open,
  onClose,
  voucher,
  displayCodeUsedForSearch,
  onSuccess,
}: RedeemVoucherModalProps) {
  const { tenantId, merchantId } = useAuth();
  const [amountReais, setAmountReais] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const balanceCents = voucher.balanceCents;
  const amountCents = reaisToCents(amountReais);
  const valid = amountCents > 0 && amountCents <= balanceCents && !!tenantId && !!merchantId;

  const handleUseFullBalance = () => {
    setAmountReais((balanceCents / 100).toFixed(2));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || !tenantId || !merchantId) return;
    setError(null);
    setSubmitting(true);
    try {
      const idempotencyKey = `redeem-${voucher.voucherId}-${Date.now()}`;
      const res = await redeemVoucher({
        tenantId,
        merchantId,
        amountCents,
        displayCode: displayCodeUsedForSearch,
        idempotencyKey,
      });
      onSuccess(res.newBalanceCents);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao resgatar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    setAmountReais('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <div className="p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">Resgatar voucher</h2>
        <dl className="mt-3 grid gap-1.5 text-sm">
          <div>
            <dt className="text-muted-foreground">Código</dt>
            <dd className="font-mono font-medium">{displayCodeUsedForSearch}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Campanha</dt>
            <dd>{voucher.campaignName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Saldo atual</dt>
            <dd className="font-semibold">{formatCurrency(balanceCents)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Expira em</dt>
            <dd>{formatExpiry(voucher.expiresAt)}</dd>
          </div>
        </dl>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="amount" className="text-sm font-medium text-foreground">
              Valor a resgatar (R$)
            </label>
            <input
              id="amount"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={amountReais}
              onChange={(e) => {
                setAmountReais(e.target.value);
                setError(null);
              }}
              className={inputClassName}
              disabled={submitting}
            />
            {amountCents > balanceCents && amountReais && (
              <p className="text-xs text-destructive">Valor não pode ser maior que o saldo.</p>
            )}
            {amountCents > 0 && amountCents < balanceCents && (
              <p className="text-xs text-muted-foreground">Máximo: {formatCurrency(balanceCents)}</p>
            )}
            {!tenantId || !merchantId ? (
              <p className="text-xs text-destructive">
                Não foi possível identificar parceiro e loja no token. Faça login novamente.
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUseFullBalance}
            disabled={submitting || balanceCents <= 0}
          >
            Usar saldo total
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" variant="brand" disabled={!valid || submitting}>
              {submitting ? 'Resgatando...' : 'Confirmar resgate'}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}

