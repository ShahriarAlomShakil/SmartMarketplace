import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import {
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

/**
 * MessageDeliveryStatus Component - Shows delivery status of messages
 * 
 * Features:
 * - Visual delivery status indicators
 * - Sending, delivered, failed, and read states
 * - Retry functionality for failed messages
 * - Modern design with animations
 * - Tooltips for detailed status
 */

interface MessageDeliveryStatusProps {
  status: 'sending' | 'delivered' | 'failed' | 'read';
  timestamp?: Date;
  error?: string;
  retryable?: boolean;
  onRetry?: () => void;
  className?: string;
  size?: 'sm' | 'md';
  showTooltip?: boolean;
}

export const MessageDeliveryStatus: React.FC<MessageDeliveryStatusProps> = ({
  status,
  timestamp,
  error,
  retryable = false,
  onRetry,
  className,
  size = 'sm',
  showTooltip = true
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'sending':
        return {
          icon: ClockIcon,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/20',
          text: 'Sending...',
          description: 'Message is being sent'
        };
      case 'delivered':
        return {
          icon: CheckIcon,
          color: 'text-green-400',
          bgColor: 'bg-green-400/20',
          text: 'Delivered',
          description: 'Message has been delivered'
        };
      case 'failed':
        return {
          icon: ExclamationTriangleIcon,
          color: 'text-red-400',
          bgColor: 'bg-red-400/20',
          text: 'Failed',
          description: error || 'Message failed to send'
        };
      case 'read':
        return {
          icon: EyeIcon,
          color: 'text-blue-400',
          bgColor: 'bg-blue-400/20',
          text: 'Read',
          description: 'Message has been read'
        };
      default:
        return {
          icon: ClockIcon,
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/20',
          text: 'Unknown',
          description: 'Unknown status'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      {/* Status Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={cn(
          'flex items-center justify-center rounded-full p-1',
          statusConfig.bgColor,
          size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'
        )}
        title={showTooltip ? statusConfig.description : undefined}
      >
        <motion.div
          animate={status === 'sending' ? { rotate: 360 } : {}}
          transition={{
            duration: 1,
            repeat: status === 'sending' ? Infinity : 0,
            ease: 'linear'
          }}
        >
          <StatusIcon className={cn(iconSize, statusConfig.color)} />
        </motion.div>
      </motion.div>

      {/* Status Text and Time */}
      <div className="flex flex-col">
        <span className={cn(
          'font-medium',
          statusConfig.color,
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}>
          {statusConfig.text}
        </span>
        
        {timestamp && (
          <span className={cn(
            'text-white/50',
            size === 'sm' ? 'text-xs' : 'text-sm'
          )}>
            {formatTime(timestamp)}
          </span>
        )}
      </div>

      {/* Retry Button for Failed Messages */}
      {status === 'failed' && retryable && onRetry && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onRetry}
          className={cn(
            'flex items-center justify-center rounded-full',
            'bg-red-500/20 border border-red-400/30 text-red-400',
            'hover:bg-red-500/30 transition-colors',
            size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'
          )}
          title="Retry sending message"
        >
          <ArrowPathIcon className={cn(iconSize)} />
        </motion.button>
      )}
    </div>
  );
};

// Component for displaying multiple message statuses
interface MessageDeliveryListProps {
  deliveryStatuses: Array<{
    messageId: string;
    tempId?: string;
    status: 'sending' | 'delivered' | 'failed' | 'read';
    timestamp: Date;
    error?: string;
    retryable?: boolean;
  }>;
  onRetry?: (messageId: string) => void;
  className?: string;
  maxItems?: number;
}

export const MessageDeliveryList: React.FC<MessageDeliveryListProps> = ({
  deliveryStatuses,
  onRetry,
  className,
  maxItems = 5
}) => {
  const recentStatuses = deliveryStatuses
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, maxItems);

  if (recentStatuses.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      <h4 className="text-sm font-medium text-white/80 mb-2">
        Message Status ({recentStatuses.length})
      </h4>
      
      {recentStatuses.map((delivery) => (
        <motion.div
          key={delivery.messageId || delivery.tempId}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-between p-2 rounded-lg bg-white/5"
        >
          <div className="flex-1 min-w-0">
            <div className="text-xs text-white/60 truncate">
              ID: {delivery.messageId || delivery.tempId}
            </div>
            
            <MessageDeliveryStatus
              status={delivery.status}
              timestamp={delivery.timestamp}
              error={delivery.error}
              retryable={delivery.retryable}
              onRetry={onRetry ? () => onRetry(delivery.messageId || delivery.tempId || '') : undefined}
              size="sm"
              showTooltip={false}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default MessageDeliveryStatus;
