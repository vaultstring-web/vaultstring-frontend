"use client"

import * as React from "react"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

import { Button } from "@/src/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form"
import { Input } from "@/src/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert"
import { signup as signupApi } from "@/src/lib/auth/auth"
import { apiFetch } from "@/src/lib/api/api-client"
import { PasswordStrengthIndicator } from "@/src/components/forms/PasswordStrengthIndicator"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"
import { Checkbox } from "@/src/components/ui/checkbox"
import { SocialAuthDivider, SocialButton } from '@/src/components/forms/SocialAuthDivider'
import { AuthLanguageSelector } from "@/src/components/auth/AuthLanguageSelector"
import { getStoredLocale } from "@/src/lib/locale"
import { normalizePhoneE164, passwordRegex } from "@/src/lib/utils/validation"

function createSignupSchema(t: (key: string) => string) {
  return z.object({
    accountType: z.enum(["individual", "business"]),
    email: z.string().email({ message: t('validation.emailInvalid') }),
    firstName: z.string().min(1, { message: t('validation.firstNameRequired') }),
    lastName: z.string().min(1, { message: t('validation.lastNameRequired') }),
    phone: z.string().min(7, { message: t('validation.phoneInvalid') }),
    countryCode: z.string().length(2, { message: t('validation.countryCode') }),
    businessName: z.string().optional(),
    password: z
      .string()
      .min(8, { message: t('validation.passwordMin') })
      .regex(passwordRegex, { message: t('validation.passwordStrength') }),
    confirmPassword: z.string(),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: t('validation.termsRequired'),
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('validation.passwordMismatch'),
    path: ["confirmPassword"],
  }).refine((data) => {
    if (data.accountType === "business" && !data.businessName) {
      return false;
    }
    return true;
  }, {
    message: t('validation.businessNameRequired'),
    path: ["businessName"],
  });
}

type SignupFormValues = z.infer<ReturnType<typeof createSignupSchema>>

