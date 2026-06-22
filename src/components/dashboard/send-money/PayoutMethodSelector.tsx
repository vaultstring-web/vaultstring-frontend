'use client';

import MoneySourcesProviders from '@/src/components/dashboard/money-sources/MoneySourcesProviders';
import { useTranslations } from 'next-intl';

interface PayoutMethodSelectorProps {
  targetCurrency: string;
  value: string;
  onChange: (value: string) => void;
}

export default function PayoutMethodSelector({
  targetCurrency,
  value,
  onChange,
}: PayoutMethodSelectorProps) {
  const t = useTranslations('SendMoney');

  return (
    <MoneySourcesProviders
      mode="payout"
      currency={targetCurrency}
      targetCurrency={targetCurrency}
      value={value}
      onChange={onChange}
      title={t('payoutMethod')}
      layout="grid"
    />
  );
}
