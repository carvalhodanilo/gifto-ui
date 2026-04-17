import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, cn } from '@core-ui/ui';
import type { PageActionItem } from '../../components/PageActionsDropdown';
import { PageActionsDropdown } from '../../components/PageActionsDropdown';
import { PageBackControl, PageHeader } from '../../components/PageHeader';
import { StatusMessage } from '../../components/StatusMessage';
import { ImageUploadField } from '../../components/forms/ImageUploadField';
import {
  getTenantById,
  updateTenant,
  updateTenantBrandIdentity,
  uploadTenantLogo,
  getTenantBankAccount,
  updateTenantBankAccount,
} from '../../api/system-admin-tenants';
import type { SystemAdminTenantDetail, UpdateTenantPayload } from '../../types/system-admin-tenant-api';
import type {
  BankAccountType,
  PixKeyType,
  UpdateBankAccountPayload,
} from '../../types/merchant-api';
import { TenantFormFields } from '../../components/admin/TenantFormFields';
import {
  DEFAULT_TENANT_PRIMARY_COLOR,
  DEFAULT_TENANT_SECONDARY_COLOR,
} from '../../config/mock-tenant';
import { hexForColorInput, normalizeColorInput } from '../../utils/brandColors';

type TenantDetailTab = 'dados' | 'identidade' | 'bank';

const ACCOUNT_TYPE_OPTIONS: { value: BankAccountType; label: string }[] = [
  { value: 'CHECKING', label: 'Conta corrente' },
  { value: 'SAVINGS', label: 'Poupança' },
  { value: 'PAYMENT', label: 'Pagamento' },
];

const PIX_KEY_TYPE_OPTIONS: { value: PixKeyType; label: string }[] = [
  { value: 'CPF', label: 'CPF' },
  { value: 'CNPJ', label: 'CNPJ' },
  { value: 'EMAIL', label: 'E-mail' },
  { value: 'PHONE', label: 'Telefone' },
  { value: 'RANDOM', label: 'Chave aleatória' },
];

interface BankFormState {
  bankCode: string;
  bankName: string;
  branch: string;
  accountNumber: string;
  accountDigit: string;
  accountType: BankAccountType;
  holderName: string;
  holderDocument: string;
  pixKeyType: PixKeyType;
  pixKeyValue: string;
}

const emptyBankForm: BankFormState = {
  bankCode: '',
  bankName: '',
  branch: '',
  accountNumber: '',
  accountDigit: '',
  accountType: 'CHECKING',
  holderName: '',
  holderDocument: '',
  pixKeyType: 'CPF',
  pixKeyValue: '',
};

