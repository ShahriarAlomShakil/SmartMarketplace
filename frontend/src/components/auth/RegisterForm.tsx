import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { BlurCard } from '../ui/BlurCard';
import { ModernInput } from '../ui/ModernInput';
import { ModernButton } from '../ui/ModernButton';
import { ErrorAlert } from '../ui/ErrorHandling';
import { SocialLoginButtons } from './SocialLoginButtons';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { RegisterData } from '../../../../shared/types/User';
import { useFormValidation } from '../../hooks/useFormValidation';
import { authValidationSchemas, validationRules } from '../../utils/validation';

interface RegisterFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  className?: string;
}

/**
 * RegisterForm - Modern registration form with blur background and validation
 * 
 * Features:
 * - Clean layout with backdrop blur effects
 * - Comprehensive form validation
 * - Password strength indicator
 * - Social registration integration
 * - Terms and conditions acceptance
 * - Real-time validation feedback
 */
export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  redirectTo = '/dashboard',
  className
}) => {
  const { register, loading, error, clearError } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    acceptTerms: false
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);

  // Enhanced validation schema with confirm password
  const validationSchema = {
    ...authValidationSchemas.register,
    confirmPassword: {
      required: true,
      requiredMessage: 'Please confirm your password',
      rules: [validationRules.matchField(formData.password, 'password')]
    }
  };

  const {
    errors: fieldErrors,
    validateField,
    validateForm,
    isFormValid,
    clearFieldError
  } = useFormValidation(validationSchema);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: fieldValue }));
    }
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      clearFieldError(name);
    }
    
    // Validate field on change
    validateField(name, fieldValue);
    
    // Clear general error
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create complete form data including confirm password
    const completeFormData = {
      ...formData,
      confirmPassword
    };
    
    // Validate all fields
    if (!isFormValid(completeFormData)) {
      return;
    }

    const success = await register(formData);
    if (success) {
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(redirectTo);
      }
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`${provider} registration clicked`);
    // Implement social registration logic
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <BlurCard variant="elevated" className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-white/70">Join us and start your journey</p>
        </div>

        {/* Error Alert */}
        {error && (
          <ErrorAlert
            message={error}
            onClose={clearError}
            className="mb-6"
          />
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <ModernInput
              type="text"
              name="firstName"
              label="First Name"
              value={formData.firstName || ''}
              onChange={handleInputChange}
              error={fieldErrors.firstName}
              placeholder="John"
              disabled={loading}
            />
            <ModernInput
              type="text"
              name="lastName"
              label="Last Name"
              value={formData.lastName || ''}
              onChange={handleInputChange}
              error={fieldErrors.lastName}
              placeholder="Doe"
              disabled={loading}
            />
          </div>

          <ModernInput
            type="text"
            name="username"
            label="Username"
            value={formData.username}
            onChange={handleInputChange}
            error={fieldErrors.username}
            placeholder="johndoe"
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            disabled={loading}
          />

          <ModernInput
            type="email"
            name="email"
            label="Email Address"
            value={formData.email}
            onChange={handleInputChange}
            error={fieldErrors.email}
            placeholder="john@example.com"
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            }
            disabled={loading}
          />

          <div className="space-y-2">
            <ModernInput
              type="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleInputChange}
              onFocus={() => setShowPasswordStrength(true)}
              error={fieldErrors.password}
              placeholder="Create a strong password"
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
              disabled={loading}
            />
            
            {showPasswordStrength && (
              <PasswordStrengthIndicator password={formData.password} />
            )}
          </div>

          <ModernInput
            type="password"
            name="confirmPassword"
            label="Confirm Password"
            value={confirmPassword}
            onChange={handleInputChange}
            error={fieldErrors.confirmPassword}
            placeholder="Confirm your password"
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            disabled={loading}
          />

          {/* Terms and Conditions */}
          <div className="space-y-2">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleInputChange}
                className="w-4 h-4 mt-1 bg-white/10 border border-white/30 rounded focus:ring-2 focus:ring-white/25"
                disabled={loading}
              />
              <span className="text-sm text-white/70 leading-5">
                I agree to the{' '}
                <Link href="/terms" className="text-blue-300 hover:text-blue-200 transition-colors">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-blue-300 hover:text-blue-200 transition-colors">
                  Privacy Policy
                </Link>
              </span>
            </label>
            {fieldErrors.acceptTerms && (
              <p className="text-red-300 text-sm">{fieldErrors.acceptTerms}</p>
            )}
          </div>

          <ModernButton
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </ModernButton>
        </form>

        {/* Social Registration */}
        <SocialLoginButtons
          onGoogleLogin={() => handleSocialLogin('Google')}
          onFacebookLogin={() => handleSocialLogin('Facebook')}
          onAppleLogin={() => handleSocialLogin('Apple')}
          loading={loading}
          className="mt-6"
        />

        {/* Sign In Link */}
        <div className="text-center mt-8">
          <p className="text-white/70">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-300 hover:text-blue-200 transition-colors font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </BlurCard>
    </div>
  );
};
