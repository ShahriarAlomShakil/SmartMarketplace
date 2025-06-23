import React, { forwardRef } from 'react';
import { BlurCardProps } from '../../types/ui';
import { cn, getCardVariantClass, getResponsivePadding, getBlurClass } from '../../utils/design';

/**
 * BlurCard - A modern card component with subtle backdrop blur and clean borders
 * 
 * Features:
 * - Configurable blur intensity
 * - Multiple variants (default, elevated, outlined, filled)
 * - Responsive padding options
 * - Hover animations
 * - Accessibility support
 */
export const BlurCard = forwardRef<HTMLDivElement, BlurCardProps>(
  ({ 
    variant = 'default',
    blur = 'md',
    padding = 'md',
    hover = true,
    className,
    children,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base card styles
          getCardVariantClass(variant),
          getBlurClass(blur),
          getResponsivePadding(padding),
          
          // Hover effects
          hover && [
            'hover-lift',
            'hover:border-white/30',
            'hover:shadow-xl',
            'group',
          ],
          
          // Transitions
          'transition-all duration-300 ease-out',
          
          // Accessibility
          'focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2',
          
          className
        )}
        role="article"
        tabIndex={props.onClick ? 0 : undefined}
        {...props}
      >
        {/* Subtle top border highlight */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-60" />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
        
        {/* Hover glow effect */}
        {hover && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
        )}
      </div>
    );
  }
);

BlurCard.displayName = 'BlurCard';

export default BlurCard;
