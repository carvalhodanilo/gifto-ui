import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@core-ui/ui';
import { PageHeader } from '../../components/PageHeader';
import { StatusMessage } from '../../components/StatusMessage';
import { createTenant } from '../../api/system-admin-tenants';
import type { CreateTenantPayload } from '../../types/system-admin-tenant-api';
import { TenantFormFields } from '../../components/admin/TenantFormFields';

function emptyForm(): CreateTenantPayload {
  return {
    name: '',
    fantasyName: null,
    document: '',
    phone1: null,
    email: '',
    url: '',
  };
}

/**
 * System_admin: criação de parceiro (tenant na API).
 * Abas Dados bancários e Identidade visual travadas até existir ID (após salvar → edição).
 */
export function SystemAdminTenantCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = React.useState<CreateTenantPayload>(() => emptyForm());
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const setField = React.useCallback(<K extends keyof CreateTenantPayload>(key: K, value: CreateTenantPayload[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = (await createTenant({
        name: form.name,
        fantasyName: form.fantasyName ?? null,
        document: form.document.trim(),
        phone1: form.phone1 ?? null,
        email: form.email.trim(),
        url: form.url,
      })) as { tenantId?: string };
      const newId = res?.tenantId;
      if (newId) {
        navigate(`/admin/tenants/${encodeURIComponent(newId)}`, { replace: true });
      } else {
        navigate('/admin/tenants', { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar parceiro');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo parceiro"
        subtitle="Criação (system_admin)."
        action={
          <Button
            size="lg"
            variant="brand"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        }
      />

      {error && <StatusMessage message={error} variant="error" onDismiss={() => setError(null)} />}

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-4 border-b border-border">
          <nav className="flex flex-wrap items-end gap-1" aria-label="Abas do novo parceiro">
            <button
              type="button"
              className="rounded-t-lg border border-border border-b-0 bg-card px-4 py-2.5 text-sm font-medium text-[var(--brand-primary)] -mb-px"
            >
              Dados
            </button>
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-t-lg px-4 py-2.5 text-sm font-medium text-muted-foreground opacity-60"
              title="Salve o parceiro para liberar dados bancários na edição."
            >
              Dados bancários
            </button>
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-t-lg px-4 py-2.5 text-sm font-medium text-muted-foreground opacity-60"
              title="Salve o parceiro para liberar identidade visual na edição."
            >
              Identidade visual
            </button>
          </nav>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">
          As abas Dados bancários e Identidade visual ficam disponíveis após salvar, na tela de edição do parceiro (com ID).
        </p>

        <TenantFormFields
          form={form}
          setField={setField}
          readonly={saving}
          showDocument
          showPhone2={false}
        />
      </div>
    </div>
  );
}
