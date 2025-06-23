import { useState, useEffect } from 'react';

// Breakpoint hooks
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<'sm' | 'md' | 'lg' | 'xl' | '2xl'>('lg');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint('sm');
      else if (width < 768) setBreakpoint('md');
      else if (width < 1024) setBreakpoint('lg');
      else if (width < 1280) setBreakpoint('xl');
      else setBreakpoint('2xl');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
};

export const useIsMobile = () => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'sm' || breakpoint === 'md';
};

export const useIsTablet = () => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'md' || breakpoint === 'lg';
};

export const useIsDesktop = () => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'xl' || breakpoint === '2xl';
};

// Container component with responsive padding and max-width
export const Container: React.FC<{
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}> = ({ children, className = '', size = 'xl' }) => {
  const sizes = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  };

  return (
    <div className={`${sizes[size]} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
};

// Grid component with responsive columns
export const ResponsiveGrid: React.FC<{
  children: React.ReactNode;
  className?: string;
  cols?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
}> = ({ children, className = '', cols = { sm: 1, md: 2, lg: 3, xl: 4 }, gap = 6 }) => {
  const gridCols = `grid-cols-${cols.sm || 1} md:grid-cols-${cols.md || 2} lg:grid-cols-${cols.lg || 3} xl:grid-cols-${cols.xl || 4}`;
  const gridGap = `gap-${gap}`;

  return (
    <div className={`grid ${gridCols} ${gridGap} ${className}`}>
      {children}
    </div>
  );
};

// Responsive text sizes
export const ResponsiveText: React.FC<{
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  className?: string;
}> = ({ children, as: Component = 'p', size = 'base', className = '' }) => {
  const sizes = {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
    '2xl': 'text-2xl sm:text-3xl',
    '3xl': 'text-3xl sm:text-4xl',
    '4xl': 'text-4xl sm:text-5xl'
  };

  return (
    <Component className={`${sizes[size]} ${className}`}>
      {children}
    </Component>
  );
};

// Responsive spacing utility
export const ResponsiveStack: React.FC<{
  children: React.ReactNode;
  space?: {
    sm?: number;
    md?: number;
    lg?: number;
  };
  className?: string;
}> = ({ children, space = { sm: 4, md: 6, lg: 8 }, className = '' }) => {
  const spacing = `space-y-${space.sm} md:space-y-${space.md} lg:space-y-${space.lg}`;
  
  return (
    <div className={`${spacing} ${className}`}>
      {children}
    </div>
  );
};

export default {
  useBreakpoint,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  Container,
  ResponsiveGrid,
  ResponsiveText,
  ResponsiveStack
};
