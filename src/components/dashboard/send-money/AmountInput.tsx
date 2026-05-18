'use client';

import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { useTranslations } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

import { AFRICAN_COUNTRIES } from '@/src/lib/constants/africa';

interface AmountInputProps {
  amount: string;
  currency: string;
  onChange: (e: any) => void;
}

export default function AmountInput({ amount, currency, onChange }: AmountInputProps) {
  const t = useTranslations('SendMoney');
  // Get all unique African currencies
  const africanCurrencies = Array.from(new Set(AFRICAN_COUNTRIES.map(c => c.currency))).sort();
  const currencies = [...africanCurrencies, 'CNY'];

  return (
    <div className="flex flex-col md:flex-row gap-6">
       <div className="flex-1 space-y-3">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('amount')}</Label>
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500 dark:text-slate-400 font-bold">{currency}</span>
             </div>
             <Input
               name="amount"
               type="text"
               inputMode="decimal"
               value={amount}
               onChange={(e) => {
                const nextValue = e.target.value.replace(/[^0-9.]/g, '');
                onChange({ target: { name: 'amount', value: nextValue } });
               }}
               required
               className="pl-20 text-lg font-medium h-12 border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 w-full"
               placeholder={t('amountPlaceholder')}
               autoComplete="off"
             />
          </div>
       </div>
       <div className="w-full md:w-[200px] space-y-3">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('currency')}</Label>
          <Select
            value={currency}
            onValueChange={(value) => onChange({ target: { name: 'currency', value } })}
          >
            <SelectTrigger className="h-12 border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-indigo-500 w-full rounded-xl font-bold">
              <SelectValue placeholder={t('selectPlaceholder')} />
            </SelectTrigger>
            <SelectContent className="bg-white text-slate-900 border-slate-200 dark:bg-slate-800 dark:text-white dark:border-slate-700 max-h-[300px]">
              {currencies.map((c) => {
                const country = AFRICAN_COUNTRIES.find(ac => ac.currency === c);
                return (
                  <SelectItem key={c} value={c} className="text-slate-900 focus:bg-slate-100 dark:text-white dark:focus:bg-slate-700 font-bold">
                    {c} {country ? `(${country.name})` : (c === 'CNY' ? t('chinaLabel') : '')}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
       </div>
    </div>
  );
}
