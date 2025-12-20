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
  const [rates, setRates] = useState<{
    mwkToCny?: number;
    cnyToMwk?: number;
    mwkToCnyBuy?: number;
    mwkToCnySell?: number;
    cnyToMwkBuy?: number;
    cnyToMwkSell?: number;
  }>({});

  useEffect(() => {
    let mounted = true;
    if (!isAuthenticated()) return;
    (async () => {
      try {
        const [wRes, pRes, rMWKCNY, rCNYMWK] = await Promise.all([
          apiFetch('/wallets').catch(() => null),
          apiFetch('/payments?limit=20&offset=0').catch(() => null),
          apiFetch('/forex/rate/MWK/CNY').catch(() => null),
          apiFetch('/forex/rate/CNY/MWK').catch(() => null),
        ]);
        if (!mounted) return;
        setWallets(Array.isArray(wRes?.wallets) ? wRes.wallets : []);
        setPayments(Array.isArray(pRes?.transactions) ? pRes.transactions : []);
        const base = typeof rMWKCNY?.rate === 'number' ? rMWKCNY.rate : EXCHANGE_RATE_MWK_TO_CNY;
        const buy = typeof rMWKCNY?.buy_rate === 'number' ? rMWKCNY.buy_rate : base;
        const sell = typeof rMWKCNY?.sell_rate === 'number' ? rMWKCNY.sell_rate : base;
        const invBase = typeof rCNYMWK?.rate === 'number' ? rCNYMWK.rate : (buy ? 1 / buy : EXCHANGE_RATE_CNY_TO_MWK);
        const invBuy = typeof rCNYMWK?.buy_rate === 'number' ? rCNYMWK.buy_rate : invBase;
        const invSell = typeof rCNYMWK?.sell_rate === 'number' ? rCNYMWK.sell_rate : invBase;
        setRates({
          mwkToCny: buy,
          cnyToMwk: buy ? 1 / buy : EXCHANGE_RATE_CNY_TO_MWK,
          mwkToCnyBuy: buy,
          mwkToCnySell: sell,
          cnyToMwkBuy: invBuy,
          cnyToMwkSell: invSell,
        });
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  const walletStats = useMemo(() => {
    let totalMWK = 0;
    let totalCNY = 0;
    let totalUSD = 0;
    wallets.forEach((w) => {
      const bal = parseFloat(String(w.available_balance ?? w.balance ?? 0));
      const cur = String(w.currency).toUpperCase();
      if (cur === 'MWK') totalMWK += bal;
      else if (cur === 'CNY') totalCNY += bal;
      else if (cur === 'USD') totalUSD += bal;
    });
    const country = String(user?.countryCode || '').trim().toUpperCase();
    const primaryCurrency = country === 'CN' ? 'CNY' : country === 'MW' ? 'MWK' : (String(wallets[0]?.currency || 'MWK').toUpperCase());
    return {
      balanceMWK: Math.round(totalMWK),
      balanceCNY: Math.round(totalCNY),
      balanceUSD: Math.round(totalUSD),
      primaryCurrency: primaryCurrency as any,
      lastDepositDate: new Date().toISOString().slice(0, 10),
      monthlyLimit: 5000000,
      spentThisMonth: Math.round((primaryCurrency === 'MWK' ? totalMWK : primaryCurrency === 'CNY' ? totalCNY : totalUSD) * 0.15),
    };
  }, [wallets, user]);

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
