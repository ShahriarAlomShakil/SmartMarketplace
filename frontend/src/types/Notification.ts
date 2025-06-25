/**
 * Notification Type Definitions
 * Comprehensive types for Day 20 notification system
 */

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  actions?: NotificationAction[];
  category: NotificationCategory;
  sourceId?: string; // Related entity ID (negotiation, product, etc.)
  sourceType?: 'negotiation' | 'product' | 'user' | 'system';
}

export type NotificationType = 
  | 'message'
  | 'offer'
  | 'offer_accepted'
  | 'offer_rejected'
  | 'offer_countered'
  | 'negotiation_started'
  | 'negotiation_completed'
  | 'negotiation_cancelled'
  | 'product_sold'
  | 'product_viewed'
  | 'product_liked'
  | 'user_followed'
  | 'payment_received'
  | 'payment_pending'
  | 'account_security'
  | 'system_maintenance'
  | 'marketing'
  | 'reminder';

export type NotificationCategory = 
  | 'transaction'
  | 'communication'
  | 'social'
  | 'security'
  | 'system'
  | 'marketing';

export interface NotificationAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'destructive';
  action: string; // URL or action identifier
  icon?: string;
}

export interface NotificationPreferences {
  categories: {
    [K in NotificationCategory]: {
      email: boolean;
      push: boolean;
      inApp: boolean;
      sms: boolean;
    };
  };
  frequency: {
    immediate: boolean;
    hourly: boolean;
    daily: boolean;
    weekly: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;   // HH:mm format
    timezone: string;
  };
  devices: {
    browser: boolean;
    mobile: boolean;
    email: boolean;
    sms: boolean;
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  byCategory: Record<NotificationCategory, number>;
  byType: Record<NotificationType, number>;
  byPriority: Record<'low' | 'medium' | 'high' | 'critical', number>;
}

export interface PushSubscription {
  id: string;
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  createdAt: Date;
  lastUsed: Date;
  active: boolean;
}

export interface NotificationDelivery {
  id: string;
  notificationId: string;
  channel: 'email' | 'push' | 'sms' | 'inApp';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'clicked';
  sentAt?: Date;
  deliveredAt?: Date;
  clickedAt?: Date;
  failureReason?: string;
  retryCount: number;
  metadata?: Record<string, any>;
}

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  channel: 'email' | 'push' | 'sms' | 'inApp';
  subject?: string;
  title: string;
  body: string;
  variables: string[];
  active: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationBatch {
  id: string;
  name: string;
  description?: string;
  recipients: string[]; // User IDs
  template: string;
  data: Record<string, any>;
  scheduledAt?: Date;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  stats: {
    total: number;
    sent: number;
    delivered: number;
    failed: number;
    clicked: number;
  };
  createdAt: Date;
  sentAt?: Date;
}
