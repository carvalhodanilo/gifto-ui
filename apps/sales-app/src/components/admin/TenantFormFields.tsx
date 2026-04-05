const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed';
const labelClass = 'text-sm font-medium text-foreground';

/** União lógica create + update: `document` só existe na criação. */
type BaseTenantForm = {
  name: string;
  fantasyName?: string | null;
  document?: string;
  email: string;
  phone1?: string | null;
  phone2?: string | null;
  url: string;
};

type TenantFormFieldsProps<T extends BaseTenantForm> = {
  form: T;
  setField: <K extends keyof T>(key: K, value: T[K]) => void;
  readonly: boolean;
  showDocument?: boolean;
  showPhone2?: boolean;
};

/**
 * Campos reutilizáveis de parceiro (tenant na API).
 * Upload de logo fica na aba "Identidade visual" na edição.
 */
export function TenantFormFields<T extends BaseTenantForm>({
  form,
  setField,
  readonly,
  showDocument = false,
  showPhone2 = false,
}: TenantFormFieldsProps<T>) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-1">
        <label className={labelClass} htmlFor="tenant-name">
          Nome (razão)
        </label>
        <input
          id="tenant-name"
          className={inputClass}
          value={form.name}
          onChange={(e) => setField('name', e.target.value as T[keyof T])}
          disabled={readonly}
        />
      </div>

      <div className="space-y-1">
        <label className={labelClass} htmlFor="tenant-fantasy">
          Nome fantasia
        </label>
        <input
          id="tenant-fantasy"
          className={inputClass}
          value={(form.fantasyName ?? '') as string}
          onChange={(e) => setField('fantasyName', (e.target.value || null) as T[keyof T])}
          disabled={readonly}
        />
      </div>

      {showDocument && (
        <div className="space-y-1">
          <label className={labelClass} htmlFor="tenant-document">
            Documento
          </label>
          <input
            id="tenant-document"
            className={inputClass}
            value={(form.document ?? '') as string}
            onChange={(e) => setField('document', e.target.value as T[keyof T])}
            disabled={readonly}
            placeholder="CPF/CNPJ..."
          />
        </div>
      )}

      <div className="space-y-1">
        <label className={labelClass} htmlFor="tenant-email">
          E-mail
        </label>
        <input
          id="tenant-email"
          type="email"
          className={inputClass}
          value={form.email}
          onChange={(e) => setField('email', e.target.value as T[keyof T])}
          disabled={readonly}
          placeholder="contato@empresa.com"
        />
      </div>

      <div className="space-y-1">
        <label className={labelClass} htmlFor="tenant-phone1">
          Telefone
        </label>
        <input
          id="tenant-phone1"
          className={inputClass}
          value={(form.phone1 ?? '') as string}
          onChange={(e) => setField('phone1', (e.target.value || null) as T[keyof T])}
          disabled={readonly}
          placeholder="(xx) xxxxx-xxxx"
        />
      </div>

      {showPhone2 && (
        <div className="space-y-1">
          <label className={labelClass} htmlFor="tenant-phone2">
            Telefone 2
          </label>
          <input
            id="tenant-phone2"
            className={inputClass}
            value={(form.phone2 ?? '') as string}
            onChange={(e) => setField('phone2', (e.target.value || null) as T[keyof T])}
            disabled={readonly}
            placeholder="(xx) xxxxx-xxxx"
          />
        </div>
      )}

      <div className="space-y-1 md:col-span-2">
        <label className={labelClass} htmlFor="tenant-url">
          URL
        </label>
        <input
          id="tenant-url"
          className={inputClass}
          value={form.url}
          onChange={(e) => setField('url', e.target.value as T[keyof T])}
          disabled={readonly}
          placeholder="https://..."
        />
      </div>
    </div>
  );
}
