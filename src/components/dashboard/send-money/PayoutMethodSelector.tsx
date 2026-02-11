import { Label } from '@/src/components/ui/label';
import { getPayoutOptions } from '@/src/lib/constants/funding';
import { useMemo } from 'react';

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
  const options = useMemo(
    () => getPayoutOptions(targetCurrency),
    [targetCurrency]
  );

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Payout Method</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = value === opt.value;
          return (
            <div
              key={opt.value}
              onClick={() => onChange(opt.value)}
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
                  {opt.label}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                  {opt.channel.replace('_', ' ')}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
