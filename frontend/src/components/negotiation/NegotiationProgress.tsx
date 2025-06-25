import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClockIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { BlurCard } from '../ui/BlurCard';
import { NegotiationStatus } from '../../../../shared/types/Negotiation';

/**
 * NegotiationProgress Component - Visual progress indicator with feedback
 * 
 * Features:
 * - Visual progress tracking
 * - Round-by-round breakdown
 * - Price movement visualization
 * - Status indicators
 * - Contextual feedback
 */

interface NegotiationProgressProps {
  rounds: number;
  maxRounds: number;
  status: NegotiationStatus;
  initialOffer: number;
  currentOffer: number;
  listPrice: number;
  minPrice: number;
  priceHistory?: Array<{
    round: number;
    amount: number;
    offeredBy: 'buyer' | 'seller' | 'ai';
    timestamp: Date;
  }>;
  averageResponseTime?: number;
  className?: string;
}

export const NegotiationProgress: React.FC<NegotiationProgressProps> = ({
  rounds,
  maxRounds,
  status,
  initialOffer,
  currentOffer,
  listPrice,
  minPrice,
  priceHistory = [],
  averageResponseTime,
  className = ""
}) => {

  // Calculate progress percentage
  const progressPercentage = (rounds / maxRounds) * 100;

  // Calculate price movement
  const priceMovement = currentOffer - initialOffer;
  const priceMovementPercentage = (priceMovement / initialOffer) * 100;

  // Get status configuration
  const getStatusConfig = () => {
    switch (status) {
      case NegotiationStatus.ACCEPTED:
        return {
          icon: <CheckCircleIcon className="w-6 h-6" />,
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/30',
          label: 'Deal Completed'
        };
      case NegotiationStatus.REJECTED:
        return {
          icon: <XCircleIcon className="w-6 h-6" />,
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/30',
          label: 'Negotiation Ended'
        };
      case NegotiationStatus.EXPIRED:
        return {
          icon: <ClockIcon className="w-6 h-6" />,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500/30',
          label: 'Expired'
        };
      case NegotiationStatus.IN_PROGRESS:
        return {
          icon: <ChatBubbleLeftRightIcon className="w-6 h-6" />,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/30',
          label: 'In Progress'
        };
      default:
        return {
          icon: <ClockIcon className="w-6 h-6" />,
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500/30',
          label: 'Initiated'
        };
    }
  };

  const statusConfig = getStatusConfig();

  // Get progress color based on completion and urgency
  const getProgressColor = () => {
    if (progressPercentage < 50) return 'from-green-500 to-blue-500';
    if (progressPercentage < 80) return 'from-blue-500 to-yellow-500';
    return 'from-yellow-500 to-red-500';
  };

  // Format time
  const formatResponseTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  // Calculate negotiation efficiency
  const getEfficiencyMetrics = () => {
    const totalPriceRange = listPrice - minPrice;
    const currentPosition = (currentOffer - minPrice) / totalPriceRange;
    const efficiency = rounds > 0 ? (currentPosition / rounds) * 100 : 0;

    return {
      position: Math.round(currentPosition * 100),
      efficiency: Math.round(efficiency)
    };
  };

  const metrics = getEfficiencyMetrics();

  return (
    <BlurCard className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Progress Tracker</h3>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
          {statusConfig.icon}
          <span className={`text-sm font-medium ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Round Progress */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-white/70">Negotiation Rounds</span>
          <span className="text-white font-medium">
            {rounds} / {maxRounds}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${getProgressColor()} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          
          {/* Warning zone indicator */}
          {progressPercentage > 75 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <ExclamationTriangleIcon className="w-4 h-4 text-yellow-300" />
            </motion.div>
          )}
        </div>

        <div className="flex justify-between text-xs text-white/60">
          <span>Start</span>
          <span>{Math.round(progressPercentage)}% Complete</span>
          <span>End</span>
        </div>
      </div>

      {/* Price Movement */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white/70">Price Movement</span>
          <div className="flex items-center space-x-2">
            {priceMovement > 0 ? (
              <>
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">
                  +${Math.abs(priceMovement).toLocaleString()}
                </span>
              </>
            ) : priceMovement < 0 ? (
              <>
                <ArrowTrendingDownIcon className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm">
                  -${Math.abs(priceMovement).toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-white/60 text-sm">No change</span>
            )}
          </div>
        </div>

        {/* Price Range Visualization */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-white/60">
            <span>Min: ${minPrice.toLocaleString()}</span>
            <span>Current: ${currentOffer.toLocaleString()}</span>
            <span>Max: ${listPrice.toLocaleString()}</span>
          </div>
          
          <div className="relative h-2 bg-gray-700 rounded-full">
            <div className="absolute left-0 top-0 h-full w-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full" />
            <motion.div
              className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-gray-800 shadow-lg"
              initial={{ 
                left: `${((initialOffer - minPrice) / (listPrice - minPrice)) * 100}%` 
              }}
              animate={{ 
                left: `${((currentOffer - minPrice) / (listPrice - minPrice)) * 100}%` 
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <div className="text-xl font-bold text-white">
            {metrics.position}%
          </div>
          <div className="text-xs text-white/60">
            Price Position
          </div>
        </div>

        <div className="text-center p-3 bg-white/5 rounded-lg">
          <div className="text-xl font-bold text-white">
            {metrics.efficiency}%
          </div>
          <div className="text-xs text-white/60">
            Efficiency
          </div>
        </div>

        {averageResponseTime && (
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-xl font-bold text-white">
              {formatResponseTime(averageResponseTime)}
            </div>
            <div className="text-xs text-white/60">
              Avg Response
            </div>
          </div>
        )}

        <div className="text-center p-3 bg-white/5 rounded-lg">
          <div className="text-xl font-bold text-white">
            {Math.round(((currentOffer / listPrice) * 100))}%
          </div>
          <div className="text-xs text-white/60">
            of List Price
          </div>
        </div>
      </div>

      {/* Price History Mini Chart */}
      {priceHistory.length > 1 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white/80">Price History</h4>
          <div className="flex items-end space-x-1 h-16">
            {priceHistory.map((entry, index) => {
              const height = ((entry.amount - minPrice) / (listPrice - minPrice)) * 100;
              const isRecent = index === priceHistory.length - 1;
              
              return (
                <motion.div
                  key={index}
                  className={`flex-1 rounded-t ${
                    entry.offeredBy === 'buyer' 
                      ? 'bg-blue-500/60' 
                      : 'bg-purple-500/60'
                  } ${isRecent ? 'ring-2 ring-white/50' : ''}`}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: index * 0.1 }}
                  title={`Round ${entry.round}: $${entry.amount.toLocaleString()} by ${entry.offeredBy}`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-white/60">
            <span>Round 1</span>
            <span>Latest</span>
          </div>
        </div>
      )}

      {/* Final Round Warning */}
      <AnimatePresence>
        {rounds >= maxRounds - 1 && status === NegotiationStatus.IN_PROGRESS && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="p-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400 flex-shrink-0" />
              <div>
                <div className="text-yellow-300 font-medium text-sm">
                  Final Round Approaching
                </div>
                <div className="text-yellow-300/80 text-xs mt-1">
                  {maxRounds - rounds} rounds remaining. Time to make your best offer!
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </BlurCard>
  );
};
