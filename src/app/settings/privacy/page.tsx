'use client';

import { useTranslations } from 'next-intl';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/src/components/ui/label';
import { Switch } from '@/src/components/ui/switch';
import { SettingsPageShell } from '@/src/components/settings/SettingsPageShell';
import { SettingsSection } from '@/src/components/enterprise/SettingsSection';
import { useSettingsPreferences } from '@/src/hooks/useSettingsPreferences';

export default function SettingsPrivacyPage() {
  const t = useTranslations('Settings');
  const {
    analyticsOptIn,
    setAnalyticsOptIn,
    personalizedOffers,
    setPersonalizedOffers,
    publicProfile,
    setPublicProfile,
    isSaving,
    savePreferences,
  } = useSettingsPreferences();

  const handleSave = async () => {
    const ok = await savePreferences();
    if (ok) toast.success(t('success'));
    else toast.error(t('error'));
  };

  return (
    <SettingsPageShell onSave={handleSave} isSaving={isSaving} showSave>
      <SettingsSection
        title={t('privacy.title')}
        description={t('privacy.subtitle')}
        icon={<Lock className="h-5 w-5" />}
      >
        <div className="space-y-5">
          {[
            {
              id: 'analytics',
              title: t('privacy.analytics.title'),
              subtitle: t('privacy.analytics.subtitle'),
              checked: analyticsOptIn,
              onChange: setAnalyticsOptIn,
            },
            {
              id: 'personalized',
              title: t('privacy.marketing.title'),
              subtitle: t('privacy.marketing.subtitle'),
              checked: personalizedOffers,
              onChange: setPersonalizedOffers,
            },
            {
              id: 'publicProfile',
              title: t('privacy.profileVisibility.title'),
              subtitle: t('privacy.profileVisibility.subtitle'),
              checked: publicProfile,
              onChange: setPublicProfile,
            },
          ].map((row) => (
            <div key={row.id} className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">{row.title}</Label>
                <p className="text-sm text-muted-foreground">{row.subtitle}</p>
              </div>
              <Switch checked={row.checked} onCheckedChange={row.onChange} />
            </div>
          ))}
        </div>
      </SettingsSection>
    </SettingsPageShell>
  );
}
