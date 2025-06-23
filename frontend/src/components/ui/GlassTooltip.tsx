import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';

interface GlassTooltipProps {
  children: React.ReactNode;
  content: string | React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
  disabled?: boolean;
  maxWidth?: string;
}

const positionClasses = {
  top: {
    tooltip: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    arrow: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-l-4 border-r-4 border-t-4 border-t-white/25'
  },
  bottom: {
    tooltip: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    arrow: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-l-4 border-r-4 border-b-4 border-b-white/25'
  },
  left: {
    tooltip: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    arrow: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-t-4 border-b-4 border-l-4 border-l-white/25'
  },
  right: {
    tooltip: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
    arrow: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-t-4 border-b-4 border-r-4 border-r-white/25'
  }
};

export const GlassTooltip: React.FC<GlassTooltipProps> = ({
  children,
  content,
  position = 'top',
  delay = 500,
  className,
  disabled = false,
  maxWidth = '200px'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (disabled) return;
    
    setShouldShow(true);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    
    setShouldShow(false);
    setIsVisible(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleFocus = () => {
    if (disabled) return;
    setShouldShow(true);
    setIsVisible(true);
  };

  const handleBlur = () => {
    if (disabled) return;
    setShouldShow(false);
    setIsVisible(false);
  };

  const positionClass = positionClasses[position];

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}
      
      {shouldShow && (
        <div
          className={cn(
            'absolute z-50 px-3 py-2 bg-black/85 backdrop-blur-xl border border-white/25 rounded-lg',
            'text-white text-sm font-medium shadow-modern-lg',
            'transition-all duration-200 ease-out',
            'pointer-events-none select-none',
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
            positionClass.tooltip,
            className
          )}
          style={{ maxWidth }}
        >
          {content}
          
          {/* Arrow */}
          <div
            className={cn(
              'absolute w-0 h-0',
              positionClass.arrow
            )}
          />
        </div>
      )}
    </div>
  );
};

// Simple text tooltip hook for easy usage
export const useTooltip = (content: string, position: GlassTooltipProps['position'] = 'top') => {
  return {
    'data-tooltip': content,
    'data-tooltip-position': position
  };
};

// Tooltip wrapper component for simpler usage
interface SimpleTooltipProps {
  tooltip: string;
  position?: GlassTooltipProps['position'];
  children: React.ReactNode;
  className?: string;
}

export const SimpleTooltip: React.FC<SimpleTooltipProps> = ({
  tooltip,
  position = 'top',
  children,
  className
}) => {
  return (
    <GlassTooltip content={tooltip} position={position} className={className}>
      {children}
    </GlassTooltip>
  );
};

export default GlassTooltip;
