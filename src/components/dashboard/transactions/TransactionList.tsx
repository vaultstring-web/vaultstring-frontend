import React from 'react';
import { ApiTransaction } from '@/src/types/api';
import { formatCurrency } from '@/src/lib/utils/formatters';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { useTranslations } from 'next-intl';
import { StatusChip } from '@/src/components/enterprise/StatusChip';
import { EmptyState } from '@/src/components/enterprise/EmptyState';
import { cn } from '@/lib/utils';
import { Receipt } from 'lucide-react';

interface TransactionListProps {
  transactions: ApiTransaction[];
  userId: string | null;
  onViewReceipt?: (id: string) => void;
  onViewAll?: () => void;
  showViewAll?: boolean;
}

function statusTone(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
  const s = status.toLowerCase();
  if (s === 'completed' || s === 'success') return 'success';
  if (s === 'pending' || s === 'processing') return 'warning';
  if (s === 'failed' || s === 'cancelled' || s === 'rejected') return 'danger';
  return 'neutral';
}

export default function TransactionList({
  transactions,
  userId,
  onViewReceipt,
  onViewAll,
  showViewAll = true,
}: TransactionListProps) {
  const t = useTranslations('Transactions');

  const parseNum = (v: unknown) => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  };

  const deriveDisplay = (tx: ApiTransaction) => {
    const isReceived = tx.receiver_id === userId;
    const fee = parseNum((tx as { fee_amount?: unknown }).fee_amount ?? 0);
    const totalDebited =
      parseNum((tx as { total_debited?: unknown }).total_debited ?? 0) ||
      parseNum(tx.amount) + fee;

    if (isReceived) {
      const receivedAmount =
        (tx as { converted_amount?: unknown }).converted_amount ?? tx.net_amount ?? tx.amount;
      const receivedCurrency = String(
        (tx as { converted_currency?: string }).converted_currency || tx.currency || ''
      ).toUpperCase();
      return {
        amount: parseNum(receivedAmount),
        currency: receivedCurrency,
        sign: '+',
        isReceived: true,
      };
    }

    return {
      amount: totalDebited > 0 ? totalDebited : parseNum(tx.amount),
      currency: String(tx.currency || '').toUpperCase(),
      sign: '-',
      isReceived: false,
    };
  };

  return (
    <div>
      <div className="sticky top-0 z-10 hidden border-b border-border bg-card/95 px-6 py-3 backdrop-blur sm:grid sm:grid-cols-[1fr_auto_auto] sm:gap-4">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t('list.columns.description')}
        </span>
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground sm:text-right">
          {t('list.columns.amount')}
        </span>
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground sm:text-right">
          {t('list.columns.status')}
        </span>
      </div>

      <div className="flex items-center justify-between border-b border-border px-6 py-4 sm:hidden">
        <h2 className="text-sm font-semibold text-foreground">{t('list.title')}</h2>
        {showViewAll ? (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            {t('list.viewAll')}
          </Button>
        ) : null}
      </div>

      <div className="divide-y divide-border">
        {transactions.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title={t('list.empty')}
            description={t('list.emptyHint', { defaultValue: 'Your transactions will appear here.' })}
          />
        ) : (
          transactions.map((tx) => {
            if (!tx) return null;
            const d = deriveDisplay(tx);
            const amountDisplay = `${d.sign}${formatCurrency(d.amount, d.currency)}`;
            const status = String(tx.status || 'pending');
            const counterparty = d.isReceived
              ? tx.sender_name || tx.SenderName || t('list.unknownSender')
              : tx.receiver_name || tx.ReceiverName || tx.description || t('list.unknownReceiver');

            let dateLabel = t('list.datePending');
            try {
              if (tx.created_at) {
                dateLabel = new Date(tx.created_at).toLocaleString(undefined, {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
              }
            } catch {
              dateLabel = t('list.invalidDate');
            }

            return (
              <button
                key={tx.id}
                type="button"
                onClick={() => onViewReceipt?.(tx.id)}
                className="grid w-full grid-cols-1 gap-2 px-6 py-4 text-left transition-colors hover:bg-muted/50 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                      d.isReceived
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {d.isReceived ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{counterparty}</p>
                    <p className="text-xs text-muted-foreground">{dateLabel}</p>
                  </div>
                </div>
                <p
                  className={cn(
                    'text-sm font-medium tabular-nums sm:text-right',
                    d.isReceived ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                  )}
                >
                  {amountDisplay}
                </p>
                <div className="sm:flex sm:justify-end">
                  <StatusChip label={status} tone={statusTone(status)} />
                </div>
              </button>
            );
          })
        )}
      </div>

      {showViewAll && transactions.length > 0 ? (
        <div className="hidden border-t border-border px-6 py-3 sm:block">
          <Button variant="ghost" size="sm" className="w-full" onClick={onViewAll}>
            {t('list.viewAll')}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
