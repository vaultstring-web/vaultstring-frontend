'use client';

import Link from 'next/link';
import { ArrowDownLeft, ArrowUpRight, History, Wallet } from 'lucide-react';
import { useTranslations } from 'next-intl';

const actions = [
  { href: '/send-money', icon: ArrowUpRight, key: 'send' as const },
  { href: '/wallet?deposit=1', icon: ArrowDownLeft, key: 'deposit' as const },
  { href: '/transactions', icon: History, key: 'history' as const },
  { href: '/wallet', icon: Wallet, key: 'wallets' as const },
];

export default function DashboardQuickActions() {
  const t = useTranslations('Dashboard.quickActions');

  return (
    <div className="vs-card-shell vs-brand-accent-border p-5">
      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {t('title')}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions.map(({ href, icon: Icon, key }) => (
          <Link
            key={key}
            href={href}
            className="flex flex-col items-center gap-2.5 rounded-lg border border-border bg-background px-3 py-4 text-center shadow-sm transition-colors hover:border-primary/30 hover:bg-muted/50"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </span>
            <span className="text-sm font-medium text-foreground">{t(key)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
