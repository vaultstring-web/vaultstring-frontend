/**
 * Apply zu.json / ha.json dedicated patches and pt/sw fix overlays to locale message files.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(__dirname, '..', 'src', 'messages');
const patchesDir = path.join(__dirname, 'i18n-patches');
const fixDir = path.join(__dirname, 'i18n-fix');

function setByPath(obj, dotPath, value) {
  const parts = dotPath.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (typeof cur[p] !== 'object' || cur[p] === null) cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

function applyMap(locale, map) {
  const filePath = path.join(messagesDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  for (const [key, value] of Object.entries(map)) {
    setByPath(data, key, value);
  }
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
  return Object.keys(map).length;
}

const jobs = [
  ['zu', path.join(patchesDir, 'zu.json'), 'zu'],
  ['ha', path.join(patchesDir, 'ha.json'), 'ha'],
];

for (const [locale, file, section] of jobs) {
  const patch = JSON.parse(fs.readFileSync(file, 'utf8'))[section] ?? {};
  const n = applyMap(locale, patch);
  console.log(`${locale}: applied ${n} dedicated patches`);
}

for (const locale of ['pt', 'sw', 'fr', 'ja', 'zh', 'ar', 'am', 'yo', 'ny', 'zu', 'ha']) {
  const fixPath = path.join(fixDir, `${locale}.json`);
  if (!fs.existsSync(fixPath)) continue;
  const fix = JSON.parse(fs.readFileSync(fixPath, 'utf8'));
  const n = applyMap(locale, fix);
  console.log(`${locale}: applied ${n} fix overlays`);
}

console.log('Done.');
