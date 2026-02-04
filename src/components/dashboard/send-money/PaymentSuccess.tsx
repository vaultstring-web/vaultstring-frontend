import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { formatCurrency } from '@/src/lib/utils/formatters';

interface PaymentSuccessProps {
  result: {
    transaction_id?: string;
    receiver_name?: string;
    receiver_wallet_number?: string;
  };
  amount: number;
  currency: string;
  receiverName?: string | null;
  onReset: () => void;
}

export default function PaymentSuccess({
  result,
  amount,
  currency,
  receiverName,
  onReset,
}: PaymentSuccessProps) {
  return (
    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-6 rounded-xl shadow-md animate-in fade-in zoom-in-95">
      <div className="flex flex-col items-center text-center">
        <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-xl font-bold text-emerald-900 mb-2">Payment Successful!</h3>
        <p className="text-emerald-700 mb-4">
          Your transaction has been processed securely.
        </p>
        
        <div className="w-full bg-white rounded-lg border border-emerald-100 p-4 text-left space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-emerald-600">Transaction ID</span>
            <span className="font-mono font-medium">{result.transaction_id?.substring(0, 8)}...</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-emerald-600">Receiver</span>
            <span className="font-medium">
              {result.receiver_name || receiverName || result.receiver_wallet_number}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-emerald-600">Amount Sent</span>
            <span className="font-bold">
              {formatCurrency(amount, currency)}
            </span>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
          onClick={onReset}
        >
          Send Another Payment
        </Button>
      </div>
    </div>
  );
}
