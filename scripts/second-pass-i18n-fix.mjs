/**
 * Second-pass i18n fix: translate all keys that match en (untranslated) or fr (bleed)
 * for non-en locales, then apply directly to src/messages/{locale}.json.
 *
 * Usage:
 *   node scripts/second-pass-i18n-fix.mjs [--locale=sw] [--dry-run]
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

const SKIP_SAME = new Set([
  'Auth.social.apple',
  'Auth.social.google',
  'Common.passwordMask',
  'Profile.dash',
  'ResetPassword.passwordPlaceholder',
  'Verification.codePlaceholder',
  'Onboarding.personalDetails.firstNamePlaceholder',
  'Onboarding.personalDetails.lastNamePlaceholder',
  'Onboarding.contactInfo.phonePlaceholder',
  'Onboarding.contactInfo.emailPlaceholder',
  'Onboarding.contactInfo.addressPlaceholder',
  'Onboarding.contactInfo.cityPlaceholder',
  'Onboarding.contactInfo.countryPlaceholder',
  'Onboarding.contactInfo.postalCodePlaceholder',
  'Onboarding.idVerification.documentNumberPlaceholder',
  'Onboarding.businessSteps.docs',
  'Onboarding.userType.businessFeatureDocs',
  'SendMoney.previewCard.ratePair',
  'Wallet.depositModal.amountPlaceholder',
  'Wallet.withdrawModal.amountPlaceholder',
  'SendMoney.amountPlaceholder',
  'Dashboard.converter.amountPlaceholder',
  'Dashboard.converter.currencyPlaceholder',
  'Auth.signup.countryPlaceholder',
  'Auth.signup.phonePlaceholder',
]);

const args = process.argv.slice(2);
const localeArg = args.find((a) => a.startsWith('--locale='))?.split('=')[1];
const dryRun = args.includes('--dry-run');
const targets = localeArg ? [localeArg] : LOCALES;

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

function needsFix(locale, key, value, en, fr) {
  if (SKIP_SAME.has(key)) return false;
  if (value === undefined) return true;
  if (String(value) === String(en[key])) return true;
  if (locale !== 'fr' && String(value) === String(fr[key]) && String(fr[key]) !== String(en[key])) return true;
  return false;
}

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

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function loadPatches(locale) {
  const merged = {};
  if (!fs.existsSync(patchesDir)) return merged;
  for (const file of fs.readdirSync(patchesDir).filter((f) => f.endsWith('.json'))) {
    const all = JSON.parse(fs.readFileSync(path.join(patchesDir, file), 'utf8'));
    if (all[locale]) Object.assign(merged, all[locale]);
  }
  return merged;
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
      await sleep(10000 * (attempt + 1));
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const translated = restorePlaceholders(data.responseData?.translatedText ?? text, tokens);
    cache[cacheKey] = translated;
    if (!dryRun) fs.writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`);
    return translated;
  }
  throw new Error('Rate limited');
}

const en = flatten(JSON.parse(fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf8')));
const fr = flatten(JSON.parse(fs.readFileSync(path.join(messagesDir, 'fr.json'), 'utf8')));

const stats = {};

for (const locale of targets) {
  const filePath = path.join(messagesDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const flat = flatten(data);
  const fixFile = fs.existsSync(path.join(fixDir, `${locale}.json`))
    ? JSON.parse(fs.readFileSync(path.join(fixDir, `${locale}.json`), 'utf8'))
    : {};
  const patches = loadPatches(locale);

  const keys = Object.keys(en).filter((k) => needsFix(locale, k, flat[k], en, fr));
  let fixed = 0;
  let skipped = 0;

  console.log(`\n${locale}: ${keys.length} keys to fix`);

  for (const key of keys) {
    let replacement;

    if (fixFile[key] && !needsFix(locale, key, fixFile[key], en, fr)) {
      replacement = fixFile[key];
    } else if (patches[key] && !needsFix(locale, key, patches[key], en, fr)) {
      replacement = patches[key];
    } else if (locale === 'fr' && fr[key] && fr[key] !== en[key]) {
      replacement = fr[key];
    } else {
      try {
        if (!dryRun) {
          replacement = await translateText(String(en[key]), LANG_MAP[locale] || locale);
          await sleep(400);
        } else {
          replacement = `[DRY:${locale}] ${en[key]}`;
        }
      } catch (err) {
        console.error(`  FAIL ${key}: ${err.message}`);
        skipped++;
        continue;
      }
    }

    if (!dryRun) {
      setByPath(data, key, replacement);
      fixFile[key] = replacement;
    }
    fixed++;
    if (fixed % 30 === 0) {
      console.log(`  ${fixed}/${keys.length}`);
      if (!dryRun) {
        fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
        fs.writeFileSync(path.join(fixDir, `${locale}.json`), `${JSON.stringify(fixFile, null, 2)}\n`);
      }
    }
  }

  if (!dryRun) {
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
    fs.writeFileSync(path.join(fixDir, `${locale}.json`), `${JSON.stringify(fixFile, null, 2)}\n`);
  }

  stats[locale] = { toFix: keys.length, fixed, skipped };
  console.log(`${locale}: fixed ${fixed}/${keys.length} (skipped ${skipped})`);
}

if (!dryRun) fs.writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`);
console.log('\nStats:', JSON.stringify(stats, null, 2));
console.log('Done. Run: node scripts/detect-i18n-bleed.mjs');
