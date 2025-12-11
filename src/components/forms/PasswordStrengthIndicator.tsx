import React from 'react';
import { getPasswordStrength } from '@/src/lib/utils/validation';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const { strength, score } = getPasswordStrength(password);

  const strengthConfig = {
    weak: { color: 'bg-red-500', label: 'Weak', textColor: 'text-red-500' },
    fair: { color: 'bg-yellow-500', label: 'Fair', textColor: 'text-yellow-500' },
    good: { color: 'bg-blue-500', label: 'Good', textColor: 'text-blue-500' },
    strong: { color: 'bg-green-500', label: 'Strong', textColor: 'text-green-500' }
  };

  const config = strengthConfig[strength];

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${config.color} transition-all`}
            style={{ width: `${(score / 6) * 100}%` }}
          />
        </div>
        <span className={`text-sm font-medium ${config.textColor}`}>
          {config.label}
        </span>
      </div>
      <ul className="text-xs text-gray-600 space-y-1">
        <li>✓ At least 8 characters</li>
        <li>✓ Uppercase and lowercase letters</li>
        <li>✓ Numbers and special characters (@$!%*?&)</li>
      </ul>
    </div>
  );
}
