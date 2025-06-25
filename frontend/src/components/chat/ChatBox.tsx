import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlurCard } from '../ui/BlurCard';
import { ModernLoading } from '../ui/ModernLoading';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { SystemMessage } from './SystemMessage';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../contexts/AuthContext';
import { NegotiationMessage, MessageType, MessageSender } from '../../../../shared/types/Negotiation';
import { cn } from '../../utils/cn';
import {
  ExclamationTriangleIcon,
  WifiIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline';

/**
 * ChatBox Component - Main chat interface with modern blur design
 * 
 * Features:
 * - Real-time messaging with typing indicators
 * - Auto-scroll to latest messages
 * - Message grouping by sender and time
 * - Connection status indicators
 * - Loading states with modern animations
 * - Responsive design for mobile
 * - Modern scrollbar styling
 */

interface ChatBoxProps {
  negotiationId: string;
  productId: string;
  productTitle: string;
  productImage?: string;
  productPrice: number;
  sellerName?: string;
  sellerAvatar?: string;
  buyerName?: string;
  buyerAvatar?: string;
  participantName?: string;
  participantAvatar?: string;
  ownerName?: string;
  ownerAvatar?: string;
  messages?: NegotiationMessage[];
  currentUserRole: 'buyer' | 'seller' | 'participant' | 'owner';
  isTyping?: boolean;
  typingUser?: string;
  onSendMessage: (message: string, type?: MessageType) => void;
  onSendOffer: (amount: number, message?: string) => void;
  isLoading?: boolean;
  connectionStatus?: 'connected' | 'connecting' | 'disconnected';
  className?: string;
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  negotiationId,
  productId,
  productTitle,
  productImage,
  productPrice,
  sellerName,
  sellerAvatar,
  buyerName,
  buyerAvatar,
  participantName,
  participantAvatar,
  ownerName,
  ownerAvatar,
  messages: externalMessages,
  currentUserRole,
  isTyping: externalIsTyping,
  typingUser: externalTypingUser,
  onSendMessage,
  onSendOffer,
  isLoading: externalLoading,
  connectionStatus: externalConnectionStatus,
  className
}) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Use chat hook if external messages not provided
  const {
    messages: hookMessages,
    isLoading: hookLoading,
    isTyping: hookIsTyping,
    typingUser: hookTypingUser,
    connectionStatus: hookConnectionStatus,
    sendMessage,
    sendOffer,
    error
  } = useChat({
    negotiationId,
    currentUserRole: currentUserRole as 'buyer' | 'seller',
    onMessageReceived: (message) => {
      console.log('New message received:', message);
    },
    onTypingChanged: (isTyping, user) => {
      console.log('Typing status changed:', isTyping, user);
    }
  });

  // Use external props or hook values
  const messages = externalMessages || hookMessages;
  const isLoading = externalLoading !== undefined ? externalLoading : hookLoading;
  const isTyping = externalIsTyping !== undefined ? externalIsTyping : hookIsTyping;
  const typingUser = externalTypingUser || hookTypingUser;
  const connectionStatus = externalConnectionStatus || hookConnectionStatus;

  // Determine participant names (backward compatibility)
  const effectiveParticipantName = participantName || buyerName || 'Participant';
  const effectiveParticipantAvatar = participantAvatar || buyerAvatar;
  const effectiveOwnerName = ownerName || sellerName || 'Owner';
  const effectiveOwnerAvatar = ownerAvatar || sellerAvatar;

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current && shouldAutoScroll) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end'
      });
    }
  }, [shouldAutoScroll]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle scroll to detect manual scrolling
  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldAutoScroll(isAtBottom);
    }
  }, []);

  // Handle message sending
  const handleSendMessage = useCallback((content: string, type?: MessageType) => {
    if (externalMessages) {
      // Use external handler
      onSendMessage(content, type);
    } else {
      // Use hook
      sendMessage(content, type);
    }
  }, [externalMessages, onSendMessage, sendMessage]);

  // Handle offer sending
  const handleSendOffer = useCallback((amount: number, message?: string) => {
    if (externalMessages) {
      // Use external handler
      onSendOffer(amount, message);
    } else {
      // Use hook
      sendOffer(amount, message);
    }
  }, [externalMessages, onSendOffer, sendOffer]);

  // Group messages by time and sender
  const groupedMessages = messages.reduce((groups: NegotiationMessage[][], message, index) => {
    const prevMessage = messages[index - 1];
    const timeDiff = prevMessage ? 
      new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() : 
      0;
    
    const shouldGroup = prevMessage && 
      prevMessage.sender === message.sender && 
      timeDiff < 5 * 60 * 1000; // 5 minutes
    
    if (shouldGroup && groups.length > 0) {
      groups[groups.length - 1].push(message);
    } else {
      groups.push([message]);
    }
    
    return groups;
  }, []);

  return (
    <BlurCard variant="elevated" className={cn('flex flex-col h-full', className)}>
      {/* Chat Header */}
      <ChatHeader
        productTitle={productTitle}
        productImage={productImage}
        productPrice={productPrice}
        sellerName={effectiveOwnerName}
        sellerAvatar={effectiveOwnerAvatar}
        buyerName={effectiveParticipantName}
        buyerAvatar={effectiveParticipantAvatar}
        connectionStatus={connectionStatus}
      />

      {/* Connection Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-4 p-3 rounded-lg bg-red-500/20 border border-red-400/30 flex items-center space-x-3"
        >
          <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-100 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Connection Status */}
      {connectionStatus !== 'connected' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'mx-4 mt-4 p-3 rounded-lg border flex items-center justify-center space-x-2',
            connectionStatus === 'connecting' && 'bg-yellow-500/20 border-yellow-400/30',
            connectionStatus === 'disconnected' && 'bg-red-500/20 border-red-400/30'
          )}
        >
          {connectionStatus === 'connecting' ? (
            <WifiIcon className="w-5 h-5 text-yellow-400 animate-pulse" />
          ) : (
            <NoSymbolIcon className="w-5 h-5 text-red-400" />
          )}
          <span className={cn(
            'text-sm font-medium',
            connectionStatus === 'connecting' && 'text-yellow-100',
            connectionStatus === 'disconnected' && 'text-red-100'
          )}>
            {connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
          </span>
        </motion.div>
      )}

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
      >
        {isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <ModernLoading size="sm" text="Loading messages..." />
          </div>
        ) : (
          <AnimatePresence>
            {groupedMessages.map((group, groupIndex) => (
              <motion.div
                key={`group-${groupIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: groupIndex * 0.05 }}
                className="space-y-2"
              >
                {group.map((message, messageIndex) => {
                  const isOwn = (message.sender === MessageSender.USER && user?._id === message.senderId) ||
                               (message.sender === MessageSender.OWNER && currentUserRole === 'owner') ||
                               (message.sender === MessageSender.USER && currentUserRole === 'participant');

                  const senderName = isOwn ? 'You' : 
                                   (message.sender === MessageSender.AI ? 'AI Assistant' : 
                                    effectiveParticipantName);

                  const senderAvatar = isOwn ? user?.avatar : 
                                     (message.sender === MessageSender.AI ? undefined : 
                                      effectiveParticipantAvatar);

                  if (message.type === MessageType.SYSTEM) {
                    return (
                      <SystemMessage
                        key={message._id}
                        message={message}
                      />
                    );
                  }

                  return (
                    <MessageBubble
                      key={message._id}
                      message={message}
                      isOwn={isOwn}
                      showAvatar={messageIndex === group.length - 1}
                      showTimestamp={messageIndex === group.length - 1}
                      senderName={senderName}
                      senderAvatar={senderAvatar}
                      onAction={(action, messageId) => {
                        console.log(`Message action: ${action} on ${messageId}`);
                      }}
                    />
                  );
                })}
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Typing Indicator */}
        {isTyping && typingUser && (
          <TypingIndicator
            userName={typingUser}
            isVisible={true}
          />
        )}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-white/15 p-4">
        <MessageInput
          onSendMessage={handleSendMessage}
          onSendOffer={handleSendOffer}
          disabled={connectionStatus === 'disconnected' || isLoading}
          showOfferButton={currentUserRole === 'buyer' || currentUserRole === 'participant'}
          maxPrice={productPrice}
          placeholder={
            connectionStatus === 'disconnected' 
              ? 'Reconnecting...' 
              : 'Type your message...'
          }
        />
      </div>
    </BlurCard>
  );
};

export default ChatBox;
