const defaultBaseUrl = '/api';

export type ApiClientConfig = {
  baseUrl?: string;
  getToken?: () => string | null;
  headers?: Record<string, string>;
};

export class ApiClient {
  private baseUrl: string;
  private getToken?: () => string | null;
  private headers: Record<string, string>;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl ?? defaultBaseUrl;
    this.getToken = config.getToken;
    this.headers = config.headers ?? {};
  }

  private async request<T>(
    path: string,
    options: RequestInit & { params?: Record<string, string> } = {}
  ): Promise<T> {
    const { params, ...init } = options;
    const url = new URL(path, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.headers,
      ...(init.headers as Record<string, string>),
    };
    const token = this.getToken?.();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url.toString(), { ...init, headers });
    if (!res.ok) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }
    const text = await res.text();
    return (text ? JSON.parse(text) : null) as T;
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>(path, { method: 'GET', params });
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined });
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }
}

export function createApiClient(config?: ApiClientConfig) {
  return new ApiClient(config);
}
