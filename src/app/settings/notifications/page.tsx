'use client';

import { useTranslations } from 'next-intl';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/src/components/ui/label';
import { Switch } from '@/src/components/ui/switch';
import { SettingsPageShell } from '@/src/components/settings/SettingsPageShell';
import { SettingsSection } from '@/src/components/enterprise/SettingsSection';
import { useSettingsPreferences } from '@/src/hooks/useSettingsPreferences';

export default function SettingsNotificationsPage() {
  const t = useTranslations('Settings');
  const {
    emailNotifications,
    setEmailNotifications,
    pushNotifications,
    setPushNotifications,
    marketingEmails,
    setMarketingEmails,
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
        title={t('notifications.title')}
        description={t('notifications.subtitle')}
        icon={<Bell className="h-5 w-5" />}
      >
        <div className="space-y-5">
          {[
            {
              id: 'email',
              title: t('notifications.email.title'),
              subtitle: t('notifications.email.subtitle'),
              checked: emailNotifications,
              onChange: setEmailNotifications,
            },
            {
              id: 'push',
              title: t('notifications.push.title'),
              subtitle: t('notifications.push.subtitle'),
              checked: pushNotifications,
              onChange: setPushNotifications,
            },
            {
              id: 'marketing',
              title: t('notifications.marketing.title'),
              subtitle: t('notifications.marketing.subtitle'),
              checked: marketingEmails,
              onChange: setMarketingEmails,
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
