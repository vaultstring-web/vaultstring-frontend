'use client';

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { AuthLayout } from '@/src/components/shared/AuthLayout';
import { SignupForm } from '@/src/components/auth/SignupForm';

export default function SignupPage() {
  const t = useTranslations('Auth.signup');

  return (
    <AuthLayout title={t('pageTitle')} subtitle={t('pageSubtitle')}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
          </div>
        }
      >
        <SignupForm />
      </Suspense>
    </AuthLayout>
  );
}
