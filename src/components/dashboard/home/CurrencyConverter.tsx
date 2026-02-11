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
  rates?: Record<string, number>;
  primaryCurrency?: string;
}

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

export default function CurrencyConverter({ rates, primaryCurrency = 'MWK' }: CurrencyConverterProps) {
  const [convertAmount, setConvertAmount] = useState<number | ''>(1000);
  const [sourceCurrency, setSourceCurrency] = useState<string>(primaryCurrency);
  const [targetCurrency, setTargetCurrency] = useState<string>(primaryCurrency === 'MWK' ? 'CNY' : 'MWK');

  const getRate = (from: string, to: string) => {
    if (from === to) return 1;
    // Check direct pair "FROM-TO"
    const directKey = `${from}-${to}`;
    if (rates?.[directKey]) return rates[directKey];
    
    // Check legacy/fallback keys
    if (from === 'MWK' && to === 'CNY') return Number(rates?.mwkToCny ?? EXCHANGE_RATE_MWK_TO_CNY);
    if (from === 'CNY' && to === 'MWK') return Number(rates?.cnyToMwk ?? EXCHANGE_RATE_CNY_TO_MWK);
    
    // Check inverse
    const inverseKey = `${to}-${from}`;
    if (rates?.[inverseKey]) return 1 / rates[inverseKey];
    
    // Check cross rate via MWK
    // If we have FROM-MWK and MWK-TO
    const fromMwkKey = `${from}-MWK`;
    const mwkToKey = `MWK-${to}`;
    
    // Case 1: Both exist directly relative to MWK
    // e.g. ZAR -> MWK (exist) and MWK -> CNY (exist)
    // Actually we stored pairs relative to MWK in backend.
    
    // If from is MWK, we just need MWK-TO
    if (from === 'MWK') {
       if (rates?.[`MWK-${to}`]) return rates[`MWK-${to}`];
       // try inverse
       if (rates?.[`${to}-MWK`]) return 1 / rates[`${to}-MWK`];
    }
    
    // If to is MWK, we just need FROM-MWK
    if (to === 'MWK') {
       if (rates?.[`${from}-MWK`]) return rates[`${from}-MWK`];
       // try inverse
       if (rates?.[`MWK-${from}`]) return 1 / rates[`MWK-${from}`];
    }
    
    // Cross rate: FROM -> MWK -> TO
    // Rate = (FROM->MWK) * (MWK->TO)
    let rateFromToMwk = 0;
    if (rates?.[`${from}-MWK`]) rateFromToMwk = rates[`${from}-MWK`];
    else if (rates?.[`MWK-${from}`]) rateFromToMwk = 1 / rates[`MWK-${from}`];
    
    let rateMwkToTo = 0;
    if (rates?.[`MWK-${to}`]) rateMwkToTo = rates[`MWK-${to}`];
    else if (rates?.[`${to}-MWK`]) rateMwkToTo = 1 / rates[`${to}-MWK`];
    
    if (rateFromToMwk && rateMwkToTo) {
        return rateFromToMwk * rateMwkToTo;
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

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <RefreshCw size={20} className="text-slate-400 dark:text-slate-500" />
          Currency Converter
        </h3>
        <div className="flex gap-2">
          <button className="text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 px-3 py-1 rounded-md transition-colors font-medium">
            Set Alert
          </button>
          <Link
            href="/dashboard/transactions"
            className="text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-1 rounded-md transition-colors font-medium"
          >
            View History
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
        
        {/* FROM Section */}
        <div className="md:col-span-3 space-y-2">
          <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">From</label>
          <div className="flex bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-green-500 shadow-sm">
            <div className="border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <Select value={sourceCurrency} onValueChange={(v: any) => setSourceCurrency(v)}>
                    <SelectTrigger className="w-[100px] h-full border-none bg-transparent focus:ring-0 font-bold text-slate-700 dark:text-white rounded-none">
                        <SelectValue placeholder="Cur" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                        <SelectItem value="MWK" className="dark:text-white dark:focus:bg-slate-700">MWK</SelectItem>
                        <SelectItem value="CNY" className="dark:text-white dark:focus:bg-slate-700">CNY</SelectItem>
                        <SelectItem value="ZMW" className="dark:text-white dark:focus:bg-slate-700">ZMW</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <input
              type="number"
              value={convertAmount}
              onChange={(e) => setConvertAmount(e.target.value ? parseFloat(e.target.value) : '')}
              className="w-full px-4 py-3 outline-none text-slate-900 dark:text-white font-bold bg-white dark:bg-slate-900"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Switcher */}
        <div className="md:col-span-1 flex justify-center py-2 md:py-0">
          <button 
            onClick={toggleDirection}
            className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full hover:bg-green-50 dark:hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400 hover:border-green-200 dark:hover:border-green-500/50 transition-all shadow-sm group hover:scale-110 active:scale-95"
          >
            <ArrowRightLeft size={20} className="text-slate-600 dark:text-slate-400 group-hover:rotate-180 transition-transform duration-300" />
          </button>
        </div>

        {/* TO Section */}
        <div className="md:col-span-3 space-y-2">
          <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">To</label>
            <div className="flex bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden shadow-inner opacity-90">
            <div className="border-r border-slate-300 dark:border-slate-700 bg-slate-200/50 dark:bg-slate-800/50">
                <Select value={targetCurrency} onValueChange={(v: any) => setTargetCurrency(v)}>
                    <SelectTrigger className="w-[100px] h-full border-none bg-transparent focus:ring-0 font-bold text-slate-700 dark:text-white rounded-none">
                        <SelectValue placeholder="Cur" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                        <SelectItem value="MWK" className="dark:text-white dark:focus:bg-slate-700">MWK</SelectItem>
                        <SelectItem value="CNY" className="dark:text-white dark:focus:bg-slate-700">CNY</SelectItem>
                        <SelectItem value="ZMW" className="dark:text-white dark:focus:bg-slate-700">ZMW</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="w-full px-4 py-3 text-slate-900 dark:text-white font-black bg-slate-100/50 dark:bg-slate-800/50 flex items-center">
                {getConversionResult()}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
