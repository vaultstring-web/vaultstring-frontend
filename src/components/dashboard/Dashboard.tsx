// src/components/dashboard/Dashboard.tsx
'use client';

import { UserProfile, WalletStats, Transaction } from '@/src/types/types';
import BalanceCard from '@/src/components/dashboard/home/BalanceCard';
import RateCard from '@/src/components/dashboard/home/RateCard';
import CurrencyConverter from '@/src/components/dashboard/home/CurrencyConverter';
import BalanceHistoryChart from '@/src/components/dashboard/home/BalanceHistoryChart';
import RecentActivityList from '@/src/components/dashboard/home/RecentActivityList';


interface DashboardProps {
  user: UserProfile;
  wallet: WalletStats;
  recentTransactions: Transaction[];
  rates?: { mwkToCny?: number; cnyToMwk?: number };
}

const Dashboard: React.FC<DashboardProps> = ({ user, wallet, recentTransactions, rates }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Top Row: Balance & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Balance Card - Takes 2/3 on Desktop */}
        <BalanceCard wallet={wallet} />

        {/* Rate Info Card - Takes 1/3 on Desktop */}
        <RateCard rates={rates} />
      </div>

      {/* Currency Converter Section */}
      <CurrencyConverter rates={rates} />

      {/* Chart & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats Chart */}
        <BalanceHistoryChart wallet={wallet} />

        {/* Recent Transactions List */}
        <RecentActivityList recentTransactions={recentTransactions} />
      </div>

    </div>
  );
};

export default Dashboard;