function bankFormFromTenantApi(b: {
  bankCode: string | null;
  bankName: string | null;
  branch: string | null;
  accountNumber: string | null;
  accountDigit: string | null;
  accountType: string | null;
  holderName: string | null;
  holderDocument: string | null;
  pixKeyType: string | null;
  pixKeyValue: string | null;
} | null): BankFormState {
  if (!b) return { ...emptyBankForm };
  return {
    bankCode: b.bankCode ?? '',
    bankName: b.bankName ?? '',
    branch: b.branch ?? '',
    accountNumber: b.accountNumber ?? '',
    accountDigit: b.accountDigit ?? '',
    accountType: (b.accountType ?? 'CHECKING') as BankAccountType,
    holderName: b.holderName ?? '',
    holderDocument: b.holderDocument ?? '',
    pixKeyType: (b.pixKeyType ?? 'CPF') as PixKeyType,
    pixKeyValue: b.pixKeyValue ?? '',
  };
}

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
  const [activeTab, setActiveTab] = React.useState<TenantDetailTab>('dados');
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [logoUploading, setLogoUploading] = React.useState(false);
  const [logoError, setLogoError] = React.useState<string | null>(null);
  const [brandPrimary, setBrandPrimary] = React.useState('');
  const [brandSecondary, setBrandSecondary] = React.useState('');
  const [brandColorSaving, setBrandColorSaving] = React.useState(false);
  const [brandColorError, setBrandColorError] = React.useState<string | null>(null);
  const [brandColorOk, setBrandColorOk] = React.useState(false);

  const [bankForm, setBankForm] = React.useState<BankFormState>(emptyBankForm);
  const [bankPersisted, setBankPersisted] = React.useState<BankFormState>(emptyBankForm);
  const [bankLoading, setBankLoading] = React.useState(false);
  const [bankError, setBankError] = React.useState<string | null>(null);
  const [bankSaving, setBankSaving] = React.useState(false);

  React.useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('Parceiro inválido.');
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
        setError(err instanceof Error ? err.message : 'Erro ao carregar parceiro');
        setDetail(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  React.useEffect(() => {
    setLogoFile(null);
    setLogoError(null);
    setBrandPrimary('');
    setBrandSecondary('');
    setBrandColorError(null);
    setBrandColorOk(false);
    setBankForm(emptyBankForm);
    setBankError(null);
  }, [id]);

  React.useEffect(() => {
    if (detail) {
      setBrandPrimary(detail.primaryColor ?? '');
      setBrandSecondary(detail.secondaryColor ?? '');
    }
  }, [detail]);

  React.useEffect(() => {
    if (activeTab !== 'bank' || !id) return;
    setBankLoading(true);
    setBankError(null);
    getTenantBankAccount(id)
      .then((data) => {
        const mapped = bankFormFromTenantApi(data);
        setBankPersisted(mapped);
        setBankForm(mapped);
      })
      .catch((err) => {
        setBankPersisted(emptyBankForm);
        setBankForm(emptyBankForm);
        const is404 =
          err instanceof Error && 'message' in err && String(err.message).includes('404');
        if (!is404) {
          setBankError(err instanceof Error ? err.message : 'Erro ao carregar dados bancários');
        }
      })
      .finally(() => setBankLoading(false));
  }, [activeTab, id]);

  const setField = React.useCallback(<K extends keyof UpdateTenantPayload>(key: K, value: UpdateTenantPayload[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setBankFormField = React.useCallback(<K extends keyof BankFormState>(key: K, value: BankFormState[K]) => {
    setBankForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    setError(null);
    setBankError(null);
    setLogoError(null);
    setBrandColorError(null);
    setBrandColorOk(false);
    try {
      /**
       * Salvar é GLOBAL nesta tela (Dados + Banco + Identidade visual).
       * Hoje chamamos múltiplos endpoints; no futuro devemos unificar em um único endpoint de update.
       */
      await updateTenant(id, {
        name: form.name,
        fantasyName: form.fantasyName ?? null,
        phone1: form.phone1 ?? null,
        phone2: form.phone2 ?? null,
        email: form.email,
        url: form.url,
      });

      // Banco (endpoint separado)
      const bankDirty = JSON.stringify(bankPersisted) !== JSON.stringify(bankForm);
      if (canOpenBankAndIdentity && bankDirty) {
        setBankSaving(true);
        const payload: UpdateBankAccountPayload = {
          bankCode: bankForm.bankCode || undefined,
          bankName: bankForm.bankName || undefined,
          branch: bankForm.branch || undefined,
          accountNumber: bankForm.accountNumber || undefined,
          accountDigit: bankForm.accountDigit || undefined,
          accountType: bankForm.accountType,
          holderName: bankForm.holderName || undefined,
          holderDocument: bankForm.holderDocument || undefined,
          pixKeyType: bankForm.pixKeyType || undefined,
          pixKeyValue: bankForm.pixKeyValue || undefined,
        };
        await updateTenantBankAccount(id, payload);
        const updated = await getTenantBankAccount(id);
        const mapped = bankFormFromTenantApi(updated);
        setBankPersisted(mapped);
        setBankForm(mapped);
      }

      // Identidade visual (cores)
      const primaryNormalized = normalizeColorInput(brandPrimary);
      const secondaryNormalized = normalizeColorInput(brandSecondary);
      const colorsDirty =
        (detail?.primaryColor ?? '') !== (primaryNormalized ?? '') ||
        (detail?.secondaryColor ?? '') !== (secondaryNormalized ?? '');
      if (canOpenBankAndIdentity && colorsDirty) {
        setBrandColorSaving(true);
        await updateTenantBrandIdentity(id, { primaryColor: primaryNormalized, secondaryColor: secondaryNormalized });
        setBrandColorOk(true);
      }

      // Identidade visual (logo)
      if (logoFile) {
        setLogoUploading(true);
        await uploadTenantLogo(id, logoFile);
        setLogoFile(null);
      }

      const refreshed = await getTenantById(id);
      setDetail(refreshed);
      setForm(toFormState(refreshed));
      setBrandPrimary(refreshed.primaryColor ?? '');
      setBrandSecondary(refreshed.secondaryColor ?? '');
      setIsEditing(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar parceiro';
      // Se falhar alguma etapa, preferimos mostrar erro geral (e manter formulário para o usuário tentar novamente)
      setError(msg);
    } finally {
      setSaving(false);
      setBankSaving(false);
      setBrandColorSaving(false);
      setLogoUploading(false);
    }
  };

  const currentLogoUrl = detail?.logoUrl ?? null;
  const bankReadonly = !isEditing;
  /** Enquanto carrega ou sem detalhe, não liberar abas que exigem cadastro persistido. */
  const canOpenBankAndIdentity = !loading && Boolean(detail?.id);

  React.useEffect(() => {
    if (!canOpenBankAndIdentity && (activeTab === 'bank' || activeTab === 'identidade')) {
      setActiveTab('dados');
    }
  }, [canOpenBankAndIdentity, activeTab]);

  const tenantActionItems = React.useMemo((): PageActionItem[] => {
    if (loading || !detail) return [];
    const items: PageActionItem[] = [];
    if (!isEditing) {
      items.push({ label: 'Editar', onClick: () => setIsEditing(true) });
    }
    items.push({
      label: 'Ver lojas',
      onClick: () => navigate(`/admin/tenants/${encodeURIComponent(id)}/merchants`),
    });
    return items;
  }, [
    loading,
    detail,
    isEditing,
    canOpenBankAndIdentity,
    id,
    navigate,
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parceiro"
        subtitle="Visualização e edição (system_admin)."
        back={<PageBackControl onClick={() => navigate('/admin/tenants')} />}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {!loading && (
              <>
                {isEditing && (
                  <Button
                    size="lg"
                    variant="brand"
                    onClick={handleSave}
                    disabled={saving || bankSaving || brandColorSaving || logoUploading}
                  >
                    {saving ? 'Salvando…' : 'Salvar'}
                  </Button>
                )}
                <PageActionsDropdown size="lg" items={tenantActionItems} />
              </>
            )}
          </div>
        }
      />

      {error && <StatusMessage message={error} variant="error" onDismiss={() => setError(null)} />}

      <div className="rounded-lg border border-border bg-card p-4">
        {loading ? (
          <div className="py-8 text-sm text-muted-foreground">Carregando…</div>
        ) : !detail ? (
          <div className="py-8 text-sm text-muted-foreground">Parceiro não encontrado.</div>
        ) : (
          <>
            <div className="mb-4 border-b border-border">
              <nav className="flex flex-wrap gap-1" aria-label="Abas do parceiro">
                <button
                  type="button"
                  onClick={() => setActiveTab('dados')}
                  className={cn(
                    'rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors',
                    activeTab === 'dados'
                      ? 'bg-card text-[var(--brand-primary)] border border-border border-b-0 -mb-px'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  Dados
                </button>
                <button
                  type="button"
                  disabled={!canOpenBankAndIdentity}
                  onClick={() => canOpenBankAndIdentity && setActiveTab('bank')}
                  title={
                    !canOpenBankAndIdentity
                      ? 'Disponível após o parceiro existir com identificador.'
                      : undefined
                  }
                  className={cn(
                    'rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors',
                    !canOpenBankAndIdentity && 'cursor-not-allowed opacity-50',
                    activeTab === 'bank'
                      ? 'bg-card text-[var(--brand-primary)] border border-border border-b-0 -mb-px'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  Dados bancários
                </button>
                <button
                  type="button"
                  disabled={!canOpenBankAndIdentity}
                  onClick={() => canOpenBankAndIdentity && setActiveTab('identidade')}
                  title={
                    !canOpenBankAndIdentity
                      ? 'Disponível após o parceiro existir com identificador.'
                      : undefined
                  }
                  className={cn(
                    'rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors',
                    !canOpenBankAndIdentity && 'cursor-not-allowed opacity-50',
                    activeTab === 'identidade'
                      ? 'bg-card text-[var(--brand-primary)] border border-border border-b-0 -mb-px'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  Identidade visual
                </button>
              </nav>
            </div>

            {activeTab === 'dados' && (
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
                />
              </>
            )}

            {activeTab === 'bank' && canOpenBankAndIdentity && (
              <div className="space-y-6">
                {bankError && (
                  <StatusMessage message={bankError} variant="error" onDismiss={() => setBankError(null)} />
                )}
                {bankLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--brand-primary)] border-t-transparent" />
                  </div>
                ) : (
                  <section className="rounded-lg border border-border bg-card p-4">
                    <h2 className="mb-3 text-sm font-semibold text-foreground">Conta bancária</h2>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Dados sensíveis; endpoint e permissões separados. Campos travados até clicar em Editar.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>Código do banco</label>
                        <input
                          type="text"
                          value={bankForm.bankCode}
                          onChange={(e) => setBankFormField('bankCode', e.target.value)}
                          readOnly={bankReadonly}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Nome do banco</label>
                        <input
                          type="text"
                          value={bankForm.bankName}
                          onChange={(e) => setBankFormField('bankName', e.target.value)}
                          readOnly={bankReadonly}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Agência</label>
                        <input
                          type="text"
                          value={bankForm.branch}
                          onChange={(e) => setBankFormField('branch', e.target.value)}
                          readOnly={bankReadonly}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Número da conta</label>
                        <input
                          type="text"
                          value={bankForm.accountNumber}
                          onChange={(e) => setBankFormField('accountNumber', e.target.value)}
                          readOnly={bankReadonly}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Dígito da conta</label>
                        <input
                          type="text"
                          value={bankForm.accountDigit}
                          onChange={(e) => setBankFormField('accountDigit', e.target.value)}
                          readOnly={bankReadonly}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Tipo de conta</label>
                        {bankReadonly ? (
                          <div className="mt-1 text-sm text-foreground">
                            {ACCOUNT_TYPE_OPTIONS.find((o) => o.value === bankForm.accountType)?.label ??
                              bankForm.accountType}
                          </div>
                        ) : (
                          <select
                            value={bankForm.accountType}
                            onChange={(e) =>
                              setBankFormField('accountType', e.target.value as BankAccountType)
                            }
                            className={inputClass}
                          >
                            {ACCOUNT_TYPE_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelClass}>Nome do titular</label>
                        <input
                          type="text"
                          value={bankForm.holderName}
                          onChange={(e) => setBankFormField('holderName', e.target.value)}
                          readOnly={bankReadonly}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>CPF/CNPJ do titular</label>
                        <input
                          type="text"
                          value={bankForm.holderDocument}
                          onChange={(e) => setBankFormField('holderDocument', e.target.value)}
                          readOnly={bankReadonly}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Tipo da chave PIX</label>
                        {bankReadonly ? (
                          <div className="mt-1 text-sm text-foreground">
                            {PIX_KEY_TYPE_OPTIONS.find((o) => o.value === bankForm.pixKeyType)?.label ??
                              bankForm.pixKeyType}
                          </div>
                        ) : (
                          <select
                            value={bankForm.pixKeyType}
                            onChange={(e) =>
                              setBankFormField('pixKeyType', e.target.value as PixKeyType)
                            }
                            className={inputClass}
                          >
                            {PIX_KEY_TYPE_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      <div>
                        <label className={labelClass}>Valor da chave PIX</label>
                        <input
                          type="text"
                          value={bankForm.pixKeyValue}
                          onChange={(e) => setBankFormField('pixKeyValue', e.target.value)}
                          readOnly={bankReadonly}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </section>
                )}
              </div>
            )}

            {activeTab === 'identidade' && canOpenBankAndIdentity && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Cores da marca</h3>
                  <p className="text-sm text-muted-foreground">
                    Cor principal e secundária do tema (botões, destaques). Deixe em branco para usar os
                    padrões da aplicação ({DEFAULT_TENANT_PRIMARY_COLOR} / {DEFAULT_TENANT_SECONDARY_COLOR}
                    ). Formato: #RGB ou #RRGGBB.
                  </p>
                  {brandColorOk && (
                    <StatusMessage
                      message="Cores salvas."
                      variant="success"
                      onDismiss={() => setBrandColorOk(false)}
                    />
                  )}
                  {brandColorError && (
                    <StatusMessage
                      message={brandColorError}
                      variant="error"
                      onDismiss={() => setBrandColorError(null)}
                    />
                  )}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className={labelClass} htmlFor="tenant-brand-primary">
                        Cor principal
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          id="tenant-brand-primary"
                          type="text"
                          value={brandPrimary}
                          onChange={(e) => setBrandPrimary(e.target.value)}
                          readOnly={!isEditing}
                          placeholder={`vazio = ${DEFAULT_TENANT_PRIMARY_COLOR}`}
                          className={`${inputClass} min-w-[10rem] flex-1 font-mono text-xs`}
                          autoComplete="off"
                        />
                        <input
                          type="color"
                          aria-label="Escolher cor principal"
                          className="h-9 w-12 cursor-pointer rounded border border-input bg-background p-0.5"
                          value={hexForColorInput(brandPrimary, DEFAULT_TENANT_PRIMARY_COLOR)}
                          onChange={(e) => setBrandPrimary(e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass} htmlFor="tenant-brand-secondary">
                        Cor secundária
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          id="tenant-brand-secondary"
                          type="text"
                          value={brandSecondary}
                          onChange={(e) => setBrandSecondary(e.target.value)}
                          readOnly={!isEditing}
                          placeholder={`vazio = ${DEFAULT_TENANT_SECONDARY_COLOR}`}
                          className={`${inputClass} min-w-[10rem] flex-1 font-mono text-xs`}
                          autoComplete="off"
                        />
                        <input
                          type="color"
                          aria-label="Escolher cor secundária"
                          className="h-9 w-12 cursor-pointer rounded border border-input bg-background p-0.5"
                          value={hexForColorInput(brandSecondary, DEFAULT_TENANT_SECONDARY_COLOR)}
                          onChange={(e) => setBrandSecondary(e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border-t border-border pt-6">
                  <h3 className="text-sm font-semibold text-foreground">Logo</h3>
                <p className="text-sm text-muted-foreground">
                  Logo do shopping (header e landing). Envio em arquivo; substitui a imagem anterior.
                </p>
                {currentLogoUrl && !logoFile && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Logo atual</span>
                    <div className="overflow-hidden rounded-md border border-border bg-muted/30 p-2">
                      <img
                        src={currentLogoUrl}
                        alt=""
                        className="max-h-24 object-contain"
                      />
                    </div>
                  </div>
                )}
                {logoError && (
                  <StatusMessage message={logoError} variant="error" onDismiss={() => setLogoError(null)} />
                )}
                <ImageUploadField
                  variant="tenantLogo"
                  id="tenant-logo-upload"
                  label="Nova imagem"
                  value={logoFile}
                  onChange={setLogoFile}
                  disabled={!isEditing || logoUploading}
                />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
