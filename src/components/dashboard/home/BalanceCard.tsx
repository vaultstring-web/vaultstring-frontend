import Link from 'next/link';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { WalletStats } from '@/src/types/types';
import { useTranslations } from 'next-intl';

interface BalanceCardProps {
  wallet: WalletStats;
}

export default function BalanceCard({ wallet }: BalanceCardProps) {
  const t = useTranslations('Dashboard');
  const amount =
    wallet.primaryCurrency === 'CNY'
      ? (wallet.balanceCNY ?? 0)
      : (wallet.balanceMWK ?? 0);
  const code = wallet.primaryCurrency === 'CNY' ? 'CNY' : 'MWK';

  return (
    <div className="vs-hero-card relative overflow-hidden p-6 text-primary-foreground lg:col-span-2">
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/5 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-20 w-full bg-gradient-to-t from-black/15 to-transparent"
        aria-hidden
      />
      <div className="relative z-10 flex flex-col justify-between gap-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-primary-foreground/70">
            {t('totalAvailableBalance')}
          </p>
          <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight sm:text-4xl">
            {code} {amount.toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/send-money"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-foreground px-4 py-2.5 text-sm font-semibold text-primary shadow-sm transition-opacity hover:opacity-90"
          >
            <ArrowUpRight size={16} />
            {t('sendMoney')}
          </Link>
          <Link
            href="/wallet?deposit=1"
            className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/25 bg-primary-foreground/10 px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/20"
          >
            <ArrowDownLeft size={16} />
            {t('addFunds')}
          </Link>
        </div>
      </div>
    </div>
  );
}
