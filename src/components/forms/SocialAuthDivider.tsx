import React from 'react';
import { Button } from '@/src/components/ui/button';

export function SocialAuthDivider() {
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-gray-300" />
      <span className="text-sm text-gray-500">Or continue with</span>
      <div className="flex-1 h-px bg-gray-300" />
    </div>
  );
}

interface SocialButtonProps {
  provider?: 'google' | 'apple';
  icon?: React.ReactNode;
  label?: string;
  onClick?: () => void;
}

export function SocialButton({ provider, icon, label, onClick }: SocialButtonProps) {
  let displayIcon = icon;
  let displayLabel = label;

  if (provider === 'google') {
    displayIcon = (
      <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
    );
    displayLabel = "Google";
  } else if (provider === 'apple') {
    displayIcon = (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.02 4.12-.95 1.76.08 2.66 1.25 2.66 1.25s-2.05 1.1-2.08 4.22c-.03 2.76 2.38 3.84 2.38 3.84-.1.35-.6 1.87-1.16 2.87zm-1.85-12.7c.6-1.09.28-2.68 0-3.58-1.29.11-2.73 1.12-3.13 2.58-.33 1.07.12 2.65.12 2.65.25.04 2.44-.57 3.01-1.65z" />
      </svg>
    );
    displayLabel = "Apple";
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 h-10"
    >
      {displayIcon && <span className="flex items-center justify-center">{displayIcon}</span>}
      <span className="text-sm font-medium text-gray-700">{displayLabel}</span>
    </Button>
  );
}
