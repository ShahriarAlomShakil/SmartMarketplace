/**
 * NotificationCenter - In-app notification center with modern design
 * Features: notification list, real-time updates, actions, filtering
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModernBadge } from '../ui/ModernBadge';
import { cn } from '../../utils/cn';
import NotificationService from '../../services/NotificationService';
import type { Notification as AppNotification, NotificationStats } from '../../types/Notification';
import {
  BellIcon,
  XMarkIcon,
  CheckIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  FunnelIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface NotificationItemProps {
  notification: AppNotification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  onAction: (notificationId: string, actionId: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRead,
  onDelete,
  onAction
}) => {
  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setShowActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'message':
        return '💬';
      case 'offer':
      case 'offer_countered':
        return '💰';
      case 'offer_accepted':
        return '✅';
      case 'offer_rejected':
        return '❌';
      case 'product_sold':
        return '🛒';
      case 'product_viewed':
        return '👁️';
      case 'user_followed':
        return '👤';
      case 'account_security':
        return '🔒';
      default:
        return '📢';
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'critical':
        return 'border-red-400/50 bg-red-500/10';
      case 'high':
        return 'border-orange-400/50 bg-orange-500/10';
      case 'medium':
        return 'border-blue-400/50 bg-blue-500/10';
      case 'low':
        return 'border-gray-400/50 bg-gray-500/10';
      default:
        return 'border-white/20 bg-white/5';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={cn(
        'relative p-4 border rounded-xl backdrop-blur-sm transition-all duration-200',
        getPriorityColor(),
        notification.read ? 'opacity-60' : 'opacity-100',
        'hover:bg-white/10 group'
      )}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute top-4 left-2 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
      )}

      <div className="flex items-start space-x-3 ml-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-lg">
          {getNotificationIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-white font-medium text-sm mb-1 truncate">
                {notification.title}
              </h4>
              <p className="text-white/70 text-sm mb-2 line-clamp-2">
                {notification.message}
              </p>
              
              <div className="flex items-center space-x-2 mb-2">
                <ModernBadge
                  variant={notification.priority === 'critical' ? 'error' : 
                          notification.priority === 'high' ? 'warning' :
                          notification.priority === 'medium' ? 'info' : 'default'}
                  size="sm"
                >
                  {notification.category}
                </ModernBadge>
                <span className="text-white/50 text-xs">
                  {formatTime(notification.createdAt)}
                </span>
              </div>

              {/* Actions */}
              {notification.actions && notification.actions.length > 0 && (
                <div className="flex space-x-2">
                  {notification.actions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => onAction(notification.id, action.id)}
                      className={cn(
                        'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                        action.type === 'primary' && 'bg-blue-500 hover:bg-blue-600 text-white',
                        action.type === 'secondary' && 'bg-white/10 hover:bg-white/20 text-white',
                        action.type === 'destructive' && 'bg-red-500 hover:bg-red-600 text-white'
                      )}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Menu */}
            <div className="relative" ref={actionsRef}>
              <button
                onClick={() => setShowActions(!showActions)}
                className="opacity-0 group-hover:opacity-100 p-1 text-white/60 hover:text-white transition-opacity"
              >
                <EllipsisVerticalIcon className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {showActions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-8 w-32 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl z-50"
                  >
                    <div className="py-1">
                      {!notification.read && (
                        <button
                          onClick={() => {
                            onRead(notification.id);
                            setShowActions(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center space-x-2"
                        >
                          <CheckIcon className="w-4 h-4" />
                          <span>Mark read</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          onDelete(notification.id);
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-white/10 flex items-center space-x-2"
                      >
                        <TrashIcon className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  className
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    byCategory: {} as Record<string, number>,
    byType: {} as Record<string, number>,
    byPriority: {} as Record<string, number>
  });
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const notificationService = NotificationService.getInstance();

  const loadNotifications = async (reset = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const filters = filter !== 'all' ? { read: filter === 'read' } : undefined;
      
      const result = await notificationService.getNotifications(currentPage, 20, filters);
      
      if (reset) {
        setNotifications(result.notifications);
        setPage(2);
      } else {
        setNotifications(prev => [...prev, ...result.notifications]);
        setPage(prev => prev + 1);
      }
      
      setHasMore(result.hasMore);
      
      // Calculate stats
      const newStats: NotificationStats = {
        total: result.total,
        unread: result.notifications.filter(n => !n.read).length,
        byCategory: {} as any,
        byType: {} as any,
        byPriority: {} as any
      };
      
      result.notifications.forEach(notification => {
        newStats.byCategory[notification.category] = (newStats.byCategory[notification.category] || 0) + 1;
        newStats.byType[notification.type] = (newStats.byType[notification.type] || 0) + 1;
        newStats.byPriority[notification.priority] = (newStats.byPriority[notification.priority] || 0) + 1;
      });
      
      setStats(newStats);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead([notificationId]);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setStats(prev => ({ ...prev, unread: 0 }));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setStats(prev => ({ ...prev, total: prev.total - 1 }));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleAction = async (notificationId: string, actionId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    const action = notification?.actions?.find(a => a.id === actionId);
    
    if (action) {
      // Handle action based on type
      if (action.action.startsWith('http')) {
        window.open(action.action, '_blank');
      } else {
        // Handle internal actions
        console.log('Handle action:', action.action);
      }
      
      // Mark as read
      await handleMarkAsRead(notificationId);
    }
  };

  const handleFilterChange = (newFilter: 'all' | 'unread' | 'read') => {
    setFilter(newFilter);
    setPage(1);
    setNotifications([]);
    setHasMore(true);
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, filter]);

  useEffect(() => {
    // Set up real-time listeners
    const handleNewNotification = (notification: AppNotification) => {
      setNotifications(prev => [notification, ...prev]);
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        unread: prev.unread + 1
      }));
    };

    const handleNotificationRead = (notificationIds: string[]) => {
      setNotifications(prev =>
        prev.map(n => notificationIds.includes(n.id) ? { ...n, read: true } : n)
      );
    };

    notificationService.on('newNotification', handleNewNotification);
    notificationService.on('notificationsRead', handleNotificationRead);
    notificationService.on('allNotificationsRead', () => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setStats(prev => ({ ...prev, unread: 0 }));
    });

    return () => {
      notificationService.off('newNotification', handleNewNotification);
      notificationService.off('notificationsRead', handleNotificationRead);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        'fixed top-16 right-4 w-96 max-h-[80vh] bg-gray-900/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl z-50',
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <BellSolidIcon className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-semibold">Notifications</h3>
            {stats.unread > 0 && (
              <ModernBadge variant="error" size="sm">
                {stats.unread}
              </ModernBadge>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/60 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 mb-3">
          <button
            onClick={() => handleFilterChange('all')}
            className={cn(
              'px-3 py-1 rounded-md text-xs font-medium transition-colors',
              filter === 'all' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            )}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => handleFilterChange('unread')}
            className={cn(
              'px-3 py-1 rounded-md text-xs font-medium transition-colors',
              filter === 'unread' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            )}
          >
            Unread ({stats.unread})
          </button>
          <button
            onClick={() => handleFilterChange('read')}
            className={cn(
              'px-3 py-1 rounded-md text-xs font-medium transition-colors',
              filter === 'read' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            )}
          >
            Read
          </button>
        </div>

        {/* Actions */}
        {stats.unread > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            <CheckCircleIcon className="w-4 h-4" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto max-h-96">
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <BellIcon className="w-12 h-12 text-white/30 mb-3" />
            <p className="text-white/60 text-sm">No notifications yet</p>
            <p className="text-white/40 text-xs mt-1">We&apos;ll notify you when something happens</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            <AnimatePresence>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={handleMarkAsRead}
                  onDelete={handleDelete}
                  onAction={handleAction}
                />
              ))}
            </AnimatePresence>

            {/* Load More */}
            {hasMore && (
              <button
                onClick={() => loadNotifications()}
                disabled={loading}
                className="w-full py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load more'}
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NotificationCenter;
