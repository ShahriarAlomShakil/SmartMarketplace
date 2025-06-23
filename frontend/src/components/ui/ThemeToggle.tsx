import React from 'react';
import { useTheme } from '../ThemeProviderNew';
import { ModernButton } from './ModernButton';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

/**
 * ThemeToggle - Modern theme toggle component with smooth dark/light mode transitions
 * 
 * Features:
 * - Smooth transitions between dark/light modes
 * - System theme detection option
 * - Modern icon animations
 * - Customizable size and appearance
 * - Accessible keyboard navigation
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  size = 'md',
  showLabel = false
}) => {
  const { theme, setTheme, systemTheme } = useTheme();

  const handleToggle = () => {
    if (theme === 'system') {
      setTheme(systemTheme === 'dark' ? 'light' : 'dark');
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  const resolvedTheme = theme === 'system' ? systemTheme : theme;
  const isDark = resolvedTheme === 'dark';

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }[size];

  const SunIcon = () => (
    <svg
      className={`${iconSize} transition-all duration-300 ${
        isDark ? 'scale-0 rotate-90' : 'scale-100 rotate-0'
      }`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );

  const MoonIcon = () => (
    <svg
      className={`${iconSize} transition-all duration-300 ${
        isDark ? 'scale-100 rotate-0' : 'scale-0 -rotate-90'
      }`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );

  if (showLabel) {
    return (
      <ModernButton
        variant="outline"
        size={size}
        onClick={handleToggle}
        className={`relative ${className}`}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        <div className="relative flex items-center space-x-2">
          <div className="relative">
            <div className="absolute inset-0">
              <SunIcon />
            </div>
            <div className="absolute inset-0">
              <MoonIcon />
            </div>
          </div>
          <span className="text-sm font-medium">
            {isDark ? 'Dark' : 'Light'}
          </span>
        </div>
      </ModernButton>
    );
  }

  return (
    <ModernButton
      variant="ghost"
      size={size}
      onClick={handleToggle}
      className={`relative p-2 ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <SunIcon />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <MoonIcon />
        </div>
      </div>
    </ModernButton>
  );
};

/**
 * ThemeToggleDropdown - Advanced theme toggle with system option
 * 
 * Features:
 * - Three-way toggle (light/dark/system)
 * - Dropdown interface
 * - Current theme indication
 * - Modern design with blur backgrounds
 */
export const ThemeToggleDropdown: React.FC<ThemeToggleProps> = ({
  className,
  size = 'md'
}) => {
  const { theme, setTheme, systemTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  const themes = [
    {
      value: 'light' as const,
      label: 'Light',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      )
    },
    {
      value: 'dark' as const,
      label: 'Dark',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )
    },
    {
      value: 'system' as const,
      label: 'System',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      )
    }
  ];

  const currentTheme = themes.find(t => t.value === theme);

  return (
    <div className={`relative ${className}`}>
      <ModernButton
        variant="outline"
        size={size}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
        aria-label="Theme settings"
      >
        {currentTheme?.icon}
        <span className="text-sm">{currentTheme?.label}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </ModernButton>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl z-50">
            <div className="p-2">
              {themes.map((themeOption) => (
                <button
                  key={themeOption.value}
                  onClick={() => {
                    setTheme(themeOption.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    theme === themeOption.value
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {themeOption.icon}
                  <span className="text-sm font-medium">{themeOption.label}</span>
                  {theme === themeOption.value && (
                    <svg className="w-4 h-4 ml-auto text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
