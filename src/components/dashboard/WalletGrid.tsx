import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/card';

interface WalletGridProps {
  wallets: Array<any>;
}

export default function WalletGrid({ wallets }: WalletGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {wallets.map((w) => {
        const bal = parseFloat(String(w.available_balance ?? w.balance ?? 0));
        const currency = String(w.currency).toUpperCase();
        return (
          <Card key={String(w.id)}>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-xl text-slate-900">{currency}</CardTitle>
              <span className="px-2 py-1 rounded-md text-xs bg-green-100 text-green-700">Active</span>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-700">Available Balance</div>
              <div className="text-2xl font-bold mt-1 text-slate-900">
                {bal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-slate-600 mt-4">ID: {String(w.id)}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
