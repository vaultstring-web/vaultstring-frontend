const GATEWAY = typeof window === 'undefined' 
  ? (process.env.GATEWAY_INTERNAL_URL || process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://127.0.0.1:9000')
  : ''; // Client-side uses relative path via Next.js rewrites

const API_BASE = typeof window === 'undefined'
  ? `${GATEWAY.replace(/\/$/, '')}/api/v1`
  : '/api/v1';

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

const DEVICE_ID_KEY = 'kyd_device_id';
export function getDeviceId() {
  if (typeof window === 'undefined') return '';
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID ? crypto.randomUUID() : `web-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

const COUNTRY_CODE_KEY = 'kyd_device_country';
export async function getDeviceCountry(): Promise<string> {
  if (typeof window === 'undefined') return '';
  let country = localStorage.getItem(COUNTRY_CODE_KEY);
  if (country) return country;
  
  try {
    // Attempt to fetch from a free IP-to-Country service
    // Note: In production, this should be done via a backend proxy to avoid rate limits/CORS issues
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const data = await res.json();
      if (data && data.country_code) {
        country = data.country_code;
        localStorage.setItem(COUNTRY_CODE_KEY, country!);
        return country!;
      }
    }
  } catch (e) {
    // console.warn("Failed to fetch device country", e);
  }
  return '';
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const url = API_BASE ? `${API_BASE.replace(/\/$/, '')}${path.startsWith('/') ? path : '/' + path}` : path;

  const headers: Record<string, string> = {
    'X-Device-ID': getDeviceId(),
    ...(init.headers as Record<string, string> || {})
  };

  // Only set Content-Type to application/json if not sending FormData
  if (!(init.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

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

  // CSRF Handling
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(new RegExp('(^| )csrf_token=([^;]+)'));
    const csrfToken = match ? match[2] : null;
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
  }

  const method = String(init.method || 'GET').toUpperCase();
  const unsafe = method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';
  const requiresIdempotency = unsafe && !openAuthPaths.some(p => path.startsWith(p));
  if (requiresIdempotency && !headers['Idempotency-Key']) {
    const key = generateIdempotencyKey();
    console.log(`[DEBUG-FIX] Generated NEW Idempotency-Key for ${method} ${path}: ${key}`);
    headers['Idempotency-Key'] = key;
  }
  
  // DEBUG: Trace API calls
  if (path.includes('/payments/initiate')) {
    console.log(`[DEBUG-FIX] Initiating Payment Call: ${method} ${path}`);
    console.log(`[DEBUG-FIX] Idempotency-Key: ${headers['Idempotency-Key'] || 'NONE'}`);
    console.log(`[DEBUG-FIX] Payload:`, init.body);
  }

  if (unsafe) {
    const csrf = getCsrfToken();
    if (csrf) headers['X-CSRF-Token'] = csrf;
  }

  let res: Response;
  let text = '';
  try {
    res = await fetch(url, { 
      ...init, 
      headers, 
      credentials: 'include',
      mode: 'cors',
    });
    text = await res.text();
  } catch (err) {
    console.error('API fetch error:', err, 'URL:', url);
    console.error('API fetch error details:', {
        message: err instanceof Error ? err.message : String(err),
        url,
        method,
        headers: { ...headers, Authorization: headers.Authorization ? '(hidden)' : undefined }
    });
    
    // Retry logic
    const isSafeMethod = ['GET', 'HEAD', 'OPTIONS'].includes(method);
    const hasIdempotencyKey = !!headers['Idempotency-Key'];
    
    // Allow retry for safe methods OR unsafe methods with Idempotency-Key
    if (isSafeMethod || hasIdempotencyKey) {
      if (hasIdempotencyKey) {
        console.log(`[DEBUG-FIX] Retrying ${method} request with Idempotency-Key: ${headers['Idempotency-Key']}`);
      }
      
      await delay(500); // Wait a bit longer for retry
      try {
        res = await fetch(url, { 
          ...init, 
          headers, 
          credentials: 'include',
          mode: 'cors',
        });
        text = await res.text();
      } catch (retryErr) {
        console.error('API fetch retry failed:', retryErr);
        throw new Error(`Failed to connect to API at ${url}. Backend may be unreachable.`);
      }
    } else {
      // For unsafe methods without idempotency key, re-throwing allows the caller to handle it
      throw new Error(`Network request failed [${method} ${url}]: ${err instanceof Error ? err.message : String(err)}`);
    }
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
    // Automatic logout on 401 for protected routes
    if (res.status === 401 && !openAuthPaths.some(p => path.startsWith(p))) {
      setToken(null);
      setUser(null);
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?expired=true';
      }
    }

    const message = (data && (data.error || data.message)) || (text || res.statusText || 'API request failed');
    const err: any = new Error(String(message));
    err.status = res.status;
    err.data = data ?? text ?? null;
    throw err;
  }

  return data ?? (isJson ? null : (text || null));
}

function delay(ms = 500) {
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

function getCsrfToken() {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (const c of cookies) {
    const [name, ...rest] = c.trim().split('=');
    if (name === 'csrf_token') return decodeURIComponent(rest.join('='));
  }
  return null;
}

export default { apiFetch, getToken, setToken, getUser, setUser };
