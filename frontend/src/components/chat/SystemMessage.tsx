import React from 'react';
import { motion } from 'framer-motion';
import { ModernBadge } from '../ui/ModernBadge';
import { cn } from '../../utils/cn';
import { NegotiationMessage } from '../../../../shared/types/Negotiation';
import {
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

/**
 * SystemMessage Component - System messages for negotiation status updates
 * 
 * Features:
 * - Different styles for different system message types
 * - Icon indicators
 * - Modern blur design
 * - Centered layout
 * - Status badges
 */

interface SystemMessageProps {
  message: NegotiationMessage;
  className?: string;
}

export const SystemMessage: React.FC<SystemMessageProps> = ({
  message,
  className
}) => {
  const getMessageStyle = (content: string) => {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('accepted') || lowerContent.includes('deal') || lowerContent.includes('sold')) {
      return {
        icon: <CheckCircleIcon className="w-5 h-5 text-green-400" />,
        badgeVariant: 'success' as const,
        containerClass: 'bg-green-500/10 border-green-400/30',
        textClass: 'text-green-100'
      };
    }
    
    if (lowerContent.includes('rejected') || lowerContent.includes('declined') || lowerContent.includes('cancelled')) {
      return {
        icon: <XCircleIcon className="w-5 h-5 text-red-400" />,
        badgeVariant: 'error' as const,
        containerClass: 'bg-red-500/10 border-red-400/30',
        textClass: 'text-red-100'
      };
    }
    
    if (lowerContent.includes('offer') || lowerContent.includes('counter')) {
      return {
        icon: <CurrencyDollarIcon className="w-5 h-5 text-blue-400" />,
        badgeVariant: 'info' as const,
        containerClass: 'bg-blue-500/10 border-blue-400/30',
        textClass: 'text-blue-100'
      };
    }
    
    if (lowerContent.includes('expired') || lowerContent.includes('timeout')) {
      return {
        icon: <ClockIcon className="w-5 h-5 text-yellow-400" />,
        badgeVariant: 'warning' as const,
        containerClass: 'bg-yellow-500/10 border-yellow-400/30',
        textClass: 'text-yellow-100'
      };
    }
    
    // Default info style
    return {
      icon: <InformationCircleIcon className="w-5 h-5 text-blue-400" />,
      badgeVariant: 'info' as const,
      containerClass: 'bg-white/10 border-white/20',
      textClass: 'text-white/80'
    };
  };

  const style = getMessageStyle(message.content);

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return minutes < 1 ? 'Just now' : `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return messageTime.toLocaleDateString();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'flex justify-center my-4',
        className
      )}
    >
      <div className={cn(
        'max-w-md px-4 py-3 rounded-xl backdrop-blur-xl border',
        'flex items-center space-x-3',
        style.containerClass
      )}>
        {/* Icon */}
        <div className="flex-shrink-0">
          {style.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <ModernBadge variant={style.badgeVariant} size="sm">
              System
            </ModernBadge>
            <span className="text-xs text-white/50">
              {formatTimestamp(message.timestamp)}
            </span>
          </div>
          
          <p className={cn(
            'text-sm font-medium',
            style.textClass
          )}>
            {message.content}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SystemMessage;
