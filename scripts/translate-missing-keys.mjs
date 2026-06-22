/**
 * Translate keys needing fix from English via MyMemory API (free tier).
 * Preserves ICU placeholders like {name}, {count}, and HTML-like tags.
 * Run: node scripts/translate-missing-keys.mjs [--locale=pt] [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(__dirname, '..', 'src', 'messages');
const fixDir = path.join(__dirname, 'i18n-fix');
const cachePath = path.join(fixDir, 'translation-cache.json');

const LOCALES = ['fr', 'pt', 'sw', 'ja', 'zh', 'am', 'yo', 'ny', 'ar', 'zu', 'ha'];

const LANG_MAP = {
  fr: 'fr',
  pt: 'pt',
  sw: 'sw',
  ja: 'ja',
  zh: 'zh-CN',
  am: 'am',
  yo: 'yo',
  ny: 'ny',
  ar: 'ar',
  zu: 'zu',
  ha: 'ha',
};

const args = process.argv.slice(2);
const localeArg = args.find((a) => a.startsWith('--locale='))?.split('=')[1];
const dryRun = args.includes('--dry-run');
const targetLocales = localeArg ? [localeArg] : LOCALES;

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
    })
    .replace(/ICU_[^_\s]+/g, (m) => m)
    .replace(/[•…]/g, (m) => m);
  return { protectedText, tokens };
}

function restorePlaceholders(text, tokens) {
  let out = text;
  for (const { id, value } of tokens) {
    out = out.replace(new RegExp(id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
  }
  return out;
}

const SKIP_SAME = new Set([
  'Auth.social.apple',
  'Auth.social.google',
  'Common.passwordMask',
  'Profile.dash',
  'ResetPassword.passwordPlaceholder',
  'Verification.codePlaceholder',
]);

let cache = {};
if (fs.existsSync(cachePath)) {
  cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
}

async function translateText(text, targetLang) {
  const cacheKey = `${targetLang}::${text}`;
  if (cache[cacheKey]) return cache[cacheKey];

  const { protectedText, tokens } = protectPlaceholders(text);
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(protectedText)}&langpair=en|${targetLang}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const translated = restorePlaceholders(data.responseData?.translatedText ?? text, tokens);
  cache[cacheKey] = translated;
  return translated;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const en = flatten(JSON.parse(fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf8')));
const fr = flatten(JSON.parse(fs.readFileSync(path.join(messagesDir, 'fr.json'), 'utf8')));

if (!fs.existsSync(fixDir)) fs.mkdirSync(fixDir, { recursive: true });

for (const locale of targetLocales) {
  const data = flatten(JSON.parse(fs.readFileSync(path.join(messagesDir, `${locale}.json`), 'utf8')));
  const existingFix = fs.existsSync(path.join(fixDir, `${locale}.json`))
    ? JSON.parse(fs.readFileSync(path.join(fixDir, `${locale}.json`), 'utf8'))
    : {};
  const fixes = { ...existingFix };
  const keys = Object.keys(en).filter((k) => needsFix(locale, k, data[k], en, fr));

  console.log(`\n${locale}: translating ${keys.length} keys...`);
  let done = 0;

  for (const key of keys) {
    if (fixes[key] && fixes[key] !== en[key]) {
      done++;
      continue;
    }
    if (SKIP_SAME.has(key)) {
      fixes[key] = en[key];
      continue;
    }

    const source = locale === 'fr' && fr[key] && fr[key] !== en[key] ? fr[key] : en[key];
    if (locale === 'fr' && fr[key] && fr[key] !== en[key]) {
      fixes[key] = fr[key];
      done++;
      continue;
    }

    try {
      if (!dryRun) {
        fixes[key] = await translateText(String(source), LANG_MAP[locale] || locale);
        await sleep(350);
      }
      done++;
      if (done % 25 === 0) {
        console.log(`  ${done}/${keys.length}`);
        if (!dryRun) fs.writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`);
      }
    } catch (err) {
      console.error(`  FAIL ${key}: ${err.message}`);
      await sleep(2000);
    }
  }

  if (!dryRun) {
    fs.writeFileSync(path.join(fixDir, `${locale}.json`), `${JSON.stringify(fixes, null, 2)}\n`);
    fs.writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`);
  }
  console.log(`${locale}: done ${done}/${keys.length}`);
}

console.log('\nCache saved. Run: node scripts/apply-full-i18n-fix.mjs');
