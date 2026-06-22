/**
 * Merge Onboarding namespace into all locale message files.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ONBOARDING_EN } from './onboarding-i18n/en.js';
import { ONBOARDING_GAPS } from './onboarding-i18n/gaps.js';
import { deepMerge } from './onboarding-i18n/merge.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(__dirname, '..', 'src', 'messages');

const LOCALES = ['en', 'fr', 'pt', 'sw', 'ja', 'zh', 'am', 'yo', 'ny', 'ar', 'zu', 'ha'];

async function loadLocaleOnboarding(locale) {
  if (locale === 'en') return ONBOARDING_EN;
  try {
    const mod = await import(`./onboarding-i18n/${locale}.js`);
    const base = mod.default ?? mod[`ONBOARDING_${locale.toUpperCase()}`] ?? mod.ONBOARDING;
    const gaps = ONBOARDING_GAPS[locale] ?? {};
    return deepMerge(deepMerge(ONBOARDING_EN, base), gaps);
  } catch {
    return ONBOARDING_EN;
  }
}

for (const locale of LOCALES) {
  const filePath = path.join(messagesDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  data.Onboarding = await loadLocaleOnboarding(locale);
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Updated Onboarding in ${locale}.json`);
}
