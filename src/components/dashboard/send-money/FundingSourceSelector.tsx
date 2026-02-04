import { Label } from '@/src/components/ui/label';
import { getFundingOptions } from '@/src/lib/constants/funding';
import { useMemo } from 'react';

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
  const options = useMemo(
    () => getFundingOptions(currency, walletBalance),
    [currency, walletBalance]
  );

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-slate-700">Funding Source</Label>
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
              {isSelected && (
                <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-indigo-600"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
