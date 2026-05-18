import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';
 
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const requestedLocale = cookieStore.get('vs_locale')?.value || 'en';
  const supportedLocales = ['en', 'fr', 'pt', 'sw', 'ja', 'zh', 'am', 'yo', 'ny', 'ar', 'zu', 'ha'] as const;
  const locale = supportedLocales.includes(requestedLocale as (typeof supportedLocales)[number]) ? requestedLocale : 'en';
  const deepMerge = (base: unknown, overlay: unknown): unknown => {
    if (Array.isArray(base) || Array.isArray(overlay)) return overlay ?? base;
    if (typeof base !== 'object' || base === null) return overlay ?? base;
    if (typeof overlay !== 'object' || overlay === null) return base;

    const result: Record<string, unknown> = {...(base as Record<string, unknown>)};
    for (const [key, value] of Object.entries(overlay as Record<string, unknown>)) {
      result[key] = deepMerge((base as Record<string, unknown>)[key], value);
    }
    return result;
  };

  const baseMessages = (await import('./src/messages/en.json')).default;
  let localeMessages: unknown = {};

  try {
    localeMessages = (await import(`./src/messages/${locale}.json`)).default;
  } catch {
    localeMessages = {};
  }
 
  return {
    locale,
    // Merge locale messages over English to ensure missing keys fall back consistently.
    messages: deepMerge(baseMessages, localeMessages) as Record<string, unknown>
  };
});
