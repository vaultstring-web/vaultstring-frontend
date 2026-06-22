/**
 * Fourth pass: translate all remaining bleed keys across all non-en locales.
 * Uses hand-crafted overrides, translation cache, then MyMemory API.
 *
 * Usage:
 *   node scripts/fourth-pass-i18n-fix.mjs
 *   node scripts/fourth-pass-i18n-fix.mjs --locale=ny
 *   node scripts/fourth-pass-i18n-fix.mjs --dry-run
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(__dirname, '..', 'src', 'messages');
const cachePath = path.join(__dirname, 'i18n-fix', 'translation-cache.json');
const overridesPath = path.join(__dirname, 'i18n-patches', 'fourth-pass-overrides.json');
const patchesPath = path.join(__dirname, 'i18n-patches', 'fourth-pass-ui.json');

const LOCALES = ['fr', 'pt', 'sw', 'ja', 'zh', 'am', 'yo', 'ny', 'ar', 'zu', 'ha'];
const LANG_MAP = {
  fr: 'fr', pt: 'pt', sw: 'sw', ja: 'ja', zh: 'zh-CN', am: 'am', yo: 'yo',
  ny: 'ny', ar: 'ar', zu: 'zu', ha: 'ha',
};

const INTENTIONAL_SAME = new Set([
  'Auth.social.apple', 'Auth.social.google', 'Common.passwordMask', 'Profile.dash',
  'ResetPassword.passwordPlaceholder', 'Verification.codePlaceholder',
  'Onboarding.personalDetails.firstNamePlaceholder', 'Onboarding.contactInfo.phonePlaceholder',
  'Onboarding.contactInfo.emailPlaceholder', 'Onboarding.contactInfo.addressPlaceholder',
  'Onboarding.contactInfo.cityPlaceholder', 'Onboarding.contactInfo.countryPlaceholder',
  'Onboarding.contactInfo.postalCodePlaceholder', 'Onboarding.idVerification.documentNumberPlaceholder',
  'Dashboard.converter.currencyPlaceholder', 'Dashboard.converter.amountPlaceholder',
  'Wallet.depositModal.amountPlaceholder', 'Wallet.withdrawModal.amountPlaceholder',
  'SendMoney.amountPlaceholder', 'SendMoney.previewCard.ratePair',
  'Auth.login.emailPlaceholder', 'Auth.signup.emailPlaceholder',
  'Auth.signup.countryPlaceholder', 'Auth.signup.phonePlaceholder',
  'Onboarding.personalDetails.lastNamePlaceholder', 'Onboarding.personalDetails.nationalityPlaceholder',
  'Onboarding.companyDetails.legalNamePlaceholder', 'Onboarding.companyDetails.registrationPlaceholder',
  'Onboarding.companyDetails.taxIdPlaceholder', 'Onboarding.businessInfo.websitePlaceholder',
  'Onboarding.authorizedReps.fullNamePlaceholder', 'Onboarding.authorizedReps.emailPlaceholder',
  'Onboarding.authorizedReps.jobTitlePlaceholder', 'Onboarding.uboDisclosure.uboNamePlaceholder',
  'Onboarding.uboDisclosure.ownershipPercentPlaceholder', 'Onboarding.uboDisclosure.nationalityPlaceholder',
  'Onboarding.bankingDetails.bankNamePlaceholder', 'Onboarding.bankingDetails.accountNumberPlaceholder',
  'Onboarding.bankingDetails.bankCodePlaceholder', 'Onboarding.bankingDetails.accountHolderPlaceholder',
  'Onboarding.securitySetup.answerPlaceholder', 'Onboarding.idVerification.previewAlt',
  'Onboarding.sourceOfFunds.incomeMwk0', 'Onboarding.sourceOfFunds.incomeMwk1',
  'Onboarding.sourceOfFunds.incomeMwk2', 'Onboarding.sourceOfFunds.incomeMwk3',
  'Onboarding.sourceOfFunds.incomeMwk4', 'Onboarding.sourceOfFunds.incomeCny0',
  'Onboarding.sourceOfFunds.incomeCny1', 'Onboarding.sourceOfFunds.incomeCny2',
  'Onboarding.sourceOfFunds.incomeCny3', 'Onboarding.sourceOfFunds.incomeCny4',
  'Onboarding.businessInfo.size1', 'Onboarding.businessInfo.size2', 'Onboarding.businessInfo.size3',
  'Onboarding.businessInfo.size4', 'Onboarding.businessInfo.size5',
  'Onboarding.completion.referenceId',
]);

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
    if (typeof cur[p] !== 'object' || cur[p] === null || Array.isArray(cur[p])) cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

function needsFix(locale, key, value, en, fr) {
  if (INTENTIONAL_SAME.has(key)) return false;
  if (value === undefined) return true;
  if (String(value) === String(en[key])) return true;
  if (locale !== 'fr' && fr[key] !== undefined && String(value) === String(fr[key]) && String(fr[key]) !== String(en[key])) return true;
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

const dryRun = process.argv.includes('--dry-run');
const localeArg = process.argv.find((a) => a.startsWith('--locale='))?.split('=')[1];
const targets = localeArg ? [localeArg] : LOCALES;

const en = flatten(JSON.parse(fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf8')));
const fr = flatten(JSON.parse(fs.readFileSync(path.join(messagesDir, 'fr.json'), 'utf8')));

const overrides = fs.existsSync(overridesPath)
  ? JSON.parse(fs.readFileSync(overridesPath, 'utf8'))
  : {};
const uiPatches = fs.existsSync(patchesPath)
  ? JSON.parse(fs.readFileSync(patchesPath, 'utf8'))
  : {};

const report = { before: {}, after: {}, fixed: {} };

for (const locale of targets) {
  const filePath = path.join(messagesDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const flat = flatten(data);

  const keys = Object.keys(en).filter((k) => needsFix(locale, k, flat[k], en, fr));
  report.before[locale] = keys.length;

  let fixed = 0;
  const localeOverrides = { ...uiPatches[locale], ...overrides[locale] };

  for (const key of keys) {
    let value = localeOverrides[key];

    if (value === undefined || String(value) === String(en[key])) {
      try {
        value = await translateText(String(en[key]), LANG_MAP[locale] || locale);
        await sleep(800);
      } catch (err) {
        console.error(`  FAIL ${locale} ${key}: ${err.message}`);
        await sleep(3000);
        continue;
      }
    }

    if (!dryRun) setByPath(data, key, value);
    fixed++;
    if (fixed % 25 === 0) console.log(`  ${locale}: ${fixed}/${keys.length}`);
  }

  if (!dryRun) fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
  report.fixed[locale] = fixed;
  console.log(`${locale}: fixed ${fixed}/${keys.length} keys`);
}

if (!dryRun) {
  console.log('\nRe-run: node scripts/detect-i18n-bleed.mjs');
}

console.log(JSON.stringify(report, null, 2));
