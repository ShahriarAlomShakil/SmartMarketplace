// Modern UI Components with Blurry Backgrounds
export { BlurCard } from './BlurCard';
export { ModernButton, GlassButton } from './ModernButton';
export { BackdropBlur, FullscreenBackdrop } from './BackdropBlur';
export { ModernAlert, GlassAlert } from './ModernAlert';
export { ModernBadge, GlassBadge } from './ModernBadge';
export { ModernInput, GlassInput, ModernTextarea, GlassTextarea } from './ModernInput';
export { ModernLoading, GlassLoading } from './ModernLoading';
export { ModernModal, GlassModal } from './ModernModal';
export { ModernTooltip, GlassTooltip } from './ModernTooltip';
export { ThemeToggle, ThemeToggleDropdown } from './ThemeToggle';
export { 
  ErrorBoundary, 
  ErrorAlert, 
  FieldError, 
  LoadingError, 
  NetworkError 
} from './ErrorHandling';

// Chat Components
export { 
  ChatBox, 
  ChatHeader, 
  MessageBubble, 
  MessageInput, 
  TypingIndicator, 
  SystemMessage 
} from '../chat';

// Layout Components
export { Navigation } from '../Navigation';
export { Layout } from '../Layout';
export { ThemeProvider, useTheme } from '../ThemeProviderNew';

// Authentication Components
export { LoginForm } from '../auth/LoginForm';
export { RegisterForm } from '../auth/RegisterForm';
export { PasswordStrengthIndicator } from '../auth/PasswordStrengthIndicator';
export { SocialLoginButtons } from '../auth/SocialLoginButtons';
export { UserProfileCard } from '../auth/UserProfileCard';
export { ProtectedRoute } from '../ProtectedRoute';

// Product Components
export { ProductCard } from '../product/ProductCard';
export { ProductGrid } from '../product/ProductGrid';
export { ProductSkeleton } from '../product/ProductSkeleton';
export { ProductFilters } from '../product/ProductFilters';
export { ProductListingForm } from '../product/ProductListingForm';
export { ProductManagement } from '../product/ProductManagement';

// Utilities
export { cn } from '../../utils/design';
export * from '../../utils/design';
export * from '../../utils/validation';

// Hooks
export { useFormValidation, useFieldValidation } from '../../hooks/useFormValidation';

// Re-export types
export type { 
  BlurCardProps, 
  ButtonProps, 
  BackdropBlurProps,
  BlurIntensity,
  ButtonVariant,
  ButtonSize,
  CardVariant,
  NavigationProps,
  LayoutProps,
  Theme,
  ThemeContextType
} from '../../types/ui';
