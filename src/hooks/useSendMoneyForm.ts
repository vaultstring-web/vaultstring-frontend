import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { apiFetch, isAuthenticated } from '@/src/lib/api/api-client';
import { getFundingOptions } from '@/src/lib/constants/funding';
import { AFRICAN_COUNTRIES } from '@/src/lib/constants/africa';
import { getSupportedAfricanCurrencies } from '@/src/lib/utils/africa-utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const sendMoneySchema = z.object({
  receiver_id: z.string()
    .transform((v) => v.replace(/\s/g, ''))
    .refine((v) => v.length === 16, "Wallet ID must be exactly 16 digits")
    .refine((v) => /^\d+$/.test(v), "Wallet ID must be numeric"),
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
  const normalizeWalletNumber = (value: string) => value.replace(/\D/g, '');
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const supportedAfricanCurrencies = useMemo(() => getSupportedAfricanCurrencies(), []);
  const allSupportedCurrencies = useMemo(() => [...supportedAfricanCurrencies, 'CNY'], [supportedAfricanCurrencies]);

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
      currency: 'NGN', // Defaulting to Nigeria as a Pan-African primary
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
  
  const [targetCurrency, setTargetCurrency] = useState<string>('CNY');
  const [flowType, setFlowType] = useState<'INTERNATIONAL' | 'SAME'>('INTERNATIONAL');
  
  // Ensure targetCurrency is different from watchedCurrency when in INTERNATIONAL mode
  useEffect(() => {
    if (flowType === 'INTERNATIONAL' && watchedCurrency === targetCurrency) {
      const other = allSupportedCurrencies.find(c => c !== watchedCurrency);
      if (other) setTargetCurrency(other);
    }
  }, [watchedCurrency, targetCurrency, flowType, allSupportedCurrencies]);

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

  // Determine home currency dynamically from user country
  const homeCurrency = useMemo<string>(() => {
    const cc = String(user?.countryCode || '').toUpperCase();
    const country = AFRICAN_COUNTRIES.find(c => c.code.toUpperCase() === cc);
    if (country) return country.currency;
    if (cc === 'CN') return 'CNY';
    return 'NGN'; // Fallback
  }, [user?.countryCode]);

  // Auto-set currency based on home currency
  const [didAutoSetCurrency, setDidAutoSetCurrency] = useState(false);
  useEffect(() => {
    if (!didAutoSetCurrency && homeCurrency && watchedCurrency === 'NGN' && homeCurrency !== 'NGN') {
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

  // Real-time Forex Calculation Effect
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
          body: JSON.stringify({ 
            from: watchedCurrency, 
            to: targetCurrency, 
            amount: amountNumber
          }),
        }).catch(() => null);
        
        const r = typeof calc?.rate === 'number' ? calc.rate : (typeof calc?.rate === 'string' ? parseFloat(calc?.rate) : null);
        const conv = typeof calc?.converted_amount === 'number' ? calc.converted_amount : (typeof calc?.converted_amount === 'string' ? parseFloat(calc?.converted_amount) : null);
        const fee = typeof calc?.fee_amount === 'number' ? calc.fee_amount : (typeof calc?.fee_amount === 'string' ? parseFloat(calc?.fee_amount) : null);
        
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
  }, [watchedCurrency, targetCurrency, amountNumber, user?.countryCode]);

  // Receiver Lookup Effect
  useEffect(() => {
    const checkReceiver = async () => {
      const val = normalizeWalletNumber((watchedReceiverId || '').trim());
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
          const res = await apiFetch(`/wallets/lookup?address=${encodeURIComponent(val)}`);
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
          const res = await apiFetch(`/wallets/search?q=${encodeURIComponent(val)}`);
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
        : 'api';

      const payload = {
        receiver_wallet_number: normalizeWalletNumber(data.receiver_id),
        amount: parseFloat(data.amount),
        currency: data.currency,
        destination_currency: targetCurrency,
        description: data.description,
        channel: derivedChannel,
        category: data.category,
        payment_method: fundingSource,
        payout_method: payoutMethod,
        is_international: flowType === 'INTERNATIONAL',
        // Add metadata for Pan-African Bank API
        metadata: {
          flow_type: flowType,
          sender_country: user?.countryCode,
          source_currency: data.currency,
          target_currency: targetCurrency,
          pan_african_routing: true
        }
      };

      const res = await apiFetch('/payments/initiate', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setResult(res);
      refreshUser();
      reset();
      router.push(`/transactions/success?ref=${res.reference || res.id}`);
    } catch (e: any) {
      setServerError(e?.message || 'Transaction initiation failed');
    } finally {
      setLoading(false);
    }
  };

  return {
    form: watch(),
    setForm: setValue,
    register,
    handleSubmit,
    onSubmit: handleSubmit(processSubmit),
    setValue,
    watch,
    errors,
    formErrors: errors,
    trigger,
    watchedReceiverId,
    watchedAmount,
    watchedCurrency,
    watchedDescription,
    targetCurrency,
    setTargetCurrency,
    flowType,
    setFlowType,
    fundingSource,
    setFundingSource,
    payoutMethod,
    setPayoutMethod,
    loading,
    error: serverError,
    serverError,
    result,
    setResult,
    walletBalance,
    receiverName,
    receiverLoading,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    previewRate,
    previewConverted,
    previewLoading,
    previewError,
    previewFee,
    amountNumber,
    homeCurrency,
    allSupportedCurrencies,
    onChange
  };
}
