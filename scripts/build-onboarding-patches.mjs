/**
 * Flatten nested Onboarding objects into i18n-patches/onboarding.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const patchesDir = path.join(__dirname, 'i18n-patches');
const localesDir = path.join(__dirname, 'onboarding-i18n');

const LOCALES = ['fr', 'pt', 'sw', 'ja', 'zh', 'ar', 'am', 'yo', 'ny', 'zu', 'ha'];

function flatten(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v, key));
    } else {
      out[key] = v;
    }
  }
  return out;
}

const patch = {};
for (const locale of LOCALES) {
  const mod = await import(`./onboarding-i18n/${locale}.js`);
  const data = mod.default;
  const flat = flatten(data, 'Onboarding');
  patch[locale] = flat;
}

fs.writeFileSync(
  path.join(patchesDir, 'onboarding.json'),
  `${JSON.stringify(patch, null, 2)}\n`,
);
console.log('Wrote onboarding.json with', LOCALES.length, 'locales');
