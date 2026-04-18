/**
 * Landing pública da campanha (QR do voucher).
 *
 * --- Ambiente local / sandbox ---
 * - VITE_API_BASE_URL: URL absoluta do Spring. Em Lightsail (este repo): http://SEU_IP/api (Nginx :80,
 *   prefixo /api; não uses :8080 a partir do teu PC → firewall).
 * - VITE_TENANT_ID: UUID do tenant quando acedes por localhost (Host não tem subdomínio do shopping).
 *
 * --- PROD (a definir quando publicarem) ---
 * - VITE_API_BASE_URL: mesmo esquema em HTTPS, ex. https://app.seudominio.com/api (ou o host onde o
 *   Nginx expõe a API).
 * - VITE_TENANT_ID: vazio; resolver o tenant pelo Host (subdomínio) no backend — configurar no Spring
 *   app.public-landing.host-suffix e public_slug na BD (ver migração V9 e PublicTenantResolver).
 * - CORS: acrescentar em application-lightsail.yaml (ou perfil prod) a origem exata da landing
 *   (ex. https://campanhas.seudominio.com), além de localhost se ainda desenvolverem contra PROD.
 * - Servir o build (npm run build:campaign) no Nginx (path dedicado ou subdomínio) com fallback SPA.
 */
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { OFFICIAL_BRAND_PALETTE } from '@core-ui/ui';
import { apiConfigurationError, publicCampaignLandingUrl, tenantIdQuery } from '../config/api';
import { CampaignPageLoader } from '../components/CampaignPageLoader';
import { parseTenantHex } from '../lib/tenantTheme';
import type { PublicCampaignLanding } from '../types/publicCampaign';

const FETCH_TIMEOUT_MS = 25_000;

function formatRange(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const dtf = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  return `${dtf.format(start)} — ${dtf.format(end)}`;
}

function statusLabel(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'Em andamento';
    case 'PAUSED':
      return 'Pausada';
    case 'ENDED':
      return 'Encerrada';
    default:
      return status;
  }
}

