/**
 * Copy missing leaf keys from en.json into every other locale (English fallback).
 * Run before apply-i18n-patches.mjs so patches can overwrite with translations.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(__dirname, '..', 'src', 'messages');

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

const en = JSON.parse(fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf8'));
const enFlat = flatten(en);

const files = fs.readdirSync(messagesDir).filter((f) => f.endsWith('.json') && f !== 'en.json');

for (const file of files) {
  const locale = path.basename(file, '.json');
  const filePath = path.join(messagesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let added = 0;
  for (const [key, value] of Object.entries(enFlat)) {
    const parts = key.split('.');
    let cur = data;
    let exists = true;
    for (const p of parts) {
      if (!isPlainObject(cur) || !(p in cur)) {
        exists = false;
        break;
      }
      cur = cur[p];
    }
    if (!exists || typeof cur === 'object') {
      setByPath(data, key, value);
      added++;
    }
  }
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`${locale}: added ${added} keys from en`);
}
