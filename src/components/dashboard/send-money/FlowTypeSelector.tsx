import { Globe, RefreshCw } from 'lucide-react';

interface FlowTypeSelectorProps {
  flowType: 'INTERNATIONAL' | 'SAME';
  onChange: (type: 'INTERNATIONAL' | 'SAME') => void;
}

export default function FlowTypeSelector({ flowType, onChange }: FlowTypeSelectorProps) {
  return (
    <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
      <button
        type="button"
        onClick={() => onChange('INTERNATIONAL')}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
          flowType === 'INTERNATIONAL' 
            ? 'bg-slate-900 text-white shadow-sm' 
            : 'text-slate-600 hover:bg-slate-50'
        }`}
      >
        <Globe size={14} className="inline mr-1" />
        International
      </button>
      <button
        type="button"
        onClick={() => onChange('SAME')}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
          flowType === 'SAME' 
            ? 'bg-slate-900 text-white shadow-sm' 
            : 'text-slate-600 hover:bg-slate-50'
        }`}
      >
        <RefreshCw size={14} className="inline mr-1" />
        Same Currency
      </button>
    </div>
  );
}
