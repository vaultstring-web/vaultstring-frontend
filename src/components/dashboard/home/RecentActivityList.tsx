'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Transaction } from '@/src/types/types';
import { format } from 'date-fns';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { StatusChip } from '@/src/components/enterprise/StatusChip';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/src/components/ui/pagination';

interface RecentActivityListProps {
  recentTransactions: Transaction[];
}

function statusTone(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
  const s = status.toLowerCase();
  if (s === 'completed' || s === 'success') return 'success';
  if (s === 'pending' || s === 'processing') return 'warning';
  if (s === 'failed' || s === 'rejected') return 'danger';
  return 'neutral';
}

export default function RecentActivityList({ recentTransactions }: RecentActivityListProps) {
  const t = useTranslations('Dashboard');
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 6;
  const totalPages = Math.max(1, Math.ceil(recentTransactions.length / limit));
  const paginatedTransactions = recentTransactions.slice((page - 1) * limit, page * limit);

  return (
    <div className="vs-table-shell flex flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Clock size={18} className="text-muted-foreground" />
          {t('recentActivity')}
        </h3>
        <Link href="/transactions" className="text-sm font-medium text-primary hover:underline">
          {t('viewAll')}
        </Link>
      </div>
      <div className="divide-y divide-border">
        {paginatedTransactions.map((txn) => (
          <button
            key={txn.id}
            type="button"
            onClick={() => router.push(`/transactions?highlight=${encodeURIComponent(txn.id)}`)}
            className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-muted/50"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  txn.type === 'deposit'
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {txn.type === 'deposit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{txn.merchantName}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(txn.date), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <p
                className={`text-sm font-medium ${
                  txn.type === 'deposit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                }`}
              >
                {txn.type === 'deposit' ? '+' : '-'}
                {txn.amountMWK.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <StatusChip label={txn.status} tone={statusTone(txn.status)} />
            </div>
          </button>
        ))}
        {recentTransactions.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">{t('noRecentActivity')}</div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center border-t border-border p-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) setPage(page - 1);
                  }}
                  className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" onClick={(e) => e.preventDefault()} isActive>
                  {page}
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages) setPage(page + 1);
                  }}
                  className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
