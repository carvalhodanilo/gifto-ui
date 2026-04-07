/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  /** Obrigatório em sandbox (acesso por IP). Com subdomínio + host-suffix no backend, pode ficar vazio. */
  readonly VITE_TENANT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
