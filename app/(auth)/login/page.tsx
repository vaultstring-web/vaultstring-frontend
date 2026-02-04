'use client';

import Link from 'next/link';
import Image from 'next/image';
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
import { colors, spacing } from '@/src/styles/tokens';

const loginValidationSchema = {
  email: validators.email,
  password: (password: string) => {
    if (!password) return 'Password is required';
    return null;
  }
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      toast({
        variant: "destructive",
        title: "Session Expired",
        description: "Please log in again."
      });
    } else if (searchParams.get('logout') === 'true') {
      toast({
        title: "Logged Out",
        description: "Successfully logged out.",
        variant: "default"
      });
    }
  }, [searchParams, toast]);

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

          // Check for successful login - API returns access_token or token
          if (resp?.access_token || resp?.token || (resp as any)?.user) {
            toast({
              title: "Welcome back!",
              description: "Login successful.",
              variant: "default"
            });
            await refreshUser(); // Refresh user context before navigation
            // Force a hard reload to ensure all dashboard states (sockets, cache) are fresh
            window.location.href = '/dashboard';
            return;
          }

          setFieldError('email', 'Invalid credentials');
          toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Invalid email or password"
          });
        } catch (err: any) {
          const msg = err?.message || 'Login failed. Please try again.';
          setFieldError('email', msg);
          toast({
            variant: "destructive",
            title: "Error",
            description: msg
          });
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

          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={values.rememberMe}
              onChange={handleChange}
              style={{
                accentColor: colors.primary.green,
                width: '16px',
                height: '16px',
                cursor: 'pointer'
              }}
            />
            <label 
              htmlFor="rememberMe" 
              style={{ 
                fontSize: '0.875rem', 
                color: colors.neutral[600],
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              Remember me
            </label>
          </div>

          <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
            Sign In
          </Button>

          <SocialAuthDivider />

          <div style={{ display: 'flex', gap: spacing.md }}>
            <SocialButton 
              provider="google"
              onClick={() => console.log('Google login')} 
            />
            <SocialButton 
              provider="apple"
              onClick={() => console.log('Apple login')} 
            />
          </div>

          <div style={{ textAlign: 'center', marginTop: spacing.md, fontSize: '0.875rem', color: colors.neutral[600] }}>
            Don't have an account?{' '}
            <Link
              href="/signup"
              style={{
                color: colors.primary.green,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Sign up
            </Link>
          </div>
        </form>
      </AuthLayout>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
