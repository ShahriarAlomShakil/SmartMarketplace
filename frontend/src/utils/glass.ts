import { cn } from './cn';

// Modern blurry design utility functions
export const modernStyles = {
  // Base modern effects with enhanced blur
  light: 'bg-white/15 backdrop-blur-xl border border-white/25',
  medium: 'bg-white/20 backdrop-blur-2xl border border-white/30',
  heavy: 'bg-white/25 backdrop-blur-3xl border border-white/40',
  
  // Modern variants with improved aesthetics
  primary: 'bg-primary-500/25 backdrop-blur-xl border border-primary-300/35',
  secondary: 'bg-secondary-500/25 backdrop-blur-xl border border-secondary-300/35',
  success: 'bg-green-500/25 backdrop-blur-xl border border-green-300/35',
  warning: 'bg-yellow-500/25 backdrop-blur-xl border border-yellow-300/35',
  error: 'bg-red-500/25 backdrop-blur-xl border border-red-300/35',
  
  // Interactive states with enhanced responsiveness
  hover: 'hover:bg-white/30 hover:border-white/45 hover:shadow-modern-lg hover:-translate-y-2',
  focus: 'focus:bg-white/30 focus:border-white/45 focus:ring-2 focus:ring-white/25',
  active: 'active:scale-96 active:bg-white/35',
  
  // Animations with enhanced timing
  transition: 'transition-all duration-300 ease-out',
  float: 'animate-float',
  pulse: 'animate-pulse-glow',
  shimmer: 'animate-modern-shimmer'
};

// Create modern component with utilities
export const createModernComponent = (
  baseClasses: string,
  variant: keyof typeof modernStyles = 'light',
  interactive: boolean = true
) => {
  return cn(
    baseClasses,
    modernStyles[variant],
    interactive && modernStyles.hover,
    interactive && modernStyles.focus,
    interactive && modernStyles.active,
    modernStyles.transition
  );
};

// Animation utilities
export const animations = {
  // Entrance animations
  fadeIn: 'animate-fade-in',
  slideInFromTop: 'animate-slide-in-from-top',
  slideInFromBottom: 'animate-slide-in-from-bottom',
  slideInFromLeft: 'animate-slide-in-from-left',
  slideInFromRight: 'animate-slide-in-from-right',
  zoomIn: 'animate-zoom-in',
  bounceIn: 'animate-bounce-in',
  
  // Continuous animations with enhanced effects
  float: 'animate-float',
  pulse: 'animate-pulse-glow',
  shimmer: 'animate-modern-shimmer',
  
  // Interaction animations with improved feedback
  hover: 'hover:scale-105 hover:-translate-y-2',
  tap: 'active:scale-96',
  focus: 'focus:ring-2 focus:ring-white/25'
};

// Color utilities for modern components
export const modernColors = {
  // Text colors optimized for blurry backgrounds
  text: {
    primary: 'text-white',
    secondary: 'text-white/95',
    muted: 'text-white/75',
    disabled: 'text-white/50'
  },
  
  // Border colors for modern components
  border: {
    light: 'border-white/25',
    medium: 'border-white/35',
    heavy: 'border-white/45',
    primary: 'border-primary-300/35',
    secondary: 'border-secondary-300/35'
  },
  
  // Background colors for modern components
  background: {
    light: 'bg-white/15',
    medium: 'bg-white/20',
    heavy: 'bg-white/25',
    primary: 'bg-primary-500/25',
    secondary: 'bg-secondary-500/25'
  }
};

// Backdrop blur utilities with enhanced blur levels
export const backdropBlur = {
  none: '',
  xs: 'backdrop-blur-xs',
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
  xl: 'backdrop-blur-xl',
  '2xl': 'backdrop-blur-2xl',
  '3xl': 'backdrop-blur-3xl'
};

// Shadow utilities for modern components
export const modernShadows = {
  none: '',
  sm: 'shadow-modern',
  md: 'shadow-modern-lg',
  lg: 'shadow-modern-lg',
  glow: 'shadow-glow',
  'glow-lg': 'shadow-glow-lg'
};

// Rounded corners optimized for modern design
export const modernRounded = {
  none: '',
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-3xl',
  full: 'rounded-full'
};

// Spacing utilities
export const modernSpacing = {
  xs: 'p-3',
  sm: 'p-5',
  md: 'p-7',
  lg: 'p-9',
  xl: 'p-12'
};

