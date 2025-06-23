import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { productAPI } from '../../utils/api';
import { BackdropBlur } from '../ui/BackdropBlur';
import { ModernButton } from '../ui/ModernButton';
import { 
  EyeIcon, 
  HeartIcon, 
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface ProductAnalyticsProps {
  productId: string;
  onClose?: () => void;
}

interface Analytics {
  views: number;
  favorites: number;
  inquiries: number;
  negotiations: number;
  activeNegotiations: number;
  averageOfferPrice: number;
  lastViewed: string;
  impressions: Array<{
    date: string;
    count: number;
  }>;
  conversionRate: number;
}

export const ProductAnalytics: React.FC<ProductAnalyticsProps> = ({
  productId,
  onClose
}) => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productAPI.getAnalytics(productId);
        setAnalytics(response.data.analytics);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [productId]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getRecentImpressionsData = () => {
    if (!analytics?.impressions) return [];
    
    const last7Days = analytics.impressions.slice(-7);
    return last7Days.map((impression, index) => ({
      day: new Date(impression.date).toLocaleDateString('en-US', { weekday: 'short' }),
      views: impression.count,
      index
    }));
  };

  if (loading) {
    return (
      <BackdropBlur className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4 text-center">Loading analytics...</p>
        </div>
      </BackdropBlur>
    );
  }

  if (error) {
    return (
      <BackdropBlur className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-md">
          <h2 className="text-xl font-semibold text-white mb-4">Error Loading Analytics</h2>
          <p className="text-white/80 mb-6">{error}</p>
          <div className="flex gap-3">
            <ModernButton variant="secondary" onClick={onClose} className="flex-1">
              Close
            </ModernButton>
            <ModernButton variant="primary" onClick={() => window.location.reload()} className="flex-1">
              Retry
            </ModernButton>
          </div>
        </div>
      </BackdropBlur>
    );
  }

  if (!analytics) return null;

  const impressionsData = getRecentImpressionsData();
  const maxViews = Math.max(...impressionsData.map(d => d.views), 1);

  return (
    <BackdropBlur className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Product Analytics</h2>
            <div className="flex gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <ModernButton variant="secondary" onClick={onClose}>
                Close
              </ModernButton>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <EyeIcon className="w-5 h-5 text-blue-400" />
                <TrendingUpIcon className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">{formatNumber(analytics.views)}</div>
              <div className="text-white/60 text-sm">Total Views</div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <HeartIcon className="w-5 h-5 text-red-400" />
                <TrendingUpIcon className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">{formatNumber(analytics.favorites)}</div>
              <div className="text-white/60 text-sm">Favorites</div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-400" />
                <span className="text-white/60 text-xs">
                  {analytics.activeNegotiations > 0 ? `${analytics.activeNegotiations} active` : ''}
                </span>
              </div>
              <div className="text-2xl font-bold text-white">{analytics.negotiations}</div>
              <div className="text-white/60 text-sm">Negotiations</div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <ChartBarIcon className="w-5 h-5 text-green-400" />
                <span className="text-white/60 text-xs">
                  {analytics.conversionRate > 5 ? (
                    <TrendingUpIcon className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDownIcon className="w-4 h-4 text-red-400" />
                  )}
                </span>
              </div>
              <div className="text-2xl font-bold text-white">{analytics.conversionRate.toFixed(1)}%</div>
              <div className="text-white/60 text-sm">Conversion Rate</div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <CurrencyDollarIcon className="w-5 h-5 text-yellow-400" />
                Pricing Insights
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/60">Average Offer</span>
                  <span className="text-white">{formatCurrency(analytics.averageOfferPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Total Inquiries</span>
                  <span className="text-white">{analytics.inquiries}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-blue-400" />
                Activity Timeline
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/60">Last Viewed</span>
                  <span className="text-white text-sm">
                    {analytics.lastViewed 
                      ? new Date(analytics.lastViewed).toLocaleDateString()
                      : 'Never'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Active Negotiations</span>
                  <span className="text-white">{analytics.activeNegotiations}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Views Chart */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-purple-400" />
              Daily Views (Last 7 Days)
            </h3>
            
            {impressionsData.length > 0 ? (
              <div className="space-y-3">
                {impressionsData.map((data) => (
                  <div key={data.index} className="flex items-center gap-3">
                    <div className="w-12 text-white/60 text-sm">{data.day}</div>
                    <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(data.views / maxViews) * 100}%` }}
                        transition={{ delay: data.index * 0.1 }}
                        className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                      />
                    </div>
                    <div className="w-12 text-white text-sm text-right">{data.views}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">
                No view data available for the selected period
              </div>
            )}
          </div>

          {/* Performance Summary */}
          <div className="mt-6 bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-white font-semibold mb-3">Performance Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {analytics.conversionRate > 10 ? 'Excellent' : 
                   analytics.conversionRate > 5 ? 'Good' : 
                   analytics.conversionRate > 2 ? 'Average' : 'Needs Improvement'}
                </div>
                <div className="text-white/60">Conversion Performance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {analytics.views > 100 ? 'High' : 
                   analytics.views > 50 ? 'Medium' : 'Low'}
                </div>
                <div className="text-white/60">View Engagement</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {analytics.negotiations > 5 ? 'Very Active' : 
                   analytics.negotiations > 2 ? 'Active' : 
                   analytics.negotiations > 0 ? 'Some Interest' : 'No Activity'}
                </div>
                <div className="text-white/60">Negotiation Activity</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </BackdropBlur>
  );
};
