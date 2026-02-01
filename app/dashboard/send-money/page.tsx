'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { apiFetch, isAuthenticated } from '@/src/lib/api/api-client';
import { useRouter } from 'next/navigation';
import RatePreviewCard from '@/src/components/dashboard/RatePreviewCard';
import PageHeader from '@/src/components/shared/PageHeader';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/src/components/ui/card';
import { useAuth } from '@/src/context/AuthContext';
import { 
  ArrowRight, 
  Wallet, 
  Banknote, 
  CreditCard, 
  Building, 
  Smartphone, 
  Send, 
  ArrowRightLeft, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe,
  RefreshCw
} from 'lucide-react';

export default function SendMoneyPage() {
  const t = useTranslations('SendMoney');
  const router = useRouter();
  const [form, setForm] = useState({ receiver_id: '', amount: '', currency: 'MWK', description: '', channel: 'web', category: 'transfer' });
  const [targetCurrency, setTargetCurrency] = useState<'MWK' | 'CNY' | 'USD'>('CNY');
  const [flowType, setFlowType] = useState<'INTERNATIONAL' | 'SAME'>('INTERNATIONAL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [didAutoSetCurrency, setDidAutoSetCurrency] = useState(false);
  const { user, refreshUser } = useAuth();
  const amountNumber = useMemo(() => Number(form.amount || 0), [form.amount]);
  const [previewRate, setPreviewRate] = useState<number | null>(null);
  const [previewConverted, setPreviewConverted] = useState<number | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewFee, setPreviewFee] = useState<number | null>(null);
  const [fundingSource, setFundingSource] = useState<string>('wallet_balance');
  const [payoutMethod, setPayoutMethod] = useState<string>('');
  const [receiverName, setReceiverName] = useState<string | null>(null);
  const [receiverLoading, setReceiverLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  useEffect(() => {
    // Fetch wallet balance on mount
    apiFetch('/wallets').then((res) => {
      if (res && res.wallets && res.wallets.length > 0) {
        // Find wallet matching form currency
        const w = res.wallets.find((w: any) => w.currency === form.currency) || res.wallets[0];
        const bal = parseFloat(w.available_balance || w.balance || '0');
        setWalletBalance(bal);
      }
    }).catch(() => {});
  }, [form.currency]); // Re-fetch if currency changes

  const homeCurrency = useMemo<'MWK' | 'CNY' | 'USD'>(() => {
    const cc = String(user?.countryCode || '').toUpperCase();
    if (cc === 'CN') return 'CNY';
    if (cc === 'MW') return 'MWK';
    return 'MWK';
  }, [user?.countryCode]);

  const fundingOptions = useMemo(() => {
    const balLabel = `VaultString Wallet (${walletBalance.toFixed(2)} ${form.currency})`;
    if (form.currency === 'MWK') {
      return [
        { value: 'wallet_balance', label: balLabel, channel: 'wallet', icon: Wallet },
        { value: 'airtel_money', label: 'Airtel Money', channel: 'mobile_money', icon: Smartphone },
        { value: 'tnm_mpamba', label: 'TNM Mpamba', channel: 'mobile_money', icon: Smartphone },
        { value: 'nbm', label: 'National Bank of Malawi', channel: 'bank', icon: Building },
        { value: 'standard_bank_mw', label: 'Standard Bank Malawi', channel: 'bank', icon: Building },
        { value: 'fdh_bank', label: 'FDH Bank', channel: 'bank', icon: Building },
        { value: 'nbs_bank', label: 'NBS Bank', channel: 'bank', icon: Building },
        { value: 'first_capital_bank', label: 'First Capital Bank', channel: 'bank', icon: Building },
        { value: 'ecobank_mw', label: 'Ecobank Malawi', channel: 'bank', icon: Building },
        { value: 'visa_mastercard', label: 'Visa/Mastercard', channel: 'card', icon: CreditCard },
      ];
    }
    if (form.currency === 'CNY') {
      return [
        { value: 'wallet_balance', label: balLabel, channel: 'wallet', icon: Wallet },
        { value: 'alipay', label: 'Alipay', channel: 'mobile_money', icon: Smartphone },
        { value: 'wechat_pay', label: 'WeChat Pay', channel: 'mobile_money', icon: Smartphone },
        { value: 'icbc', label: 'ICBC', channel: 'bank', icon: Building },
        { value: 'ccb', label: 'China Construction Bank', channel: 'bank', icon: Building },
        { value: 'boc', label: 'Bank of China', channel: 'bank', icon: Building },
        { value: 'abc', label: 'Agricultural Bank of China', channel: 'bank', icon: Building },
        { value: 'cmb', label: 'China Merchants Bank', channel: 'bank', icon: Building },
        { value: 'unionpay_card', label: 'UnionPay Card', channel: 'card', icon: CreditCard },
      ];
    }
    return [
      { value: 'wallet_balance', label: 'VaultString Wallet', channel: 'wallet', icon: Wallet },
      { value: 'visa_mastercard', label: 'Visa/Mastercard', channel: 'card', icon: CreditCard },
      { value: 'standard_bank_intl', label: 'Standard Bank (International)', channel: 'bank', icon: Building },
      { value: 'ecobank_intl', label: 'Ecobank (International)', channel: 'bank', icon: Building },
      { value: 'wire_transfer', label: 'Bank Wire Transfer', channel: 'bank', icon: Building },
    ];
  }, [form.currency, walletBalance]);

  const payoutOptions = useMemo(() => {
    if (targetCurrency === 'CNY') {
      return [
        { value: 'wallet_topup_cny', label: 'Wallet Top-up (CNY)', channel: 'wallet' },
        { value: 'alipay', label: 'Alipay', channel: 'mobile_money' },
        { value: 'wechat_pay', label: 'WeChat Pay', channel: 'mobile_money' },
        { value: 'icbc', label: 'ICBC', channel: 'bank' },
        { value: 'ccb', label: 'China Construction Bank', channel: 'bank' },
        { value: 'boc', label: 'Bank of China', channel: 'bank' },
        { value: 'abc', label: 'Agricultural Bank of China', channel: 'bank' },
        { value: 'cmb', label: 'China Merchants Bank', channel: 'bank' },
      ];
    }
    if (targetCurrency === 'MWK') {
      return [
        { value: 'wallet_topup_mwk', label: 'Wallet Top-up (MWK)', channel: 'wallet' },
        { value: 'airtel_money', label: 'Airtel Money', channel: 'mobile_money' },
        { value: 'tnm_mpamba', label: 'TNM Mpamba', channel: 'mobile_money' },
        { value: 'nbm', label: 'National Bank of Malawi', channel: 'bank' },
        { value: 'standard_bank_mw', label: 'Standard Bank Malawi', channel: 'bank' },
        { value: 'fdh_bank', label: 'FDH Bank', channel: 'bank' },
        { value: 'nbs_bank', label: 'NBS Bank', channel: 'bank' },
      ];
    }
    return [
      { value: 'wallet_topup_usd', label: 'Wallet Top-up (USD)', channel: 'wallet' },
      { value: 'wire_transfer', label: 'Bank Wire Transfer', channel: 'bank' },
      { value: 'visa_mastercard', label: 'Visa/Mastercard', channel: 'card' },
    ];
  }, [targetCurrency]);

  useEffect(() => {
    if (!didAutoSetCurrency && homeCurrency && form.currency === 'MWK' && homeCurrency !== 'MWK') {
      setForm((f) => ({ ...f, currency: homeCurrency }));
      setDidAutoSetCurrency(true);
    }
  }, [homeCurrency, didAutoSetCurrency, form.currency]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

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
    return () => {
      mounted = false;
    };
  }, [form.currency, targetCurrency, amountNumber]);

  useEffect(() => {
    const checkReceiver = async () => {
      const val = form.receiver_id.trim();
      
      // Clear suggestions if input is too short
      if (val.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        setReceiverName(null);
        return;
      }

      // If full 16 digits, check specific receiver info
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

      // Partial search for suggestions (3+ digits)
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
    
    const timeoutId = setTimeout(checkReceiver, 400); // Debounce
    return () => clearTimeout(timeoutId);
  }, [form.receiver_id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[DEBUG-FIX] [SendMoney] onSubmit triggered');
    
    if (loading) {
        console.warn('[DEBUG-FIX] [SendMoney] Prevented duplicate submission (loading=true)');
        return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      if (!isAuthenticated()) throw new Error('Please login to send a payment');
      
      console.log('[DEBUG-FIX] [SendMoney] Preparing payload...');
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
      
      console.log('[DEBUG-FIX] [SendMoney] Sending payload:', payload);
      const res = await apiFetch('/payments/initiate', { method: 'POST', body: JSON.stringify(payload) });
      console.log('[DEBUG-FIX] [SendMoney] Response received:', res);
      
      setResult(res);
      await refreshUser(); // Refresh user data (balance) after payment
      // Refresh wallet balance display
      apiFetch('/wallets').then((wRes) => {
        if (wRes && wRes.wallets && wRes.wallets.length > 0) {
           const w = wRes.wallets.find((w: any) => w.currency === form.currency) || wRes.wallets[0];
           const bal = parseFloat(w.available_balance || w.balance || '0');
           setWalletBalance(bal);
        }
      });
    } catch (e: any) {
      console.error('[Frontend] Payment Error:', e);
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

  const showPreview = form.currency && targetCurrency && amountNumber > 0;

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} subtitle={t('subtitle')} variant="hero" />

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
               <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                    <Send size={20} className="mr-2 text-indigo-600" />
                    {t('paymentDetails')}
                  </h3>
                  <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setFlowType('INTERNATIONAL')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        flowType === 'INTERNATIONAL' 
                          ? 'bg-slate-900 text-white shadow-sm' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Globe size={14} className="inline mr-1" />
                      International
                    </button>
                    <button
                      type="button"
                      onClick={() => setFlowType('SAME')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        flowType === 'SAME' 
                          ? 'bg-slate-900 text-white shadow-sm' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <RefreshCw size={14} className="inline mr-1" />
                      Same Currency
                    </button>
                  </div>
               </div>
            </div>
            
            <CardContent className="p-6">
              <form id="payment-form" onSubmit={onSubmit} className="space-y-8">
                
                {/* Receiver Section */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700">Recipient Wallet Number</Label>
                  <div className="relative group">
                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                      name="receiver_id"
                      value={form.receiver_id}
                      onChange={onChange}
                      placeholder="Enter 16-digit Wallet Number"
                      required
                      className="pl-10 text-slate-900 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 h-11"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      inputMode="numeric"
                      maxLength={16}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {receiverLoading ? (
                        <Loader2 size={16} className="animate-spin text-slate-400" />
                      ) : null}
                    </div>

                    {/* Google-style Search Suggestions */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-60 overflow-y-auto">
                            <div className="p-2 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider flex justify-between items-center">
                                <span>Suggested Receivers</span>
                                <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Enter more digits to refine</span>
                            </div>
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => {
                                        setForm(f => ({ ...f, receiver_id: s.address }));
                                        setSuggestions([]);
                                        setShowSuggestions(false);
                                    }}
                                    className="w-full text-left p-3 hover:bg-indigo-50 transition-colors flex items-center gap-3 border-b border-slate-50 last:border-0"
                                >
                                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                                        {s.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900">{s.name}</div>
                                        <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
                                            <span>{s.address}</span>
                                            <span className="bg-slate-100 px-1.5 rounded text-slate-600">{s.currency}</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Verified Receiver Popup */}
                    {receiverName && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-4 flex items-center gap-4 bg-gradient-to-r from-indigo-50 to-white">
                                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shrink-0 border-2 border-white shadow-sm">
                                    {receiverName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-0.5">Verified Receiver</div>
                                    <div className="text-base font-bold text-slate-900">{receiverName}</div>
                                    <div className="text-xs text-slate-500 font-mono mt-0.5 flex items-center">
                                      <ShieldCheck size={12} className="mr-1 text-green-500" />
                                      {form.receiver_id.replace(/(\d{4})(?=\d)/g, '$1 ')}
                                    </div>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <CheckCircle2 size={18} />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Error State */}
                    {form.receiver_id.length === 16 && !receiverName && !receiverLoading && (
                       <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-red-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                          <div className="p-3 flex items-center gap-3 bg-red-50/50">
                             <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                                <AlertCircle size={20} />
                             </div>
                             <div>
                                <div className="text-sm font-semibold text-red-900">Receiver not found</div>
                                <div className="text-xs text-red-700">Check the wallet number and try again</div>
                             </div>
                          </div>
                       </div>
                    )}
                  </div>
                  {/* Spacer for popup */}
                  <div className={`transition-all duration-300 ${receiverName || (form.receiver_id.length === 16 && !receiverLoading) ? 'h-20' : 'h-0'}`}></div>
                </div>

                {/* Amount Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                  {/* Sender Amount */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700">You send</Label>
                    <div className="flex items-center rounded-lg border border-slate-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all overflow-hidden h-14">
                      <div className="pl-4 pr-2 text-slate-400">
                        <Banknote size={20} />
                      </div>
                      <input
                        name="amount"
                        value={form.amount}
                        onChange={onChange}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        required
                        className="w-full py-3 outline-none text-slate-900 placeholder:text-slate-300 font-medium text-lg bg-transparent"
                      />
                      <div className="h-full border-l border-slate-100 bg-slate-50 px-2 flex items-center">
                        <select
                          name="currency"
                          value={form.currency}
                          onChange={onChange}
                          className="bg-transparent text-slate-700 font-semibold text-sm outline-none cursor-pointer pr-2"
                        >
                          <option value="MWK">MWK</option>
                          <option value="CNY">CNY</option>
                          <option value="USD">USD</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Exchange Arrow (Desktop) */}
                  <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="bg-slate-100 p-2 rounded-full border border-slate-200 text-slate-500 mt-6">
                      <ArrowRightLeft size={16} />
                    </div>
                  </div>

                  {/* Receiver Gets */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700">Receiver gets (estimated)</Label>
                    <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50/50 shadow-sm overflow-hidden h-14">
                      <div className="pl-4 pr-2 text-slate-400">
                        <Wallet size={20} />
                      </div>
                      <input
                        value={previewConverted != null ? Number(previewConverted).toFixed(2) : ''}
                        readOnly
                        placeholder="0.00"
                        className="w-full py-3 outline-none text-slate-900 placeholder:text-slate-300 font-medium text-lg bg-transparent"
                      />
                      <div className="h-full border-l border-slate-100 bg-slate-50 px-2 flex items-center">
                        <select
                          name="target_currency"
                          value={targetCurrency}
                          onChange={(e) => setTargetCurrency(e.target.value as any)}
                          className="bg-transparent text-slate-700 font-semibold text-sm outline-none cursor-pointer pr-2"
                        >
                          <option value="CNY">CNY</option>
                          <option value="USD">USD</option>
                          <option value="MWK">MWK</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rate Preview */}
                {showPreview && (
                  <div className="bg-indigo-50/50 rounded-xl border border-indigo-100 p-4">
                    <RatePreviewCard
                      fromCurrency={form.currency}
                      toCurrency={targetCurrency}
                      amount={amountNumber}
                    />
                  </div>
                )}

                {/* Payment Method Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700">Funding Source</Label>
                    <div className="relative">
                       <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                       <select 
                          value={fundingSource} 
                          onChange={(e) => setFundingSource(e.target.value)} 
                          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 bg-white focus:border-indigo-500 focus:ring-indigo-500 outline-none appearance-none"
                        >
                        {fundingOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700">Payout Method</Label>
                    <div className="relative">
                       <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                       <select 
                          value={payoutMethod} 
                          onChange={(e) => setPayoutMethod(e.target.value)} 
                          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 bg-white focus:border-indigo-500 focus:ring-indigo-500 outline-none appearance-none"
                        >
                        <option value="">Select method</option>
                        {payoutOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700">Payment Reference / Description</Label>
                  <Input 
                    name="description" 
                    value={form.description} 
                    onChange={onChange} 
                    placeholder="e.g. Family Support, Invoice #123" 
                    className="text-slate-900 border-slate-200" 
                  />
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Summary & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-slate-200 shadow-sm h-fit sticky top-6">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg">Transaction Summary</CardTitle>
              <CardDescription>Review details before sending</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-600">You send</span>
                 <span className="font-semibold text-slate-900">{form.amount || '0.00'} {form.currency}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-600">Exchange Rate</span>
                 <span className="font-mono text-slate-700">{previewRate ? `1 ${form.currency} = ${previewRate} ${targetCurrency}` : '—'}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-600">Fees (included)</span>
                 <span className="text-slate-900">{previewFee != null ? `${Number(previewFee).toFixed(2)} ${form.currency}` : '—'}</span>
               </div>
               
               <div className="border-t border-slate-100 pt-4 mt-2">
                 <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-slate-900">Receiver gets</span>
                    <span className="text-xl font-bold text-green-600">
                       {previewConverted != null ? Number(previewConverted).toFixed(2) : '0.00'} <span className="text-sm font-semibold text-green-600">{targetCurrency}</span>
                    </span>
                 </div>
                 <div className="text-xs text-slate-400 mt-1 text-right">
                    Estimated arrival: Instant - 2 hours
                 </div>
               </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button 
                type="submit" 
                form="payment-form"
                disabled={loading} 
                className="w-full bg-slate-900 hover:bg-slate-800 h-12 text-base text-white shadow-lg shadow-slate-200"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    Confirm & Send <ArrowRight size={18} className="ml-2" />
                  </>
                )}
              </Button>
              <div className="text-xs text-slate-500 text-center px-4">
                 By clicking "Confirm & Send", you agree to our Terms of Service and Privacy Policy.
              </div>
            </CardFooter>
          </Card>
        </div>

      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 flex items-start animate-in fade-in slide-in-from-bottom-2">
           <AlertCircle size={20} className="mr-3 mt-0.5 shrink-0" />
           <div>
             <h4 className="font-semibold text-sm">Transaction Failed</h4>
             <p className="text-sm mt-1 opacity-90">{error}</p>
           </div>
        </div>
      )}

      {/* Success Result */}
      {result?.transaction && (
        <Card className="border-green-200 bg-green-50/30 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-green-100/50 border-b border-green-200 px-6 py-4 flex items-center">
             <div className="bg-green-100 p-2 rounded-full mr-3 text-green-700">
                <CheckCircle2 size={24} />
             </div>
             <div>
                <h3 className="text-lg font-bold text-green-900">Payment Successful!</h3>
                <p className="text-green-700 text-sm">Your transaction has been processed.</p>
             </div>
          </div>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-4">
                <div className="flex justify-between border-b border-green-100 pb-2">
                   <span className="text-green-800/70 text-sm">Sent To</span>
                   <div className="text-right">
                      {(receiverName || result.transaction.receiver_name) ? (
                        <>
                          <div className="font-bold text-green-900 text-sm">{receiverName || result.transaction.receiver_name}</div>
                          <div className="text-xs text-green-700 font-mono">{String(form.receiver_id)}</div>
                        </>
                      ) : (
                        <span className="font-mono text-green-900 font-medium text-sm">{String(form.receiver_id)}</span>
                      )}
                   </div>
                </div>
                <div className="flex justify-between border-b border-green-100 pb-2">
                   <span className="text-green-800/70 text-sm">Transaction ID</span>
                   <span className="font-mono text-green-900 font-medium text-sm">{String(result.transaction.reference)}</span>
                </div>
                <div className="flex justify-between border-b border-green-100 pb-2">
                   <span className="text-green-800/70 text-sm">Status</span>
                   <span className="uppercase text-xs font-bold bg-green-200 text-green-800 px-2 py-0.5 rounded-full">{String(result.transaction.status)}</span>
                </div>
                <div className="flex justify-between border-b border-green-100 pb-2">
                   <span className="text-green-800/70 text-sm">Date</span>
                   <span className="text-green-900 font-medium text-sm">{new Date().toLocaleString()}</span>
                </div>
             </div>
             <div className="bg-white rounded-lg border border-green-100 p-4 shadow-sm">
                <div className="text-xs text-slate-500 uppercase font-semibold mb-2">Details</div>
                <div className="flex justify-between mb-2">
                   <span className="text-slate-600 text-sm">Sent Amount</span>
                   <span className="font-semibold text-slate-900">{String(result.transaction.amount)}</span>
                </div>
                <div className="flex justify-between mb-2">
                   <span className="text-slate-600 text-sm">Service Fee</span>
                   <span className="text-slate-900">{String(result.transaction.fee_amount || (Number(result.transaction.amount) * 0.015).toFixed(2))}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100">
                   <span className="text-slate-900 font-bold">Total Debited</span>
                   <span className="font-bold text-slate-900">{String(result.transaction.net_amount || (Number(result.transaction.amount) * 1.015).toFixed(2))}</span>
                </div>
             </div>
          </CardContent>
          <CardFooter className="bg-green-50/50 border-t border-green-100 p-4 flex justify-end">
             <Button variant="outline" className="border-green-200 text-green-800 hover:bg-green-100 hover:text-green-900 bg-white" onClick={() => {
                setResult(null);
                setForm(prev => ({ ...prev, amount: '', description: '', receiver_id: '' }));
             }}>
                Make Another Payment
             </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
