'use client';

import { useTranslations } from 'next-intl';

export default function KycPage() {
  const t = useTranslations('Compliance');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
      <p className="text-slate-600 dark:text-slate-400 mt-2">{t('subtitle')}</p>
    </div>
  );
}
