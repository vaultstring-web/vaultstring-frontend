/**
 * Adds Translation, Verification, ResetPassword, Compliance keys to all locale files.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(__dirname, '..', 'src', 'messages');
const EXTRA = ['Translation', 'Verification', 'ResetPassword', 'Compliance'];

function flat(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const n = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flat(v, n, out);
    else out[n] = v;
  }
  return out;
}

function setByPath(obj, dotPath, value) {
  const parts = dotPath.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!cur[p] || typeof cur[p] !== 'object') cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

const enFull = JSON.parse(fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf8'));
const enExtra = {};
for (const sec of EXTRA) enExtra[sec] = enFull[sec];
const enFlat = flat(enExtra);

/** Load optional patch file */
const patchPath = path.join(__dirname, 'i18n-patches', 'extra-pages.json');
const patches = fs.existsSync(patchPath)
  ? JSON.parse(fs.readFileSync(patchPath, 'utf8'))
  : {};

const locales = fs.readdirSync(messagesDir).filter((f) => f.endsWith('.json') && f !== 'en.json');

for (const file of locales) {
  const locale = path.basename(file, '.json');
  const p = path.join(messagesDir, file);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const sec of EXTRA) {
    if (!data[sec]) data[sec] = JSON.parse(JSON.stringify(enFull[sec]));
  }
  const localePatch = patches[locale] || {};
  for (const [key, value] of Object.entries(enFlat)) {
    if (localePatch[key]) setByPath(data, key, localePatch[key]);
    else if (locale !== 'en') {
      const parts = key.split('.');
      let cur = data;
      let enCur = enFull;
      for (const part of parts.slice(0, -1)) {
        if (!cur[part]) cur[part] = enCur[part] ? JSON.parse(JSON.stringify(enCur[part])) : {};
        cur = cur[part];
        enCur = enCur[part] || {};
      }
      const leaf = parts[parts.length - 1];
      if (cur[leaf] === undefined) cur[leaf] = value;
    }
  }
  for (const [key, value] of Object.entries(localePatch)) {
    setByPath(data, key, value);
  }
  fs.writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`);
}

console.log(`Propagated extra page keys to ${locales.length} locales`);
