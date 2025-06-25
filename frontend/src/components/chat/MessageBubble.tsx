import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ModernButton } from '../ui/ModernButton';
import { ModernBadge } from '../ui/ModernBadge';
import { BlurCard } from '../ui/BlurCard';
import { cn } from '../../utils/cn';
import { NegotiationMessage } from '../../../../shared/types/Negotiation';
import {
  UserIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EllipsisHorizontalIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { CheckIcon as CheckIconSolid } from '@heroicons/react/24/solid';

/**
 * MessageBubble Component - Individual message bubble with styling
 * 
 * Features:
 * - Different styles for buyer/seller/AI messages
 * - Special styling for offer messages
 * - Message timestamps and status indicators
 * - Message actions (copy, report)
 * - Avatar display
 * - Modern blur design
 */

interface MessageBubbleProps {
  message: NegotiationMessage;
  isOwn: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  senderName: string;
  senderAvatar?: string;
  onAction?: (action: 'copy' | 'report', messageId: string) => void;
  className?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar = true,
  showTimestamp = true,
  senderName,
  senderAvatar,
  onAction,
  className
}) => {
  const [showActions, setShowActions] = useState(false);
  const [copied, setCopied] = useState(false);

  const isOffer = message.type === 'offer' || message.type === 'counter_offer';
  const isAI = message.sender === 'ai';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onAction?.('copy', message._id);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const handleReport = () => {
    onAction?.('report', message._id);
  };

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

  const bubbleVariants = {
    own: 'bg-gradient-to-br from-blue-500/80 to-purple-600/80 text-white ml-auto',
    other: 'bg-white/15 backdrop-blur-xl text-white',
    ai: 'bg-gradient-to-br from-emerald-500/60 to-teal-600/60 text-white',
    offer: 'ring-2 ring-yellow-400/50 bg-gradient-to-br from-yellow-500/20 to-orange-500/20'
  };

  const getBubbleStyle = () => {
    if (isOffer) return bubbleVariants.offer;
    if (isAI) return bubbleVariants.ai;
    return isOwn ? bubbleVariants.own : bubbleVariants.other;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex items-end space-x-2 max-w-[85%]',
        isOwn ? 'ml-auto flex-row-reverse space-x-reverse' : '',
        className
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <div className="w-8 h-8 flex-shrink-0">
          {senderAvatar ? (
            <Image
              src={senderAvatar}
              alt={senderName}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center',
              isAI ? 'bg-emerald-500/30' : 'bg-white/20'
            )}>
              <UserIcon className={cn(
                'w-4 h-4',
                isAI ? 'text-emerald-300' : 'text-white/60'
              )} />
            </div>
          )}
        </div>
      )}

      {/* Message Content */}
      <div className="flex flex-col space-y-1 flex-1">
        {/* Sender Name (for other's messages) */}
        {!isOwn && showAvatar && (
          <span className="text-white/60 text-xs font-medium px-1">
            {senderName}
            {isAI && (
              <ModernBadge variant="success" size="sm" className="ml-2">
                AI
              </ModernBadge>
            )}
          </span>
        )}

        {/* Message Bubble */}
        <div className={cn(
          'relative rounded-2xl px-4 py-3 shadow-modern',
          'border border-white/10',
          getBubbleStyle(),
          isOwn ? 'rounded-br-md' : 'rounded-bl-md'
        )}>
          {/* Offer Badge */}
          {isOffer && (
            <div className="flex items-center space-x-2 mb-2">
              <CurrencyDollarIcon className="w-4 h-4 text-yellow-300" />
              <ModernBadge variant="warning" size="sm">
                {message.type === 'offer' ? 'Offer' : 'Counter Offer'}
              </ModernBadge>
            </div>
          )}

          {/* Message Content */}
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>

          {/* Offer Amount */}
          {isOffer && message.offer && (
            <div className="mt-3 p-3 bg-black/20 rounded-lg border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Offer Amount:</span>
                <span className="text-lg font-bold text-yellow-300">
                  ${message.offer.amount.toLocaleString()}
                </span>
              </div>
              {message.offer.reasoning && (
                <p className="text-white/70 text-xs mt-2">
                  {message.offer.reasoning}
                </p>
              )}
            </div>
          )}

          {/* AI Metadata */}
          {isAI && message.metadata && (
            <div className="mt-2 text-xs text-white/60">
              Confidence: {Math.round((message.metadata.confidence || 0) * 100)}%
            </div>
          )}

          {/* Message Actions */}
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={cn(
                  'absolute top-0 flex items-center space-x-1 bg-black/40 backdrop-blur-xl rounded-lg p-1',
                  'border border-white/20',
                  isOwn ? '-left-16' : '-right-16'
                )}
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCopy}
                  className="p-1 text-white/60 hover:text-white transition-colors"
                  title="Copy message"
                >
                  {copied ? (
                    <CheckIconSolid className="w-3 h-3 text-green-400" />
                  ) : (
                    <DocumentDuplicateIcon className="w-3 h-3" />
                  )}
                </motion.button>
                
                {!isOwn && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleReport}
                    className="p-1 text-white/60 hover:text-red-400 transition-colors"
                    title="Report message"
                  >
                    <ExclamationTriangleIcon className="w-3 h-3" />
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Timestamp and Status */}
        {showTimestamp && (
          <div className={cn(
            'flex items-center space-x-2 text-xs text-white/50 px-1',
            isOwn ? 'justify-end' : 'justify-start'
          )}>
            <ClockIcon className="w-3 h-3" />
            <span>{formatTimestamp(message.timestamp)}</span>
            
            {/* Read Status for own messages */}
            {isOwn && (
              <div className="flex items-center space-x-1">
                {message.isRead ? (
                  <CheckIconSolid className="w-3 h-3 text-blue-400" />
                ) : (
                  <CheckIcon className="w-3 h-3 text-white/40" />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MessageBubble;
