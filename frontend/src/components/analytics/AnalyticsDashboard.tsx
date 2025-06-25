/**
 * AnalyticsDashboard - Comprehensive analytics dashboard with modern design
 * Features: real-time metrics, charts, insights, reports
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ModernBadge } from '../ui/ModernBadge';
import { ModernButton } from '../ui/ModernButton';
import { cn } from '../../utils/cn';
import AnalyticsService from '../../services/AnalyticsService';
import type {
  UserAnalytics,
  NegotiationAnalytics,
  ProductAnalytics,
  SystemAnalytics,
  AnalyticsPeriod,
  AnalyticsInsight
} from '../../types/Analytics';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ShoppingBagIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface AnalyticsDashboardProps {
  className?: string;
  userRole?: 'user' | 'admin';
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ComponentType<any>;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  color = 'blue',
  loading = false
}) => {
  const colorConfig = {
    blue: 'bg-blue-500/20 text-blue-400 border-blue-400/30',
    green: 'bg-green-500/20 text-green-400 border-green-400/30',
    yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30',
    red: 'bg-red-500/20 text-red-400 border-red-400/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-400/30'
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="w-12 h-12 bg-white/10 rounded-lg mb-4"></div>
          <div className="h-4 bg-white/10 rounded mb-2"></div>
          <div className="h-8 bg-white/10 rounded mb-2"></div>
          <div className="h-3 bg-white/10 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:bg-white/10 transition-colors"
    >
      <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center mb-4', colorConfig[color])}>
        <Icon className="w-6 h-6" />
      </div>
      
      <h3 className="text-white/70 text-sm font-medium mb-2">{title}</h3>
      
      <div className="text-2xl font-bold text-white mb-2">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      
      {change !== undefined && (
        <div className="flex items-center space-x-1">
          {change > 0 ? (
            <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
          ) : change < 0 ? (
            <ArrowTrendingDownIcon className="w-4 h-4 text-red-400" />
          ) : null}
          <span className={cn(
            'text-sm font-medium',
            change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-white/60'
          )}>
            {change > 0 ? '+' : ''}{change.toFixed(1)}%
          </span>
          {changeLabel && (
            <span className="text-white/50 text-sm">{changeLabel}</span>
          )}
        </div>
      )}
    </motion.div>
  );
};

const InsightCard: React.FC<{ insight: AnalyticsInsight }> = ({ insight }) => {
  const getInsightColor = () => {
    switch (insight.type) {
      case 'opportunity': return 'border-green-400/50 bg-green-500/10';
      case 'warning': return 'border-yellow-400/50 bg-yellow-500/10';
      case 'anomaly': return 'border-red-400/50 bg-red-500/10';
      default: return 'border-blue-400/50 bg-blue-500/10';
    }
  };

  const getInsightIcon = () => {
    switch (insight.type) {
      case 'opportunity': return '💡';
      case 'warning': return '⚠️';
      case 'anomaly': return '🚨';
      case 'trend': return '📈';
      default: return '📊';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'p-4 rounded-lg border backdrop-blur-sm',
        getInsightColor()
      )}
    >
      <div className="flex items-start space-x-3">
        <span className="text-lg">{getInsightIcon()}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-white font-medium text-sm">{insight.title}</h4>
            <ModernBadge
              variant={insight.importance === 'critical' ? 'error' : 
                      insight.importance === 'high' ? 'warning' : 'info'}
              size="sm"
            >
              {insight.importance}
            </ModernBadge>
          </div>
          <p className="text-white/70 text-sm mb-3">{insight.description}</p>
          
          {insight.recommendations.length > 0 && (
            <div className="space-y-1">
              <p className="text-white/60 text-xs font-medium">Recommendations:</p>
              {insight.recommendations.slice(0, 2).map((rec, index) => (
                <p key={index} className="text-white/60 text-xs">• {rec}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  className,
  userRole = 'user'
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'negotiations' | 'products' | 'insights'>('overview');
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [negotiationAnalytics, setNegotiationAnalytics] = useState<NegotiationAnalytics | null>(null);
  const [productAnalytics, setProductAnalytics] = useState<ProductAnalytics | null>(null);
  const [systemAnalytics, setSystemAnalytics] = useState<SystemAnalytics | null>(null);
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);

  const analyticsService = AnalyticsService.getInstance();

  const getPeriodData = (): AnalyticsPeriod => {
    switch (period) {
      case '7d': return AnalyticsService.getLastDays(7);
      case '30d': return AnalyticsService.getLastDays(30);
      case '90d': return AnalyticsService.getLastDays(90);
      case '1y': return AnalyticsService.getLastDays(365);
      default: return AnalyticsService.getLastDays(30);
    }
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const periodData = getPeriodData();
      const userId = localStorage.getItem('user_id');

      const [user, negotiations, products, system, insightsData] = await Promise.all([
        userId ? analyticsService.getUserAnalytics(userId, periodData) : null,
        analyticsService.getNegotiationAnalytics(periodData),
        analyticsService.getProductAnalytics(periodData),
        userRole === 'admin' ? analyticsService.getSystemAnalytics(periodData) : null,
        analyticsService.getInsights()
      ]);

      setUserAnalytics(user);
      setNegotiationAnalytics(negotiations);
      setProductAnalytics(products);
      setSystemAnalytics(system);
      setInsights(insightsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const report = await analyticsService.generateReport(
        'user',
        getPeriodData(),
        undefined,
        'pdf'
      );
      
      if (report?.downloadUrl) {
        window.open(report.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, userRole]);

  useEffect(() => {
    // Set up real-time updates
    const unsubscribe = analyticsService.subscribeToRealtimeAnalytics((data) => {
      // Update relevant analytics based on real-time data
      if (data.type === 'user' && userAnalytics) {
        setUserAnalytics(prev => prev ? { ...prev, ...data.updates } : null);
      }
    });

    return unsubscribe;
  }, [userAnalytics]);

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Sessions"
          value={userAnalytics?.metrics.totalSessions || 0}
          change={userAnalytics?.trends.totalSessions?.changePercent}
          changeLabel="vs last period"
          icon={UsersIcon}
          color="blue"
          loading={loading}
        />
        
        <MetricCard
          title="Messages Sent"
          value={userAnalytics?.metrics.messagesExchanged || 0}
          change={userAnalytics?.trends.messagesExchanged?.changePercent}
          changeLabel="vs last period"
          icon={ChartBarIcon}
          color="green"
          loading={loading}
        />
        
        <MetricCard
          title="Successful Deals"
          value={negotiationAnalytics?.metrics.successfulDeals || 0}
          change={negotiationAnalytics?.metrics.successRate}
          changeLabel="success rate"
          icon={CurrencyDollarIcon}
          color="yellow"
          loading={loading}
        />
        
        <MetricCard
          title="Products Viewed"
          value={userAnalytics?.metrics.productsViewed || 0}
          change={userAnalytics?.trends.productsViewed?.changePercent}
          changeLabel="vs last period"
          icon={ShoppingBagIcon}
          color="purple"
          loading={loading}
        />
      </div>

      {/* Performance Metrics */}
      {userAnalytics && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6">
          <h3 className="text-white font-semibold text-lg mb-4">Performance Overview</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {userAnalytics.metrics.averageSessionDuration.toFixed(1)}min
              </div>
              <div className="text-white/60 text-sm">Avg Session Duration</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {(userAnalytics.metrics.conversionRate * 100).toFixed(1)}%
              </div>
              <div className="text-white/60 text-sm">Conversion Rate</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {userAnalytics.metrics.bounceRate.toFixed(1)}%
              </div>
              <div className="text-white/60 text-sm">Bounce Rate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderNegotiationsTab = () => (
    <div className="space-y-6">
      {negotiationAnalytics && (
        <>
          {/* Negotiation Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Success Rate"
              value={`${(negotiationAnalytics.metrics.successRate * 100).toFixed(1)}%`}
              icon={ArrowTrendingUpIcon}
              color="green"
            />
            
            <MetricCard
              title="Avg Rounds"
              value={negotiationAnalytics.metrics.averageRounds.toFixed(1)}
              icon={ClockIcon}
              color="blue"
            />
            
            <MetricCard
              title="Avg Discount"
              value={`${(negotiationAnalytics.metrics.averageDiscount * 100).toFixed(1)}%`}
              icon={CurrencyDollarIcon}
              color="yellow"
            />
          </div>

          {/* Negotiation Insights */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6">
            <h3 className="text-white font-semibold text-lg mb-4">Negotiation Insights</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-white/80 font-medium mb-2">Best Performing Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {negotiationAnalytics.insights.bestPerformingCategories.map((category, index) => (
                    <ModernBadge key={index} variant="success" size="sm">
                      {category}
                    </ModernBadge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-white/80 font-medium mb-2">Optimal Price Ranges</h4>
                <div className="flex flex-wrap gap-2">
                  {negotiationAnalytics.insights.optimalPriceRanges.map((range, index) => (
                    <ModernBadge key={index} variant="info" size="sm">
                      {range}
                    </ModernBadge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-white/80 font-medium mb-2">Recommended Strategies</h4>
                <ul className="text-white/70 text-sm space-y-1">
                  {negotiationAnalytics.insights.recommendedStrategies.map((strategy, index) => (
                    <li key={index}>• {strategy}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderProductsTab = () => (
    <div className="space-y-6">
      {productAnalytics && (
        <>
          {/* Product Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Total Views"
              value={productAnalytics.metrics.totalViews}
              icon={ShoppingBagIcon}
              color="blue"
            />
            
            <MetricCard
              title="Engagement Rate"
              value={`${(productAnalytics.metrics.clickThroughRate * 100).toFixed(1)}%`}
              icon={ArrowTrendingUpIcon}
              color="green"
            />
            
            <MetricCard
              title="Avg View Time"
              value={`${productAnalytics.metrics.averageViewTime.toFixed(1)}s`}
              icon={ClockIcon}
              color="purple"
            />
          </div>

          {/* Top Performing Content */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6">
            <h3 className="text-white font-semibold text-lg mb-4">Performance Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white/80 font-medium mb-3">Top Countries</h4>
                <div className="space-y-2">
                  {productAnalytics.metrics.topCountries.slice(0, 5).map((country, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-white/70 text-sm">{country.country}</span>
                      <span className="text-white text-sm font-medium">{country.views}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-white/80 font-medium mb-3">Search Keywords</h4>
                <div className="space-y-2">
                  {productAnalytics.metrics.searchKeywords.slice(0, 5).map((keyword, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-white/70 text-sm">{keyword.keyword}</span>
                      <span className="text-white text-sm font-medium">{keyword.impressions}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderInsightsTab = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6">
        <h3 className="text-white font-semibold text-lg mb-4">AI-Powered Insights</h3>
        
        {insights.length > 0 ? (
          <div className="space-y-4">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ChartBarIcon className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/60">No insights available yet</p>
            <p className="text-white/40 text-sm">Check back later for AI-powered recommendations</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-white/60">Track your performance and discover insights</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Period Selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d" className="bg-gray-900">Last 7 days</option>
            <option value="30d" className="bg-gray-900">Last 30 days</option>
            <option value="90d" className="bg-gray-900">Last 90 days</option>
            <option value="1y" className="bg-gray-900">Last year</option>
          </select>
          
          <ModernButton
            variant="outline"
            size="sm"
            onClick={handleExportReport}
            className="flex items-center space-x-2"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>Export</span>
          </ModernButton>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/10 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'negotiations', label: 'Negotiations' },
          { id: 'products', label: 'Products' },
          { id: 'insights', label: 'Insights' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors',
              activeTab === tab.id
                ? 'bg-blue-500 text-white'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'negotiations' && renderNegotiationsTab()}
        {activeTab === 'products' && renderProductsTab()}
        {activeTab === 'insights' && renderInsightsTab()}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
