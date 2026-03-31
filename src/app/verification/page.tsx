'use client';

import { Suspense } from 'react';
import VerificationContent from './verification-content';
import { AuthLayout } from '@/src/components/shared/AuthLayout';

export default function VerificationPage() {
  return (
    <Suspense fallback={<AuthLayout title="Verify Email" subtitle="Enter your verification code"><div /></AuthLayout>}>
      <VerificationContent />
    </Suspense>
  );
}
