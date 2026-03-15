/** Classe dos inputs de formulário (criação e edição de campanha). Reutilizado para evitar duplicação. */
export const campaignInputClass =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/50';

/** Converte ISO 8601 para YYYY-MM-DD (valor de input type="date"). */
export function isoToDateInputValue(iso: string): string {
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return '';
  }
}
