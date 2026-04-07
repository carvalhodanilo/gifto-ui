// --- Listagem paginada (GET /merchants) ---

export interface MerchantListItem {
  merchantId: string;
  fantasyName: string | null;
  status: 'ACTIVE' | 'SUSPENDED';
}

export interface MerchantsListParams {
  page?: number;
  perPage?: number;
  /** Busca por nome/nome fantasia (terms). */
  terms?: string;
  /** ACTIVE | SUSPENDED; enviar null/undefined por enquanto. */
  status?: string | null;
}

export interface MerchantsListResponse {
  currentPage: number;
  perPage: number;
  total: number;
  items: MerchantListItem[];
}

// --- Detalhes do merchant (GET /merchants/:id) ---

export interface MerchantLocation {
  street?: string | null;
  number?: string | null;
  neighborhood?: string | null;
  complement?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
}

export interface MerchantDetail {
  merchantId: string;
  name: string;
  fantasyName: string | null;
  document: string;
  email: string;
  phone1: string | null;
  phone2: string | null;
  url: string;
  /** URL pública do logo na lista de participantes da landing (GET após upload). */
  landingLogoUrl?: string | null;
  status: 'ACTIVE' | 'SUSPENDED';
  location: MerchantLocation | null;
  activeNetworkIds: string[];
  createdAt: string;
  updatedAt: string;
}

// --- Create/Update (quando o backend expor POST/PUT; preparado para refatoração) ---

/** Payload para criação de merchant (POST /merchants). Ajustar conforme contrato do backend. */
export interface CreateMerchantPayload {
  name: string;
  fantasyName?: string | null;
  document: string;
  email: string;
  phone1?: string | null;
  phone2?: string | null;
  url?: string;
  status?: 'ACTIVE' | 'SUSPENDED';
  location?: MerchantLocation | null;
}

/** Payload para atualização parcial (PUT/PATCH /merchants/:id). Ajustar conforme contrato do backend. */
export type UpdateMerchantPayload = Partial<CreateMerchantPayload>;

// --- Dados bancários (GET/PUT /merchants/:id/bank-account; endpoint separado para permissionamento) ---

export type BankAccountType = 'CHECKING' | 'SAVINGS' | 'PAYMENT';
export type PixKeyType = 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM';

/** Resposta de GET /merchants/{merchantId}/bank-account */
export interface MerchantBankAccount {
  merchantId: string;
  bankCode: string | null;
  bankName: string | null;
  branch: string | null;
  accountNumber: string | null;
  accountDigit: string | null;
  accountType: BankAccountType | null;
  holderName: string | null;
  holderDocument: string | null;
  pixKeyType: PixKeyType | null;
  pixKeyValue: string | null;
}

/** Body de PUT /merchants/{merchantId}/bank-account. accountType obrigatório. */
export interface UpdateBankAccountPayload {
  bankCode?: string;
  bankName?: string;
  branch?: string;
  accountNumber?: string;
  accountDigit?: string;
  accountType: BankAccountType;
  holderName?: string;
  holderDocument?: string;
  pixKeyType?: PixKeyType;
  pixKeyValue?: string;
}
