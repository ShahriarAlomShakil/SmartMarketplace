/**
 * Mobile Touch Utilities for enhanced mobile interactions
 * Provides utilities for better touch handling on mobile devices
 */
import React from 'react';

export interface TouchEventHandlers {
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
}

export interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export interface TouchState {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  startTime: number;
}

/**
 * Hook for handling swipe gestures
 */
export const useSwipeGestures = (handlers: SwipeHandlers, threshold = 50, timeThreshold = 300) => {
  const touchState = React.useRef<TouchState>({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    startTime: 0
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      endX: touch.clientX,
      endY: touch.clientY,
      startTime: Date.now()
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchState.current) return;
    
    const touch = e.touches[0];
    touchState.current.endX = touch.clientX;
    touchState.current.endY = touch.clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchState.current) return;

    const { startX, startY, endX, endY, startTime } = touchState.current;
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const deltaTime = Date.now() - startTime;

    // Check if it's a valid swipe (within time threshold and meets distance threshold)
    if (deltaTime > timeThreshold) return;

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Horizontal swipe
    if (absDeltaX > threshold && absDeltaX > absDeltaY) {
      if (deltaX > 0) {
        handlers.onSwipeRight?.();
      } else {
        handlers.onSwipeLeft?.();
      }
    }
    // Vertical swipe
    else if (absDeltaY > threshold && absDeltaY > absDeltaX) {
      if (deltaY > 0) {
        handlers.onSwipeDown?.();
      } else {
        handlers.onSwipeUp?.();
      }
    }
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
};

/**
 * Hook for handling long press gestures
 */
export const useLongPress = (
  onLongPress: () => void,
  duration = 500,
  onPress?: () => void
) => {
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  const isLongPress = React.useRef(false);

  const start = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    isLongPress.current = false;
    
    timeoutRef.current = setTimeout(() => {
      isLongPress.current = true;
      onLongPress();
    }, duration);
  };

  const clear = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (!isLongPress.current && onPress) {
      onPress();
    }
  };

  return {
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: start,
    onTouchEnd: clear,
    onTouchCancel: clear
  };
};

/**
 * Hook for detecting device type and capabilities
 */
export const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = React.useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    supportsTouchEvents: false,
    hasHover: false,
    prefersDarkMode: false,
    screenSize: { width: 0, height: 0 }
  });

  React.useEffect(() => {
    const updateDeviceInfo = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isTablet = /iPad/i.test(navigator.userAgent) || (isMobile && window.innerWidth > 600);
      const isDesktop = !isMobile && !isTablet;
      const supportsTouchEvents = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const hasHover = window.matchMedia('(hover: hover)').matches;
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        supportsTouchEvents,
        hasHover,
        prefersDarkMode,
        screenSize: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      });
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
};

/**
 * Enhanced touch-friendly button component props
 */
export interface TouchFriendlyProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

/**
 * Touch-friendly button component with enhanced mobile interactions
 */
export const TouchFriendlyButton: React.FC<TouchFriendlyProps> = ({
  className = '',
  children,
  onClick,
  onLongPress,
  disabled = false,
  size = 'md',
  variant = 'primary'
}) => {
  const longPressHandlers = useLongPress(
    onLongPress || (() => {}),
    500,
    onClick
  );

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[44px]',
    md: 'px-4 py-3 text-base min-h-[48px]',
    lg: 'px-6 py-4 text-lg min-h-[52px]'
  };

  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
    outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white',
    ghost: 'text-blue-500 hover:bg-blue-50'
  };

  return (
    <button
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
        rounded-lg font-medium transition-all duration-200
        active:scale-95 touch-manipulation
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-blue-500/50
        select-none
      `}
      disabled={disabled}
      {...(onLongPress ? longPressHandlers : { onClick })}
    >
      {children}
    </button>
  );
};

/**
 * Mobile-optimized modal component
 */
export interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  fullScreen?: boolean;
  className?: string;
}

export const MobileModal: React.FC<MobileModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  fullScreen = false,
  className = ''
}) => {
  const deviceInfo = useDeviceDetection();
  const swipeHandlers = useSwipeGestures({
    onSwipeDown: () => {
      if (deviceInfo.isMobile) {
        onClose();
      }
    }
  });

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalClasses = deviceInfo.isMobile && fullScreen
    ? 'fixed inset-0 bg-white/10 backdrop-blur-md'
    : 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4';

  const contentClasses = deviceInfo.isMobile && fullScreen
    ? 'w-full h-full overflow-y-auto'
    : `bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 max-w-lg w-full max-h-[90vh] overflow-y-auto ${className}`;

  return (
    <div className={modalClasses} onClick={onClose}>
      <div 
        className={contentClasses}
        onClick={(e) => e.stopPropagation()}
        {...swipeHandlers}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <TouchFriendlyButton
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white/60 hover:text-white"
            >
              ×
            </TouchFriendlyButton>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * Pull-to-refresh component for mobile
 */
export interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 100,
  className = ''
}) => {
  const [isPulling, setIsPulling] = React.useState(false);
  const [pullDistance, setPullDistance] = React.useState(0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  
  const containerRef = React.useRef<HTMLDivElement>(null);
  const startY = React.useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop !== 0 || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;

    if (distance > 0) {
      e.preventDefault();
      setIsPulling(true);
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setIsPulling(false);
    setPullDistance(0);
  };

  const refreshIconRotation = (pullDistance / threshold) * 180;

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      <div 
        className={`absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-300 ${
          isPulling || isRefreshing ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ 
          height: Math.max(pullDistance, isRefreshing ? 60 : 0),
          transform: `translateY(${Math.min(pullDistance - 60, 0)}px)`
        }}
      >
        <div className="flex items-center space-x-2 text-white/70">
          <div 
            className={`w-6 h-6 transition-transform ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ transform: `rotate(${refreshIconRotation}deg)` }}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <span className="text-sm">
            {isRefreshing ? 'Refreshing...' : pullDistance >= threshold ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ marginTop: isPulling || isRefreshing ? Math.max(pullDistance, isRefreshing ? 60 : 0) : 0 }}>
        {children}
      </div>
    </div>
  );
};

export default {
  useSwipeGestures,
  useLongPress,
  useDeviceDetection,
  TouchFriendlyButton,
  MobileModal,
  PullToRefresh
};
