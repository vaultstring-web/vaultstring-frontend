// src/components/dashboard/Dashboard.tsx

'use client';



import dynamic from 'next/dynamic';

import { UserProfile, WalletStats, Transaction, ExchangeRateDetail } from '@/src/types/types';

import BalanceCard from '@/src/components/dashboard/home/BalanceCard';

import RateCard from '@/src/components/dashboard/home/RateCard';

import CurrencyConverter from '@/src/components/dashboard/home/CurrencyConverter';

import WalletDataEmptyState from '@/src/components/dashboard/home/WalletDataEmptyState';
import MoneySourcesProviders from '@/src/components/dashboard/money-sources/MoneySourcesProviders';
import Link from 'next/link';



const ForexAnalytics = dynamic(() => import('@/src/components/dashboard/forex/ForexAnalytics'), {

  ssr: false,

  loading: () => <div className="h-[320px] w-full animate-pulse rounded-2xl bg-muted/20" />,

});

import DashboardMetricsStrip from '@/src/components/dashboard/home/DashboardMetricsStrip';

import DashboardQuickActions from '@/src/components/dashboard/home/DashboardQuickActions';

import PendingActionsCard from '@/src/components/dashboard/home/PendingActionsCard';

import { PageHeader } from '@/src/components/enterprise/PageHeader';

import { CustomerPageShell } from '@/src/components/enterprise/CustomerPageShell';

import { useTranslations } from 'next-intl';



const RecentActivityList = dynamic(() => import('@/src/components/dashboard/home/RecentActivityList'), {

  ssr: false,

  loading: () => <div className="h-80 w-full animate-pulse rounded-lg bg-muted/40" />,

});



interface DashboardProps {

  user: UserProfile;

  wallet: WalletStats;

  recentTransactions: Transaction[];

  rates?: Record<string, number>;

  rateDetails?: Record<string, ExchangeRateDetail>;

  onRefresh?: () => void;

  pendingTransactionCount?: number;

  emailVerificationDisabled?: boolean;

  walletCount?: number;

  primaryWalletId?: string;

  walletsLoading?: boolean;

  walletFetchError?: string | null;
  forexDataMode?: 'live' | 'seed';
}



const Dashboard: React.FC<DashboardProps> = ({

  user,

  wallet,

  recentTransactions,

  rates,

  rateDetails,

  onRefresh,

  pendingTransactionCount = 0,

  emailVerificationDisabled = false,

  walletCount = 0,

  primaryWalletId,

  walletsLoading = false,

  walletFetchError = null,
  forexDataMode = 'seed',
}) => {

  const t = useTranslations('Dashboard');

  const currency = wallet.primaryCurrency;

  const showEmptyState =

    !walletsLoading && walletCount === 0 && (wallet.balanceMWK === 0 && wallet.balanceCNY === 0);



  const primaryBalance =
    currency === 'CNY' ? wallet.balanceCNY : wallet.balanceMWK;

  return (

    <CustomerPageShell compact>

      <PageHeader title={t('title')} description={t('subtitle')} />



      {showEmptyState ? <WalletDataEmptyState fetchError={walletFetchError} /> : null}



      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        <BalanceCard wallet={wallet} />

        <RateCard rates={rates} primaryCurrency={currency} />

      </div>



      <DashboardMetricsStrip

        wallet={wallet}

        walletCount={walletCount}

        pendingCount={pendingTransactionCount}

      />



      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ForexAnalytics
          rates={rates ?? {}}
          rateDetails={rateDetails}
          primaryCurrency={currency}
          dataMode={forexDataMode}
          onRefresh={onRefresh}
          compact
          className="min-h-0"
        />
        <CurrencyConverter rates={rates} primaryCurrency={currency} compact />
      </div>

      {!showEmptyState && walletCount > 0 ? (
        <section className="vs-card-shell space-y-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-foreground">{t('moneySources.title')}</h3>
              <p className="text-xs text-muted-foreground">{t('moneySources.subtitle')}</p>
            </div>
            <Link
              href="/wallet"
              className="text-xs font-medium text-primary hover:underline"
            >
              {t('moneySources.viewWallet')}
            </Link>
          </div>
          <MoneySourcesProviders
            mode="funding"
            currency={currency}
            walletBalance={primaryBalance}
            value="airtel_money"
            onChange={() => {}}
            excludeWalletBalance
            maxVisible={3}
            readOnly
            layout="grid"
          />
        </section>
      ) : null}



      <PendingActionsCard

        user={user}

        pendingCount={pendingTransactionCount}

        emailVerificationDisabled={emailVerificationDisabled}

      />



      <DashboardQuickActions />



      <RecentActivityList recentTransactions={recentTransactions} />

    </CustomerPageShell>

  );

};



export default Dashboard;