export function SignupForm() {
  const router = useRouter()
  const t = useTranslations('Auth.signup')
  const tc = useTranslations('Common')
  const [globalError, setGlobalError] = React.useState<string | null>(null)
  const [appleNotice, setAppleNotice] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)

  const signupSchema = useMemo(() => createSignupSchema(t), [t])

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      accountType: "individual",
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      countryCode: "MW",
      businessName: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  })

  const { watch } = form
  const accountType = watch("accountType")

  const handleGoogleLogin = async () => {
    setGlobalError(null);
    setAppleNotice(false);
    try {
      const data = await apiFetch('/auth/google/start', { method: 'GET' });
      if (!data?.auth_url) {
        throw new Error(t('errorGoogleInit'));
      }
      window.location.href = data.auth_url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('errorGoogleInit');
      setGlobalError(msg || t('errorGoogleNotConfigured'));
    }
  };

  const handleAppleLogin = () => {
    setGlobalError(null);
    setAppleNotice(true);
  };

  async function onSubmit(values: SignupFormValues) {
    setGlobalError(null);
    setAppleNotice(false);

    try {
      const countryCode = values.countryCode.trim().toUpperCase()
      const phone = normalizePhoneE164(values.phone, countryCode)

      const resp = await signupApi({
        email: values.email.trim(),
        password: values.password,
        first_name: values.firstName.trim(),
        last_name: values.lastName.trim(),
        phone,
        user_type: values.accountType === "business" ? "merchant" : "individual",
        country_code: countryCode,
        business_name: values.accountType === "business" ? values.businessName?.trim() : undefined,
        locale: getStoredLocale('en'),
      })

      if (resp?.user?.id) {
        setIsSuccess(true)
        setTimeout(() => {
            router.push(`/verification?email=${encodeURIComponent(values.email)}&next=onboarding`)
        }, 1500)
      } else {
        setGlobalError(resp?.message || t('errorSignupFailed'))
      }
    } catch (error: unknown) {
      const apiErr = error as {
        message?: string
        data?: { error?: string; validation_errors?: Record<string, string> }
      }
      const validationErrors = apiErr?.data?.validation_errors
      if (validationErrors && Object.keys(validationErrors).length > 0) {
        setGlobalError(Object.values(validationErrors)[0] || t('errorSignupFailed'))
        return
      }
      const msg = apiErr?.message || apiErr?.data?.error || t('errorUnexpected')
      setGlobalError(msg)
    }
  }

  return (
    <div className="grid gap-6">
      {(globalError || appleNotice) && (
        <Alert variant={appleNotice ? 'default' : 'destructive'} className="mb-6 rounded-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {appleNotice ? t('alertComingSoonTitle') : t('alertFailedTitle')}
          </AlertTitle>
          <AlertDescription>
            {appleNotice ? t('errorAppleComingSoon') : globalError}
          </AlertDescription>
        </Alert>
      )}

      {isSuccess && (
        <Alert className="mb-6 rounded-2xl border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>{t('alertSuccessTitle')}</AlertTitle>
          <AlertDescription>{t('alertSuccessBody')}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <AuthLanguageSelector />

          <FormField
            control={form.control}
            name="accountType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0 flex-1">
                      <FormControl>
                        <RadioGroupItem value="individual" className="peer sr-only" id="r1" />
                      </FormControl>
                      <FormLabel
                        htmlFor="r1"
                        className={`flex-1 text-center py-2 rounded-md cursor-pointer transition-all ${
                            field.value === 'individual'
                            ? 'bg-white dark:bg-slate-700 shadow-sm text-green-600 font-bold'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {t('accountTypeIndividual')}
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0 flex-1">
                      <FormControl>
                        <RadioGroupItem value="business" className="peer sr-only" id="r2" />
                      </FormControl>
                      <FormLabel
                        htmlFor="r2"
                        className={`flex-1 text-center py-2 rounded-md cursor-pointer transition-all ${
                            field.value === 'business'
                            ? 'bg-white dark:bg-slate-700 shadow-sm text-green-600 font-bold'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {t('accountTypeBusiness')}
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage className="text-red-500 ml-1" />
              </FormItem>
            )}
          />

          {accountType === 'business' && (
            <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                <FormItem className="space-y-2">
                    <FormLabel className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{t('businessNameLabel')}</FormLabel>
                    <FormControl>
                    <Input
                        placeholder={t('businessNamePlaceholder')}
                        className="h-14 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 dark:text-white border-none focus-visible:ring-2 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/10"
                        {...field}
                    />
                    </FormControl>
                    <FormMessage className="text-red-500 ml-1" />
                </FormItem>
                )}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{t('firstNameLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('firstNamePlaceholder')}
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
              name="lastName"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{t('lastNameLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('lastNamePlaceholder')}
                      className="h-14 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 dark:text-white border-none focus-visible:ring-2 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 ml-1" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <FormField
                control={form.control}
                name="countryCode"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{t('countryLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('countryPlaceholder')}
                        maxLength={2}
                        className="h-14 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 dark:text-white border-none focus-visible:ring-2 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/10 text-center uppercase"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 ml-1" />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{t('phoneLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('phonePlaceholder')}
                        className="h-14 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 dark:text-white border-none focus-visible:ring-2 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 ml-1" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{t('emailLabel')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('emailPlaceholder')}
                    type="email"
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
                <FormLabel className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{t('passwordLabel')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={tc('passwordMask')}
                    type="password"
                    className="h-14 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 dark:text-white border-none focus-visible:ring-2 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/10"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-500 ml-1" />
                <PasswordStrengthIndicator password={field.value} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{t('confirmPasswordLabel')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={tc('passwordMask')}
                    type="password"
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
            name="termsAccepted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal text-slate-600 dark:text-slate-400">
                    {t.rich('termsLabel', {
                      terms: (chunks) => (
                        <a href="#" className="text-green-600 hover:underline">{chunks}</a>
                      ),
                      privacy: (chunks) => (
                        <a href="#" className="text-green-600 hover:underline">{chunks}</a>
                      ),
                    })}
                  </FormLabel>
                  <FormMessage className="text-red-500 ml-1" />
                </div>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-14 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-lg shadow-lg shadow-green-500/20 transition-all active:scale-[0.98]"
            disabled={form.formState.isSubmitting || isSuccess}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t('submitCreating')}
              </>
            ) : (
              t('submitCreate')
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
        </form>
      </Form>
    </div>
  )
}
