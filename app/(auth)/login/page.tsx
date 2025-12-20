'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/src/components/shared/AuthLayout';
import { InputField } from '@/src/components/forms/InputField';
import { Button } from '@/src/components/forms/Button';
import { SocialAuthDivider, SocialButton } from '@/src/components/forms/SocialAuthDivider';
import { ToastContainer } from '@/src/components/shared/Toast';
import { useFormValidation } from '@/src/hooks/useFormValidation';
import { useToast } from '@/src/hooks/useToast';
import { validators } from '@/src/lib/utils/validation';
import { login as loginApi } from '@/src/lib/auth/auth';
import { colors, spacing } from '@/src/styles/tokens';

const loginValidationSchema = {
  email: validators.email,
  password: (password: string) => {
    if (!password) return 'Password is required';
    return null;
  }
};

export default function LoginPage() {
  const router = useRouter();
  const { toasts, removeToast, showSuccess, showError } = useToast();

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

          if (resp?.ok === true || resp?.token || resp?.access_token) {
            showSuccess('Login successful!');
            setTimeout(() => router.push('/dashboard'), 500);
            return;
          }

          setFieldError('email', 'Invalid credentials');
          showError('Invalid email or password');
        } catch (err: any) {
          const msg = err?.message || 'Login failed. Please try again.';
          setFieldError('email', msg);
          showError(msg);
        }
      },
      loginValidationSchema
    );

  return (
    <>
      <AuthLayout title="Sign In" subtitle="Welcome back to VaultString">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
            <InputField
              label="Password"
              name="password"
              type="password"
              value={values.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            <Link
              href="/reset-password"
              style={{
                display: 'inline-block',
                fontSize: '0.875rem',
                color: colors.primary.green,
                textDecoration: 'none',
                transition: 'color 200ms ease-in-out',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#3a7a2b';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.primary.green;
              }}
            >
              Forgot password?
            </Link>
          </div>

          <InputField
            label="Remember me"
            name="rememberMe"
            type="checkbox"
            value={values.rememberMe}
            onChange={handleChange}
          />

          <Button type="submit" loading={isSubmitting}>
            Sign In
          </Button>

          <SocialAuthDivider />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
            <SocialButton
              icon={<img src="/icons/google-icon.svg" alt="Google" width={20} height={20} />}
              label="Google"
              onClick={() => showError('Google auth coming soon')}
            />
            <SocialButton
              icon={<img src="/icons/apple-logo.svg" alt="Apple" width={20} height={20} />}
              label="Apple"
              onClick={() => showError('Apple auth coming soon')}
            />
          </div>

          <p
            style={{
              textAlign: 'center',
              fontSize: '0.9375rem',
              color: colors.neutral[600],
            }}
          >
            Don't have an account?{' '}
            <Link
              href="/signup"
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
              Sign up
            </Link>
          </p>
        </form>
      </AuthLayout>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}
