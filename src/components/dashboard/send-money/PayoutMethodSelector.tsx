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
      <Label className="text-sm font-medium text-slate-700">Payout Method</Label>
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
                  ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600 shadow-sm' 
                  : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                }
              `}
            >
              <div className={`
                h-10 w-10 rounded-full flex items-center justify-center shrink-0 mr-3
                ${isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}
              `}>
                <Icon size={20} />
              </div>
              <div>
                <div className={`font-medium text-sm ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                  {opt.label}
                </div>
                <div className="text-xs text-slate-500 capitalize">
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
