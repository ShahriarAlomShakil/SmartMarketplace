import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClockIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  SparklesIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { BlurCard } from '../ui/BlurCard';
import { MessageType, MessageSender } from '../../../../shared/types/Negotiation';

/**
 * NegotiationTimeline Component - Visual timeline of negotiation events
 * 
 * Features:
 * - Chronological event visualization
 * - Message and offer tracking
 * - Interactive timeline with details
 * - Price movement visualization
 * - Participant activity tracking
 */

export interface TimelineEvent {
  id: string;
  type: 'message' | 'offer' | 'counter_offer' | 'acceptance' | 'rejection' | 'system';
  sender: MessageSender;
  timestamp: Date;
  content: string;
  offer?: {
    amount: number;
    currency: string;
  };
  metadata?: {
    confidence?: number;
    aiGenerated?: boolean;
  };
}

interface NegotiationTimelineProps {
  events: TimelineEvent[];
  currentUserRole: 'buyer' | 'seller';
  productTitle: string;
  listPrice: number;
  minPrice: number;
  className?: string;
}

export const NegotiationTimeline: React.FC<NegotiationTimelineProps> = ({
  events,
  currentUserRole,
  productTitle,
  listPrice,
  minPrice,
  className = ""
}) => {

  // Sort events by timestamp
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Get event icon
  const getEventIcon = (event: TimelineEvent) => {
    switch (event.type) {
      case 'offer':
      case 'counter_offer':
        return <CurrencyDollarIcon className="w-5 h-5" />;
      case 'acceptance':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'rejection':
        return <XCircleIcon className="w-5 h-5" />;
      case 'system':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      default:
        return <ChatBubbleLeftRightIcon className="w-5 h-5" />;
    }
  };

  // Get sender styling
  const getSenderStyling = (sender: MessageSender, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return {
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500/30',
        label: 'You'
      };
    }

    switch (sender) {
      case MessageSender.AI:
        return {
          color: 'text-purple-400',
          bgColor: 'bg-purple-500/20',
          borderColor: 'border-purple-500/30',
          label: 'AI Assistant'
        };
      case MessageSender.USER:
        return {
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/30',
          label: 'Participant'
        };
      case MessageSender.OWNER:
        return {
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/20',
          borderColor: 'border-orange-500/30',
          label: 'Owner'
        };
      default:
        return {
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500/30',
          label: 'System'
        };
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return timestamp.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get price position on scale
  const getPricePosition = (amount: number) => {
    const range = listPrice - minPrice;
    const position = ((amount - minPrice) / range) * 100;
    return Math.max(0, Math.min(100, position));
  };

  // Check if current user is the sender
  const isCurrentUserSender = (sender: MessageSender) => {
    return (currentUserRole === 'buyer' && sender === MessageSender.USER) ||
           (currentUserRole === 'seller' && sender === MessageSender.OWNER);
  };

  return (
    <BlurCard className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <ClockIcon className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Negotiation Timeline</h3>
        </div>
        <div className="text-sm text-white/60">
          {events.length} events
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500" />

        {/* Events */}
        <div className="space-y-6">
          <AnimatePresence>
            {sortedEvents.map((event, index) => {
              const isCurrentUser = isCurrentUserSender(event.sender);
              const senderStyling = getSenderStyling(event.sender, isCurrentUser);
              
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex items-start space-x-4"
                >
                  {/* Timeline Node */}
                  <div className={`relative z-10 w-12 h-12 rounded-full border-2 flex items-center justify-center ${senderStyling.bgColor} ${senderStyling.borderColor}`}>
                    <div className={senderStyling.color}>
                      {getEventIcon(event)}
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className="flex-1 min-w-0">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all duration-200"
                    >
                      {/* Event Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${senderStyling.color}`}>
                            {senderStyling.label}
                          </span>
                          {event.metadata?.aiGenerated && (
                            <div className="flex items-center space-x-1">
                              <SparklesIcon className="w-4 h-4 text-purple-400" />
                              <span className="text-xs text-purple-300">AI</span>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-white/60">
                          {formatTimestamp(event.timestamp)}
                        </span>
                      </div>

                      {/* Message Content */}
                      <p className="text-white/80 text-sm mb-3">
                        {event.content}
                      </p>

                      {/* Offer Details */}
                      {event.offer && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex items-center space-x-2">
                              <CurrencyDollarIcon className="w-5 h-5 text-green-400" />
                              <span className="text-white/70 text-sm">Offer Amount:</span>
                            </div>
                            <span className="text-lg font-bold text-white">
                              ${event.offer.amount.toLocaleString()}
                            </span>
                          </div>

                          {/* Price Position Indicator */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-white/60">
                              <span>Min: ${minPrice.toLocaleString()}</span>
                              <span>Max: ${listPrice.toLocaleString()}</span>
                            </div>
                            <div className="relative h-2 bg-gray-700 rounded-full">
                              <div className="absolute left-0 top-0 h-full w-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full" />
                              <div
                                className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-gray-800 shadow-lg"
                                style={{ left: `${getPricePosition(event.offer.amount)}%` }}
                              />
                            </div>
                          </div>

                          {/* Price Analysis */}
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center p-2 bg-white/5 rounded">
                              <div className="text-white font-medium">
                                {Math.round((event.offer.amount / listPrice) * 100)}%
                              </div>
                              <div className="text-white/60">of List</div>
                            </div>
                            <div className="text-center p-2 bg-white/5 rounded">
                              <div className="text-white font-medium">
                                ${Math.abs(listPrice - event.offer.amount).toLocaleString()}
                              </div>
                              <div className="text-white/60">Difference</div>
                            </div>
                            <div className="text-center p-2 bg-white/5 rounded">
                              <div className={`font-medium ${
                                event.offer.amount >= minPrice ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {event.offer.amount >= minPrice ? 'Valid' : 'Low'}
                              </div>
                              <div className="text-white/60">Status</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* AI Confidence */}
                      {event.metadata?.confidence && (
                        <div className="mt-3 flex items-center space-x-2">
                          <span className="text-xs text-white/60">AI Confidence:</span>
                          <div className="flex-1 h-1.5 bg-gray-700 rounded-full max-w-20">
                            <div
                              className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"
                              style={{ width: `${event.metadata.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-white/80">
                            {Math.round(event.metadata.confidence * 100)}%
                          </span>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Future Timeline Extension */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: sortedEvents.length * 0.1 + 0.5 }}
          className="relative flex items-center space-x-4 mt-6"
        >
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center bg-white/5">
            <ClockIcon className="w-5 h-5 text-white/50" />
          </div>
          <div className="text-white/50 text-sm italic">
            Awaiting next response...
          </div>
        </motion.div>
      </div>

      {/* Timeline Stats */}
      <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10">
        <h4 className="text-sm font-medium text-white/80 mb-3">Timeline Statistics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-white">
              {events.filter(e => e.type === 'offer' || e.type === 'counter_offer').length}
            </div>
            <div className="text-xs text-white/60">Offers Made</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">
              {events.filter(e => e.type === 'message').length}
            </div>
            <div className="text-xs text-white/60">Messages</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">
              {events.filter(e => e.sender === MessageSender.AI).length}
            </div>
            <div className="text-xs text-white/60">AI Responses</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">
              {events.length > 1 ? Math.round((events[events.length - 1].timestamp.getTime() - events[0].timestamp.getTime()) / 60000) : 0}m
            </div>
            <div className="text-xs text-white/60">Duration</div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {events.length === 0 && (
        <div className="text-center py-12">
          <ClockIcon className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-white/60 mb-2">No Events Yet</h4>
          <p className="text-white/40">
            The negotiation timeline will appear here as the conversation progresses.
          </p>
        </div>
      )}
    </BlurCard>
  );
};
