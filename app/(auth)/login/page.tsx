'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { AuthLayout } from '@/src/components/shared/AuthLayout';
import { InputField } from '@/src/components/forms/InputField';
import { Button } from '@/src/components/forms/Button';
import { SocialAuthDivider, SocialButton } from '@/src/components/forms/SocialAuthDivider';
import { useFormValidation } from '@/src/hooks/useFormValidation';
import { useToast } from '@/src/hooks/use-toast';
import { validators } from '@/src/lib/utils/validation';
import { login as loginApi } from '@/src/lib/auth/auth';
import { useAuth } from '@/src/context/AuthContext';
import { colors } from '@/src/styles/tokens';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const { toast } = useToast();

  const { values, errors, isSubmitting, handleChange, handleSubmit, setFieldError } =
    useFormValidation(
      { email: '', password: '', rememberMe: false },
      async (formValues) => {
        try {
          const resp = await loginApi({
            email: String(formValues.email || ''),
            password: String(formValues.password || ''),
            rememberMe: Boolean(formValues.rememberMe)
          });
          if (resp?.access_token || resp?.token) {
            await refreshUser();
            window.location.href = '/dashboard';
            return;
          }
          setFieldError('email', 'Invalid credentials');
        } catch (err: any) {
          setFieldError('email', err?.message || 'Login failed');
        }
      },
      { email: validators.email, password: (p: string) => p ? null : 'Required' }
    );

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-50 via-white to-green-50/30 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[40px] p-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sign In</h1>
            <p className="text-slate-500 mt-2 font-medium">Welcome back to VaultString</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <InputField
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="you@example.com"
                className="h-14 rounded-2xl bg-slate-50/50 border-none focus:ring-2 focus:ring-green-500/20"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                <Link href="/reset-password" title="reset" className="text-xs font-bold text-green-600 hover:text-green-700">Forgot?</Link>
              </div>
              <InputField
                name="password"
                type="password"
                value={values.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="••••••••"
                className="h-14 rounded-2xl bg-slate-50/50 border-none focus:ring-2 focus:ring-green-500/20"
              />
            </div>

            <Button 
                type="submit" 
                isLoading={isSubmitting}
                className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold shadow-xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign In to Vault
            </Button>

            <SocialAuthDivider />

            <div className="grid grid-cols-2 gap-4">
              <SocialButton provider="google" className="h-12 rounded-xl border-slate-100 font-bold text-slate-700 hover:bg-slate-50" />
              <SocialButton provider="apple" className="h-12 rounded-xl border-slate-100 font-bold text-slate-700 hover:bg-slate-50" />
            </div>

            <p className="text-center text-sm font-medium text-slate-500 mt-8">
              New here? <Link href="/signup" className="text-green-600 font-bold hover:underline">Create an account</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={null}><LoginForm /></Suspense>;
}