import Keycloak from 'keycloak-js';
import { keycloakConfig } from '../config/keycloak';

let keycloakInstance: Keycloak | null = null;
let initPromise: Promise<Keycloak> | null = null;
let refreshPromise: Promise<boolean> | null = null;
let refreshIntervalId: number | null = null;

function getKeycloak(): Keycloak {
  if (keycloakInstance) return keycloakInstance;
  keycloakInstance = new Keycloak({
    url: keycloakConfig.url,
    realm: keycloakConfig.realm,
    clientId: keycloakConfig.clientId,
  });
  return keycloakInstance;
}

function startAutoRefresh(kc: Keycloak): void {
  if (typeof window === 'undefined' || refreshIntervalId !== null) return;
  refreshIntervalId = window.setInterval(() => {
    void ensureFreshToken(60).catch(() => {
      // Erros de rede/refresh não devem quebrar o app em background.
    });
  }, 30_000);

  kc.onTokenExpired = () => {
    void ensureFreshToken(0).catch(() => {
      // Se o refresh falhar, o próximo 401/reload fará novo login.
    });
  };
}

export async function initKeycloak(): Promise<Keycloak> {
  if (initPromise) return initPromise;

  const checkLoginIframe = import.meta.env.VITE_CHECK_LOGIN_IFRAME === 'true';
  // PKCE S256 usa crypto.subtle (Web Crypto), só disponível em "secure context".
  // http://localhost é seguro; http://IP público não — sem isso createLoginUrl falha antes do redirect.
  const pkceMethod = globalThis.isSecureContext ? 'S256' : false;

  initPromise = getKeycloak().init({
    onLoad: 'login-required',
    pkceMethod,
    // HTTP: manter false (ou omitir VITE_CHECK_LOGIN_IFRAME) — o passo 3p-cookies usa Storage
    // Access API e falha em contexto não seguro. HTTPS: definir VITE_CHECK_LOGIN_IFRAME=true no build.
    checkLoginIframe,
  }).then(() => {
    const kc = getKeycloak();
    startAutoRefresh(kc);
    return kc;
  });

  return initPromise;
}

export async function ensureFreshToken(minValiditySeconds = 60): Promise<boolean> {
  const kc = getKeycloakInstance();
  if (!kc || !kc.authenticated) return false;

  if (refreshPromise) return refreshPromise;

  refreshPromise = kc
    .updateToken(minValiditySeconds)
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export function getAccessToken(): string | null {
  return keycloakInstance?.token ?? null;
}

export function getTokenParsed(): unknown | null {
  return keycloakInstance?.tokenParsed ?? null;
}

export function getKeycloakInstance(): Keycloak | null {
  return keycloakInstance;
}

export function logoutUrlRedirectUri(): string {
  return keycloakConfig.appUrl;
}

const LOGOUT_LANDING_KEY = 'vp-sales-logout-landing';

/** Marca retorno pós-logout para a UI mostrar “Saindo…” em vez de “Autenticando…” durante o init. */
export function markLogoutLanding(): void {
  try {
    sessionStorage.setItem(LOGOUT_LANDING_KEY, '1');
  } catch {
    /* modo privado / storage indisponível */
  }
}

export function clearLogoutLanding(): void {
  try {
    sessionStorage.removeItem(LOGOUT_LANDING_KEY);
  } catch {
    /* */
  }
}

export function isLogoutLandingPending(): boolean {
  try {
    return sessionStorage.getItem(LOGOUT_LANDING_KEY) === '1';
  } catch {
    return false;
  }
}

