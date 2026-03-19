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

  initPromise = getKeycloak().init({
    onLoad: 'login-required',
    pkceMethod: 'S256',
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
  // Usamos a URL base definida no env; o Keycloak valida isso via postLogoutRedirectUri.
  return keycloakConfig.appUrl;
}

