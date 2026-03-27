import { ensureFreshToken, getAccessToken } from '../auth/keycloakClient';

type HeadersRecord = Record<string, string>;

function toHeadersRecord(headers?: HeadersInit): HeadersRecord {
  if (!headers) return {};
  if (headers instanceof Headers) return Object.fromEntries(headers.entries());
  if (Array.isArray(headers)) return Object.fromEntries(headers);
  return { ...headers };
}

function withAuthorization(headers: HeadersRecord): HeadersRecord {
  if (headers.Authorization) return headers;
  const token = getAccessToken();
  if (!token) return headers;
  return { ...headers, Authorization: `Bearer ${token}` };
}

export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  await ensureFreshToken(60);
  const firstHeaders = withAuthorization(toHeadersRecord(init.headers));
  const firstResponse = await fetch(input, { ...init, headers: firstHeaders });

  if (firstResponse.status !== 401) return firstResponse;

  const refreshed = await ensureFreshToken(0);
  if (!refreshed) return firstResponse;

  const retryHeaders = withAuthorization(toHeadersRecord(init.headers));
  return fetch(input, { ...init, headers: retryHeaders });
}
