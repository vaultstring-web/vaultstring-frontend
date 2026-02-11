import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { apiFetch, isAuthenticated } from '@/src/lib/api/api-client';
import { getFundingOptions } from '@/src/lib/constants/funding';
import { getDeviceId } from '@/src/lib/utils/device';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const sendMoneySchema = z.object({
  receiver_id: z.string()
    .min(16, "Wallet ID must be exactly 16 digits")
    .max(16, "Wallet ID must be exactly 16 digits")
    .regex(/^\d+$/, "Wallet ID must be numeric"),
  amount: z.string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Amount must be greater than 0"),
  currency: z.string().min(1, "Currency is required"),
  description: z.string().optional(),
  channel: z.string().default('web'),
  category: z.string().default('transfer')
});

export type SendMoneyFormValues = z.infer<typeof sendMoneySchema>;

// Interface for backward compatibility
export interface SendMoneyFormState extends SendMoneyFormValues {}

export function useSendMoneyForm(t: any) {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
    trigger
  } = useForm<SendMoneyFormValues>({
    resolver: zodResolver(sendMoneySchema),
    defaultValues: {
      receiver_id: '',
      amount: '',
      currency: 'MWK',
      description: '',
      channel: 'web',
      category: 'transfer'
    },
    mode: "onChange"
  });

  // Watch values for effects and compatibility
  const watchedReceiverId = watch('receiver_id');
  const watchedAmount = watch('amount');
  const watchedCurrency = watch('currency');
  const watchedDescription = watch('description');
  const watchedChannel = watch('channel');
  const watchedCategory = watch('category');
  
  const [targetCurrency, setTargetCurrency] = useState<'MWK' | 'CNY' | 'ZMW'>('CNY');
  const [flowType, setFlowType] = useState<'INTERNATIONAL' | 'SAME'>('INTERNATIONAL');
  const [fundingSource, setFundingSource] = useState<string>('wallet_balance');
  const [payoutMethod, setPayoutMethod] = useState<string>('');

  // Status State
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
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

  const amountNumber = useMemo(() => Number(watchedAmount || 0), [watchedAmount]);

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
    if (!didAutoSetCurrency && homeCurrency && watchedCurrency === 'MWK' && homeCurrency !== 'MWK') {
      setValue('currency', homeCurrency);
      setDidAutoSetCurrency(true);
    }
  }, [homeCurrency, didAutoSetCurrency, watchedCurrency, setValue]);

  // Fetch Wallet Balance
  useEffect(() => {
    apiFetch('/wallets').then((res) => {
      if (res && res.wallets && res.wallets.length > 0) {
        const w = res.wallets.find((w: any) => w.currency === watchedCurrency) || res.wallets[0];
        const bal = parseFloat(w.available_balance || w.balance || '0');
        setWalletBalance(bal);
      }
    }).catch(() => {});
  }, [watchedCurrency]);

  // Forex Calculation Effect
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!watchedCurrency || !targetCurrency || !amountNumber || amountNumber <= 0) {
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
          body: JSON.stringify({ from: watchedCurrency, to: targetCurrency, amount: amountNumber }),
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
  }, [watchedCurrency, targetCurrency, amountNumber]);

  // Receiver Lookup Effect
  useEffect(() => {
    const checkReceiver = async () => {
      const val = (watchedReceiverId || '').trim();
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
  }, [watchedReceiverId]);

  // Adapter for old onChange
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setValue(name as keyof SendMoneyFormValues, value, { shouldValidate: true });
  };

  const processSubmit = async (data: SendMoneyFormValues) => {
    if (loading) return;
    
    setLoading(true);
    setServerError(null);
    setResult(null);
    
    try {
      if (!isAuthenticated()) throw new Error('Please login to send a payment');
      
      const fundingOptions = getFundingOptions(data.currency, walletBalance);
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
        receiver_wallet_number: String(data.receiver_id || '').trim(),
        amount: Number(data.amount),
        currency: data.currency,
        destination_currency: flowType === 'INTERNATIONAL' ? targetCurrency : data.currency,
        description: data.description,
        channel: derivedChannel,
        category: fundingSource || data.category,
        location: 'MW', // Default to Malawi for now
        device_id: getDeviceId(),
      };

      const res = await apiFetch('/payments/initiate', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

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
           const w = wRes.wallets.find((w: any) => w.currency === data.currency) || wRes.wallets[0];
           const bal = parseFloat(w.available_balance || w.balance || '0');
           setWalletBalance(bal);
        }
      });

    } catch (e: any) {
      const msg = e?.data?.error || e?.message || 'Payment failed';
      const lower = String(msg).toLowerCase();
      if (e?.status === 401 || lower.includes('invalid token')) {
        setServerError('Please login to continue');
        setTimeout(() => router.push('/login'), 600);
      } else if (lower.includes('duplicate request')) {
        setServerError(t('errors.duplicateRequest') || 'Duplicate request detected');
      } else if (lower.includes('insufficient balance')) {
        setServerError(t('errors.insufficientBalance') || 'Insufficient balance');
      } else {
        setServerError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    form: {
      receiver_id: watchedReceiverId,
      amount: watchedAmount,
      currency: watchedCurrency,
      description: watchedDescription,
      channel: watchedChannel,
      category: watchedCategory
    },
    setForm: (update: any) => {
      // Compatibility adapter for setForm(f => ({...f, key: val})) pattern
      if (typeof update === 'function') {
        const current = {
          receiver_id: watchedReceiverId,
          amount: watchedAmount,
          currency: watchedCurrency,
          description: watchedDescription,
          channel: watchedChannel,
          category: watchedCategory
        };
        const next = update(current);
        Object.keys(next).forEach(k => setValue(k as any, next[k], { shouldValidate: true }));
      } else {
        Object.keys(update).forEach(k => setValue(k as any, update[k], { shouldValidate: true }));
      }
    },
    register,
    formErrors: errors,
    targetCurrency, setTargetCurrency,
    flowType, setFlowType,
    fundingSource, setFundingSource,
    payoutMethod, setPayoutMethod,
    loading, error: serverError, result, setResult,
    walletBalance,
    receiverName, setReceiverName, receiverLoading, suggestions, showSuggestions, setSuggestions, setShowSuggestions,
    previewRate, previewConverted, previewLoading, previewError, previewFee,
    amountNumber,
    onChange,
    onSubmit: handleSubmit(processSubmit)
  };
}
