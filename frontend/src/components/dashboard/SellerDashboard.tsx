import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { productAPI, authAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { BackdropBlur } from '../ui/BackdropBlur';
import { ModernButton } from '../ui/ModernButton';
import { ProductManagement } from '../product/ProductManagement';
import { ProductAnalytics } from '../product/ProductAnalytics';
import { 
  PlusIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  EyeIcon,
  ShoppingBagIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  soldProducts: number;
  totalViews: number;
  totalEarnings: number;
  avgProductPrice: number;
  monthlyViews: number;
  monthlyEarnings: number;
  conversionRate: number;
  topPerformingProducts: Array<{
    _id: string;
    title: string;
    views: number;
    pricing: { basePrice: number; currency: string };
  }>;
}

interface SellerDashboardProps {
  onCreateProduct?: () => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  onCreateProduct
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnalyticsProduct, setSelectedAnalyticsProduct] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchDashboardStats();
  }, [timeRange]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch seller's products
      const productsResponse = await productAPI.getBySeller(user?._id || '', {
        page: 1,
        limit: 100,
        status: 'all'
      });

      const products = productsResponse.data.products;
      
      // Calculate stats
      const totalProducts = products.length;
      const activeProducts = products.filter((p: any) => p.status === 'active').length;
      const soldProducts = products.filter((p: any) => p.status === 'sold').length;
      const totalViews = products.reduce((sum: number, p: any) => sum + (p.analytics?.views || 0), 0);
      const totalEarnings = products
        .filter((p: any) => p.status === 'sold')
        .reduce((sum: number, p: any) => sum + p.pricing.basePrice, 0);
      
      const avgProductPrice = products.length > 0 
        ? products.reduce((sum: number, p: any) => sum + p.pricing.basePrice, 0) / products.length
        : 0;

      const topPerformingProducts = products
        .sort((a: any, b: any) => (b.analytics?.views || 0) - (a.analytics?.views || 0))
        .slice(0, 5);

      setStats({
        totalProducts,
        activeProducts,
        soldProducts,
        totalViews,
        totalEarnings,
        avgProductPrice,
        monthlyViews: Math.floor(totalViews * 0.3), // Estimate
        monthlyEarnings: Math.floor(totalEarnings * 0.3), // Estimate
        conversionRate: totalViews > 0 ? (soldProducts / totalViews) * 100 : 0,
        topPerformingProducts
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BackdropBlur className="p-8 rounded-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4 text-center">Loading dashboard...</p>
        </BackdropBlur>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Seller Dashboard
            </h1>
            <p className="text-white/70">
              Manage your products and track your sales performance
            </p>
          </div>
          
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
            
            <ModernButton 
              onClick={onCreateProduct}
              className="flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              List New Product
            </ModernButton>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <BackdropBlur className="p-6 rounded-xl border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <ShoppingBagIcon className="w-8 h-8 text-blue-400" />
                <span className="text-2xl font-bold text-white">
                  {stats.totalProducts}
                </span>
              </div>
              <div className="text-white/70 text-sm">Total Products</div>
              <div className="text-green-400 text-xs mt-1 flex items-center gap-1">
                <ArrowTrendingUpIcon className="w-3 h-3" />
                {stats.activeProducts} active
              </div>
            </BackdropBlur>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <BackdropBlur className="p-6 rounded-xl border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <EyeIcon className="w-8 h-8 text-purple-400" />
                <span className="text-2xl font-bold text-white">
                  {formatNumber(stats.totalViews)}
                </span>
              </div>
              <div className="text-white/70 text-sm">Total Views</div>
              <div className="text-blue-400 text-xs mt-1 flex items-center gap-1">
                <ArrowTrendingUpIcon className="w-3 h-3" />
                {formatNumber(stats.monthlyViews)} this month
              </div>
            </BackdropBlur>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <BackdropBlur className="p-6 rounded-xl border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <CurrencyDollarIcon className="w-8 h-8 text-green-400" />
                <span className="text-2xl font-bold text-white">
                  {formatCurrency(stats.totalEarnings)}
                </span>
              </div>
              <div className="text-white/70 text-sm">Total Earnings</div>
              <div className="text-green-400 text-xs mt-1 flex items-center gap-1">
                <ArrowTrendingUpIcon className="w-3 h-3" />
                {formatCurrency(stats.monthlyEarnings)} this month
              </div>
            </BackdropBlur>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <BackdropBlur className="p-6 rounded-xl border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <ChartBarIcon className="w-8 h-8 text-yellow-400" />
                <span className="text-2xl font-bold text-white">
                  {stats.conversionRate.toFixed(1)}%
                </span>
              </div>
              <div className="text-white/70 text-sm">Conversion Rate</div>
              <div className={`text-xs mt-1 flex items-center gap-1 ${
                stats.conversionRate > 5 ? 'text-green-400' : 'text-red-400'
              }`}>
                {stats.conversionRate > 5 ? (
                  <ArrowTrendingUpIcon className="w-3 h-3" />
                ) : (
                  <ArrowTrendingDownIcon className="w-3 h-3" />
                )}
                {stats.conversionRate > 5 ? 'Excellent' : 'Needs improvement'}
              </div>
            </BackdropBlur>
          </motion.div>
        </div>
      )}

      {/* Top Performing Products */}
      {stats && stats.topPerformingProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <BackdropBlur className="p-6 rounded-xl border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <ArrowTrendingUpIcon className="w-5 h-5 text-green-400" />
              Top Performing Products
            </h2>
            
            <div className="space-y-3">
              {stats.topPerformingProducts.map((product, index) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-white font-medium">{product.title}</div>
                      <div className="text-white/60 text-sm">{product.views} views</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-white font-medium">
                      {formatCurrency(product.pricing.basePrice)}
                    </span>
                    <ModernButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedAnalyticsProduct(product._id)}
                    >
                      <ChartBarIcon className="w-4 h-4" />
                    </ModernButton>
                  </div>
                </div>
              ))}
            </div>
          </BackdropBlur>
        </motion.div>
      )}

      {/* Product Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8"
      >
        <BackdropBlur className="p-6 rounded-xl border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">
            Product Management
          </h2>
          <ProductManagement />
        </BackdropBlur>
      </motion.div>

      {/* Analytics Modal */}
      {selectedAnalyticsProduct && (
        <ProductAnalytics
          productId={selectedAnalyticsProduct}
          onClose={() => setSelectedAnalyticsProduct(null)}
        />
      )}
    </div>
  );
};
