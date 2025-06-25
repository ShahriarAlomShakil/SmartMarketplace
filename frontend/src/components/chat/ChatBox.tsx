import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlurCard } from '../ui/BlurCard';
import { MessageBubble, MessageInput, ChatHeader, TypingIndicator, SystemMessage } from './';
import { NegotiationMessage, MessageType, MessageSender } from '../../../../shared/types/Negotiation';
import { cn } from '../../utils/cn';

/**
 * ChatBox Component - Modern chat interface with blurry backgrounds
 * 
 * Features:
 * - Clean modern container with subtle blur
 * - Message bubbles with different styles for participants
 * - Real-time message updates
 * - Typing indicators
 * - Auto-scroll to latest messages
 * - Message actions and status indicators
 * - Responsive design for mobile
 */

interface ChatBoxProps {
  negotiationId: string;
  productId: string;
  productTitle: string;
  productImage?: string;
  productPrice: number;
  sellerName: string;
  sellerAvatar?: string;
  buyerName: string;
  buyerAvatar?: string;
  messages: NegotiationMessage[];
  currentUserRole: 'buyer' | 'seller';
  isTyping?: boolean;
  typingUser?: string;
  onSendMessage: (message: string, type?: MessageType) => void;
  onSendOffer: (amount: number, message?: string) => void;
  className?: string;
  isLoading?: boolean;
  connectionStatus?: 'connected' | 'connecting' | 'disconnected';
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
  messages,
  currentUserRole,
  isTyping = false,
  typingUser,
  onSendMessage,
  onSendOffer,
  className,
  isLoading = false,
  connectionStatus = 'connected'
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [messages, autoScroll]);

  // Handle scroll to detect if user has scrolled up
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setAutoScroll(isNearBottom);
    }
  };

  // Group consecutive messages from the same sender
  const groupedMessages = messages.reduce((groups: NegotiationMessage[][], message, index) => {
    const prevMessage = messages[index - 1];
    const shouldGroup = 
      prevMessage && 
      prevMessage.sender === message.sender && 
      new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() < 5 * 60 * 1000; // 5 minutes

    if (shouldGroup && groups.length > 0) {
      groups[groups.length - 1].push(message);
    } else {
      groups.push([message]);
    }
    return groups;
  }, []);

  return (
    <BlurCard 
      variant="elevated" 
      className={cn(
        'flex flex-col h-full max-h-[700px] lg:max-h-[800px]',
        'border border-white/20 shadow-modern-lg',
        className
      )}
    >
      {/* Chat Header */}
      <ChatHeader
        productTitle={productTitle}
        productImage={productImage}
        productPrice={productPrice}
        sellerName={sellerName}
        sellerAvatar={sellerAvatar}
        buyerName={buyerName}
        buyerAvatar={buyerAvatar}
        connectionStatus={connectionStatus}
      />

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scrollbar-modern"
      >
        <AnimatePresence initial={false}>
          {groupedMessages.map((messageGroup, groupIndex) => (
            <motion.div
              key={`group-${groupIndex}-${messageGroup[0]._id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              {messageGroup.map((message, messageIndex) => (
                <div key={message._id} className="w-full">
                  {message.type === 'system' ? (
                    <SystemMessage message={message} />
                  ) : (
                    <MessageBubble
                      message={message}
                      isOwn={message.sender === currentUserRole}
                      showAvatar={messageIndex === messageGroup.length - 1}
                      showTimestamp={messageIndex === messageGroup.length - 1}
                      senderName={
                        message.sender === 'buyer' ? buyerName :
                        message.sender === 'seller' ? sellerName :
                        'AI Assistant'
                      }
                      senderAvatar={
                        message.sender === 'buyer' ? buyerAvatar :
                        message.sender === 'seller' ? sellerAvatar :
                        undefined
                      }
                      onAction={(action: 'copy' | 'report', messageId: string) => {
                        console.log('Message action:', action, messageId);
                        // Handle message actions (copy, report, etc.)
                      }}
                    />
                  )}
                </div>
              ))}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && typingUser && (
          <TypingIndicator
            userName={typingUser}
            isVisible={isTyping}
          />
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center py-4"
          >
            <div className="flex space-x-1">
              {[0, 1, 2].map((dot) => (
                <motion.div
                  key={dot}
                  className="w-2 h-2 bg-white/60 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: dot * 0.2
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-white/15 p-4">
        <MessageInput
          onSendMessage={onSendMessage}
          onSendOffer={onSendOffer}
          placeholder="Type your message..."
          disabled={isLoading || connectionStatus === 'disconnected'}
          showOfferButton={currentUserRole === 'buyer'}
          maxPrice={productPrice}
        />
      </div>

      {/* Connection Status Indicator */}
      {connectionStatus !== 'connected' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'absolute top-16 left-4 right-4 p-3 rounded-lg text-sm',
            'backdrop-blur-xl border',
            connectionStatus === 'connecting' && 'bg-yellow-500/20 border-yellow-400/30 text-yellow-100',
            connectionStatus === 'disconnected' && 'bg-red-500/20 border-red-400/30 text-red-100'
          )}
        >
          <div className="flex items-center space-x-2">
            <div className={cn(
              'w-2 h-2 rounded-full',
              connectionStatus === 'connecting' && 'bg-yellow-400 animate-pulse',
              connectionStatus === 'disconnected' && 'bg-red-400'
            )} />
            <span>
              {connectionStatus === 'connecting' && 'Reconnecting...'}
              {connectionStatus === 'disconnected' && 'Connection lost. Trying to reconnect...'}
            </span>
          </div>
        </motion.div>
      )}
    </BlurCard>
  );
};

export default ChatBox;
