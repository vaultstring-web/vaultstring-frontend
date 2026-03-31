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

  // Define routes that should NOT have the sidebar/topbar (auth pages)
  const isAuthPage = pathname === '/login' || 
                     pathname === '/signup' || 
                     pathname === '/reset-password' || 
                     pathname === '/verification' ||
                     pathname === '/verify-email' ||
                     pathname === '/onboarding' ||
                     pathname === '/kyc';

  useEffect(() => {
    // Only redirect if not on an auth page
    if (!isAuthPage) {
      const token = getToken();
      if (!token) {
        router.replace('/login');
      }
    }
  }, [router, isAuthPage]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="h-screen bg-background text-foreground flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopBar 
          user={user} 
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
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
