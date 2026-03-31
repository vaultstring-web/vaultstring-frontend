'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthLayout } from '@/src/components/shared/AuthLayout';
import { Button } from '@/src/components/forms/Button';
import { useFormValidation } from '@/src/hooks/useFormValidation';
import { verifyEmail, resendVerificationCode, sendMagicLink, verifyEmailToken } from '@/src/lib/auth/auth';
import { colors, spacing } from '@/src/styles/tokens';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function VerificationContent() {
  const router = useRouter();
  const params = useSearchParams();
  const initialEmail = params?.get('email') || '';
  const token = params?.get('token');
  
  const [email, setEmail] = useState(initialEmail);
  const [cooldown, setCooldown] = useState(0);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(!!token);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Handle direct token verification from email link
  useEffect(() => {
    if (token) {
      const handleTokenVerify = async () => {
        try {
          await verifyEmailToken(token);
          setVerifyingToken(false);
          // Redirect to onboarding after short delay to show success
          setTimeout(() => router.push('/onboarding'), 2000);
        } catch (err: any) {
          setVerifyingToken(false);
          setTokenError(err?.message || 'Invalid or expired verification link');
        }
      };
      handleTokenVerify();
    }
  }, [token, router]);

  const form = useFormValidation(
    { code: '' },
    async (values) => {
      try {
        await verifyEmail(email, String(values.code || ''));
        router.push('/onboarding');
      } catch (err: any) {
        form.setFieldError('code', err?.message || 'Invalid verification code');
      }
    }
  );

  const handleResend = async () => {
    try {
      await resendVerificationCode(email);
      setCooldown(60);
      setTokenError(null);
    } catch (err: any) {
      setTokenError(err?.message || 'Failed to resend code');
    }
  };

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // UI for direct link verification
  if (verifyingToken) {
    return (
      <AuthLayout title="Verifying Email" subtitle="Please wait while we confirm your identity...">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-slate-500 font-medium">Connecting to security servers...</p>
        </div>
      </AuthLayout>
    );
  }

  if (token && !verifyingToken && !tokenError) {
    return (
      <AuthLayout title="Email Verified!" subtitle="Your identity has been successfully confirmed.">
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
          <div className="h-20 w-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-slate-500 text-center font-medium">Redirecting you to complete your profile setup...</p>
          <Loader2 className="h-6 w-6 text-slate-300 animate-spin" />
        </div>
      </AuthLayout>
    );
  }

  if (tokenError) {
    return (
      <AuthLayout title="Verification Failed" subtitle="There was a problem confirming your email.">
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
          <div className="h-20 w-20 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-red-500 text-center font-bold px-4">{tokenError}</p>
          <div className="flex flex-col gap-3 w-full">
            <Button variant="primary" onClick={() => {
              setTokenError(null);
              router.push('/login');
            }}>
              Back to Login
            </Button>
            {email && (
              <Button variant="outline" onClick={handleResend} disabled={cooldown > 0}>
                {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Try resending verification email'}
              </Button>
            )}
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (useMagicLink) {
    return (
      <AuthLayout title="Check Your Email" subtitle={`We've sent a magic link to ${email}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg, textAlign: 'center' }}>
          <p style={{ color: colors.neutral[600], fontSize: '0.9375rem' }}>
            Click the link in your email to complete verification.
          </p>
          <Button variant="outline" onClick={() => setUseMagicLink(false)}>
            Use code instead
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Verify Email" subtitle={`Enter the code sent to ${email}`}>
      <form onSubmit={form.handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: colors.neutral[700],
              marginBottom: spacing.sm,
            }}
          >
            Verification Code
          </label>
          <input
            name="code"
            type="text"
            maxLength={6}
            placeholder="000000"
            value={String(form.values.code || '')}
            onChange={form.handleChange}
            style={{
              width: '100%',
              textAlign: 'center',
              fontSize: '1.5rem',
              letterSpacing: '0.2em',
              padding: spacing.md,
              border: `1px solid ${form.errors.code ? colors.semantic.error : colors.neutral[300]}`,
              borderRadius: '0.5rem',
              fontFamily: 'monospace',
            }}
            autoComplete="one-time-code"
            inputMode="numeric"
          />
          {form.errors.code && (
            <p style={{ marginTop: spacing.sm, fontSize: '0.8125rem', color: colors.semantic.error }}>
              {form.errors.code}
            </p>
          )}
        </div>

        <Button type="submit" loading={form.isSubmitting}>
          Verify Email
        </Button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0}
            style={{
              width: '100%',
              fontSize: '0.875rem',
              color: cooldown > 0 ? colors.neutral[400] : colors.primary.green,
              backgroundColor: 'transparent',
              border: 'none',
              cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
              padding: spacing.sm,
              transition: 'color 200ms ease-in-out',
              fontWeight: '600',
            }}
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
          </button>
          <button
            type="button"
            onClick={async () => {
              await sendMagicLink(email);
              setUseMagicLink(true);
            }}
            style={{
              width: '100%',
              fontSize: '0.875rem',
              color: colors.neutral[600],
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: spacing.sm,
              transition: 'color 200ms ease-in-out',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.neutral[900];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.neutral[600];
            }}
          >
            Use magic link instead
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
