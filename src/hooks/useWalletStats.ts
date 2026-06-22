import { useState, useEffect, useMemo, useCallback } from 'react';
import { apiFetch, getToken, isAuthenticated } from '@/src/lib/api/api-client';
import {
  normalizeWallets,
  unwrapForexMeta,
  unwrapForexRates,
  type ForexRatesMeta,
  type NormalizedWallet,
} from '@/src/lib/api/response';
import { useAuth } from '@/src/context/AuthContext';

export type Wallet = NormalizedWallet;

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
  const authToken = typeof window !== 'undefined' ? getToken() : null;
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [rateDetails, setRateDetails] = useState<Record<string, any>>({});
  const [forexMeta, setForexMeta] = useState<ForexRatesMeta>({});
  const [limits, setLimits] = useState<{ monthlyLimit: number; spentThisMonth: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated()) {
      setWallets([]);
      setFetchError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setFetchError(null);
    try {
      const [wRes, rRes, lRes] = await Promise.all([
        apiFetch('/wallets', { cache: 'no-store' }),
        apiFetch('/forex/rates', { cache: 'no-store' }).catch(() => null),
        apiFetch('/payments/limits', { cache: 'no-store' }).catch(() => null),
      ]);

      setWallets(normalizeWallets(wRes));

      if (lRes && typeof lRes === 'object') {
        const raw = lRes as Record<string, unknown>;
        const monthlyLimit = Number(raw.monthly_limit);
        const spentThisMonth = Number(raw.spent_this_month);
        if (Number.isFinite(monthlyLimit) && Number.isFinite(spentThisMonth)) {
          setLimits({ monthlyLimit, spentThisMonth });
        }
      }

      const newRates: Record<string, number> = {};
      const newDetails: Record<string, any> = {};

      const meta = unwrapForexMeta(rRes);
      const rateRows = unwrapForexRates(rRes);
      let dataMode = meta.data_mode;
      if (!dataMode && rateRows.length > 0) {
        const hasLive = rateRows.some((r: Record<string, unknown>) => {
          const p = String(r.provider ?? '').toLowerCase();
          return p !== '' && p !== 'seed-runner' && p !== 'mockprovider';
        });
        dataMode = hasLive ? 'live' : 'unavailable';
      }
      setForexMeta({ ...meta, data_mode: dataMode });

      if (rateRows.length > 0) {
        rateRows.forEach((r: any) => {
          const base = r.base_currency ?? r.baseCurrency ?? r.from;
          const target = r.target_currency ?? r.targetCurrency ?? r.to;
          if (!base || !target) return;
          const key = `${base}-${target}`;
          newRates[key] = parseFloat(r.rate);
          newDetails[key] = {
            rate: parseFloat(r.rate),
            change24h: parseFloat(r.change_24h || 0),
            changePercent: parseFloat(r.change_percent || 0),
            high24h: parseFloat(r.high_24h || r.rate),
            low24h: parseFloat(r.low_24h || r.rate),
            lastUpdated: r.last_updated,
          };

          if (base === 'MWK' && target === 'CNY') newRates['mwkToCny'] = parseFloat(r.rate);
          if (base === 'CNY' && target === 'MWK') newRates['cnyToMwk'] = parseFloat(r.rate);
          if (base === 'USD' && target === 'MWK') newRates['usdToMwk'] = parseFloat(r.rate);
        });
      } else {
        setFetchError('Live exchange rates are temporarily unavailable. Please try again shortly.');
      }

      setRates(newRates);
      setRateDetails(newDetails);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load wallets';
      setFetchError(message);
      setWallets([]);
      if (process.env.NODE_ENV === 'development') {
        console.error('[useWalletStats]', message, e);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchData();
      return;
    }
    setWallets([]);
    setFetchError(null);
    setLoading(false);
  }, [fetchData, user?.id, authToken]);

  const refetch = () => fetchData();

  const stats = useMemo<WalletStats>(() => {
    const totalMWK = wallets.reduce((sum, w) => {
      const bal = parseFloat(String(w.available_balance ?? w.balance ?? 0));
      const cur = String(w.currency).toUpperCase();

      if (cur === 'MWK') return sum + bal;
      if (cur === 'CNY') return sum + bal * (rates['cnyToMwk'] ?? 0);
      if (cur === 'USD') return sum + bal * (rates['usdToMwk'] ?? 0);
      return sum + bal;
    }, 0);

    const totalCNY = wallets.reduce((sum, w) => {
      const bal = parseFloat(String(w.available_balance ?? w.balance ?? 0));
      const cur = String(w.currency).toUpperCase();

      if (cur === 'CNY') return sum + bal;
      if (cur === 'MWK') return sum + bal * (rates['mwkToCny'] ?? 0);
      if (cur === 'USD') {
        const usdToMwk = rates['usdToMwk'] ?? 0;
        const mwkToCny = rates['mwkToCny'] ?? 0;
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
      monthlyLimit: limits?.monthlyLimit ?? 0,
      spentThisMonth: limits?.spentThisMonth ?? 0,
    };
  }, [wallets, rates, user, limits]);

  return {
    wallets,
    stats,
    rates,
    rateDetails,
    forexMeta,
    loading,
    fetchError,
    refetch,
  };
}
