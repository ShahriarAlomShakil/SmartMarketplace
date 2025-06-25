import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { BlurCard } from '../ui/BlurCard';

/**
 * QuickActions Component - Quick action buttons for common negotiation responses
 * 
 * Features:
 * - Pre-defined quick responses for common scenarios
 * - Smart counter-offer suggestions
 * - Context-aware action buttons
 * - Visual feedback and animations
 */

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: 'accept' | 'reject' | 'counter' | 'message' | 'ask_question';
  message?: string;
  counterOffer?: number;
  variant: 'success' | 'danger' | 'primary' | 'secondary' | 'warning';
  disabled?: boolean;
}

interface QuickActionsProps {
  currentOffer?: number;
  minPrice: number;
  maxPrice: number;
  rounds: number;
  maxRounds: number;
  isLastRound?: boolean;
  userRole: 'buyer' | 'seller';
  productTitle: string;
  onAction: (action: QuickAction) => void;
  disabled?: boolean;
  className?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  currentOffer,
  minPrice,
  maxPrice,
  rounds,
  maxRounds,
  isLastRound = false,
  userRole,
  productTitle,
  onAction,
  disabled = false,
  className = ""
}) => {

  // Generate context-aware quick actions
  const generateQuickActions = (): QuickAction[] => {
    const actions: QuickAction[] = [];

    if (userRole === 'buyer') {
      // Buyer actions
      if (currentOffer) {
        // Accept current offer
        actions.push({
          id: 'accept',
          label: 'Accept Offer',
          icon: <CheckCircleIcon className="w-5 h-5" />,
          action: 'accept',
          message: `I accept your offer of $${currentOffer.toLocaleString()}.`,
          variant: 'success'
        });

        // Ask for small discount
        const discountAmount = Math.round(currentOffer * 0.95);
        if (discountAmount >= minPrice) {
          actions.push({
            id: 'small_discount',
            label: 'Ask Small Discount',
            icon: <CurrencyDollarIcon className="w-5 h-5" />,
            action: 'counter',
            message: `Would you consider $${discountAmount.toLocaleString()}? I think that's a fair price.`,
            counterOffer: discountAmount,
            variant: 'primary'
          });
        }
      }

      // Ask questions
      actions.push({
        id: 'ask_condition',
        label: 'Ask About Condition',
        icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />,
        action: 'ask_question',
        message: `Can you tell me more about the condition of the ${productTitle}?`,
        variant: 'secondary'
      });

      actions.push({
        id: 'ask_negotiation',
        label: 'Open to Negotiation?',
        icon: <HandThumbUpIcon className="w-5 h-5" />,
        action: 'ask_question',
        message: 'Are you open to negotiating on the price?',
        variant: 'secondary'
      });

      if (isLastRound) {
        actions.push({
          id: 'final_plea',
          label: 'Final Request',
          icon: <ClockIcon className="w-5 h-5" />,
          action: 'message',
          message: 'This is my final offer. Can we make this work?',
          variant: 'warning'
        });
      }

    } else {
      // Seller actions
      if (currentOffer) {
        const offerRatio = currentOffer / maxPrice;

        // Accept if good offer
        if (offerRatio >= 0.9) {
          actions.push({
            id: 'accept',
            label: 'Accept Offer',
            icon: <CheckCircleIcon className="w-5 h-5" />,
            action: 'accept',
            message: `Perfect! I accept your offer of $${currentOffer.toLocaleString()}.`,
            variant: 'success'
          });
        }

        // Counter with different strategies
        if (offerRatio < 0.9 && currentOffer >= minPrice) {
          const counterOffer = Math.round(currentOffer + ((maxPrice - currentOffer) * 0.5));
          actions.push({
            id: 'counter_middle',
            label: 'Meet in Middle',
            icon: <CurrencyDollarIcon className="w-5 h-5" />,
            action: 'counter',
            message: `How about we meet in the middle at $${counterOffer.toLocaleString()}?`,
            counterOffer,
            variant: 'primary'
          });
        }

        if (offerRatio < 0.8) {
          actions.push({
            id: 'reject_low',
            label: 'Too Low',
            icon: <XCircleIcon className="w-5 h-5" />,
            action: 'reject',
            message: 'That offer is too low for me. This is a quality item.',
            variant: 'danger'
          });
        }
      }

      // Highlight value
      actions.push({
        id: 'highlight_value',
        label: 'Explain Value',
        icon: <SparklesIcon className="w-5 h-5" />,
        action: 'message',
        message: `This ${productTitle} is in excellent condition and priced fairly for the market.`,
        variant: 'secondary'
      });

      // Show flexibility
      actions.push({
        id: 'show_flexibility',
        label: 'Show Flexibility',
        icon: <HandThumbUpIcon className="w-5 h-5" />,
        action: 'message',
        message: 'I\'m open to reasonable offers. What did you have in mind?',
        variant: 'primary'
      });

      if (isLastRound) {
        actions.push({
          id: 'final_decision',
          label: 'Final Decision',
          icon: <ClockIcon className="w-5 h-5" />,
          action: 'message',
          message: 'This is the final round. Let\'s make a deal!',
          variant: 'warning'
        });
      }
    }

    return actions;
  };

  const quickActions = generateQuickActions();

  const getButtonStyles = (variant: string) => {
    const baseStyles = "flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ";
    
    switch (variant) {
      case 'success':
        return baseStyles + "bg-green-600/80 hover:bg-green-600 text-green-100 border border-green-500/50";
      case 'danger':
        return baseStyles + "bg-red-600/80 hover:bg-red-600 text-red-100 border border-red-500/50";
      case 'primary':
        return baseStyles + "bg-blue-600/80 hover:bg-blue-600 text-blue-100 border border-blue-500/50";
      case 'warning':
        return baseStyles + "bg-yellow-600/80 hover:bg-yellow-600 text-yellow-100 border border-yellow-500/50";
      default:
        return baseStyles + "bg-gray-600/80 hover:bg-gray-600 text-gray-100 border border-gray-500/50";
    }
  };

  const handleActionClick = (action: QuickAction) => {
    if (!disabled && !action.disabled) {
      onAction(action);
    }
  };

  return (
    <BlurCard className={`p-6 space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
        <div className="text-sm text-white/60">
          Round {rounds}/{maxRounds}
        </div>
      </div>

      <div className="space-y-3">
        {/* Primary Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions
            .filter(action => ['accept', 'counter_middle', 'small_discount'].includes(action.id))
            .map((action, index) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleActionClick(action)}
                disabled={disabled || action.disabled}
                className={`${getButtonStyles(action.variant)} ${
                  disabled || action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                {action.icon}
                <span>{action.label}</span>
              </motion.button>
            ))}
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {quickActions
            .filter(action => !['accept', 'counter_middle', 'small_discount'].includes(action.id))
            .map((action, index) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index + 2) * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleActionClick(action)}
                disabled={disabled || action.disabled}
                className={`${getButtonStyles(action.variant)} text-xs ${
                  disabled || action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  {action.icon}
                  <span className="leading-tight">{action.label}</span>
                </div>
              </motion.button>
            ))}
        </div>
      </div>

      {/* Context Information */}
      {currentOffer && (
        <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">Current Offer:</span>
            <span className="text-white font-medium">${currentOffer.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-white/70">Price Range:</span>
            <span className="text-white/80">
              ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {isLastRound && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 bg-yellow-500/20 border border-yellow-400/30 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-300 text-sm font-medium">
              Final Round - Last chance to negotiate!
            </span>
          </div>
        </motion.div>
      )}
    </BlurCard>
  );
};
