// app/dashboard/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Dashboard from '@/src/components/dashboard/Dashboard';
import { EXCHANGE_RATE_MWK_TO_CNY, EXCHANGE_RATE_CNY_TO_MWK } from '@/src/lib/constants';
import { apiFetch, isAuthenticated } from '@/src/lib/api/api-client';
import { useAuth } from '@/src/context/AuthContext';
import type { Transaction, TransactionStatus } from '@/src/types/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [rates, setRates] = useState<{ mwkToCny?: number; cnyToMwk?: number; usdToMwk?: number }>({});

  useEffect(() => {
    let mounted = true;
    
    // Only fetch data if user is authenticated (or attempting to load)
    // Adding user as dependency ensures we re-fetch when auth state settles
    
    (async () => {
      try {
        const [wRes, pRes, rRes, uRes] = await Promise.all([
          apiFetch('/wallets', { cache: 'no-store' }).catch(() => null),
          apiFetch('/payments?limit=20&offset=0', { cache: 'no-store' }).catch(() => null),
          apiFetch('/forex/rate/MWK/CNY', { cache: 'no-store' }).catch(() => null),
          apiFetch('/forex/rate/USD/MWK', { cache: 'no-store' }).catch(() => null),
        ]);
        if (!mounted) return;
        setWallets(Array.isArray(wRes?.wallets) ? wRes.wallets : []);
        setPayments(Array.isArray(pRes?.transactions) ? pRes.transactions : []);
        const rate = typeof rRes?.rate === 'number' ? rRes.rate : EXCHANGE_RATE_MWK_TO_CNY;
        const usdRate = typeof uRes?.rate === 'number' ? uRes.rate : 1745;
        setRates({ mwkToCny: rate, cnyToMwk: rate ? 1 / rate : EXCHANGE_RATE_CNY_TO_MWK, usdToMwk: usdRate });
      } catch {}
    })();
    return () => { mounted = false; };
  }, [user]); // Re-run when user profile loads/updates

  const walletStats = useMemo(() => {
    const totalMWK = wallets.reduce((sum, w) => {
      const bal = parseFloat(String(w.available_balance ?? w.balance ?? 0));
      if (String(w.currency).toUpperCase() === 'MWK') return sum + bal;
      if (String(w.currency).toUpperCase() === 'CNY') return sum + bal * (rates.cnyToMwk || EXCHANGE_RATE_CNY_TO_MWK);
      if (String(w.currency).toUpperCase() === 'USD') return sum + bal * (rates.usdToMwk || 1745);
      return sum + bal;
    }, 0);
    const totalCNY = wallets.reduce((sum, w) => {
      const bal = parseFloat(String(w.available_balance ?? w.balance ?? 0));
      const cur = String(w.currency).toUpperCase();
      if (cur === 'CNY') return sum + bal;
      if (cur === 'MWK') return sum + bal * (rates.mwkToCny || EXCHANGE_RATE_MWK_TO_CNY);
      if (cur === 'USD') {
        const usdToMwk = (rates.usdToMwk || 1745);
        const mwkToCny = (rates.mwkToCny || EXCHANGE_RATE_MWK_TO_CNY);
        return sum + bal * usdToMwk * mwkToCny;
      }
      return sum + bal;
    }, 0);
    const countryCode = String(user?.countryCode || '').toUpperCase();
    const primaryCurrency = countryCode === 'CN' ? 'CNY' : 'MWK';
    return {
      balanceMWK: Math.round(totalMWK),
      balanceCNY: Math.round(totalCNY),
      primaryCurrency: primaryCurrency as any,
      lastDepositDate: new Date().toISOString().slice(0, 10),
      monthlyLimit: 5000000,
      spentThisMonth: Math.round((primaryCurrency === 'CNY' ? totalCNY : totalMWK) * 0.15),
    };
  }, [wallets, rates, user]);

  const recentTransactions: Transaction[] = useMemo(() => {
    return payments.map((t: any) => ({
      id: String(t.id || t.reference || Math.random()),
      date: String(t.created_at || t.initiated_at || new Date().toISOString()),
      merchantName: String(t.description || t.category || 'Payment'),
      merchantId: String(t.receiver_id || ''),
      amountMWK: Math.round(parseFloat(String(t.net_amount ?? t.amount ?? 0)) * (String(t.currency).toUpperCase() === 'CNY' ? (rates.cnyToMwk || EXCHANGE_RATE_CNY_TO_MWK) : 1)),
      amountCNY: Math.round(parseFloat(String(t.converted_amount ?? 0))),
      exchangeRate: Number(rates.mwkToCny || EXCHANGE_RATE_MWK_TO_CNY),
      status: (String(t.status || 'completed') as TransactionStatus),
      type: 'payment' as const,
    }));
  }, [payments, rates]);

  return (
    <Dashboard 
      user={user ?? { name: 'User', email: '', phone: '', kycStatus: 'verified', avatarUrl: '/icons/avatar-default.png' }} 
      wallet={walletStats} 
      recentTransactions={recentTransactions} 
      rates={rates}
    />
  );
}
