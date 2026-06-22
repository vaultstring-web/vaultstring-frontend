# Customer Enterprise UX

Pass 1 focuses on information architecture, layout shell consistency, and decision-first dashboards—without changing backend workflows, APIs, or locale coverage.

## Language & locale IA

### Research-backed recommendation

Enterprise fintech products (Wise, Revolut, Stripe Dashboard, and major retail banks) treat **language / locale as a user preference**, not a disposable feature. It belongs under **Settings** or **Profile → Preferences**, alongside theme and notifications—not removed from the product.

| Pattern | Wise | Revolut | Stripe | Major banks |
|--------|------|---------|--------|-------------|
| Primary control | Profile / Settings | Settings | Account settings | Profile / Settings |
| Dedicated language page | Optional (marketing/help) | Rare | No | Sometimes (accessibility) |
| Locale count | Full product locales | Full | Full | Regional set |

**VaultString decision (Pass 1):**

1. **Keep language in Settings** as the primary control (`/settings` → Language section, all 12 locales, native names in the select).
2. **Keep `/translation`** as an optional secondary browse experience (grid + search) for users who want to compare locales; link from Settings via “Browse all languages”.
3. **Remove Language from the main sidebar** to avoid duplicating Settings; users expect preferences in one place.
4. **Do not remove locale support or reduce locale count**—all 12 codes remain: `en`, `fr`, `pt`, `ar`, `sw`, `am`, `yo`, `ha`, `zu`, `ny`, `zh`, `ja`.
5. **Signup / login** retain `AuthLanguageSelector` (compact select with native names).

Future option (not Pass 1): merge `/translation` into a Settings “Language” tab only if analytics show low traffic on the dedicated page.

## Pass 1 scope

| Area | Change |
|------|--------|
| Navigation | Grouped sidebar (Money / Account), professional labels, language only via Settings |
| Dashboard | Balances, pending actions, recent activity, quick send/deposit; reduced decorative copy |
| Wallet | Overview cards + recent activity strip |
| Transactions | Toolbar search/filters, enterprise list, receipt drawer on row select |
| Settings | Sectioned layout; language preference prominent |
| Send money | Numbered steps, consistent form density |
| Global | `CustomerPageShell`, `vs-card-shell`, neutral palette |
| i18n | New keys in `en.json` + patch sync for other locales |

## Before / after (summary)

| Surface | Before | After |
|---------|--------|--------|
| Sidebar | Flat list; separate “Language” nav item | Grouped **Money** / **Account**; language via Settings |
| Top bar | Heavy slate/indigo, uppercase titles | Compact header aligned with design tokens |
| Dashboard | Rates side note card, scattered CTAs | Pending actions + quick actions + activity-first grid |
| Transactions | Two-column marketing layout, rounded “32px” chrome | Single-column enterprise table shell, sticky list header |
| Settings | Mixed styling | Section cards; language select + link to browse all |
| Send money | Inconsistent step headers | Uniform numbered sections |

## Test checklist (port 3012)

Run `npm run dev` (port **3012**).

- [ ] **Login / signup**: language select shows all 12 locales with native names; changing locale reloads UI strings.
- [ ] **Sidebar**: Money group (Dashboard, Wallet, Send, Transactions); Account group (Compliance, Notifications, Profile, Settings)—no Language item.
- [ ] **Dashboard**: balance card, rates card, quick actions (send, deposit, history, wallets); pending actions when KYC/email/pending tx apply; recent activity links to transactions.
- [ ] **Wallet**: wallet cards, deposit modal i18n, recent activity section.
- [ ] **Transactions**: search, All/Sent/Received tabs, row opens receipt drawer, export CSV, pagination.
- [ ] **Settings**: Language section first-class; “Browse all languages” → `/translation` grid.
- [ ] **Translation page**: grid still works; optional secondary path.
- [ ] **Send money**: steps 1–3 visually consistent; review checkbox + submit.
- [ ] **Build**: `npm run lint && npm run build` pass.

## Files touched (Pass 1)

- `docs/CUSTOMER_ENTERPRISE_UX.md` (this document)
- `src/components/enterprise/CustomerPageShell.tsx`
- `src/components/dashboard/home/PendingActionsCard.tsx`
- `src/components/shared/sidebar.tsx`
- `src/components/shared/topbar.tsx`
- `src/components/dashboard/Dashboard.tsx`
- `src/components/dashboard/transactions/TransactionList.tsx`
- `src/app/transactions/page.tsx`
- `src/app/wallet/page.tsx`
- `src/app/send-money/page.tsx`
- `src/app/settings/page.tsx`
- `src/app/translation/page.tsx`
- `src/messages/en.json`
- `scripts/i18n-patches/customer-enterprise-ui.json`

