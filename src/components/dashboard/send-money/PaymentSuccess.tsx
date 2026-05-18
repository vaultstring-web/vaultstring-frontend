'use client';

import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { formatCurrency } from '@/src/lib/utils/formatters';
import { useTranslations } from 'next-intl';

interface PaymentSuccessProps {
  result: {
    transaction_id?: string;
    receiver_name?: string;
    receiver_wallet_number?: string;
  };
  amount: number;
  currency: string;
  receiverName?: string | null;
  onReset: () => void;
}

export default function PaymentSuccess({
  result,
  amount,
  currency,
  receiverName,
  onReset,
}: PaymentSuccessProps) {
  const t = useTranslations('SendMoney.successCard');

  return (
    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-5 py-5 rounded-xl shadow-sm animate-in fade-in zoom-in-95">
      <div className="flex flex-col items-center text-center">
        <div className="h-14 w-14 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mb-3 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={28} aria-hidden />
        </div>
        <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 mb-1">{t('title')}</h3>
        <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-4">
          {t('subtitle')}
        </p>

        <div className="w-full bg-white dark:bg-slate-900 rounded-lg border border-emerald-100 dark:border-emerald-900 p-4 text-left space-y-2 mb-4">
          <div className="flex justify-between text-sm gap-3">
            <span className="text-emerald-600 dark:text-emerald-400 shrink-0">{t('transactionId')}</span>
            <span className="font-mono font-medium dark:text-slate-200 text-right truncate">
              {result.transaction_id ? `${result.transaction_id.substring(0, 8)}…` : '—'}
            </span>
          </div>
          <div className="flex justify-between text-sm gap-3">
            <span className="text-emerald-600 dark:text-emerald-400 shrink-0">{t('receiver')}</span>
            <span className="font-medium dark:text-slate-200 text-right truncate">
              {result.receiver_name || receiverName || result.receiver_wallet_number}
            </span>
          </div>
          <div className="flex justify-between text-sm gap-3">
            <span className="text-emerald-600 dark:text-emerald-400 shrink-0">{t('amountSent')}</span>
            <span className="font-semibold dark:text-slate-200">
              {formatCurrency(amount, currency)}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:text-emerald-800 dark:hover:text-emerald-200"
          onClick={onReset}
          type="button"
        >
          {t('sendAnother')}
        </Button>
      </div>
    </div>
  );
}
