import React from 'react';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Checkbox } from '@/src/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string | boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: boolean } }) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  className?: string;
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
  autoComplete,
  className
}: InputFieldProps) {
  const isCheckbox = type === 'checkbox';

  if (isCheckbox) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Checkbox
          id={name}
          name={name}
          checked={typeof value === 'boolean' ? value : false}
          onCheckedChange={(checked) => {
            // Adapt Shadcn onCheckedChange to legacy onChange signature
            onChange({ target: { name, value: checked === true } });
          }}
          disabled={disabled}
        />
        <Label
          htmlFor={name}
          className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>
    );
  }

  return (
    <div className={cn("mb-4", className)}>
      <Label
        htmlFor={name}
        className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={typeof value === 'string' ? value : ''}
        onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        className={cn(
          "transition-all",
          error ? "border-red-500 focus-visible:ring-red-500" : ""
        )}
      />
      {error && (
        <p className="text-[0.8rem] font-medium text-red-500 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
