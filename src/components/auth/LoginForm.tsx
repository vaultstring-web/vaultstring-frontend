'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';

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

import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/src/components/ui/input-otp';

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().default(false),
  totpCode: z.string().optional(),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [showMFA, setShowMFA] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [loading, setLoading] = useState(false);

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
    try {
      const resp = await loginApi({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
        totp_code: showMFA ? mfaCode : undefined,
      });

      if (resp?.access_token || resp?.token) {
        await refreshUser();
        window.location.href = '/'; // Hard reload to root
      } else {
        setGlobalError("Invalid credentials. Please try again.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      if (err?.message === 'mfa required') {
        setShowMFA(true);
        setGlobalError("Two-factor authentication is required for this account.");
      } else {
        setGlobalError(err?.message || "An unexpected error occurred. Please try again.");
      }
    }
  }

  const handleGoogleLogin = async () => {
    setGlobalError(null);
    try {
      setLoading(true);
      const data = await apiFetch("/auth/google/start");
      
      if (data.auth_url) {
        window.location.href = data.auth_url;
      }
    } catch (err: any) {
      console.error("Google OAuth initiation failed:", err);
      setGlobalError(err?.message || "Failed to initiate Google authentication. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = () => {
    setGlobalError(null);
    setGlobalError("Apple Authentication is currently being integrated. Please use your email/password for now.");
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[40px] p-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Sign In</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Welcome back to VaultString</p>
        </div>

        {globalError && (
          <Alert variant={showMFA ? "default" : (globalError.includes("integrated") ? "default" : "destructive")} className="mb-6 rounded-2xl">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{showMFA ? "MFA Required" : (globalError.includes("integrated") ? "Coming Soon" : "Login Failed")}</AlertTitle>
            <AlertDescription>{globalError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} method="POST" className="space-y-6">
            {!showMFA ? (
              <>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="you@example.com" 
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
                        <FormLabel className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Password</FormLabel>
                        <Link href="/reset-password" title="reset" className="text-xs font-bold text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400">Forgot?</Link>
                      </div>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
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
                  <FormLabel className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Authenticator Code</FormLabel>
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
                    Enter the 6-digit code from your authenticator app to complete sign in.
                  </p>
                </div>
                
                <button 
                  type="button"
                  onClick={() => { setShowMFA(false); setMfaCode(''); setGlobalError(null); }}
                  className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-widest transition-colors"
                >
                  Back to Password
                </button>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isSubmitting || (showMFA && mfaCode.length !== 6)}
              className="w-full h-14 bg-slate-900 hover:bg-black dark:bg-green-600 dark:hover:bg-green-500 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {showMFA ? 'Verifying...' : 'Signing In...'}
                </>
              ) : (
                showMFA ? "Verify & Sign In" : "Sign In to Vault"
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
              Don't have an account?{' '}
              <Link href="/signup" className="text-slate-900 dark:text-white font-bold hover:underline">
                Create one
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
}
