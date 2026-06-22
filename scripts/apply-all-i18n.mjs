/**
 * Full i18n apply pipeline (fourth pass):
 * 1. Flat patches (excludes onboarding.json — see apply-i18n-patches.mjs)
 * 2. Onboarding namespace from scripts/onboarding-i18n/{locale}.js
 * 3. Translation cache + fourth-pass-ui hand-crafted overrides
 *
 * Usage: node scripts/apply-all-i18n.mjs
 */
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function run(script) {
  console.log(`\n>>> node scripts/${script}`);
  execSync(`node scripts/${script}`, { cwd: root, stdio: 'inherit' });
}

run('apply-i18n-patches.mjs');
run('merge-onboarding-i18n.mjs');
run('apply-translation-cache.mjs');

console.log('\nOptional gap fill: node scripts/fill-onboarding-gaps.mjs');
console.log('Done. Run: node scripts/detect-i18n-bleed.mjs');
