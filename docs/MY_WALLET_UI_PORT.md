# My-Wallet UI port (VaultString frontend)

Reference prototype: `c:\Users\gondwe\Desktop\VaultString\Projects\my-wallet` (manual copy from branch; no `my-wallent` folder found).

## What was ported

| my-wallet pattern | VaultString implementation |
|-------------------|---------------------------|
| Sticky wallet header + balance summary (`app/wallet/page.tsx`) | `WalletBalanceHeader` + compact `PageHeader` |
| Balance show/hide (`BalanceToggle` + `useBalanceVisibility`) | `src/hooks/useBalanceVisibility.ts`, `BalanceToggle.tsx` |
| Currency cards grid (`CurrencyCard`) | Existing `WalletCard` grid (kept API-backed data) |
| Deposit method picker cards (`DepositModal` step `method`) | `MoneySourcesProviders` + `DepositModal` |
| Linked payment methods list (`dashboard/Wallet.tsx`) | Dashboard preview + Wallet “Deposit from” + Settings connected accounts |
| Provider logos (`/images/airtel-money.png`, etc.) | SVG placeholders in `public/images/*.svg` + `provider-images.ts` |
| Transaction list (`TransactionHistory`) | `WalletRecentActivity` (API via `useTransactions`) |
| Send flow 3-step stepper (`SendMoney.tsx`) | `SendMoneyStepper` + 2-step Details → Review on `/send-money` |
| Less vertical scroll | `CustomerPageShell` `compact` on dashboard, wallet, transactions, notifications, profile |
| Exchange / forex widget | **Dashboard only** (`ForexAnalytics` + `CurrencyConverter`); removed from `/wallet` |

## Dropped from pages

| Page | Removed |
|------|---------|
| `/wallet` | `BalanceHistoryChart`, full-width forex converter |
| `/` (dashboard) | `BalanceHistoryChart` (~360px) — forex + converter kept in 2-col row |
| `/profile` | Duplicate `PageHeader`, activity tab stat trio above device lists |

## Component map

```
my-wallet/app/wallet/page.tsx
  → vaultstring-frontend/src/app/wallet/page.tsx

my-wallet/src/components/wallet/DepositModal.tsx (method cards)
  → MoneySourcesProviders (layout=list in DepositModal)

my-wallet/src/components/dashboard/Wallet.tsx (linked methods + PNG logos)
  → MoneySourcesProviders + public/images/*.svg

my-wallet/src/components/dashboard/SendMoney.tsx (stepper)
  → SendMoneyStepper + send-money/page.tsx

Shared:
  src/components/dashboard/money-sources/MoneySourcesProviders.tsx
  src/lib/constants/money-sources.ts
  src/lib/constants/provider-images.ts
  src/lib/constants/funding.ts (provider IDs for API)
```

## Assets

**my-wallet `public/`:** no PNG/JPEG provider files in the copied tree.

**Referenced in my-wallet code but missing from repo:**

| my-wallet path | VaultString asset |
|----------------|-------------------|
| `/images/airtel-money.png` | `/images/airtel-money.svg` |
| `/images/national-bank.png` | `/images/national-bank.svg` |
| `/images/tnm-mpamba.png` | `/images/tnm-mpamba.svg` |

Replace SVGs with brand PNGs when available; extend `PROVIDER_IMAGE_URLS` in `src/lib/constants/provider-images.ts`.

## API integration — props, IDs, and env

### Customer UI → request body

| UI surface | React prop / state | API field | Example values |
|------------|-------------------|-----------|----------------|
| `DepositModal` | `sourceId` | `POST /wallets/{id}/deposit` → `source_id` | `airtel_money`, `tnm_mpamba`, `nbm`, `visa_mastercard` |
| `useSendMoneyForm` | `fundingSource` | payment create → funding source | same as `getFundingOptions()` `value` |
| `useSendMoneyForm` | `payoutMethod` | payment create → payout method | same as `getPayoutOptions()` `value` |
| `WithdrawModal` (legacy select) | `sourceId` | withdraw payload `source_id` | `bank-1`, `card-1` (sandbox-linked account stubs) |

Funding/payout IDs are defined in `src/lib/constants/funding.ts` (`getFundingOptions`, `getPayoutOptions`).  
`MoneySourcesProviders` passes `value` / `onChange` through unchanged — no extra mapping layer in the UI.

