import React, { useState, useEffect, useCallback } from 'react';
import { BlurCard } from '../ui/BlurCard';
import { ModernBadge } from '../ui/ModernBadge';

interface ActivityTimelineProps {
  userId?: string;
  limit?: number;
  className?: string;
}

interface ActivityItem {
  type: string;
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  color: string;
}

/**
 * Activity Timeline - Day 18 Implementation
 * 
 * Features:
 * - Visual timeline with user activities
 * - Real-time activity updates
 * - Activity filtering and categorization
 * - Modern design with icons and colors
 * - Infinite scroll loading
 * - Activity insights and statistics
 */
export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  userId,
  limit = 20,
  className = ''
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/profile/activity-timeline?limit=${limit}&filter=${filter}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data.data.timeline.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
        setHasMore(data.data.timeline.length === limit);
      }
    } catch (error) {
      console.error('Failed to fetch activity timeline:', error);
    } finally {
      setLoading(false);
    }
  }, [limit, filter]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const loadMore = async () => {
    if (!hasMore || loading) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/profile/activity-timeline?limit=${limit}&offset=${activities.length}&filter=${filter}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const newActivities = data.data.timeline.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setActivities(prev => [...prev, ...newActivities]);
        setHasMore(newActivities.length === limit);
      }
    } catch (error) {
      console.error('Failed to load more activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      'product_listed': '🏷️',
      'negotiation_started': '💬',
      'negotiation_received': '📥',
      'deal_completed': '✅',
      'profile_updated': '👤',
      'review_received': '⭐',
      'product_sold': '💰',
      'verification_completed': '🔒',
      'account_created': '🎉'
    };
    return icons[type] || '📝';
  };

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      'product_listed': 'blue',
      'negotiation_started': 'green',
      'negotiation_received': 'purple',
      'deal_completed': 'emerald',
      'profile_updated': 'orange',
      'review_received': 'yellow',
      'product_sold': 'green',
      'verification_completed': 'blue',
      'account_created': 'purple'
    };
    return colors[type] || 'gray';
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  const getActivityCounts = () => {
    const counts = activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: activities.length,
      products: (counts.product_listed || 0) + (counts.product_sold || 0),
      negotiations: (counts.negotiation_started || 0) + (counts.negotiation_received || 0),
      deals: counts.deal_completed || 0
    };
  };

  const filterOptions = [
    { value: 'all', label: 'All Activities' },
    { value: 'products', label: 'Products' },
    { value: 'negotiations', label: 'Negotiations' },
    { value: 'deals', label: 'Deals' },
    { value: 'profile', label: 'Profile' }
  ];

  const counts = getActivityCounts();

  if (loading && activities.length === 0) {
    return (
      <BlurCard className={`p-8 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="w-8 h-8 bg-white/10 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/10 rounded w-3/4"></div>
                  <div className="h-2 bg-white/10 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </BlurCard>
    );
  }

  return (
    <BlurCard className={`p-8 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Activity Timeline</h2>
        <p className="text-white/70">Your recent activities and interactions</p>
        
        {/* Activity Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{counts.total}</div>
            <div className="text-white/60 text-sm">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{counts.products}</div>
            <div className="text-white/60 text-sm">Products</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{counts.negotiations}</div>
            <div className="text-white/60 text-sm">Negotiations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">{counts.deals}</div>
            <div className="text-white/60 text-sm">Deals</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === option.value
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {activities.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Activities Yet</h3>
          <p className="text-white/60">Start using the platform to see your activity timeline</p>
        </div>
      ) : (
        <div className="space-y-6">
          {activities.map((activity, index) => (
            <div key={index} className="flex space-x-4">
              {/* Timeline Line */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full bg-${getActivityColor(activity.type)}-500/20 border-2 border-${getActivityColor(activity.type)}-500/50 flex items-center justify-center text-lg backdrop-blur-sm`}>
                  {getActivityIcon(activity.type)}
                </div>
                {index < activities.length - 1 && (
                  <div className="w-0.5 h-8 bg-white/10 mt-2"></div>
                )}
              </div>

              {/* Activity Content */}
              <div className="flex-1 pb-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{activity.title}</h3>
                    <p className="text-white/60 text-sm mt-1">{activity.description}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <ModernBadge 
                      variant="secondary" 
                      size="sm"
                      className={`bg-${getActivityColor(activity.type)}-500/20 text-${getActivityColor(activity.type)}-300`}
                    >
                      {activity.type.replace('_', ' ')}
                    </ModernBadge>
                    <span className="text-white/50 text-sm">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-6">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    </BlurCard>
  );
};
