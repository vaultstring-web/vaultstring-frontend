'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Wallet as WalletType } from '@/src/hooks/useWalletStats';
import { formatCurrency } from '@/src/lib/utils/formatters';
import { useBalanceVisibility } from '@/src/hooks/useBalanceVisibility';
import BalanceToggle from '@/src/components/dashboard/wallet/BalanceToggle';

interface WalletBalanceHeaderProps {
  wallets: WalletType[];
  primaryCurrency?: string;
}

export default function WalletBalanceHeader({ wallets, primaryCurrency }: WalletBalanceHeaderProps) {
  const t = useTranslations('Wallet.balanceHeader');
  const { visible } = useBalanceVisibility();

  const totals = useMemo(() => {
    return wallets.reduce<Record<string, number>>((acc, w) => {
      const cur = String(w.currency).toUpperCase();
      const bal = parseFloat(String(w.available_balance ?? w.balance ?? 0));
      acc[cur] = (acc[cur] ?? 0) + bal;
      return acc;
    }, {});
  }, [wallets]);

  const primary = primaryCurrency ?? Object.keys(totals)[0] ?? 'MWK';
  const primaryTotal = totals[primary] ?? 0;
  const currencyCount = Object.keys(totals).length;

  return (
    <div className="vs-card-shell vs-brand-accent-border rounded-xl bg-gradient-to-br from-primary/8 to-primary/3 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t('totalBalance')}
          </p>
          <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {visible ? formatCurrency(primaryTotal, primary) : '•••••••'}
          </p>
        </div>
        <BalanceToggle />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(totals)
          .slice(0, 4)
          .map(([cur, amount]) => (
            <div key={cur} className="rounded-lg bg-background/60 px-3 py-2">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {cur}
              </p>
              <p className="text-sm font-semibold text-foreground">
                {visible ? formatCurrency(amount, cur) : '••••'}
              </p>
            </div>
          ))}
        <div className="rounded-lg bg-background/60 px-3 py-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {t('currencies')}
          </p>
          <p className="text-sm font-semibold text-foreground">{currencyCount}</p>
        </div>
        <div className="rounded-lg bg-background/60 px-3 py-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {t('status')}
          </p>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {t('active')}
          </span>
        </div>
      </div>
    </div>
  );
}
