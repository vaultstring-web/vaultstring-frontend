'use client';

import type React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/src/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { PageHeader } from '@/src/components/enterprise/PageHeader';
import { CustomerPageShell } from '@/src/components/enterprise/CustomerPageShell';
import { SettingsTopNav } from '@/src/components/settings/SettingsTopNav';

type SettingsPageShellProps = {
  children: React.ReactNode;
  onSave?: () => void | Promise<void>;
  isSaving?: boolean;
  showSave?: boolean;
};

export function SettingsPageShell({
  children,
  onSave,
  isSaving = false,
  showSave = false,
}: SettingsPageShellProps) {
  const t = useTranslations('Settings');

  return (
    <CustomerPageShell width="default" className="pb-12">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        actions={
          showSave && onSave ? (
            <Button onClick={onSave} disabled={isSaving} size="sm">
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSaving ? t('saving') : t('save')}
            </Button>
          ) : undefined
        }
      />

      <SettingsTopNav className="mb-2" />
      <div className="min-w-0 w-full">{children}</div>
    </CustomerPageShell>
  );
}
