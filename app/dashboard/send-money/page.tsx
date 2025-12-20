// app/dashboard/send-money/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch, isAuthenticated } from '@/src/lib/api/api-client';
import RatePreviewCard from '@/src/components/dashboard/RatePreviewCard';
import PageHeader from '@/src/components/shared/PageHeader';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Button } from '@/src/components/ui/button';
import { useAuth } from '@/src/context/AuthContext';

export default function SendMoneyPage() {
  const [form, setForm] = useState({ receiver_id: '', amount: '', currency: 'MWK', description: '', channel: 'web', category: 'transfer' });
  const [targetCurrency, setTargetCurrency] = useState<'MWK' | 'CNY' | 'USD'>('CNY');
  const [flowType, setFlowType] = useState<'INTERNATIONAL' | 'SAME'>('INTERNATIONAL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [didAutoSetCurrency, setDidAutoSetCurrency] = useState(false);
  const { user } = useAuth();
  const amountNumber = useMemo(() => Number(form.amount || 0), [form.amount]);
  const [previewRate, setPreviewRate] = useState<number | null>(null);
  const [previewConverted, setPreviewConverted] = useState<number | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewFee, setPreviewFee] = useState<number | null>(null);
  const [fundingSource, setFundingSource] = useState<string>('');
  const [payoutMethod, setPayoutMethod] = useState<string>('');
  const DEMO_WANG_ID = '04e30bdc-4d04-4e90-a241-456fd96fcba3';
  const isUUID = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
  const isUUIDShape = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
  const sanitizeUUID = (s: string) =>
    s
      .normalize('NFKC')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, '-')
      .replace(/[^0-9a-fA-F-]/g, '')
      .trim()
      .toLowerCase();
  const sanitizedRid = useMemo(() => sanitizeUUID(String(form.receiver_id ?? '')), [form.receiver_id]);
  const homeCurrency = useMemo<'MWK' | 'CNY' | 'USD'>(() => {
    const cc = String(user?.countryCode || '').toUpperCase();
    if (cc === 'CN') return 'CNY';
    if (cc === 'MW') return 'MWK';
    return 'MWK';
  }, [user?.countryCode]);
  const fundingOptions = useMemo(() => {
    if (form.currency === 'MWK') {
      return [
        { value: 'airtel_money', label: 'Airtel Money', channel: 'mobile_money' },
        { value: 'tnm_mpamba', label: 'TNM Mpamba', channel: 'mobile_money' },
        { value: 'nbm', label: 'National Bank of Malawi', channel: 'bank' },
        { value: 'standard_bank_mw', label: 'Standard Bank Malawi', channel: 'bank' },
        { value: 'fdh_bank', label: 'FDH Bank', channel: 'bank' },
        { value: 'nbs_bank', label: 'NBS Bank', channel: 'bank' },
        { value: 'first_capital_bank', label: 'First Capital Bank', channel: 'bank' },
        { value: 'ecobank_mw', label: 'Ecobank Malawi', channel: 'bank' },
        { value: 'visa_mastercard', label: 'Visa/Mastercard', channel: 'card' },
      ];
    }
    if (form.currency === 'CNY') {
      return [
        { value: 'alipay', label: 'Alipay', channel: 'mobile_money' },
        { value: 'wechat_pay', label: 'WeChat Pay', channel: 'mobile_money' },
        { value: 'icbc', label: 'ICBC', channel: 'bank' },
        { value: 'ccb', label: 'China Construction Bank', channel: 'bank' },
        { value: 'boc', label: 'Bank of China', channel: 'bank' },
        { value: 'abc', label: 'Agricultural Bank of China', channel: 'bank' },
        { value: 'cmb', label: 'China Merchants Bank', channel: 'bank' },
        { value: 'unionpay_card', label: 'UnionPay Card', channel: 'card' },
      ];
    }
    return [
      { value: 'visa_mastercard', label: 'Visa/Mastercard', channel: 'card' },
      { value: 'standard_bank_intl', label: 'Standard Bank (International)', channel: 'bank' },
      { value: 'ecobank_intl', label: 'Ecobank (International)', channel: 'bank' },
      { value: 'wire_transfer', label: 'Bank Wire Transfer', channel: 'bank' },
    ];
  }, [form.currency]);
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      if (!isAuthenticated()) throw new Error('Please login to send a payment');
      const rid = sanitizeUUID(String(form.receiver_id ?? ''));
      if (!(isUUID(rid) || isUUIDShape(rid))) {
        throw new Error('Wallet ID must be a valid UUID');
      }
      const selectedFunding = fundingOptions.find((o) => o.value === fundingSource);
      const derivedChannel = selectedFunding?.channel || form.channel;
      const payload = {
        receiver_wallet_id: rid,
        amount: Number(form.amount),
        currency: form.currency,
        description: form.description,
        channel: derivedChannel,
        category: fundingSource || form.category,
      };
      const res = await apiFetch('/payments/initiate', { method: 'POST', body: JSON.stringify(payload) });
      setResult(res);
    } catch (e: any) {
      const msg = e?.data?.error || e?.message || 'Payment failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const showPreview = form.currency && targetCurrency && amountNumber > 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Send Money" subtitle="Initiate cross-border transfers and payouts here." variant="hero" />

      <form onSubmit={onSubmit} className="bg-white rounded-xl border p-0 overflow-hidden">
        <div className="p-6 border-b bg-slate-50">
          <h2 className="text-xl font-semibold text-slate-900">How much do you want to send?</h2>
          <div className="mt-4 inline-flex rounded-full border bg-white">
            <button
              type="button"
              onClick={() => setFlowType('INTERNATIONAL')}
              className={`px-4 py-2 text-sm rounded-full transition ${flowType === 'INTERNATIONAL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              International
            </button>
            <button
              type="button"
              onClick={() => setFlowType('SAME')}
              className={`px-4 py-2 text-sm rounded-full transition ${flowType === 'SAME' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Same Currency
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-3">
              <Label className="text-slate-900">Recipient Wallet ID (UUID)</Label>
              <Input
                name="receiver_id"
                value={form.receiver_id}
                onChange={onChange}
                placeholder="e.g. wallet UUID"
                required
                className="text-slate-900 placeholder:text-slate-500 bg-white"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                inputMode="text"
              />
              <div className="text-xs text-slate-600">
                <span>Sanitized:</span> <span className="font-mono">{sanitizedRid || '—'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-900">You will send</Label>
                <div className="mt-1 flex items-center rounded-lg border border-slate-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-green-500">
                  <input
                    name="amount"
                    value={form.amount}
                    onChange={onChange}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                    className="w-full px-4 py-3 outline-none text-slate-900 placeholder:text-slate-400"
                  />
                  <div className="border-l bg-slate-50 px-3 py-3">
                    <select
                      name="currency"
                      value={form.currency}
                      onChange={onChange}
                      className="bg-transparent text-slate-900"
                    >
                      <option value="MWK">MWK</option>
                      <option value="CNY">CNY</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-slate-900">Recipient will get (preview)</Label>
                <div className="mt-1 flex items-center rounded-lg border border-slate-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-green-500">
                  <input
                    value={previewConverted != null ? Number(previewConverted).toFixed(2) : ''}
                    readOnly
                    placeholder="0.00"
                    className="w-full px-4 py-3 outline-none text-slate-900 placeholder:text-slate-400"
                  />
                  <div className="border-l bg-slate-50 px-3 py-3">
                    <select
                      name="target_currency"
                      value={targetCurrency}
                      onChange={(e) => setTargetCurrency(e.target.value as any)}
                      className="bg-transparent text-slate-900"
                    >
                      <option value="CNY">CNY</option>
                      <option value="USD">USD</option>
                      <option value="MWK">MWK</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-slate-900">Funding Source</Label>
                <select value={fundingSource} onChange={(e) => setFundingSource(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2 text-slate-900 bg-white">
                  <option value="">Select source</option>
                  {fundingOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {showPreview && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <RatePreviewCard
                  fromCurrency={form.currency}
                  toCurrency={targetCurrency}
                  amount={amountNumber}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-900">Payout Method</Label>
                <select value={payoutMethod} onChange={(e) => setPayoutMethod(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2 text-slate-900 bg-white">
                  <option value="">Select method</option>
                  {payoutOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-slate-900">Category</Label>
                <Input name="category" value={form.category} onChange={onChange} placeholder="e.g. transfer" className="text-slate-900 placeholder:text-slate-500 bg-white" />
              </div>
            </div>
            <div>
              <Label className="text-slate-900">Description</Label>
              <Input name="description" value={form.description} onChange={onChange} placeholder="Payment description" className="text-slate-900 placeholder:text-slate-500 bg-white" />
            </div>
          </div>

          <div className="md:col-span-1 space-y-4">
              <div className="rounded-xl border border-slate-200 p-4 bg-white">
                <div className="text-sm text-slate-700 mb-2">Summary</div>
                <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-700">Fees</span><span className="font-medium text-slate-900">{previewFee != null ? `${Number(previewFee).toFixed(2)} ${form.currency}` : '—'}</span></div>
                <div className="flex justify-between"><span className="text-slate-700">You will pay</span><span className="font-medium text-slate-900">{form.amount || '0.00'} {form.currency}</span></div>
                <div className="flex justify-between"><span className="text-slate-700">Guaranteed rate (12h)</span><span className="font-mono text-slate-900">{previewRate != null ? String(previewRate) : '—'}</span></div>
                </div>
                <div className="mt-4">
                  <button type="button" className="w-full text-sm text-slate-700 border rounded-md px-3 py-2 hover:bg-slate-50">Set Schedule</button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Processing...' : 'Send Payment'}
            </Button>
          </div>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-4 max-w-xl">{error}</div>
      )}

      {result?.transaction && (
        <div className="bg-white rounded-xl border p-6 max-w-xl">
          <h2 className="text-xl font-semibold mb-4">Payment Result</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-700">Reference</span><span className="font-mono text-slate-900">{String(result.transaction.reference)}</span></div>
            <div className="flex justify-between"><span className="text-slate-700">Status</span><span className="font-semibold text-slate-900">{String(result.transaction.status)}</span></div>
            <div className="flex justify-between"><span className="text-slate-700">Amount</span><span className="font-semibold text-slate-900">{String(result.transaction.amount)}</span></div>
            <div className="flex justify-between"><span className="text-slate-700">Currency</span><span className="text-slate-900">{String(result.transaction.currency)}</span></div>
            <div className="flex justify-between"><span className="text-slate-700">Converted</span><span className="text-slate-900">{String(result.transaction.converted_amount)} {String(result.transaction.converted_currency)}</span></div>
            <div className="flex justify-between"><span className="text-slate-700">Receiver Wallet ID</span><span className="font-mono text-slate-900">{String(result.transaction.receiver_wallet_id || '')}</span></div>
            <div className="flex justify-between"><span className="text-slate-700">Receiver User ID</span><span className="font-mono text-slate-900">{String(result.transaction.receiver_id || '')}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
