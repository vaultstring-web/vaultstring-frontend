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
  const [rates, setRates] = useState<Record<string, number>>({});
  const [rateDetails, setRateDetails] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [wRes, rRes] = await Promise.all([
        apiFetch('/wallets', { cache: 'no-store' }).catch(() => null),
        apiFetch('/forex/rates', { cache: 'no-store' }).catch(() => null),
      ]);
      
      const userWallets = (Array.isArray(wRes?.wallets) ? wRes.wallets : []).filter(Boolean);
      setWallets(userWallets);
      
      // Process rates into a lookup map "FROM-TO" -> Rate
      const newRates: Record<string, number> = {};
      const newDetails: Record<string, any> = {};

      if (rRes?.rates && Array.isArray(rRes.rates)) {
        rRes.rates.forEach((r: any) => {
          const key = `${r.base_currency}-${r.target_currency}`;
          newRates[key] = parseFloat(r.rate);
          newDetails[key] = {
            rate: parseFloat(r.rate),
            change24h: parseFloat(r.change_24h || 0),
            changePercent: parseFloat(r.change_percent || 0),
            high24h: parseFloat(r.high_24h || r.rate),
            low24h: parseFloat(r.low_24h || r.rate),
            lastUpdated: r.last_updated
          };

          // Also store simple keys for legacy support if needed
          if (r.base_currency === 'MWK' && r.target_currency === 'CNY') newRates['mwkToCny'] = parseFloat(r.rate);
          if (r.base_currency === 'CNY' && r.target_currency === 'MWK') newRates['cnyToMwk'] = parseFloat(r.rate);
          if (r.base_currency === 'USD' && r.target_currency === 'MWK') newRates['usdToMwk'] = parseFloat(r.rate);
        });
      } else {
        // Fallback
        newRates['mwkToCny'] = EXCHANGE_RATE_MWK_TO_CNY;
        newRates['cnyToMwk'] = EXCHANGE_RATE_CNY_TO_MWK;
        newRates['MWK-CNY'] = EXCHANGE_RATE_MWK_TO_CNY;
        newRates['CNY-MWK'] = EXCHANGE_RATE_CNY_TO_MWK;
      }
      
      setRates(newRates);
      setRateDetails(newDetails);
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
      if (cur === 'CNY') return sum + bal * (rates['cnyToMwk'] || EXCHANGE_RATE_CNY_TO_MWK);
      if (cur === 'USD') return sum + bal * (rates['usdToMwk'] || 1745);
      return sum + bal;
    }, 0);

    const totalCNY = wallets.reduce((sum, w) => {
      const bal = parseFloat(String(w.available_balance ?? w.balance ?? 0));
      const cur = String(w.currency).toUpperCase();

      if (cur === 'CNY') return sum + bal;
      if (cur === 'MWK') return sum + bal * (rates['mwkToCny'] || EXCHANGE_RATE_MWK_TO_CNY);
      if (cur === 'USD') {
        const usdToMwk = rates['usdToMwk'] || 1745;
        const mwkToCny = rates['mwkToCny'] || EXCHANGE_RATE_MWK_TO_CNY;
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
      spentThisMonth: Math.round((primaryCurrency === 'CNY' ? totalCNY : totalMWK) * 0.15),
    };
  }, [wallets, rates, user]);

  return {
    wallets,
    stats,
    rates,
    rateDetails,
    loading,
    refetch,
  };
}
