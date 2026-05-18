'use client';

import { Label } from '@/src/components/ui/label';
import { getPayoutOptions } from '@/src/lib/constants/funding';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

const KNOWN_CHANNELS = ['wallet', 'mobile_money', 'bank', 'card', 'api', 'web'] as const;
type KnownChannel = (typeof KNOWN_CHANNELS)[number];

function isKnownChannel(c: string): c is KnownChannel {
  return (KNOWN_CHANNELS as readonly string[]).includes(c);
}

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
  const options = useMemo(() => getPayoutOptions(targetCurrency), [targetCurrency]);

  const channelLabel = (channel: string) => {
    if (isKnownChannel(channel)) return t(`channels.${channel}` as Parameters<typeof t>[0]);
    return channel.replace(/_/g, ' ');
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {t('payoutMethod')}
      </Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = value === opt.value;
          const finalLabel =
            opt.value.startsWith('wallet_topup_')
              ? t('payout.walletTopUp', { currency: targetCurrency })
              : opt.label;

          return (
            <div
              key={opt.value}
              onClick={() => onChange(opt.value)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onChange(opt.value);
                }
              }}
              className={`
                relative flex items-center p-3 rounded-xl border cursor-pointer transition-all duration-200
                ${isSelected
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-600 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                }
              `}
            >
              <div className={`
                h-10 w-10 rounded-full flex items-center justify-center shrink-0 mr-3
                ${isSelected ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}
              `}>
                <Icon size={20} />
              </div>
              <div>
                <div className={`font-medium text-sm ${isSelected ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-900 dark:text-white'}`}>
                  {finalLabel}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                  {channelLabel(opt.channel)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
