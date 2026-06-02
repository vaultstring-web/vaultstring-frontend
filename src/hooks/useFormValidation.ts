import { useState } from 'react';

export interface FormErrors {
  [key: string]: string;
}

export interface FormState {
  values: Record<string, string | boolean>;
  errors: FormErrors;
  isSubmitting: boolean;
}

export type ValidationSchema = {
  [key: string]: (value: any) => string | null;
};

export function useFormValidation(
  initialValues: Record<string, string | boolean>,
  onSubmit: (values: Record<string, string | boolean>) => Promise<void>,
  validationSchema?: ValidationSchema
) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name: string, value: any): string | null => {
    if (validationSchema && validationSchema[name]) {
      return validationSchema[name](value);
    }
    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (validationSchema) {
      Object.keys(validationSchema).forEach((fieldName) => {
        const error = validateField(fieldName, values[fieldName]);
        if (error) {
          newErrors[fieldName] = error;
        }
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setValues(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Real-time validation
    const error = validateField(name, newValue);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const setFieldError = (name: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFieldError,
    resetForm,
    setValues
  };
}
