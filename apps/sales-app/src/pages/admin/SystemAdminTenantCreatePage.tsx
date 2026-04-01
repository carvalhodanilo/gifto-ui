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
 * System_admin: criação de tenant.
 * UX padrão do app: salvar → voltar para listagem (como em /merchants/new).
 */
export function SystemAdminTenantCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = React.useState<CreateTenantPayload>(() => emptyForm());
  /** Logo: preview local apenas; envio ao backend em etapa futura. */
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const setField = React.useCallback(<K extends keyof CreateTenantPayload>(key: K, value: CreateTenantPayload[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // logoFile omitido de propósito até existir multipart / URL no backend
      void logoFile;
      await createTenant({
        name: form.name,
        fantasyName: form.fantasyName ?? null,
        document: form.document.trim(),
        phone1: form.phone1 ?? null,
        email: form.email.trim(),
        url: form.url,
      });
      navigate('/admin/tenants', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar tenant');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo tenant"
        subtitle="Criação (system_admin)."
        action={
          <Button
            size="lg"
            className="bg-[var(--brand-primary)] hover:opacity-90"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        }
      />

      {error && <StatusMessage message={error} variant="error" onDismiss={() => setError(null)} />}

      <div className="rounded-lg border border-border bg-card p-4">
        <TenantFormFields
          form={form}
          setField={setField}
          readonly={saving}
          showDocument
          showPhone2={false}
          logoFile={logoFile}
          onLogoChange={setLogoFile}
        />
      </div>
    </div>
  );
}

