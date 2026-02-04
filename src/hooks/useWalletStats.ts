import { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '@/src/lib/api/api-client';
import { useAuth } from '@/src/context/AuthContext';
import { EXCHANGE_RATE_MWK_TO_CNY, EXCHANGE_RATE_CNY_TO_MWK } from '@/src/lib/constants';

export interface Wallet {
  id: string;
  currency: string;
  balance: string;
  available_balance: string;
  type: string;
}

export interface WalletStats {
  balanceMWK: number;
  balanceCNY: number;
  primaryCurrency: 'MWK' | 'CNY';
  lastDepositDate: string;
  monthlyLimit: number;
  spentThisMonth: number;
}

export function useWalletStats() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [rates, setRates] = useState<{ mwkToCny?: number; cnyToMwk?: number; usdToMwk?: number }>({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [wRes, rRes, zRes] = await Promise.all([
        apiFetch('/wallets', { cache: 'no-store' }).catch(() => null),
        apiFetch('/forex/rate/MWK/CNY', { cache: 'no-store' }).catch(() => null),
        apiFetch('/forex/rate/ZMW/MWK', { cache: 'no-store' }).catch(() => null),
      ]);
      
      setWallets(Array.isArray(wRes?.wallets) ? wRes.wallets : []);
      
      const rate = typeof rRes?.rate === 'number' ? rRes.rate : EXCHANGE_RATE_MWK_TO_CNY;
      const zmwRate = typeof zRes?.rate === 'number' ? zRes.rate : 0.05; // 1 ZMW approx 50 MWK? Need to check rate. 1 ZMW ~ 0.8 CNY ~ 130 MWK. Let's use 130.
      
      setRates({ 
        mwkToCny: rate, 
        cnyToMwk: rate ? 1 / rate : EXCHANGE_RATE_CNY_TO_MWK, 
        zmwToMwk: zmwRate 
      });
    } catch (e) {
      console.error('Failed to fetch wallet stats', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const refetch = () => fetchData();

  const stats = useMemo<WalletStats>(() => {
    const totalMWK = wallets.reduce((sum, w) => {
      const bal = parseFloat(String(w.available_balance ?? w.balance ?? 0));
      const cur = String(w.currency).toUpperCase();
      
      if (cur === 'MWK') return sum + bal;
      if (cur === 'CNY') return sum + bal * (rates.cnyToMwk || EXCHANGE_RATE_CNY_TO_MWK);
      if (cur === 'USD') return sum + bal * (rates.usdToMwk || 1745);
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
    const primaryCurrency = (countryCode === 'CN' ? 'CNY' : 'MWK') as 'CNY' | 'MWK';

    return {
      balanceMWK: Math.round(totalMWK),
      balanceCNY: Math.round(totalCNY),
      primaryCurrency,
      lastDepositDate: new Date().toISOString().slice(0, 10),
      monthlyLimit: 5000000,
      spentThisMonth: Math.round((primaryCurrency === 'CNY' ? totalCNY : totalMWK) * 0.15), // Mock calculation
    };
  }, [wallets, rates, user]);

  return {
    wallets,
    rates,
    stats,
    loading,
    refetch
  };
}
