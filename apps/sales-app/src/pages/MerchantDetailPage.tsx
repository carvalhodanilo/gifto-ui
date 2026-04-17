import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@core-ui/ui';
import { cn } from '@core-ui/ui';
import { useTenant } from '../contexts/TenantContext';
import {
  getMerchantById,
  createMerchant,
  updateMerchant,
  getMerchantBankAccount,
  updateMerchantBankAccount,
  activateMerchant,
  suspendMerchant,
  uploadMerchantLandingLogo,
} from '../api/merchants';
import { formatDateTime } from '../utils/format';
import type { PageActionItem } from '../components/PageActionsDropdown';
import { PageActionsDropdown } from '../components/PageActionsDropdown';
import { PageBackControl, PageHeader } from '../components/PageHeader';
import { StatusMessage } from '../components/StatusMessage';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ImageUploadField } from '../components/forms/ImageUploadField';
import type {
  MerchantDetail,
  MerchantLocation,
  CreateMerchantPayload,
  MerchantBankAccount,
  UpdateBankAccountPayload,
  BankAccountType,
  PixKeyType,
} from '../types/merchant-api';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'SUSPENDED', label: 'Suspenso' },
];

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

/** Estado do formulário editável (campos que podem ser enviados no create/update). */
interface FormState {
  name: string;
  fantasyName: string;
  document: string;
  email: string;
  phone1: string;
  phone2: string;
  url: string;
  status: 'ACTIVE' | 'SUSPENDED';
  location: MerchantLocation | null;
}

const emptyLocation: MerchantLocation = {
  street: null,
  number: null,
  neighborhood: null,
  complement: null,
  city: null,
  state: null,
  country: null,
  postalCode: null,
};

function formStateFromDetail(d: MerchantDetail | null): FormState {
  if (!d) {
    return {
      name: '',
      fantasyName: '',
      document: '',
      email: '',
      phone1: '',
      phone2: '',
      url: '',
      status: 'ACTIVE',
      location: null,
    };
  }
  const loc = d.location ?? emptyLocation;
  return {
    name: d.name,
    fantasyName: d.fantasyName ?? '',
    document: d.document,
    email: d.email,
    phone1: d.phone1 ?? '',
    phone2: d.phone2 ?? '',
    url: d.url ?? '',
    status: d.status,
    location: { ...loc },
  };
}

/** Estado do formulário da aba Dados bancários (endpoint separado para permissionamento). */
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

