/**
 * Extrai o slug do tenant a partir do hostname.
 * Ex.: iguatemishopping.vale-presente.com.br → "iguatemishopping"
 * localhost → "local" (fallback para desenvolvimento).
 *
 * TEMPORARIAMENTE NÃO USADO: o MVP usa config mockada (config/mock-tenant.ts).
 * Será usado quando a resolução for via GET /public/shoppings/resolve?slug=<slug>.
 */
export function getTenantSlugFromHostname(): string {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'local';
  }
  const firstPart = hostname.split('.')[0];
  return firstPart ?? 'local';
}
