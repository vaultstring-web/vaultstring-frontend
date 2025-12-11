const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export async function apiFetch(path: string, init: RequestInit = {}) {
  const url = API_BASE ? `${API_BASE.replace(/\/$/, '')}${path.startsWith('/') ? path : '/' + path}` : path;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> || {})
  };

  const res = await fetch(url, { ...init, headers, credentials: 'include' });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const err: any = new Error(data?.message || res.statusText || 'API request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

// Small helper to simulate latency in mock mode
export function delay(ms = 500) {
  return new Promise((r) => setTimeout(r, ms));
}

export default { apiFetch, delay };
