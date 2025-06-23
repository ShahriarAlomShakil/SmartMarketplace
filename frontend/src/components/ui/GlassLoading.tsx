import React from 'react';
import { cn } from '@/utils/cn';

interface GlassLoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'pulse' | 'ring';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

const SpinnerVariant: React.FC<{ size: string; className?: string }> = ({ size, className }) => (
  <div className={cn('border-2 border-white/25 border-t-white/85 rounded-full animate-spin', size, className)} />
);

const DotsVariant: React.FC<{ size: string; className?: string }> = ({ size, className }) => (
  <div className={cn('flex space-x-1', className)}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className={cn(
          'bg-white/70 rounded-full animate-pulse',
          size === 'w-4 h-4' ? 'w-1 h-1' :
          size === 'w-6 h-6' ? 'w-1.5 h-1.5' :
          size === 'w-8 h-8' ? 'w-2 h-2' : 'w-3 h-3'
        )}
        style={{ animationDelay: `${i * 0.2}s` }}
      />
    ))}
  </div>
);

const PulseVariant: React.FC<{ size: string; className?: string }> = ({ size, className }) => (
  <div className={cn('bg-white/25 backdrop-blur-xl rounded-full animate-pulse-glow', size, className)} />
);

const RingVariant: React.FC<{ size: string; className?: string }> = ({ size, className }) => (
  <div className={cn('relative', size, className)}>
    <div className="absolute inset-0 rounded-full border-2 border-white/25" />
    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/85 animate-spin" />
    <div 
      className="absolute inset-1 rounded-full border border-transparent border-t-white/45 animate-spin" 
      style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}
    />
  </div>
);

export const GlassLoading: React.FC<GlassLoadingProps> = ({
  size = 'md',
  variant = 'default',
  className,
  text
}) => {
  const sizeClass = sizeClasses[size];

  const renderVariant = () => {
    switch (variant) {
      case 'dots':
        return <DotsVariant size={sizeClass} className={className} />;
      case 'pulse':
        return <PulseVariant size={sizeClass} className={className} />;
      case 'ring':
        return <RingVariant size={sizeClass} className={className} />;
      default:
        return <SpinnerVariant size={sizeClass} className={className} />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      {renderVariant()}
      {text && (
        <p className="text-white/80 text-sm font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

// Full-screen loading overlay
export const GlassLoadingOverlay: React.FC<{
  isLoading: boolean;
  text?: string;
  variant?: GlassLoadingProps['variant'];
  className?: string;
}> = ({ isLoading, text = 'Loading...', variant = 'ring', className }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/25 backdrop-blur-xl flex items-center justify-center">
      <div className={cn(
        'bg-white/15 backdrop-blur-2xl border border-white/25 rounded-2xl p-8',
        'shadow-modern-lg',
        className
      )}>
        <GlassLoading size="lg" variant={variant} text={text} />
      </div>
    </div>
  );
};

export default GlassLoading;
