'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ExternalLink, LifeBuoy } from 'lucide-react';
import { SettingsPageShell } from '@/src/components/settings/SettingsPageShell';
import { SettingsSection } from '@/src/components/enterprise/SettingsSection';

export default function SettingsHelpPage() {
  const t = useTranslations('Settings');
  const router = useRouter();

  const helpLinks = [
    {
      href: '/translation',
      title: t('helpSupport.helpCenter'),
      desc: t('helpSupport.helpCenterDesc'),
    },
    {
      href: 'mailto:support@vaultstring.com',
      title: t('helpSupport.contactSupport'),
      desc: t('helpSupport.contactSupportDesc'),
      external: true,
    },
    {
      href: '/compliance',
      title: t('helpSupport.compliance'),
      desc: t('helpSupport.complianceDesc'),
    },
    {
      href: '/settings/security',
      title: t('helpSupport.securityGuide'),
      desc: t('helpSupport.securityGuideDesc'),
    },
  ];

  return (
    <SettingsPageShell>
      <SettingsSection
        title={t('helpSupport.title')}
        description={t('helpSupport.subtitle')}
        icon={<LifeBuoy className="h-5 w-5" />}
      >
        <div className="divide-y divide-border rounded-lg border border-border">
          {helpLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              onClick={
                link.external
                  ? undefined
                  : (e) => {
                      e.preventDefault();
                      router.push(link.href);
                    }
              }
              className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/50"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{link.title}</p>
                <p className="text-xs text-muted-foreground">{link.desc}</p>
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
            </a>
          ))}
        </div>
      </SettingsSection>
    </SettingsPageShell>
  );
}
