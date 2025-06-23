import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { BlurCard } from '../ui/BlurCard';
import { ModernInput } from '../ui/ModernInput';
import { ModernButton } from '../ui/ModernButton';
import { ErrorAlert } from '../ui/ErrorHandling';
import { SocialLoginButtons } from './SocialLoginButtons';
import { LoginCredentials } from '../../../../shared/types/User';
import { useFormValidation } from '../../hooks/useFormValidation';
import { authValidationSchemas } from '../../utils/validation';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  className?: string;
}

/**
 * LoginForm - Modern login form with blur background and smooth animations
 * 
 * Features:
 * - Modern card design with backdrop blur
 * - Form validation with real-time feedback
 * - Social login integration
 * - Loading states and error handling
 * - Smooth transitions and animations
 */
export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  redirectTo = '/dashboard',
  className
}) => {
  const { login, loading, error, clearError } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  
  const [rememberMe, setRememberMe] = useState(false);

  // Use the new validation system
  const {
    errors: fieldErrors,
    validateField,
    validateForm,
    isFormValid,
    clearFieldError
  } = useFormValidation(authValidationSchemas.login);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      clearFieldError(name);
    }
    
    // Validate field on change
    validateField(name, value);
    
    // Clear general error
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    if (!isFormValid(formData)) {
      return;
    }

    const success = await login(formData);
    if (success) {
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(redirectTo);
      }
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`${provider} login clicked`);
    // Implement social login logic
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <BlurCard variant="elevated" className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-white/70">Sign in to your account to continue</p>
        </div>

        {/* Error Alert */}
        {error && (
          <ErrorAlert
            message={error}
            onClose={clearError}
            className="mb-6"
          />
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <ModernInput
            type="email"
            name="email"
            label="Email Address"
            value={formData.email}
            onChange={handleInputChange}
            error={fieldErrors.email}
            placeholder="Enter your email"
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            }
            disabled={loading}
          />

          <ModernInput
            type="password"
            name="password"
            label="Password"
            value={formData.password}
            onChange={handleInputChange}
            error={fieldErrors.password}
            placeholder="Enter your password"
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
            disabled={loading}
          />

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 bg-white/10 border border-white/30 rounded focus:ring-2 focus:ring-white/25"
                disabled={loading}
              />
              <span className="text-sm text-white/70">Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-sm text-blue-300 hover:text-blue-200 transition-colors">
              Forgot password?
            </Link>
          </div>

          <ModernButton
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </ModernButton>
        </form>

        {/* Social Login */}
        <SocialLoginButtons
          onGoogleLogin={() => handleSocialLogin('Google')}
          onFacebookLogin={() => handleSocialLogin('Facebook')}
          onAppleLogin={() => handleSocialLogin('Apple')}
          loading={loading}
          className="mt-6"
        />

        {/* Sign Up Link */}
        <div className="text-center mt-8">
          <p className="text-white/70">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-300 hover:text-blue-200 transition-colors font-medium">
              Sign up here
            </Link>
          </p>
        </div>
      </BlurCard>
    </div>
  );
};
