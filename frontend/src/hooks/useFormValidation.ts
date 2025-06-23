import React from 'react';
import { FormValidationSchema, FormErrors, ValidationRule } from '../utils/validation';

/**
 * Form validation hook with smooth error animations
 * 
 * Features:
 * - Real-time validation feedback
 * - Field-level and form-level validation
 * - Touch state management
 * - Error clearing functionality
 * - Type-safe validation
 */

export const useFormValidation = (schema: FormValidationSchema) => {
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const validateField = (fieldName: string, value: any): string => {
    const fieldSchema = schema[fieldName];
    if (!fieldSchema) return '';

    // Check required
    if (fieldSchema.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return fieldSchema.requiredMessage || `${fieldName} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return '';
    }

    // Check validation rules
    for (const rule of fieldSchema.rules) {
      if (!rule.test(value)) {
        return rule.message;
      }
    }

    return '';
  };

  const validateForm = (formData: Record<string, any>): FormErrors => {
    const newErrors: FormErrors = {};
    
    Object.keys(schema).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    return newErrors;
  };

  const validateSingleField = (fieldName: string, value: any) => {
    const error = validateField(fieldName, value);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
    return error === '';
  };

  const setFieldTouched = (fieldName: string, isTouched: boolean = true) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: isTouched
    }));
  };

  const clearFieldError = (fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const clearAllErrors = () => {
    setErrors({});
    setTouched({});
  };

  const isFieldValid = (fieldName: string) => {
    return !errors[fieldName] && touched[fieldName];
  };

  const isFormValid = (formData: Record<string, any>) => {
    const formErrors = validateForm(formData);
    return Object.keys(formErrors).length === 0;
  };

  return {
    errors,
    touched,
    validateField: validateSingleField,
    validateForm,
    setFieldTouched,
    clearFieldError,
    clearAllErrors,
    isFieldValid,
    isFormValid,
    setErrors
  };
};

/**
 * Real-time field validation hook
 * For individual field validation with debouncing
 */
export const useFieldValidation = (
  rules: ValidationRule[], 
  required: boolean = false,
  debounceMs: number = 300
) => {
  const [value, setValue] = React.useState('');
  const [error, setError] = React.useState('');
  const [touched, setTouched] = React.useState(false);
  const [isValidating, setIsValidating] = React.useState(false);

  const validateValue = React.useCallback((val: any) => {
    if (required && (!val || (typeof val === 'string' && val.trim() === ''))) {
      return 'This field is required';
    }

    if (!val || (typeof val === 'string' && val.trim() === '')) {
      return '';
    }

    for (const rule of rules) {
      if (!rule.test(val)) {
        return rule.message;
      }
    }

    return '';
  }, [rules, required]);

  const debouncedValidate = React.useMemo(
    () => {
      const timeoutRef = { current: null as NodeJS.Timeout | null };
      
      return (val: any) => {
        setIsValidating(true);
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          const errorMessage = validateValue(val);
          setError(errorMessage);
          setIsValidating(false);
        }, debounceMs);
      };
    },
    [validateValue, debounceMs]
  );

  const handleChange = (newValue: any) => {
    setValue(newValue);
    if (touched) {
      debouncedValidate(newValue);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    const errorMessage = validateValue(value);
    setError(errorMessage);
    setIsValidating(false);
  };

  const clearError = () => {
    setError('');
  };

  const reset = () => {
    setValue('');
    setError('');
    setTouched(false);
    setIsValidating(false);
  };

  return {
    value,
    error,
    touched,
    isValidating,
    isValid: !error && touched,
    handleChange,
    handleBlur,
    clearError,
    reset,
    setValue
  };
};
