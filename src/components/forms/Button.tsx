import React from 'react';
import { Button as ShadcnButton } from '@/src/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = true,
  className = ''
}: ButtonProps) {
  
  // Map legacy variants to Shadcn variants
  const mapVariant = (v: string): "default" | "secondary" | "outline" | "destructive" | "ghost" | "link" => {
    switch (v) {
      case 'primary': return 'default';
      case 'secondary': return 'secondary';
      case 'outline': return 'outline';
      default: return 'default';
    }
  };

  return (
    <ShadcnButton
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      variant={mapVariant(variant)}
      className={cn(
        fullWidth ? 'w-full' : '',
        className
      )}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </ShadcnButton>
  );
}
