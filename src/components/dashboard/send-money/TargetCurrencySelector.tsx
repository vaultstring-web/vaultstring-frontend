'use client';

import { Label } from '@/src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';

import { AFRICAN_COUNTRIES } from '@/src/lib/constants/africa';
import { useTranslations } from 'next-intl';

interface TargetCurrencySelectorProps {
  targetCurrency: string;
  sourceCurrency: string;
  onChange: (value: string) => void;
}

export default function TargetCurrencySelector({ targetCurrency, sourceCurrency, onChange }: TargetCurrencySelectorProps) {
  const t = useTranslations('SendMoney');

  const africanCurrencies = Array.from(new Set(AFRICAN_COUNTRIES.map((c) => c.currency)));
  const currencies = [...africanCurrencies, 'CNY'].filter((c) => c !== sourceCurrency);

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('targetReceivesLabel')}</Label>
      <Select value={targetCurrency} onValueChange={onChange}>
        <SelectTrigger className="h-14 bg-white text-slate-900 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-indigo-500 rounded-xl text-lg font-bold dark:text-white">
          <SelectValue placeholder={t('selectPlaceholder')} />
        </SelectTrigger>
        <SelectContent className="bg-white text-slate-900 border-slate-200 dark:bg-slate-900 dark:text-white dark:border-slate-800 max-h-[300px]">
          {currencies.map((c) => {
            const country = AFRICAN_COUNTRIES.find((ac) => ac.currency === c);
            return (
              <SelectItem key={c} value={c} className="font-bold text-slate-900 focus:bg-slate-100 dark:text-slate-200 dark:focus:bg-slate-800">
                {c} {country ? `(${country.name})` : (c === 'CNY' ? t('chinaLabel') : '')}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
