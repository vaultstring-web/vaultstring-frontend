export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const validators = {
  email: (email: string): string | null => {
    if (!email.trim()) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  password: (password: string): string | null => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain lowercase letters';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain uppercase letters';
    }
    if (!/\d/.test(password)) {
      return 'Password must contain numbers';
    }
    if (!/[@$!%*?&]/.test(password)) {
      return 'Password must contain special characters (@$!%*?&)';
    }
    return null;
  },

  confirmPassword: (confirmPassword: string, password: string): string | null => {
    if (!confirmPassword) {
      return 'Please confirm your password';
    }
    if (confirmPassword !== password) {
      return 'Passwords do not match';
    }
    return null;
  },

  required: (value: string, fieldName: string): string | null => {
    if (!value.trim()) {
      return `${fieldName} is required`;
    }
    return null;
  }
};

export const getPasswordStrength = (password: string): {
  strength: 'weak' | 'fair' | 'good' | 'strong';
  score: number;
} => {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;

  if (score <= 2) return { strength: 'weak', score };
  if (score <= 3) return { strength: 'fair', score };
  if (score <= 4) return { strength: 'good', score };
  return { strength: 'strong', score };
};
