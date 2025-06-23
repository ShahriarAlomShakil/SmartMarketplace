import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'elevated' | 'minimal';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variants = {
  default: 'bg-white/15 border-white/25 focus:bg-white/20 focus:border-white/40 backdrop-blur-xl',
  elevated: 'bg-white/20 border-white/35 focus:bg-white/25 focus:border-white/50 shadow-modern backdrop-blur-xl',
  minimal: 'bg-white/10 border-white/15 focus:bg-white/15 focus:border-white/35 backdrop-blur-lg'
};

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ 
    className,
    label,
    error,
    helperText,
    variant = 'default',
    leftIcon,
    rightIcon,
    type = 'text',
    ...props
  }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-white/90">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60">
              {leftIcon}
            </div>
          )}
          
          <input
            type={type}
            className={cn(
              'w-full border rounded-xl px-4 py-3 transition-all duration-300',
              'text-white placeholder-white/65 focus:outline-none focus:ring-2 focus:ring-white/25',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              variants[variant],
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-red-400/50 focus:border-red-400/70 focus:ring-red-400/25',
              className
            )}
            ref={ref}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-300 text-sm flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="text-white/60 text-sm">{helperText}</p>
        )}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';

// Textarea variant
export const GlassTextarea = forwardRef<HTMLTextAreaElement, 
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'variant'> & {
    label?: string;
    error?: string;
    helperText?: string;
    variant?: 'default' | 'elevated' | 'minimal';
  }
>(({ 
  className,
  label,
  error,
  helperText,
  variant = 'default',
  rows = 4,
  ...props
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-white/90">
          {label}
        </label>
      )}
      
      <textarea
        rows={rows}
        className={cn(
          'w-full border rounded-xl px-4 py-3 transition-all duration-300 resize-none',
          'text-white placeholder-white/65 focus:outline-none focus:ring-2 focus:ring-white/25',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          error && 'border-red-400/50 focus:border-red-400/70 focus:ring-red-400/25',
          className
        )}
        ref={ref}
        {...props}
      />

      {error && (
        <p className="text-red-300 text-sm flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="text-white/60 text-sm">{helperText}</p>
      )}
    </div>
  );
});

GlassTextarea.displayName = 'GlassTextarea';

export default GlassInput;
