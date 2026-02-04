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
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
        <CardTitle className="text-base font-semibold text-slate-800">Exchange Rate Preview</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {error ? (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
            {error}
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Exchange Rate</span>
              <span className="font-mono font-medium text-slate-700">
                {loading ? '...' : (rate ? `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}` : '—')}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Converted Amount</span>
              <span className="font-bold text-slate-900">
                {loading ? '...' : (converted !== null ? formatCurrency(converted, toCurrency) : '—')}
              </span>
            </div>
            
            {fee !== null && (
              <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2">
                <span className="text-slate-500">Fees (Included)</span>
                <span className="font-medium text-amber-600">
                  {loading ? '...' : formatCurrency(fee, fromCurrency)}
                </span>
              </div>
            )}
            
            {converted !== null && (
              <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2">
                <span className="text-slate-500 font-medium">Recipient Gets</span>
                <span className="font-bold text-emerald-600 text-lg">
                  {loading ? '...' : formatCurrency(converted, toCurrency)}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
