import { ReactNode, ButtonHTMLAttributes, HTMLAttributes } from 'react';

// Base component props
export interface BaseProps {
  className?: string;
  children?: ReactNode;
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  systemTheme: 'light' | 'dark';
}

// Blur intensity levels
export type BlurIntensity = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

// Card variants
export type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled';

// Button types
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

// Blur Card props
export interface BlurCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  blur?: BlurIntensity;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  className?: string;
  children: ReactNode;
}

// Backdrop Blur wrapper props
export interface BackdropBlurProps extends HTMLAttributes<HTMLDivElement> {
  intensity?: BlurIntensity;
  background?: boolean;
  border?: boolean;
  className?: string;
  children: ReactNode;
}

// Navigation item type
export interface NavItem {
  label: string;
  href: string;
  icon?: ReactNode;
  active?: boolean;
  onClick?: () => void;
}

// Navigation props
export interface NavigationProps {
  items: NavItem[];
  logo?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

// Layout props
export interface LayoutProps {
  children: ReactNode;
  navigation?: boolean;
  sidebar?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

// Typography types
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
export type TextWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
export type TextAlign = 'left' | 'center' | 'right' | 'justify';

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  size?: TextSize;
  weight?: TextWeight;
  align?: TextAlign;
  gradient?: boolean;
  className?: string;
  children: ReactNode;
}

// Animation types
export type AnimationType = 'fade' | 'slide' | 'zoom' | 'bounce' | 'float';
export type AnimationDirection = 'up' | 'down' | 'left' | 'right';

export interface AnimationProps {
  type?: AnimationType;
  direction?: AnimationDirection;
  duration?: number;
  delay?: number;
  className?: string;
}

// Input types
export interface InputProps extends Omit<HTMLInputElement, 'size'> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: ButtonSize;
  variant?: 'default' | 'filled' | 'outline';
  fullWidth?: boolean;
}

// Modal types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  blur?: BlurIntensity;
  className?: string;
}

// Responsive breakpoints
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ResponsiveValue<T> {
  base?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}

// Color system
export type ColorScheme = 
  | 'primary' 
  | 'secondary' 
  | 'accent' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info' 
  | 'neutral';

export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

// Component state types
export type ComponentState = 'default' | 'hover' | 'active' | 'disabled' | 'loading';

// Accessibility props
export interface AccessibilityProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  role?: string;
  tabIndex?: number;
}

// Combined props for accessible components
export interface AccessibleComponentProps extends BaseProps, AccessibilityProps {
  state?: ComponentState;
  disabled?: boolean;
}
