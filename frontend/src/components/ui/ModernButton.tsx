import React, { forwardRef } from 'react';
import { ButtonProps } from '../../types/ui';
import { cn, getButtonVariantClass, getButtonSizeClass, getFocusRing, getLoadingClasses, getDisabledClasses } from '../../utils/design';

/**
 * ModernButton - A modern button component with smooth hover effects and state transitions
 * 
 * Features:
 * - Multiple variants (primary, secondary, outline, ghost, destructive)
 * - Different sizes (sm, md, lg, xl)
 * - Loading state with spinner
 * - Left and right icons
 * - Full width option
 * - Accessibility support
 */
export const ModernButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className,
    children,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base button styles
          'modern-button',
          'inline-flex items-center justify-center',
          'font-medium rounded-xl',
          'transition-all duration-300 ease-out',
          'focus:outline-none',
          
          // Variant styles
          getButtonVariantClass(variant),
          
          // Size styles
          getButtonSizeClass(size),
          
          // Focus ring
          getFocusRing('primary'),
          
          // Full width
          fullWidth && 'w-full',
          
          // State styles
          loading && getLoadingClasses(),
          disabled && getDisabledClasses(),
          
          // Hover and active states
          !isDisabled && [
            'hover:transform hover:-translate-y-1',
            'active:transform active:translate-y-0',
            'hover:shadow-lg',
          ],
          
          className
        )}
        {...props}
      >
        {/* Left icon */}
        {leftIcon && !loading && (
          <span className="mr-2 -ml-1 flex-shrink-0">
            {leftIcon}
          </span>
        )}
        
        {/* Loading spinner */}
        {loading && (
          <span className="mr-2 -ml-1 flex-shrink-0">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        )}
        
        {/* Button text */}
        <span className={cn('flex-1', (leftIcon || loading || rightIcon) && 'text-center')}>
          {children}
        </span>
        
        {/* Right icon */}
        {rightIcon && !loading && (
          <span className="ml-2 -mr-1 flex-shrink-0">
            {rightIcon}
          </span>
        )}
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 -top-px rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </button>
    );
  }
);

ModernButton.displayName = 'ModernButton';

export default ModernButton;

// Backward compatibility alias
export { ModernButton as GlassButton };
