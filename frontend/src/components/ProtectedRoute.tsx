import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { GlassLoading } from './ui/GlassLoading';
import { BlurCard } from './ui/BlurCard';
import { ModernButton } from './ui/ModernButton';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  fallback?: ReactNode;
}

/**
 * ProtectedRoute - Wrapper component for protecting routes that require authentication
 * 
 * Features:
 * - Authentication check with loading states
 * - Automatic redirection for unauthorized users
 * - Custom fallback components
 * - Modern design with blur backgrounds
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/login',
  fallback
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BlurCard variant="elevated" className="p-8 text-center">
          <GlassLoading size="lg" />
          <p className="text-white/80 mt-4">Checking authentication...</p>
        </BlurCard>
      </div>
    );
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center">
        <BlurCard variant="elevated" className="p-8 text-center max-w-md">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Authentication Required
            </h2>
            <p className="text-white/70">
              You need to be logged in to access this page.
            </p>
          </div>

          <div className="space-y-3">
            <ModernButton
              variant="primary"
              fullWidth
              onClick={() => router.push(redirectTo)}
            >
              Sign In
            </ModernButton>
            <ModernButton
              variant="ghost"
              fullWidth
              onClick={() => router.push('/')}
            >
              Go Home
            </ModernButton>
          </div>
        </BlurCard>
      </div>
    );
  }

  // If user is logged in but shouldn't be (e.g., login page when already authenticated)
  if (!requireAuth && user) {
    router.push('/dashboard');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BlurCard variant="elevated" className="p-8 text-center">
          <GlassLoading size="lg" />
          <p className="text-white/80 mt-4">Redirecting...</p>
        </BlurCard>
      </div>
    );
  }

  return <>{children}</>;
};
