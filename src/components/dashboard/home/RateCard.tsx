import { Coins } from 'lucide-react';
import { EXCHANGE_RATE_MWK_TO_CNY, EXCHANGE_RATE_CNY_TO_MWK } from '@/src/lib/constants';

interface RateCardProps {
  rates?: Record<string, number>;
  primaryCurrency?: string;
}

export default function RateCard({ rates, primaryCurrency = 'MWK' }: RateCardProps) {
  // Determine rates to show based on availability
  // We want to show rates FROM the primary currency TO others
  
  const displayRates: { from: string; to: string; rate: number }[] = [];
  
  // Helper to find rate
  const getRate = (from: string, to: string) => {
      const key = `${from}-${to}`;
      if (rates?.[key]) return rates[key];
      // Legacy fallback
      if (from === 'MWK' && to === 'CNY') return rates?.['mwkToCny'] ?? EXCHANGE_RATE_MWK_TO_CNY;
      if (from === 'CNY' && to === 'MWK') return rates?.['cnyToMwk'] ?? EXCHANGE_RATE_CNY_TO_MWK;
      return null;
  };

  // Define interesting target currencies
  const targets = ['MWK', 'CNY', 'ZMW', 'ZAR', 'USD', 'GBP', 'EUR'];
  
  targets.forEach(target => {
      if (target === primaryCurrency) return;
      
      const rate = getRate(primaryCurrency, target);
      if (rate) {
          displayRates.push({ from: primaryCurrency, to: target, rate });
      }
  });
  
  // If list is empty (e.g. data not loaded yet), show default fallback
  if (displayRates.length === 0) {
      const defRate = getRate('MWK', 'CNY') || EXCHANGE_RATE_MWK_TO_CNY;
      displayRates.push({ from: 'MWK', to: 'CNY', rate: defRate });
      const defInv = getRate('CNY', 'MWK') || EXCHANGE_RATE_CNY_TO_MWK;
      displayRates.push({ from: 'CNY', to: 'MWK', rate: defInv });
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
      <div>
         <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
           <Coins size={20} className="text-green-600 dark:text-green-400" />
           Current Rate
         </h3>
         <div className="space-y-4">
           {displayRates.map((r, i) => (
               <div key={`${r.from}-${r.to}`} className={`flex justify-between items-center ${i < displayRates.length - 1 ? 'pb-3 border-b border-slate-50 dark:border-slate-800' : ''}`}>
                 <span className="text-slate-500 dark:text-slate-400">1 {r.from} =</span>
                 <span className="font-mono font-medium text-slate-900 dark:text-white">{Number(r.rate).toFixed(4)} {r.to}</span>
               </div>
           ))}
         </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
         <p className="text-xs text-slate-400 dark:text-slate-500">Last updated: just now</p>
      </div>
    </div>
  );
}
