/**
 * Detect untranslated (same as en) and French bleed (same as fr when locale !== fr).
 * Usage: node scripts/detect-i18n-bleed.mjs [--json]
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
  const sameAsEn = [];
  const frenchBleed = [];
  const uiBleed = [];

  for (const [key, enVal] of Object.entries(en)) {
    const val = data[key];
    if (val === undefined) continue;
    const isUi = UI_PREFIXES.some((p) => key.startsWith(p));

    if (String(val) === String(enVal) && !INTENTIONAL_SAME.has(key)) {
      sameAsEn.push(key);
      if (isUi) uiBleed.push({ key, value: val, type: 'en' });
    }

    if (
      locale !== 'fr' &&
      fr[key] !== undefined &&
      String(val) === String(fr[key]) &&
      String(fr[key]) !== String(enVal) &&
      !INTENTIONAL_SAME.has(key) &&
      !(locale === 'pt' && PT_FR_COGNATES.has(key))
    ) {
      frenchBleed.push(key);
      if (isUi) uiBleed.push({ key, value: val, type: 'fr' });
    }
  }

  report[locale] = {
    sameAsEnCount: sameAsEn.length,
    frenchBleedCount: frenchBleed.length,
    uiIssueCount: uiBleed.length,
    frenchBleedSample: frenchBleed.slice(0, 15),
    uiIssueSample: uiBleed.slice(0, 20),
    sameAsEnSample: sameAsEn.slice(0, 15),
  };
}

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log('i18n bleed detection (excluding intentional same keys)\n');
  let totalEn = 0;
  let totalFr = 0;
  let totalUi = 0;
  for (const locale of locales) {
    const r = report[locale];
    totalEn += r.sameAsEnCount;
    totalFr += r.frenchBleedCount;
    totalUi += r.uiIssueCount;
    console.log(
      `${locale.padEnd(3)}  sameAsEn=${String(r.sameAsEnCount).padStart(4)}  frenchBleed=${String(r.frenchBleedCount).padStart(4)}  uiIssues=${String(r.uiIssueCount).padStart(4)}`
    );
  }
  console.log(`\nTOTAL  sameAsEn=${totalEn}  frenchBleed=${totalFr}  uiIssues=${totalUi}`);
  const ptFr = report.pt?.frenchBleedSample ?? [];
  if (ptFr.length) {
    console.log('\nFrench bleed samples (pt):');
    console.log(ptFr.join('\n'));
  }
  console.log('\nUI issues sample (sw):');
  for (const item of report.sw?.uiIssueSample ?? []) {
    console.log(`  [${item.type}] ${item.key}: ${item.value}`);
  }
}
