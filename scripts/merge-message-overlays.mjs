/**
 * Overlay new English keys onto every locale JSON (shallow merge per section).
 * Run after updating en.json Profile / SendMoney / Receipt / Auth.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '..', 'src', 'messages');

const OVERLAY_KEYS = [
  'Profile',
  'SendMoney',
  'Receipt',
  'Auth',
  'Settings',
  'Dashboard',
  'Sidebar',
  'TopBar',
  'Wallet',
  'Notifications',
  'Transactions',
];

const en = JSON.parse(fs.readFileSync(path.join(dir, 'en.json'), 'utf8'));

function shallowMergeSection(base, overlay) {
  return { ...(base || {}), ...(overlay || {}) };
}

for (const name of fs.readdirSync(dir)) {
  if (!name.endsWith('.json') || name === 'en.json') continue;
  const p = path.join(dir, name);
  const loc = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const k of OVERLAY_KEYS) {
    if (!en[k]) continue;
    loc[k] = shallowMergeSection(en[k], loc[k]);
  }
  fs.writeFileSync(p, `${JSON.stringify(loc, null, 2)}\n`);
}

console.log('Merged Profile, SendMoney, Receipt, Auth overlays from en.json into all locales.');
