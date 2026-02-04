import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';

interface AmountInputProps {
  amount: string;
  currency: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export default function AmountInput({ amount, currency, onChange }: AmountInputProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700">Amount to Send</Label>
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500 font-bold">{currency}</span>
             </div>
             <Input
               name="amount"
               type="number"
               step="0.01"
               min="0"
               value={amount}
               onChange={onChange}
               required
               className="pl-16 text-lg font-medium h-12 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
               placeholder="0.00"
             />
          </div>
       </div>
       <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700">Source Currency</Label>
          <select
            name="currency"
            value={currency}
            onChange={onChange}
            className="w-full h-12 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
             <option value="MWK">MWK (Malawian Kwacha)</option>
             <option value="ZMW">ZMW (Zambian Kwacha)</option>
             <option value="CNY">CNY (Chinese Yuan)</option>
          </select>
       </div>
    </div>
  );
}
