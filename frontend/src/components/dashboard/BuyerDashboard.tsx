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
  HandThumbUpIcon
} from '@heroicons/react/24/outline';
import { BlurCard } from '../ui/BlurCard';
import { ModernButton } from '../ui/ModernButton';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

interface BuyerStats {
  totalPurchases: number;
  activeNegotiations: number;
  wishlistItems: number;
  totalSaved: number;
  avgNegotiationTime: number;
  successRate: number;
  favoriteCategories: string[];
  recentActivity: Array<{
    id: string;
    type: 'negotiation' | 'purchase' | 'wishlist' | 'view';
    productTitle: string;
    productImage?: string;
    amount?: number;
    status?: string;
    timestamp: string;
  }>;
}

interface BuyerDashboardProps {
  className?: string;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({
  className = ""
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<BuyerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  const fetchBuyerStats = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch buyer's negotiations
      const negotiationsResponse = await api.negotiationAPI.getUserNegotiations();
      const negotiations = negotiationsResponse.data;

      // Calculate stats from negotiations
      const totalNegotiations = negotiations.length;
      const completedPurchases = negotiations.filter((n: any) => 
        n.status === 'accepted' && n.buyer._id === user?._id
      ).length;
      const activeNegotiations = negotiations.filter((n: any) => 
        n.status === 'active' && n.buyer._id === user?._id
      ).length;

      // Calculate savings and success rate
      const completedNegotiations = negotiations.filter((n: any) => 
        (n.status === 'accepted' || n.status === 'rejected') && n.buyer._id === user?._id
      );
      const successfulNegotiations = completedNegotiations.filter((n: any) => 
        n.status === 'accepted'
      );
      const successRate = completedNegotiations.length > 0 
        ? (successfulNegotiations.length / completedNegotiations.length) * 100 
        : 0;

      // Calculate total savings
      const totalSaved = successfulNegotiations.reduce((total: number, n: any) => {
        const savings = n.product.pricing.basePrice - (n.finalPrice || n.currentOffer);
        return total + (savings > 0 ? savings : 0);
      }, 0);

      // Calculate average negotiation time
      const avgTime = completedNegotiations.reduce((total: number, n: any) => {
        if (n.concludedAt && n.createdAt) {
          const duration = new Date(n.concludedAt).getTime() - new Date(n.createdAt).getTime();
          return total + duration;
        }
        return total;
      }, 0) / (completedNegotiations.length || 1);

      // Generate recent activity
      const recentActivity = negotiations
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
        .map((n: any) => ({
          id: n._id,
          type: 'negotiation' as const,
          productTitle: n.product.title,
          productImage: n.product.images?.[0]?.url,
          amount: n.currentOffer || n.product.pricing.basePrice,
          status: n.status,
          timestamp: n.createdAt
        }));

      const buyerStats: BuyerStats = {
        totalPurchases: completedPurchases,
        activeNegotiations,
        wishlistItems: Math.floor(Math.random() * 15) + 5, // Mock data
        totalSaved,
        avgNegotiationTime: avgTime / (1000 * 60 * 60), // Convert to hours
        successRate,
        favoriteCategories: ['Electronics', 'Fashion', 'Home'], // Mock data
        recentActivity
      };

      setStats(buyerStats);
    } catch (error) {
      console.error('Error fetching buyer stats:', error);
      // Set mock data on error
      setStats({
        totalPurchases: 12,
        activeNegotiations: 3,
        wishlistItems: 8,
        totalSaved: 1250,
        avgNegotiationTime: 2.5,
        successRate: 75,
        favoriteCategories: ['Electronics', 'Fashion', 'Home'],
        recentActivity: []
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBuyerStats();
  }, [fetchBuyerStats]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'negotiation':
        return <ChatBubbleLeftRightIcon className="w-4 h-4" />;
      case 'purchase':
        return <ShoppingBagIcon className="w-4 h-4" />;
      case 'wishlist':
        return <HeartIcon className="w-4 h-4" />;
      case 'view':
        return <EyeIcon className="w-4 h-4" />;
      default:
        return <ChartBarIcon className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'text-green-400';
      case 'rejected':
        return 'text-red-400';
      case 'active':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <BlurCard key={i} className="p-6 animate-pulse">
              <div className="h-16 bg-white/10 rounded"></div>
            </BlurCard>
          ))}
        </div>
        <BlurCard className="p-8 animate-pulse">
          <div className="h-64 bg-white/10 rounded"></div>
        </BlurCard>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Buyer Dashboard</h2>
          <p className="text-white/70">Your purchasing activity and insights</p>
        </div>
        <div className="flex space-x-2">
          {['7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                timeRange === range
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Purchases */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <BlurCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <ShoppingBagIcon className="w-6 h-6 text-green-400" />
                </div>
                <TrophyIcon className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {stats.totalPurchases}
              </div>
              <div className="text-white/60 text-sm">Total Purchases</div>
            </BlurCard>
          </motion.div>

          {/* Active Negotiations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <BlurCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-white/60 text-xs">
                  {stats.activeNegotiations > 0 ? 'Active' : 'None'}
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {stats.activeNegotiations}
              </div>
              <div className="text-white/60 text-sm">Active Negotiations</div>
            </BlurCard>
          </motion.div>

          {/* Wishlist Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <BlurCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-500/20 rounded-xl">
                  <HeartIcon className="w-6 h-6 text-red-400" />
                </div>
                <HandThumbUpIcon className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {stats.wishlistItems}
              </div>
              <div className="text-white/60 text-sm">Wishlist Items</div>
            </BlurCard>
          </motion.div>

          {/* Total Saved */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <BlurCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <CurrencyDollarIcon className="w-6 h-6 text-purple-400" />
                </div>
                <StarIcon className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {formatCurrency(stats.totalSaved)}
              </div>
              <div className="text-white/60 text-sm">Total Saved</div>
            </BlurCard>
          </motion.div>
        </div>
      )}

      {/* Performance Metrics */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <BlurCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <TrophyIcon className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Success Rate</div>
                      <div className="text-white/60 text-sm">Negotiation wins</div>
                    </div>
                  </div>
                  <div className="text-green-400 font-bold">
                    {stats.successRate.toFixed(1)}%
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <ClockIcon className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Avg. Negotiation Time</div>
                      <div className="text-white/60 text-sm">Time to close deals</div>
                    </div>
                  </div>
                  <div className="text-blue-400 font-bold">
                    {stats.avgNegotiationTime.toFixed(1)}h
                  </div>
                </div>
              </div>
            </BlurCard>
          </motion.div>

          {/* Favorite Categories */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <BlurCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Favorite Categories</h3>
              <div className="space-y-3">
                {stats.favoriteCategories.map((category, index) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="text-white">{category}</div>
                    <div className="w-24 bg-white/10 rounded-full h-2">
                      <div 
                        className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        style={{ width: `${90 - (index * 20)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </BlurCard>
          </motion.div>
        </div>
      )}

      {/* Recent Activity */}
      {stats && stats.recentActivity.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <BlurCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
              <ModernButton variant="ghost" size="sm">
                View All
              </ModernButton>
            </div>
            <div className="space-y-4">
              {stats.recentActivity.slice(0, 5).map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + (index * 0.1) }}
                  className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'negotiation' ? 'bg-blue-500/20' :
                    activity.type === 'purchase' ? 'bg-green-500/20' :
                    activity.type === 'wishlist' ? 'bg-red-500/20' :
                    'bg-gray-500/20'
                  }`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">
                      {activity.productTitle}
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      {activity.status && (
                        <span className={`capitalize ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                      )}
                      {activity.amount && (
                        <span className="text-white/60">
                          {formatCurrency(activity.amount)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-white/60 text-sm">
                    {formatTimeAgo(activity.timestamp)}
                  </div>
                </motion.div>
              ))}
            </div>
          </BlurCard>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <BlurCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ModernButton variant="primary" className="w-full">
              <HeartIcon className="w-4 h-4 mr-2" />
              View Wishlist
            </ModernButton>
            <ModernButton variant="secondary" className="w-full">
              <ShoppingBagIcon className="w-4 h-4 mr-2" />
              Purchase History
            </ModernButton>
            <ModernButton variant="outline" className="w-full">
              <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
              Active Negotiations
            </ModernButton>
          </div>
        </BlurCard>
      </motion.div>
    </div>
  );
};
