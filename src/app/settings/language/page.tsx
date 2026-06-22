'use client';

import { useTranslations } from 'next-intl';
import { Monitor } from 'lucide-react';
import { SettingsPageShell } from '@/src/components/settings/SettingsPageShell';
import { SettingsSection } from '@/src/components/enterprise/SettingsSection';
import { LanguageSelector } from '@/src/components/shared/LanguageSelector';

export default function SettingsLanguagePage() {
  const t = useTranslations('Settings');
  const tLang = useTranslations('Language');

  return (
    <SettingsPageShell>
      <SettingsSection
        title={t('language.title')}
        description={t('language.subtitle')}
        icon={<Monitor className="h-5 w-5" />}
        className="vs-brand-accent-border border-primary/20 bg-primary/[0.02]"
      >
        <LanguageSelector variant="select" manageLinkHref="/translation" />
        <p className="mt-3 text-xs text-muted-foreground">{tLang('hint')}</p>
      </SettingsSection>
    </SettingsPageShell>
  );
}
