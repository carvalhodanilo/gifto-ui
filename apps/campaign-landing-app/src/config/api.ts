/**
 * Base da API (sem barra final).
 *
 * Sandbox / Lightsail (este repo):
 *   `http://SEU_IP/api` — Nginx :80, location /api/ remove o prefixo e envia ao Spring (8080 só na rede Docker).
 *
 * PROD (quando configurarem):
 *   `https://seudominio.com/api` (ou o host onde o reverse proxy expõe a API).
 *   tenantId na query só para dev local; em PROD vazio + resolução por Host no backend.
 */
export function apiBaseUrl(): string {
  return (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '');
}

/**
 * Se não estiver definido, o fetch usa URL relativa e o browser chama o Vite (ex.: localhost:5175) → 404.
 */
export function apiConfigurationError(): string | null {
  const base = apiBaseUrl();
  if (!base) {
    return 'Falta VITE_API_BASE_URL no .env. Exemplo Lightsail (Nginx na porta 80): VITE_API_BASE_URL=http://SEU_IP/api — não use :8080 a partir do teu PC.';
  }
  if (!/^https?:\/\//i.test(base)) {
    return 'VITE_API_BASE_URL deve começar por http:// ou https:// (URL absoluta do backend).';
  }
  return null;
}

export function tenantIdQuery(): string | undefined {
  const id = (import.meta.env.VITE_TENANT_ID ?? '').trim();
  return id.length > 0 ? id : undefined;
}

export function publicCampaignLandingUrl(campaignId: string): string {
  const base = apiBaseUrl();
  const tenant = tenantIdQuery();
  const q = tenant ? `?tenantId=${encodeURIComponent(tenant)}` : '';
  return `${base}/public/campaign-landing/${encodeURIComponent(campaignId)}${q}`;
}
