import { Button } from '@core-ui/ui';
import { VoucherStatusBadge } from '../../components/sales/VoucherStatusBadge';
import { formatCurrency, formatExpiry } from '../../utils/format';
import type { VoucherByDisplayCode } from '../../types/voucher-redeem';

interface VoucherResultCardProps {
  voucher: VoucherByDisplayCode;
  /** Código digitado na busca — exibido em destaque no topo do card. */
  displayCodeUsedForSearch: string;
  onRedeem: () => void;
}

const KNOWN_STATUSES = ['ACTIVE', 'BLOCKED', 'EXPIRED', 'FULLY_REDEEMED'] as const;

/** Deriva status de exibição quando a API envia valor inválido (ex.: código no campo status). */
function normalizeStatus(voucher: VoucherByDisplayCode): string {
  if (KNOWN_STATUSES.includes(voucher.status as (typeof KNOWN_STATUSES)[number])) {
    return voucher.status;
  }
  const hasBalance = voucher.balanceCents > 0;
  const expired = voucher.expiresAt ? new Date(voucher.expiresAt) < new Date() : false;
  if (expired) return 'EXPIRED';
  if (hasBalance) return 'ACTIVE';
  return 'FULLY_REDEEMED';
}

/** Card com dados do voucher e botão Resgatar. Código em cima; status na badge (padrão sales-app). */
export function VoucherResultCard({ voucher, displayCodeUsedForSearch, onRedeem }: VoucherResultCardProps) {
  const hasBalance = voucher.balanceCents > 0;
  const displayStatus = normalizeStatus(voucher);

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-lg font-semibold text-foreground">{displayCodeUsedForSearch}</span>
        <VoucherStatusBadge status={displayStatus} />
      </div>
      <dl className="grid gap-2 text-sm">
        <div>
          <dt className="text-muted-foreground">Campanha</dt>
          <dd className="font-medium text-foreground">{voucher.campaignName}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Expira em</dt>
          <dd className="text-foreground">{formatExpiry(voucher.expiresAt)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Saldo</dt>
          <dd className="text-lg font-semibold text-foreground">{formatCurrency(voucher.balanceCents)}</dd>
        </div>
      </dl>
      {!hasBalance && (
        <p className="mt-3 text-sm text-muted-foreground">Saldo zerado; não é possível resgatar.</p>
      )}
      <div className="mt-4">
        <Button
          onClick={onRedeem}
          disabled={!hasBalance}
          className="w-full bg-[var(--brand-primary)] hover:opacity-90 sm:w-auto"
        >
          Resgatar
        </Button>
      </div>
    </div>
  );
}

