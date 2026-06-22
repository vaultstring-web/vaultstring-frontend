/**
 * Build complete i18n-fix/{locale}.json by merging:
 * 1) existing fix files, 2) non-French patch entries, 3) zu/ha dedicated patches,
 * 4) translation cache, 5) API translate for remaining keys.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(__dirname, '..', 'src', 'messages');
const fixDir = path.join(__dirname, 'i18n-fix');
const patchesDir = path.join(__dirname, 'i18n-patches');
const cachePath = path.join(fixDir, 'translation-cache.json');

const LOCALES = ['fr', 'pt', 'sw', 'ja', 'zh', 'am', 'yo', 'ny', 'ar', 'zu', 'ha'];
const LANG_MAP = { fr: 'fr', pt: 'pt', sw: 'sw', ja: 'ja', zh: 'zh-CN', am: 'am', yo: 'yo', ny: 'ny', ar: 'ar', zu: 'zu', ha: 'ha' };
const SKIP_SAME = new Set(['Auth.social.apple', 'Auth.social.google', 'Common.passwordMask', 'Profile.dash', 'ResetPassword.passwordPlaceholder', 'Verification.codePlaceholder']);

function flatten(obj, prefix = '', out = {}) {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return out;
  for (const [k, v] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) flatten(v, next, out);
    else out[next] = v;
  }
  return out;
}

function needsFix(locale, key, value, en, fr) {
  if (value === undefined) return true;
  if (String(value) === String(en[key])) return true;
  if (locale !== 'fr' && String(value) === String(fr[key]) && String(fr[key]) !== String(en[key])) return true;
  return false;
}

function protectPlaceholders(text) {
  const tokens = [];
  const protectedText = text
    .replace(/<[^>]+>[^<]*<\/[^>]+>/g, (m) => {
      const id = `__TAG${tokens.length}__`;
      tokens.push({ id, value: m });
      return id;
    })
    .replace(/\{[^}]+\}/g, (m) => {
      const id = `__PH${tokens.length}__`;
      tokens.push({ id, value: m });
      return id;
    });
  return { protectedText, tokens };
}

function restorePlaceholders(text, tokens) {
  let out = text;
  for (const { id, value } of tokens) {
    out = out.replace(new RegExp(id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
  }
  return out;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

let cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, 'utf8')) : {};

async function translateText(text, targetLang) {
  const cacheKey = `${targetLang}::${text}`;
  if (cache[cacheKey]) return cache[cacheKey];

  const { protectedText, tokens } = protectPlaceholders(text);
  for (let attempt = 0; attempt < 8; attempt++) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(protectedText)}&langpair=en|${targetLang}`;
    const res = await fetch(url);
    if (res.status === 429) {
      await sleep(15000 * (attempt + 1));
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const translated = restorePlaceholders(data.responseData?.translatedText ?? text, tokens);
    cache[cacheKey] = translated;
    fs.writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`);
    return translated;
  }
  throw new Error('Rate limited after retries');
}

function loadPatches(locale) {
  const merged = {};
  for (const file of fs.readdirSync(patchesDir).filter((f) => f.endsWith('.json'))) {
    const all = JSON.parse(fs.readFileSync(path.join(patchesDir, file), 'utf8'));
    if (all[locale]) Object.assign(merged, all[locale]);
  }
  return merged;
}

const en = flatten(JSON.parse(fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf8')));
const fr = flatten(JSON.parse(fs.readFileSync(path.join(messagesDir, 'fr.json'), 'utf8')));

if (!fs.existsSync(fixDir)) fs.mkdirSync(fixDir, { recursive: true });

const localeArg = process.argv.find((a) => a.startsWith('--locale='))?.split('=')[1];
const targets = localeArg ? [localeArg] : LOCALES.filter((l) => l !== 'fr' && l !== 'pt');

for (const locale of targets) {
  const data = flatten(JSON.parse(fs.readFileSync(path.join(messagesDir, `${locale}.json`), 'utf8')));
  const fixPath = path.join(fixDir, `${locale}.json`);
  const fixes = fs.existsSync(fixPath) ? JSON.parse(fs.readFileSync(fixPath, 'utf8')) : {};
  const patches = loadPatches(locale);
  const keys = Object.keys(en).filter((k) => needsFix(locale, k, data[k], en, fr));

  console.log(`\n${locale}: ${keys.length} keys to fix`);
  let done = 0;

  for (const key of keys) {
    if (fixes[key] && fixes[key] !== en[key] && fixes[key] !== fr[key]) {
      done++;
      continue;
    }

    const patchVal = patches[key];
    if (patchVal !== undefined && (locale === 'fr' || String(patchVal) !== String(fr[key]) || String(fr[key]) === String(en[key]))) {
      fixes[key] = patchVal;
      done++;
      continue;
    }

    if (SKIP_SAME.has(key)) {
      fixes[key] = en[key];
      done++;
      continue;
    }

    try {
      fixes[key] = await translateText(String(en[key]), LANG_MAP[locale] || locale);
      done++;
      if (done % 20 === 0) {
        console.log(`  ${done}/${keys.length}`);
        fs.writeFileSync(fixPath, `${JSON.stringify(fixes, null, 2)}\n`);
      }
      await sleep(1200);
    } catch (err) {
      console.error(`  FAIL ${key}: ${err.message}`);
      await sleep(5000);
    }
  }

  fs.writeFileSync(fixPath, `${JSON.stringify(fixes, null, 2)}\n`);
  console.log(`${locale}: completed ${done}/${keys.length}`);
}

console.log('\nRun: node scripts/apply-full-i18n-fix.mjs');
