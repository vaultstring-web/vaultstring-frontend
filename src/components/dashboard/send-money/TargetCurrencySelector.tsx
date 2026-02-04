import { Label } from '@/src/components/ui/label';

interface TargetCurrencySelectorProps {
  targetCurrency: string;
  sourceCurrency: string;
  onChange: (value: string) => void;
}

export default function TargetCurrencySelector({ targetCurrency, sourceCurrency, onChange }: TargetCurrencySelectorProps) {
  return (
    <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
        <Label className="text-sm font-medium text-slate-700">Recipient Receives In</Label>
        <div className="flex gap-4">
           {['CNY', 'MWK', 'ZMW'].filter(c => c !== sourceCurrency).map((c) => (
             <label key={c} className={`
               flex-1 cursor-pointer rounded-lg border p-3 flex items-center justify-center gap-2 transition-all
               ${targetCurrency === c 
                 ? 'bg-white border-indigo-500 shadow-sm ring-1 ring-indigo-500 text-indigo-700 font-bold' 
                 : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}
             `}>
                <input
                  type="radio"
                  name="targetCurrency"
                  value={c}
                  checked={targetCurrency === c}
                  onChange={(e) => onChange(e.target.value)}
                  className="hidden"
                />
                {c}
             </label>
           ))}
        </div>
    </div>
  );
}
