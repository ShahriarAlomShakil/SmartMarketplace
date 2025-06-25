/**
 * NotificationService - Comprehensive notification management
 * Handles browser notifications, push notifications, and in-app notifications
 */

import type { Notification as AppNotification, NotificationPreferences, PushSubscription } from '../types/Notification';

class NotificationService {
  private static instance: NotificationService;
  private apiBaseUrl: string;
  private pushSubscription: PushSubscription | null = null;
  private notificationPermission: NotificationPermission = 'default';
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
    this.initializeService();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async initializeService(): Promise<void> {
    try {
      // Check notification permission
      if ('Notification' in window) {
        this.notificationPermission = Notification.permission;
      }

      // Initialize service worker for push notifications
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        await this.initializeServiceWorker();
      }

      // Load existing push subscription
      await this.loadPushSubscription();
    } catch (error) {
      console.warn('Failed to initialize notification service:', error);
    }
  }

  private async initializeServiceWorker(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service worker registered:', registration);

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event.data);
      });
    } catch (error) {
      console.warn('Service worker registration failed:', error);
    }
  }

  private handleServiceWorkerMessage(data: any): void {
    if (data.type === 'NOTIFICATION_CLICKED') {
      this.emit('notificationClicked', data.notification);
    } else if (data.type === 'NOTIFICATION_RECEIVED') {
      this.emit('notificationReceived', data.notification);
    }
  }

  // Permission Management
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications');
      return 'denied';
    }

    if (this.notificationPermission === 'granted') {
      return 'granted';
    }

    try {
      const permission = await Notification.requestPermission();
      this.notificationPermission = permission;
      return permission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return 'denied';
    }
  }

  getPermissionStatus(): NotificationPermission {
    return this.notificationPermission;
  }

  // Browser Notifications
  async showBrowserNotification(notification: Partial<AppNotification>): Promise<void> {
    if (this.notificationPermission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      const browserNotification = new Notification(notification.title || 'Smart Marketplace', {
        body: notification.message || '',
        icon: '/icons/notification-icon.png',
        badge: '/icons/notification-badge.png',
        tag: notification.id || 'default',
        data: notification.data,
        requireInteraction: notification.priority === 'critical',
        silent: notification.priority === 'low'
      });

      browserNotification.onclick = () => {
        this.emit('notificationClicked', notification);
        browserNotification.close();
      };

      browserNotification.onclose = () => {
        this.emit('notificationClosed', notification);
      };

      // Auto-close after delay based on priority
      const autoCloseDelay = this.getAutoCloseDelay(notification.priority || 'medium');
      if (autoCloseDelay > 0) {
        setTimeout(() => {
          browserNotification.close();
        }, autoCloseDelay);
      }
    } catch (error) {
      console.error('Failed to show browser notification:', error);
    }
  }

  private getAutoCloseDelay(priority: string): number {
    switch (priority) {
      case 'low': return 3000;
      case 'medium': return 5000;
      case 'high': return 8000;
      case 'critical': return 0; // No auto-close
      default: return 5000;
    }
  }

  // Push Notifications
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        this.pushSubscription = await this.convertBrowserSubscription(existingSubscription);
        return this.pushSubscription;
      }

      // Create new subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        )
      });

      // Send subscription to backend
      this.pushSubscription = await this.savePushSubscription(subscription);
      return this.pushSubscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  async unsubscribeFromPush(): Promise<boolean> {
    try {
      if (!('serviceWorker' in navigator)) return false;

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        await this.deletePushSubscription();
        this.pushSubscription = null;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  private async convertBrowserSubscription(subscription: globalThis.PushSubscription): Promise<PushSubscription> {
    const keys = subscription.getKey('p256dh');
    const auth = subscription.getKey('auth');

    return {
      id: '',
      userId: '',
      endpoint: subscription.endpoint,
      keys: {
        p256dh: keys ? this.arrayBufferToBase64(keys) : '',
        auth: auth ? this.arrayBufferToBase64(auth) : ''
      },
      userAgent: navigator.userAgent,
      deviceType: this.getDeviceType(),
      createdAt: new Date(),
      lastUsed: new Date(),
      active: true
    };
  }

  private async savePushSubscription(subscription: globalThis.PushSubscription): Promise<PushSubscription> {
    const subscriptionData = await this.convertBrowserSubscription(subscription);
    
    const response = await fetch(`${this.apiBaseUrl}/notifications/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(subscriptionData)
    });

    if (!response.ok) {
      throw new Error('Failed to save push subscription');
    }

    return response.json();
  }

  private async deletePushSubscription(): Promise<void> {
    if (!this.pushSubscription) return;

    await fetch(`${this.apiBaseUrl}/notifications/push/unsubscribe`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  }

  private async loadPushSubscription(): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/notifications/push/subscription`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        this.pushSubscription = await response.json();
      }
    } catch (error) {
      console.warn('Failed to load push subscription:', error);
    }
  }

  // In-App Notifications
  async getNotifications(page = 1, limit = 20, filters?: any): Promise<{
    notifications: AppNotification[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      const response = await fetch(`${this.apiBaseUrl}/notifications?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      return response.json();
    } catch (error) {
      console.error('Failed to get notifications:', error);
      return { notifications: [], total: 0, hasMore: false };
    }
  }

  async markAsRead(notificationIds: string[]): Promise<void> {
    try {
      await fetch(`${this.apiBaseUrl}/notifications/mark-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ notificationIds })
      });

      this.emit('notificationsRead', notificationIds);
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      await fetch(`${this.apiBaseUrl}/notifications/mark-all-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      this.emit('allNotificationsRead');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await fetch(`${this.apiBaseUrl}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      this.emit('notificationDeleted', notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }

  // Preferences Management
  async getPreferences(): Promise<NotificationPreferences | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/notifications/preferences`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) return null;
      return response.json();
    } catch (error) {
      console.error('Failed to get notification preferences:', error);
      return null;
    }
  }

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      await fetch(`${this.apiBaseUrl}/notifications/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(preferences)
      });

      this.emit('preferencesUpdated', preferences);
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
    }
  }

  // Utility Methods
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }

  // Event System
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Real-time Connection
  connectToRealTime(): void {
    // This would integrate with the existing WebSocket system
    // for real-time notification delivery
    if (typeof window !== 'undefined' && (window as any).io) {
      const socket = (window as any).io;
      
      socket.on('notification:new', (notification: AppNotification) => {
        this.emit('newNotification', notification);
        this.showBrowserNotification(notification);
      });

      socket.on('notification:updated', (notification: AppNotification) => {
        this.emit('notificationUpdated', notification);
      });
    }
  }

  disconnect(): void {
    this.eventListeners.clear();
  }
}

export default NotificationService;
