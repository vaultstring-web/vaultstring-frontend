/**
 * Replace French bleed-through (locale value === fr value) with proper translations.
 * Sources: locale fix files, zu/ha dedicated patches, translation cache, API fallback.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(__dirname, '..', 'src', 'messages');
const fixDir = path.join(__dirname, 'i18n-fix');
const patchesDir = path.join(__dirname, 'i18n-patches');
const cachePath = path.join(fixDir, 'translation-cache.json');

const LOCALES = ['pt', 'sw', 'ja', 'zh', 'am', 'yo', 'ny', 'ar', 'zu', 'ha'];
const LANG_MAP = { pt: 'pt', sw: 'sw', ja: 'ja', zh: 'zh-CN', am: 'am', yo: 'yo', ny: 'ny', ar: 'ar', zu: 'zu', ha: 'ha' };
const SKIP = new Set(['Auth.social.apple', 'Auth.social.google', 'Common.passwordMask', 'Profile.dash', 'ResetPassword.passwordPlaceholder', 'Verification.codePlaceholder', 'Wallet.withdrawModal.amountPlaceholder', 'SendMoney.amountPlaceholder']);

function flatten(obj, prefix = '', out = {}) {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return out;
  for (const [k, v] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) flatten(v, next, out);
    else out[next] = v;
  }
  return out;
}

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

function loadDedicatedPatches(locale) {
  const file = path.join(patchesDir, `${locale}.json`);
  if (!fs.existsSync(file)) return {};
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  return data[locale] ?? {};
}

function loadGoodPatches(locale) {
  const merged = {};
  for (const file of fs.readdirSync(patchesDir).filter((f) => f.endsWith('.json'))) {
    const all = JSON.parse(fs.readFileSync(path.join(patchesDir, file), 'utf8'));
    const section = all[locale];
    if (!section) continue;
    for (const [k, v] of Object.entries(section)) {
      merged[k] = v;
    }
  }
  return merged;
}

let cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, 'utf8')) : {};

function protectPlaceholders(text) {
  const tokens = [];
  const protectedText = String(text)
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

async function translateText(text, targetLang) {
  const cacheKey = `${targetLang}::${text}`;
  if (cache[cacheKey]) return cache[cacheKey];
  const { protectedText, tokens } = protectPlaceholders(text);
  for (let attempt = 0; attempt < 6; attempt++) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(protectedText)}&langpair=en|${targetLang}`;
    const res = await fetch(url);
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 20000 * (attempt + 1)));
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const translated = restorePlaceholders(data.responseData?.translatedText ?? text, tokens);
    cache[cacheKey] = translated;
    fs.writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`);
    return translated;
  }
  throw new Error('rate limited');
}

const en = flatten(JSON.parse(fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf8')));
const fr = flatten(JSON.parse(fs.readFileSync(path.join(messagesDir, 'fr.json'), 'utf8')));
const ptFix = fs.existsSync(path.join(fixDir, 'pt.json'))
  ? JSON.parse(fs.readFileSync(path.join(fixDir, 'pt.json'), 'utf8'))
  : {};

const localeArg = process.argv.find((a) => a.startsWith('--locale='))?.split('=')[1];
const targets = localeArg ? [localeArg] : LOCALES;

for (const locale of targets) {
  const filePath = path.join(messagesDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const flat = flatten(data);
  const fixFile = fs.existsSync(path.join(fixDir, `${locale}.json`))
    ? JSON.parse(fs.readFileSync(path.join(fixDir, `${locale}.json`), 'utf8'))
    : {};
  const dedicated = loadDedicatedPatches(locale);
  const patches = loadGoodPatches(locale);

  const bleedKeys = Object.keys(en).filter((k) => {
    const v = flat[k];
    return v !== undefined && String(v) === String(fr[k]) && String(fr[k]) !== String(en[k]);
  });

  console.log(`\n${locale}: ${bleedKeys.length} French bleed keys`);
  let fixed = 0;

  for (const key of bleedKeys) {
    let replacement;
    if (fixFile[key] && String(fixFile[key]) !== String(fr[key])) replacement = fixFile[key];
    else if (dedicated[key] && String(dedicated[key]) !== String(fr[key])) replacement = dedicated[key];
    else if (patches[key] && String(patches[key]) !== String(fr[key])) replacement = patches[key];
    else if (locale === 'pt' && ptFix[key]) replacement = ptFix[key];
    else if (cache[`${LANG_MAP[locale]}::${en[key]}`]) replacement = cache[`${LANG_MAP[locale]}::${en[key]}`];

    if (!replacement) {
      try {
        replacement = await translateText(String(en[key]), LANG_MAP[locale] || locale);
        await new Promise((r) => setTimeout(r, 1500));
      } catch (e) {
        console.error(`  skip ${key}: ${e.message}`);
        continue;
      }
    }

    setByPath(data, key, replacement);
    fixed++;
    if (fixed % 25 === 0) console.log(`  ${fixed}/${bleedKeys.length}`);
  }

  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`${locale}: fixed ${fixed}/${bleedKeys.length}`);
}

console.log('\nDone.');
