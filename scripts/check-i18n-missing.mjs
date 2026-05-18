import fs from 'node:fs';
import path from 'node:path';

const messagesDir = path.resolve(process.cwd(), 'src', 'messages');
const baseLocale = 'en';

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function flattenKeys(obj, prefix = '') {
  const keys = [];
  if (!isPlainObject(obj)) return keys;
  for (const [k, v] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${k}` : k;
    if (isPlainObject(v)) keys.push(...flattenKeys(v, next));
    else keys.push(next);
  }
  return keys;
}

const files = fs
  .readdirSync(messagesDir)
  .filter((f) => f.endsWith('.json'))
  .sort();

if (!files.includes(`${baseLocale}.json`)) {
  console.error(`Base locale file not found: ${baseLocale}.json in ${messagesDir}`);
  process.exit(1);
}

const base = readJson(path.join(messagesDir, `${baseLocale}.json`));
const baseKeys = new Set(flattenKeys(base));

const results = [];
for (const file of files) {
  const locale = path.basename(file, '.json');
  const data = readJson(path.join(messagesDir, file));
  const localeKeys = new Set(flattenKeys(data));
  const missing = [...baseKeys].filter((k) => !localeKeys.has(k)).sort();
  const extra = [...localeKeys].filter((k) => !baseKeys.has(k)).sort();
  results.push({ locale, missing, extra });
}

results.sort((a, b) => b.missing.length - a.missing.length);

console.log(`Base locale: ${baseLocale} (${baseKeys.size} keys)\n`);
for (const { locale, missing, extra } of results) {
  const status = missing.length === 0 ? 'OK' : 'INCOMPLETE';
  console.log(`${locale.padEnd(3)}  ${status.padEnd(10)} missing=${String(missing.length).padStart(4)} extra=${String(extra.length).padStart(4)}`);
}

console.log('\nDetails (first 50 missing keys per locale):\n');
for (const { locale, missing } of results) {
  if (locale === baseLocale) continue;
  if (missing.length === 0) continue;
  console.log(`- ${locale}:`);
  for (const k of missing.slice(0, 50)) console.log(`  - ${k}`);
  if (missing.length > 50) console.log(`  - ... and ${missing.length - 50} more`);
}
