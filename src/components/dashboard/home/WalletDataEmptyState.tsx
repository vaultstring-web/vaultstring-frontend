'use client';

import { Wallet, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface WalletDataEmptyStateProps {
  fetchError?: string | null;
  className?: string;
}

export default function WalletDataEmptyState({ fetchError, className }: WalletDataEmptyStateProps) {
  const t = useTranslations('Dashboard.walletData');

  // Always surface API failures; seed/login hints are dev-only to avoid confusing production users.
  if (!fetchError && process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div
      className={`vs-card-shell flex gap-3 border-amber-500/30 bg-amber-500/5 p-4 text-sm ${className ?? ''}`}
      role="status"
    >
      <Wallet className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
      <div className="min-w-0 space-y-1">
        <p className="font-medium text-foreground">{t('title')}</p>
        <p className="text-muted-foreground">{fetchError ? t('errorHint') : t('seedHint')}</p>
        {fetchError ? (
          <p className="flex items-start gap-1.5 text-xs text-destructive">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="break-words">{fetchError}</span>
          </p>
        ) : null}
        <p className="text-xs text-muted-foreground">
          {t('loginHint')}{' '}
          <code className="rounded bg-muted px-1 py-0.5">john.doe@example.com</code> /{' '}
          <code className="rounded bg-muted px-1 py-0.5">password123</code>
        </p>
        <p className="text-xs font-medium text-primary">{t('docsPath')}</p>
      </div>
    </div>
  );
}
