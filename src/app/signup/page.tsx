'use client';

import { Suspense } from 'react';
import { AuthLayout } from '@/src/components/shared/AuthLayout';
import { SignupForm } from '@/src/components/auth/SignupForm';
import { SocialAuthDivider, SocialButton } from '@/src/components/forms/SocialAuthDivider';

export default function SignupPage() {
  const handleGoogleSignup = () => {
    alert("Google Signup is currently being integrated. Please use the form for now.");
  };

  const handleAppleSignup = () => {
    alert("Apple Signup is currently being integrated. Please use the form for now.");
  };

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
        <div className="grid grid-cols-2 gap-4 mt-6">
          <SocialButton 
            provider="google" 
            onClick={handleGoogleSignup}
            className="h-12 rounded-xl border-slate-100 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-transparent" 
          />
          <SocialButton 
            provider="apple" 
            onClick={handleAppleSignup}
            className="h-12 rounded-xl border-slate-100 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-transparent" 
          />
        </div>
      </div>
    </AuthLayout>
  );
}
