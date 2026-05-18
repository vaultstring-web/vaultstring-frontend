'use client';

import { Card, CardTitle, CardContent } from '@/src/components/ui/card';
import { formatCurrency } from '@/src/lib/utils/formatters';
import { TrendingUp, ShieldCheck, Zap, Info, Calculator, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

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
  error,
}: RatePreviewCardProps) {
  const tc = useTranslations('SendMoney.previewCard');
  const fromCurrency = String(from).toUpperCase();
  const toCurrency = String(to).toUpperCase();
  const isSameCurrency = fromCurrency === toCurrency;

  const rateDisplay =
    rate != null ? tc('ratePair', { from: fromCurrency, rate: rate.toFixed(4), to: toCurrency }) : '—';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-slate-800 dark:bg-slate-950 p-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                <Calculator size={18} aria-hidden />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base font-semibold tracking-tight truncate">{tc('title')}</CardTitle>
                <p className="text-xs text-white/75 font-medium truncate">{tc('subtitle')}</p>
              </div>
            </div>
            <Zap size={18} className="text-amber-300 shrink-0 opacity-90" aria-hidden />
          </div>
        </div>

        <CardContent className="p-5">
          <AnimatePresence mode="wait">
            {error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center text-center space-y-3 py-3"
              >
                <div className="h-11 w-11 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
                  <AlertCircle size={22} aria-hidden />
                </div>
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                {!isSameCurrency && (
                  <div className="flex justify-between items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wide">
                      <TrendingUp size={14} aria-hidden /> {tc('exchangeRate')}
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white text-right text-sm">
                      {loading ? '…' : rateDisplay}
                    </span>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-3 px-0.5 text-sm">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">{tc('sendingAmount')}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(amount, fromCurrency)}</span>
                  </div>

                  {fee !== null && (
                    <div className="flex justify-between items-center gap-3 px-0.5 text-sm">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                        {tc('serviceFee')} <Info size={12} className="shrink-0" aria-hidden />
                      </div>
                      <span className="font-semibold text-amber-600 dark:text-amber-500">+{formatCurrency(fee, fromCurrency)}</span>
                    </div>
                  )}

                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 px-0.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{tc('totalToPay')}</p>
                      <span className="font-semibold text-slate-900 dark:text-white text-lg sm:text-xl tracking-tight block truncate">
                        {loading ? '…' : formatCurrency(amount + (fee || 0), fromCurrency)}
                      </span>
                    </div>
                    <div className="flex-1 text-left sm:text-right min-w-0">
                      <p className="text-[11px] font-semibold text-emerald-600/90 uppercase tracking-wider mb-0.5">{tc('recipientGets')}</p>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-500 text-xl tracking-tight block truncate">
                        {loading
                          ? '…'
                          : (converted !== null
                              ? formatCurrency(converted, toCurrency)
                              : (isSameCurrency ? formatCurrency(amount, toCurrency) : '—'))}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide justify-center text-center leading-snug border-t border-slate-100 dark:border-slate-800 mt-4 pt-3">
                  <ShieldCheck size={14} className="text-emerald-600 shrink-0" aria-hidden />
                  {tc('secureRate')}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
