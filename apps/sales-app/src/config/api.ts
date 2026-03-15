/**
 * Base URL da API por ambiente. Reutilizável em todo o projeto.
 *
 * Padrões:
 * - local: http://localhost:8080
 * - produção: https://meudominio (ou defina VITE_API_BASE_URL no build)
 *
 * Paths são concatenados sem barra extra (ex.: apiUrl('/tenants') → base + '/tenants').
 */
function getDefaultBaseUrl(): string {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_BASE_URL ?? 'https://meudominio';
  }
  return import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
}

let cachedBaseUrl: string | null = null;

export function getApiBaseUrl(): string {
  if (cachedBaseUrl == null) {
    cachedBaseUrl = getDefaultBaseUrl().replace(/\/$/, '');
  }
  return cachedBaseUrl;
}

/** Monta a URL completa para um path (ex.: /v1/vouchers/issue). */
export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
