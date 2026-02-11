'use client';

import { Suspense } from 'react';
import { AuthLayout } from '@/src/components/shared/AuthLayout';
import { SignupForm } from '@/src/components/auth/SignupForm';
import { SocialAuthDivider } from '@/src/components/forms/SocialAuthDivider';

export default function SignupPage() {
  return (
    <AuthLayout title="Create Account" subtitle="Join VaultString today">
      <Suspense fallback={
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      }>
        <SignupForm />
      </Suspense>
      
      <div className="mt-6">
        <SocialAuthDivider />
      </div>
    </AuthLayout>
  );
}
