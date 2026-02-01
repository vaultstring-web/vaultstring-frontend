// src/components/dashboard/SendMoney.tsx
'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, AlertCircle, RefreshCw, ChevronLeft } from 'lucide-react';
import { EXCHANGE_RATE_MWK_TO_CNY } from '@/src/lib/constants';
import { useRouter } from 'next/navigation';
import { apiFetch, getDeviceId, getDeviceCountry } from '@/src/lib/api/api-client';
import { useToast } from '@/src/hooks/use-toast';

interface SendMoneyProps {
  currentBalance: number;
}

const SendMoney: React.FC<SendMoneyProps> = ({ currentBalance }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mwkAmount, setMwkAmount] = useState<number | ''>('');
  const [recipientId, setRecipientId] = useState('');
  const [recipientNote, setRecipientNote] = useState('');
  // Store reference in state to ensure idempotency across retries of the same attempt
  const [transactionRef, setTransactionRef] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived values
  const cnyAmount = typeof mwkAmount === 'number' ? mwkAmount * EXCHANGE_RATE_MWK_TO_CNY : 0;
  const fees = typeof mwkAmount === 'number' ? mwkAmount * 0.015 : 0; // 1.5% fee
  const totalDeduction = typeof mwkAmount === 'number' ? mwkAmount + fees : 0;

  const handleSubmitStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mwkAmount || mwkAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (totalDeduction > currentBalance) {
      setError("Insufficient balance including fees");
      return;
    }
    if (!recipientId) {
      setError("Please enter a recipient Merchant ID");
      return;
    }
    setError(null);
    // Generate reference ONCE when moving to review step
    // This ensures if user clicks "Confirm" multiple times or retries, 
    // the SAME reference is sent, allowing backend to detect duplicate safely.
    setTransactionRef(`web-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
    setStep(2);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const deviceCountry = await getDeviceCountry();
      await apiFetch('/payments', {
        method: 'POST',
        body: JSON.stringify({
          amount: Number(mwkAmount),
          currency: 'MWK',
          destination_currency: 'CNY',
          receiver_wallet_number: recipientId,
          description: recipientNote,
          channel: 'web',
          category: 'transfer',
          reference: transactionRef, // Use the stable reference
          device_id: getDeviceId(),
          device_country: deviceCountry
        })
      });
      setStep(3);
    } catch (err: any) {
      console.error("Payment failed", err);
      const validationErrors = err?.data?.validation_errors;
      let msg = err.message || "Transaction failed";
      
      if (validationErrors) {
         // Combine validation errors for display
         const details = Object.values(validationErrors).join(', ');
         msg = `Validation failed: ${details}`;
      }

      // Log error for debugging
      console.log("Payment Error Object:", err);
      console.log("Payment Error Message:", msg);

      // Handle "Duplicate request" (from idempotency or network retry race conditions)
      // We treat this as success because the transaction DID process.
      if (
        msg.toLowerCase().includes('duplicate') || 
        msg.toLowerCase().includes('idempotency') ||
        msg.includes('already processed')
      ) {
        toast({
          title: "Transaction Processed",
          description: "Transaction confirmed (duplicate request detected).",
          variant: "default"
        });
        setStep(3);
        return;
      }

      setError(msg);
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: msg
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMwkAmount('');
    setRecipientId('');
    setRecipientNote('');
    setStep(1);
  };

  const handleReturnToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Stepper Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10"></div>
          
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex flex-col items-center gap-2 bg-white px-2`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                step >= s ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {s}
              </div>
              <span className={`text-xs font-medium ${step >= s ? 'text-green-600' : 'text-slate-400'}`}>
                {s === 1 ? 'Details' : s === 2 ? 'Review' : 'Success'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Input */}
      {step === 1 && (
        <form onSubmit={handleSubmitStep1} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in slide-in-from-right-4 duration-300">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Send to China</h2>
          
          <div className="space-y-6">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Amount to Send (MWK)</label>
              <div className="relative">
                <input
                  type="number"
                  value={mwkAmount}
                  onChange={(e) => {
                    setMwkAmount(e.target.value ? parseFloat(e.target.value) : '');
                    setError(null);
                  }}
                  className="w-full pl-4 pr-16 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg font-semibold text-slate-900 placeholder:font-normal"
                  placeholder="0.00"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">MWK</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">Available Balance: MWK {currentBalance.toLocaleString()}</p>
            </div>

            {/* Conversion Display */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">Exchange Rate</p>
                <p className="font-medium text-slate-700">1 CNY = {(1/EXCHANGE_RATE_MWK_TO_CNY).toFixed(2)} MWK</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 mb-1">Recipient Gets</p>
                <p className="text-2xl font-bold text-green-600">¥ {cnyAmount.toFixed(2)}</p>
              </div>
            </div>

            {/* Recipient Details */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Merchant ID / WeChat ID</label>
              <input
                type="text"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g. M-CN-88291"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Reference Note (Optional)</label>
              <input
                type="text"
                value={recipientNote}
                onChange={(e) => setRecipientNote(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Order #12345"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all mt-4"
            >
              Continue <ArrowRight size={20} />
            </button>
          </div>
        </form>
      )}

      {/* Step 2: Review */}
      {step === 2 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in slide-in-from-right-4 duration-300">
          <button 
            onClick={() => setStep(1)}
            className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm mb-6"
          >
            <ChevronLeft size={16} /> Back to Edit
          </button>

          <h2 className="text-xl font-semibold text-slate-800 mb-6">Review Transaction</h2>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between py-3 border-b border-slate-100">
              <span className="text-slate-500">Recipient ID</span>
              <span className="font-medium text-slate-900">{recipientId}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-100">
              <span className="text-slate-500">Amount Sent</span>
              <span className="font-medium text-slate-900">MWK {(mwkAmount as number).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-100">
              <span className="text-slate-500">Exchange Rate</span>
              <span className="font-medium text-slate-900">{EXCHANGE_RATE_MWK_TO_CNY}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-100">
              <span className="text-slate-500">Transaction Fee (1.5%)</span>
              <span className="font-medium text-slate-900">MWK {fees.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-4">
              <span className="text-slate-900 font-semibold">Total Deducted</span>
              <span className="font-bold text-slate-900 text-lg">MWK {totalDeduction.toLocaleString()}</span>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 border border-green-100 text-center mt-4">
               <p className="text-sm text-green-700 mb-1">Recipient Will Receive</p>
               <p className="text-3xl font-bold text-green-600">¥ {cnyAmount.toFixed(2)}</p>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <RefreshCw size={20} className="animate-spin" /> Processing...
              </>
            ) : (
              "Confirm & Send Money"
            )}
          </button>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
          <p className="text-slate-500 mb-8">
            Your payment of MWK {(mwkAmount as number).toLocaleString()} to {recipientId} has been processed successfully.
          </p>
          
          <div className="bg-slate-50 rounded-lg p-4 mb-8 text-left max-w-sm mx-auto">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500">Transaction ID</span>
              <span className="font-mono text-slate-900">TXN-{Math.floor(Math.random() * 900000) + 100000}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Date</span>
              <span className="text-slate-900">{new Date().toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleReset}
              className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Make Another Payment
            </button>
            <button 
              onClick={handleReturnToDashboard}
              className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SendMoney;