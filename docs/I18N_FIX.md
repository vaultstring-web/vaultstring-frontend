# Customer portal i18n fix (June 2026)

## Locales covered

12 locales: `en`, `fr`, `pt`, `sw`, `ja`, `zh`, `am`, `yo`, `ny`, `ar`, `zu`, `ha`.

## Root cause (first pass — 9dff9591)

1. **Missing keys (57)** — New dashboard/wallet/send-money strings existed in `en.json` but not in locale overlays; deep-merge fell back to English.
2. **French bleed-through** — `phase3-customer.json` and related patches copied French strings into non-French locale files (e.g. `TopBar.account.member` was `"Compte"` in every locale).
3. **Hardcoded English** — Top bar avatar `alt` used `'User'` instead of `t('fallbackUser')`.

## Second pass (June 2026)

### Bleed detection — before vs after

| Metric | Before 2nd pass | After 2nd pass |
|--------|-----------------|--------------|
| French bleed (all non-fr locales) | **407** | **~26** (mostly `0,00` placeholders + pt/fr cognates like *Limites*) |
| Swahili French bleed | 51 | **0** |
| UI bleed issues (detect script) | 2545 | **~400** (remaining are placeholders, onboarding sample data, ICU templates) |
| Missing keys vs en | 0 | **0** (1062 keys) |

Run: `node scripts/detect-i18n-bleed.mjs`

### Per-locale keys fixed (second pass)

| Locale | French bleed fix | UI / profile fix | Onboarding expanded | Notes |
|--------|------------------|------------------|----------------------|-------|
| sw | 51 | 43 | 161 user-facing | French bleed **eliminated** |
| ja | 51 | 38 | 161 | Settings, Transactions, Compliance, AccountBlocked |
| zh | 51 | 38 | 161 | |
| ar | 51 | 42 | 161 | |
| am | 51 | 42 | 161 | |
| yo | 51 | 42 | 161 | |
| ny | 51 | 42 | 161 | |
| zu | 51 | 44 | 161 | |
| ha | 51 | 42 | 161 | |
| pt | 5 | 40 | — | Cognate *Limites* retained |
| fr | — | 11 | — | Fixed corrupted `Sidebar.notifications` / `Notifications.types.info` (were Zulu) |

### Hardcoded components fixed

| Component | Change |
|-----------|--------|
| `src/app/signup/page.tsx` | `Auth.signup.pageTitle` / `pageSubtitle` via `useTranslations` |
| `src/app/verify-email/page.tsx` | Full `Verification.*` i18n (titles, messages, buttons) |
| `src/app/verification/page.tsx` | Suspense fallback uses `Verification.verifyTitle` / `verifySubtitle` |
| `src/components/dashboard/compliance/DocumentUploadSection.tsx` | `Compliance.idDocTitle` / `addressDocTitle` |
| `src/app/page.tsx` | Dashboard user fallback uses `TopBar.fallbackUser` |

### `fr.json` corruption fix

- `Sidebar.notifications`: `Izaziso` → `Notifications`
- `Notifications.types.info`: `Ulwazi` → `Info`

These Zulu strings in the French base file caused false-positive bleed detection across locales.

## Scripts

```bash
# Key parity check (expect 0 missing for all locales)
node scripts/check-i18n-missing.mjs

# English copy / French bleed analysis
node scripts/detect-i18n-bleed.mjs
node scripts/analyze-i18n-english-parity.mjs

# Second pass — French bleed block (Settings, Transactions, Compliance, AccountBlocked)
node scripts/apply-second-pass-bleed.mjs

# Second pass — priority UI + Profile + Transactions table
node scripts/apply-second-pass-ui-en.mjs

# Onboarding — merge from scripts/onboarding-i18n/{locale}.js
node scripts/merge-onboarding-i18n.mjs

# Priority UI French bleed (dashboard, topbar, sidebar, profile)
node scripts/fix-priority-bleed.mjs

# Apply fix overlays from scripts/i18n-fix/{locale}.json
node scripts/apply-full-i18n-fix.mjs

# Build
npm run build
```

## Verification checklist

1. `node scripts/check-i18n-missing.mjs` — all locales `OK`, `missing=0`.
2. `node scripts/detect-i18n-bleed.mjs` — sw `frenchBleed=0`; total frenchBleed ≪ 407.
3. Switch language in Settings → save → reload dashboard.
4. Confirm top-left account label is **not** `Compte` unless French is selected.
5. Settings → Limits / Help & Support / Connected accounts — no French in Swahili/Japanese/etc.
6. Transactions receipt modal — locale-appropriate labels.
7. Signup / verify-email / onboarding — translated headers and body copy.
8. `npm run build` completes without errors.

## Third pass — Chichewa settings bleed (June 2026)

### Root cause

`Settings.nav`, `Settings.account`, and `Settings.privacy` in `ny.json` (and `yo.json`, `am.json`) still contained **Zulu** strings copied from an earlier patch (`I-akhawunti`, `Ezokuphepha`, `Ukubukeka`, etc.). Top-left profile subtitle showed hardcoded English from `AuthContext` (`Personal Account`, `Sender (Malawi)`, …).

### Fixes

| Area | Change |
|------|--------|
| `scripts/i18n-patches/chichewa-settings-fix.json` | Proper Chichewa for `Settings.nav.*`, `Settings.account.*`, `Settings.privacy.*`; Yoruba + Amharic nav/account/privacy; `TopBar.account.*` labels for all 12 locales |
| `src/context/AuthContext.tsx` | Removed hardcoded English `accountLabel` |
| `src/components/shared/topbar.tsx` | Resolves profile subtitle via `TopBar.account.personal|business|agent|senderMalawi|receiverChina` |
| `src/messages/en.json` | Added `TopBar.account.personal`, `business`, `agent`, `senderMalawi`, `receiverChina` |

