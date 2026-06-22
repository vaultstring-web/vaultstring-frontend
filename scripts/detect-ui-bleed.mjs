/**
 * Scan priority UI namespaces for English copy and French bleed per locale.
 * Usage: node scripts/detect-ui-bleed.mjs [--json]
 */
import fs from 'node:fs';
import path from 'node:path';
import { INTENTIONAL_SAME, PT_FR_COGNATES, UI_PREFIXES } from './i18n-intentional-same.mjs';

const messagesDir = path.resolve(process.cwd(), 'src', 'messages');
const asJson = process.argv.includes('--json');

function flatten(obj, prefix = '', out = {}) {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return out;
  for (const [k, v] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) flatten(v, next, out);
    else out[next] = v;
  }
  return out;
}

const en = flatten(JSON.parse(fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf8')));
const fr = flatten(JSON.parse(fs.readFileSync(path.join(messagesDir, 'fr.json'), 'utf8')));

const locales = fs
  .readdirSync(messagesDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => path.basename(f, '.json'))
  .filter((l) => l !== 'en')
  .sort();

const report = {};

for (const locale of locales) {
  const data = flatten(JSON.parse(fs.readFileSync(path.join(messagesDir, `${locale}.json`), 'utf8')));
  const enBleed = [];
  const frBleed = [];

  for (const [key, enVal] of Object.entries(en)) {
    if (!UI_PREFIXES.some((p) => key.startsWith(p))) continue;
    if (INTENTIONAL_SAME.has(key)) continue;
    const val = data[key];
    if (val === undefined) continue;

    if (String(val) === String(enVal)) enBleed.push(key);
    if (
      locale !== 'fr' &&
      fr[key] !== undefined &&
      String(val) === String(fr[key]) &&
      String(fr[key]) !== String(enVal) &&
      !(locale === 'pt' && PT_FR_COGNATES.has(key))
    ) {
      frBleed.push(key);
    }
  }

  report[locale] = {
    enBleedCount: enBleed.length,
    frBleedCount: frBleed.length,
    total: enBleed.length + frBleed.length,
    enBleedSample: enBleed.slice(0, 12),
    frBleedSample: frBleed.slice(0, 12),
  };
}

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log('UI bleed scan (priority namespaces)\n');
  let totalEn = 0;
  let totalFr = 0;
  for (const locale of locales) {
    const r = report[locale];
    totalEn += r.enBleedCount;
    totalFr += r.frBleedCount;
    console.log(
      `${locale.padEnd(3)}  enBleed=${String(r.enBleedCount).padStart(3)}  frBleed=${String(r.frBleedCount).padStart(3)}  total=${String(r.total).padStart(3)}`
    );
  }
  console.log(`\nTOTAL  enBleed=${totalEn}  frBleed=${totalFr}  combined=${totalEn + totalFr}`);
}
