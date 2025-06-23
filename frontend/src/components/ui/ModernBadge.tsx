import React from 'react';
import { cn } from '@/utils/cn';

interface ModernBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  dot?: boolean;
  pulse?: boolean;
}

const variants = {
  default: 'bg-white/25 border-white/35 text-white backdrop-blur-xl',
  primary: 'bg-primary-500/25 border-primary-300/35 text-primary-100 backdrop-blur-xl',
  secondary: 'bg-secondary-500/25 border-secondary-300/35 text-secondary-100 backdrop-blur-xl',
  success: 'bg-green-500/25 border-green-300/35 text-green-100 backdrop-blur-xl',
  warning: 'bg-yellow-500/25 border-yellow-300/35 text-yellow-100 backdrop-blur-xl',
  error: 'bg-red-500/25 border-red-300/35 text-red-100 backdrop-blur-xl',
  info: 'bg-blue-500/25 border-blue-300/35 text-blue-100 backdrop-blur-xl'
};

const sizes = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base'
};

const dotVariants = {
  default: 'bg-white',
  primary: 'bg-primary-400',
  secondary: 'bg-secondary-400',
  success: 'bg-green-400',
  warning: 'bg-yellow-400',
  error: 'bg-red-400',
  info: 'bg-blue-400'
};

export const ModernBadge: React.FC<ModernBadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  dot = false,
  pulse = false
}) => {
  if (dot) {
    return (
      <span className="relative inline-flex">
        <span
          className={cn(
            'inline-flex items-center border rounded-full font-medium',
            variants[variant],
            sizes[size],
            className
          )}
        >
          {children}
        </span>
        <span
          className={cn(
            'absolute -top-1 -right-1 w-3 h-3 rounded-full',
            dotVariants[variant],
            pulse && 'animate-ping'
          )}
        />
        {pulse && (
          <span
            className={cn(
              'absolute -top-1 -right-1 w-3 h-3 rounded-full',
              dotVariants[variant]
            )}
          />
        )}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center backdrop-blur-sm border rounded-full font-medium transition-all duration-200',
        'hover:scale-105',
        variants[variant],
        sizes[size],
        pulse && 'animate-pulse-glow',
        className
      )}
    >
      {children}
    </span>
  );
};

// Status Badge with predefined statuses
interface StatusBadgeProps {
  status: 'online' | 'offline' | 'busy' | 'away' | 'active' | 'inactive' | 'pending' | 'approved' | 'rejected';
  className?: string;
  size?: ModernBadgeProps['size'];
  pulse?: boolean;
}

const statusConfig = {
  online: { variant: 'success' as const, label: 'Online', dot: true },
  offline: { variant: 'default' as const, label: 'Offline', dot: true },
  busy: { variant: 'error' as const, label: 'Busy', dot: true },
  away: { variant: 'warning' as const, label: 'Away', dot: true },
  active: { variant: 'success' as const, label: 'Active', dot: false },
  inactive: { variant: 'default' as const, label: 'Inactive', dot: false },
  pending: { variant: 'warning' as const, label: 'Pending', dot: false },
  approved: { variant: 'success' as const, label: 'Approved', dot: false },
  rejected: { variant: 'error' as const, label: 'Rejected', dot: false }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  size = 'sm',
  pulse = false
}) => {
  const config = statusConfig[status];
  
  return (
    <ModernBadge
      variant={config.variant}
      size={size}
      dot={config.dot}
      pulse={pulse}
      className={className}
    >
      {config.label}
    </ModernBadge>
  );
};

// Notification Badge for counts
interface NotificationBadgeProps {
  count: number;
  maxCount?: number;
  className?: string;
  variant?: ModernBadgeProps['variant'];
  size?: ModernBadgeProps['size'];
  pulse?: boolean;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  maxCount = 99,
  className,
  variant = 'error',
  size = 'sm',
  pulse = false
}) => {
  if (count <= 0) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <ModernBadge
      variant={variant}
      size={size}
      pulse={pulse}
      className={cn('absolute -top-2 -right-2 min-w-[1.25rem] h-5 flex items-center justify-center', className)}
    >
      {displayCount}
    </ModernBadge>
  );
};

export default ModernBadge;

// Backward compatibility alias
export { ModernBadge as GlassBadge };
