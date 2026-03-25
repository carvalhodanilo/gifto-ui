import Keycloak from 'keycloak-js';
import { keycloakConfig } from '../config/keycloak';

let keycloakInstance: Keycloak | null = null;
let initPromise: Promise<Keycloak> | null = null;

function getKeycloak(): Keycloak {
  if (keycloakInstance) return keycloakInstance;
  keycloakInstance = new Keycloak({
    url: keycloakConfig.url,
    realm: keycloakConfig.realm,
    clientId: keycloakConfig.clientId,
  });
  return keycloakInstance;
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
  }).then(() => getKeycloak());

  return initPromise;
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

