'use client';

import TransactionList from '@/src/components/dashboard/transactions/TransactionList';
import { TransactionReceiptDrawer } from '@/src/components/dashboard/transactions/TransactionReceiptDrawer';
import Link from 'next/link';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useTransactions } from '@/src/hooks/useTransactions';
import { useAuth } from '@/src/context/AuthContext';

export function WalletRecentActivity() {
  const t = useTranslations('Wallet');
  const { user } = useAuth();
  const userId = user?.id || (user as { ID?: string })?.ID || null;
  const { filteredTransactions, loading } = useTransactions(5);
  const [receiptTxId, setReceiptTxId] = useState<string | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  if (loading && filteredTransactions.length === 0) {
    return (
      <div className="vs-table-shell h-32 animate-pulse bg-muted/30" aria-hidden />
    );
  }

  if (filteredTransactions.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">{t('recentActivityTitle')}</h2>
        <Link href="/transactions" className="text-sm font-medium text-primary hover:underline">
          {t('recentActivityViewAll')}
        </Link>
      </div>
      <div className="vs-table-shell">
        <TransactionList
          transactions={filteredTransactions}
          userId={userId}
          showViewAll={false}
          onViewReceipt={(id) => {
            setReceiptTxId(id);
            setReceiptOpen(true);
          }}
        />
        <TransactionReceiptDrawer
          transactionId={receiptTxId}
          open={receiptOpen}
          onOpenChange={(open) => {
            setReceiptOpen(open);
            if (!open) setReceiptTxId(null);
          }}
        />
      </div>
    </section>
  );
}