### Chichewa (`ny`) keys corrected

- `Settings.nav.account` → **Akaunti**
- `Settings.nav.security` → **Chitetezo**
- `Settings.nav.notifications` → **Mauthenga**
- `Settings.nav.language` → **Chilankhulo ndi dera**
- `Settings.nav.appearance` → **Maonekedwe**
- `Settings.nav.privacy` → **Chinsinsi**
- `Settings.nav.limits` → **Malire**
- `Settings.nav.connectedAccounts` → **Maakaunti ogwirizana**
- `Settings.nav.helpSupport` → **Thandizo**
- `Settings.account.*` / `Settings.privacy.*` — full Chichewa (replaced Zulu)
- `TopBar.account.*` — localized account type labels
- `Profile.memberSince` → **Membara kuyambira** (was Portuguese *Membro*)

Apply: `node scripts/apply-i18n-patches.mjs` (includes `chichewa-settings-fix.json`).

Verify: Settings → Chichewa; profile top-left shows Chichewa account type, not English.

## Notes

- Brand names (`Google`, `Apple`, `VaultString` logo alt) may remain unchanged across locales.
- Placeholders (`0.00`, `0,00`, `••••••••`, sample emails, onboarding sample names) are intentionally identical where locale-neutral.
- Onboarding retains ~79 keys/locale matching English (placeholders, income brackets, security-question options) — same intentional gaps as `fr`.
- Portuguese *Limites* matches French orthography but is valid Portuguese; excluded from bleed counts.
- `i18n.ts` deep-merge ensures locale JSON overrides `en.json` for all present keys.

## Fourth pass — exhaustive coverage (June 2026)

### Root cause

1. **`onboarding.json` flat patches** overwrote good translations from `scripts/onboarding-i18n/{locale}.js` with English for African/Asian locales.
2. **`phase3-customer.json`** re-applied Zulu strings (`Izaziso`, `Ulwazi`) into `fr.json` on every patch run.
3. **Nested Onboarding keys** (terms bodies, security questions, compliance volumes, industries) were missing from locale overlays and fell back to English.

### Bleed metrics — before vs after (fourth pass)

| Metric | Start of pass 4 | After pass 4 |
|--------|-----------------|--------------|
| `sameAsEn` (all non-en) | **1539** | **13** |
| `frenchBleed` | **7** | **0** |
| `uiIssues` | **1545** | **13** |
| UI bleed combined (`detect-ui-bleed.mjs`) | **1635** | **13** |
| Missing keys vs en | 0 | **0** (1088 keys) |

Per-locale UI bleed after pass 4: **am, ar, ha, ja, ny, sw, yo, zh, zu = 0**; **fr = 12** (EN/FR cognates); **pt = 1** (*Subtotal*).

### Fixes applied

| Area | Change |
|------|--------|
| `scripts/apply-i18n-patches.mjs` | Removed `onboarding.json`; added `fr-corruption-fix.json`, `settings-nav-aria.json`, `common-error-boundary.json` |
| `scripts/apply-all-i18n.mjs` | Pipeline: patches → `merge-onboarding-i18n` → translation cache |
| `scripts/onboarding-i18n/gaps.js` | Hand-crafted gap translations (terms, security Q, industries, UBO, compliance) for all 11 non-en locales |
| `scripts/merge-onboarding-i18n.mjs` | Merges `gaps.js` after locale onboarding modules |
| `scripts/i18n-intentional-same.mjs` | Shared intentional-same + PT cognate exemptions for detect scripts |
| `scripts/detect-ui-bleed.mjs` | Priority namespace scan (TopBar → AccountBlocked) |
| `phase3-customer.json` | Fixed `fr` Sidebar/Notifications corruption |
| `src/app/kyc/page.tsx` | Uses `Compliance.title` / `subtitle` |
| `src/app/transactions/page.tsx` | ErrorBoundary uses `Common.errorBoundary*` |
| `src/components/ui/error-boundary.tsx` | Accepts `title`, `message`, `retryLabel` props |
| Chichewa (`ny`) | **0 bleed** — Settings, TopBar, Onboarding gaps complete |

### Scripts (fourth pass)

```bash
# Full apply pipeline (recommended after message edits)
node scripts/apply-all-i18n.mjs

# Bleed detection (priority UI namespaces)
node scripts/detect-ui-bleed.mjs
node scripts/detect-i18n-bleed.mjs

# Key parity
node scripts/check-i18n-missing.mjs

# Optional: API gap fill (rate-limited)
node scripts/fill-onboarding-gaps.mjs

npm run build
```

### Verifying languages you don't speak

1. Run `node scripts/detect-ui-bleed.mjs` — target **0** for customer locales except documented cognates.
2. Run `node scripts/detect-i18n-bleed.mjs` — confirm `frenchBleed=0`.
3. Switch locale in Settings → reload Dashboard, Wallet, Send Money, Transactions, Settings (all tabs), Profile, Onboarding.
4. Confirm top-left account type is localized (not English) for Chichewa/Swahili/etc.
5. Spot-check Chichewa: Settings nav shows **Akaunti**, **Chitetezo**, **Malire** — not Zulu or English.
6. `npm run build` passes.

### Intentional English (all locales)

- Brand names: `Google`, `Apple`, `VaultString`
- Placeholders: `0.00`, `••••••••`, sample emails/names, onboarding income/volume brackets
- French/Portuguese cognates identical to English: *Documentation*, *Archive*, *Date*, *Services*, *Subtotal*, *Notifications*
- LoginHistory mock rows (sample device names/dates until API-backed)
- shadcn/ui primitives (`Close`, pagination sr-only) — shared component library, not customer copy

