import React, { useEffect } from 'react';
import { cn } from '@/utils/cn';
import { BackdropBlur, FullscreenBackdrop } from './BackdropBlur';
import { ModernButton } from './ModernButton';

interface ModernModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl'
};

export const ModernModal: React.FC<ModernModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  className,
  size = 'md',
  closeOnBackdrop = true,
  showCloseButton = true
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose();
    }
  };

  return (
    <FullscreenBackdrop>
      <div
        className="flex items-center justify-center p-4 w-full h-full"
        onClick={handleBackdropClick}
      >
        <div
          className={cn(
            'relative bg-white/15 backdrop-blur-3xl border border-white/25 rounded-3xl',
            'shadow-modern-lg transform transition-all duration-300 ease-out',
            'animate-in fade-in zoom-in-95',
            sizeClasses[size],
            'w-full',
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-white/15">
              {title && (
                <h2 className="text-xl font-semibold text-white">{title}</h2>
              )}
              {showCloseButton && (
                <ModernButton
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="ml-auto"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </ModernButton>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </FullscreenBackdrop>
  );
};

export default ModernModal;

// Backward compatibility alias
export { ModernModal as GlassModal };
