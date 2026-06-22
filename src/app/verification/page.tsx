'use client';

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import VerificationContent from './verification-content';
import { AuthLayout } from '@/src/components/shared/AuthLayout';

function VerificationFallback() {
  const t = useTranslations('Verification');
  return (
    <AuthLayout title={t('verifyTitle')} subtitle={t('verifySubtitle', { email: '…' })}>
      <div />
    </AuthLayout>
  );
}

export default function VerificationPage() {
  return (
    <Suspense fallback={<VerificationFallback />}>
      <VerificationContent />
    </Suspense>
  );
}