// Quick modern component generators
export const quickModern = {
  card: (className?: string) => cn(
    'bg-white/15 backdrop-blur-xl border border-white/25 rounded-2xl shadow-modern',
    'transition-all duration-300 hover:bg-white/20 hover:border-white/35 hover:shadow-modern-lg',
    className
  ),
  
  button: (className?: string) => cn(
    'bg-white/25 backdrop-blur-xl border border-white/35 rounded-xl px-7 py-4',
    'text-white font-semibold transition-all duration-300 ease-out',
    'hover:bg-white/35 hover:border-white/45 hover:-translate-y-1 hover:shadow-glow',
    'active:scale-96 focus:outline-none focus:ring-2 focus:ring-white/25',
    className
  ),
  
  input: (className?: string) => cn(
    'bg-white/15 backdrop-blur-xl border border-white/25 rounded-xl px-5 py-4',
    'text-white placeholder-white/65 focus:bg-white/20 focus:border-white/40',
    'focus:outline-none focus:ring-2 focus:ring-white/25 transition-all duration-300',
    className
  ),
  
  modal: (className?: string) => cn(
    'bg-white/10 backdrop-blur-3xl border border-white/15 rounded-3xl',
    'shadow-modern-lg',
    className
  ),
  
  nav: (className?: string) => cn(
    'bg-white/15 backdrop-blur-2xl border-b border-white/25',
    'shadow-modern sticky top-0 z-50',
    className
  )
};

// AMOLED Dark theme specific utilities
export const amoledStyles = {
  // Base AMOLED effects with pure black
  light: 'bg-black/85 backdrop-blur-xl border border-white/20',
  medium: 'bg-black/90 backdrop-blur-2xl border border-white/25',
  heavy: 'bg-black/95 backdrop-blur-3xl border border-white/30',
  
  // AMOLED variants
  primary: 'bg-black/90 backdrop-blur-xl border border-blue-300/30',
  secondary: 'bg-black/90 backdrop-blur-xl border border-purple-300/30',
  success: 'bg-black/90 backdrop-blur-xl border border-green-300/30',
  warning: 'bg-black/90 backdrop-blur-xl border border-yellow-300/30',
  error: 'bg-black/90 backdrop-blur-xl border border-red-300/30',
  
  // Interactive states for AMOLED
  hover: 'hover:bg-black/95 hover:border-white/35 hover:shadow-modern-lg hover:-translate-y-2',
  focus: 'focus:bg-black/95 focus:border-white/40 focus:ring-2 focus:ring-white/30',
  active: 'active:scale-96 active:bg-black/100',
  
  // Enhanced transitions for AMOLED
  transition: 'transition-all duration-300 ease-out',
};

// Quick AMOLED component generators
export const quickAmoled = {
  card: (className?: string) => cn(
    'bg-black/90 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-modern',
    'transition-all duration-300 hover:bg-black/95 hover:border-white/30 hover:shadow-modern-lg',
    className
  ),
  
  button: (className?: string) => cn(
    'bg-black/85 backdrop-blur-xl border border-white/25 rounded-xl px-7 py-4',
    'text-white font-semibold transition-all duration-300 ease-out',
    'hover:bg-black/95 hover:border-white/35 hover:-translate-y-1 hover:shadow-glow',
    'active:scale-96 focus:outline-none focus:ring-2 focus:ring-white/30',
    className
  ),
  
  input: (className?: string) => cn(
    'bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl px-5 py-4',
    'text-white placeholder-white/70 focus:bg-black/90 focus:border-white/35',
    'focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300',
    className
  ),
  
  modal: (className?: string) => cn(
    'bg-black/95 backdrop-blur-3xl border border-white/20 rounded-3xl',
    'shadow-modern-lg',
    className
  ),
};

export default {
  modernStyles,
  createModernComponent,
  animations,
  modernColors,
  backdropBlur,
  modernShadows,
  modernRounded,
  modernSpacing,
  quickModern,
  amoledStyles,
  quickAmoled
};

// Backward compatibility exports (pointing to modern versions)
export const glassStyles = modernStyles;
export const createGlassComponent = createModernComponent;
export const glassColors = modernColors;
export const glassShadows = modernShadows;
export const glassRounded = modernRounded;
export const glassSpacing = modernSpacing;
export const quickGlass = quickModern;
