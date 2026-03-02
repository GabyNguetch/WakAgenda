// ─── Base URL ─────────────────────────────────────────────────────────────────
// Côté client : on utilise window.location.origin pour que new URL() fonctionne
// Côté serveur (SSR) : on utilise '' et on construit l'URL autrement
const API_BASE_URL = '';

// ─── Console logger ───────────────────────────────────────────────────────────

const METHOD_COLORS: Record<string, string> = {
  GET:    'color:#22c55e; font-weight:bold',
  POST:   'color:#3b82f6; font-weight:bold',
  PATCH:  'color:#f97316; font-weight:bold',
  DELETE: 'color:#ef4444; font-weight:bold',
};

function logRequest(method: string, url: string, body?: unknown): void {
  const style = METHOD_COLORS[method] || 'font-weight:bold';
  console.groupCollapsed(
    `%c[WakAgenda] %c${method}%c ${url}`,
    'color:#C8102E; font-weight:bold',
    style,
    'color:inherit; font-weight:normal'
  );
  console.log('%cURL', 'color:#94a3b8; font-weight:bold', url);
  if (body !== undefined) console.log('%cBody', 'color:#94a3b8; font-weight:bold', body);
  console.groupEnd();
}

function logResponse(method: string, url: string, status: number, data: unknown, durationMs: number): void {
  const ok = status >= 200 && status < 300;
  const statusStyle = ok ? 'color:#22c55e; font-weight:bold' : 'color:#ef4444; font-weight:bold';
  console.groupCollapsed(
    `%c[WakAgenda] %c${method}%c ${url} → %c${status}%c (${durationMs}ms)`,
    'color:#C8102E; font-weight:bold',
    METHOD_COLORS[method] || 'font-weight:bold',
    'color:inherit',
    statusStyle,
    'color:#64748b'
  );
  console.log('%cResponse', 'color:#94a3b8; font-weight:bold', data);
  console.groupEnd();
}

function logError(method: string, url: string, status: number, error: unknown, durationMs: number): void {
  console.groupCollapsed(
    `%c[WakAgenda] %c${method}%c ${url} → %c${status} ERROR%c (${durationMs}ms)`,
    'color:#C8102E; font-weight:bold',
    METHOD_COLORS[method] || 'font-weight:bold',
    'color:inherit',
    'color:#ef4444; font-weight:bold',
    'color:#64748b'
  );
  console.error('%cError', 'color:#ef4444; font-weight:bold', error);
  console.groupEnd();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Construit une URL absolue à partir d'un path relatif.
 * - Côté client  : window.location.origin + path  (ex: http://localhost:3000/api/v1/domains)
 * - Côté serveur : path tel quel (fetch relatif supporté par Next.js SSR)
 */
function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined | null>): string {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  const url = new URL(`${base}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.append(k, String(v));
      }
    });
  }
  return url.toString();
}

// ─── ApiClient ────────────────────────────────────────────────────────────────

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  private getHeaders(includeAuth = true): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (includeAuth) {
      const token = this.getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async get<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined | null>
  ): Promise<T> {
    const fullUrl = buildUrl(path, params as Record<string, string | number | boolean | undefined>);
    logRequest('GET', fullUrl);
    const t0 = performance.now();
    const res = await fetch(fullUrl, { headers: this.getHeaders() });
    const duration = Math.round(performance.now() - t0);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      logError('GET', fullUrl, res.status, error, duration);
      throw new Error(error?.detail || `HTTP ${res.status}`);
    }
    const data = await res.json();
    logResponse('GET', fullUrl, res.status, data, duration);
    return data;
  }

  async post<T>(path: string, body?: unknown, includeAuth = true): Promise<T> {
    const fullUrl = buildUrl(path);
    logRequest('POST', fullUrl, body);
    const t0 = performance.now();
    const res = await fetch(fullUrl, {
      method: 'POST',
      headers: this.getHeaders(includeAuth),
      body: body ? JSON.stringify(body) : undefined,
    });
    const duration = Math.round(performance.now() - t0);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      logError('POST', fullUrl, res.status, error, duration);
      throw new Error(error?.detail || `HTTP ${res.status}`);
    }
    const data = await res.json();
    logResponse('POST', fullUrl, res.status, data, duration);
    return data;
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    const fullUrl = buildUrl(path);
    logRequest('PATCH', fullUrl, body);
    const t0 = performance.now();
    const res = await fetch(fullUrl, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    const duration = Math.round(performance.now() - t0);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      logError('PATCH', fullUrl, res.status, error, duration);
      throw new Error(error?.detail || `HTTP ${res.status}`);
    }
    if (res.status === 204) {
      logResponse('PATCH', fullUrl, res.status, '(no content)', duration);
      return {} as T;
    }
    const data = await res.json();
    logResponse('PATCH', fullUrl, res.status, data, duration);
    return data;
  }

  async delete(path: string): Promise<void> {
    const fullUrl = buildUrl(path);
    logRequest('DELETE', fullUrl);
    const t0 = performance.now();
    const res = await fetch(fullUrl, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    const duration = Math.round(performance.now() - t0);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      logError('DELETE', fullUrl, res.status, error, duration);
      throw new Error(error?.detail || `HTTP ${res.status}`);
    }
    logResponse('DELETE', fullUrl, res.status, '(no content)', duration);
  }

  async postFormData<T>(path: string, formData: FormData): Promise<T> {
    const fullUrl = buildUrl(path);
    logRequest('POST', fullUrl, '(FormData – file upload)');
    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const t0 = performance.now();
    const res = await fetch(fullUrl, {
      method: 'POST',
      headers,
      body: formData,
    });
    const duration = Math.round(performance.now() - t0);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      logError('POST', fullUrl, res.status, error, duration);
      throw new Error(error?.detail || `HTTP ${res.status}`);
    }
    const data = await res.json();
    logResponse('POST', fullUrl, res.status, data, duration);
    return data;
  }

  async getBlob(
    path: string,
    params?: Record<string, string | undefined>
  ): Promise<Blob> {
    const fullUrl = buildUrl(path, params);
    logRequest('GET', fullUrl);
    const t0 = performance.now();
    const res = await fetch(fullUrl, { headers: this.getHeaders() });
    const duration = Math.round(performance.now() - t0);
    if (!res.ok) {
      logError('GET', fullUrl, res.status, 'Blob request failed', duration);
      throw new Error(`HTTP ${res.status}`);
    }
    logResponse('GET', fullUrl, res.status, '(Blob – PDF)', duration);
    return res.blob();
  }
}

export const apiClient = new ApiClient();