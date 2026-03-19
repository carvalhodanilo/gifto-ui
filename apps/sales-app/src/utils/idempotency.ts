/**
 * Gera chave única para idempotência (header Idempotency-Key).
 * Use o mesmo prefixo por tipo de operação (ex.: "redeem", "reversal").
 */
export function generateIdempotencyKey(prefix: string): string {
  // `crypto.randomUUID()` pode não existir em todos os ambientes/testes; mantemos fallback simples.
  const rnd =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? (crypto as Crypto).randomUUID()
      : Math.random().toString(36).slice(2, 11);
  return `${prefix}-${Date.now()}-${rnd}`;
}

/** Junta headers com Idempotency-Key para requisições que exigem idempotência. */
export function withIdempotencyKey(headers: Record<string, string>, key: string): Record<string, string> {
  return { ...headers, 'Idempotency-Key': key };
}

