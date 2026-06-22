/**
 * Apply cached translations to locale files (no API calls).
 * Usage: node scripts/apply-translation-cache.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(__dirname, '..', 'src', 'messages');
const cachePath = path.join(__dirname, 'i18n-fix', 'translation-cache.json');
const patchesPath = path.join(__dirname, 'i18n-patches', 'fourth-pass-ui.json');

const LOCALES = ['fr', 'pt', 'sw', 'ja', 'zh', 'am', 'yo', 'ny', 'ar', 'zu', 'ha'];
const LANG_MAP = {
  fr: 'fr', pt: 'pt', sw: 'sw', ja: 'ja', zh: 'zh-CN', am: 'am', yo: 'yo',
  ny: 'ny', ar: 'ar', zu: 'zu', ha: 'ha',
};

const INTENTIONAL_SAME = new Set([
  'Auth.social.apple', 'Auth.social.google', 'Common.passwordMask', 'Profile.dash',
  'ResetPassword.passwordPlaceholder', 'Verification.codePlaceholder',
  'Dashboard.converter.currencyPlaceholder', 'Dashboard.converter.amountPlaceholder',
  'Wallet.depositModal.amountPlaceholder', 'Wallet.withdrawModal.amountPlaceholder',
  'SendMoney.amountPlaceholder', 'SendMoney.previewCard.ratePair',
  'Auth.login.emailPlaceholder', 'Auth.signup.emailPlaceholder',
  'Auth.signup.countryPlaceholder', 'Auth.signup.phonePlaceholder',
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

const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, 'utf8')) : {};
const uiPatches = fs.existsSync(patchesPath) ? JSON.parse(fs.readFileSync(patchesPath, 'utf8')) : {};
const en = flatten(JSON.parse(fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf8')));
const fr = flatten(JSON.parse(fs.readFileSync(path.join(messagesDir, 'fr.json'), 'utf8')));

for (const locale of LOCALES) {
  const filePath = path.join(messagesDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const flat = flatten(data);
  const lang = LANG_MAP[locale] || locale;
  const patches = uiPatches[locale] || {};
  let applied = 0;
  let missed = 0;

  for (const [key, enVal] of Object.entries(en)) {
    if (!needsFix(locale, key, flat[key], en, fr)) continue;

    const patchVal = patches[key];
    if (patchVal !== undefined && String(patchVal) !== String(enVal)) {
      setByPath(data, key, patchVal);
      applied++;
      continue;
    }

    const cacheKey = `${lang}::${enVal}`;
    if (cache[cacheKey] && String(cache[cacheKey]) !== String(enVal)) {
      setByPath(data, key, cache[cacheKey]);
      applied++;
    } else {
      missed++;
    }
  }

  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`${locale}: applied ${applied} from cache/patches, still need ${missed}`);
}
