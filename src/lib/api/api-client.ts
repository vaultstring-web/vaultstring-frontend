const GATEWAY = process.env.NEXT_PUBLIC_GATEWAY_URL || '';
const API_BASE = GATEWAY ? `${GATEWAY.replace(/\/$/, '')}/api/v1` : '';

const TOKEN_KEY = 'kyd_access_token';
const USER_KEY = 'kyd_user_profile';
export function isAuthenticated() { return !!getToken(); }

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (!token) localStorage.removeItem(TOKEN_KEY); else localStorage.setItem(TOKEN_KEY, token);
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setUser(user: any | null) {
  if (typeof window === 'undefined') return;
  if (!user) localStorage.removeItem(USER_KEY); else localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const url = API_BASE ? `${API_BASE.replace(/\/$/, '')}${path.startsWith('/') ? path : '/' + path}` : path;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> || {})
  };

  const token = getToken();
  const openAuthPaths = [
    '/auth/login',
    '/auth/register',
    '/auth/password/reset',
    '/auth/password/reset/confirm',
    '/auth/verify',
    '/auth/verify/resend',
    '/auth/magic-link'
  ];
  const shouldAttachAuth = token && !headers['Authorization'] && !openAuthPaths.some(p => path.startsWith(p));
  if (shouldAttachAuth) headers['Authorization'] = `Bearer ${token}`;

  const method = String(init.method || 'GET').toUpperCase();
  const unsafe = method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';
  const requiresIdempotency = unsafe && !openAuthPaths.some(p => path.startsWith(p));
  if (requiresIdempotency && !headers['Idempotency-Key']) {
    headers['Idempotency-Key'] = generateIdempotencyKey();
  }

  let res: Response;
  let text = '';
  try {
    res = await fetch(url, { ...init, headers, credentials: 'include' });
    text = await res.text();
  } catch (_err) {
    await delay(300);
    res = await fetch(url, { ...init, headers, credentials: 'include' });
    text = await res.text();
  }
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.toLowerCase().includes('application/json');
  let data: any = null;
  if (isJson && text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const message = (data && (data.error || data.message)) || (text || res.statusText || 'API request failed');
    const err: any = new Error(String(message));
    err.status = res.status;
    err.data = data ?? text ?? null;
    throw err;
  }

  return data ?? (isJson ? null : (text || null));
}

// Small helper to simulate latency in mock mode
export function delay(ms = 500) {
  return new Promise((r) => setTimeout(r, ms));
}

function generateIdempotencyKey() {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const arr = new Uint8Array(16);
      window.crypto.getRandomValues(arr);
      return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {}
  return `web-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default { apiFetch, delay, getToken, setToken, getUser, setUser };
