import React, { forwardRef } from 'react';
import { BackdropBlurProps } from '../../types/ui';
import { cn, getBlurClass } from '../../utils/design';

/**
 * BackdropBlur - A wrapper component with configurable blur intensity
 * 
 * Features:
 * - Configurable blur intensity (xs to 3xl)
 * - Optional background overlay
 * - Optional border
 * - Responsive design
 * - Accessibility support
 */
export const BackdropBlur = forwardRef<HTMLDivElement, BackdropBlurProps>(
  ({
    intensity = 'md',
    background = true,
    border = true,
    className,
    children,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base backdrop blur
          getBlurClass(intensity),
          
          // Background overlay
          background && 'bg-white/8 dark:bg-white/4',
          
          // Border
          border && 'border border-white/12 dark:border-white/8',
          
          // Base styling
          'relative',
          'rounded-2xl',
          'transition-all duration-300 ease-out',
          
          className
        )}
        {...props}
      >
        {/* Subtle gradient overlay */}
        {background && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl pointer-events-none" />
        )}
        
        {/* Content wrapper */}
        <div className="relative z-10">
          {children}
        </div>
        
        {/* Optional glass reflection effect */}
        {border && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent via-white/3 to-white/8 pointer-events-none" />
        )}
      </div>
    );
  }
);

BackdropBlur.displayName = 'BackdropBlur';

/**
 * FullscreenBackdrop - A full-screen backdrop blur component for modals and overlays
 */
export const FullscreenBackdrop = forwardRef<HTMLDivElement, {
  children: React.ReactNode;
  className?: string;
  intensity?: BackdropBlurProps['intensity'];
  onClick?: () => void;
}>(({ children, className, intensity = 'xl', onClick }, ref) => {
  return (
    <div 
      ref={ref}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClick}
    >
      <BackdropBlur
        intensity={intensity}
        background={true}
        border={false}
        className={cn('absolute inset-0 bg-black/20', className)}
      >
        <></>
      </BackdropBlur>
      <div 
        className="relative z-10 w-full max-w-md mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
});

FullscreenBackdrop.displayName = 'FullscreenBackdrop';

export default BackdropBlur;
