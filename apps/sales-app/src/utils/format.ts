/** Formata centavos em moeda BRL. */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

/** Formata ISO 8601 em data/hora curta pt-BR. */
export function formatDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** Formata ISO 8601 em data/hora para exibição de expiração. */
export function formatExpiry(iso: string): string {
  return formatDateTime(iso);
}

/** Data apenas (dd/MM/yyyy) para etiquetas/impressão. */
export function formatDateOnly(iso: string): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(iso));
  } catch {
    return iso;
  }
}
