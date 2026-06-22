'use client';

import Link from 'next/link';
import { PageHeader } from '@/src/components/enterprise/PageHeader';
import { CustomerPageShell } from '@/src/components/enterprise/CustomerPageShell';
import { LanguageSelector } from '@/src/components/shared/LanguageSelector';
import { useTranslations } from 'next-intl';

export default function TranslationPage() {
  const tTop = useTranslations('TopBar');
  const t = useTranslations('Translation');

  return (
    <CustomerPageShell width="narrow">
      <PageHeader
        title={tTop('titles.translation')}
        description={t('subtitle')}
        meta={
          <Link href="/settings" className="font-medium text-primary hover:underline">
            {t('backToSettings')}
          </Link>
        }
      />
      <div className="vs-card-shell p-6">
        <LanguageSelector variant="grid" showSearch />
      </div>
    </CustomerPageShell>
  );
}
