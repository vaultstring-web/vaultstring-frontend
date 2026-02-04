import { useState } from 'react';
import { RefreshCw, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';
import { 
  EXCHANGE_RATE_MWK_TO_CNY, 
  EXCHANGE_RATE_CNY_TO_MWK,
  EXCHANGE_RATE_MWK_TO_ZMW,
  EXCHANGE_RATE_ZMW_TO_MWK
} from '@/src/lib/constants';

interface CurrencyConverterProps {
  rates?: { 
    mwkToCny?: number; 
    cnyToMwk?: number;
    mwkToZmw?: number;
    zmwToMwk?: number;
  };
}

export default function CurrencyConverter({ rates }: CurrencyConverterProps) {
  const [convertAmount, setConvertAmount] = useState<number | ''>(1000000);
  const [sourceCurrency, setSourceCurrency] = useState<'MWK' | 'CNY' | 'ZMW'>('MWK');
  const [targetCurrency, setTargetCurrency] = useState<'MWK' | 'CNY' | 'ZMW'>('CNY');

  const getRate = (from: string, to: string) => {
    if (from === to) return 1;
    if (from === 'MWK' && to === 'CNY') return Number(rates?.mwkToCny ?? EXCHANGE_RATE_MWK_TO_CNY);
    if (from === 'CNY' && to === 'MWK') return Number(rates?.cnyToMwk ?? EXCHANGE_RATE_CNY_TO_MWK);
    if (from === 'MWK' && to === 'ZMW') return Number(rates?.mwkToZmw ?? EXCHANGE_RATE_MWK_TO_ZMW);
    if (from === 'ZMW' && to === 'MWK') return Number(rates?.zmwToMwk ?? EXCHANGE_RATE_ZMW_TO_MWK);
    
    // Cross rates (via MWK)
    if (from === 'CNY' && to === 'ZMW') {
        const cnyToMwk = Number(rates?.cnyToMwk ?? EXCHANGE_RATE_CNY_TO_MWK);
        const mwkToZmw = Number(rates?.mwkToZmw ?? EXCHANGE_RATE_MWK_TO_ZMW);
        return cnyToMwk * mwkToZmw;
    }
    if (from === 'ZMW' && to === 'CNY') {
        const zmwToMwk = Number(rates?.zmwToMwk ?? EXCHANGE_RATE_ZMW_TO_MWK);
        const mwkToCny = Number(rates?.mwkToCny ?? EXCHANGE_RATE_MWK_TO_CNY);
        return zmwToMwk * mwkToCny;
    }

    return 0;
  };

  const getConversionResult = () => {
    if (!convertAmount) return '0.00';
    const rate = getRate(sourceCurrency, targetCurrency);
    return (convertAmount * rate).toFixed(2);
  };

  const toggleDirection = () => {
    setSourceCurrency(targetCurrency);
    setTargetCurrency(sourceCurrency);
  };

  const cycleSource = () => {
    const currencies: ('MWK' | 'CNY' | 'ZMW')[] = ['MWK', 'CNY', 'ZMW'];
    const nextIndex = (currencies.indexOf(sourceCurrency) + 1) % currencies.length;
    setSourceCurrency(currencies[nextIndex]);
  };
  
  const cycleTarget = () => {
    const currencies: ('MWK' | 'CNY' | 'ZMW')[] = ['MWK', 'CNY', 'ZMW'];
    const nextIndex = (currencies.indexOf(targetCurrency) + 1) % currencies.length;
    setTargetCurrency(currencies[nextIndex]);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <RefreshCw size={20} className="text-slate-400" />
          Currency Converter
        </h3>
        <div className="flex gap-2">
          <button className="text-sm text-green-600 hover:bg-green-50 px-3 py-1 rounded-md transition-colors">
            Set Alert
          </button>
          <Link
            href="/dashboard/transactions"
            className="text-sm text-slate-500 hover:bg-slate-50 px-3 py-1 rounded-md transition-colors"
          >
            View History
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center bg-slate-50 p-6 rounded-xl border border-slate-100">
        
        {/* FROM Section */}
        <div className="md:col-span-3 space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">From</label>
          <div className="flex bg-white border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-500">
            <button 
                onClick={cycleSource}
                className="bg-slate-100 px-3 py-3 border-r border-slate-300 flex items-center font-medium text-slate-700 min-w-16 justify-center hover:bg-slate-200 transition-colors cursor-pointer"
                title="Click to change currency"
            >
              {sourceCurrency}
            </button>
            <input
              type="number"
              value={convertAmount}
              onChange={(e) => setConvertAmount(e.target.value ? parseFloat(e.target.value) : '')}
              className="w-full px-4 py-3 outline-none text-slate-900 font-semibold"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Switcher */}
        <div className="md:col-span-1 flex justify-center py-2 md:py-0">
          <button 
            onClick={toggleDirection}
            className="p-3 bg-white border border-slate-200 rounded-full hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all shadow-sm group"
          >
            <ArrowRightLeft size={20} className="group-hover:rotate-180 transition-transform duration-300" />
          </button>
        </div>

        {/* TO Section */}
        <div className="md:col-span-3 space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">To</label>
            <div className="flex bg-slate-200 border border-slate-300 rounded-lg overflow-hidden">
            <button 
                onClick={cycleTarget}
                className="bg-slate-300 px-3 py-3 border-r border-slate-300 flex items-center font-medium text-slate-700 min-w-16 justify-center hover:bg-slate-400 transition-colors cursor-pointer"
                title="Click to change currency"
            >
              {targetCurrency}
            </button>
            <div className="w-full px-4 py-3 text-slate-900 font-bold bg-slate-100 flex items-center">
                {getConversionResult()}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
