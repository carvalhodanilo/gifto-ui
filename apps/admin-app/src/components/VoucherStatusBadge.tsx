const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativo',
  BLOCKED: 'Bloqueado',
  EXPIRED: 'Expirado',
  FULLY_REDEEMED: 'Resgatado',
};

/** Badge de status do voucher (ACTIVE, BLOCKED, EXPIRED, FULLY_REDEEMED). */
export function VoucherStatusBadge({ status }: { status: string }) {
  const label = STATUS_LABELS[status] ?? status;
  const variant =
    status === 'ACTIVE'
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      : status === 'BLOCKED'
        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
        : status === 'EXPIRED'
          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
          : status === 'FULLY_REDEEMED'
            ? 'bg-muted text-muted-foreground'
            : 'bg-muted text-muted-foreground';

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variant}`}
    >
      {label}
    </span>
  );
}
