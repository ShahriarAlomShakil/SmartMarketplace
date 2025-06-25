import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import {
  HomeIcon,
  ShoppingBagIcon,
  BuildingStorefrontIcon,
  HeartIcon,
  DocumentTextIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid,
  BuildingStorefrontIcon as BuildingStorefrontIconSolid,
  HeartIcon as HeartIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  UsersIcon as UsersIconSolid
} from '@heroicons/react/24/solid';

// Import dashboard components
import { UnifiedDashboard } from '../components/dashboard/UnifiedDashboard';
import { WishlistManagement } from '../components/dashboard/WishlistManagement';
import { PurchaseHistory } from '../components/dashboard/PurchaseHistory';
import { CustomerManagement } from '../components/dashboard/CustomerManagement';
import { UserProfileCard } from '../components/dashboard/UserProfileCard';

// Import Day 20 components
import { NotificationCenter } from '../components/notifications/NotificationCenter';
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard';

// Import UI components
import { BackdropBlur } from '../components/ui/BackdropBlur';
import { ModernButton } from '../components/ui/ModernButton';
import { ModernBadge } from '../components/ui/ModernBadge';
import { BlurCard } from '../components/ui/BlurCard';
import { TopNavigationBar } from '../components/ui/TopNavigationBar';
import { ThemeToggle } from '../components/ui/ThemeToggle';

// Import hooks and context
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../components/ThemeProviderNew';
import { useSwipeGestures, useDeviceDetection, useLongPress } from '../utils/mobileUtils';

