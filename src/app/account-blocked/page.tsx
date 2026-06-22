'use client';

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { setToken, setUser } from '@/src/lib/api/api-client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function AccountBlockedPage() {
  const t = useTranslations('AccountBlocked');
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@vaultstring.com';
  const [copied, setCopied] = useState(false);

  async function copySupportEmail() {
    try {
      await navigator.clipboard.writeText(supportEmail);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be blocked by the browser; fall back to mailto link below.
    }
  }

  function clearSession() {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem('kyd_last_success_tx_id');
    } catch {}
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm text-center">
        <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <ShieldAlert className="h-7 w-7 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{t('title')}</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          {t('body')}
        </p>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {t('hint')}
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 p-4 text-left">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{t('supportContact')}</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <a
                className="text-sm font-semibold text-slate-900 dark:text-white hover:underline break-all"
                href={`mailto:${supportEmail}`}
              >
                {supportEmail}
              </a>
              <Button type="button" variant="outline" className="h-9 rounded-xl" onClick={copySupportEmail}>
                {copied ? t('copied') : t('copy')}
              </Button>
            </div>
          </div>

          <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={clearSession}>
            {t('signOutClear')}
          </Button>

          <Button asChild className="h-11 rounded-xl">
            <Link href="/login">{t('backToSignIn')}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
