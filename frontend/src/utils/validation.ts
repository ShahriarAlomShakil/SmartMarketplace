// Form validation types
export interface ValidationRule {
  test: (value: any) => boolean;
  message: string;
}

export interface FieldValidation {
  rules: ValidationRule[];
  required?: boolean;
  requiredMessage?: string;
}

export interface FormValidationSchema {
  [key: string]: FieldValidation;
}

export interface FormErrors {
  [key: string]: string;
}

/**
 * Form validation utilities with smooth error animations
 * 
 * Features:
 * - Flexible rule-based validation
 * - Real-time validation feedback
 * - Custom validation messages
 * - Type-safe validation schemas
 * - Smooth error animations
 */

// Pre-defined validation rules
export const validationRules = {
  email: {
    test: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Please enter a valid email address'
  },
  
  minLength: (min: number) => ({
    test: (value: string) => value.length >= min,
    message: `Must be at least ${min} characters long`
  }),
  
  maxLength: (max: number) => ({
    test: (value: string) => value.length <= max,
    message: `Must be no more than ${max} characters long`
  }),
  
  strongPassword: {
    test: (value: string) => {
      return (
        value.length >= 8 &&
        /[A-Z]/.test(value) &&
        /[a-z]/.test(value) &&
        /\d/.test(value) &&
        /[!@#$%^&*(),.?":{}|<>]/.test(value)
      );
    },
    message: 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character'
  },
  
  username: {
    test: (value: string) => /^[a-zA-Z0-9_]{3,20}$/.test(value),
    message: 'Username must be 3-20 characters and contain only letters, numbers, and underscores'
  },
  
  phone: {
    test: (value: string) => /^\+?[\d\s-()]{10,}$/.test(value),
    message: 'Please enter a valid phone number'
  },
  
  url: {
    test: (value: string) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message: 'Please enter a valid URL'
  },
  
  positiveNumber: {
    test: (value: number) => value > 0,
    message: 'Must be a positive number'
  },
  
  range: (min: number, max: number) => ({
    test: (value: number) => value >= min && value <= max,
    message: `Must be between ${min} and ${max}`
  }),
  
  matchField: (compareValue: any, fieldName: string = 'field') => ({
    test: (value: any) => value === compareValue,
    message: `Must match ${fieldName}`
  }),
  
  fileSize: (maxSizeMB: number) => ({
    test: (file: File) => file.size <= maxSizeMB * 1024 * 1024,
    message: `File size must be less than ${maxSizeMB}MB`
  }),
  
  fileType: (allowedTypes: string[]) => ({
    test: (file: File) => allowedTypes.includes(file.type),
    message: `File type must be one of: ${allowedTypes.join(', ')}`
  })
};

// Common validation schemas
export const authValidationSchemas = {
  login: {
    email: {
      required: true,
      requiredMessage: 'Email is required',
      rules: [validationRules.email]
    },
    password: {
      required: true,
      requiredMessage: 'Password is required',
      rules: [validationRules.minLength(6)]
    }
  },
  
  register: {
    username: {
      required: true,
      requiredMessage: 'Username is required',
      rules: [validationRules.username]
    },
    email: {
      required: true,
      requiredMessage: 'Email is required',
      rules: [validationRules.email]
    },
    password: {
      required: true,
      requiredMessage: 'Password is required',
      rules: [validationRules.strongPassword]
    },
    firstName: {
      required: true,
      requiredMessage: 'First name is required',
      rules: [validationRules.minLength(1), validationRules.maxLength(50)]
    },
    lastName: {
      required: false,
      rules: [validationRules.maxLength(50)]
    },
    acceptTerms: {
      required: true,
      requiredMessage: 'You must accept the terms and conditions',
      rules: [{
        test: (value: boolean) => value === true,
        message: 'You must accept the terms and conditions'
      }]
    }
  },
  
  profile: {
    firstName: {
      required: true,
      requiredMessage: 'First name is required',
      rules: [validationRules.minLength(1), validationRules.maxLength(50)]
    },
    lastName: {
      required: false,
      rules: [validationRules.maxLength(50)]
    },
    bio: {
      required: false,
      rules: [validationRules.maxLength(500)]
    },
    phone: {
      required: false,
      rules: [validationRules.phone]
    },
    website: {
      required: false,
      rules: [validationRules.url]
    }
  },
  
  changePassword: {
    currentPassword: {
      required: true,
      requiredMessage: 'Current password is required',
      rules: [validationRules.minLength(1)]
    },
    newPassword: {
      required: true,
      requiredMessage: 'New password is required',
      rules: [validationRules.strongPassword]
    },
    confirmPassword: {
      required: true,
      requiredMessage: 'Please confirm your new password',
      rules: [] // Will be set dynamically with matchField
    }
  }
};
