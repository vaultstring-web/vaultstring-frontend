import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { apiFetch, isAuthenticated } from '@/src/lib/api/api-client';
import { getFundingOptions } from '@/src/lib/constants/funding';

export interface SendMoneyFormState {
  receiver_id: string;
  amount: string;
  currency: string;
  description: string;
  channel: string;
  category: string;
}

export function useSendMoneyForm(t: any) {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  
  // Form State
  const [form, setForm] = useState<SendMoneyFormState>({ 
    receiver_id: '', 
    amount: '', 
    currency: 'MWK', 
    description: '', 
    channel: 'web', 
    category: 'transfer' 
  });
  
  const [targetCurrency, setTargetCurrency] = useState<'MWK' | 'CNY' | 'ZMW'>('CNY');
  const [flowType, setFlowType] = useState<'INTERNATIONAL' | 'SAME'>('INTERNATIONAL');
  const [fundingSource, setFundingSource] = useState<string>('wallet_balance');
  const [payoutMethod, setPayoutMethod] = useState<string>('');

  // Status State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  
  // Wallet State
  const [walletBalance, setWalletBalance] = useState<number>(0);
  
  // Receiver Lookup State
  const [receiverName, setReceiverName] = useState<string | null>(null);
  const [receiverLoading, setReceiverLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Forex Preview State
  const [previewRate, setPreviewRate] = useState<number | null>(null);
  const [previewConverted, setPreviewConverted] = useState<number | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewFee, setPreviewFee] = useState<number | null>(null);

  const amountNumber = useMemo(() => Number(form.amount || 0), [form.amount]);

  // Determine home currency
  const homeCurrency = useMemo<'MWK' | 'CNY' | 'ZMW'>(() => {
    const cc = String(user?.countryCode || '').toUpperCase();
    if (cc === 'CN') return 'CNY';
    if (cc === 'MW') return 'MWK';
    if (cc === 'ZM') return 'ZMW';
    return 'MWK';
  }, [user?.countryCode]);

  // Auto-set currency based on home currency
  const [didAutoSetCurrency, setDidAutoSetCurrency] = useState(false);
  useEffect(() => {
    if (!didAutoSetCurrency && homeCurrency && form.currency === 'MWK' && homeCurrency !== 'MWK') {
      setForm((f) => ({ ...f, currency: homeCurrency }));
      setDidAutoSetCurrency(true);
    }
  }, [homeCurrency, didAutoSetCurrency, form.currency]);

  // Fetch Wallet Balance
  useEffect(() => {
    apiFetch('/wallets').then((res) => {
      if (res && res.wallets && res.wallets.length > 0) {
        const w = res.wallets.find((w: any) => w.currency === form.currency) || res.wallets[0];
        const bal = parseFloat(w.available_balance || w.balance || '0');
        setWalletBalance(bal);
      }
    }).catch(() => {});
  }, [form.currency]);

  // Forex Calculation Effect
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!form.currency || !targetCurrency || !amountNumber || amountNumber <= 0) {
        setPreviewRate(null);
        setPreviewConverted(null);
        setPreviewError(null);
        return;
      }
      setPreviewLoading(true);
      setPreviewError(null);
      try {
        const calc = await apiFetch('/forex/calculate', {
          method: 'POST',
          body: JSON.stringify({ from: form.currency, to: targetCurrency, amount: amountNumber }),
        }).catch(() => null);
        
        const r = typeof calc?.rate === 'number' ? calc.rate : (typeof calc?.rate === 'string' ? parseFloat(calc?.rate) : null);
        const conv = typeof calc?.converted_amount === 'number' ? calc.converted_amount : (typeof calc?.converted_amount === 'string' ? parseFloat(calc.converted_amount) : null);
        const fee = typeof calc?.fee_amount === 'number' ? calc.fee_amount : (typeof calc?.fee_amount === 'string' ? parseFloat(calc.fee_amount) : null);
        
        if (!mounted) return;
        setPreviewRate(r);
        setPreviewConverted(conv ?? (r ? amountNumber * r : null));
        setPreviewFee(fee ?? null);
      } catch (e: any) {
        if (!mounted) return;
        setPreviewError(e?.message || 'Failed to load rate');
        setPreviewRate(null);
        setPreviewConverted(null);
      } finally {
        if (!mounted) return;
        setPreviewLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [form.currency, targetCurrency, amountNumber]);

  // Receiver Lookup Effect
  useEffect(() => {
    const checkReceiver = async () => {
      const val = form.receiver_id.trim();
      if (val.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        setReceiverName(null);
        return;
      }

      // Exact Match
      if (val.length === 16 && /^\d+$/.test(val)) {
        setShowSuggestions(false);
        setReceiverLoading(true);
        try {
          const res = await apiFetch(`/wallets/lookup?address=${val}`);
          if (res && res.name) {
            setReceiverName(res.name);
          } else {
            setReceiverName(null);
          }
        } catch (e) {
          setReceiverName(null);
        } finally {
          setReceiverLoading(false);
        }
        return;
      } else {
        setReceiverName(null);
      }

      // Partial Search
      if (val.length >= 3 && val.length < 16) {
        setReceiverLoading(true);
        try {
          const res = await apiFetch(`/wallets/search?q=${val}`);
          if (Array.isArray(res) && res.length > 0) {
            setSuggestions(res);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        } catch (e) {
          setSuggestions([]);
          setShowSuggestions(false);
        } finally {
          setReceiverLoading(false);
        }
      }
    };
    
    const timeoutId = setTimeout(checkReceiver, 400);
    return () => clearTimeout(timeoutId);
  }, [form.receiver_id]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      if (!isAuthenticated()) throw new Error('Please login to send a payment');
      
      const fundingOptions = getFundingOptions(form.currency, walletBalance);
      const selectedFunding = fundingOptions.find((o) => o.value === fundingSource);
      const rawChannel = selectedFunding?.channel || 'web';
      const derivedChannel = rawChannel === 'mobile_money' ? 'mobile'
        : rawChannel === 'wallet' ? 'web'
        : rawChannel === 'bank' ? 'api'
        : rawChannel === 'card' ? 'api'
        : 'web';
      
      if (!payoutMethod) {
        throw new Error('Please select a payout method');
      }

      const payload = {
        receiver_wallet_number: String(form.receiver_id || '').trim(),
        amount: Number(form.amount),
        currency: form.currency,
        description: form.description,
        channel: derivedChannel,
        category: fundingSource || form.category,
      };
      
      const res = await apiFetch('/payments/initiate', { method: 'POST', body: JSON.stringify(payload) });
      
      // Fallback receiver name if backend doesn't return it
      if (!res.receiver_name && receiverName) {
        res.receiver_name = receiverName;
      }

      setResult(res);
      
      // Refresh user balance
      try {
        await refreshUser();
      } catch (err) {
        console.warn('Failed to refresh user balance', err);
      }

      // Refresh local wallet balance
      apiFetch('/wallets').then((wRes) => {
        if (wRes && wRes.wallets && wRes.wallets.length > 0) {
           const w = wRes.wallets.find((w: any) => w.currency === form.currency) || wRes.wallets[0];
           const bal = parseFloat(w.available_balance || w.balance || '0');
           setWalletBalance(bal);
        }
      });

    } catch (e: any) {
      const msg = e?.data?.error || e?.message || 'Payment failed';
      const lower = String(msg).toLowerCase();
      if (e?.status === 401 || lower.includes('invalid token')) {
        setError('Please login to continue');
        setTimeout(() => router.push('/login'), 600);
      } else if (lower.includes('duplicate request')) {
        setError(t('errors.duplicateRequest'));
      } else if (lower.includes('insufficient balance')) {
        setError(t('errors.insufficientBalance'));
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    form, setForm,
    targetCurrency, setTargetCurrency,
    flowType, setFlowType,
    fundingSource, setFundingSource,
    payoutMethod, setPayoutMethod,
    loading, error, result, setResult,
    walletBalance,
    receiverName, setReceiverName, receiverLoading, suggestions, showSuggestions, setSuggestions, setShowSuggestions,
    previewRate, previewConverted, previewLoading, previewError, previewFee,
    amountNumber,
    onChange,
    onSubmit
  };
}
