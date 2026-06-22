/**
 * Translate Onboarding + Common keys still identical to en after merge-onboarding.
 * Writes scripts/i18n-patches/onboarding-gaps.json (flat keys).
 *
 * Usage: node scripts/fill-onboarding-gaps.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(__dirname, '..', 'src', 'messages');
const cachePath = path.join(__dirname, 'i18n-fix', 'translation-cache.json');
const outPath = path.join(__dirname, 'i18n-patches', 'onboarding-gaps.json');

const LOCALES = ['fr', 'pt', 'sw', 'ja', 'zh', 'am', 'yo', 'ny', 'ar', 'zu', 'ha'];
const LANG_MAP = {
  fr: 'fr', pt: 'pt', sw: 'sw', ja: 'ja', zh: 'zh-CN', am: 'am', yo: 'yo',
  ny: 'ny', ar: 'ar', zu: 'zu', ha: 'ha',
};

const PREFIXES = ['Onboarding.', 'Common.'];

const INTENTIONAL = new Set([
  'Common.passwordMask', 'Profile.dash',
  'Onboarding.personalDetails.firstNamePlaceholder', 'Onboarding.contactInfo.phonePlaceholder',
  'Onboarding.contactInfo.emailPlaceholder', 'Onboarding.contactInfo.addressPlaceholder',
  'Onboarding.contactInfo.cityPlaceholder', 'Onboarding.contactInfo.countryPlaceholder',
  'Onboarding.contactInfo.postalCodePlaceholder', 'Onboarding.idVerification.documentNumberPlaceholder',
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
  for (let attempt = 0; attempt < 6; attempt++) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(protectedText)}&langpair=en|${targetLang}`;
    const res = await fetch(url);
    if (res.status === 429) {
      await sleep(12000 * (attempt + 1));
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const translated = restorePlaceholders(data.responseData?.translatedText ?? text, tokens);
    cache[cacheKey] = translated;
    fs.writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`);
    return translated;
  }
  return text;
}

const en = flatten(JSON.parse(fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf8')));
const fr = flatten(JSON.parse(fs.readFileSync(path.join(messagesDir, 'fr.json'), 'utf8')));
const gaps = {};

for (const locale of LOCALES) {
  const data = flatten(JSON.parse(fs.readFileSync(path.join(messagesDir, `${locale}.json`), 'utf8')));
  const lang = LANG_MAP[locale] || locale;
  const keys = Object.keys(en).filter((key) => {
    if (!PREFIXES.some((p) => key.startsWith(p))) return false;
    if (INTENTIONAL.has(key)) return false;
    const val = data[key];
    if (val === undefined) return true;
    if (String(val) === String(en[key])) return true;
    if (locale !== 'fr' && fr[key] && String(val) === String(fr[key]) && String(fr[key]) !== String(en[key])) return true;
    return false;
  });

  gaps[locale] = {};
  console.log(`${locale}: ${keys.length} gaps`);
  for (const key of keys) {
    const translated = await translateText(String(en[key]), lang);
    gaps[locale][key] = translated;
    await sleep(600);
  }
}

fs.writeFileSync(outPath, `${JSON.stringify(gaps, null, 2)}\n`);
console.log(`Wrote ${outPath}`);
