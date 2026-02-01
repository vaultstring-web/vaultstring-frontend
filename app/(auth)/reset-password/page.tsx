'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { AuthLayout } from '@/src/components/shared/AuthLayout';
import { InputField } from '@/src/components/forms/InputField';
import { Button } from '@/src/components/forms/Button';
import { useFormValidation } from '@/src/hooks/useFormValidation';
import { useToast } from '@/src/hooks/use-toast';
import { validators } from '@/src/lib/utils/validation';
import { requestPasswordReset, resetPassword } from '@/src/lib/auth/auth';

function ResetPasswordContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params?.get('token') || '';
  const [stage, setStage] = useState<'email' | 'reset' | 'success'>(token ? 'reset' : 'email');
  const { toast } = useToast();

  const emailForm = useFormValidation(
    { email: '' },
    async (values) => {
      try {
        await requestPasswordReset(String(values.email || ''));
        toast({
          title: "Success",
          description: "If the email exists, a reset link has been sent.",
          variant: "default"
        });
        setStage('email');
      } catch (err: any) {
        emailForm.setFieldError('email', err?.message || 'Failed to send reset email');
        toast({
          variant: "destructive",
          title: "Error",
          description: err?.message || 'Failed to send reset email'
        });
      }
    },
    { email: validators.email }
  );

  const resetForm = useFormValidation(
    { password: '', confirmPassword: '' },
    async (values) => {
      try {
        if (values.password !== values.confirmPassword) {
          resetForm.setFieldError('confirmPassword', 'Passwords do not match');
          toast({
            variant: "destructive",
            title: "Error",
            description: "Passwords do not match"
          });
          return;
        }

        if (!token) {
          resetForm.setFieldError('password', 'Invalid or expired reset link');
          toast({
            variant: "destructive",
            title: "Error",
            description: "Invalid or expired reset link"
          });
          return;
        }

        await resetPassword(token, String(values.password || ''));
        toast({
          title: "Success",
          description: "Password reset successfully!",
          variant: "default"
        });
        setStage('success');
      } catch (err: any) {
        resetForm.setFieldError('password', err?.message || 'Password reset failed');
        toast({
          variant: "destructive",
          title: "Error",
          description: err?.message || 'Password reset failed'
        });
      }
    }
  );

  if (stage === 'email') {
    return (
      <>
        <AuthLayout title="Reset Password" subtitle="Enter your email to receive reset instructions">
          <form onSubmit={emailForm.handleSubmit} className="space-y-6">
            <InputField
              label="Email Address"
              name="email"
              type="email"
              value={emailForm.values.email}
              onChange={emailForm.handleChange}
              error={emailForm.errors.email}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />

            <Button type="submit" loading={emailForm.isSubmitting}>
              Send Reset Link
            </Button>

            <p className="text-center text-sm text-gray-600">
              Remember your password? <Link href="/login" className="text-blue-600 hover:text-blue-700">Sign in</Link>
            </p>
          </form>
        </AuthLayout>
      </>
    );
  }

  if (stage === 'reset') {
    return (
      <>
        <AuthLayout title="Create New Password" subtitle="Enter your new password below">
          <form onSubmit={resetForm.handleSubmit} className="space-y-6">
            <InputField
              label="New Password"
              name="password"
              type="password"
              value={resetForm.values.password}
              onChange={resetForm.handleChange}
              error={resetForm.errors.password}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />

            <InputField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={resetForm.values.confirmPassword}
              onChange={resetForm.handleChange}
              error={resetForm.errors.confirmPassword}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />

            <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded">⏱ This reset link will expire in 1 hour</p>

            <Button type="submit" loading={resetForm.isSubmitting}>
              Reset Password
            </Button>
          </form>
        </AuthLayout>
      </>
    );
  }

  return (
    <>
      <AuthLayout title="Password Reset Successful" subtitle="Your password has been updated">
        <div className="space-y-6 text-center">
          <div className="text-5xl">✓</div>
          <p className="text-gray-600">Your password has been reset. You can now sign in with your new password.</p>
          <Button onClick={() => router.push('/login')}>Return to Sign In</Button>
        </div>
      </AuthLayout>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthLayout title="Reset Password" subtitle="Create a new password"><div /></AuthLayout>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
