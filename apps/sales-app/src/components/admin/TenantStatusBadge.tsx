const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativo',
  SUSPENDED: 'Suspenso',
  INACTIVE: 'Inativo',
};

/**
 * Badge de status do tenant.
 * Mantém consistência visual com outras listagens (ex.: CampaignStatusBadge).
 */
export function TenantStatusBadge({ status }: { status: string }) {
  const label = STATUS_LABELS[status] ?? status;
  const variant =
    status === 'ACTIVE'
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      : status === 'SUSPENDED'
        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
        : status === 'INACTIVE'
          ? 'bg-muted text-muted-foreground'
          : 'bg-muted/80 text-muted-foreground';

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variant}`}>
      {label}
    </span>
  );
}

