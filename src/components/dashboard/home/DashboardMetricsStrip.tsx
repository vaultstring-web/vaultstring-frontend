'use client';

import { Wallet, Clock, TrendingUp } from 'lucide-react';
import { WalletStats } from '@/src/types/types';
import { useTranslations } from 'next-intl';

interface DashboardMetricsStripProps {
  wallet: WalletStats;
  walletCount?: number;
  pendingCount?: number;
}

export default function DashboardMetricsStrip({
  wallet,
  walletCount = 0,
  pendingCount = 0,
}: DashboardMetricsStripProps) {
  const t = useTranslations('Dashboard.metrics');
  const primary =
    wallet.primaryCurrency === 'CNY' ? (wallet.balanceCNY ?? 0) : (wallet.balanceMWK ?? 0);
  const code = wallet.primaryCurrency === 'CNY' ? 'CNY' : 'MWK';
  const spent = wallet.spentThisMonth ?? 0;
  const limit = wallet.monthlyLimit ?? 0;
  const limitPct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : null;

  const items = [
    {
      label: t('activeWallets'),
      value: String(walletCount),
      icon: Wallet,
      accent: 'text-primary',
    },
    {
      label: t('pendingTransfers'),
      value: String(pendingCount),
      icon: Clock,
      accent: pendingCount > 0 ? 'text-amber-600' : 'text-muted-foreground',
    },
    {
      label: t('primaryBalance'),
      value: `${code} ${primary.toLocaleString()}`,
      icon: TrendingUp,
      accent: 'text-emerald-600 dark:text-emerald-400',
    },
    ...(limitPct !== null
      ? [
          {
            label: t('monthlyUsage'),
            value: `${limitPct}%`,
            icon: TrendingUp,
            accent: 'text-muted-foreground',
          },
        ]
      : []),
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map(({ label, value, icon: Icon, accent }) => (
        <div key={label} className="vs-stat-card flex items-start gap-3">
          <div className="vs-icon-circle">
            <Icon className={accent} size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-0.5 truncate text-xl font-semibold tabular-nums text-foreground">
              {value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
