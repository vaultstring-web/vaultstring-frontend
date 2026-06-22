import React from 'react';
import { Logo } from '@/src/components/shared/Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-8 flex justify-center">
            <Logo size="auth" priority />
          </div>

          {title ? (
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
              {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
            </div>
          ) : null}

          {title ? <div className="mb-8 h-px bg-border" /> : null}

          {children}
        </div>
      </div>
    </div>
  );
}
