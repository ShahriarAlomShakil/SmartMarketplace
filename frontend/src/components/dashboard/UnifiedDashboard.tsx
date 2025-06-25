import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  ChartBarIcon,
  TrophyIcon,
  CurrencyDollarIcon,
  ClockIcon,
  StarIcon,
  EyeIcon,
  HandThumbUpIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import { BlurCard } from '../ui/BlurCard';
import { ModernButton } from '../ui/ModernButton';
import { useAuth } from '../../contexts/AuthContext';
import { productAPI } from '../../utils/api';

interface UnifiedStats {
  // Buying Stats
  totalPurchases: number;
  activeNegotiations: number;
  wishlistItems: number;
  totalSaved: number;
  avgNegotiationTime: number;
  buyerSuccessRate: number;
  
  // Selling Stats
  totalProducts: number;
  activeProducts: number;
  soldProducts: number;
  totalViews: number;
  totalEarnings: number;
  avgProductPrice: number;
  monthlyViews: number;
  monthlyEarnings: number;
  sellerConversionRate: number;
  
  // Combined Stats
  favoriteCategories: string[];
  recentActivity: Array<{
    id: string;
    type: 'negotiation' | 'purchase' | 'wishlist' | 'view' | 'listing' | 'sale';
    productTitle: string;
    productImage?: string;
    amount?: number;
    status?: string;
    timestamp: string;
  }>;
  topPerformingProducts: Array<{
    _id: string;
    title: string;
    views: number;
    pricing: { basePrice: number; currency: string };
  }>;
}

interface UnifiedDashboardProps {
  className?: string;
  onCreateProduct?: () => void;
}