## Pass 2 — Regression fixes

Addresses post–Pass 1 feedback: logo sizing, chart restoration, i18n wiring, profile language removal, and richer dashboard/wallet surfaces—without childish chrome (`rounded-[40px]`, `font-black`, bounce).

| Area | Change |
|------|--------|
| Logo | Shared `Logo` component (`sidebar`, `auth`, `topbar` sizes); sidebar/auth logos enlarged |
| Dashboard | `BalanceHistoryChart` restored; `DashboardMetricsStrip`; brand accent on balance card |
| Wallet | `WalletOverviewStrip`, compact balance trend chart, clearer action buttons |
| i18n | TopBar search history/clear, Sidebar a11y; locale patches for 12 languages; `NEXT_LOCALE` cookie in `i18n.ts` |
| Profile | **Language tab/selector removed** (Settings + `/translation` + signup only) |
| Settings | Language section visually prominent (`vs-brand-accent-border`, hint copy) |
| Global | `vs-brand-accent-border` utility; chart uses brand green gradient |

### Test checklist (Pass 2)

- [ ] **Logos**: Sidebar, mobile topbar, and auth pages show readable VaultString marks (not tiny).
- [ ] **Dashboard**: Balance history chart, metrics strip, rate card, pending actions, recent activity with amounts/status.
- [ ] **Locale**: Switch language in Settings → sidebar labels, topbar title, dashboard/wallet strings update after reload.
- [ ] **Profile**: No Language tab; Activity/Security show device and audit data; Settings link still works.
- [ ] **Settings**: Language block is first-class; browse link to `/translation`.
- [ ] **Wallet**: Overview strip, mini trend chart, deposit/send actions, recent activity.
- [ ] **Build**: `npm run lint && npm run build`.

### Files touched (Pass 2)

- `src/components/shared/Logo.tsx`
- `src/components/shared/sidebar.tsx`, `topbar.tsx`, `AuthLayout.tsx`
- `src/components/dashboard/Dashboard.tsx`, `home/BalanceHistoryChart.tsx`, `BalanceCard.tsx`, `DashboardMetricsStrip.tsx`
- `src/components/dashboard/wallet/WalletOverviewStrip.tsx`, `WalletCard.tsx`
- `src/app/page.tsx`, `wallet/page.tsx`, `profile/page.tsx`, `settings/page.tsx`
- `src/app/globals.css`, `i18n.ts`, `src/messages/en.json`
- `scripts/i18n-patches/pass2-customer-enterprise-ui.json`, `scripts/apply-i18n-patches.mjs`
- `docs/CUSTOMER_ENTERPRISE_UX.md` (this section)

## Pass 3 — Logo & polish

Visual and functional polish only (no admin locale / `messages/*.json` changes).

| Area | Change |
|------|--------|
| Logo | Larger `sidebar` (h-14–16), `auth` (h-20–24), `topbar` (h-12–14); `object-contain` + `min-w`; `icon` size uses favicon mark |
| Dashboard | Balance history chart full-width card weight; quick actions wired (`/wallet?deposit=1`); button prominence |
| Wallet | Auto-open deposit modal from `?deposit=1`; overview strip unchanged functionally |
| Forex | `unwrapForexHistory` + camelCase rate fields; fixed render-time `setState` in `ForexAnalytics` |
| API | `unwrapForexRates` handles array / envelope / `data` shapes; wallet rate keys tolerate camelCase |
| Top bar | Toned down `font-black`, `rounded-[32px]`, notification bounce |
| Admin | Logo sizes + sidebar/header height only |

### Test checklist (Pass 3)

- [ ] **Logos**: Customer sidebar, mobile topbar, auth, and admin sidebar/login/header show clearly readable marks.
- [ ] **Quick actions**: Deposit opens wallet deposit flow; Send → `/send-money`; History → `/transactions`.
- [ ] **Dashboard**: Chart aligns with other `vs-card-shell` cards; forex widget shows rates after seed.
- [ ] **Settings**: All section nav links scroll to sections.
- [ ] **Build**: `npm run build` (customer), `pnpm build` (admin).

### Files touched (Pass 3)

- `src/components/shared/Logo.tsx`, `sidebar.tsx`, `topbar.tsx`
- `src/components/dashboard/Dashboard.tsx`, `home/*`, `wallet/DepositModal.tsx`, `forex/ForexAnalytics.tsx`
- `src/app/wallet/page.tsx`, `src/lib/api/response.ts`, `src/hooks/useWalletStats.ts`
- `admin/components/shared/Logo.tsx`, `admin/components/dashboard/sidebar.tsx`, `header.tsx`
- `docs/CUSTOMER_ENTERPRISE_UX.md` (this section)
