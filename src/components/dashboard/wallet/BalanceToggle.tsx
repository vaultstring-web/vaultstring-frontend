'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useBalanceVisibility } from '@/src/hooks/useBalanceVisibility';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export default function BalanceToggle({ className }: { className?: string }) {
  const t = useTranslations('Wallet.balanceToggle');
  const { visible, toggle } = useBalanceVisibility();

  return (
    <button
      type="button"
      aria-pressed={visible}
      aria-label={visible ? t('hide') : t('show')}
      title={visible ? t('hide') : t('show')}
      onClick={toggle}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted',
        className
      )}
    >
      {visible ? <Eye size={16} className="text-primary" /> : <EyeOff size={16} className="text-muted-foreground" />}
      <span className="hidden sm:inline text-foreground">{visible ? t('visible') : t('hidden')}</span>
    </button>
  );
}
