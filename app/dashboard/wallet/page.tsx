// app/dashboard/wallet/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { apiFetch, isAuthenticated } from '@/src/lib/api/api-client';
import WalletGrid from '@/src/components/dashboard/WalletGrid';
import PageHeader from '@/src/components/shared/PageHeader';
import { Button } from '@/src/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { Label } from '@/src/components/ui/label';
import { Input } from '@/src/components/ui/input';
import { useAuth } from '@/src/context/AuthContext';

export default function WalletPage() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const UI_ONLY = true;
  const [openCreate, setOpenCreate] = useState(false);
  const [openFunds, setOpenFunds] = useState(false);
  const [newCurrency, setNewCurrency] = useState('MWK');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [fundAmount, setFundAmount] = useState('');
  const [fundCurrency, setFundCurrency] = useState('MWK');
  const [fundWalletId, setFundWalletId] = useState<string>('');
  const [funding, setFunding] = useState(false);
  const [fundError, setFundError] = useState<string | null>(null);
  const [fundSuccess, setFundSuccess] = useState<string | null>(null);
  const [fundSource, setFundSource] = useState<string>('');
  const [fundReceipt, setFundReceipt] = useState<any | null>(null);
  const allowedCurrencies = (() => {
    const cc = String(user?.countryCode || '').toUpperCase();
    if (cc === 'CN') return ['CNY'];
    if (cc === 'MW') return ['MWK'];
    return ['MWK'];
  })();
  const providerGroups = (() => {
    if (fundCurrency === 'MWK') {
      return {
        mobile_money: [
          { value: 'airtel_money', label: 'Airtel Money' },
          { value: 'tnm_mpamba', label: 'TNM Mpamba' },
        ],
        bank: [
          { value: 'nbm', label: 'National Bank of Malawi' },
          { value: 'standard_bank_mw', label: 'Standard Bank Malawi' },
          { value: 'fdh_bank', label: 'FDH Bank' },
          { value: 'nbs_bank', label: 'NBS Bank' },
          { value: 'first_capital_bank', label: 'First Capital Bank' },
          { value: 'ecobank_mw', label: 'Ecobank Malawi' },
        ],
        card: [
          { value: 'visa_mastercard', label: 'Visa/Mastercard' },
        ],
      };
    }
    if (fundCurrency === 'CNY') {
      return {
        mobile_money: [
          { value: 'alipay', label: 'Alipay' },
          { value: 'wechat_pay', label: 'WeChat Pay' },
        ],
        bank: [
          { value: 'icbc', label: 'ICBC' },
          { value: 'ccb', label: 'China Construction Bank' },
          { value: 'boc', label: 'Bank of China' },
          { value: 'abc', label: 'Agricultural Bank of China' },
          { value: 'cmb', label: 'China Merchants Bank' },
        ],
        card: [
          { value: 'unionpay_card', label: 'UnionPay Card' },
        ],
      };
    }
    return {
      mobile_money: [],
      bank: [
        { value: 'wire_transfer', label: 'Bank Wire Transfer' },
        { value: 'standard_bank_intl', label: 'Standard Bank (International)' },
        { value: 'ecobank_intl', label: 'Ecobank (International)' },
      ],
      card: [
        { value: 'visa_mastercard', label: 'Visa/Mastercard' },
      ],
    };
  })();

  useEffect(() => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await apiFetch('/wallets');
        setWallets(Array.isArray(res?.wallets) ? res.wallets : []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load wallets');
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  
  const onSelectWallet = (id: string) => {
    setFundWalletId(id);
    const w = wallets.find((x) => String(x.id) === String(id));
    if (w && w.currency) {
      setFundCurrency(String(w.currency));
    }
  };

  const onCreateWallet = async () => {
    setCreating(true);
    setCreateError(null);
    setCreateSuccess(null);
    try {
      if (UI_ONLY) {
        const id = crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
        const wallet = {
          id,
          currency: newCurrency,
          available_balance: 0,
          ledger_balance: 0,
          status: 'active',
        };
        setWallets((ws) => [wallet, ...ws]);
        setCreateSuccess('Wallet created (UI only)');
      } else {
        const res = await apiFetch('/wallets', { method: 'POST', body: JSON.stringify({ currency: newCurrency }) });
        const updated = await apiFetch('/wallets');
        setWallets(Array.isArray(updated?.wallets) ? updated.wallets : wallets.concat(res));
        setOpenCreate(false);
      }
    } catch (e: any) {
      setCreateError(e?.message || 'Failed to create wallet');
    } finally {
      setCreating(false);
    }
  };
  
  const onProceedFunds = async () => {
    setFunding(true);
    setFundError(null);
    setFundSuccess(null);
    try {
      if (!fundWalletId) throw new Error('Select a wallet to fund');
      const amt = Number(fundAmount || 0);
      if (!amt || amt <= 0) throw new Error('Enter a valid amount');
      if (UI_ONLY) {
        const ref = `DEP-${Date.now()}`;
        const ts = new Date().toISOString();
        setWallets((ws) =>
          ws.map((w) => {
            if (String(w.id) !== String(fundWalletId)) return w;
            const current = parseFloat(String(w.available_balance ?? w.balance ?? 0));
            const next = current + amt;
            return {
              ...w,
              available_balance: next,
              ledger_balance: typeof w.ledger_balance !== 'undefined' ? next : w.ledger_balance,
              last_transaction_at: new Date().toISOString(),
            };
          })
        );
        setFundSuccess('Funds added (UI only)');
        setFundReceipt({
          reference: ref,
          wallet_id: fundWalletId,
          amount: amt,
          currency: fundCurrency,
          source: fundSource,
          created_at: ts,
        });
      } else {
        const res = await apiFetch(`/wallets/${fundWalletId}/deposit`, {
          method: 'POST',
          body: JSON.stringify({ amount: amt, currency: fundCurrency, source: fundSource })
        });
        setFundSuccess('Deposit requested');
        const updated = await apiFetch('/wallets');
        setWallets(Array.isArray(updated?.wallets) ? updated.wallets : wallets);
        setOpenFunds(false);
        setFundAmount('');
        setFundCurrency('MWK');
        setFundWalletId('');
        setFundSource('');
      }
    } catch (e: any) {
      const msg = e?.data?.error || e?.message || '';
      const shouldSimulate = true;
      if (shouldSimulate) {
        setFundSuccess('Deposit simulated (pending backend endpoint)');
        setFundError(null);
        setWallets((ws) =>
          ws.map((w) => {
            if (String(w.id) !== String(fundWalletId)) return w;
            const current = parseFloat(String(w.available_balance ?? w.balance ?? 0));
            const next = current + Number(fundAmount || 0);
            return {
              ...w,
              available_balance: next,
              ledger_balance: typeof w.ledger_balance !== 'undefined' ? next : w.ledger_balance,
              last_transaction_at: new Date().toISOString(),
            };
          })
        );
      } else {
        setFundError(msg || 'Failed to deposit');
      }
    } finally {
      setFunding(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="My Wallets" 
        subtitle="View balances across currencies."
        variant="hero"
        action={(
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpenCreate(true)}>Create Wallet</Button>
            <Button onClick={() => setOpenFunds(true)}>Add Funds</Button>
          </div>
        )}
      />

      {loading && (
        <div className="bg-white rounded-xl border p-6">Loading wallets...</div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-4">{error}</div>
      )}

      <WalletGrid wallets={wallets} />

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Wallet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-900">Currency</Label>
              <select value={newCurrency} onChange={(e) => setNewCurrency(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2 text-slate-900 bg-white">
                {allowedCurrencies.includes('MWK') && <option value="MWK">MWK</option>}
                {allowedCurrencies.includes('CNY') && <option value="CNY">CNY</option>}
                {allowedCurrencies.includes('USD') && <option value="USD">USD</option>}
              </select>
            </div>
            {createError && <div className="text-sm text-red-600">{createError}</div>}
            {createSuccess && <div className="text-sm text-green-600">{createSuccess}</div>}
            <div className="flex gap-2">
              <Button onClick={onCreateWallet} disabled={creating}>{creating ? 'Creating...' : 'Create'}</Button>
              <Button variant="outline" onClick={() => setOpenCreate(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openFunds} onOpenChange={setOpenFunds}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Funds</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-900">Wallet</Label>
              <select value={fundWalletId} onChange={(e) => onSelectWallet(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2 text-slate-900 bg-white">
                <option value="">Select wallet</option>
                {wallets.map((w) => (
                  <option key={String(w.id)} value={String(w.id)}>
                    {String(w.currency)} • {String(w.id)}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-900">Amount</Label>
                <Input value={fundAmount} onChange={(e) => setFundAmount(e.target.value)} type="number" min="0" step="0.01" placeholder="0.00" className="text-slate-900" />
              </div>
              <div>
                <Label className="text-slate-900">Currency</Label>
                <select value={fundCurrency} onChange={(e) => setFundCurrency(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2 text-slate-900 bg-white">
                  <option value="MWK">MWK</option>
                  <option value="CNY">CNY</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-slate-900">Funding Source</Label>
              <div className="text-xs text-slate-600">Currency: {String(fundCurrency)}</div>
              {providerGroups.mobile_money.length > 0 && (
                <div>
                  <div className="text-xs text-slate-500 mb-2">Mobile Money</div>
                  <div className="grid grid-cols-2 gap-2">
                    {providerGroups.mobile_money.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setFundSource(opt.value)}
                        className={`border rounded-md px-3 py-2 text-sm ${fundSource === opt.value ? 'border-green-600 bg-green-50 text-green-700' : 'border-slate-300 bg-white text-slate-900'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {providerGroups.bank.length > 0 && (
                <div>
                  <div className="text-xs text-slate-500 mb-2">Banks</div>
                  <div className="grid grid-cols-2 gap-2">
                    {providerGroups.bank.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setFundSource(opt.value)}
                        className={`border rounded-md px-3 py-2 text-sm ${fundSource === opt.value ? 'border-green-600 bg-green-50 text-green-700' : 'border-slate-300 bg-white text-slate-900'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {providerGroups.card.length > 0 && (
                <div>
                  <div className="text-xs text-slate-500 mb-2">Cards</div>
                  <div className="grid grid-cols-2 gap-2">
                    {providerGroups.card.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setFundSource(opt.value)}
                        className={`border rounded-md px-3 py-2 text-sm ${fundSource === opt.value ? 'border-green-600 bg-green-50 text-green-700' : 'border-slate-300 bg-white text-slate-900'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={onProceedFunds} disabled={funding || !fundWalletId || !fundAmount || !fundSource}>{funding ? 'Processing...' : 'Proceed'}</Button>
              <Button variant="outline" onClick={() => setOpenFunds(false)}>Cancel</Button>
            </div>
            {fundError && <div className="text-sm text-red-600">{fundError}</div>}
            {!fundError && <div className="text-xs text-slate-600">Deposit endpoint may not be active yet.</div>}
            {fundReceipt && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900 mb-2">Deposit Summary</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-slate-600">Reference</span><span className="font-mono text-slate-900">{String(fundReceipt.reference)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Wallet</span><span className="font-mono text-slate-900">{String(fundReceipt.wallet_id)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Amount</span><span className="text-slate-900">{String(fundReceipt.amount)} {String(fundReceipt.currency)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Source</span><span className="text-slate-900">{String(fundReceipt.source)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Time</span><span className="text-slate-900">{String(fundReceipt.created_at)}</span></div>
                </div>
                <div className="mt-3">
                  <Button variant="outline" onClick={() => { setOpenFunds(false); setFundReceipt(null); setFundAmount(''); setFundSource(''); }}>Close</Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
