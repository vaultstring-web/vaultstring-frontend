'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Bell,
  FileText,
  Gauge,
  LifeBuoy,
  Link2,
  Lock,
  Monitor,
  Shield,
  Sun,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

type SettingsNavItem = {
  href: string;
  labelKey: string;
  icon: LucideIcon;
};

const NAV_ITEMS: SettingsNavItem[] = [
  { href: '/settings/security', labelKey: 'security', icon: Shield },
  { href: '/settings/notifications', labelKey: 'notifications', icon: Bell },
  { href: '/settings/language', labelKey: 'language', icon: Monitor },
  { href: '/settings/appearance', labelKey: 'appearance', icon: Sun },
  { href: '/settings/privacy', labelKey: 'privacy', icon: Lock },
  { href: '/settings/limits', labelKey: 'limits', icon: Gauge },
  { href: '/settings/connected-accounts', labelKey: 'connectedAccounts', icon: Link2 },
  { href: '/settings/documents', labelKey: 'documents', icon: FileText },
  { href: '/settings/help', labelKey: 'helpSupport', icon: LifeBuoy },
];

/** Horizontal settings navigation — full width for page content below. */
export function SettingsTopNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const t = useTranslations('Settings.nav');

  return (
    <nav aria-label={t('ariaLabel')} className={cn('w-full min-w-0 border-b border-border', className)}>
      <div className="-mb-px flex gap-0.5 overflow-x-auto overscroll-x-contain pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {NAV_ITEMS.map(({ href, labelKey, icon: Icon }) => {
          const active =
            pathname === href || (href === '/settings/security' && pathname === '/settings');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="whitespace-nowrap">{t(labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
