import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { NavigationProps, NavItem } from '../types/ui';
import { cn } from '../utils/design';
import { ModernButton } from './ui/ModernButton';
import { BlurCard } from './ui/BlurCard';

/**
 * Navigation - A modern navigation component with blurry background and modern layout
 * 
 * Features:
 * - Responsive design with mobile menu
 * - Blur background with glass morphism
 * - Active link highlighting
 * - User authentication state
 * - Modern animations and transitions
 * - Theme toggle integration
 */
export const Navigation: React.FC<NavigationProps> = ({ 
  items,
  logo,
  actions,
  className 
}) => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // TODO: Replace with actual auth context
  const [user, setUser] = useState<{ name: string; avatar?: string } | null>(null);

  const defaultNavItems: NavItem[] = [
    { 
      label: 'Home', 
      href: '/', 
      active: router.pathname === '/',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      label: 'Browse Products', 
      href: '/products', 
      active: router.pathname === '/products',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    { 
      label: 'Sell', 
      href: '/sell', 
      active: router.pathname === '/sell',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      )
    },
    { 
      label: 'AI Chat', 
      href: '/negotiate', 
      active: router.pathname === '/negotiate',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
  ];

  const navigationItems = items || defaultNavItems;

  const defaultLogo = (
    <Link href="/" className="flex items-center space-x-3 group">
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
        <span className="text-white font-bold text-lg">SM</span>
      </div>
      <div className="hidden sm:block">
        <span className="text-white font-bold text-xl tracking-tight">Smart Marketplace</span>
        <div className="text-white/60 text-xs font-medium">AI-Powered Trading</div>
      </div>
    </Link>
  );

  const defaultActions = (
    <div className="flex items-center space-x-4">      
      {user ? (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <ModernButton
            variant="ghost"
            size="sm"
            onClick={() => setUser(null)}
          >
            Sign Out
          </ModernButton>
        </div>
      ) : (
        <div className="flex items-center space-x-3">
          <ModernButton
            variant="ghost"
            size="sm"
            onClick={() => router.push('/login')}
          >
            Sign In
          </ModernButton>
          <ModernButton
            variant="primary"
            size="sm"
            onClick={() => router.push('/register')}
            className="hidden sm:block"
          >
            Get Started
          </ModernButton>
        </div>
      )}
    </div>
  );

  return (
    <nav className={cn('modern-nav', className)}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          {logo || defaultLogo}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium',
                  'transition-all duration-300 ease-out',
                  'hover:bg-white/10 hover:backdrop-blur-sm',
                  item.active
                    ? 'bg-white/15 text-white shadow-lg backdrop-blur-md'
                    : 'text-white/80 hover:text-white'
                )}
                onClick={item.onClick}
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:block">
            {actions || defaultActions}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <ModernButton
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              <svg
                className={cn('w-5 h-5 transition-transform duration-300', isMobileMenuOpen && 'rotate-180')}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </ModernButton>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-4 right-4 z-50">
            <BlurCard 
              variant="elevated" 
              padding="sm" 
              className="animate-fade-in"
            >
              <div className="space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium',
                      'transition-all duration-200 ease-out',
                      'hover:bg-white/10',
                      item.active
                        ? 'bg-white/15 text-white'
                        : 'text-white/80 hover:text-white'
                    )}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      item.onClick?.();
                    }}
                  >
                    {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                    <span>{item.label}</span>
                  </Link>
                ))}
                
                {/* Mobile Actions */}
                <div className="pt-4 border-t border-white/10">
                  {actions || defaultActions}
                </div>
              </div>
            </BlurCard>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
