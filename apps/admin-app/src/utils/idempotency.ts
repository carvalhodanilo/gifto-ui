/**
 * Gera chave única para idempotência (header Idempotency-Key).
 * Use o mesmo prefixo por tipo de operação (ex.: "redeem", "issue") e guarde a chave
 * se for reenviar a mesma operação (retry).
 */
export function generateIdempotencyKey(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/** Junta headers com Idempotency-Key para requisições que exigem idempotência. */
export function withIdempotencyKey(
  headers: Record<string, string>,
  key: string
): Record<string, string> {
  return { ...headers, 'Idempotency-Key': key };
}
