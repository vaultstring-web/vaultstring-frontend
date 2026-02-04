'use client';

import { useTranslations } from 'next-intl';
import RatePreviewCard from '@/src/components/dashboard/send-money/RatePreviewCard';
import PageHeader from '@/src/components/shared/PageHeader';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { 
  Send, 
  Wallet, 
  Loader2,
  Globe,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ArrowRight
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
                  <FlowTypeSelector flowType={flowType} onChange={setFlowType} />
               </div>
            </div>
            
            <CardContent className="p-6">
              <form id="payment-form" onSubmit={onSubmit} className="space-y-8">
                
                {/* Receiver Section */}
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

                {/* Amount Section */}
                <AmountInput
                  amount={form.amount}
                  currency={form.currency}
                  onChange={onChange}
                />

                {/* Target Currency */}
                {flowType === 'INTERNATIONAL' && (
                    <TargetCurrencySelector
                      targetCurrency={targetCurrency}
                      sourceCurrency={form.currency}
                      onChange={(value) => setTargetCurrency(value as any)}
                    />
                )}

                {/* Funding Source Selector */}
                <FundingSourceSelector 
                  currency={form.currency} 
                  walletBalance={walletBalance} 
                  value={fundingSource} 
                  onChange={setFundingSource} 
                />

                {/* Payout Method Selector */}
                <PayoutMethodSelector 
                  targetCurrency={targetCurrency} 
                  value={payoutMethod} 
                  onChange={setPayoutMethod} 
                />

                {/* Description */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700">Reference / Note (Optional)</Label>
                  <Input
                    name="description"
                    value={form.description}
                    onChange={onChange}
                    placeholder="What is this payment for?"
                    className="border-slate-200 h-11"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg shadow-lg shadow-indigo-200 transition-all !text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing Securely...
                    </>
                  ) : (
                    <>
                      Confirm & Send Payment
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Preview & Status */}
        <div className="space-y-6">
          {/* Rate Preview */}
          {showPreview && (
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
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start shadow-sm animate-in fade-in slide-in-from-top-2">
               <AlertCircle className="h-5 w-5 mr-2 mt-0.5 shrink-0" />
               <div>
                 <p className="font-semibold">Transaction Failed</p>
                 <p className="text-sm mt-1">{error}</p>
               </div>
            </div>
          )}

          {/* Success Message */}
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
        </div>

      </div>
    </div>
  );
}