interface DashboardTab {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  solidIcon: React.ComponentType<any>;
  component: React.ComponentType<any>;
  badge?: number;
}

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const { isMobile, isTablet } = useDeviceDetection();
  const { theme, setTheme, systemTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [notifications, setNotifications] = useState(3); // Mock notification count

  // Determine the current theme for styling
  const resolvedTheme = theme === 'system' ? systemTheme : theme;
  const isDark = resolvedTheme === 'dark';

  // Swipe gestures for mobile navigation
  const swipeHandlers = useSwipeGestures({
    onSwipeLeft: () => {
      if (isMobile && sidebarOpen) setSidebarOpen(false);
    },
    onSwipeRight: () => {
      if (isMobile && !sidebarOpen) setSidebarOpen(true);
    }
  });

  // Long press for mobile menu toggle
  const longPressProps = useLongPress(() => {
    if (isMobile) setSidebarOpen(!sidebarOpen);
  }, 500);

  useEffect(() => {
    // Only redirect if not loading and user is definitely not authenticated
    if (!loading && !user) {
      console.log('🚪 Dashboard: User not authenticated, redirecting to login');
      router.replace('/login'); // Use replace instead of push to avoid history issues
      return;
    }
    
    if (!loading && user) {
      console.log('✅ Dashboard: User authenticated, loading dashboard');
    }
  }, [user, loading, router]);

  // Show loading spinner while authentication state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  // Dashboard tabs configuration
  const dashboardTabs: DashboardTab[] = [
    {
      id: 'overview',
      name: 'Overview',
      icon: HomeIcon,
      solidIcon: HomeIconSolid,
      component: UnifiedDashboard
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: ChartBarIcon,
      solidIcon: ChartBarIcon,
      component: AnalyticsDashboard
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: BellIcon,
      solidIcon: BellIcon,
      component: NotificationCenter,
      badge: notifications > 0 ? notifications : undefined
    },
    {
      id: 'wishlist',
      name: 'Wishlist',
      icon: HeartIcon,
      solidIcon: HeartIconSolid,
      component: WishlistManagement,
      badge: 8 // Mock wishlist count
    },
    {
      id: 'purchases',
      name: 'Purchase History',
      icon: DocumentTextIcon,
      solidIcon: DocumentTextIconSolid,
      component: PurchaseHistory
    },
    {
      id: 'customers',
      name: 'Customer Management',
      icon: UsersIcon,
      solidIcon: UsersIconSolid,
      component: CustomerManagement
    }
  ];

  // All users can access all tabs now
  const availableTabs = dashboardTabs;

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (isMobile) setSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-all duration-300 ${
        isDark 
          ? 'bg-black dark:bg-black' 
          : 'bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100'
      }`} style={!isDark ? { background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)' } : {}}>
        <BackdropBlur className="p-8 rounded-2xl">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto ${
            isDark ? 'border-white' : 'border-white'
          }`}></div>
          <p className={`mt-4 text-center transition-colors ${
            isDark ? 'text-white' : 'text-white'
          }`}>Loading dashboard...</p>
        </BackdropBlur>
      </div>
    );
  }

  const ActiveComponent = availableTabs.find(tab => tab.id === activeTab)?.component || UnifiedDashboard;

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isDark 
        ? 'bg-black dark:bg-black' 
        : ''
    }`} style={!isDark ? { background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)' } : {}}>
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute inset-0 transition-opacity duration-700 ${
          isDark ? 'opacity-100' : 'opacity-30'
        }`}>
          {/* Animated background gradients - matching homepage style */}
          <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-screen filter blur-3xl animate-float" style={{ animationDelay: '0s' }} />
          <div className="absolute top-40 right-20 w-96 h-96 bg-violet-500/20 rounded-full mix-blend-screen filter blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 left-40 w-96 h-96 bg-fuchsia-500/20 rounded-full mix-blend-screen filter blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>
      </div>
      {/* Top Navigation Bar */}
      <TopNavigationBar
        user={user}
        notifications={notifications}
        onNotificationClick={() => handleTabChange('notifications')}
        onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        showMobileMenuToggle={true}
      />
      {/* Dashboard Content Header - Mobile */}
      {isMobile && (
        <div className={`transition-all duration-300 ${
          isDark 
            ? 'bg-white/5 backdrop-blur-sm border-b border-white/10' 
            : 'bg-white/20 backdrop-blur-sm border-b border-white/20'
        }`}>
          <div className="flex items-center justify-between p-4">
            <h2 className={`text-lg font-semibold transition-colors ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {availableTabs.find(tab => tab.id === activeTab)?.name}
            </h2>
            <ThemeToggle size="sm" />
          </div>
        </div>
      )}

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || !isMobile) && (
            <motion.div
              initial={isMobile ? { x: -300 } : { width: 0 }}
              animate={isMobile ? { x: 0 } : { width: 300 }}
              exit={isMobile ? { x: -300 } : { width: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className={`
                ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'}
                w-80 transition-all duration-300 ${
                  isDark 
                    ? 'bg-white/5 backdrop-blur-md border-r border-white/20' 
                    : 'bg-white/20 backdrop-blur-md border-r border-white/40'
                }
              `}
            >
              {/* Mobile Backdrop */}
              {isMobile && (
                <div
                  className="fixed inset-0 bg-black/50 -z-10"
                  onClick={() => setSidebarOpen(false)}
                />
              )}

              <div className="flex flex-col h-full">
                {/* Header */}
                <div className={`p-6 border-b transition-colors ${
                  isDark ? 'border-white/20' : 'border-white/30'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                        Dashboard
                      </h2>
                      <p className={`text-sm transition-colors ${
                        isDark ? 'text-white/70' : 'text-white/80'
                      }`}>Welcome back, {user.username}</p>
                    </div>
                    {!isMobile && (
                      <ThemeToggle size="sm" className="ml-4" />
                    )}
                  </div>
                </div>

                {/* User Profile Card */}
                <div className={`p-6 border-b transition-colors ${
                  isDark ? 'border-white/20' : 'border-white/30'
                }`}>
                  <UserProfileCard 
                    user={user} 
                    className={`transition-colors ${
                      isDark ? 'bg-white/5' : 'bg-white/20'
                    }`} 
                  />
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-6 space-y-2">
                  {availableTabs.map((tab) => {
                    const Icon = activeTab === tab.id ? tab.solidIcon : tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`
                          w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200
                          ${activeTab === tab.id 
                            ? 'bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 text-white border border-white/30 shadow-lg' 
                            : isDark 
                              ? 'text-white/70 hover:text-white hover:bg-white/10' 
                              : 'text-white/80 hover:text-white hover:bg-white/20'
                          }
                        `}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{tab.name}</span>
                        </div>
                        {tab.badge && (
                          <ModernBadge variant="primary" size="sm">
                            {tab.badge}
                          </ModernBadge>
                        )}
                      </button>
                    );
                  })}
                </nav>

                {/* Footer Actions */}
                <div className={`p-6 border-t transition-colors space-y-3 ${
                  isDark ? 'border-white/20' : 'border-white/30'
                }`}>
                  <ModernButton
                    variant="secondary"
                    className="w-full"
                    onClick={() => router.push('/')}
                  >
                    <HomeIcon className="w-4 h-4 mr-2" />
                    Back to Site
                  </ModernButton>
                  
                  <ModernButton
                    variant="secondary"
                    className="w-full"
                    onClick={() => router.push('/settings')}
                  >
                    <Cog6ToothIcon className="w-4 h-4 mr-2" />
                    Settings
                  </ModernButton>
                  
                  <ModernButton
                    variant="outline"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    <ArrowLeftOnRectangleIcon className="w-4 h-4 mr-2" />
                    Logout
                  </ModernButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 min-h-screen relative z-10">
          <div className="p-6" {...swipeHandlers}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <ActiveComponent />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      {isMobile && (
        <div className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ${
          isDark 
            ? 'bg-white/10 backdrop-blur-md border-t border-white/20' 
            : 'bg-white/30 backdrop-blur-md border-t border-white/40'
        }`}>
          <div className="flex justify-around items-center py-2">
            {availableTabs.slice(0, 5).map((tab) => {
              const Icon = activeTab === tab.id ? tab.solidIcon : tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    flex flex-col items-center p-2 rounded-lg transition-colors relative
                    ${activeTab === tab.id 
                      ? 'text-white bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20' 
                      : isDark 
                        ? 'text-white/70' 
                        : 'text-white/80'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs mt-1 truncate max-w-[60px]">
                    {tab.name.split(' ')[0]}
                  </span>
                  {tab.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {tab.badge > 9 ? '9+' : tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
