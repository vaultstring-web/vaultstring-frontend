/**
 * Apply flat translation patches to locale JSON files.
 * Patches: scripts/i18n-patches/auth.json, zu.json, ha.json, misc.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(__dirname, '..', 'src', 'messages');
const patchesDir = path.join(__dirname, 'i18n-patches');

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
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

function applyPatches(locale, patches) {
  const filePath = path.join(messagesDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let count = 0;
  for (const [key, value] of Object.entries(patches)) {
    setByPath(data, key, value);
    count++;
  }
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
  return count;
}

const patchFiles = ['auth.json', 'zu.json', 'ha.json', 'misc.json', 'onboarding.json'];
const stats = {};

for (const pf of patchFiles) {
  const p = path.join(patchesDir, pf);
  if (!fs.existsSync(p)) continue;
  const all = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const [locale, patches] of Object.entries(all)) {
    if (!patches || typeof patches !== 'object') continue;
    const n = applyPatches(locale, patches);
    stats[locale] = (stats[locale] || 0) + n;
  }
}

console.log('Applied patches per locale:');
for (const [loc, n] of Object.entries(stats).sort()) {
  console.log(`  ${loc}: ${n} keys`);
}
