'use client';

import { useTranslations } from 'next-intl';
import RatePreviewCard from '@/src/components/dashboard/send-money/RatePreviewCard';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { 
  Send, 
  Loader2,
  Globe,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { useSendMoneyForm } from '@/src/hooks/useSendMoneyForm';
import FundingSourceSelector from '@/src/components/dashboard/send-money/FundingSourceSelector';
import PayoutMethodSelector from '@/src/components/dashboard/send-money/PayoutMethodSelector';
import PaymentSuccess from '@/src/components/dashboard/send-money/PaymentSuccess';
import ReceiverLookup from '@/src/components/dashboard/send-money/ReceiverLookup';
import AmountInput from '@/src/components/dashboard/send-money/AmountInput';
import TargetCurrencySelector from '@/src/components/dashboard/send-money/TargetCurrencySelector';
import FlowTypeSelector from '@/src/components/dashboard/send-money/FlowTypeSelector';

export default function SendMoneyPage() {
  const t = useTranslations('SendMoney');
  
  const {
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
  } = useSendMoneyForm(t);

  const showPreview = form.currency && targetCurrency && amountNumber > 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
      {/* Premium Dark Header */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[40px] p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/10 blur-[120px] rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-400 font-bold text-[10px] uppercase tracking-[0.3em] mb-2">
              <Zap size={14} fill="currentColor" /> Instant Settlement
            </div>
            <h1 className="text-4xl font-black tracking-tighter">Send Funds</h1>
            <p className="text-slate-400 font-medium">Transfer money globally with bank-grade security.</p>
          </div>
          <FlowTypeSelector flowType={flowType} onChange={setFlowType} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Form */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-none shadow-[0_30px_60px_rgba(0,0,0,0.04)] rounded-[40px] overflow-hidden bg-white">
            <CardContent className="p-8 md:p-12">
              <form id="payment-form" onSubmit={onSubmit} className="space-y-12">
                
                {/* Section 1: Receiver */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black">1</div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recipient Details</h3>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                    <ReceiverLookup
                      value={form.receiver_id}
                      onChange={onChange}
                      loading={receiverLoading}
                      suggestions={suggestions}
                      showSuggestions={showSuggestions}
                      setShowSuggestions={setShowSuggestions}
                      onSelectSuggestion={(address) => {
                        setForm(f => ({ ...f, receiver_id: address }));
                        setSuggestions([]);
                        setShowSuggestions(false);
                      }}
                      receiverName={receiverName}
                    />
                  </div>
                </div>

                {/* Section 2: Amount & Currency */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black">2</div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Transfer Amount</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AmountInput amount={form.amount} currency={form.currency} onChange={onChange} />
                    {flowType === 'INTERNATIONAL' && (
                        <TargetCurrencySelector
                          targetCurrency={targetCurrency}
                          sourceCurrency={form.currency}
                          onChange={(value) => setTargetCurrency(value as any)}
                        />
                    )}
                  </div>
                </div>

                {/* Section 3: Payment Method */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black">3</div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Payment Path</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FundingSourceSelector currency={form.currency} walletBalance={walletBalance} value={fundingSource} onChange={setFundingSource} />
                    <PayoutMethodSelector targetCurrency={targetCurrency} value={payoutMethod} onChange={setPayoutMethod} />
                  </div>
                </div>

                {/* Final Button */}
                <div className="pt-6 space-y-4">
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full h-18 py-8 bg-green-600 hover:bg-green-700 text-white font-black text-xl rounded-[28px] shadow-2xl shadow-green-100 transition-all hover:scale-[1.01] active:scale-95"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : 'Confirm & Transfer Now'}
                  </Button>
                  <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                    <ShieldCheck size={14} className="text-green-500" /> AES-256 Encrypted Payment
                  </div>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Data Widgets */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
          {showPreview ? (
             <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <RatePreviewCard
                  from={form.currency}
                  to={targetCurrency}
                  amount={amountNumber}
                  rate={previewRate}
                  converted={previewConverted}
                  loading={previewLoading}
                  fee={previewFee}
                  error={previewError}
                />
             </div>
          ) : (
            <div className="p-8 bg-white rounded-[32px] border border-dashed border-slate-200 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                    <Globe size={32} />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Enter an amount to see<br/>live exchange rates</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 p-6 rounded-[32px] flex items-start gap-4 shadow-sm">
               <AlertCircle className="text-red-500 shrink-0" size={24} />
               <div>
                 <p className="font-black text-red-900 text-sm">Transaction Blocked</p>
                 <p className="text-xs text-red-600 font-medium mt-1 leading-relaxed">{error}</p>
               </div>
            </div>
          )}

          {result && (
            <PaymentSuccess
              result={result}
              amount={amountNumber}
              currency={form.currency}
              receiverName={receiverName}
              onReset={() => {
                setForm(f => ({ ...f, amount: '', description: '', receiver_id: '' }));
                setResult(null);
                setReceiverName(null);
              }}
            />
          )}

          <div className="p-6 bg-slate-100/50 rounded-[32px] border border-slate-100 flex items-start gap-3">
              <Info size={18} className="text-slate-400 shrink-0 mt-0.5" />
              <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                Fees are calculated dynamically based on liquidity and network volume at the time of transfer.
              </p>
          </div>
        </div>
      </div>
    </div>
  );
}