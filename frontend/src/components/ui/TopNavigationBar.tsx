import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import {
  HomeIcon,
  ShoppingBagIcon,
  PlusCircleIcon,
  UserIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid,
  PlusCircleIcon as PlusCircleIconSolid,
  UserIcon as UserIconSolid
} from '@heroicons/react/24/solid';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  solidIcon: React.ComponentType<any>;
  description: string;
}

interface TopNavigationBarProps {
  user?: {
    username: string;
    avatar?: string;
  };
  notifications?: number;
  onNotificationClick?: () => void;
  onMobileMenuToggle?: () => void;
  showMobileMenuToggle?: boolean;
  className?: string;
}

/**
 * TopNavigationBar - Reusable top navigation component
 * 
 * Features:
 * - Responsive design with mobile support
 * - Active page highlighting
 * - User avatar and notifications
 * - Glassmorphism design
 * - Smooth animations
 */
export const TopNavigationBar: React.FC<TopNavigationBarProps> = ({
  user,
  notifications = 0,
  onNotificationClick,
  onMobileMenuToggle,
  showMobileMenuToggle = false,
  className = ''
}) => {
  const router = useRouter();

  const mainNavItems: NavItem[] = [
    {
      name: 'Home',
      href: '/',
      icon: HomeIcon,
      solidIcon: HomeIconSolid,
      description: 'Return to homepage'
    },
    {
      name: 'Browse Products',
      href: '/products',
      icon: ShoppingBagIcon,
      solidIcon: ShoppingBagIconSolid,
      description: 'Browse all products'
    },
    {
      name: 'Sell Product',
      href: '/sell',
      icon: PlusCircleIcon,
      solidIcon: PlusCircleIconSolid,
      description: 'List a new product'
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: UserIcon,
      solidIcon: UserIconSolid,
      description: 'View your profile'
    }
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const isCurrentPath = (href: string) => {
    if (href === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(href);
  };

  return (
    <div className={`sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <button
                onClick={() => handleNavigation('/')}
                className="text-xl font-bold text-white hover:text-blue-400 transition-colors"
              >
                DamaDami
              </button>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {mainNavItems.map((item) => {
                const Icon = isCurrentPath(item.href) ? item.solidIcon : item.icon;
                const isActive = isCurrentPath(item.href);
                
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className={`
                      group relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                      }
                    `}
                    title={item.description}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-active"
                        className="absolute inset-0 bg-blue-500/10 rounded-lg border border-blue-500/20"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            {/* Mobile menu toggle */}
            {showMobileMenuToggle && onMobileMenuToggle && (
              <button
                onClick={onMobileMenuToggle}
                className="md:hidden p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                title="Toggle Menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            
            {/* Notifications */}
            {onNotificationClick && (
              <button
                onClick={onNotificationClick}
                className="relative p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                title="Notifications"
              >
                <BellIcon className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications > 9 ? '9+' : notifications}
                  </span>
                )}
              </button>
            )}
            
            {/* User avatar/menu or Sign In button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => handleNavigation('/profile')}
                  className="flex items-center space-x-2 p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                  title="View Profile"
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{user.username}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleNavigation('/login')}
                  className="px-3 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavigation('/register')}
                  className="px-3 py-2 text-sm font-medium bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Dropdown */}
      <div className="md:hidden border-t border-white/20">
        <div className="px-4 py-3 space-y-1">
          {mainNavItems.map((item) => {
            const Icon = isCurrentPath(item.href) ? item.solidIcon : item.icon;
            const isActive = isCurrentPath(item.href);
            
            return (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className={`
                  w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
