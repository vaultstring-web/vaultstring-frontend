'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { verifyEmailToken } from '@/src/lib/auth/auth';
import { AuthLayout } from '@/src/components/shared/AuthLayout';
import { Button } from '@/src/components/forms/Button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Missing token.');
      return;
    }

    const verify = async () => {
      try {
        await verifyEmailToken(token);
        setStatus('success');
        setMessage('Your email has been successfully verified.');
        // Optional: Redirect after a few seconds
        setTimeout(() => {
            router.push('/login');
        }, 3000);
      } catch (error: any) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage(error?.message || 'Verification failed. The link may be invalid or expired.');
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="w-full max-w-md space-y-8 text-center">
      <div className="flex justify-center">
        {status === 'verifying' && (
          <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        )}
        {status === 'success' && (
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
        )}
        {status === 'error' && (
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {status === 'verifying' && 'Verifying Email'}
          {status === 'success' && 'Email Verified!'}
          {status === 'error' && 'Verification Failed'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {message}
        </p>
      </div>

      <div className="pt-4">
        {status === 'success' && (
          <Button onClick={() => router.push('/login')} className="w-full">
            Continue to Login
          </Button>
        )}
        {status === 'error' && (
          <div className="space-y-3">
             <Button onClick={() => router.push('/login')} variant="outline" className="w-full">
              Back to Login
            </Button>
            <p className="text-xs text-gray-400">
                If you continue to have issues, please request a new verification link.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthLayout 
      title="Email Verification" 
      subtitle="Confirming your identity"
    >
      <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>}>
        <VerifyEmailContent />
      </Suspense>
    </AuthLayout>
  );
}