export const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({
  className = "",
  onCreateProduct
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UnifiedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeView, setActiveView] = useState<'overview' | 'buying' | 'selling'>('overview');

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch user's products (selling data)
      const productsResponse = await productAPI.getByUser(user?._id || '', {
        page: 1,
        limit: 100,
        status: 'all'
      });

      const products = productsResponse.data.products;
      
      // Calculate selling stats
      const totalProducts = products.length;
      const activeProducts = products.filter((p: any) => p.status === 'active').length;
      const soldProducts = products.filter((p: any) => p.status === 'sold').length;
      const totalViews = products.reduce((sum: number, p: any) => sum + (p.analytics?.views || 0), 0);
      const totalEarnings = products
        .filter((p: any) => p.status === 'sold')
        .reduce((sum: number, p: any) => sum + (p.finalPrice || p.pricing?.basePrice || 0), 0);
      
      const avgProductPrice = totalProducts > 0 
        ? products.reduce((sum: number, p: any) => sum + (p.pricing?.basePrice || 0), 0) / totalProducts 
        : 0;

      // Mock buying stats (would be fetched from negotiation/purchase APIs)
      const mockBuyingStats = {
        totalPurchases: 12,
        activeNegotiations: 3,
        wishlistItems: 8,
        totalSaved: 450,
        avgNegotiationTime: 2.5,
        buyerSuccessRate: 78,
      };

      // Mock recent activity
      const recentActivity = [
        {
          id: '1',
          type: 'purchase' as const,
          productTitle: 'iPhone 13 Pro',
          amount: 850,
          status: 'completed',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          type: 'listing' as const,
          productTitle: 'MacBook Air M2',
          amount: 1200,
          status: 'active',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'negotiation' as const,
          productTitle: 'Gaming Setup',
          amount: 1500,
          status: 'in_progress',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
        }
      ];

      const unifiedStats: UnifiedStats = {
        ...mockBuyingStats,
        totalProducts,
        activeProducts,
        soldProducts,
        totalViews,
        totalEarnings,
        avgProductPrice,
        monthlyViews: Math.floor(totalViews * 0.3),
        monthlyEarnings: Math.floor(totalEarnings * 0.2),
        sellerConversionRate: totalViews > 0 ? (soldProducts / totalViews) * 100 : 0,
        favoriteCategories: ['Electronics', 'Computers', 'Mobile Phones'],
        recentActivity,
        topPerformingProducts: products
          .sort((a: any, b: any) => (b.analytics?.views || 0) - (a.analytics?.views || 0))
          .slice(0, 3)
      };

      setStats(unifiedStats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardStats();
  }, [timeRange, user, fetchDashboardStats]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'purchase': return ShoppingBagIcon;
      case 'listing': return BuildingStorefrontIcon;
      case 'negotiation': return ChatBubbleLeftRightIcon;
      case 'wishlist': return HeartIcon;
      case 'view': return EyeIcon;
      case 'sale': return CurrencyDollarIcon;
      default: return ChartBarIcon;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'purchase': return 'text-green-400';
      case 'listing': return 'text-blue-400';
      case 'negotiation': return 'text-yellow-400';
      case 'wishlist': return 'text-pink-400';
      case 'view': return 'text-purple-400';
      case 'sale': return 'text-emerald-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Unable to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-white/80 mt-1">
            Your marketplace activity at a glance
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-1 border border-white/10">
            {['overview', 'buying', 'selling'].map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view as any)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeView === view
                    ? 'bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 text-white border border-white/30'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
          
          <ModernButton
            onClick={onCreateProduct}
            className="bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 hover:from-blue-500/40 hover:via-purple-500/40 hover:to-pink-500/40 text-white border border-white/30"
            size="sm"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            List Item
          </ModernButton>
        </div>
      </div>

      {/* Overview Stats */}
      {activeView === 'overview' && (
        <>
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Purchases */}
            <BlurCard variant="elevated" className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/70">Purchases</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">{stats.totalPurchases}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg">
                  <ShoppingBagIcon className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </BlurCard>

            {/* Total Listings */}
            <BlurCard variant="elevated" className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/70">Listings</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">{stats.totalProducts}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg">
                  <BuildingStorefrontIcon className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </BlurCard>

            {/* Active Negotiations */}
            <BlurCard variant="elevated" className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/70">Active Chats</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">{stats.activeNegotiations}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </BlurCard>

            {/* Total Earnings */}
            <BlurCard variant="elevated" className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/70">Earnings</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">{formatCurrency(stats.totalEarnings)}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-lg">
                  <CurrencyDollarIcon className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </BlurCard>
          </div>

          {/* Recent Activity */}
          <BlurCard variant="elevated" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Recent Activity</h3>
              <button className="text-blue-400 hover:text-blue-300 text-sm">View All</button>
            </div>
            
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => {
                const IconComponent = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                    <div className={`p-2 rounded-lg bg-white/10 ${getActivityColor(activity.type)}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{activity.productTitle}</p>
                      <p className="text-gray-400 text-sm capitalize">
                        {activity.type.replace('_', ' ')} • {activity.status}
                      </p>
                    </div>
                    <div className="text-right">
                      {activity.amount && (
                        <p className="text-white font-medium">{formatCurrency(activity.amount)}</p>
                      )}
                      <p className="text-gray-400 text-sm">{formatTimeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </BlurCard>
        </>
      )}

      {/* Buying View */}
      {activeView === 'buying' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Buying Stats */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <BlurCard variant="elevated" className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Total Saved</p>
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(stats.totalSaved)}</p>
                  </div>
                  <TrophyIcon className="w-8 h-8 text-green-400" />
                </div>
              </BlurCard>

              <BlurCard variant="elevated" className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Success Rate</p>
                    <p className="text-2xl font-bold text-blue-400">{stats.buyerSuccessRate}%</p>
                  </div>
                  <StarIcon className="w-8 h-8 text-blue-400" />
                </div>
              </BlurCard>

              <BlurCard variant="elevated" className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Avg. Time</p>
                    <p className="text-2xl font-bold text-purple-400">{stats.avgNegotiationTime}h</p>
                  </div>
                  <ClockIcon className="w-8 h-8 text-purple-400" />
                </div>
              </BlurCard>
            </div>
          </div>

          {/* Wishlist Quick View */}
          <BlurCard variant="elevated" className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Wishlist Items</h3>
            <div className="text-center">
              <div className="p-4 bg-pink-500/20 rounded-lg inline-block mb-3">
                <HeartIcon className="w-8 h-8 text-pink-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.wishlistItems}</p>
              <p className="text-gray-400 text-sm">items saved</p>
            </div>
          </BlurCard>
        </div>
      )}

      {/* Selling View */}
      {activeView === 'selling' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Selling Stats */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <BlurCard variant="elevated" className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Total Views</p>
                    <p className="text-2xl font-bold text-blue-400">{stats.totalViews.toLocaleString()}</p>
                  </div>
                  <EyeIcon className="w-8 h-8 text-blue-400" />
                </div>
              </BlurCard>

              <BlurCard variant="elevated" className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Conversion Rate</p>
                    <p className="text-2xl font-bold text-green-400">{stats.sellerConversionRate.toFixed(1)}%</p>
                  </div>
                  <ArrowTrendingUpIcon className="w-8 h-8 text-green-400" />
                </div>
              </BlurCard>

              <BlurCard variant="elevated" className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Avg. Price</p>
                    <p className="text-2xl font-bold text-purple-400">{formatCurrency(stats.avgProductPrice)}</p>
                  </div>
                  <CurrencyDollarIcon className="w-8 h-8 text-purple-400" />
                </div>
              </BlurCard>
            </div>

            {/* Top Products */}
            <BlurCard variant="elevated" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Top Performing Products</h3>
              <div className="space-y-3">
                {stats.topPerformingProducts.map((product, index) => (
                  <div key={product._id} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <span className="text-blue-400 font-bold text-sm">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{product.title}</p>
                      <p className="text-gray-400 text-sm">{product.views} views</p>
                    </div>
                    <p className="text-white font-medium">
                      {formatCurrency(product.pricing.basePrice)}
                    </p>
                  </div>
                ))}
              </div>
            </BlurCard>
          </div>

          {/* Quick Actions */}
          <BlurCard variant="elevated" className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <ModernButton
                onClick={onCreateProduct}
                className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-blue-400/30"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Listing
              </ModernButton>
              
              <ModernButton
                variant="outline"
                className="w-full"
              >
                <ChartBarIcon className="w-4 h-4 mr-2" />
                View Analytics
              </ModernButton>
              
              <ModernButton
                variant="outline"
                className="w-full"
              >
                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                Manage Chats
              </ModernButton>
            </div>
          </BlurCard>
        </div>
      )}
    </div>
  );
};
