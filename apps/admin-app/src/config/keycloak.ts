export type KeycloakConfig = {
  url: string;
  realm: string;
  clientId: string;
  appUrl: string;
};

function requiredEnv(name: string): string {
  const value = (import.meta.env as Record<string, string | undefined>)[name];
  if (!value) {
    throw new Error(`[keycloak] Missing env var ${name}`);
  }
  return value;
}

export const keycloakConfig: KeycloakConfig = {
  url: requiredEnv('VITE_KEYCLOAK_URL'),
  realm: requiredEnv('VITE_KEYCLOAK_REALM'),
  clientId: requiredEnv('VITE_KEYCLOAK_CLIENT_ID'),
  appUrl: requiredEnv('VITE_APP_URL'),
};

