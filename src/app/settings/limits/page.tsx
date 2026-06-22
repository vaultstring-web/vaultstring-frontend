'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/ui/button';
import { Gauge } from 'lucide-react';
import { SettingsPageShell } from '@/src/components/settings/SettingsPageShell';
import { SettingsSection } from '@/src/components/enterprise/SettingsSection';
import { useAuth } from '@/src/context/AuthContext';
import { useWalletStats } from '@/src/hooks/useWalletStats';
import { formatCurrency } from '@/src/lib/utils/formatters';

export default function SettingsLimitsPage() {
  const t = useTranslations('Settings');
  const router = useRouter();
  const { user } = useAuth();
  const { stats } = useWalletStats();

  const kycStatus = user?.kycStatus ?? 'unverified';
  const limitRemaining = Math.max(0, stats.monthlyLimit - stats.spentThisMonth);
  const limitPct =
    stats.monthlyLimit > 0
      ? Math.min(100, Math.round((stats.spentThisMonth / stats.monthlyLimit) * 100))
      : 0;

  return (
    <SettingsPageShell>
      <SettingsSection
        title={t('limits.title')}
        description={t('limits.subtitle')}
        icon={<Gauge className="h-5 w-5" />}
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">{t('limits.monthlyLimit')}</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                {formatCurrency(stats.monthlyLimit, stats.primaryCurrency)}
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">{t('limits.usedThisMonth')}</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                {formatCurrency(stats.spentThisMonth, stats.primaryCurrency)}
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">{t('limits.remaining')}</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                {formatCurrency(limitRemaining, stats.primaryCurrency)}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{limitPct}% used</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${limitPct}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{t('limits.readOnlyNote')}</p>
          {kycStatus !== 'verified' ? (
            <Button variant="outline" size="sm" onClick={() => router.push('/compliance')}>
              {t('limits.upgradeCta')}
            </Button>
          ) : null}
        </div>
      </SettingsSection>
    </SettingsPageShell>
  );
}
