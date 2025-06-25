import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { UserProfileCard } from '../components/profile/UserProfileCardEnhanced';
import { ProfileAnalytics } from '../components/profile/ProfileAnalytics';
import { TrustScore } from '../components/profile/TrustScore';
import { ProfileEditForm } from '../components/profile/ProfileEditForm';
import { AccountSettings } from '../components/profile/AccountSettings';
import { ActivityTimeline } from '../components/profile/ActivityTimeline';
import { ProfileInsights } from '../components/profile/ProfileInsights';
import { VerificationSystem } from '../components/profile/VerificationSystem';
import { BlurCard } from '../components/ui/BlurCard';
import { ModernButton } from '../components/ui/ModernButton';
import { ModernBadge } from '../components/ui/ModernBadge';

interface ActivityTimelineItem {
  type: string;
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  color: string;
}

interface CompleteProfile {
  user: any;
  trustScore: any;
  oauthConnections: any;
  activityTimeline: ActivityTimelineItem[];
}

/**
 * Enhanced Profile Management Page - Day 18 Implementation
 * 
 * Features:
 * - Complete profile overview with trust scores
 * - Profile editing with image upload
 * - Account settings and preferences
 * - Privacy settings and controls
 * - Activity timeline visualization
 * - Profile insights and recommendations
 * - Verification system integration
 * - Analytics dashboard
 * - Modern design with blur backgrounds
 */
