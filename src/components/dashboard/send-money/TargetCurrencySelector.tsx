import { Label } from '@/src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

interface TargetCurrencySelectorProps {
  targetCurrency: string;
  sourceCurrency: string;
  onChange: (value: string) => void;
}

export default function TargetCurrencySelector({ targetCurrency, sourceCurrency, onChange }: TargetCurrencySelectorProps) {
  const currencies = ['CNY', 'MWK', 'ZMW'].filter(c => c !== sourceCurrency);

  return (
    <div className="space-y-3">
        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Recipient Receives In</Label>
        <Select value={targetCurrency} onValueChange={onChange}>
          <SelectTrigger className="h-14 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-indigo-500 rounded-xl text-lg font-bold dark:text-white">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
            {currencies.map((c) => (
              <SelectItem key={c} value={c} className="font-bold text-slate-700 dark:text-slate-200 dark:focus:bg-slate-800">
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
    </div>
  );
}
