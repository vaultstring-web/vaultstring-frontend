// app/dashboard/page.tsx
'use client';

import { useMemo, useEffect } from 'react';
import Dashboard from '@/src/components/dashboard/Dashboard';
import { useAuth } from '@/src/context/AuthContext';
import { useWalletStats } from '@/src/hooks/useWalletStats';
import { useTransactions } from '@/src/hooks/useTransactions';
import type { Transaction, TransactionStatus } from '@/src/types/types';
import { EXCHANGE_RATE_MWK_TO_CNY, EXCHANGE_RATE_CNY_TO_MWK } from '@/src/lib/constants';

export default function DashboardPage() {
  const { user } = useAuth();
  const { stats: walletStats, rates, rateDetails, refetch } = useWalletStats();
  const { transactions: payments } = useTransactions(20);

  useEffect(() => {
    const id = setInterval(() => {
      refetch();
    }, 60000);
    return () => clearInterval(id);
  }, [refetch]);

  const recentTransactions: Transaction[] = useMemo(() => {
    return payments.map((t) => {
      // Helper to safely get rate or default
      const getRate = (pair: string, defaultRate: number) => rates[pair] ?? defaultRate;
      
      const mwkToCny = getRate('MWK-CNY', EXCHANGE_RATE_MWK_TO_CNY);
      const cnyToMwk = getRate('CNY-MWK', EXCHANGE_RATE_CNY_TO_MWK);
      
      return {
        id: String(t.id || t.reference || Math.random()),
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
    <Dashboard 
      user={user ?? { name: 'User', email: '', phone: '', kycStatus: 'verified', avatarUrl: '/icons/avatar-default.png' }} 
      wallet={walletStats} 
      recentTransactions={recentTransactions} 
      rates={rates}
      rateDetails={rateDetails}
      onRefresh={refetch}
    />
  );
}
