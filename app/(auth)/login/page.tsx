'use client';

import { Suspense } from 'react';
import { LoginForm } from '@/src/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-50 via-white to-green-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-6">
      <Suspense fallback={<div className="text-slate-500">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
