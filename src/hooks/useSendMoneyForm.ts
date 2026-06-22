import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { apiFetch, isAuthenticated } from '@/src/lib/api/api-client';
import { normalizeWallets } from '@/src/lib/api/response';
import { getFundingOptions } from '@/src/lib/constants/funding';
import { AFRICAN_COUNTRIES } from '@/src/lib/constants/africa';
import { getSupportedAfricanCurrencies } from '@/src/lib/utils/africa-utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';

export type SendMoneyFormValues = {
  receiver_id: string;
  amount: string;
  currency: string;
  description?: string;
  channel: string;
  category: string;
};

// Interface for backward compatibility
export interface SendMoneyFormState extends SendMoneyFormValues {}

export function useSendMoneyForm() {
  const tv = useTranslations('SendMoney.validation');

  const sendMoneySchema = useMemo(
    () =>
      z.object({
        receiver_id: z
          .string()
          .transform((v) => v.replace(/\s/g, ''))
          .refine((v) => v.length === 16, tv('walletIdLength'))
          .refine((v) => /^\d+$/.test(v), tv('walletIdNumeric')),
        amount: z
          .string()
          .min(1, tv('amountRequired'))
          .refine((val) => !isNaN(Number(val)) && Number(val) > 0, tv('amountPositive')),
        currency: z.string().min(1, tv('currencyRequired')),
        description: z.string().optional(),
        channel: z.string().default('web'),
        category: z.string().default('transfer'),
      }),
    [tv]
  );
  const SUCCESS_TX_STORAGE_KEY = 'kyd_last_success_tx_id';
const SUCCESS_FLOW_STORAGE_KEY = 'kyd_last_success_flow';
  const normalizeWalletNumber = (value: string) => value.replace(/\D/g, '');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUser } = useAuth();

  const supportedAfricanCurrencies = useMemo(() => getSupportedAfricanCurrencies(), []);
  const allSupportedCurrencies = useMemo(() => [...supportedAfricanCurrencies, 'CNY'], [supportedAfricanCurrencies]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, touchedFields },
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

  // Prefill from wallet withdraw flow (?from=MWK&amount=1000&payout=bank)
  useEffect(() => {
    const from = searchParams.get('from');
    const amount = searchParams.get('amount');
    const payout = searchParams.get('payout');
    if (from) setValue('currency', from.toUpperCase());
    if (amount) setValue('amount', amount);
    if (payout === 'bank') setPayoutMethod('bank');
  }, [searchParams, setValue]);

  // Status State
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  
  // Wallet State
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [walletCurrencies, setWalletCurrencies] = useState<string[]>([]);
  
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

  const amountNumber = useMemo(() => {
    const normalized = String(watchedAmount ?? '').replace(/,/g, '').trim();
    if (!normalized) return 0;
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed) || parsed <= 0) return 0;
    return parsed;
  }, [watchedAmount]);
  const hasTouchedAmount = Boolean(touchedFields.amount);

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
      const wallets = normalizeWallets(res);
      const currencies = wallets
        .map((w: any) => String(w?.currency || '').toUpperCase())
        .filter(Boolean);
      setWalletCurrencies(currencies);

      if (wallets.length > 0) {
        const exact = wallets.find((w: any) => String(w?.currency || '').toUpperCase() === String(watchedCurrency || '').toUpperCase());
        if (exact) {
          const bal = parseFloat(exact.available_balance || exact.balance || '0');
          setWalletBalance(bal);
        } else {
          // Do not show another currency's balance under the selected send currency.
          setWalletBalance(0);
        }
      } else {
        setWalletBalance(0);
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
      } catch (err: unknown) {
        if (!mounted) return;
        setPreviewError(err instanceof Error ? err.message : 'Failed to load rate');
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
        } catch {
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
        } catch {
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
    setValue(name as keyof SendMoneyFormValues, value, { shouldValidate: true, shouldTouch: true });
  };

  const processSubmit = async (data: SendMoneyFormValues) => {
    if (loading) return;
    
    setLoading(true);
    setServerError(null);
    
    try {
      if (!isAuthenticated()) throw new Error('Please login to send a payment');
      // If we haven't loaded wallet currencies yet, refresh once to avoid false rejections.
      let currencies = walletCurrencies;
      if (!Array.isArray(currencies) || currencies.length === 0) {
        const wres = await apiFetch('/wallets').catch(() => null);
        const wallets = normalizeWallets(wres);
        currencies = wallets
          .map((w: any) => String(w?.currency || '').toUpperCase())
          .filter(Boolean);
        setWalletCurrencies(currencies);
      }
      if (currencies.length > 0 && !currencies.includes(String(data.currency || '').toUpperCase())) {
        throw new Error('Using wrong currency. Please select the wallet matching the payment currency.');
      }
      
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
        currency: String(data.currency || '').toUpperCase(),
        destination_currency: String(targetCurrency || '').toUpperCase(),
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
          source_currency: String(data.currency || '').toUpperCase(),
          target_currency: String(targetCurrency || '').toUpperCase(),
          pan_african_routing: true
        }
      };

      const res = await apiFetch('/payments/initiate', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      refreshUser();
      reset();
      const txId =
        res?.transaction?.id ||
        res?.transaction?.transaction_id ||
        res?.transaction?.ID ||
        res?.transaction_id ||
        res?.id ||
        res?.payment_id ||
        res?.reference_id ||
        null;

      if (txId) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(SUCCESS_TX_STORAGE_KEY, String(txId));
          sessionStorage.setItem(SUCCESS_FLOW_STORAGE_KEY, 'send-money');
        }
        router.push(`/transactions/success?tx=${encodeURIComponent(String(txId))}&from=send-money`);
      } else {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(SUCCESS_FLOW_STORAGE_KEY, 'send-money');
        }
        // Fallback route opens success page and resolves latest when flow marker exists.
        router.push('/transactions/success?from=send-money');
      }
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Transaction initiation failed');
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
    hasTouchedAmount,
    homeCurrency,
    allSupportedCurrencies,
    onChange
  };
}
