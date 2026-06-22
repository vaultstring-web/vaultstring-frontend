'use client';

import TransactionList from '@/src/components/dashboard/transactions/TransactionList';
import { TransactionReceiptDrawer } from '@/src/components/dashboard/transactions/TransactionReceiptDrawer';
import { CustomerPageShell } from '@/src/components/enterprise/CustomerPageShell';
import { DataTableToolbar } from '@/src/components/enterprise/DataTableToolbar';
import { PageHeader } from '@/src/components/enterprise/PageHeader';
import { Button } from '@/src/components/ui/button';
import { ErrorBoundary } from '@/src/components/ui/error-boundary';
import { useAuth } from '@/src/context/AuthContext';
import { useTransactions } from '@/src/hooks/useTransactions';
import { exportTransactionsToCSV } from '@/src/lib/utils/csv-export';
import { cn } from '@/lib/utils';
import { FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

declare global {
  interface Window {
    searchTimeout: ReturnType<typeof setTimeout> | undefined;
  }
}

export default function TransactionsPage() {
  const t = useTranslations('Transactions');
  const tCommon = useTranslations('Common');
  const { user } = useAuth();
  const userId = user?.id || (user as { ID?: string })?.ID || null;

  const [receiptTxId, setReceiptTxId] = useState<string | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const {
    filteredTransactions,
    loading,
    page,
    totalPages,
    setPage,
    filters,
    setFilters,
    stats,
    setLimit,
    limit,
  } = useTransactions(10);

  const handlePrevious = () => {
    if (page > 1) setPage((p) => p - 1);
  };
  const handleNext = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  const handleExportCSV = () => {
    exportTransactionsToCSV(filteredTransactions, 'vaultstring_statement', userId);
  };

  const tabFilters = (
    <div className="inline-flex rounded-md border border-border bg-muted/40 p-0.5">
      {(
        [
          { id: 'all', label: t('tabs.all') },
          { id: 'sent', label: t('tabs.sent') },
          { id: 'received', label: t('tabs.received') },
        ] as const
      ).map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => setFilters((f) => ({ ...f, tab: item.id }))}
          className={cn(
            'rounded px-3 py-1.5 text-xs font-medium transition-colors',
            filters.tab === item.id
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );

  return (
    <CustomerPageShell width="wide" compact>
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        actions={
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            {t('actions.export')}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatSummary label={t('stats.inflow')} value={stats?.received || '0'} tone="success" />
        <StatSummary label={t('stats.outflow')} value={stats?.sent || '0'} tone="neutral" />
        <StatSummary label={t('stats.pendingSettlement')} value={stats?.pending || '0'} tone="warning" />
      </div>

      <div className="vs-table-shell">
        <div className="border-b border-border p-4">
          <DataTableToolbar
            searchPlaceholder={t('search.placeholder')}
            searchValue={filters.query}
            onSearchChange={(val) => {
              setFilters((f) => ({ ...f, query: val }));
              if (typeof window !== 'undefined') {
                if (window.searchTimeout) clearTimeout(window.searchTimeout);
                window.searchTimeout = setTimeout(() => setPage(1), 400);
              }
            }}
            filters={tabFilters}
            resultSummary={t('pagination.pageOf', { page, totalPages })}
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">{t('loading')}</p>
          </div>
        ) : (
          <ErrorBoundary
            title={tCommon('errorBoundaryTitle')}
            message={tCommon('errorBoundaryMessage')}
            retryLabel={tCommon('errorBoundaryRetry')}
          >
            <TransactionList
              transactions={filteredTransactions}
              userId={userId}
              onViewReceipt={(id) => {
                setReceiptTxId(id);
                setReceiptOpen(true);
              }}
              onViewAll={() => {
                setLimit(50);
                setPage(1);
              }}
              showViewAll={limit < 20}
            />

            <TransactionReceiptDrawer
              transactionId={receiptTxId}
              open={receiptOpen}
              onOpenChange={(open) => {
                setReceiptOpen(open);
                if (!open) setReceiptTxId(null);
              }}
            />

            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-xs text-muted-foreground">
                {t('pagination.pageOf', { page, totalPages })}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePrevious} disabled={page <= 1}>
                  {t('pagination.previous')}
                </Button>
                <Button variant="outline" size="sm" onClick={handleNext} disabled={page >= totalPages}>
                  {t('pagination.next')}
                </Button>
              </div>
            </div>
          </ErrorBoundary>
        )}
      </div>
    </CustomerPageShell>
  );
}

function StatSummary({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'success' | 'warning' | 'neutral';
}) {
  return (
    <div className="vs-stat-card flex items-center justify-between">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
      </div>
      <span
        className={cn(
          'hidden h-2 w-2 shrink-0 rounded-full sm:block',
          tone === 'success' && 'bg-emerald-500',
          tone === 'warning' && 'bg-amber-500',
          tone === 'neutral' && 'bg-muted-foreground/40'
        )}
        aria-hidden
      />
    </div>
  );
}
