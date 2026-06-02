import React from 'react';
import { colors, spacing, borderRadius, transitions } from '@/src/styles/tokens';

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
  const getVariantStyles = () => {
    const baseStyle = {
      padding: `${spacing.md} ${spacing.lg}`,
      borderRadius: borderRadius.md,
      fontSize: '0.9375rem',
      lineHeight: '1.25rem',
      fontWeight: '600',
      transition: `all ${transitions.normal}`,
      border: 'none',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: fullWidth ? '100%' : 'auto',
      opacity: disabled ? 0.7 : 1,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.neutral[300] : colors.primary.green,
          color: 'white',
          boxShadow: disabled ? 'none' : `0 2px 4px rgba(68, 138, 51, 0.15), 0 1px 2px rgba(0, 0, 0, 0.05)`,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.neutral[100] : colors.neutral[50],
          color: disabled ? colors.neutral[400] : colors.neutral[900],
          border: `1px solid ${colors.neutral[200]}`,
          boxShadow: disabled ? 'none' : `0 1px 2px rgba(0, 0, 0, 0.05)`,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          color: disabled ? colors.neutral[400] : colors.primary.green,
          border: `2px solid ${disabled ? colors.neutral[300] : colors.primary.green}`,
        };
      default:
        return baseStyle;
    }
  };

  const variantStyles = getVariantStyles();

  const handleHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      const target = e.currentTarget;
      if (variant === 'primary') {
        target.style.backgroundColor = '#3a7a2b';
        target.style.boxShadow = `0 4px 8px rgba(68, 138, 51, 0.25), 0 2px 4px rgba(0, 0, 0, 0.1)`;
        target.style.transform = 'translateY(-1px)';
      } else if (variant === 'secondary') {
        target.style.backgroundColor = colors.neutral[100];
        target.style.boxShadow = `0 2px 4px rgba(0, 0, 0, 0.08)`;
      } else if (variant === 'outline') {
        target.style.backgroundColor = `rgba(68, 138, 51, 0.05)`;
      }
    }
  };

  const handleHoverLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    target.style.transform = 'translateY(0)';
    Object.assign(target.style, variantStyles);
  };

  return (
    <button
      type={type}
      onClick={onClick}
      onMouseEnter={handleHover}
      onMouseLeave={handleHoverLeave}
      disabled={disabled || loading}
      style={variantStyles}
      className={className}
    >
      {loading ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <svg
            className="animate-spin"
            width="18"
            height="18"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              style={{ opacity: 0.25 }}
            />
            <path
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              style={{ opacity: 0.75 }}
            />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
