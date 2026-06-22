'use client';

import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SettingsPageShell } from '@/src/components/settings/SettingsPageShell';
import { SettingsSection } from '@/src/components/enterprise/SettingsSection';

export default function SettingsAppearancePage() {
  const t = useTranslations('Settings');
  const { theme, setTheme } = useTheme();

  return (
    <SettingsPageShell>
      <SettingsSection
        title={t('appearance.title')}
        description={t('appearance.subtitle')}
        icon={theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(['light', 'dark', 'system'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setTheme(mode)}
              className={cn(
                'rounded-lg border p-4 text-left transition-colors',
                theme === mode
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted/50'
              )}
            >
              <div className="text-sm font-medium capitalize text-foreground">
                {t(`appearance.${mode}`)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {mode === 'light' && t('appearance.lightMode')}
                {mode === 'dark' && t('appearance.darkMode')}
                {mode === 'system' && t('appearance.followSystem')}
              </div>
            </button>
          ))}
        </div>
      </SettingsSection>
    </SettingsPageShell>
  );
}
