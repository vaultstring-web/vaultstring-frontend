'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthLayout } from '@/src/components/shared/AuthLayout';
import { InputField } from '@/src/components/forms/InputField';
import { Button } from '@/src/components/forms/Button';
import { PasswordStrengthIndicator } from '@/src/components/forms/PasswordStrengthIndicator';
import { SocialAuthDivider, SocialButton } from '@/src/components/forms/SocialAuthDivider';
import { useFormValidation } from '@/src/hooks/useFormValidation';
import { useToast } from '@/src/hooks/use-toast';
import { validators } from '@/src/lib/utils/validation';
import { signup as signupApi } from '@/src/lib/auth/auth';
import { colors, spacing } from '@/src/styles/tokens';

const signupValidationSchema = {
  email: validators.email,
  password: validators.password,
  confirmPassword: () => null,
  businessName: (value: string, formValues?: any) => {
    if (formValues?.accountType === 'business' && !value) {
      return 'Business name is required for business accounts';
    }
    return null;
  },
  termsAccepted: (checked: boolean) => {
    if (!checked) return 'You must accept the terms and conditions';
    return null;
  }
};

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [accountType, setAccountType] = useState<'individual' | 'business'>('individual');

  const { values, errors, isSubmitting, handleChange, handleSubmit, setFieldError } =
    useFormValidation(
      { email: '', password: '', confirmPassword: '', businessName: '', termsAccepted: false },
      async (formValues) => {
        try {
          if (formValues.confirmPassword !== formValues.password) {
            setFieldError('confirmPassword', 'Passwords do not match');
            toast({
              variant: "destructive",
              title: "Error",
              description: "Passwords do not match"
            });
            return;
          }

          if (accountType === 'business' && !formValues.businessName) {
            setFieldError('businessName', 'Business name is required for business accounts');
            toast({
              variant: "destructive",
              title: "Error",
              description: "Business name is required for business accounts"
            });
            return;
          }

          const resp = await signupApi({
            email: String(formValues.email || ''),
            password: String(formValues.password || ''),
            accountType
          });

          if (resp?.ok) {
            toast({
              title: "Success",
              description: "Account created! Check your email to verify.",
              variant: "default"
            });
            setTimeout(() => router.push(`/verification?email=${encodeURIComponent(String(formValues.email))}`), 1000);
            return;
          }

          setFieldError('email', resp?.message || 'Signup failed.');
          toast({
            variant: "destructive",
            title: "Signup Failed",
            description: resp?.message || 'Signup failed. Please try again.'
          });
        } catch (error: any) {
          const msg = error?.message || 'Signup failed. Please try again.';
          setFieldError('email', msg);
          toast({
            variant: "destructive",
            title: "Error",
            description: msg
          });
        }
      },
      signupValidationSchema
    );

  return (
    <>
      <AuthLayout title="Create Account" subtitle="Join VaultString today">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
          <div style={{
            display: 'flex',
            gap: spacing.sm,
            backgroundColor: colors.neutral[100],
            padding: spacing.xs,
            borderRadius: '0.5rem',
          }}>
            <button
              type="button"
              onClick={() => setAccountType('individual')}
              style={{
                flex: 1,
                padding: `${spacing.sm} ${spacing.md}`,
                backgroundColor: accountType === 'individual' ? colors.primary.green : 'transparent',
                color: accountType === 'individual' ? 'white' : colors.neutral[700],
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 200ms ease-in-out',
              }}
            >
              Individual
            </button>
            <button
              type="button"
              onClick={() => setAccountType('business')}
              style={{
                flex: 1,
                padding: `${spacing.sm} ${spacing.md}`,
                backgroundColor: accountType === 'business' ? colors.primary.green : 'transparent',
                color: accountType === 'business' ? 'white' : colors.neutral[700],
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 200ms ease-in-out',
              }}
            >
              Business
            </button>
          </div>

          {accountType === 'business' && (
            <InputField
              label="Business Name"
              name="businessName"
              type="text"
              value={values.businessName || ''}
              onChange={handleChange}
              error={errors.businessName}
              placeholder="Your Business Name"
              required
            />
          )}

          <InputField
            label="Email Address"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />

          <InputField
            label="Password"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="••••••••"
            required
            autoComplete="new-password"
          />

          {values.password && (
            <PasswordStrengthIndicator password={String(values.password || '')} />
          )}

          <InputField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={values.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="••••••••"
            required
            autoComplete="new-password"
          />

          <InputField
            label="I agree to the Terms and Conditions"
            name="termsAccepted"
            type="checkbox"
            value={values.termsAccepted}
            onChange={handleChange}
            error={errors.termsAccepted}
          />

          <Button type="submit" loading={isSubmitting}>
            Create Account
          </Button>

          <SocialAuthDivider />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
            <SocialButton
              provider="google"
              onClick={() => toast({ title: "Info", description: "Google auth coming soon" })}
            />
            <SocialButton
              provider="apple"
              onClick={() => toast({ title: "Info", description: "Apple auth coming soon" })}
            />
          </div>

          <p style={{
            textAlign: 'center',
            fontSize: '0.9375rem',
            color: colors.neutral[600],
          }}>
            Already have an account? {' '}
            <Link
              href="/login"
              style={{
                color: colors.primary.green,
                textDecoration: 'none',
                fontWeight: '600',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              Sign in
            </Link>
          </p>
        </form>
      </AuthLayout>
    </>
  );
}
