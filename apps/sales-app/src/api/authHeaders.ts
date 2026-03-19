import { getAccessToken } from '../auth/keycloakClient';

export type HeadersRecord = Record<string, string>;

export function authHeaders(headers: HeadersRecord = {}): HeadersRecord {
  const token = getAccessToken();
  if (!token) return headers;
  return { ...headers, Authorization: `Bearer ${token}` };
}