function bankFormFromAccount(b: MerchantBankAccount | null): BankFormState {
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

type DetailTab = 'dados' | 'bank' | 'identidade';

const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed';
const labelClass = 'text-sm font-medium text-foreground';

/**
 * Página de detalhes da loja: visualização (campos travados + botão Editar), edição e criação.
 * Rota: /merchants/new (criação) ou /merchants/:merchantId (detalhe/edição).
 * Ao salvar, redireciona para /merchants para refresh da listagem.
 * Futuro: seleção de tema por merchant pode ser adicionada nesta tela (ex.: seção "Aparência").
 */
export function MerchantDetailPage() {
  const { merchantId } = useParams<{ merchantId: string }>();
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const isNew = merchantId === 'new';

  const [detail, setDetail] = React.useState<MerchantDetail | null>(null);
  const [form, setForm] = React.useState<FormState>(() => formStateFromDetail(null));
  const [loading, setLoading] = React.useState(!isNew);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  /** No modo visualização (não é novo e não clicou em Editar), campos ficam travados. */
  const [isEditing, setIsEditing] = React.useState(isNew);

  /** Abas: Dados | Dados bancários | Identidade visual (última). Banco e identidade só após a loja ter ID. */
  const [activeTab, setActiveTab] = React.useState<DetailTab>('dados');
  const [bankForm, setBankForm] = React.useState<BankFormState>(emptyBankForm);
  const [bankLoading, setBankLoading] = React.useState(false);
  const [bankError, setBankError] = React.useState<string | null>(null);
  const [bankSaving, setBankSaving] = React.useState(false);
  /** Snapshot do backend para detectar alterações antes de salvar. */
  const [bankPersisted, setBankPersisted] = React.useState<MerchantBankAccount | null>(null);
  /** Loading do botão Desativar/Ativar (POST activate ou suspend). */
  const [statusToggling, setStatusToggling] = React.useState(false);
  /** Modal de confirmação: 'suspend' = Desativar, 'activate' = Ativar, null = fechado. */
  const [statusConfirmAction, setStatusConfirmAction] = React.useState<'suspend' | 'activate' | null>(null);
  /** Ficheiro escolhido para logo na landing (salvo via botão global). */
  const [landingLogoFile, setLandingLogoFile] = React.useState<File | null>(null);
  const [landingLogoUploading, setLandingLogoUploading] = React.useState(false);
  const [landingLogoError, setLandingLogoError] = React.useState<string | null>(null);

  const tenantId = tenant?.tenantId ?? '';
  const idToLoad = isNew ? '' : (merchantId ?? '');
  const hasSavedMerchantId = !isNew && Boolean(idToLoad);

  React.useEffect(() => {
    setLandingLogoFile(null);
    setLandingLogoError(null);
  }, [isNew, idToLoad]);

  React.useEffect(() => {
    if (isNew && (activeTab === 'bank' || activeTab === 'identidade')) {
      setActiveTab('dados');
    }
  }, [isNew, activeTab]);

  // Carregar detalhes quando não for criação
  React.useEffect(() => {
    if (isNew || !tenantId || !idToLoad) {
      if (isNew) setForm(formStateFromDetail(null));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getMerchantById(tenantId, idToLoad)
      .then((d) => {
        setDetail(d);
        setForm(formStateFromDetail(d));
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Erro ao carregar loja');
        setDetail(null);
      })
      .finally(() => setLoading(false));
  }, [tenantId, idToLoad, isNew]);

  // Carregar dados bancários ao abrir a aba (GET separado; futura permissão por aba).
  React.useEffect(() => {
    if (activeTab !== 'bank' || !tenantId || !idToLoad) return;
    setBankLoading(true);
    setBankError(null);
    getMerchantBankAccount(tenantId, idToLoad)
      .then((data) => {
        setBankPersisted(data);
        setBankForm(bankFormFromAccount(data));
      })
      .catch((err) => {
        setBankPersisted(null);
        setBankForm(emptyBankForm);
        // 404 = conta não cadastrada; exibir formulário vazio sem erro. Outros erros mostram mensagem.
        const is404 =
          err instanceof Error && 'message' in err && String(err.message).includes('404');
        if (!is404) {
          setBankError(
            err instanceof Error ? err.message : 'Erro ao carregar dados bancários'
          );
        }
      })
      .finally(() => setBankLoading(false));
  }, [activeTab, tenantId, idToLoad]);

  const setFormField = React.useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setLocationField = React.useCallback(
    (key: keyof MerchantLocation, value: string | null) => {
      setForm((prev) => ({
        ...prev,
        location: {
          ...(prev.location ?? emptyLocation),
          [key]: value ?? null,
        },
      }));
    },
    []
  );

  const handleSave = async () => {
    if (!tenantId) return;
    setSaving(true);
    setError(null);
    setLandingLogoError(null);
    const payload: CreateMerchantPayload = {
      name: form.name,
      fantasyName: form.fantasyName || null,
      document: form.document,
      email: form.email,
      phone1: form.phone1 || null,
      phone2: form.phone2 || null,
      url: form.url || '',
      status: form.status,
      location: form.location,
    };
    try {
      if (isNew) {
        await createMerchant(tenantId, payload);
        navigate('/merchants', { replace: true });
        return;
      }
      if (!detail) return;

      /**
       * Salvar é GLOBAL nesta tela (Dados + Banco + Identidade visual).
       * Hoje chamamos múltiplos endpoints; no futuro devemos unificar em um único endpoint de update.
       */
      await updateMerchant(tenantId, detail.merchantId, payload);

      // Banco (endpoint separado; não sobrescrever se não houve mudanças)
      const bankDirty = (() => {
        const persisted = bankPersisted ? bankFormFromAccount(bankPersisted) : emptyBankForm;
        return JSON.stringify(persisted) !== JSON.stringify(bankForm);
      })();
      if (hasSavedMerchantId && bankDirty) {
        setBankSaving(true);
        const bankPayload: UpdateBankAccountPayload = {
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
        await updateMerchantBankAccount(tenantId, idToLoad, bankPayload);
        const updatedBank = await getMerchantBankAccount(tenantId, idToLoad);
        setBankPersisted(updatedBank);
        setBankForm(bankFormFromAccount(updatedBank));
      }

      // Logo (endpoint separado; só enviar se tiver ficheiro)
      if (landingLogoFile) {
        setLandingLogoUploading(true);
        try {
          await uploadMerchantLandingLogo(tenantId, idToLoad, landingLogoFile);
          setLandingLogoFile(null);
        } catch (err) {
          setLandingLogoError(err instanceof Error ? err.message : 'Erro ao enviar logo');
        } finally {
          setLandingLogoUploading(false);
        }
      }

      const refreshed = await getMerchantById(tenantId, idToLoad);
      setDetail(refreshed);
      setForm(formStateFromDetail(refreshed));
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
      setBankSaving(false);
    }
  };

  const setBankFormField = React.useCallback(<K extends keyof BankFormState>(
    key: K,
    value: BankFormState[K]
  ) => {
    setBankForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  /** Chamado ao confirmar no modal: executa activate ou suspend e recarrega detalhes. */
  const handleStatusToggleConfirm = async () => {
    if (!tenantId || !idToLoad || statusConfirmAction === null) return;
    setStatusToggling(true);
    setError(null);
    try {
      if (statusConfirmAction === 'suspend') {
        await suspendMerchant(tenantId, idToLoad);
      } else {
        await activateMerchant(tenantId, idToLoad);
      }
      const updated = await getMerchantById(tenantId, idToLoad);
      setDetail(updated);
      setForm(formStateFromDetail(updated));
      setStatusConfirmAction(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar status');
    } finally {
      setStatusToggling(false);
    }
  };

  const readonly = !isEditing;
  const bankReadonly = !isEditing;

  const merchantActionItems = React.useMemo((): PageActionItem[] => {
    const items: PageActionItem[] = [];
    if (!isNew && !isEditing && detail) {
      items.push({ label: 'Editar', onClick: () => setIsEditing(true) });
      if (detail.status === 'ACTIVE') {
        items.push({
          label: 'Desativar',
          onClick: () => setStatusConfirmAction('suspend'),
          disabled: statusToggling,
          destructive: true,
        });
      } else {
        items.push({
          label: 'Ativar',
          onClick: () => setStatusConfirmAction('activate'),
          disabled: statusToggling,
        });
      }
    }
    return items;
  }, [isNew, isEditing, detail, statusToggling]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--brand-primary)] border-t-transparent" />
      </div>
    );
  }

  // Loja não encontrada (ex.: 404)
  if (!isNew && !detail && error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Detalhes da loja"
          back={<PageBackControl onClick={() => navigate('/merchants')} />}
        />
        <StatusMessage message={error} variant="error" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isNew ? 'Nova loja' : 'Detalhes da loja'}
        subtitle={
          isNew
            ? 'Preencha os dados para cadastrar uma nova loja.'
            : 'Visualize ou edite os dados da loja e a identidade visual na landing.'
        }
        back={<PageBackControl onClick={() => navigate('/merchants')} />}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {(isEditing || isNew) && (
              <Button onClick={handleSave} disabled={saving || bankSaving || landingLogoUploading} variant="brand">
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            )}
            <PageActionsDropdown items={merchantActionItems} />
          </div>
        }
      />

      {error && (
        <StatusMessage message={error} variant="error" onDismiss={() => setError(null)} />
      )}

      <div className="border-b border-border">
        <nav className="flex flex-wrap gap-1" aria-label="Abas do detalhe da loja">
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
            Dados da loja
          </button>
          <button
            type="button"
            disabled={isNew}
            title={
              isNew
                ? 'Salve a loja na aba Dados para obter um cadastro e liberar dados bancários.'
                : undefined
            }
            onClick={() => !isNew && setActiveTab('bank')}
            className={cn(
              'rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors',
              isNew && 'cursor-not-allowed opacity-50',
              activeTab === 'bank'
                ? 'bg-card text-[var(--brand-primary)] border border-border border-b-0 -mb-px'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            Dados bancários
          </button>
          <button
            type="button"
            disabled={isNew}
            title={
              isNew
                ? 'Salve a loja na aba Dados para obter um cadastro e liberar identidade visual.'
                : undefined
            }
            onClick={() => !isNew && setActiveTab('identidade')}
            className={cn(
              'rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors',
              isNew && 'cursor-not-allowed opacity-50',
              activeTab === 'identidade'
                ? 'bg-card text-[var(--brand-primary)] border border-border border-b-0 -mb-px'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            Identidade visual
          </button>
        </nav>
      </div>
      {isNew && (
        <p className="text-xs text-muted-foreground">
          Dados bancários e Identidade visual ficam disponíveis após salvar a loja (quando ela tiver ID).
        </p>
      )}

      {activeTab === 'dados' && (
        <>
      {/* Identificação */}
      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Identificação</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Razão social</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setFormField('name', e.target.value)}
              readOnly={readonly}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Nome fantasia</label>
            <input
              type="text"
              value={form.fantasyName}
              onChange={(e) => setFormField('fantasyName', e.target.value)}
              readOnly={readonly}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Documento (CPF/CNPJ)</label>
            <input
              type="text"
              value={form.document}
              onChange={(e) => setFormField('document', e.target.value)}
              readOnly={readonly}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <div className="mt-1 text-sm text-foreground">
              {STATUS_OPTIONS.find((o) => o.value === form.status)?.label ?? form.status}
            </div>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Contato</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>E-mail</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setFormField('email', e.target.value)}
              readOnly={readonly}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>URL</label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => setFormField('url', e.target.value)}
              readOnly={readonly}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Telefone 1</label>
            <input
              type="text"
              value={form.phone1}
              onChange={(e) => setFormField('phone1', e.target.value)}
              readOnly={readonly}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Telefone 2</label>
            <input
              type="text"
              value={form.phone2}
              onChange={(e) => setFormField('phone2', e.target.value)}
              readOnly={readonly}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Endereço */}
      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Endereço</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Logradouro</label>
            <input
              type="text"
              value={form.location?.street ?? ''}
              onChange={(e) => setLocationField('street', e.target.value || null)}
              readOnly={readonly}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Número</label>
            <input
              type="text"
              value={form.location?.number ?? ''}
              onChange={(e) => setLocationField('number', e.target.value || null)}
              readOnly={readonly}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Bairro</label>
            <input
              type="text"
              value={form.location?.neighborhood ?? ''}
              onChange={(e) => setLocationField('neighborhood', e.target.value || null)}
              readOnly={readonly}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Complemento</label>
            <input
              type="text"
              value={form.location?.complement ?? ''}
              onChange={(e) => setLocationField('complement', e.target.value || null)}
              readOnly={readonly}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Cidade</label>
            <input
              type="text"
              value={form.location?.city ?? ''}
              onChange={(e) => setLocationField('city', e.target.value || null)}
              readOnly={readonly}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Estado (UF)</label>
            <input
              type="text"
              value={form.location?.state ?? ''}
              onChange={(e) => setLocationField('state', e.target.value || null)}
              readOnly={readonly}
              className={inputClass}
              maxLength={2}
            />
          </div>
          <div>
            <label className={labelClass}>País</label>
            <input
              type="text"
              value={form.location?.country ?? ''}
              onChange={(e) => setLocationField('country', e.target.value || null)}
              readOnly={readonly}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>CEP</label>
            <input
              type="text"
              value={form.location?.postalCode ?? ''}
              onChange={(e) => setLocationField('postalCode', e.target.value || null)}
              readOnly={readonly}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Metadados (somente leitura quando existir detail) */}
      {!isNew && detail && (
        <section className="rounded-lg border border-border bg-muted/30 p-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Metadados</h2>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>Criado em: {formatDateTime(detail.createdAt)}</span>
            <span>Atualizado em: {formatDateTime(detail.updatedAt)}</span>
            {detail.activeNetworkIds?.length > 0 && (
              <span>Redes ativas: {detail.activeNetworkIds.length}</span>
            )}
          </div>
        </section>
      )}
        </>
      )}

      {activeTab === 'bank' && hasSavedMerchantId && (
        <div className="space-y-6">
          {bankError && activeTab === 'bank' && (
            <StatusMessage
              message={bankError}
              variant="error"
              onDismiss={() => setBankError(null)}
            />
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

      {activeTab === 'identidade' && hasSavedMerchantId && (
        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Identidade visual (landing)</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Logo da loja na lista de participantes na landing. Ao salvar, a imagem escolhida substitui
            a anterior.
          </p>
          {detail?.landingLogoUrl && !landingLogoFile && (
            <div className="mb-4 space-y-2">
              <span className="text-sm font-medium text-foreground">Logo atual</span>
              <div className="overflow-hidden rounded-md border border-border bg-muted/30 p-2">
                <img src={detail.landingLogoUrl} alt="" className="max-h-24 object-contain" />
              </div>
            </div>
          )}
          {landingLogoError && (
            <StatusMessage
              message={landingLogoError}
              variant="error"
              onDismiss={() => setLandingLogoError(null)}
              className="mb-4"
            />
          )}
          <ImageUploadField
            variant="merchantLogo"
            id="merchant-landing-logo"
            label="Nova imagem"
            value={landingLogoFile}
            onChange={setLandingLogoFile}
            disabled={readonly || landingLogoUploading}
          />
        </section>
      )}

      <ConfirmDialog
        open={statusConfirmAction !== null}
        title={statusConfirmAction === 'suspend' ? 'Desativar loja?' : 'Ativar loja?'}
        message={
          statusConfirmAction === 'suspend'
            ? 'A loja deixará de estar ativa. Você pode ativá-la novamente depois.'
            : 'A loja voltará a ficar ativa.'
        }
        confirmLabel={statusConfirmAction === 'suspend' ? 'Desativar' : 'Ativar'}
        onConfirm={handleStatusToggleConfirm}
        onCancel={() => setStatusConfirmAction(null)}
        loading={statusToggling}
      />
    </div>
  );
}
