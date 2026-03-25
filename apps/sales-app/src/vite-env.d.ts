/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** `true` só com HTTPS — ativa iframe de sessão Keycloak (logout noutro separador). */
  readonly VITE_CHECK_LOGIN_IFRAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
