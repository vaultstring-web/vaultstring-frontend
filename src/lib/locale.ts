import { apiFetch } from '@/src/lib/api/api-client';

const LOCALE_STORAGE_KEY = 'vs_locale';
const LEGACY_LOCALE_COOKIE_KEY = 'vs_locale';
const NEXT_INTL_LOCALE_COOKIE_KEY = 'NEXT_LOCALE';

export function getStoredLocale(fallback = 'en'): string {
  if (typeof window === 'undefined') return fallback;
  return localStorage.getItem(LOCALE_STORAGE_KEY) || fallback;
}

export function getCookieLocale(): string {
  if (typeof document === 'undefined') return '';
  const read = (name: string) => {
    const needle = `${name}=`;
    const found = document.cookie
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(needle));
    return found ? decodeURIComponent(found.slice(needle.length)) : '';
  };
  return (
    read(NEXT_INTL_LOCALE_COOKIE_KEY) ||
    read(LEGACY_LOCALE_COOKIE_KEY) ||
    ''
  );
}

/** Persist locale for next-intl, sync to backend, and reload so messages apply. */
export function setAppLocale(code: string, options?: { reload?: boolean }) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCALE_STORAGE_KEY, code);
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${LEGACY_LOCALE_COOKIE_KEY}=${encodeURIComponent(code)}; path=/; max-age=${maxAge}`;
  document.cookie = `${NEXT_INTL_LOCALE_COOKIE_KEY}=${encodeURIComponent(code)}; path=/; max-age=${maxAge}`;

  void apiFetch('/auth/me', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ locale: code }),
  }).catch(() => {});

  if (options?.reload !== false) {
    window.location.reload();
  }
}

export function resolveInitialLocale(fallback = 'en'): string {
  if (typeof window === 'undefined') return fallback;
  return getStoredLocale() || getCookieLocale() || fallback;
}
