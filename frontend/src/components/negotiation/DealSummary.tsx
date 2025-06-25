import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  TagIcon,
  TrophyIcon,
  ShareIcon,
  DocumentDuplicateIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { BlurCard } from '../ui/BlurCard';
import { NegotiationStatus } from '../../../../shared/types/Negotiation';

/**
 * DealSummary Component - Comprehensive deal summary with modern blur backgrounds
 * 
 * Features:
 * - Complete negotiation overview
 * - Price breakdown and savings
 * - Timeline and participant info
 * - Success metrics and statistics
 * - Sharing and export options
 */

interface DealSummaryProps {
  negotiation: {
    _id: string;
    status: NegotiationStatus;
    product: {
      _id: string;
      title: string;
      category: string;
      condition: string;
      images: Array<{ url: string; isPrimary: boolean }>;
      pricing: {
        basePrice: number;
        minPrice: number;
        currency: string;
      };
    };
    buyer: {
      _id: string;
      username: string;
      avatar?: string;
    };
    seller: {
      _id: string;
      username: string;
      avatar?: string;
    };
    rounds: number;
    maxRounds: number;
    initialOffer: number;
    currentOffer: number;
    finalPrice?: number;
    createdAt: string;
    concludedAt?: string;
    analytics?: {
      averageResponseTime: number;
      totalMessages: number;
      priceMovement: {
        direction: 'up' | 'down' | 'stable';
        magnitude: number;
        percentage: number;
      };
    };
  };
  userRole: 'buyer' | 'seller';
  onShare?: () => void;
  onExport?: () => void;
  className?: string;
}