export function CampaignLandingPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [data, setData] = useState<PublicCampaignLanding | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const needsTenantId = useMemo(() => tenantIdQuery() === undefined, []);

  useEffect(() => {
    if (!campaignId) {
      setError('Campanha inválida.');
      setLoading(false);
      return;
    }

    const configErr = apiConfigurationError();
    if (configErr) {
      setError(configErr);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      try {
        const url = publicCampaignLandingUrl(campaignId);
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        const text = await res.text();
        let body: { message?: string } | PublicCampaignLanding = {};
        try {
          body = text ? (JSON.parse(text) as typeof body) : {};
        } catch {
          setError('Resposta inválida da API.');
          return;
        }
        if (!res.ok) {
          const msg =
            typeof body === 'object' && body && 'message' in body && body.message
              ? String(body.message)
              : `Erro ${res.status}`;
          setError(msg);
          return;
        }
        if (cancelled) return;
        setData(body as PublicCampaignLanding);
      } catch (e: unknown) {
        if (cancelled) return;
        if (e instanceof DOMException && e.name === 'AbortError') {
          setError(
            'Tempo esgotado ao contactar a API. No deploy Lightsail deste projeto a API está na porta 80 com prefixo /api (ex.: VITE_API_BASE_URL=http://SEU_IP/api). A porta 8080 do Spring não costuma estar aberta no firewall — http://IP:8080 dá timeout. Confirme também CORS para http://localhost:* se o Vite corre localmente.'
          );
          return;
        }
        setError(
          'Não foi possível obter resposta da API. Se viste timeout antes: use VITE_API_BASE_URL=http://SEU_IP/api (Lightsail). Se a consola mostra CORS, o backend precisa de allowed-origin-patterns com http://localhost:* .'
        );
      } finally {
        window.clearTimeout(timeoutId);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  if (loading) {
    return <CampaignPageLoader />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-brand-muted px-6 text-center">
        <div className="max-w-md rounded-2xl border border-black/10 bg-brand-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-brand-navy">Algo deu errado</h1>
          <p className="mt-3 text-sm leading-relaxed text-brand-soft">{error}</p>
          {needsTenantId && (
            <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 ring-1 ring-amber-200/80">
              Dica: em sandbox, defina <code className="rounded bg-brand-muted px-1">VITE_TENANT_ID</code> no{' '}
              <code className="rounded bg-brand-muted px-1">.env</code> com o UUID do shopping.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  /** Cores da API com fallback na paleta oficial (`@core-ui/ui`). */
  const accentPrimary =
    parseTenantHex(data.tenant.primaryBrandColor) ?? OFFICIAL_BRAND_PALETTE.navy;
  const accentSecondary =
    parseTenantHex(data.tenant.secondaryBrandColor) ?? OFFICIAL_BRAND_PALETTE.cyan;

  return (
    <div className="min-h-screen bg-brand-muted pb-16 text-brand-navy">
      <header className="border-b border-black/10 bg-brand-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <p className="truncate text-sm font-semibold text-brand-navy">{data.tenant.displayName}</p>
          <span
            className="shrink-0 rounded-full px-3 py-1 text-xs font-medium text-brand-navy ring-1 ring-black/5"
            style={{
              backgroundColor: `${accentPrimary}2a`,
              boxShadow: `inset 0 0 0 1px ${accentPrimary}40`,
            }}
          >
            {statusLabel(data.campaign.status)}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-6 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-brand-white shadow-sm ring-1 ring-black/5">
          {data.campaign.bannerUrl ? (
            <div className="relative aspect-[3/1] w-full bg-brand-muted">
              <img
                src={data.campaign.bannerUrl}
                alt=""
                className="h-full w-full object-cover"
                loading="eager"
                decoding="async"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-muted/95 via-brand-muted/25 to-transparent"
                aria-hidden
              />
            </div>
          ) : (
            <div
              className="flex aspect-[3/1] w-full items-end justify-start p-6"
              style={{
                backgroundImage: `linear-gradient(135deg, ${accentPrimary}35 0%, transparent 55%), linear-gradient(to bottom right, ${OFFICIAL_BRAND_PALETTE.grayLight}, ${OFFICIAL_BRAND_PALETTE.white})`,
              }}
            >
              <h1 className="text-2xl font-bold tracking-tight text-brand-navy drop-shadow-sm sm:text-3xl">
                {data.campaign.name}
              </h1>
            </div>
          )}

          <div className="space-y-4 p-5 sm:p-7">
            {data.campaign.bannerUrl && (
              <h1
                className="text-2xl font-bold tracking-tight text-brand-navy sm:text-3xl"
                style={{
                  borderLeftWidth: 4,
                  borderLeftColor: accentPrimary,
                  paddingLeft: '0.75rem',
                }}
              >
                {data.campaign.name}
              </h1>
            )}

            <dl className="grid gap-3 rounded-xl border border-black/10 bg-brand-white/90 p-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-brand-soft">Período da campanha</dt>
                <dd className="mt-1 text-sm font-medium text-brand-navy">
                  {formatRange(data.campaign.startsAt, data.campaign.endsAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-brand-soft">
                  Validade do voucher (dias)
                </dt>
                <dd className="mt-1 text-sm font-medium text-brand-navy">{data.campaign.expirationDays} dias</dd>
              </div>
            </dl>
          </div>
        </div>

        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between gap-4 border-b border-black/10 pb-2">
            <h2
              className="border-l-4 pl-3 text-lg font-semibold text-brand-navy"
              style={{ borderColor: accentPrimary }}
            >
              Lojas participantes
            </h2>
            <span className="text-xs text-brand-soft">{data.stores.length} loja(s)</span>
          </div>

          {data.stores.length === 0 ? (
            <p className="rounded-xl border border-dashed border-black/15 bg-brand-white px-4 py-8 text-center text-sm text-brand-soft">
              Nenhuma loja listada para esta campanha.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {data.stores.map((s) => (
                <li
                  key={s.merchantId}
                  className="flex items-center gap-3 rounded-xl border border-black/10 bg-brand-white p-3 shadow-sm transition hover:border-black/20 hover:shadow"
                >
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-muted ring-1 ring-black/10"
                    style={{ boxShadow: `inset 0 0 0 1px ${accentSecondary}35` }}
                  >
                    {s.landingLogoUrl ? (
                      <img
                        src={s.landingLogoUrl}
                        alt=""
                        className="h-full w-full object-contain p-1"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-brand-soft/70" aria-hidden>
                        {s.displayName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-brand-navy">{s.displayName}</p>
                    {s.city && <p className="truncate text-xs text-brand-soft">{s.city}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
