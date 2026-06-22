'use client';

import MoneySourcesProviders from '@/src/components/dashboard/money-sources/MoneySourcesProviders';
import { useTranslations } from 'next-intl';

interface FundingSourceSelectorProps {
  currency: string;
  walletBalance: number;
  value: string;
  onChange: (value: string) => void;
}

export default function FundingSourceSelector({
  currency,
  walletBalance,
  value,
  onChange,
}: FundingSourceSelectorProps) {
  const t = useTranslations('SendMoney');

  return (
    <MoneySourcesProviders
      mode="funding"
      currency={currency}
      walletBalance={walletBalance}
      value={value}
      onChange={onChange}
      title={t('fundingSource')}
      layout="grid"
    />
  );
}
