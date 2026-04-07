import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@core-ui/ui';
import { useTenant } from '../contexts/TenantContext';
import {
  getCampaignById,
  createCampaign,
  updateCampaign,
  activateCampaign,
  pauseCampaign,
} from '../api/campaigns';
import { PageHeader } from '../components/PageHeader';
import { StatusMessage } from '../components/StatusMessage';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ImageUploadField } from '../components/forms/ImageUploadField';
import { CampaignStatusBadge } from '../components/campaigns/CampaignStatusBadge';
import { isoToDateInputValue } from '../components/campaigns/campaignFormStyles';
import { formatDateOnly } from '../utils/format';
import type { CampaignListItem, CreateCampaignRequest } from '../types/campaign-api';

const inputClass =
  'w-full min-h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed';
const labelClass = 'text-sm font-medium text-foreground';
const sectionTitleClass = 'text-base font-semibold text-foreground border-b border-border pb-2';

type ConfirmAction = 'activate' | 'pause';

function isWithinCampaignWindow(startsAtIso: string, endsAtIso: string, nowMs: number = Date.now()): boolean {
  const start = new Date(startsAtIso).getTime();
  const end = new Date(endsAtIso).getTime();
  return nowMs >= start && nowMs <= end;
}

function isValidOptionalHttpUrl(s: string): boolean {
  const t = s.trim();
  if (!t) return true;
  try {
    const u = new URL(t);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

interface FormState {
  name: string;
  expirationDays: number;
  startsAt: string;
  endsAt: string;
  usePlatformLanding: boolean;
  externalLandingUrl: string;
}

function emptyForm(): FormState {
  return {
    name: '',
    expirationDays: 30,
    startsAt: '',
    endsAt: '',
    usePlatformLanding: true,
    externalLandingUrl: '',
  };
}

function formFromDetail(d: CampaignListItem): FormState {
  const ext = (d.externalLandingUrl ?? '').trim();
  return {
    name: d.name,
    expirationDays: d.expirationDays,
    startsAt: isoToDateInputValue(d.startsAt),
    endsAt: isoToDateInputValue(d.endsAt),
    usePlatformLanding: ext === '',
    externalLandingUrl: ext,
  };
}

function bodyFromForm(f: FormState): CreateCampaignRequest {
  const external =
    f.usePlatformLanding ? null : f.externalLandingUrl.trim() === '' ? null : f.externalLandingUrl.trim();
  return {
    name: f.name.trim(),
    expirationDays: f.expirationDays,
    startsAt: new Date(f.startsAt).toISOString(),
    endsAt: new Date(f.endsAt).toISOString(),
    externalLandingUrl: external,
  };
}

/**
 * Criação e edição de campanha em página única (padrão loja/merchant, sem abas).
 * Rotas: /campaigns/new e /campaigns/:campaignId
 */
export function CampaignDetailPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const tenantId = tenant?.tenantId ?? '';
  const isNew = campaignId === 'new';
  const idToLoad = isNew ? '' : (campaignId ?? '');

  const [detail, setDetail] = React.useState<CampaignListItem | null>(null);
  const [form, setForm] = React.useState<FormState>(() => emptyForm());
  const [loading, setLoading] = React.useState(() => Boolean(campaignId && campaignId !== 'new'));
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(() => campaignId === 'new');
  const [actionLoading, setActionLoading] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [confirm, setConfirm] = React.useState<ConfirmAction | null>(null);
  const [bannerFile, setBannerFile] = React.useState<File | null>(null);

  const isDraft = detail?.status === 'DRAFT';
  const readonlyFields = !isNew && (!isEditing || !isDraft);

  const showActivate = detail?.status === 'DRAFT' || detail?.status === 'PAUSED';
  const showPauseOnly = detail?.status === 'ACTIVE';
  const showEditButton = !isNew && isDraft && !isEditing;

  React.useEffect(() => {
    if (isNew) {
      setDetail(null);
      setForm(emptyForm());
      setIsEditing(true);
      setError(null);
      setActionError(null);
      setBannerFile(null);
      setConfirm(null);
      setLoading(false);
      return;
    }
    if (!tenantId || !idToLoad) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getCampaignById(tenantId, idToLoad)
      .then((d) => {
        setDetail(d);
        setForm(formFromDetail(d));
        setIsEditing(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Erro ao carregar campanha');
        setDetail(null);
      })
      .finally(() => setLoading(false));
  }, [tenantId, idToLoad, isNew]);

  const normalizedDetailExternal = (detail?.externalLandingUrl ?? '').trim() || null;
  const normalizedFormExternal = form.usePlatformLanding
    ? null
    : form.externalLandingUrl.trim() || null;

  const hasFormChanges =
    !!detail &&
    isDraft &&
    (form.name !== detail.name ||
      form.expirationDays !== detail.expirationDays ||
      form.startsAt !== isoToDateInputValue(detail.startsAt) ||
      form.endsAt !== isoToDateInputValue(detail.endsAt) ||
      normalizedFormExternal !== normalizedDetailExternal);

  const scheduleDirty =
    !!detail &&
    isDraft &&
    (form.startsAt !== isoToDateInputValue(detail.startsAt) ||
      form.endsAt !== isoToDateInputValue(detail.endsAt));

  const persistedWindowOk =
    !!detail && isWithinCampaignWindow(detail.startsAt, detail.endsAt);

  const activateBlockedReason = (() => {
    if (!detail || !showActivate) return null;
    if (scheduleDirty) {
      return 'Salve as alterações de início e fim antes de ativar — a API usa as datas já gravadas.';
    }
    if (!persistedWindowOk) {
      const now = Date.now();
      if (now < new Date(detail.startsAt).getTime()) {
        return `Só é possível ativar a partir de ${formatDateOnly(detail.startsAt)}.`;
      }
      return `Não é possível ativar: o período da campanha já terminou (${formatDateOnly(detail.endsAt)}).`;
    }
    return null;
  })();

  const canSaveNew =
    isNew &&
    form.name.trim() !== '' &&
    form.expirationDays >= 1 &&
    form.startsAt !== '' &&
    form.endsAt !== '' &&
    (form.usePlatformLanding || isValidOptionalHttpUrl(form.externalLandingUrl));

  const canSaveEdit =
    !isNew &&
    isEditing &&
    isDraft &&
    hasFormChanges &&
    form.name.trim() !== '' &&
    form.expirationDays >= 1 &&
    form.startsAt !== '' &&
    form.endsAt !== '' &&
    (form.usePlatformLanding || isValidOptionalHttpUrl(form.externalLandingUrl));

  const handleSave = async () => {
    if (!tenantId) return;
    if (!form.usePlatformLanding && !isValidOptionalHttpUrl(form.externalLandingUrl)) {
      setError('Informe uma URL válida (http ou https) ou deixe o campo vazio.');
      return;
    }
    setSaving(true);
    setError(null);
    void bannerFile;
    try {
      const body = bodyFromForm(form);
      if (isNew) {
        const newId = await createCampaign(tenantId, body);
        navigate(`/campaigns/${encodeURIComponent(newId)}`, { replace: true });
        return;
      }
      if (!detail) return;
      await updateCampaign(tenantId, detail.id, body);
      const updated = await getCampaignById(tenantId, detail.id);
      setDetail(updated);
      setForm(formFromDetail(updated));
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar campanha');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!tenantId || !detail || !confirm) return;
    setActionLoading(true);
    setActionError(null);
    try {
      if (confirm === 'activate') {
        await activateCampaign(tenantId, detail.id);
      } else {
        await pauseCampaign(tenantId, detail.id);
      }
      const updated = await getCampaignById(tenantId, detail.id);
      setDetail(updated);
      setForm(formFromDetail(updated));
      setConfirm(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erro ao executar ação.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--brand-primary)] border-t-transparent" />
      </div>
    );
  }

  if (!isNew && !detail && error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Campanha" />
        <StatusMessage message={error} variant="error" />
        <Button variant="outline" onClick={() => navigate('/campaigns')}>
          Voltar à listagem
        </Button>
      </div>
    );
  }

  const title = isNew ? 'Nova campanha' : detail?.name ?? 'Campanha';

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title={title}
          subtitle={
            isNew
              ? 'Preencha os dados da campanha. Você poderá ativá-la após salvar.'
              : 'Visualize ou edite os dados da campanha.'
          }
          action={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => navigate('/campaigns')}>
                Voltar
              </Button>
              {showEditButton && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="border-[var(--brand-primary)] text-[var(--brand-primary)]"
                >
                  Editar
                </Button>
              )}
              {!isNew && !isEditing && detail && showActivate && (
                <Button
                  variant="outline"
                  onClick={() => setConfirm('activate')}
                  disabled={actionLoading || !!activateBlockedReason}
                  className="border-[var(--brand-primary)] text-[var(--brand-primary)]"
                  title={activateBlockedReason ?? undefined}
                >
                  Ativar
                </Button>
              )}
              {!isNew && !isEditing && detail && showPauseOnly && (
                <Button
                  variant="outline"
                  onClick={() => setConfirm('pause')}
                  disabled={actionLoading}
                  className="border-destructive text-destructive hover:bg-destructive/10"
                >
                  Pausar
                </Button>
              )}
              {(isNew || (isEditing && isDraft)) && (
                <Button
                  onClick={handleSave}
                  disabled={saving || (!isNew && !canSaveEdit) || (isNew && !canSaveNew)}
                  variant="brand"
                >
                  {saving ? 'Salvando…' : isNew ? 'Criar campanha' : 'Salvar'}
                </Button>
              )}
            </div>
          }
        />

        {activateBlockedReason && !isEditing && showActivate && (
          <p className="text-xs text-muted-foreground max-w-xl">{activateBlockedReason}</p>
        )}

        {error && (
          <StatusMessage message={error} variant="error" onDismiss={() => setError(null)} />
        )}
        {actionError && (
          <StatusMessage message={actionError} variant="error" onDismiss={() => setActionError(null)} />
        )}

        <div className="max-w-3xl rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {!isNew && detail && (
            <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/30 px-5 py-3">
              <span className={labelClass}>Status</span>
              <CampaignStatusBadge status={detail.status} />
            </div>
          )}

          <div className="p-5 space-y-8">
            <section className="space-y-4" aria-labelledby="campaign-section-dados">
              <h2 id="campaign-section-dados" className={sectionTitleClass}>
                Dados da campanha
              </h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className={labelClass} htmlFor="campaign-name">
                    Nome da campanha
                  </label>
                  {readonlyFields ? (
                    <p className="text-sm text-foreground py-2">{(detail?.name ?? form.name) || '—'}</p>
                  ) : (
                    <input
                      id="campaign-name"
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      disabled={saving}
                      placeholder="Ex.: Campanha Natal 2026"
                      className={inputClass}
                      autoComplete="off"
                    />
                  )}
                </div>

                <div className="space-y-1.5 max-w-xs">
                  <label className={labelClass} htmlFor="campaign-expiration">
                    Validade do voucher (dias)
                  </label>
                  {readonlyFields ? (
                    <p className="text-sm text-foreground py-2">{detail?.expirationDays ?? form.expirationDays}</p>
                  ) : (
                    <input
                      id="campaign-expiration"
                      type="number"
                      min={1}
                      value={form.expirationDays}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, expirationDays: parseInt(e.target.value, 10) || 0 }))
                      }
                      disabled={saving}
                      className={inputClass}
                    />
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className={labelClass} htmlFor="campaign-starts">
                      Data de início
                    </label>
                    {readonlyFields ? (
                      <p className="text-sm text-foreground py-2">
                        {detail ? formatDateOnly(detail.startsAt) : form.startsAt || '—'}
                      </p>
                    ) : (
                      <input
                        id="campaign-starts"
                        type="date"
                        value={form.startsAt}
                        onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                        disabled={saving}
                        className={inputClass}
                      />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass} htmlFor="campaign-ends">
                      Data de fim
                    </label>
                    {readonlyFields ? (
                      <p className="text-sm text-foreground py-2">
                        {detail ? formatDateOnly(detail.endsAt) : form.endsAt || '—'}
                      </p>
                    ) : (
                      <input
                        id="campaign-ends"
                        type="date"
                        value={form.endsAt}
                        onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                        disabled={saving}
                        className={inputClass}
                      />
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4" aria-labelledby="campaign-section-landing">
              <h2 id="campaign-section-landing" className={sectionTitleClass}>
                Landing e divulgação
              </h2>
              <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <input
                    id="use-platform-landing"
                    type="checkbox"
                    checked={form.usePlatformLanding}
                    disabled={readonlyFields || saving}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        usePlatformLanding: e.target.checked,
                        externalLandingUrl: e.target.checked ? '' : f.externalLandingUrl,
                      }))
                    }
                    className="mt-1 h-4 w-4 shrink-0 rounded border-input accent-[var(--brand-primary)]"
                  />
                  <div className="space-y-1 min-w-0">
                    <label htmlFor="use-platform-landing" className={`${labelClass} cursor-pointer`}>
                      Usar landing da plataforma (URL automática)
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Desmarque se quiser informar o link da sua própria página de campanha.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass} htmlFor="campaign-external-url">
                    Link da sua landing (opcional)
                  </label>
                  {readonlyFields ? (
                    <p className="text-sm text-foreground break-all py-2">
                      {(detail?.externalLandingUrl ?? '').trim()
                        ? detail!.externalLandingUrl
                        : 'Usando a landing hospedada pela plataforma.'}
                    </p>
                  ) : (
                    <>
                      <input
                        id="campaign-external-url"
                        type="url"
                        inputMode="url"
                        placeholder="https://seusite.com/campanha"
                        value={form.externalLandingUrl}
                        onChange={(e) => setForm((f) => ({ ...f, externalLandingUrl: e.target.value }))}
                        disabled={saving || form.usePlatformLanding}
                        className={`${inputClass} ${form.usePlatformLanding ? 'opacity-50' : ''}`}
                      />
                      {!form.usePlatformLanding && (
                        <p className="text-xs text-muted-foreground">
                          Deixe em branco se ainda não tiver o link; você pode editar depois.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              <ImageUploadField
                variant="campaignBanner"
                id="campaign-detail-banner"
                label="Banner da campanha (landing)"
                value={bannerFile}
                onChange={setBannerFile}
                disabled={saving || readonlyFields}
              />
            </section>
          </div>

          {(isNew || (isEditing && isDraft)) && (
            <div className="flex flex-col gap-2 border-t border-border bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="order-2 min-h-[1.25rem] sm:order-1">
                {isNew && !canSaveNew && (
                  <p className="text-xs text-muted-foreground">
                    Informe nome, validade em dias e o período (início e fim) para criar a campanha.
                  </p>
                )}
                {!isNew && isEditing && isDraft && !canSaveEdit && (
                  <p className="text-xs text-muted-foreground">
                    Altere algum campo para habilitar salvar.
                  </p>
                )}
              </div>
              <Button
                type="button"
                className="order-1 sm:order-2 shrink-0"
                onClick={handleSave}
                disabled={saving || (!isNew && !canSaveEdit) || (isNew && !canSaveNew)}
                variant="brand"
                size="lg"
              >
                {saving ? 'Salvando…' : isNew ? 'Criar campanha' : 'Salvar alterações'}
              </Button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirm === 'activate'}
        title="Ativar campanha"
        message="Tem certeza que deseja ativar esta campanha?"
        confirmLabel="Ativar"
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirm(null)}
        loading={actionLoading}
      />
      <ConfirmDialog
        open={confirm === 'pause'}
        title="Pausar campanha"
        message="Tem certeza que deseja pausar esta campanha?"
        confirmLabel="Pausar"
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirm(null)}
        loading={actionLoading}
      />
    </>
  );
}
