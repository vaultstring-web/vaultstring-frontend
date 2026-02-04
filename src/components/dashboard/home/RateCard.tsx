import { Coins } from 'lucide-react';
import { EXCHANGE_RATE_MWK_TO_CNY, EXCHANGE_RATE_CNY_TO_MWK } from '@/src/lib/constants';

interface RateCardProps {
  rates?: { mwkToCny?: number; cnyToMwk?: number };
}

export default function RateCard({ rates }: RateCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
      <div>
         <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
           <Coins size={20} className="text-green-600" />
           Current Rate
         </h3>
         <div className="space-y-4">
           <div className="flex justify-between items-center pb-3 border-b border-slate-50">
             <span className="text-slate-500">1 MWK =</span>
             <span className="font-mono font-medium text-slate-900">{Number(rates?.mwkToCny ?? EXCHANGE_RATE_MWK_TO_CNY)} CNY</span>
           </div>
           <div className="flex justify-between items-center">
             <span className="text-slate-500">1 CNY =</span>
             <span className="font-mono font-medium text-slate-900">{Number(rates?.cnyToMwk ?? EXCHANGE_RATE_CNY_TO_MWK).toFixed(2)} MWK</span>
           </div>
         </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100">
         <p className="text-xs text-slate-400">Last updated: 2 mins ago</p>
      </div>
    </div>
  );
}
