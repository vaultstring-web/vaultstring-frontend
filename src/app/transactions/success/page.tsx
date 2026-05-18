'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/src/lib/api/api-client';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { formatCurrency } from '@/src/lib/utils/formatters';
import { CheckCircle2, FileText, ArrowLeft, Printer } from 'lucide-react';
import { useTranslations } from 'next-intl';

type Receipt = {
  transaction_id: string;
  reference: string;
  date: string;
  sender_name: string;
  receiver_name: string;
  amount: string | number;
  currency: string;
  fee: string | number;
  total_debited: string | number;
  status: string;
  description?: string;
  // Optional extended fields (added server-side later)
  received_amount?: string | number;
  received_currency?: string;
  exchange_rate?: string | number;
  status_reason?: string;
};

const SUCCESS_TX_STORAGE_KEY = 'kyd_last_success_tx_id';

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

function parseNum(v: unknown) {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export default function TransactionSuccessPage() {
  const t = useTranslations('Receipt');
  const router = useRouter();
  const sp = useSearchParams();
  const tx = sp.get('tx') || '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [resolvedTx, setResolvedTx] = useState<string>('');

  const canFetch = useMemo(() => isUuid(tx), [tx]);

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        let candidateTx = canFetch ? tx : '';

        if (!candidateTx && typeof window !== 'undefined') {
          const stored = localStorage.getItem(SUCCESS_TX_STORAGE_KEY) || '';
          if (isUuid(stored)) candidateTx = stored;
        }

        // Final fallback: resolve from latest transaction list.
        if (!candidateTx) {
          const payments = await apiFetch<any>(`/payments?limit=5&offset=0`);
          const rows = Array.isArray(payments?.transactions)
            ? payments.transactions
            : Array.isArray(payments?.items)
              ? payments.items
              : Array.isArray(payments)
                ? payments
                : [];
          const firstWithId = rows.find((p: any) => isUuid(String(p?.id || '')));
          if (firstWithId?.id) candidateTx = String(firstWithId.id);
        }

        if (!candidateTx || !isUuid(candidateTx)) {
          throw new Error(t('errorResolveId'));
        }

        setResolvedTx(candidateTx);
        if (typeof window !== 'undefined') {
          localStorage.setItem(SUCCESS_TX_STORAGE_KEY, candidateTx);
        }

        const r = await apiFetch<Receipt>(`/payments/${encodeURIComponent(candidateTx)}/receipt`);
        if (!mounted) return;
        setReceipt(r);
      } catch (e: unknown) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : t('loadFailed'));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [tx, canFetch, t]);

  const title = receipt?.status?.toLowerCase().includes('pending')
    ? t('titlePending')
    : receipt?.status?.toLowerCase().includes('failed')
      ? t('titleFailed')
      : t('titleSuccess');

  const subtitle = receipt?.status_reason
    ? receipt.status_reason
    : receipt
      ? t('subtitleDefault')
      : (canFetch || !!resolvedTx)
        ? t('subtitleLoading')
        : t('subtitleNoId');

  const handlePrintPdf = () => {
    // Browser print dialog allows “Save as PDF”.
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
        }
      `}</style>

      <div className="flex items-start justify-between gap-4 print:hidden">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">{subtitle}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl" onClick={() => router.push('/transactions')}>
            <ArrowLeft size={16} className="mr-2" /> {t('backToTransactions')}
          </Button>
          <Button className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500" onClick={handlePrintPdf}>
            <Printer size={16} className="mr-2" /> {t('downloadPdf')}
          </Button>
        </div>
      </div>

      <Card className="border-slate-100 dark:border-slate-800 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <FileText size={18} />
            </div>
            <div>
              <div className="text-sm font-black text-slate-900 dark:text-white">{t('proofHeading')}</div>
              <div className="text-xs font-bold text-slate-400 dark:text-slate-500">
                {receipt?.reference ? t('referenceLabel', { ref: String(receipt.reference) }) : t('referencePending')}
              </div>
            </div>
          </div>
          {receipt?.status && (
            <Badge variant="outline" className="rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest">
              {String(receipt.status)}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {loading && (
            <div className="p-10 text-center text-slate-500 dark:text-slate-400 font-bold">
              {t('loading')}
            </div>
          )}

          {!loading && error && (
            <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 text-red-700 dark:text-red-200">
              <div className="font-black">{t('errorTitle')}</div>
              <div className="text-sm font-medium mt-1">{error}</div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="rounded-xl" onClick={() => router.push('/transactions')}>
                  <ArrowLeft size={16} className="mr-2" /> {t('backToTransactionsError')}
                </Button>
              </div>
            </div>
          )}

          {!loading && !error && receipt && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label={t('labelDate')} value={new Date(receipt.date).toLocaleString()} />
              <InfoRow label={t('labelTxnId')} value={receipt.transaction_id} mono />
              <InfoRow label={t('labelSender')} value={receipt.sender_name} />
              <InfoRow label={t('labelReceiver')} value={receipt.receiver_name} />

              <div className="md:col-span-2 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-500 dark:text-slate-400">{t('labelAmount')}</span>
                  <span className="font-black text-slate-900 dark:text-white">
                    {formatCurrency(parseNum(receipt.amount), receipt.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-500 dark:text-slate-400">{t('labelFee')}</span>
                  <span className="font-black text-slate-900 dark:text-white">
                    {formatCurrency(parseNum(receipt.fee), receipt.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-500 dark:text-slate-400">{t('labelTotalDebited')}</span>
                  <span className="font-black text-slate-900 dark:text-white">
                    {formatCurrency(parseNum(receipt.total_debited), receipt.currency)}
                  </span>
                </div>

                {(receipt.received_currency || receipt.received_amount) && (
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-500 dark:text-slate-400">{t('labelRecipientReceives')}</span>
                    <span className="font-black text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(parseNum(receipt.received_amount), receipt.received_currency || receipt.currency)}
                    </span>
                  </div>
                )}
              </div>

              {receipt.description && (
                <div className="md:col-span-2">
                  <div className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                    {t('labelDescription')}
                  </div>
                  <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-4 text-sm font-medium text-slate-700 dark:text-slate-200">
                    {receipt.description}
                  </div>
                </div>
              )}

              <div className="md:col-span-2 flex flex-col sm:flex-row gap-2 print:hidden">
                <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700" onClick={() => router.push('/send-money')}>
                  {t('sendAgain')}
                </Button>
                <Button variant="outline" className="rounded-xl" onClick={() => router.push('/transactions')}>
                  {t('viewHistory')}
                </Button>
              </div>
            </div>
          )}

          {!loading && !error && !receipt && !canFetch && (
            <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="text-slate-900 dark:text-white font-black">{t('receiptUnavailableTitle')}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                {t('receiptUnavailableBody')}
              </div>
              <div className="flex justify-center gap-2 print:hidden">
                <Button className="rounded-xl" onClick={() => router.push('/transactions')}>
                  {t('goToTransactions')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
        {label}
      </div>
      <div className={mono ? 'mt-1 font-mono font-bold text-slate-900 dark:text-white text-sm break-all' : 'mt-1 font-bold text-slate-900 dark:text-white text-sm wrap-break-word'}>
        {value}
      </div>
    </div>
  );
}

