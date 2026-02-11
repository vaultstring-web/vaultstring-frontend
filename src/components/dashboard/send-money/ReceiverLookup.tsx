import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Wallet, Loader2, CheckCircle2 } from 'lucide-react';

interface Suggestion {
  name: string;
  address: string;
  currency: string;
}

interface ReceiverLookupProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
  suggestions: Suggestion[];
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  onSelectSuggestion: (address: string) => void;
  receiverName: string | null;
}

export default function ReceiverLookup({
  value,
  onChange,
  loading,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  onSelectSuggestion,
  receiverName,
}: ReceiverLookupProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Recipient Wallet Number</Label>
      <div className="relative group">
        <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
        <Input
          name="receiver_id"
          value={value}
          onChange={onChange}
          placeholder="Enter 16-digit Wallet Number"
          required
          className="pl-10 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:border-indigo-500 focus:ring-indigo-500 h-11"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          inputMode="numeric"
          maxLength={16}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2 size={16} className="animate-spin text-slate-400 dark:text-slate-500" />
          ) : null}
        </div>

        {/* Google-style Search Suggestions - Made absolute to float over content */}
        {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[24px] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-60 overflow-y-auto z-50">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex justify-between items-center">
                    <span>Suggested Receivers</span>
                    <span className="bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-slate-500 dark:text-slate-400">Enter digits to refine</span>
                </div>
                {suggestions.map((s, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => onSelectSuggestion(s.address)}
                        className="w-full text-left p-4 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-4 border-b border-slate-50 dark:border-slate-800 last:border-0"
                    >
                        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0 text-sm">
                            {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="font-bold text-slate-900 dark:text-white text-sm">{s.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                                <span>{s.address}</span>
                                <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-600 dark:text-slate-400">{s.currency}</span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        )}

        {/* Verified Receiver Popup */}
        {receiverName && (
            <div className="mt-4 bg-green-50/50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/50 rounded-[24px] overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative z-10 shadow-lg shadow-green-100/50 dark:shadow-none">
                <div className="p-4 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-white dark:bg-slate-900 border-2 border-green-100 dark:border-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-lg shrink-0 shadow-sm">
                        {receiverName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="text-[10px] text-green-600 dark:text-green-400 font-bold uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
                            <CheckCircle2 size={12} fill="currentColor" className="text-green-200 dark:text-green-900" /> Verified Receiver
                        </div>
                        <div className="text-lg font-black text-slate-900 dark:text-white">{receiverName}</div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
