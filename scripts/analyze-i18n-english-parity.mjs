/**
 * Compare locale JSON files to en.json:
 * - "stillEnglish": leaf keys where locale string === en string (candidates for untranslated copy).
 * - "zuParityGaps": keys where zu differs from en but locale still matches en (structural parity vs Zulu bar).
 *
 * Usage: node scripts/analyze-i18n-english-parity.mjs [--json]
 */
import fs from 'node:fs';
import path from 'node:path';

const messagesDir = path.resolve(process.cwd(), 'src', 'messages');
const asJson = process.argv.includes('--json');

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function flatten(obj, prefix = '', out = {}) {
  if (!isPlainObject(obj)) return out;
  for (const [k, v] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${k}` : k;
    if (isPlainObject(v)) flatten(v, next, out);
    else out[next] = v;
  }
  return out;
}

const files = fs.readdirSync(messagesDir).filter((f) => f.endsWith('.json')).sort();
const en = flatten(JSON.parse(fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf8')));
const zu = flatten(JSON.parse(fs.readFileSync(path.join(messagesDir, 'zu.json'), 'utf8')));

const zuTranslatedKeys = Object.keys(en).filter(
  (k) => zu[k] !== undefined && String(zu[k]) !== String(en[k])
);

const report = {};

for (const file of files) {
  const locale = path.basename(file, '.json');
  const data = flatten(JSON.parse(fs.readFileSync(path.join(messagesDir, file), 'utf8')));
  const stillEnglish = [];
  let sameAsEn = 0;
  let compared = 0;
  for (const [k, ev] of Object.entries(en)) {
    if (!(k in data)) continue;
    compared++;
    if (String(data[k]) === String(ev)) {
      sameAsEn++;
      stillEnglish.push(k);
    }
  }
  const zuParityGaps =
    locale === 'en' || locale === 'zu'
      ? []
      : zuTranslatedKeys.filter((k) => String(data[k] ?? en[k]) === String(en[k]));

  report[locale] = {
    leafKeysInLocale: Object.keys(data).length,
    leafKeysInEn: Object.keys(en).length,
    missingLeafKeysVsEn: Object.keys(en).filter((k) => !(k in data)).length,
    comparedToEn: compared,
    stillEnglishCount: stillEnglish.length,
    stillEnglishPercent: compared ? ((100 * sameAsEn) / compared).toFixed(1) : '0',
    zuParityGapCount: zuParityGaps.length,
    stillEnglishSample: stillEnglish.slice(0, 25),
    zuParityGapSample: zuParityGaps.slice(0, 25),
  };
}

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`Base en keys: ${Object.keys(en).length}; zu translated (zu≠en): ${zuTranslatedKeys.length}\n`);
  for (const locale of Object.keys(report).sort()) {
    const r = report[locale];
    console.log(
      `${locale.padEnd(3)}  sameAsEn=${String(r.stillEnglishCount).padStart(4)}/${r.comparedToEn} (${r.stillEnglishPercent}%)  zuGaps=${r.zuParityGapCount}  missingVsEn=${r.missingLeafKeysVsEn}`
    );
  }
  console.log('\nSample stillEnglish (first locale with gaps, fr):');
  console.log(report.fr?.stillEnglishSample?.join('\n') || '(n/a)');
}
