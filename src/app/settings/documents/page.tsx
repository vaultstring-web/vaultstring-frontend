'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { ChevronRight, FileText } from 'lucide-react';
import { SettingsPageShell } from '@/src/components/settings/SettingsPageShell';
import { SettingsSection } from '@/src/components/enterprise/SettingsSection';
import { useAuth } from '@/src/context/AuthContext';

export default function SettingsDocumentsPage() {
  const t = useTranslations('Settings');
  const router = useRouter();
  const { user } = useAuth();

  const kycStatus = user?.kycStatus ?? 'unverified';
  const kycLabel =
    kycStatus === 'verified'
      ? t('account.verified')
      : kycStatus === 'pending'
        ? t('account.pending')
        : t('account.unverified');

  return (
    <SettingsPageShell>
      <SettingsSection
        title={t('documents.title')}
        description={t('documents.subtitle')}
        icon={<FileText className="h-5 w-5" />}
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm font-medium text-foreground">{t('documents.statusLabel')}</p>
            <Badge
              variant={kycStatus === 'verified' ? 'default' : 'secondary'}
              className="mt-2 capitalize"
            >
              {kycLabel}
            </Badge>
            <p className="mt-3 text-sm text-muted-foreground">{t('documents.statusHint')}</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/compliance')}>
            {t('documents.manageCta')}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
          {kycStatus === 'unverified' ? (
            <Button onClick={() => router.push('/onboarding')}>{t('documents.startKycCta')}</Button>
          ) : null}
        </div>
      </SettingsSection>
    </SettingsPageShell>
  );
}
