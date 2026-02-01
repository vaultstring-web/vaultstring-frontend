import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/card';
import { apiFetch } from '@/src/lib/api/api-client';

interface RatePreviewCardProps {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
}

export default function RatePreviewCard({ fromCurrency, toCurrency, amount }: RatePreviewCardProps) {
  const [rate, setRate] = useState<number | null>(null);
  const [converted, setConverted] = useState<number | null>(null);
  const [fee, setFee] = useState<number | null>(null);
  const [net, setNet] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchRate = async () => {
      if (!fromCurrency || !toCurrency || !amount || amount <= 0) {
        setRate(null);
        setConverted(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const calc = await apiFetch('/forex/calculate', {
          method: 'POST',
          body: JSON.stringify({ from: fromCurrency, to: toCurrency, amount }),
        }).catch(() => null);
        const rateRes = await apiFetch(`/forex/rate/${fromCurrency}/${toCurrency}`).catch(() => null);
        const br = typeof rateRes?.buy_rate === 'number' ? rateRes.buy_rate : (typeof rateRes?.buy_rate === 'string' ? parseFloat(rateRes.buy_rate) : null);
        const r = br ?? (typeof calc?.rate === 'number' ? calc.rate : (typeof calc?.rate === 'string' ? parseFloat(calc.rate) : null));
        const conv = typeof calc?.converted_amount === 'number' ? calc.converted_amount : (typeof calc?.converted_amount === 'string' ? parseFloat(calc.converted_amount) : null);
        const feeSourceAmt = typeof calc?.fee_amount === 'number' ? calc.fee_amount : (typeof calc?.fee_amount === 'string' ? parseFloat(calc?.fee_amount) : null);
        const totalSourceAmt = typeof calc?.total_amount === 'number' ? calc.total_amount : (typeof calc?.total_amount === 'string' ? parseFloat(calc?.total_amount) : null);
        
        if (!mounted) return;
        setRate(r);
        setConverted(conv ?? (r ? amount * r : null));
        setFee(feeSourceAmt ?? null);
        setNet(conv); // Recipient gets the full converted amount (Sender pays fee)
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load rate');
        setRate(null);
        setConverted(null);
        setFee(null);
        setNet(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    fetchRate();
    return () => { mounted = false; };
  }, [fromCurrency, toCurrency, amount]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-500">From</span>
            <span className="font-semibold">{String(fromCurrency).toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">To</span>
            <span className="font-semibold">{String(toCurrency).toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Buy Rate</span>
            <span className="font-semibold">{loading ? '...' : (rate ?? '—')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Converted Amount</span>
            <span className="font-semibold">
              {loading ? '...' : (converted !== null ? `${converted.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${String(toCurrency).toUpperCase()}` : '—')}
            </span>
          </div>
          {fee != null && (
            <div className="flex justify-between">
              <span className="text-slate-500">Fees (You Pay)</span>
              <span className="font-semibold">
                {loading ? '...' : `${fee.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${String(fromCurrency).toUpperCase()}`}
              </span>
            </div>
          )}
          {net != null && (
            <div className="flex justify-between">
              <span className="text-slate-500">Recipient Gets</span>
              <span className="font-semibold">
                {loading ? '...' : `${net.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${String(toCurrency).toUpperCase()}`}
              </span>
            </div>
          )}
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