const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'edit' | 'settings' | 'analytics' | 'activity' | 'insights' | 'verification'>('overview');
  const [profile, setProfile] = useState<CompleteProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCompleteProfile();
      fetchProfileInsights();
    }
  }, [user]);

  const fetchCompleteProfile = async () => {
    try {
      const response = await fetch('/api/profile/complete', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch complete profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileInsights = async () => {
    try {
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
      console.error('Failed to fetch profile insights:', error);
    }
  };

  const handleRecalculateTrustScore = async () => {
    try {
      const response = await fetch('/api/profile/trust-score/recalculate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await fetchCompleteProfile();
      }
    } catch (error) {
      console.error('Failed to recalculate trust score:', error);
    }
  };

  const handleVerificationRequest = async (type: string) => {
    try {
      const response = await fetch(`/api/profile/verification/${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await fetchCompleteProfile();
      }
    } catch (error) {
      console.error('Failed to request verification:', error);
    }
  };

  const formatTimelineDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIconForActivityType = (type: string) => {
    switch (type) {
      case 'product_listed': return '📦';
      case 'negotiation_started': return '💬';
      case 'negotiation_received': return '📨';
      case 'deal_completed': return '✅';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="py-12">
            <div className="max-w-6xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-white/10 rounded w-1/3"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="h-64 bg-white/10 rounded"></div>
                    <div className="h-96 bg-white/10 rounded"></div>
                  </div>
                  <div className="space-y-6">
                    <div className="h-48 bg-white/10 rounded"></div>
                    <div className="h-32 bg-white/10 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!profile) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="py-12">
            <div className="max-w-6xl mx-auto text-center">
              <div className="text-white/60">Failed to load profile data</div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <>
      <Head>
        <title>My Profile - Smart Marketplace</title>
        <meta name="description" content="Manage your Smart Marketplace profile" />
      </Head>
      
      <ProtectedRoute>
        <Layout>
          <div className="py-12">
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Header */}
              <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
                <p className="text-white/70">Manage your account and track your marketplace performance</p>
              </div>

              {/* Tab Navigation */}
              <div className="flex justify-center">
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-1 border border-white/20">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'analytics', label: 'Analytics' },
                    { id: 'activity', label: 'Activity' },
                    { id: 'settings', label: 'Settings' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-white/20 text-white border border-white/30'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {activeTab === 'overview' && (
                    <>
                      {/* Profile Card */}
                      <UserProfileCard
                        user={profile.user}
                        showActions={false}
                      />

                      {/* Trust Score */}
                      {profile.trustScore && (
                        <TrustScore
                          trustScore={profile.trustScore}
                          onRecalculate={handleRecalculateTrustScore}
                        />
                      )}

                      {/* Profile Insights */}
                      {insights && (
                        <BlurCard variant="elevated" className="p-6">
                          <h3 className="text-lg font-semibold text-white mb-4">Profile Insights</h3>
                          
                          {/* Profile Completeness */}
                          <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-white/70">Profile Completeness</span>
                              <span className="text-sm font-medium text-white">
                                {insights.profileCompleteness.percentage}%
                              </span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                                style={{ width: `${insights.profileCompleteness.percentage}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Recommendations */}
                          {insights.recommendedActions.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium text-white/80">Recommended Actions</h4>
                              {insights.recommendedActions.slice(0, 3).map((action: any, index: number) => (
                                <div key={index} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg">
                                  <div className="text-lg">
                                    {action.priority === 'high' ? '🔥' : action.priority === 'medium' ? '⚡' : '💡'}
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-white">{action.title}</div>
                                    <div className="text-xs text-white/60">{action.description}</div>
                                  </div>
                                  <ModernBadge 
                                    variant={action.priority === 'high' ? 'error' : action.priority === 'medium' ? 'warning' : 'info'}
                                    size="sm"
                                  >
                                    {action.priority}
                                  </ModernBadge>
                                </div>
                              ))}
                            </div>
                          )}
                        </BlurCard>
                      )}
                    </>
                  )}

                  {activeTab === 'analytics' && user && (
                    <ProfileAnalytics userId={user._id} />
                  )}

                  {activeTab === 'activity' && (
                    <BlurCard variant="elevated" className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Activity Timeline</h3>
                      
                      <div className="space-y-4">
                        {profile.activityTimeline.map((activity, index) => (
                          <div key={index} className="flex items-start space-x-4">
                            <div className="text-2xl">{getIconForActivityType(activity.type)}</div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-white">{activity.title}</span>
                                <span className="text-xs text-white/50">
                                  {formatTimelineDate(activity.timestamp)}
                                </span>
                              </div>
                              <div className="text-sm text-white/70">{activity.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </BlurCard>
                  )}

                  {activeTab === 'settings' && (
                    <BlurCard variant="elevated" className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Profile Settings</h3>
                      
                      <div className="space-y-6">
                        {/* Verification Section */}
                        <div>
                          <h4 className="text-sm font-medium text-white/80 mb-3">Account Verification</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {['email', 'phone', 'identity', 'address'].map((type) => (
                              <div key={type} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <span className="text-sm text-white capitalize">{type}</span>
                                {profile.user.profile?.verificationStatus?.[type] ? (
                                  <ModernBadge variant="success" size="sm">Verified</ModernBadge>
                                ) : (
                                  <ModernButton
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleVerificationRequest(type)}
                                  >
                                    Verify
                                  </ModernButton>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* OAuth Connections */}
                        <div>
                          <h4 className="text-sm font-medium text-white/80 mb-3">Connected Accounts</h4>
                          <div className="space-y-2">
                            {Object.entries(profile.oauthConnections).map(([provider, connection]: [string, any]) => (
                              <div key={provider} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <span className="text-lg">
                                    {provider === 'google' ? '🟢' : provider === 'facebook' ? '🔵' : '⚪'}
                                  </span>
                                  <span className="text-sm text-white capitalize">{provider}</span>
                                </div>
                                {connection.connected ? (
                                  <ModernBadge variant="success" size="sm">Connected</ModernBadge>
                                ) : (
                                  <ModernButton variant="secondary" size="sm">
                                    Connect
                                  </ModernButton>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </BlurCard>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <BlurCard variant="elevated" className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/70">Trust Level</span>
                        <ModernBadge variant="info" size="sm">
                          {profile.trustScore?.level || 'New'}
                        </ModernBadge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/70">Products Listed</span>
                        <span className="text-sm font-medium text-white">
                          {profile.user.stats?.productsListed || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/70">Successful Deals</span>
                        <span className="text-sm font-medium text-white">
                          {profile.user.stats?.productsSold || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/70">Member Since</span>
                        <span className="text-sm font-medium text-white">
                          {new Date(profile.user.createdAt).getFullYear()}
                        </span>
                      </div>
                    </div>
                  </BlurCard>

                  {/* Recent Achievements */}
                  {insights?.achievements.length > 0 && (
                    <BlurCard variant="elevated" className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Recent Achievements</h3>
                      
                      <div className="space-y-3">
                        {insights.achievements.slice(0, 3).map((achievement: any, index: number) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg">
                            <div className="text-lg">{achievement.icon || '🏆'}</div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-yellow-400">{achievement.title}</div>
                              <div className="text-xs text-white/60">{achievement.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </BlurCard>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <ModernButton variant="primary" size="sm" className="w-full">
                      Edit Profile
                    </ModernButton>
                    <ModernButton variant="secondary" size="sm" className="w-full">
                      Privacy Settings
                    </ModernButton>
                    <ModernButton variant="secondary" size="sm" className="w-full">
                      Download Data
                    </ModernButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    </>
  );
};

export default ProfilePage;
