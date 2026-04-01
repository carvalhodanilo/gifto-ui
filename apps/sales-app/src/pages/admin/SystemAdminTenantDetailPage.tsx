import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@core-ui/ui';
import { PageHeader } from '../../components/PageHeader';
import { StatusMessage } from '../../components/StatusMessage';
import { getTenantById, updateTenant } from '../../api/system-admin-tenants';
import type { SystemAdminTenantDetail, UpdateTenantPayload } from '../../types/system-admin-tenant-api';
import { TenantFormFields } from '../../components/admin/TenantFormFields';

type ActionMenuState = 'closed' | 'open';

const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed';
const labelClass = 'text-sm font-medium text-foreground';

function toFormState(detail: SystemAdminTenantDetail | null): UpdateTenantPayload {
  if (!detail) {
    return { name: '', fantasyName: null, phone1: null, phone2: null, email: '', url: '' };
  }
  return {
    name: detail.name,
    fantasyName: detail.fantasyName ?? null,
    phone1: detail.phone1 ?? null,
    phone2: detail.phone2 ?? null,
    email: detail.email,
    url: detail.url ?? '',
  };
}

export function SystemAdminTenantDetailPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const id = tenantId ?? '';

  const [detail, setDetail] = React.useState<SystemAdminTenantDetail | null>(null);
  const [form, setForm] = React.useState<UpdateTenantPayload>(() => toFormState(null));
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [menu, setMenu] = React.useState<ActionMenuState>('closed');
  /** Logo: preview local apenas; PATCH /tenants ainda não envia arquivo. */
  const [logoFile, setLogoFile] = React.useState<File | null>(null);

  React.useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('Tenant inválido.');
      return;
    }
    setLoading(true);
    setError(null);
    getTenantById(id)
      .then((d) => {
        setDetail(d);
        setForm(toFormState(d));
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Erro ao carregar tenant');
        setDetail(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  React.useEffect(() => {
    setLogoFile(null);
  }, [id]);

  const setField = React.useCallback(<K extends keyof UpdateTenantPayload>(key: K, value: UpdateTenantPayload[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      void logoFile;
      await updateTenant(id, {
        name: form.name,
        fantasyName: form.fantasyName ?? null,
        phone1: form.phone1 ?? null,
        phone2: form.phone2 ?? null,
        email: form.email,
        url: form.url,
      });
      const refreshed = await getTenantById(id);
      setDetail(refreshed);
      setForm(toFormState(refreshed));
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar tenant');
    } finally {
      setSaving(false);
    }
  };

  const goToMerchants = () => {
    setMenu('closed');
    navigate(`/admin/tenants/${encodeURIComponent(id)}/merchants`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tenant"
        subtitle="Visualização e edição (system_admin)."
        action={
          <div className="relative flex items-center gap-2">
            {!loading && (
              <>
                {!isEditing ? (
                  <Button
                    size="lg"
                    className="bg-[var(--brand-primary)] hover:opacity-90"
                    onClick={() => setIsEditing(true)}
                  >
                    Editar
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="bg-[var(--brand-primary)] hover:opacity-90"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Salvando…' : 'Salvar'}
                  </Button>
                )}
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setMenu((m) => (m === 'open' ? 'closed' : 'open'))}
                  aria-haspopup="menu"
                  aria-expanded={menu === 'open'}
                >
                  ⋯
                </Button>
              </>
            )}

            {menu === 'open' && (
              <div
                role="menu"
                className="absolute right-0 top-12 z-10 w-52 overflow-hidden rounded-md border border-border bg-background shadow-md"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                  onClick={goToMerchants}
                >
                  Ver merchants
                </button>
              </div>
            )}
          </div>
        }
      />

      {error && <StatusMessage message={error} variant="error" onDismiss={() => setError(null)} />}

      <div className="rounded-lg border border-border bg-card p-4">
        {loading ? (
          <div className="py-8 text-sm text-muted-foreground">Carregando…</div>
        ) : !detail ? (
          <div className="py-8 text-sm text-muted-foreground">Tenant não encontrado.</div>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className={labelClass} htmlFor="tenant-document">
                  Documento
                </label>
                <input id="tenant-document" className={inputClass} value={detail.document} disabled />
              </div>
              <div className="space-y-1">
                <label className={labelClass} htmlFor="tenant-status">
                  Status
                </label>
                <input id="tenant-status" className={inputClass} value={detail.status} disabled />
              </div>
            </div>

            <TenantFormFields
              form={form}
              setField={setField}
              readonly={!isEditing || saving}
              showDocument={false}
              showPhone2
              logoFile={logoFile}
              onLogoChange={setLogoFile}
            />
          </>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => navigate('/admin/tenants')}>
          Voltar
        </Button>
      </div>
    </div>
  );
}

