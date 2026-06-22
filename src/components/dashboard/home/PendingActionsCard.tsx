'use client';

import Link from 'next/link';
import { AlertCircle, ChevronRight, Mail, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { UserProfile } from '@/src/types/types';

type PendingActionsCardProps = {
  user: UserProfile | null;
  pendingCount?: number;
  emailVerificationDisabled?: boolean;
};

export default function PendingActionsCard({
  user,
  pendingCount = 0,
  emailVerificationDisabled = false,
}: PendingActionsCardProps) {
  const t = useTranslations('Dashboard.pendingActions');

  const items: { id: string; title: string; subtitle: string; href: string; icon: typeof ShieldCheck }[] =
    [];

  if (user?.kycStatus !== 'verified') {
    items.push({
      id: 'kyc',
      title: t('verifyIdentityTitle'),
      subtitle: t('verifyIdentitySubtitle'),
      href: '/onboarding',
      icon: ShieldCheck,
    });
  }

  if (!emailVerificationDisabled && user && !user.isEmailVerified) {
    items.push({
      id: 'email',
      title: t('verifyEmailTitle'),
      subtitle: t('verifyEmailSubtitle'),
      href: `/verification?email=${encodeURIComponent(user.email)}`,
      icon: Mail,
    });
  }

  if (pendingCount > 0) {
    items.push({
      id: 'pending-tx',
      title: t('pendingTransfersTitle', { count: pendingCount }),
      subtitle: t('pendingTransfersSubtitle'),
      href: '/transactions?tab=all',
      icon: AlertCircle,
    });
  }

  if (items.length === 0) return null;

  return (
    <div className="vs-card-shell p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {t('title')}
      </p>
      <ul className="divide-y divide-border">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex items-center justify-between gap-3 py-3 transition-colors hover:text-primary"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Icon className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
