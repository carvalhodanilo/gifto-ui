const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Rascunho',
  ACTIVE: 'Ativo',
  BLOCKED: 'Bloqueado',
  EXPIRED: 'Expirado',
  FULLY_REDEEMED: 'Resgatado',
};

/**
 * Badge de status do voucher (DRAFT, ACTIVE, BLOCKED, EXPIRED, FULLY_REDEEMED).
 * Mesmo padrão de layout e cores de CampaignStatusBadge e SettlementStatusBadge.
 */
export function VoucherStatusBadge({ status }: { status: string }) {
  const label = STATUS_LABELS[status] ?? status;
  const variant =
    status === 'ACTIVE'
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      : status === 'FULLY_REDEEMED'
        ? 'bg-muted text-muted-foreground'
        : status === 'EXPIRED'
          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
          : status === 'BLOCKED'
            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
            : 'bg-muted/80 text-muted-foreground'; // DRAFT ou desconhecido
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variant}`}
    >
      {label}
    </span>
  );
}
