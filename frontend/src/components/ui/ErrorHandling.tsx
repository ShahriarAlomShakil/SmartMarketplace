import React from 'react';
import { ModernAlert } from './ModernAlert';
import { BlurCard } from './BlurCard';
import { ModernButton } from './ModernButton';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

/**
 * Modern Error Boundary with blur backgrounds and recovery options
 * 
 * Features:
 * - Catches JavaScript errors in component tree
 * - Modern UI with blur backgrounds
 * - Error reporting and recovery
 * - Customizable fallback components
 * - Development vs production error display
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error!}
          resetError={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Default Error Fallback Component
 */
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <BlurCard variant="elevated" className="p-8 max-w-lg w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-white/70">
            {isDevelopment 
              ? 'An error occurred while rendering this component.' 
              : 'We encountered an unexpected error. Please try again.'
            }
          </p>
        </div>

        {isDevelopment && (
          <div className="mb-6 text-left">
            <details className="bg-black/20 rounded-lg p-4 border border-white/10">
              <summary className="cursor-pointer text-white/80 font-medium mb-2">
                Error Details
              </summary>
              <div className="text-sm text-red-300 font-mono">
                <p className="mb-2"><strong>Error:</strong> {error.message}</p>
                <p><strong>Stack:</strong></p>
                <pre className="whitespace-pre-wrap text-xs mt-1 text-red-200">
                  {error.stack}
                </pre>
              </div>
            </details>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <ModernButton
            variant="primary"
            onClick={resetError}
            className="flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Try Again</span>
          </ModernButton>
          
          <ModernButton
            variant="outline"
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span>Reload Page</span>
          </ModernButton>
        </div>
      </BlurCard>
    </div>
  );
};

/**
 * Error Alert Component for form errors and API errors
 */
interface ErrorAlertProps {
  title?: string;
  message: string;
  details?: string[];
  onClose?: () => void;
  onRetry?: () => void;
  className?: string;
  variant?: 'error' | 'warning';
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title = 'Error',
  message,
  details,
  onClose,
  onRetry,
  className,
  variant = 'error'
}) => {
  const actions = onRetry ? [
    {
      label: 'Try Again',
      onClick: onRetry,
      variant: 'outline' as const
    }
  ] : undefined;

  return (
    <div className={className}>
      <ModernAlert
        type={variant}
        title={title}
        message={message}
        onClose={onClose}
        actions={actions}
      />
      {details && details.length > 0 && (
        <div className="mt-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-4">
          <p className="text-sm font-medium mb-2 text-white/80">Details:</p>
          <ul className="text-sm space-y-1">
            {details.map((detail, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-red-300">•</span>
                <span className="text-white/70">{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/**
 * Field Error Component for form field validation errors
 */
interface FieldErrorProps {
  message?: string;
  className?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({ message, className }) => {
  if (!message) return null;

  return (
    <div 
      className={`flex items-center space-x-2 mt-1 animate-fadeIn ${className}`}
      role="alert"
    >
      <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-sm text-red-300">{message}</p>
    </div>
  );
};

/**
 * Loading Error Component for async operations
 */
interface LoadingErrorProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const LoadingError: React.FC<LoadingErrorProps> = ({
  message,
  onRetry,
  className
}) => {
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Failed to Load</h3>
      <p className="text-white/70 mb-4">{message}</p>
      {onRetry && (
        <ModernButton variant="primary" onClick={onRetry}>
          Try Again
        </ModernButton>
      )}
    </div>
  );
};

/**
 * Network Error Component
 */
export const NetworkError: React.FC<LoadingErrorProps> = (props) => (
  <LoadingError 
    {...props}
    message={props.message || "Unable to connect to the server. Please check your internet connection and try again."}
  />
);
