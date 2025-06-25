import React, { useState, useEffect } from 'react';
import { BlurCard } from '../ui/BlurCard';
import { ModernButton } from '../ui/ModernButton';
import { ModernBadge } from '../ui/ModernBadge';

interface ProfileInsightsProps {
  userId?: string;
  className?: string;
}

interface Insight {
  profileCompleteness: {
    percentage: number;
    completedFields: number;
    totalFields: number;
    missingFields: number;
  };
  recommendedActions: Array<{
    type: string;
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    action: string;
  }>;
  upcomingFeatures: Array<{
    name: string;
    description: string;
    availability: string;
    benefit: string;
  }>;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    unlockedAt: Date;
    icon: string;
  }>;
}

/**
 * Profile Insights Dashboard - Day 18 Implementation
 * 
 * Features:
 * - Profile completeness tracker
 * - Personalized recommendations
 * - Achievement tracking
 * - Trust score insights
 * - Performance suggestions
 * - Upcoming feature previews
 */
export const ProfileInsights: React.FC<ProfileInsightsProps> = ({
  userId,
  className = ''
}) => {
  const [insights, setInsights] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeRecommendation, setActiveRecommendation] = useState<number | null>(null);

  useEffect(() => {
    fetchInsights();
  }, [userId]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profile/insights', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInsights(data.data.insights);
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = async (action: string) => {
    switch (action) {
      case 'upload_avatar':
        // Trigger avatar upload
        break;
      case 'add_bio':
        // Navigate to profile edit
        break;
      case 'verify_account':
        // Navigate to verification
        break;
      case 'connect_social':
        // Navigate to social connections
        break;
      default:
        console.log('Action not implemented:', action);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getCompletenessColor = (percentage: number) => {
    if (percentage >= 80) return 'from-green-500 to-emerald-500';
    if (percentage >= 60) return 'from-blue-500 to-purple-500';
    if (percentage >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  if (loading) {
    return (
      <BlurCard className={`p-8 ${className}`}>
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-white/10 rounded w-1/3"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-white/10 rounded"></div>
            ))}
          </div>
        </div>
      </BlurCard>
    );
  }

  if (!insights) {
    return (
      <BlurCard className={`p-8 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-4">💡</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Insights Available</h3>
          <p className="text-white/60">Complete your profile to get personalized insights</p>
        </div>
      </BlurCard>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Profile Completeness */}
      <BlurCard className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white mb-2">Profile Completeness</h3>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${getCompletenessColor(insights.profileCompleteness.percentage)} transition-all duration-1000`}
                  style={{ width: `${insights.profileCompleteness.percentage}%` }}
                />
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {insights.profileCompleteness.percentage}%
              </div>
              <div className="text-white/60 text-sm">
                {insights.profileCompleteness.completedFields}/{insights.profileCompleteness.totalFields} completed
              </div>
            </div>
          </div>
        </div>
        
        {insights.profileCompleteness.percentage < 100 && (
          <div className="text-white/70 text-sm">
            Complete {insights.profileCompleteness.missingFields} more fields to improve your profile visibility and trust score.
          </div>
        )}
      </BlurCard>

      {/* Recommended Actions */}
      {insights.recommendedActions.length > 0 && (
        <BlurCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recommended Actions</h3>
          <div className="space-y-3">
            {insights.recommendedActions.map((action, index) => (
              <div 
                key={index}
                className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => setActiveRecommendation(activeRecommendation === index ? null : index)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <ModernBadge 
                        size="sm" 
                        className={getPriorityColor(action.priority)}
                      >
                        {action.priority.toUpperCase()}
                      </ModernBadge>
                      <h4 className="text-white font-medium">{action.title}</h4>
                    </div>
                    <p className="text-white/60 text-sm">{action.description}</p>
                    
                    {activeRecommendation === index && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <ModernButton
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActionClick(action.action);
                          }}
                        >
                          Take Action
                        </ModernButton>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <svg 
                      className={`w-5 h-5 text-white/40 transition-transform ${
                        activeRecommendation === index ? 'rotate-180' : ''
                      }`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </BlurCard>
      )}

      {/* Upcoming Features */}
      {insights.upcomingFeatures.length > 0 && (
        <BlurCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Upcoming Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.upcomingFeatures.map((feature, index) => (
              <div key={index} className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-white font-medium">{feature.name}</h4>
                  <ModernBadge variant="secondary" size="sm">
                    {feature.availability}
                  </ModernBadge>
                </div>
                <p className="text-white/60 text-sm mb-3">{feature.description}</p>
                <div className="text-green-400 text-sm font-medium">
                  🎁 {feature.benefit}
                </div>
              </div>
            ))}
          </div>
        </BlurCard>
      )}

      {/* Recent Achievements */}
      {insights.achievements.length > 0 && (
        <BlurCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Achievements</h3>
          <div className="space-y-3">
            {insights.achievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center space-x-4 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h4 className="text-white font-medium">{achievement.name}</h4>
                  <p className="text-white/60 text-sm">{achievement.description}</p>
                </div>
                <div className="text-white/50 text-sm">
                  {new Date(achievement.unlockedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </BlurCard>
      )}

      {/* Profile Tips */}
      <BlurCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Pro Tips</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="text-blue-400 mt-1">💡</div>
            <div>
              <div className="text-white font-medium text-sm">Upload a clear profile photo</div>
              <div className="text-white/60 text-sm">Users with photos get 3x more engagement</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="text-green-400 mt-1">⚡</div>
            <div>
              <div className="text-white font-medium text-sm">Respond quickly to messages</div>
              <div className="text-white/60 text-sm">Fast responses improve your trust score</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="text-purple-400 mt-1">🎯</div>
            <div>
              <div className="text-white font-medium text-sm">Complete your verification</div>
              <div className="text-white/60 text-sm">Verified accounts close deals 50% faster</div>
            </div>
          </div>
        </div>
      </BlurCard>
    </div>
  );
};
