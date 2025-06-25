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
import { SellerDashboard } from '../components/dashboard/SellerDashboard';
import { BuyerDashboard } from '../components/dashboard/BuyerDashboard';
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

// Import hooks and context
import { useAuth } from '../contexts/AuthContext';
import { useSwipeGestures, useDeviceDetection, useLongPress } from '../utils/mobileUtils';

interface DashboardTab {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  solidIcon: React.ComponentType<any>;
  component: React.ComponentType<any>;
  badge?: number;
  requiredRole?: 'seller' | 'buyer';
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { isMobile, isTablet } = useDeviceDetection();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [notifications, setNotifications] = useState(3); // Mock notification count

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
    if (!user) {
      router.push('/login');
      return;
    }
  }, [user, router]);

  // Dashboard tabs configuration
  const dashboardTabs: DashboardTab[] = [
    {
      id: 'overview',
      name: 'Overview',
      icon: HomeIcon,
      solidIcon: HomeIconSolid,
      component: user?.role === 'seller' ? SellerDashboard : BuyerDashboard
    },
    {
      id: 'buyer',
      name: 'Buyer Dashboard',
      icon: ShoppingBagIcon,
      solidIcon: ShoppingBagIconSolid,
      component: BuyerDashboard
    },
    {
      id: 'seller',
      name: 'Seller Dashboard',
      icon: BuildingStorefrontIcon,
      solidIcon: BuildingStorefrontIconSolid,
      component: SellerDashboard,
      requiredRole: 'seller'
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
      component: CustomerManagement,
      requiredRole: 'seller'
    }
  ];

  // Filter tabs based on user role
  const availableTabs = dashboardTabs.filter(tab => 
    !tab.requiredRole || tab.requiredRole === user?.role
  );

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <BackdropBlur className="p-8 rounded-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4 text-center">Loading dashboard...</p>
        </BackdropBlur>
      </div>
    );
  }

  const ActiveComponent = availableTabs.find(tab => tab.id === activeTab)?.component || BuyerDashboard;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mobile Header */}
      {isMobile && (
        <div className="sticky top-0 z-40 bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              {...longPressProps}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <h1 className="text-xl font-bold text-white">
              {availableTabs.find(tab => tab.id === activeTab)?.name}
            </h1>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => handleTabChange('notifications')}
                className="relative p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <BellIcon className="w-6 h-6" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
            </div>
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
                w-80 bg-white/5 backdrop-blur-md border-r border-white/20
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
                <div className="p-6 border-b border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white">Dashboard</h2>
                      <p className="text-white/70 text-sm">Welcome back, {user.username}</p>
                    </div>
                    {!isMobile && notifications > 0 && (
                      <button 
                        onClick={() => handleTabChange('notifications')}
                        className="relative p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                      >
                        <BellIcon className="w-6 h-6" />
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {notifications}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* User Profile Card */}
                <div className="p-6 border-b border-white/20">
                  <UserProfileCard user={user} className="bg-white/5" />
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
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                            : 'text-white/70 hover:text-white hover:bg-white/10'
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
                <div className="p-6 border-t border-white/20 space-y-3">
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
        <div className="flex-1 min-h-screen">
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
        <div className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/20 z-40">
          <div className="flex justify-around items-center py-2">
            {availableTabs.slice(0, 5).map((tab) => {
              const Icon = activeTab === tab.id ? tab.solidIcon : tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    flex flex-col items-center p-2 rounded-lg transition-colors relative
                    ${activeTab === tab.id ? 'text-blue-400' : 'text-white/70'}
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
