import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

interface AmountInputProps {
  amount: string;
  currency: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: string } }) => void;
}

export default function AmountInput({ amount, currency, onChange }: AmountInputProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6">
       <div className="flex-1 space-y-3">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Amount to Send</Label>
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500 dark:text-slate-400 font-bold">{currency}</span>
             </div>
             <Input
               name="amount"
               type="number"
               step="0.01"
               min="0"
               value={amount}
               onChange={onChange}
               required
               className="pl-16 text-lg font-medium h-12 border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 w-full"
               placeholder="0.00"
             />
          </div>
       </div>
       <div className="w-full md:w-[200px] space-y-3">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Currency</Label>
          <Select
            value={currency}
            onValueChange={(value) => onChange({ target: { name: 'currency', value } })}
          >
            <SelectTrigger className="h-12 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-indigo-500 w-full rounded-xl font-bold">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
              <SelectItem value="MWK" className="dark:text-white dark:focus:bg-slate-700">MWK (Malawi)</SelectItem>
              <SelectItem value="ZMW" className="dark:text-white dark:focus:bg-slate-700">ZMW (Zambia)</SelectItem>
              <SelectItem value="CNY" className="dark:text-white dark:focus:bg-slate-700">CNY (China)</SelectItem>
            </SelectContent>
          </Select>
       </div>
    </div>
  );
}
