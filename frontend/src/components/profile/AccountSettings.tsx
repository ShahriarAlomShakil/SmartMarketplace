import React, { useState, useEffect } from 'react';
import { BlurCard } from '../ui/BlurCard';
import { ModernButton } from '../ui/ModernButton';
import { ModernBadge } from '../ui/ModernBadge';

interface AccountSettingsProps {
  user: any;
  onUpdateSettings: (settings: any) => Promise<void>;
  className?: string;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
}

interface PreferenceSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  timezone: string;
}

interface PrivacySettings {
  showProfile: boolean;
  showActivity: boolean;
  allowMessages: boolean;
}

/**
 * Account Settings Management - Day 18 Implementation
 * 
 * Features:
 * - Notification preferences with toggle controls
 * - Theme and appearance settings
 * - Privacy controls with granular permissions
 * - Language and localization settings
 * - Account security options
 * - Data export and deletion options
 */
export const AccountSettings: React.FC<AccountSettingsProps> = ({
  user,
  onUpdateSettings,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'preferences' | 'notifications' | 'privacy' | 'security' | 'data'>('preferences');
  const [loading, setLoading] = useState(false);
  const [changes, setChanges] = useState<Record<string, boolean>>({});

  // Settings state
  const [preferences, setPreferences] = useState<PreferenceSettings>({
    theme: user.preferences?.theme || 'system',
    language: user.preferences?.language || 'en',
    currency: user.preferences?.currency || 'USD',
    timezone: user.preferences?.timezone || 'UTC'
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: user.preferences?.notifications?.email ?? true,
    push: user.preferences?.notifications?.push ?? true,
    sms: user.preferences?.notifications?.sms ?? false,
    marketing: user.preferences?.notifications?.marketing ?? false
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    showProfile: user.preferences?.privacy?.showProfile ?? true,
    showActivity: user.preferences?.privacy?.showActivity ?? true,
    allowMessages: user.preferences?.privacy?.allowMessages ?? true
  });

  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const hasChanges = Object.keys(changes).length > 0;

  const markChanged = (section: string) => {
    setChanges(prev => ({ ...prev, [section]: true }));
  };

  const handlePreferenceChange = (key: keyof PreferenceSettings, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    markChanged('preferences');
  };

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    markChanged('notifications');
  };

  const handlePrivacyChange = (key: keyof PrivacySettings, value: boolean) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
    markChanged('privacy');
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const settingsToUpdate = {
        preferences,
        notifications,
        privacy
      };

      await onUpdateSettings(settingsToUpdate);
      setChanges({});
    } catch (error) {
      console.error('Settings update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const response = await fetch('/api/profile/export', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `profile-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Data export error:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    const confirmation = window.prompt('Type "DELETE" to confirm account deletion:');
    if (confirmation !== 'DELETE') {
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        // Redirect to logout page
        window.location.href = '/logout';
      }
    } catch (error) {
      console.error('Account deletion error:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const tabs = [
    { id: 'preferences', label: 'Preferences', icon: 'cog-6-tooth' },
    { id: 'notifications', label: 'Notifications', icon: 'bell' },
    { id: 'privacy', label: 'Privacy', icon: 'shield-check' },
    { id: 'security', label: 'Security', icon: 'lock-closed' },
    { id: 'data', label: 'Data', icon: 'document-arrow-down' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'preferences':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">General Preferences</h3>
            
            {/* Theme */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-3">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', label: 'Light', icon: 'sun' },
                  { value: 'dark', label: 'Dark', icon: 'moon' },
                  { value: 'system', label: 'System', icon: 'computer-desktop' }
                ].map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => handlePreferenceChange('theme', theme.value)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      preferences.theme === theme.value
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">
                        {theme.icon === 'sun' && '☀️'}
                        {theme.icon === 'moon' && '🌙'}
                        {theme.icon === 'computer-desktop' && '💻'}
                      </div>
                      <span className="text-white text-sm">{theme.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Language
              </label>
              <select
                value={preferences.language}
                onChange={(e) => handlePreferenceChange('language', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
                <option value="zh">中文</option>
              </select>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Currency
              </label>
              <select
                value={preferences.currency}
                onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="AUD">AUD (A$)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Notification Preferences</h3>
            
            {[
              { key: 'email' as keyof NotificationSettings, label: 'Email Notifications', description: 'Receive notifications via email' },
              { key: 'push' as keyof NotificationSettings, label: 'Push Notifications', description: 'Browser push notifications' },
              { key: 'sms' as keyof NotificationSettings, label: 'SMS Notifications', description: 'Text message notifications' },
              { key: 'marketing' as keyof NotificationSettings, label: 'Marketing Emails', description: 'Promotional and marketing content' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <h4 className="text-white font-medium">{item.label}</h4>
                  <p className="text-white/60 text-sm">{item.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications[item.key]}
                    onChange={(e) => handleNotificationChange(item.key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Privacy Settings</h3>
            
            {[
              { key: 'showProfile' as keyof PrivacySettings, label: 'Show Profile', description: 'Make your profile visible to other users' },
              { key: 'showActivity' as keyof PrivacySettings, label: 'Show Activity', description: 'Display your activity timeline publicly' },
              { key: 'allowMessages' as keyof PrivacySettings, label: 'Allow Messages', description: 'Allow other users to send you messages' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <h4 className="text-white font-medium">{item.label}</h4>
                  <p className="text-white/60 text-sm">{item.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacy[item.key]}
                    onChange={(e) => handlePrivacyChange(item.key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Security Settings</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h4 className="text-white font-medium mb-2">Two-Factor Authentication</h4>
                <p className="text-white/60 text-sm mb-3">Add an extra layer of security to your account</p>
                <ModernBadge variant="secondary">Coming Soon</ModernBadge>
              </div>

              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h4 className="text-white font-medium mb-2">Change Password</h4>
                <p className="text-white/60 text-sm mb-3">Update your account password</p>
                <ModernButton variant="secondary" size="sm">
                  Change Password
                </ModernButton>
              </div>

              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h4 className="text-white font-medium mb-2">Active Sessions</h4>
                <p className="text-white/60 text-sm mb-3">Manage your active login sessions</p>
                <ModernButton variant="secondary" size="sm">
                  View Sessions
                </ModernButton>
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Data Management</h3>
            
            <div className="space-y-4">
              <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                <h4 className="text-white font-medium mb-2">Export Your Data</h4>
                <p className="text-white/60 text-sm mb-4">Download a copy of all your data including profile, products, and messages</p>
                <ModernButton 
                  onClick={handleExportData}
                  loading={exportLoading}
                  variant="secondary"
                >
                  Export Data
                </ModernButton>
              </div>

              <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-lg">
                <h4 className="text-red-400 font-medium mb-2">Danger Zone</h4>
                <p className="text-white/60 text-sm mb-4">
                  Once you delete your account, there is no going back. This action cannot be undone.
                </p>
                <ModernButton 
                  onClick={handleDeleteAccount}
                  loading={deleteLoading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete Account
                </ModernButton>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <BlurCard className={`p-8 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Account Settings</h2>
        <p className="text-white/70">Manage your account preferences and privacy settings</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mb-8">
        {renderTabContent()}
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end">
          <ModernButton
            onClick={handleSaveSettings}
            loading={loading}
            className="px-8"
          >
            Save Changes
          </ModernButton>
        </div>
      )}
    </BlurCard>
  );
};
