'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/src/components/shared/sidebar';
import TopBar from '@/src/components/shared/topbar';
import { useAuth } from '@/src/context/AuthContext';
import { getToken } from '@/src/lib/api/api-client';

import { AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('Layout');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const disableEmailVerification =
    process.env.NEXT_PUBLIC_DISABLE_EMAIL_VERIFICATION === 'true' ||
    process.env.NEXT_PUBLIC_BYPASS_EMAIL_VERIFICATION === 'true';

  // Public routes should NOT require a token and should NOT show the app shell.
  // Keeping `/account-blocked` public prevents blocked users from being bounced back to `/login`.
  const isPublicPage =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/reset-password' ||
    pathname === '/verification' ||
    pathname === '/verify-email' ||
    pathname === '/google-callback' ||
    pathname === '/onboarding' ||
    pathname === '/kyc' ||
    pathname === '/account-blocked';

  useEffect(() => {
    // Only enforce auth on non-public routes
    if (!isPublicPage) {
      const token = getToken();
      if (!token) {
        router.replace('/login');
      }
    }
  }, [router, isPublicPage]);

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30 text-foreground">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        <TopBar 
          user={user} 
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />
        
        <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto p-4 lg:p-8">
          <div className="mx-auto w-full min-w-0 max-w-6xl vs-page-stack">
            {user && !disableEmailVerification && !user.isEmailVerified && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top duration-500">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-900 dark:text-amber-200">{t('emailVerificationRequired.title')}</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400">{t('emailVerificationRequired.subtitle')}</p>
                  </div>
                </div>
                <Link 
                  href={`/verification?email=${encodeURIComponent(user.email)}`}
                  className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200 hover:underline bg-white dark:bg-amber-900/40 px-4 py-2 rounded-xl border border-amber-200 dark:border-amber-800 transition-all"
                >
                  {t('emailVerificationRequired.cta')}
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
