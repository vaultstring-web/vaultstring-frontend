// app/page.tsx
'use client';

import { useMemo, useEffect } from 'react';
import Dashboard from '@/src/components/dashboard/Dashboard';
import { useAuth } from '@/src/context/AuthContext';
import { useWalletStats } from '@/src/hooks/useWalletStats';
import { useTransactions } from '@/src/hooks/useTransactions';
import type { Transaction, TransactionStatus } from '@/src/types/types';
import { EXCHANGE_RATE_MWK_TO_CNY, EXCHANGE_RATE_CNY_TO_MWK } from '@/src/lib/constants';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const { user } = useAuth();
  const router = useRouter();
  const { stats: walletStats, rates, rateDetails, refetch } = useWalletStats();
  const { transactions: payments } = useTransactions(20);

  useEffect(() => {
    const id = setInterval(() => {
      refetch();
    }, 60000);
    return () => clearInterval(id);
  }, [refetch]);

  const recentTransactions: Transaction[] = useMemo(() => {
    return payments.map((t, idx) => {
      // Helper to safely get rate or default
      const getRate = (pair: string, defaultRate: number) => rates[pair] ?? defaultRate;
      
      const mwkToCny = getRate('MWK-CNY', EXCHANGE_RATE_MWK_TO_CNY);
      const cnyToMwk = getRate('CNY-MWK', EXCHANGE_RATE_CNY_TO_MWK);
      
      return {
        id: String(t.id || t.reference || `${t.created_at || t.initiated_at || 'tx'}-${idx}`),
        date: String(t.created_at || t.initiated_at || new Date().toISOString()),
        merchantName: String(t.description || t.category || 'Payment'),
        merchantId: String(t.receiver_id || ''),
        amountMWK: Math.round(parseFloat(String(t.net_amount ?? t.amount ?? 0)) * (String(t.currency).toUpperCase() === 'CNY' ? cnyToMwk : 1)),
        amountCNY: Math.round(parseFloat(String(t.net_amount ?? t.amount ?? 0)) * (String(t.currency).toUpperCase() === 'MWK' ? mwkToCny : 1)),
        exchangeRate: mwkToCny,
        status: (String(t.status || 'completed') as TransactionStatus),
        type: 'payment' as const,
      };
    });
  }, [payments, rates]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {user?.kycStatus !== 'verified' && (
        <div 
          onClick={() => router.push('/onboarding')}
          className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900 dark:text-amber-200">{t('verificationRequired')}</p>
              <p className="text-xs text-amber-700 dark:text-amber-400">{t('verificationSubtitle')}</p>
            </div>
          </div>
          <ArrowRight size={20} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
        </div>
      )}

      <Dashboard 
        user={user ?? { name: 'User', email: '', phone: '', kycStatus: 'verified', avatarUrl: '' }} 
        wallet={walletStats} 
        recentTransactions={recentTransactions} 
        rates={rates}
        rateDetails={rateDetails}
        onRefresh={refetch}
      />
    </div>
  );
}
