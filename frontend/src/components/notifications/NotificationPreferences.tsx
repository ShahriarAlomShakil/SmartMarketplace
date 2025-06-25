/**
 * NotificationPreferences - Manage notification settings and preferences
 * Features: category preferences, channels, quiet hours, frequency settings
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ModernButton } from '../ui/ModernButton';
import { cn } from '../../utils/cn';
import NotificationService from '../../services/NotificationService';
import type { NotificationPreferences, NotificationCategory } from '../../types/Notification';
import {
  BellIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  ChatBubbleBottomCenterTextIcon,
  ShieldCheckIcon,
  CogIcon,
  ClockIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

interface NotificationPreferencesProps {
  className?: string;
}

interface CategoryConfig {
  key: NotificationCategory;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  examples: string[];
}

const categoryConfigs: CategoryConfig[] = [
  {
    key: 'transaction',
    label: 'Transactions',
    description: 'Payments, offers, and deals',
    icon: CogIcon,
    examples: ['Offer received', 'Payment completed', 'Deal finalized']
  },
  {
    key: 'communication',
    label: 'Messages',
    description: 'Chat messages and conversations',
    icon: ChatBubbleBottomCenterTextIcon,
    examples: ['New message', 'Conversation started', 'Reply received']
  },
  {
    key: 'social',
    label: 'Social',
    description: 'Follows, likes, and social activity',
    icon: GlobeAltIcon,
    examples: ['New follower', 'Product liked', 'Profile viewed']
  },
  {
    key: 'security',
    label: 'Security',
    description: 'Account security and safety alerts',
    icon: ShieldCheckIcon,
    examples: ['Login alert', 'Password changed', 'Suspicious activity']
  },
  {
    key: 'system',
    label: 'System',
    description: 'App updates and maintenance',
    icon: CogIcon,
    examples: ['App update', 'Maintenance notice', 'Feature announcement']
  },
  {
    key: 'marketing',
    label: 'Marketing',
    description: 'Promotions and newsletters',
    icon: EnvelopeIcon,
    examples: ['Weekly newsletter', 'Special offers', 'Product recommendations']
  }
];

const NotificationPreferencesComponent: React.FC<NotificationPreferencesProps> = ({
  className
}) => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [activeTab, setActiveTab] = useState<'categories' | 'channels' | 'schedule'>('categories');

  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    loadPreferences();
    checkPushSupport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkPushSupport = () => {
    setPushSupported('serviceWorker' in navigator && 'PushManager' in window);
    setPushPermission(notificationService.getPermissionStatus());
  };

  const loadPreferences = async () => {
    try {
      const prefs = await notificationService.getPreferences();
      if (prefs) {
        setPreferences(prefs);
      } else {
        // Set default preferences
        setPreferences({
          categories: {
            transaction: { email: true, push: true, inApp: true, sms: false },
            communication: { email: true, push: true, inApp: true, sms: false },
            social: { email: false, push: true, inApp: true, sms: false },
            security: { email: true, push: true, inApp: true, sms: true },
            system: { email: false, push: false, inApp: true, sms: false },
            marketing: { email: false, push: false, inApp: false, sms: false }
          },
          frequency: {
            immediate: true,
            hourly: false,
            daily: false,
            weekly: false
          },
          quietHours: {
            enabled: false,
            start: '22:00',
            end: '08:00',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          devices: {
            browser: true,
            mobile: true,
            email: true,
            sms: false
          }
        });
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;

    setSaving(true);
    try {
      await notificationService.updatePreferences(preferences);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateCategoryPreference = (
    category: NotificationCategory,
    channel: keyof NotificationPreferences['categories'][NotificationCategory],
    enabled: boolean
  ) => {
    if (!preferences) return;

    setPreferences(prev => ({
      ...prev!,
      categories: {
        ...prev!.categories,
        [category]: {
          ...prev!.categories[category],
          [channel]: enabled
        }
      }
    }));
  };

  const updateFrequencyPreference = (
    frequency: keyof NotificationPreferences['frequency'],
    enabled: boolean
  ) => {
    if (!preferences) return;

    setPreferences(prev => ({
      ...prev!,
      frequency: {
        ...prev!.frequency,
        [frequency]: enabled
      }
    }));
  };

  const updateQuietHours = (field: keyof NotificationPreferences['quietHours'], value: any) => {
    if (!preferences) return;

    setPreferences(prev => ({
      ...prev!,
      quietHours: {
        ...prev!.quietHours,
        [field]: value
      }
    }));
  };

  const handleRequestPushPermission = async () => {
    const permission = await notificationService.requestPermission();
    setPushPermission(permission);
    
    if (permission === 'granted') {
      await notificationService.subscribeToPush();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="text-center p-8 text-white/60">
        Failed to load notification preferences
      </div>
    );
  }

  return (
    <div className={cn('bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl', className)}>
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-3 mb-4">
          <BellIcon className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Notification Preferences</h2>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/10 rounded-lg p-1">
          {[
            { id: 'categories', label: 'Categories' },
            { id: 'channels', label: 'Channels' },
            { id: 'schedule', label: 'Schedule' }
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
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <p className="text-white/70 text-sm mb-6">
              Choose which types of notifications you want to receive and how you want to receive them.
            </p>

            {categoryConfigs.map((config) => {
              const categoryPrefs = preferences.categories[config.key];
              const IconComponent = config.icon;

              return (
                <motion.div
                  key={config.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 rounded-xl p-4 border border-white/10"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-blue-400" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-medium">{config.label}</h3>
                      </div>
                      
                      <p className="text-white/60 text-sm mb-3">{config.description}</p>
                      
                      <div className="text-xs text-white/50 mb-4">
                        Examples: {config.examples.join(', ')}
                      </div>

                      {/* Channel toggles */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={categoryPrefs.email}
                            onChange={(e) => updateCategoryPreference(config.key, 'email', e.target.checked)}
                            className="rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500"
                          />
                          <span className="text-sm text-white">Email</span>
                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={categoryPrefs.push && pushSupported}
                            onChange={(e) => updateCategoryPreference(config.key, 'push', e.target.checked)}
                            disabled={!pushSupported}
                            className="rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500 disabled:opacity-50"
                          />
                          <span className="text-sm text-white">Push</span>
                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={categoryPrefs.inApp}
                            onChange={(e) => updateCategoryPreference(config.key, 'inApp', e.target.checked)}
                            className="rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500"
                          />
                          <span className="text-sm text-white">In-app</span>
                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={categoryPrefs.sms}
                            onChange={(e) => updateCategoryPreference(config.key, 'sms', e.target.checked)}
                            className="rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500"
                          />
                          <span className="text-sm text-white">SMS</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {activeTab === 'channels' && (
          <div className="space-y-6">
            {/* Push Notification Setup */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center space-x-3 mb-4">
                <DevicePhoneMobileIcon className="w-5 h-5 text-blue-400" />
                <h3 className="text-white font-medium">Push Notifications</h3>
              </div>
              
              {pushSupported ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/70 text-sm">Browser notifications</span>
                    <span className={cn(
                      'px-2 py-1 rounded-md text-xs',
                      pushPermission === 'granted' ? 'bg-green-500/20 text-green-400' :
                      pushPermission === 'denied' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    )}>
                      {pushPermission === 'granted' ? 'Enabled' :
                       pushPermission === 'denied' ? 'Blocked' : 'Not set'}
                    </span>
                  </div>
                  
                  {pushPermission !== 'granted' && (
                    <ModernButton
                      variant="outline"
                      size="sm"
                      onClick={handleRequestPushPermission}
                    >
                      Enable Push Notifications
                    </ModernButton>
                  )}
                </div>
              ) : (
                <p className="text-white/60 text-sm">
                  Push notifications are not supported in this browser.
                </p>
              )}
            </div>

            {/* Frequency Settings */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center space-x-3 mb-4">
                <ClockIcon className="w-5 h-5 text-blue-400" />
                <h3 className="text-white font-medium">Notification Frequency</h3>
              </div>
              
              <div className="space-y-3">
                {[
                  { key: 'immediate' as const, label: 'Immediate', description: 'Get notified right away' },
                  { key: 'hourly' as const, label: 'Hourly digest', description: 'Bundled every hour' },
                  { key: 'daily' as const, label: 'Daily digest', description: 'Once per day summary' },
                  { key: 'weekly' as const, label: 'Weekly digest', description: 'Weekly summary' }
                ].map((freq) => (
                  <label key={freq.key} className="flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="text-white text-sm">{freq.label}</div>
                      <div className="text-white/60 text-xs">{freq.description}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.frequency[freq.key]}
                      onChange={(e) => updateFrequencyPreference(freq.key, e.target.checked)}
                      className="rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-6">
            {/* Quiet Hours */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <ClockIcon className="w-5 h-5 text-blue-400" />
                  <h3 className="text-white font-medium">Quiet Hours</h3>
                </div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.quietHours.enabled}
                    onChange={(e) => updateQuietHours('enabled', e.target.checked)}
                    className="rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-white">Enable</span>
                </label>
              </div>
              
              {preferences.quietHours.enabled && (
                <div className="space-y-4">
                  <p className="text-white/60 text-sm">
                    During quiet hours, you&apos;ll only receive critical notifications.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white mb-2">Start time</label>
                      <input
                        type="time"
                        value={preferences.quietHours.start}
                        onChange={(e) => updateQuietHours('start', e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-white mb-2">End time</label>
                      <input
                        type="time"
                        value={preferences.quietHours.end}
                        onChange={(e) => updateQuietHours('end', e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-white mb-2">Timezone</label>
                    <select
                      value={preferences.quietHours.timezone}
                      onChange={(e) => updateQuietHours('timezone', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="America/New_York" className="bg-gray-900">America/New_York</option>
                      <option value="America/Los_Angeles" className="bg-gray-900">America/Los_Angeles</option>
                      <option value="America/Chicago" className="bg-gray-900">America/Chicago</option>
                      <option value="Europe/London" className="bg-gray-900">Europe/London</option>
                      <option value="Europe/Paris" className="bg-gray-900">Europe/Paris</option>
                      <option value="Asia/Tokyo" className="bg-gray-900">Asia/Tokyo</option>
                      <option value="Asia/Shanghai" className="bg-gray-900">Asia/Shanghai</option>
                      <option value="Australia/Sydney" className="bg-gray-900">Australia/Sydney</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end mt-8">
          <ModernButton
            onClick={savePreferences}
            disabled={saving}
            className="min-w-24"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </ModernButton>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferencesComponent;
