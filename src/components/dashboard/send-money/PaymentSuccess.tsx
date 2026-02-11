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
    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-6 py-6 rounded-xl shadow-md animate-in fade-in zoom-in-95">
      <div className="flex flex-col items-center text-center">
        <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">Payment Successful!</h3>
        <p className="text-emerald-700 dark:text-emerald-300 mb-4">
          Your transaction has been processed securely.
        </p>
        
        <div className="w-full bg-white dark:bg-slate-900 rounded-lg border border-emerald-100 dark:border-emerald-900 p-4 text-left space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-emerald-600 dark:text-emerald-400">Transaction ID</span>
            <span className="font-mono font-medium dark:text-slate-200">{result.transaction_id?.substring(0, 8)}...</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-emerald-600 dark:text-emerald-400">Receiver</span>
            <span className="font-medium dark:text-slate-200">
              {result.receiver_name || receiverName || result.receiver_wallet_number}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-emerald-600 dark:text-emerald-400">Amount Sent</span>
            <span className="font-bold dark:text-slate-200">
              {formatCurrency(amount, currency)}
            </span>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:text-emerald-800 dark:hover:text-emerald-200"
          onClick={onReset}
        >
          Send Another Payment
        </Button>
      </div>
    </div>
  );
}