export const DealSummary: React.FC<DealSummaryProps> = ({
  negotiation,
  userRole,
  onShare,
  onExport,
  className = ""
}) => {

  const { product, buyer, seller, status, rounds, maxRounds } = negotiation;
  const finalPrice = negotiation.finalPrice || negotiation.currentOffer;
  const savings = product.pricing.basePrice - finalPrice;
  const savingsPercentage = (savings / product.pricing.basePrice) * 100;

  // Get currency symbol
  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      BDT: '৳'
    };
    return symbols[currency] || currency;
  };

  const currencySymbol = getCurrencySymbol(product.pricing.currency);

  // Calculate negotiation duration
  const calculateDuration = () => {
    if (!negotiation.concludedAt) return null;
    
    const start = new Date(negotiation.createdAt);
    const end = new Date(negotiation.concludedAt);
    const diffInMinutes = Math.floor((end.getTime() - start.getTime()) / 60000);
    
    if (diffInMinutes < 60) return `${diffInMinutes} minutes`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours`;
    return `${Math.floor(diffInMinutes / 1440)} days`;
  };

  const duration = calculateDuration();

  // Get status-specific styling and content
  const getStatusDisplay = () => {
    switch (status) {
      case NegotiationStatus.ACCEPTED:
        return {
          icon: <CheckCircleIcon className="w-8 h-8" />,
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/30',
          title: 'Deal Completed!',
          subtitle: 'Congratulations on a successful negotiation',
          celebration: true
        };
      case NegotiationStatus.REJECTED:
        return {
          icon: <TrophyIcon className="w-8 h-8" />,
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/30',
          title: 'Negotiation Ended',
          subtitle: 'Better luck next time',
          celebration: false
        };
      default:
        return {
          icon: <ChatBubbleLeftRightIcon className="w-8 h-8" />,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/30',
          title: 'Negotiation Summary',
          subtitle: 'Current progress and details',
          celebration: false
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  // Get user perspective messaging
  const getUserMessage = () => {
    if (status === NegotiationStatus.ACCEPTED) {
      if (userRole === 'buyer') {
        return `You successfully purchased this item for ${currencySymbol}${finalPrice.toLocaleString()}!`;
      } else {
        return `You successfully sold this item for ${currencySymbol}${finalPrice.toLocaleString()}!`;
      }
    }
    return null;
  };

  const userMessage = getUserMessage();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Status */}
      <BlurCard className="p-6">
        <div className="text-center space-y-4">
          {/* Status Icon and Title */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${statusDisplay.bgColor} ${statusDisplay.borderColor} border-2`}
          >
            <div className={statusDisplay.color}>
              {statusDisplay.icon}
            </div>
          </motion.div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {statusDisplay.title}
            </h2>
            <p className="text-white/70">
              {statusDisplay.subtitle}
            </p>
            {userMessage && (
              <p className="text-lg font-medium text-white mt-3">
                {userMessage}
              </p>
            )}
          </div>

          {/* Celebration Animation */}
          <AnimatePresence>
            {statusDisplay.celebration && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-4xl"
              >
                🎉
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </BlurCard>

      {/* Product Information */}
      <BlurCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Product Details</h3>
        <div className="flex items-start space-x-4">
          {product.images[0] && (
            <img
              src={product.images[0].url}
              alt={product.title}
              className="w-20 h-20 rounded-lg object-cover"
            />
          )}
          <div className="flex-1 space-y-2">
            <h4 className="text-white font-medium">{product.title}</h4>
            <div className="flex items-center space-x-4 text-sm text-white/70">
              <div className="flex items-center space-x-1">
                <TagIcon className="w-4 h-4" />
                <span>{product.category}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>Condition: {product.condition}</span>
              </div>
            </div>
          </div>
        </div>
      </BlurCard>

      {/* Price Breakdown */}
      <BlurCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Price Breakdown</h3>
        <div className="space-y-4">
          {/* Price Details */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Original List Price:</span>
              <span className="text-white font-medium">
                {currencySymbol}{product.pricing.basePrice.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-white/70">Initial Offer:</span>
              <span className="text-white font-medium">
                {currencySymbol}{negotiation.initialOffer.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-white/70">Final Price:</span>
              <span className="text-xl font-bold text-white">
                {currencySymbol}{finalPrice.toLocaleString()}
              </span>
            </div>
            
            <div className="border-t border-white/20 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-white/70">
                  {userRole === 'buyer' ? 'You Saved:' : 'Discount Given:'}
                </span>
                <div className="text-right">
                  <div className={`font-bold ${savings > 0 ? 'text-green-400' : 'text-white'}`}>
                    {currencySymbol}{Math.abs(savings).toLocaleString()}
                  </div>
                  <div className="text-sm text-white/60">
                    ({Math.abs(savingsPercentage).toFixed(1)}%)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Savings Visualization */}
          {savings > 0 && (
            <div className="space-y-2">
              <div className="text-sm text-white/70">Savings Percentage</div>
              <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, savingsPercentage)}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
          )}
        </div>
      </BlurCard>

      {/* Negotiation Statistics */}
      <BlurCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Negotiation Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-xl font-bold text-white">{rounds}</div>
            <div className="text-xs text-white/60">Rounds</div>
          </div>
          
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-xl font-bold text-white">
              {negotiation.analytics?.totalMessages || 0}
            </div>
            <div className="text-xs text-white/60">Messages</div>
          </div>
          
          {duration && (
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="text-xl font-bold text-white">{duration.split(' ')[0]}</div>
              <div className="text-xs text-white/60">{duration.split(' ')[1]}</div>
            </div>
          )}
          
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-xl font-bold text-white">
              {Math.round((rounds / maxRounds) * 100)}%
            </div>
            <div className="text-xs text-white/60">Completed</div>
          </div>
        </div>
      </BlurCard>

      {/* Participants */}
      <BlurCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Participants</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500/30 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <div className="text-white font-medium">{buyer.username}</div>
                <div className="text-white/60 text-sm">Buyer</div>
              </div>
            </div>
            {userRole === 'buyer' && (
              <span className="text-blue-300 text-sm font-medium">You</span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500/30 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <div className="text-white font-medium">{seller.username}</div>
                <div className="text-white/60 text-sm">Seller</div>
              </div>
            </div>
            {userRole === 'seller' && (
              <span className="text-purple-300 text-sm font-medium">You</span>
            )}
          </div>
        </div>
      </BlurCard>

      {/* Timeline */}
      <BlurCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Timeline</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <CalendarDaysIcon className="w-5 h-5 text-blue-400" />
            <div>
              <div className="text-white/70 text-sm">Started</div>
              <div className="text-white">
                {new Date(negotiation.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
          
          {negotiation.concludedAt && (
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-white/70 text-sm">Concluded</div>
                <div className="text-white">
                  {new Date(negotiation.concludedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </BlurCard>

      {/* Actions */}
      {(onShare || onExport) && (
        <BlurCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
          <div className="flex flex-wrap gap-3">
            {onShare && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onShare}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600/80 hover:bg-blue-600 
                  text-blue-100 rounded-lg transition-colors"
              >
                <ShareIcon className="w-4 h-4" />
                <span>Share</span>
              </motion.button>
            )}
            
            {onExport && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onExport}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600/80 hover:bg-gray-600 
                  text-gray-100 rounded-lg transition-colors"
              >
                <DocumentDuplicateIcon className="w-4 h-4" />
                <span>Export</span>
              </motion.button>
            )}
          </div>
        </BlurCard>
      )}
    </div>
  );
};
