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
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundColor: '#f8f9fa',
        padding: spacing.lg,
      }}
    >
      <div className="w-full max-w-md">
        {/* Card container */}
        <div
          className="bg-white rounded-2xl"
          style={{
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.06)',
            padding: `${spacing.xl} ${spacing.lg}`,
          }}
        >
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: spacing.xl }}>
            <Image
              src="/images/vs2.png"
              alt="VaultString Logo"
              width={80}
              height={80}
              priority
              style={{ margin: '0 auto', display: 'block' }}
            />
          </div>

          {/* Header section */}
          {title && (
            <div style={{ textAlign: 'center', marginBottom: spacing.xl }}>
              <h1
                className="font-bold text-neutral-900"
                style={{
                  fontSize: '1.75rem',
                  lineHeight: '2.125rem',
                  letterSpacing: '-0.015em',
                  marginBottom: spacing.sm,
                }}
              >
                {title}
              </h1>
              {subtitle && (
                <p
                  className="text-neutral-500"
                  style={{
                    fontSize: '0.9375rem',
                    lineHeight: '1.5rem',
                    fontWeight: '500',
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Divider */}
          {title && (
            <div
              style={{
                height: '1px',
                backgroundColor: colors.neutral[200],
                marginBottom: spacing.lg,
              }}
            />
          )}

          {/* Content */}
          {children}
        </div>

        {/* Footer text (optional security note) */}
        
      </div>
    </div>
  );
}
