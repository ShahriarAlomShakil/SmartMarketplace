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

interface CompleteProfile {
  user: any;
  trustScore: any;
  oauthConnections: any;
  activityTimeline: any[];
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

  const handleProfileSave = async (profileData: any) => {
    setSaveLoading(true);
    try {
      // Handle avatar upload if present
      if (profileData.avatar) {
        const formData = new FormData();
        formData.append('avatar', profileData.avatar);
        
        const avatarResponse = await fetch('/api/users/avatar', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (!avatarResponse.ok) {
          throw new Error('Avatar upload failed');
        }
      }

      // Update profile data
      const { avatar, ...profileDataWithoutAvatar } = profileData;
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileDataWithoutAvatar)
      });

      if (response.ok) {
        await fetchCompleteProfile();
        setActiveTab('overview');
      } else {
        throw new Error('Profile update failed');
      }
    } catch (error) {
      console.error('Profile save error:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSettingsSave = async (settings: any) => {
    try {
      const response = await fetch('/api/profile/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        await fetchCompleteProfile();
      } else {
        throw new Error('Settings update failed');
      }
    } catch (error) {
      console.error('Settings save error:', error);
      alert('Failed to save settings. Please try again.');
    }
  };

  const handleVerificationComplete = async (type: string) => {
    await fetchCompleteProfile();
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-12">
          <div className="max-w-6xl mx-auto">
            <BlurCard className="p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-white/10 rounded w-1/3"></div>
                <div className="h-4 bg-white/10 rounded w-2/3"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 bg-white/10 rounded"></div>
                  ))}
                </div>
              </div>
            </BlurCard>
          </div>
        </div>
      </Layout>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'edit', label: 'Edit Profile', icon: '✏️' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'activity', label: 'Activity', icon: '📝' },
    { id: 'insights', label: 'Insights', icon: '💡' },
    { id: 'verification', label: 'Verification', icon: '🔒' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const renderTabContent = () => {
    if (!profile) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Profile Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <UserProfileCard
                  user={profile.user}
                  showActions={true}
                  onEdit={() => setActiveTab('edit')}
                />
              </div>
              <div>
                <TrustScore 
                  trustScore={profile.trustScore}
                  className="mb-6"
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <BlurCard className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {profile.user.stats?.productsListed || 0}
                </div>
                <div className="text-white/60 text-sm">Products Listed</div>
              </BlurCard>
              <BlurCard className="p-6 text-center">
                <div className="text-3xl font-bold text-green-400">
                  {profile.user.stats?.successfulNegotiations || 0}
                </div>
                <div className="text-white/60 text-sm">Negotiations</div>
              </BlurCard>
              <BlurCard className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-400">
                  {profile.user.profile?.rating?.average?.toFixed(1) || '0.0'}
                </div>
                <div className="text-white/60 text-sm">Average Rating</div>
              </BlurCard>
              <BlurCard className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-400">
                  {profile.trustScore?.overall || 0}
                </div>
                <div className="text-white/60 text-sm">Trust Score</div>
              </BlurCard>
            </div>

            {/* Recent Activity Preview */}
            {profile.activityTimeline.length > 0 && (
              <BlurCard className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
                  <ModernButton 
                    variant="secondary" 
                    size="sm"
                    onClick={() => setActiveTab('activity')}
                  >
                    View All
                  </ModernButton>
                </div>
                <div className="space-y-4">
                  {profile.activityTimeline.slice(0, 3).map((activity: any, index: number) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg">
                      <div className="text-2xl">{activity.icon || '📝'}</div>
                      <div className="flex-1">
                        <div className="text-white font-medium">{activity.title}</div>
                        <div className="text-white/60 text-sm">{activity.description}</div>
                      </div>
                      <div className="text-white/50 text-sm">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </BlurCard>
            )}
          </div>
        );

      case 'edit':
        return (
          <ProfileEditForm
            user={profile.user}
            onSave={handleProfileSave}
            onCancel={() => setActiveTab('overview')}
          />
        );

      case 'analytics':
        return (
          <ProfileAnalytics 
            userId={profile.user._id}
          />
        );

      case 'activity':
        return (
          <ActivityTimeline 
            userId={profile.user._id}
            limit={50}
          />
        );

      case 'insights':
        return (
          <ProfileInsights 
            userId={profile.user._id}
          />
        );

      case 'verification':
        return (
          <VerificationSystem
            user={profile.user}
            onVerificationComplete={handleVerificationComplete}
          />
        );

      case 'settings':
        return (
          <AccountSettings
            user={profile.user}
            onUpdateSettings={handleSettingsSave}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>Profile - Smart Marketplace</title>
        <meta name="description" content="Manage your profile and account settings" />
      </Head>
      
      <ProtectedRoute>
        <Layout>
          <div className="py-12">
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Header */}
              <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-2">
                  Profile Management
                </h1>
                <p className="text-white/70 text-lg">
                  Manage your account, settings, and track your marketplace activity
                </p>
              </div>

              {/* Tab Navigation */}
              <BlurCard className="p-2">
                <div className="flex flex-wrap gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-6 py-3 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-lg'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span className="text-base">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </BlurCard>

              {/* Tab Content */}
              <div className="min-h-[600px]">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    </>
  );
};

export default ProfilePage;
