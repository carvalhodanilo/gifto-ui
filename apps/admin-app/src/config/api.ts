/**
 * Base URL da API por ambiente. Mesmo padrão do sales-app.
 * local -> http://localhost:8080 | produção -> https://meudominio
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

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
