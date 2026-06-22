'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import RatePreviewCard from '@/src/components/dashboard/send-money/RatePreviewCard';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import {
  Loader2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';
import { PageHeader } from '@/src/components/enterprise/PageHeader';
import { CustomerPageShell } from '@/src/components/enterprise/CustomerPageShell';
import { useSendMoneyForm } from '@/src/hooks/useSendMoneyForm';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'next/navigation';
import FundingSourceSelector from '@/src/components/dashboard/send-money/FundingSourceSelector';
import PayoutMethodSelector from '@/src/components/dashboard/send-money/PayoutMethodSelector';
import ReceiverLookup from '@/src/components/dashboard/send-money/ReceiverLookup';
import AmountInput from '@/src/components/dashboard/send-money/AmountInput';
import TargetCurrencySelector from '@/src/components/dashboard/send-money/TargetCurrencySelector';
import FlowTypeSelector from '@/src/components/dashboard/send-money/FlowTypeSelector';
import SendMoneyStepper from '@/src/components/dashboard/send-money/SendMoneyStepper';
import { cn } from '@/lib/utils';

export default function SendMoneyPage() {
  const t = useTranslations('SendMoney');
  const { user } = useAuth();
  const router = useRouter();
  const isVerified = user?.kycStatus === 'verified';
  const [step, setStep] = useState<1 | 2>(1);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);

  const {
    form,
    setForm,
    targetCurrency,
    setTargetCurrency,
    flowType,
    setFlowType,
    fundingSource,
    setFundingSource,
    payoutMethod,
    setPayoutMethod,
    loading,
    error,
    walletBalance,
    receiverName,
    receiverLoading,
    suggestions,
    showSuggestions,
    setSuggestions,
    setShowSuggestions,
    previewRate,
    previewConverted,
    previewLoading,
    previewError,
    previewFee,
    amountNumber,
    hasTouchedAmount,
    onChange,
    onSubmit,
    formErrors,
    trigger,
  } = useSendMoneyForm();

  const showPreview = hasTouchedAmount && form.currency && targetCurrency && amountNumber > 0;

  const goToReview = async () => {
    const valid = await trigger(['receiver_id', 'amount', 'currency']);
    if (valid) setStep(2);
  };

  return (
    <CustomerPageShell width="narrow" compact>
      <PageHeader
        title={t('title')}
        description={t('subtitleCompact')}
        actions={<FlowTypeSelector flowType={flowType} onChange={setFlowType} />}
      />

      <SendMoneyStepper step={step} />

      {!isVerified && (
        <button
          type="button"
          onClick={() => router.push('/onboarding')}
          className="vs-card-shell flex w-full items-center justify-between gap-3 border-amber-500/30 bg-amber-500/5 p-3 text-left hover:bg-amber-500/10"
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-foreground">{t('kycRequired.title')}</p>
              <p className="text-xs text-muted-foreground">{t('kycRequired.subtitle')}</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </button>
      )}

      <Card className={cn('vs-card-shell border-0 shadow-none', !isVerified && 'opacity-60')}>
        <CardContent className="p-4 sm:p-6">
          <form id="payment-form" onSubmit={onSubmit} className="space-y-6">
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <h2 className="text-lg font-semibold text-foreground">{t('stepper.detailsHeading')}</h2>
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
                  <p className="flex items-center gap-2 text-sm text-red-500">
                    <AlertCircle size={14} />
                    {formErrors.receiver_id.message}
                  </p>
                )}
                <AmountInput amount={form.amount} currency={form.currency} onChange={onChange} />
                {formErrors.amount && (
                  <p className="flex items-center gap-2 text-sm text-red-500">
                    <AlertCircle size={14} />
                    {formErrors.amount.message}
                  </p>
                )}
                {flowType === 'INTERNATIONAL' && (
                  <TargetCurrencySelector
                    targetCurrency={targetCurrency}
                    sourceCurrency={form.currency}
                    onChange={(value) => setTargetCurrency(value as typeof targetCurrency)}
                  />
                )}
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
                <p className="text-xs text-muted-foreground">
                  {t('funding.walletWithBalance', {
                    balance: walletBalance.toFixed(2),
                    currency: form.currency,
                  })}
                </p>
                <Button
                  type="button"
                  className="h-11 w-full"
                  disabled={!isVerified}
                  onClick={goToReview}
                >
                  {t('stepper.continue')} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft size={16} /> {t('stepper.backToEdit')}
                </button>
                <h2 className="text-lg font-semibold text-foreground">{t('stepper.reviewHeading')}</h2>
                <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('recipientWalletNumber')}</span>
                    <span className="font-medium">{form.receiver_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('amount')}</span>
                    <span className="font-medium">
                      {form.amount} {form.currency}
                    </span>
                  </div>
                  {showPreview && previewConverted != null && (
                    <div className="flex justify-between border-t border-border pt-2">
                      <span className="text-muted-foreground">{t('previewCard.recipientGets')}</span>
                      <span className="font-semibold text-primary">
                        {previewConverted} {targetCurrency}
                      </span>
                    </div>
                  )}
                </div>
                <FundingSourceSelector
                  currency={form.currency}
                  walletBalance={walletBalance}
                  value={fundingSource}
                  onChange={setFundingSource}
                />
                <PayoutMethodSelector
                  targetCurrency={targetCurrency}
                  value={payoutMethod}
                  onChange={setPayoutMethod}
                />
                <label className="flex items-start gap-2 text-xs font-medium text-muted-foreground">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={reviewConfirmed}
                    onChange={(event) => setReviewConfirmed(event.target.checked)}
                  />
                  <span>{t('reviewConfirm')}</span>
                </label>
                <Button
                  type="submit"
                  disabled={loading || !isVerified || !reviewConfirmed}
                  className="h-11 w-full text-base font-semibold"
                >
                  {loading ? <Loader2 className="animate-spin" /> : t('cta.confirmTransfer')}
                </Button>
                {!reviewConfirmed && (
                  <p className="text-center text-xs text-muted-foreground">{t('reviewHint')}</p>
                )}
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
          <p className="font-semibold">{t('errors.paymentFailedTitle')}</p>
          <p className="mt-1">{error}</p>
        </div>
      )}
    </CustomerPageShell>
  );
}
