/**
 * Apply complete i18n fixes: missing keys, English copies, and French bleed-through.
 * Run: node scripts/apply-full-i18n-fix.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(__dirname, '..', 'src', 'messages');
const fixDir = path.join(__dirname, 'i18n-fix');

const LOCALES = ['fr', 'pt', 'sw', 'ja', 'zh', 'am', 'yo', 'ny', 'ar', 'zu', 'ha'];

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

function setByPath(obj, dotPath, value) {
  const parts = dotPath.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!isPlainObject(cur[p])) cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

function needsFix(locale, key, value, en, fr) {
  if (value === undefined) return true;
  if (String(value) === String(en[key])) return true;
  if (locale !== 'fr' && String(value) === String(fr[key]) && String(fr[key]) !== String(en[key])) return true;
  return false;
}

const en = flatten(JSON.parse(fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf8')));
const fr = flatten(JSON.parse(fs.readFileSync(path.join(messagesDir, 'fr.json'), 'utf8')));

const stats = {};

for (const locale of LOCALES) {
  const fixPath = path.join(fixDir, `${locale}.json`);
  if (!fs.existsSync(fixPath)) {
    console.warn(`Missing fix file: ${fixPath}`);
    continue;
  }

  const fixes = JSON.parse(fs.readFileSync(fixPath, 'utf8'));
  const filePath = path.join(messagesDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const flat = flatten(data);

  let applied = 0;
  for (const [key, value] of Object.entries(fixes)) {
    if (value === undefined || value === null) continue;
    if (!needsFix(locale, key, flat[key], en, fr) && flat[key] !== undefined) continue;
    setByPath(data, key, value);
    applied++;
  }

  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
  stats[locale] = applied;
  console.log(`${locale}: applied ${applied} fixes`);
}

console.log('\nDone. Run: node scripts/check-i18n-missing.mjs');
