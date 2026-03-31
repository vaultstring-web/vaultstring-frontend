'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

import { Button } from '@/src/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/src/components/ui/alert';
import { useAuth } from '@/src/context/AuthContext';
import { setToken, setUser as setLocalProfile, apiFetch } from '@/src/lib/api/api-client';

export default function GoogleCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const state = searchParams.get('state');

      if (error) {
        setStatus('error');
        setError(`Google authentication failed: ${error}`);
        return;
      }

      if (!code) {
        setStatus('error');
        setError('No authorization code received from Google');
        return;
      }

      try {
        // Exchange code for tokens
        const data = await apiFetch('/auth/google/callback', {
          method: 'POST',
          body: JSON.stringify({ code, state }),
        });
        
        // Store tokens and user in localStorage
        if (data.access_token) {
          setToken(data.access_token);
        }
        if (data.user) {
          setLocalProfile(data.user);
        }

        // Update auth context
        await refreshUser();
        
        setStatus('success');
        
        // Redirect to dashboard after successful authentication
        setTimeout(() => {
          router.push('/');
        }, 2000);
        
      } catch (err: any) {
        console.error('Google OAuth callback error:', err);
        setStatus('error');
        setError(err.message || 'Failed to complete authentication');
      }
    };

    handleGoogleCallback();
  }, [searchParams, router, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md p-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg">
          {status === 'loading' && (
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Completing Authentication
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Please wait while we complete your Google authentication...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Authentication Successful!
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                You have been successfully authenticated with Google.
                Redirecting to dashboard...
              </p>
              <Button 
                onClick={() => router.push('/')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Go to Dashboard
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Authentication Failed
              </h2>
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div className="space-y-3">
                <Button 
                  onClick={() => router.push('/login')}
                  className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
                >
                  Back to Login
                </Button>
                <Button 
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="w-full"
                >
                  Go to Home
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}