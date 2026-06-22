/**
 * Collect locale-specific translations from i18n-patches/*.json (only matching locale sections).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const patchesDir = path.join(__dirname, 'i18n-patches');
const LOCALES = ['fr', 'pt', 'sw', 'ja', 'zh', 'am', 'yo', 'ny', 'ar', 'zu', 'ha'];

const collected = Object.fromEntries(LOCALES.map((l) => [l, {}]));

for (const file of fs.readdirSync(patchesDir).filter((f) => f.endsWith('.json'))) {
  const all = JSON.parse(fs.readFileSync(path.join(patchesDir, file), 'utf8'));
  for (const locale of LOCALES) {
    const patches = all[locale];
    if (!patches || typeof patches !== 'object') continue;
    Object.assign(collected[locale], patches);
  }
}

const out = path.join(__dirname, 'i18n-fix', 'from-patches.json');
fs.writeFileSync(out, `${JSON.stringify(collected, null, 2)}\n`);
for (const locale of LOCALES) {
  console.log(`${locale}: ${Object.keys(collected[locale]).length} patch keys`);
}
