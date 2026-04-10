import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/card';
import { formatCurrency } from '@/src/lib/utils/formatters';
import { TrendingUp, ArrowRight, ShieldCheck, Zap, Info, Calculator, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const isSameCurrency = fromCurrency === toCurrency;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden">
        <div className="bg-indigo-600 dark:bg-indigo-500 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Calculator size={20} />
              </div>
              <div>
                <CardTitle className="text-lg font-black tracking-tight">Calculation Summary</CardTitle>
                <p className="text-indigo-100 text-xs font-medium">Real-time exchange rates</p>
              </div>
            </div>
            <Zap size={20} className="text-yellow-300 animate-pulse" />
          </div>
        </div>

        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            {error ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center text-center space-y-3 py-4"
              >
                <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
                  <AlertCircle size={24} />
                </div>
                <p className="text-sm font-bold text-red-600 dark:text-red-400">{error}</p>
              </motion.div>
            ) : (
              <motion.div 
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Rate Row */}
                {!isSameCurrency && (
                  <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <TrendingUp size={14} /> Exchange Rate
                    </div>
                    <span className="font-black text-slate-900 dark:text-white">
                      {loading ? '...' : (rate ? `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}` : '—')}
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Sending Amount</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(amount, fromCurrency)}</span>
                  </div>
                  
                  {fee !== null && (
                    <div className="flex justify-between items-center px-1">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                        Service Fee <Info size={12} className="cursor-help" />
                      </div>
                      <span className="font-bold text-amber-600 dark:text-amber-500">+{formatCurrency(fee, fromCurrency)}</span>
                    </div>
                  )}

                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 px-1">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total to Pay</p>
                      <span className="font-black text-slate-900 dark:text-white text-xl sm:text-2xl tracking-tighter block truncate">
                        {loading ? '...' : formatCurrency(amount + (fee || 0), fromCurrency)}
                      </span>
                    </div>
                    <div className="flex-1 text-left sm:text-right">
                      <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">Recipient Gets</p>
                      <span className="font-black text-emerald-600 dark:text-emerald-500 text-2xl sm:text-3xl tracking-tighter block truncate">
                        {loading
                          ? '...'
                          : (converted !== null
                              ? formatCurrency(converted, toCurrency)
                              : (isSameCurrency ? formatCurrency(amount, toCurrency) : '—'))}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest justify-center">
                  <ShieldCheck size={14} className="text-emerald-500" /> Secure Guaranteed Rate
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
