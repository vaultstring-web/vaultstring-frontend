import React from 'react';
import { colors, spacing, borderRadius } from '@/src/styles/tokens';

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string | boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
}

export function InputField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  autoComplete
}: InputFieldProps) {
  const isCheckbox = type === 'checkbox';

  if (isCheckbox) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
        <input
          id={name}
          name={name}
          type="checkbox"
          checked={typeof value === 'boolean' ? value : false}
          onChange={onChange}
          disabled={disabled}
          style={{
            width: '16px',
            height: '16px',
            borderRadius: borderRadius.sm,
            borderColor: colors.neutral[300],
            accentColor: colors.primary.green,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        />
        <label
          htmlFor={name}
          style={{
            display: 'block',
            fontSize: '0.875rem',
            lineHeight: '1.25rem',
            fontWeight: '500',
            color: colors.neutral[700],
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          {label}
          {required && <span style={{ color: colors.semantic.error, marginLeft: '4px' }}>*</span>}
        </label>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: spacing.lg }}>
    <label
        htmlFor={name}
        style={{
          display: 'block',
      fontSize: '0.75rem',
      lineHeight: '1rem',
          fontWeight: '600',
          color: colors.neutral[700],
          marginBottom: spacing.xs,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {label}
        {required && <span style={{ color: colors.semantic.error, marginLeft: '4px' }}>*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={typeof value === 'string' ? value : ''}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        className="w-full transition-all focus:outline-none"
        style={{
          padding: `${spacing.sm} ${spacing.md}`,
          borderRadius: borderRadius.md,
          fontSize: '0.875rem',
          lineHeight: '1.25rem',
          border: `1px solid ${error ? colors.semantic.error : colors.neutral[200]}`,
          backgroundColor: disabled ? colors.neutral[50] : 'white',
          color: colors.neutral[900],
          boxShadow: error ? `0 0 0 3px rgba(239, 68, 68, 0.1)` : 'none',
          transition: 'all 0.2s ease',
        }}
        onFocus={(e) => {
          if (!error) {
            e.currentTarget.style.borderColor = colors.primary.green;
            e.currentTarget.style.boxShadow = `0 0 0 3px rgba(68, 138, 51, 0.1)`;
          }
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = 'none';
          if (!error) {
            e.currentTarget.style.borderColor = colors.neutral[200];
          }
        }}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && (
        <p
          id={`${name}-error`}
          style={{
            fontSize: '0.8125rem',
            lineHeight: '1.125rem',
            color: colors.semantic.error,
            marginTop: spacing.xs,
            fontWeight: '500',
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
