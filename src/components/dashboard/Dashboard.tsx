// src/components/dashboard/Dashboard.tsx
'use client';

import dynamic from 'next/dynamic';
import { UserProfile, WalletStats, Transaction, ExchangeRateDetail } from '@/src/types/types';
import BalanceCard from '@/src/components/dashboard/home/BalanceCard';
import RateCard from '@/src/components/dashboard/home/RateCard';
import CurrencyConverter from '@/src/components/dashboard/home/CurrencyConverter';

// Lazy load heavy dashboard sections
const ForexAnalytics = dynamic(() => import('@/src/components/dashboard/forex/ForexAnalytics'), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full animate-pulse bg-muted/20 rounded-2xl" />
});

const RecentActivityList = dynamic(() => import('@/src/components/dashboard/home/RecentActivityList'), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full animate-pulse bg-muted/20 rounded-2xl" />
});


interface DashboardProps {
  user: UserProfile;
  wallet: WalletStats;
  recentTransactions: Transaction[];
  rates?: Record<string, number>;
  rateDetails?: Record<string, ExchangeRateDetail>;
  onRefresh?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, wallet, recentTransactions, rates, rateDetails, onRefresh }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Top Row: Balance & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Balance Card - Takes 2/3 on Desktop */}
        <BalanceCard wallet={wallet} />

        {/* Rate Info Card - Takes 1/3 on Desktop */}
        <RateCard rates={rates} primaryCurrency={wallet.primaryCurrency} />
      </div>

      {/* Currency Converter Section */}
      <CurrencyConverter rates={rates} primaryCurrency={wallet.primaryCurrency} />

      {/* Chart & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats Chart */}
        <div className="lg:col-span-2">
           <ForexAnalytics 
              rates={rates || {}} 
              rateDetails={rateDetails} 
              primaryCurrency={wallet.primaryCurrency}
              onRefresh={onRefresh}
           />
        </div>

        {/* Recent Transactions List */}
        <RecentActivityList recentTransactions={recentTransactions} />
      </div>

    </div>
  );
};

export default Dashboard;

