import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlurCard } from '../ui/BlurCard';
import { ModernBadge } from '../ui/ModernBadge';
import { cn } from '../../utils/cn';
import {
  WifiIcon,
  SignalIcon,
  SignalSlashIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

/**
 * ConnectionQuality Component - Display connection status and quality
 * 
 * Features:
 * - Real-time connection status
 * - Connection quality indicators
 * - Latency display
 * - Retry functionality
 * - Modern blur design
 * - Animated status changes
 */

interface ConnectionQualityProps {
  isConnected: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'reconnecting';
  quality: 'excellent' | 'good' | 'poor' | 'offline';
  latency: number;
  pendingMessages: number;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
  showDetails?: boolean;
}

export const ConnectionQuality: React.FC<ConnectionQualityProps> = ({
  isConnected,
  connectionStatus,
  quality,
  latency,
  pendingMessages,
  onRetry,
  className,
  compact = false,
  showDetails = true
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [lastStatusChange, setLastStatusChange] = useState<Date>(new Date());

  // Update last status change time
  useEffect(() => {
    setLastStatusChange(new Date());
  }, [connectionStatus, quality]);

  // Get status configuration
  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: quality === 'excellent' ? WifiIcon : 
                quality === 'good' ? SignalIcon : 
                quality === 'poor' ? ExclamationTriangleIcon : SignalSlashIcon,
          color: quality === 'excellent' ? 'text-green-400' :
                 quality === 'good' ? 'text-green-400' :
                 quality === 'poor' ? 'text-yellow-400' : 'text-red-400',
          bgColor: quality === 'excellent' ? 'bg-green-400/20' :
                   quality === 'good' ? 'bg-green-400/20' :
                   quality === 'poor' ? 'bg-yellow-400/20' : 'bg-red-400/20',
          borderColor: quality === 'excellent' ? 'border-green-400/30' :
                       quality === 'good' ? 'border-green-400/30' :
                       quality === 'poor' ? 'border-yellow-400/30' : 'border-red-400/30',
          text: quality === 'excellent' ? 'Excellent' :
                quality === 'good' ? 'Good' :
                quality === 'poor' ? 'Poor Connection' : 'Offline',
          description: quality === 'excellent' ? 'Connection is optimal' :
                       quality === 'good' ? 'Connection is stable' :
                       quality === 'poor' ? 'Connection is slow' : 'No connection'
        };
      case 'connecting':
        return {
          icon: ArrowPathIcon,
          color: 'text-blue-400',
          bgColor: 'bg-blue-400/20',
          borderColor: 'border-blue-400/30',
          text: 'Connecting',
          description: 'Establishing connection...'
        };
      case 'reconnecting':
        return {
          icon: ArrowPathIcon,
          color: 'text-orange-400',
          bgColor: 'bg-orange-400/20',
          borderColor: 'border-orange-400/30',
          text: 'Reconnecting',
          description: 'Attempting to reconnect...'
        };
      default:
        return {
          icon: SignalSlashIcon,
          color: 'text-red-400',
          bgColor: 'bg-red-400/20',
          borderColor: 'border-red-400/30',
          text: 'Disconnected',
          description: 'Connection lost'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  // Format latency display
  const formatLatency = (ms: number) => {
    if (ms === 0) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // Get quality badge variant
  const getQualityBadge = () => {
    switch (quality) {
      case 'excellent':
        return 'success';
      case 'good':
        return 'info';
      case 'poor':
        return 'warning';
      default:
        return 'error';
    }
  };

  if (compact) {
    return (
      <motion.div
        className={cn(
          'flex items-center space-x-2 px-3 py-2 rounded-lg',
          statusConfig.bgColor,
          statusConfig.borderColor,
          'border backdrop-blur-sm',
          className
        )}
        whileHover={{ scale: 1.02 }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <motion.div
          animate={connectionStatus === 'connecting' || connectionStatus === 'reconnecting' ? {
            rotate: 360
          } : {}}
          transition={{
            duration: 1,
            repeat: connectionStatus === 'connecting' || connectionStatus === 'reconnecting' ? Infinity : 0,
            ease: 'linear'
          }}
        >
          <StatusIcon className={cn('w-4 h-4', statusConfig.color)} />
        </motion.div>
        
        {showDetails && (
          <>
            <span className={cn('text-sm font-medium', statusConfig.color)}>
              {statusConfig.text}
            </span>
            
            {latency > 0 && (
              <span className="text-xs text-white/60">
                {formatLatency(latency)}
              </span>
            )}
            
            {pendingMessages > 0 && (
              <ModernBadge variant="warning" size="sm">
                {pendingMessages}
              </ModernBadge>
            )}
          </>
        )}

        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-0 mb-2 z-50"
            >
              <BlurCard variant="elevated" className="p-3 text-sm">
                <div className="space-y-1">
                  <div className="font-medium text-white">{statusConfig.text}</div>
                  <div className="text-white/70">{statusConfig.description}</div>
                  {latency > 0 && (
                    <div className="text-white/60">Latency: {formatLatency(latency)}</div>
                  )}
                  {pendingMessages > 0 && (
                    <div className="text-yellow-400">
                      {pendingMessages} messages pending
                    </div>
                  )}
                </div>
              </BlurCard>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <BlurCard 
      variant="elevated" 
      className={cn(
        'p-4 space-y-4',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <motion.div
            animate={connectionStatus === 'connecting' || connectionStatus === 'reconnecting' ? {
              rotate: 360
            } : {}}
            transition={{
              duration: 1,
              repeat: connectionStatus === 'connecting' || connectionStatus === 'reconnecting' ? Infinity : 0,
              ease: 'linear'
            }}
            className={cn(
              'p-2 rounded-lg',
              statusConfig.bgColor,
              statusConfig.borderColor,
              'border'
            )}
          >
            <StatusIcon className={cn('w-5 h-5', statusConfig.color)} />
          </motion.div>
          
          <div>
            <h3 className="font-semibold text-white">{statusConfig.text}</h3>
            <p className="text-sm text-white/70">{statusConfig.description}</p>
          </div>
        </div>
        
        <ModernBadge variant={getQualityBadge()} className="capitalize">
          {quality}
        </ModernBadge>
      </div>

      {/* Connection Details */}
      {showDetails && (
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-sm text-white/70">
              <ClockIcon className="w-4 h-4" />
              <span>Latency</span>
            </div>
            <div className="text-lg font-mono text-white">
              {formatLatency(latency)}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-sm text-white/70">
              <ArrowPathIcon className="w-4 h-4" />
              <span>Pending</span>
            </div>
            <div className="text-lg font-mono text-white">
              {pendingMessages}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {(!isConnected || connectionStatus === 'disconnected') && onRetry && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRetry}
          className={cn(
            'w-full py-2 px-4 rounded-lg font-medium',
            'bg-blue-500/20 border border-blue-400/30 text-blue-400',
            'hover:bg-blue-500/30 transition-colors',
            'flex items-center justify-center space-x-2'
          )}
        >
          <ArrowPathIcon className="w-4 h-4" />
          <span>Retry Connection</span>
        </motion.button>
      )}

      {/* Status History */}
      {showDetails && (
        <div className="text-xs text-white/50 text-center">
          Last updated: {lastStatusChange.toLocaleTimeString()}
        </div>
      )}
    </BlurCard>
  );
};

export default ConnectionQuality;
