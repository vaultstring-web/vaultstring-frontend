'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/src/components/ui/alert';
import { SocialAuthDivider, SocialButton } from '@/src/components/forms/SocialAuthDivider';
import { login as loginApi } from '@/src/lib/auth/auth';
import { useAuth } from '@/src/context/AuthContext';
import { apiFetch } from '@/src/lib/api/api-client';
import { AuthLanguageSelector } from '@/src/components/auth/AuthLanguageSelector';

import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/src/components/ui/input-otp';

function createLoginSchema(t: (key: string) => string) {
  return z.object({
    email: z.string().email({ message: t('validation.emailInvalid') }),
    password: z.string().min(1, { message: t('validation.passwordRequired') }),
    rememberMe: z.boolean().default(false),
    totpCode: z.string().optional(),
  });
}

type LoginValues = z.infer<ReturnType<typeof createLoginSchema>>;

function classifyLoginError(error: unknown): 'mfa' | 'blocked' | 'reset' | 'generic' {
  const status = (error as { status?: number } | undefined)?.status;
  const message = String((error as { message?: string } | undefined)?.message || '').toLowerCase();

  if (message.includes('mfa required') || message.includes('totp required')) return 'mfa';
  if (status === 403 || message.includes('blocked') || message.includes('restricted')) return 'blocked';
  if (status === 423 || message.includes('password reset required') || message.includes('reset required')) return 'reset';
  return 'generic';
}

export function LoginForm() {
  const router = useRouter();
  const t = useTranslations('Auth.login');
  const tc = useTranslations('Common');
  const { refreshUser, user } = useAuth();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [appleNotice, setAppleNotice] = useState(false);
  const [showMFA, setShowMFA] = useState(false);
  const [mfaCode, setMfaCode] = useState('');

  const loginSchema = useMemo(() => createLoginSchema(t), [t]);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
      totpCode: '',
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: LoginValues) {
    setGlobalError(null);
    setAppleNotice(false);
    try {
      const resp = await loginApi({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
        totp_code: showMFA ? mfaCode : undefined,
      });

      if (resp?.access_token || resp?.token) {
        const responseUser = resp?.user as { email_verified?: boolean; kyc_status?: string } | undefined;
        const emailVerifiedFromResponse = !!responseUser?.email_verified;
        const kycStatusFromResponse = String(responseUser?.kyc_status || '');
        await refreshUser();
        const email = String(data.email || '').trim();
        const requiresEmailVerification =
          !(emailVerifiedFromResponse || user?.isEmailVerified) &&
          process.env.NEXT_PUBLIC_DISABLE_EMAIL_VERIFICATION !== 'true' &&
          process.env.NEXT_PUBLIC_BYPASS_EMAIL_VERIFICATION !== 'true';

        if (requiresEmailVerification) {
          router.push(`/verification?email=${encodeURIComponent(email)}&next=onboarding`);
        } else if (kycStatusFromResponse ? kycStatusFromResponse !== 'verified' : user?.kycStatus !== 'verified') {
          router.push('/onboarding');
        } else {
          router.push('/');
        }
      } else {
        setGlobalError(t('errorInvalidCredentials'));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      const category = classifyLoginError(err);

      if (category === 'mfa') {
        setShowMFA(true);
        setGlobalError(t('errorMfaRequired'));
      } else if (category === 'blocked') {
        window.location.href = '/account-blocked';
      } else if (category === 'reset') {
        window.location.href = '/reset-password';
      } else {
        setGlobalError(message || t('errorUnexpected'));
      }
    }
  }

  const handleGoogleLogin = async () => {
    setGlobalError(null);
    setAppleNotice(false);
    try {
      const data = await apiFetch('/auth/google/start');

      if (!data?.auth_url) {
        throw new Error(t('errorGoogleInit'));
      }
      window.location.href = data.auth_url;
    } catch (err: unknown) {
      console.error('Google OAuth initiation failed:', err);
      const msg = err instanceof Error ? err.message : '';
      setGlobalError(msg || t('errorGoogleNotConfigured'));
    }
  };

  const handleAppleLogin = () => {
    setGlobalError(null);
    setAppleNotice(true);
  };

  const showAlert = !!(globalError || appleNotice);
  const alertVariant =
    showMFA || appleNotice ? 'default' : 'destructive';

  return (
    <div className="w-full max-w-md">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[40px] p-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">{t('title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">{t('subtitle')}</p>
        </div>

        {showAlert && (
          <Alert variant={alertVariant} className="mb-6 rounded-2xl">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {showMFA
                ? t('alertMfaTitle')
                : appleNotice
                  ? t('alertComingSoonTitle')
                  : t('alertLoginFailedTitle')}
            </AlertTitle>
            <AlertDescription>
              {appleNotice ? t('errorAppleComingSoon') : globalError}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} method="POST" className="space-y-6">
            <AuthLanguageSelector />
            {!showMFA ? (
              <>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{t('emailLabel')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('emailPlaceholder')}
                          className="h-14 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 dark:text-white border-none focus-visible:ring-2 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 ml-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <div className="flex justify-between items-center ml-1">
                        <FormLabel className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('passwordLabel')}</FormLabel>
                        <Link href="/reset-password" title="reset" className="text-xs font-bold text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400">{t('forgotPassword')}</Link>
                      </div>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={tc('passwordMask')}
                          className="h-14 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 dark:text-white border-none focus-visible:ring-2 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 ml-1" />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="space-y-2 flex flex-col items-center">
                  <FormLabel className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('authenticatorCodeLabel')}</FormLabel>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      value={mfaCode}
                      onChange={setMfaCode}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium text-center px-4">
                    {t('mfaHint')}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => { setShowMFA(false); setMfaCode(''); setGlobalError(null); }}
                  className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-widest transition-colors"
                >
                  {t('backToPassword')}
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || (showMFA && mfaCode.length !== 6)}
              className="w-full h-14 bg-slate-900 hover:bg-black dark:bg-green-600 dark:hover:bg-green-500 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 dark:shadow-none transition-all active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {showMFA ? t('submitVerifying') : t('submitSigningIn')}
                </>
              ) : (
                showMFA ? t('submitVerifySignIn') : t('submitSignIn')
              )}
            </Button>

            <SocialAuthDivider />

            <div className="grid grid-cols-2 gap-4">
              <SocialButton
                provider="google"
                onClick={handleGoogleLogin}
                className="h-12 rounded-xl border-slate-100 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-transparent"
              />
              <SocialButton
                provider="apple"
                onClick={handleAppleLogin}
                className="h-12 rounded-xl border-slate-100 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-transparent"
              />
            </div>

            <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 mt-8">
              {t('noAccount')}{' '}
              <Link href="/signup" className="text-slate-900 dark:text-white font-bold hover:underline">
                {t('createAccount')}
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
}
