import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BlurIntensity, ButtonSize, ButtonVariant, CardVariant } from '../types/ui';

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get blur intensity class
 */
export function getBlurClass(intensity: BlurIntensity = 'md'): string {
  const blurMap: Record<BlurIntensity, string> = {
    xs: 'backdrop-blur-xs',
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
    '2xl': 'backdrop-blur-2xl',
    '3xl': 'backdrop-blur-3xl',
  };
  return blurMap[intensity];
}

/**
 * Get button variant classes with modern blurry design
 */
export function getButtonVariantClass(variant: ButtonVariant = 'primary'): string {
  const variants: Record<ButtonVariant, string> = {
    primary: cn(
      'bg-white/25 hover:bg-white/35 text-white',
      'border-white/35 hover:border-white/45',
      'backdrop-blur-xl shadow-modern hover:shadow-modern-lg'
    ),
    secondary: cn(
      'bg-white/15 hover:bg-white/25 text-white',
      'border-white/25 hover:border-white/35',
      'backdrop-blur-xl'
    ),
    outline: cn(
      'bg-white/5 hover:bg-white/15 text-white',
      'border-white/20 hover:border-white/30',
      'backdrop-blur-lg'
    ),
    ghost: cn(
      'bg-transparent hover:bg-white/10 text-white',
      'border-transparent hover:border-white/15',
      'backdrop-blur-md'
    ),
    destructive: cn(
      'bg-red-500/25 hover:bg-red-500/35 text-white',
      'border-red-300/35 hover:border-red-300/45',
      'backdrop-blur-xl'
    ),
  };
  return variants[variant];
}

/**
 * Get button size classes with modern spacing
 */
export function getButtonSizeClass(size: ButtonSize = 'md'): string {
  const sizes: Record<ButtonSize, string> = {
    sm: 'px-5 py-2.5 text-sm',
    md: 'px-7 py-4 text-base',
    lg: 'px-9 py-5 text-lg',
    xl: 'px-11 py-6 text-xl',
  };
  return sizes[size];
}

/**
 * Get card variant classes with modern design
 */
export function getCardVariantClass(variant: CardVariant = 'default'): string {
  const variants: Record<CardVariant, string> = {
    default: 'blur-card',
    elevated: cn(
      'blur-card shadow-modern-lg hover:shadow-modern-lg',
      'border-white/25 hover:border-white/35'
    ),
    outlined: cn(
      'bg-transparent border-2 border-white/20',
      'hover:border-white/35 hover:bg-white/10 backdrop-blur-lg'
    ),
    filled: cn(
      'bg-white/20 border border-white/25 backdrop-blur-xl',
      'hover:bg-white/20 hover:border-white/30'
    ),
  };
  return variants[variant];
}

/**
 * Generate responsive padding classes
 */
export function getResponsivePadding(
  padding: 'none' | 'sm' | 'md' | 'lg' | 'xl' = 'md'
): string {
  const paddingMap = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-10',
  };
  return paddingMap[padding];
}

/**
 * Generate modern blur effect classes
 */
export function getModernEffect(intensity: 'light' | 'medium' | 'strong' = 'medium'): string {
  const effects = {
    light: 'bg-white/10 backdrop-blur-lg border-white/15',
    medium: 'bg-white/15 backdrop-blur-xl border-white/25',
    strong: 'bg-white/25 backdrop-blur-2xl border-white/35',
  };
  return effects[intensity];
}

// Backward compatibility
export const getGlassEffect = getModernEffect;

/**
 * Generate animation delay class
 */
export function getAnimationDelay(index: number, baseDelay: number = 100): string {
  return `delay-${Math.min(index * baseDelay, 1000)}`;
}

/**
 * Get text gradient classes
 */
export function getTextGradient(variant: 'primary' | 'secondary' | 'accent' = 'primary'): string {
  const gradients = {
    primary: 'bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent',
    secondary: 'bg-gradient-to-r from-pink-400 to-red-500 bg-clip-text text-transparent',
    accent: 'bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent',
  };
  return gradients[variant];
}

/**
 * Get focus ring classes
 */
export function getFocusRing(color: 'primary' | 'secondary' | 'accent' = 'primary'): string {
  const rings = {
    primary: 'focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2',
    secondary: 'focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2',
    accent: 'focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2',
  };
  return rings[color];
}

/**
 * Get hover lift effect
 */
export function getHoverLift(intensity: 'sm' | 'md' | 'lg' = 'md'): string {
  const lifts = {
    sm: 'hover:transform hover:-translate-y-1 transition-transform duration-200',
    md: 'hover:transform hover:-translate-y-2 transition-transform duration-300',
    lg: 'hover:transform hover:-translate-y-4 transition-transform duration-300',
  };
  return lifts[intensity];
}

/**
 * Get loading state classes
 */
export function getLoadingClasses(): string {
  return 'opacity-70 cursor-not-allowed pointer-events-none';
}

/**
 * Get disabled state classes
 */
export function getDisabledClasses(): string {
  return 'opacity-50 cursor-not-allowed pointer-events-none';
}

/**
 * Generate shadow based on elevation
 */
export function getElevationShadow(elevation: 1 | 2 | 3 | 4 | 5 = 1): string {
  const shadows = {
    1: 'shadow-sm',
    2: 'shadow-md',
    3: 'shadow-lg',
    4: 'shadow-xl',
    5: 'shadow-2xl',
  };
  return shadows[elevation];
}

/**
 * Get border radius classes
 */
export function getBorderRadius(size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md'): string {
  const radii = {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    full: 'rounded-full',
  };
  return radii[size];
}

/**
 * Format component props for accessibility
 */
export function formatAriaProps(props: Record<string, any>): Record<string, any> {
  const ariaProps: Record<string, any> = {};
  
  Object.keys(props).forEach((key) => {
    if (key.startsWith('aria-') || key === 'role' || key === 'tabIndex') {
      ariaProps[key] = props[key];
    }
  });
  
  return ariaProps;
}

/**
 * Generate responsive text classes
 */
export function getResponsiveText(
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' = 'md'
): string {
  const sizes = {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    md: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
    '2xl': 'text-2xl sm:text-3xl',
    '3xl': 'text-3xl sm:text-4xl lg:text-5xl',
  };
  return sizes[size];
}

/**
 * Color utilities
 */
export const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  glass: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.2)',
    strong: 'rgba(255, 255, 255, 0.3)',
  },
};

/**
 * Timing functions for animations
 */
export const easings = {
  easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};
