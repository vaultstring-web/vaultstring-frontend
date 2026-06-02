'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthLayout } from '@/src/components/shared/AuthLayout';
import { Button } from '@/src/components/forms/Button';
import { useFormValidation } from '@/src/hooks/useFormValidation';
import { verifyEmail, resendVerificationCode, sendMagicLink } from '@/src/lib/auth/auth';
import { colors, spacing } from '@/src/styles/tokens';

export default function VerificationContent() {
  const router = useRouter();
  const params = useSearchParams();
  const initialEmail = params?.get('email') || '';
  const [email, setEmail] = useState(initialEmail);
  const [cooldown, setCooldown] = useState(0);
  const [useMagicLink, setUseMagicLink] = useState(false);

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
    } catch (err: any) {
      form.setFieldError('code', err?.message || 'Failed to resend code');
    }
  };

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

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
