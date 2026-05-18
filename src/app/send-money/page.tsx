'use client';

import { useTranslations } from 'next-intl';
import RatePreviewCard from '@/src/components/dashboard/send-money/RatePreviewCard';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { 
  Loader2,
  Globe,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { useSendMoneyForm } from '@/src/hooks/useSendMoneyForm';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'next/navigation';
import FundingSourceSelector from '@/src/components/dashboard/send-money/FundingSourceSelector';
import PayoutMethodSelector from '@/src/components/dashboard/send-money/PayoutMethodSelector';
import PaymentSuccess from '@/src/components/dashboard/send-money/PaymentSuccess';
import ReceiverLookup from '@/src/components/dashboard/send-money/ReceiverLookup';
import AmountInput from '@/src/components/dashboard/send-money/AmountInput';
import TargetCurrencySelector from '@/src/components/dashboard/send-money/TargetCurrencySelector';
import FlowTypeSelector from '@/src/components/dashboard/send-money/FlowTypeSelector';

export default function SendMoneyPage() {
  const t = useTranslations('SendMoney');
  const { user } = useAuth();
  const router = useRouter();
  const isVerified = user?.kycStatus === 'verified';
  
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
    hasTouchedAmount,
    onChange,
    onSubmit,
    formErrors
  } = useSendMoneyForm();

  const showPreview = hasTouchedAmount && form.currency && targetCurrency && amountNumber > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      <div className="relative overflow-hidden bg-slate-900 dark:bg-slate-950 rounded-2xl p-6 md:p-8 text-white shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-400 font-bold text-[10px] uppercase tracking-[0.3em] mb-2">
              <Zap size={14} fill="currentColor" /> {t('instantSettlement')}
            </div>
            <h1 className="text-4xl font-black tracking-tighter">{t('title')}</h1>
            <p className="text-slate-400 font-medium">{t('subtitle')}</p>
          </div>
          <FlowTypeSelector flowType={flowType} onChange={setFlowType} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Form */}
        <div className="lg:col-span-8 space-y-6">
          {!isVerified && (
            <div 
              onClick={() => router.push('/onboarding')}
              className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="text-base font-bold text-amber-900 dark:text-amber-200">{t('kycRequired.title')}</p>
                  <p className="text-sm text-amber-700 dark:text-amber-400">{t('kycRequired.subtitle')}</p>
                </div>
              </div>
              <ArrowRight size={24} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
            </div>
          )}

          <Card className={`border border-slate-200/60 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 ${!isVerified ? 'opacity-60 grayscale' : ''}`}>
            <CardContent className="p-6 md:p-8">
              <form id="payment-form" onSubmit={onSubmit} className="space-y-8">
                
                {/* Section 1: Receiver */}
                <div className="space-y-6 relative z-30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center text-xs font-black">1</div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{t('sections.recipientDetails')}</h3>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 relative">
                    <ReceiverLookup
                      value={form.receiver_id}
                      onChange={onChange}
                      loading={receiverLoading}
                      suggestions={suggestions}
                      showSuggestions={showSuggestions}
                      setShowSuggestions={setShowSuggestions}
                      onSelectSuggestion={(address) => {
                        setForm('receiver_id', address);
                        setSuggestions([]);
                        setShowSuggestions(false);
                      }}
                      receiverName={receiverName}
                    />
                    {formErrors.receiver_id && (
                      <p className="text-sm text-red-500 font-medium mt-2 px-1 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                        <AlertCircle size={14} />
                        {formErrors.receiver_id.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Section 2: Amount & Currency */}
                <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center text-xs font-black">2</div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{t('sections.transferAmount')}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <AmountInput amount={form.amount} currency={form.currency} onChange={onChange} />
                      {formErrors.amount && (
                        <p className="text-sm text-red-500 font-medium px-1 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                          <AlertCircle size={14} />
                          {formErrors.amount.message}
                        </p>
                      )}
                    </div>
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
                    <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center text-xs font-black">3</div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{t('sections.paymentPath')}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FundingSourceSelector currency={form.currency} walletBalance={walletBalance} value={fundingSource} onChange={setFundingSource} />
                    <PayoutMethodSelector targetCurrency={targetCurrency} value={payoutMethod} onChange={setPayoutMethod} />
                  </div>
                </div>

                {/* Final Button */}
                <div className="pt-6 space-y-4">
                  <Button
                    type="submit" 
                    disabled={loading || !isVerified} 
                    className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-base rounded-xl"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : t('cta.confirmTransfer')}
                  </Button>
                  <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                    <ShieldCheck size={14} className="text-green-500" /> {t('security.aes256')}
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
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-300 dark:text-slate-600">
                    <Globe size={32} />
                </div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed">
                  {t('preview.empty')}
                </p>
            </div>
          )}

          {error && (
            <div className="bg-red-600 text-white p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
               <div className="bg-white/20 p-2 rounded-full shrink-0 backdrop-blur-sm">
                  <AlertCircle className="text-white" size={24} />
               </div>
               <div>
                 <p className="font-black text-white text-sm uppercase tracking-wide">
                    {(() => {
                      const e = error.toLowerCase();
                      const security =
                        e.includes('security alert') ||
                        e.includes('restricted') ||
                        e.includes('untrusted device') ||
                        e.includes('blacklist');
                      return security ? t('errors.blockedTitle') : t('errors.paymentFailedTitle');
                    })()}
                 </p>
                 <p className="text-sm text-white/90 font-medium mt-1 leading-relaxed">
                    {error.includes('untrusted device') 
                        ? t('errors.untrustedDevice')
                        : error}
                 </p>
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
                setForm('amount', '');
                setForm('description', '');
                setForm('receiver_id', '');
                setResult(null);
                setReceiverName(null);
              }}
            />
          )}

          <div className="p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start gap-3">
              <Info size={18} className="text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                {t('feeNote')}
              </p>
          </div>
        </div>
      </div>
    </div>
  );
}
