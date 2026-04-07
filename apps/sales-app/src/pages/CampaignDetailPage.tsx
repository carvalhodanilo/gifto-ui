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
import { campaignInputClass, isoToDateInputValue } from '../components/campaigns/campaignFormStyles';
import { formatDateOnly } from '../utils/format';
import type { CampaignListItem, CreateCampaignRequest } from '../types/campaign-api';

const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed';
const labelClass = 'text-sm font-medium text-foreground';

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
  const [loading, setLoading] = React.useState(!isNew);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(isNew);
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
    if (isNew || !tenantId || !idToLoad) {
      if (isNew) setForm(emptyForm());
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
                <Button onClick={handleSave} disabled={saving || (!isNew && !canSaveEdit) || (isNew && !canSaveNew)} variant="brand">
                  {saving ? 'Salvando…' : 'Salvar'}
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

        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
          {!isNew && detail && (
            <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-border">
              <span className={labelClass}>Status</span>
              <CampaignStatusBadge status={detail.status} />
            </div>
          )}

          <div>
            <label className={labelClass} htmlFor="campaign-name">
              Nome
            </label>
            {readonlyFields ? (
              <p className="mt-1 text-sm text-foreground">{detail?.name ?? form.name}</p>
            ) : (
              <input
                id="campaign-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                disabled={saving}
                placeholder="Ex: Campanha Natal"
                className={`${inputClass} mt-1`}
              />
            )}
          </div>

          <div>
            <label className={labelClass} htmlFor="campaign-expiration">
              Validade do voucher (dias)
            </label>
            {readonlyFields ? (
              <p className="mt-1 text-sm text-foreground">{detail?.expirationDays ?? form.expirationDays}</p>
            ) : (
              <input
                id="campaign-expiration"
                type="number"
                min={1}
                value={form.expirationDays}
                onChange={(e) => setForm((f) => ({ ...f, expirationDays: parseInt(e.target.value, 10) || 0 }))}
                disabled={saving}
                className={`${inputClass} mt-1`}
              />
            )}
          </div>

          <div>
            <label className={labelClass} htmlFor="campaign-starts">
              Início
            </label>
            {readonlyFields ? (
              <p className="mt-1 text-sm text-foreground">
                {detail ? formatDateOnly(detail.startsAt) : form.startsAt}
              </p>
            ) : (
              <input
                id="campaign-starts"
                type="date"
                value={form.startsAt}
                onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                disabled={saving}
                className={`${inputClass} mt-1`}
              />
            )}
          </div>

          <div>
            <label className={labelClass} htmlFor="campaign-ends">
              Fim
            </label>
            {readonlyFields ? (
              <p className="mt-1 text-sm text-foreground">
                {detail ? formatDateOnly(detail.endsAt) : form.endsAt}
              </p>
            ) : (
              <input
                id="campaign-ends"
                type="date"
                value={form.endsAt}
                onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                disabled={saving}
                className={`${inputClass} mt-1`}
              />
            )}
          </div>

          <div className="flex items-start gap-2">
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
              className="mt-1 h-4 w-4 rounded border-input"
            />
            <label htmlFor="use-platform-landing" className={`${labelClass} cursor-pointer`}>
              Usar landing da plataforma (URL automática)
            </label>
          </div>

          <div>
            <label className={labelClass} htmlFor="campaign-external-url">
              Link da sua landing (opcional)
            </label>
            {readonlyFields ? (
              <p className="mt-1 text-sm text-foreground break-all">
                {(detail?.externalLandingUrl ?? '').trim()
                  ? detail!.externalLandingUrl
                  : 'Landing da plataforma (URL automática)'}
              </p>
            ) : (
              <input
                id="campaign-external-url"
                type="url"
                inputMode="url"
                placeholder="https://…"
                value={form.externalLandingUrl}
                onChange={(e) => setForm((f) => ({ ...f, externalLandingUrl: e.target.value }))}
                disabled={saving || form.usePlatformLanding}
                className={`${campaignInputClass} mt-1 disabled:opacity-50`}
              />
            )}
          </div>

          <ImageUploadField
            variant="campaignBanner"
            id="campaign-detail-banner"
            label="Banner da campanha (landing)"
            value={bannerFile}
            onChange={setBannerFile}
            disabled={saving || readonlyFields}
          />
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
