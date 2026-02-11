import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/card';
import { formatCurrency } from '@/src/lib/utils/formatters';

interface RatePreviewCardProps {
  from: string;
  to: string;
  amount: number;
  rate: number | null;
  converted: number | null;
  fee: number | null;
  loading: boolean;
  error: string | null;
}

export default function RatePreviewCard({ 
  from, 
  to, 
  amount, 
  rate, 
  converted, 
  fee, 
  loading, 
  error 
}: RatePreviewCardProps) {
  
  const fromCurrency = String(from).toUpperCase();
  const toCurrency = String(to).toUpperCase();

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm dark:bg-slate-900">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <CardTitle className="text-base font-semibold text-slate-800 dark:text-white">Exchange Rate Preview</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {error ? (
          <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900">
            {error}
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Exchange Rate</span>
              <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                {loading ? '...' : (rate ? `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}` : '—')}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Converted Amount</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {loading ? '...' : (converted !== null ? formatCurrency(converted, toCurrency) : '—')}
              </span>
            </div>
            
            {fee !== null && (
              <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                <span className="text-slate-500 dark:text-slate-400">Service Fee (Extra)</span>
                <span className="font-medium text-amber-600 dark:text-amber-500">
                  {loading ? '...' : formatCurrency(fee, fromCurrency)}
                </span>
              </div>
            )}
            
            {converted !== null && (
              <>
                <div className="flex justify-between items-center pt-2 mt-1">
                  <span className="text-slate-500 dark:text-slate-400 font-bold">Total Debit</span>
                  <span className="font-black text-slate-900 dark:text-white text-lg">
                     {loading ? '...' : formatCurrency(amount + (fee || 0), fromCurrency)}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Recipient Gets</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-500 text-2xl">
                    {loading ? '...' : formatCurrency(converted, toCurrency)}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