### MWK deposit providers (full deposit list)

| `value` (source_id) | Label | Logo |
|---------------------|-------|------|
| `wallet_balance` | VaultString wallet | emoji/icon |
| `airtel_money` | Airtel Money | `/images/airtel-money.svg` |
| `tnm_mpamba` | TNM Mpamba | `/images/tnm-mpamba.svg` |
| `nbm` | National Bank of Malawi | `/images/national-bank.svg` |
| `standard_bank_mw`, `fdh_bank`, `nbs_bank`, … | other banks | icon fallback |
| `visa_mastercard` | card | icon fallback |

Settings **connected accounts** uses the same `getFundingOptions()` list with `excludeWalletBalance` (external sources only, same IDs as deposit).

### Backend / sandbox (not in frontend `.env`)

| Variable | Where | Role |
|----------|-------|------|
| `MONEY_API_ENABLED` | `kyd-payment-system` | When true, deposit runs sandbox/live collect before ledger credit |
| `MONEY_API_PROVIDER` | `kyd-payment-system` | `sandbox` (default) or live adapter name |
| `MONEY_API_SANDBOX_AUTO_SUCCEED` | `kyd-payment-system` | Force successful collect in dev |

Customer deposit sends **funding provider IDs** (`airtel_money`, …).  
Withdraw UI still exposes **`bank-1` / `card-1`** as linked-account placeholders for sandbox withdraw paths (see `WithdrawModal.tsx`). Align withdraw with `MoneySourcesProviders` when linked-accounts API exists.

### Frontend env (gateway / auth only)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_GATEWAY_URL` | API base (rewrites to payment service) |
| `NEXT_PUBLIC_DISABLE_EMAIL_VERIFICATION` | Dashboard pending-actions banner |
| `NEXT_PUBLIC_BYPASS_EMAIL_VERIFICATION` | same |

No env var overrides per provider ID today — IDs are code constants until `GET /user/payment-methods` (or similar) returns linked accounts.

### Admin provider keys (future)

| Endpoint | UI |
|----------|-----|
| `GET/POST/DELETE /api/v1/admin/api-keys` | Admin Settings → API Keys |
| `POST /api/v1/providers/keys` | noted in customer Settings copy |

## Page behavior (this pass)

### `/` Dashboard

- `CustomerPageShell compact`
- Balance + rate row, metrics, **forex + converter** (no balance history chart)
- Linked methods preview (`MoneySourcesProviders`, top 3, read-only) → link to `/wallet`

### `/wallet`

- Deposit sources with logos; no forex block

### `/settings` → Connected accounts

- Full external funding list (same IDs as deposit, no `wallet_balance`)

### `/transactions`, `/notifications`, `/profile`

- `CustomerPageShell compact`; profile activity tab without redundant stat cards

## Files changed (latest pass)

- `public/images/airtel-money.svg`, `national-bank.svg`, `tnm-mpamba.svg`
- `src/lib/constants/provider-images.ts`
- `src/lib/constants/funding.ts` (`imageUrl?` on `FundingOption`)
- `src/components/dashboard/money-sources/MoneySourcesProviders.tsx` (images, `excludeWalletBalance`)
- `src/components/dashboard/Dashboard.tsx`
- `src/app/wallet/page.tsx`
- `src/app/settings/page.tsx`
- `src/app/transactions/page.tsx`
- `src/app/notifications/page.tsx`
- `src/app/profile/page.tsx`
- `src/messages/en.json` (`Dashboard.moneySources`)
- `docs/MY_WALLET_UI_PORT.md`

## Build

```bash
cd vaultstring-frontend
npm run build
```

## Local test URLs (port 3012)

| Page | URL |
|------|-----|
| Dashboard | http://localhost:3012/ |
| Wallet | http://localhost:3012/wallet |
| Wallet deposit deep-link | http://localhost:3012/wallet?deposit=1 |
| Send money | http://localhost:3012/send-money |
| Transactions | http://localhost:3012/transactions |
| Notifications | http://localhost:3012/notifications |
| Profile | http://localhost:3012/profile |
| Settings (connected accounts) | http://localhost:3012/settings#connected-accounts |

Requires stack up per `docs/LOCAL_TESTING.md` (gateway on 9000, `pnpm dev` in `vaultstring-frontend`).
