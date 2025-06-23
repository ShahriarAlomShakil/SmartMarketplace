import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme, ThemeContextType } from '../types/ui';
import { cn } from '../utils/cn';

/**
 * ThemeProvider - Comprehensive dark/light mode with smooth transitions
 * 
 * Features:
 * - System theme detection
 * - Persistent theme storage
 * - Smooth transitions between themes
 * - CSS custom properties for theming
 * - Media query listening for system changes
 */

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  enableSystem?: boolean;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
  storageKey = 'smart-marketplace-theme',
  enableSystem = true
}) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('dark');

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    if (enableSystem) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [enableSystem]);

  // Load theme from storage on mount
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(storageKey) as Theme;
      if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
        setTheme(storedTheme);
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
    }
  }, [storageKey]);

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Determine effective theme
    const effectiveTheme = theme === 'system' ? systemTheme : theme;
    
    // Apply theme class
    root.classList.add(effectiveTheme);
    
    // Update CSS custom properties for smoother transitions
    root.style.setProperty('--theme-transition', 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)');
    
    // Store theme preference
    try {
      localStorage.setItem(storageKey, theme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }, [theme, systemTheme, storageKey]);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    
    // Add a subtle transition effect when switching themes
    const root = window.document.documentElement;
    root.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    
    // Remove transition after it completes
    setTimeout(() => {
      root.style.transition = '';
    }, 300);
  };

  const value: ThemeContextType = {
    theme,
    setTheme: handleThemeChange,
    systemTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      <div className="theme-transition">
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use theme context
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * ThemeToggle component for switching themes with modern styling
 */
interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className, 
  size = 'md',
  variant = 'ghost'
}) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'dark':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light': return 'Switch to dark mode';
      case 'dark': return 'Switch to system mode';
      default: return 'Switch to light mode';
    }
  };

  const getTooltip = () => {
    switch (theme) {
      case 'light': return 'Currently using light theme';
      case 'dark': return 'Currently using dark theme';
      default: return 'Currently using system theme';
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8 p-1.5',
    md: 'h-10 w-10 p-2',
    lg: 'h-12 w-12 p-2.5'
  };

  const variantClasses = {
    default: cn(
      'bg-white/10 hover:bg-white/20 border-white/20',
      'dark:bg-slate-800/50 dark:hover:bg-slate-700/50 dark:border-slate-700/50'
    ),
    ghost: cn(
      'bg-transparent hover:bg-white/10 border-transparent hover:border-white/20',
      'dark:hover:bg-slate-800/50 dark:hover:border-slate-700/50'
    ),
    outline: cn(
      'bg-transparent border-2 border-white/30 hover:bg-white/10',
      'dark:border-slate-600/50 dark:hover:bg-slate-800/50'
    )
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        // Base styles
        'relative inline-flex items-center justify-center rounded-xl',
        'transition-all duration-300 ease-out',
        'backdrop-blur-sm border',
        'text-slate-700 hover:text-slate-900',
        'dark:text-slate-300 dark:hover:text-slate-100',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2',
        'hover:shadow-lg hover:shadow-indigo-500/20',
        'active:scale-95',
        // Size variants
        sizeClasses[size],
        // Color variants
        variantClasses[variant],
        // Custom className
        className
      )}
      title={getTooltip()}
      aria-label={getLabel()}
    >
      <span className="transition-transform duration-300 ease-out hover:scale-110">
        {getIcon()}
      </span>
    </button>
  );
};

export default ThemeProvider;
