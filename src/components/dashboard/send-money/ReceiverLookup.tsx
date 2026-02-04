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
      <Label className="text-sm font-medium text-slate-700">Recipient Wallet Number</Label>
      <div className="relative group">
        <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <Input
          name="receiver_id"
          value={value}
          onChange={onChange}
          placeholder="Enter 16-digit Wallet Number"
          required
          className="pl-10 text-slate-900 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 h-11"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          inputMode="numeric"
          maxLength={16}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2 size={16} className="animate-spin text-slate-400" />
          ) : null}
        </div>

        {/* Google-style Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-60 overflow-y-auto">
                <div className="p-2 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider flex justify-between items-center">
                    <span>Suggested Receivers</span>
                    <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Enter more digits to refine</span>
                </div>
                {suggestions.map((s, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => onSelectSuggestion(s.address)}
                        className="w-full text-left p-3 hover:bg-indigo-50 transition-colors flex items-center gap-3 border-b border-slate-50 last:border-0"
                    >
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                            {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="font-semibold text-slate-900">{s.name}</div>
                            <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
                                <span>{s.address}</span>
                                <span className="bg-slate-100 px-1.5 rounded text-slate-600">{s.currency}</span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        )}

        {/* Verified Receiver Popup */}
        {receiverName && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 flex items-center gap-4 bg-gradient-to-r from-indigo-50 to-white">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shrink-0 border-2 border-white shadow-sm">
                        {receiverName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="text-xs text-indigo-500 font-semibold uppercase tracking-wider mb-0.5 flex items-center gap-1">
                            <CheckCircle2 size={12} /> Verified Receiver
                        </div>
                        <div className="text-lg font-bold text-slate-900">{receiverName}</div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
