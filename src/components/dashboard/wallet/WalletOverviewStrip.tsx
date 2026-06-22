'use client';

import Link from 'next/link';
import { ArrowDownLeft, ArrowUpRight, MinusCircle, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Wallet } from '@/src/hooks/useWalletStats';
import { formatCurrency } from '@/src/lib/utils/formatters';
import { Button } from '@/src/components/ui/button';

interface WalletOverviewStripProps {
  wallets: Wallet[];
  onAddWallet?: () => void;
  onDeposit?: () => void;
  onWithdraw?: () => void;
}

export default function WalletOverviewStrip({ wallets, onAddWallet, onDeposit, onWithdraw }: WalletOverviewStripProps) {
  const t = useTranslations('Wallet.overview');

  const totalByCurrency = wallets.reduce<Record<string, number>>((acc, w) => {
    const cur = String(w.currency).toUpperCase();
    const bal = parseFloat(String(w.available_balance ?? w.balance ?? 0));
    acc[cur] = (acc[cur] ?? 0) + bal;
    return acc;
  }, {});

  const totals = Object.entries(totalByCurrency).slice(0, 3);

  return (
    <div className="vs-card-shell vs-brand-accent-border flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t('title')}
        </p>
        <div className="flex flex-wrap gap-4">
          {totals.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('empty')}</p>
          ) : (
            totals.map(([currency, amount]) => (
              <div key={currency}>
                <p className="text-xs text-muted-foreground">{currency}</p>
                <p className="text-lg font-semibold tracking-tight text-foreground">
                  {formatCurrency(amount, currency)}
                </p>
              </div>
            ))
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {t('walletCount', { count: wallets.length })}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="default">
          <Link href="/send-money">
            <ArrowUpRight className="mr-2 h-4 w-4" />
            {t('send')}
          </Link>
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onDeposit} disabled={!onDeposit}>
          <ArrowDownLeft className="mr-2 h-4 w-4" />
          {t('deposit')}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onWithdraw} disabled={!onWithdraw}>
          <MinusCircle className="mr-2 h-4 w-4" />
          {t('withdraw')}
        </Button>
        {onAddWallet ? (
          <Button type="button" size="sm" variant="secondary" onClick={onAddWallet}>
            <Plus className="mr-2 h-4 w-4" />
            {t('addWallet')}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
