import React from 'react';
import Image from 'next/image';
import { colors, spacing } from '@/src/styles/tokens';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="w-full max-w-md">
        {/* Card container */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-800 p-8">
          {/* Logo */}
          <div className="text-center mb-8 relative h-20 w-20 mx-auto">
            <Image
              src="/images/vs2.png"
              alt="VaultString Logo"
              fill
              className="object-contain dark:hidden invert"
              priority
            />
            <Image
              src="/images/vs2.png"
              alt="VaultString Logo"
              fill
              className="object-contain hidden dark:block"
              priority
            />
          </div>

          {/* Header section */}
          {title && (
            <div className="text-center mb-8">
              <h1 className="font-bold text-slate-900 dark:text-white text-2xl mb-2 tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Divider */}
          {title && (
            <div className="h-px bg-slate-200 dark:bg-slate-800 mb-8" />
          )}

          {/* Content */}
          {children}
        </div>
      </div>
    </div>
  );
}
