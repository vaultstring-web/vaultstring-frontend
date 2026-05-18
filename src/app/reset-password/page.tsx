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
import { useTranslations } from 'next-intl';

function ResetPasswordContent() {
  const t = useTranslations('ResetPassword');
  const router = useRouter();
  const params = useSearchParams();
  const token = params?.get('token') || '';
  const [stage, setStage] = useState<'email' | 'reset' | 'success'>(token ? 'reset' : 'email');
  const { toast } = useToast();

  const emailForm = useFormValidation(
    { email: '' },
    async (values, helpers) => {
      try {
        await requestPasswordReset(String(values.email || ''));
        toast({
          title: t('toastSuccess'),
          description: t('emailSent'),
          variant: 'default',
        });
        setStage('email');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : t('sendFailed');
        helpers?.setFieldError('email', message);
        toast({
          variant: 'destructive',
          title: t('toastError'),
          description: message,
        });
      }
    },
    { email: validators.email }
  );

  const resetForm = useFormValidation(
    { password: '', confirmPassword: '' },
    async (values, helpers) => {
      try {
        if (values.password !== values.confirmPassword) {
          helpers?.setFieldError('confirmPassword', t('passwordMismatch'));
          toast({
            variant: 'destructive',
            title: t('toastError'),
            description: t('passwordMismatch'),
          });
          return;
        }

        if (!token) {
          helpers?.setFieldError('password', t('invalidLink'));
          toast({
            variant: 'destructive',
            title: t('toastError'),
            description: t('invalidLink'),
          });
          return;
        }

        await resetPassword(token, String(values.password || ''));
        toast({
          title: t('toastSuccess'),
          description: t('resetSuccess'),
          variant: 'default',
        });
        setStage('success');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : t('resetFailed');
        helpers?.setFieldError('password', message);
        toast({
          variant: 'destructive',
          title: t('toastError'),
          description: message,
        });
      }
    }
  );

  if (stage === 'email') {
    return (
      <AuthLayout title={t('emailTitle')} subtitle={t('emailSubtitle')}>
        <form onSubmit={emailForm.handleSubmit} className="space-y-6">
          <InputField
            label={t('emailLabel')}
            name="email"
            type="email"
            value={emailForm.values.email}
            onChange={emailForm.handleChange}
            error={emailForm.errors.email}
            placeholder={t('emailPlaceholder')}
            required
            autoComplete="email"
          />

          <Button type="submit" loading={emailForm.isSubmitting}>
            {t('sendLink')}
          </Button>

          <p className="text-center text-sm text-gray-600">
            {t('rememberPassword')}{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700">
              {t('signIn')}
            </Link>
          </p>
        </form>
      </AuthLayout>
    );
  }

  if (stage === 'reset') {
    return (
      <AuthLayout title={t('resetTitle')} subtitle={t('resetSubtitle')}>
        <form onSubmit={resetForm.handleSubmit} className="space-y-6">
          <InputField
            label={t('newPasswordLabel')}
            name="password"
            type="password"
            value={resetForm.values.password}
            onChange={resetForm.handleChange}
            error={resetForm.errors.password}
            placeholder={t('passwordPlaceholder')}
            required
            autoComplete="new-password"
          />

          <InputField
            label={t('confirmPasswordLabel')}
            name="confirmPassword"
            type="password"
            value={resetForm.values.confirmPassword}
            onChange={resetForm.handleChange}
            error={resetForm.errors.confirmPassword}
            placeholder={t('passwordPlaceholder')}
            required
            autoComplete="new-password"
          />

          <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded">⏱ {t('expiryNote')}</p>

          <Button type="submit" loading={resetForm.isSubmitting}>
            {t('resetButton')}
          </Button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t('successTitle')} subtitle={t('successSubtitle')}>
      <div className="space-y-6 text-center">
        <div className="text-5xl">✓</div>
        <p className="text-gray-600">{t('successBody')}</p>
        <Button onClick={() => router.push('/login')}>{t('returnSignIn')}</Button>
      </div>
    </AuthLayout>
  );
}

function ResetPasswordFallback() {
  const t = useTranslations('ResetPassword');
  return (
    <AuthLayout title={t('fallbackTitle')} subtitle={t('fallbackSubtitle')}>
      <div />
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
