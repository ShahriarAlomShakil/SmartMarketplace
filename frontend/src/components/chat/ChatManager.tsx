import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlurCard } from '../ui/BlurCard';
import { ModernButton } from '../ui/ModernButton';
import { ChatBox, ConnectionQuality, MessageDeliveryList } from './';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { NegotiationMessage, MessageType, MessageSender } from '../../../../shared/types/Negotiation';
import { cn } from '../../utils/cn';
import {
  Cog6ToothIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

/**
 * ChatManager Component - Enhanced chat management with Day 14 features
 * 
 * Features:
 * - Integrated chat interface with real-time updates
 * - Connection quality monitoring
 * - Message delivery tracking
 * - Cache management
 * - Offline message queuing
 * - Performance monitoring
 * - Export/import functionality
 * - Advanced debugging tools
 */

interface ChatManagerProps {
  negotiationId: string;
  productId: string;
  productTitle: string;
  productImage?: string;
  productPrice: number;
  sellerName: string;
  sellerAvatar?: string;
  buyerName: string;
  buyerAvatar?: string;
  currentUserRole: 'buyer' | 'seller';
  onSendMessage?: (message: string, type?: MessageType) => void;
  onSendOffer?: (amount: number, message?: string) => void;
  className?: string;
  showAdvancedFeatures?: boolean;
}

export const ChatManager: React.FC<ChatManagerProps> = ({
  negotiationId,
  productId,
  productTitle,
  productImage,
  productPrice,
  sellerName,
  sellerAvatar,
  buyerName,
  buyerAvatar,
  currentUserRole,
  onSendMessage,
  onSendOffer,
  className,
  showAdvancedFeatures = false
}) => {
  const { user } = useAuth();
  const {
    isConnected,
    isAuthenticated,
    connectionStatus,
    connectionQuality,
    latency,
    messages,
    cachedMessages,
    pendingMessages,
    messageDeliveryStatuses,
    cacheStats,
    activeUsers,
    onlineCount,
    typingUsers,
    connect,
    joinNegotiation,
    leaveNegotiation,
    sendMessage,
    startTyping,
    stopTyping,
    markMessagesRead,
    getCachedMessages,
    clearCache,
    exportCache,
    importCache,
    refreshCacheStats,
    retryFailedMessages,
    clearDeliveredMessages
  } = useSocket();

  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Join negotiation on mount
  useEffect(() => {
    if (isAuthenticated && negotiationId) {
      joinNegotiation(negotiationId);
    }

    return () => {
      leaveNegotiation();
    };
  }, [negotiationId, isAuthenticated, joinNegotiation, leaveNegotiation]);

  // Auto-connect if not connected
  useEffect(() => {
    if (!isConnected && user) {
      connect();
    }
  }, [isConnected, user, connect]);

  // Handle message sending
  const handleSendMessage = useCallback((content: string, type: MessageType = MessageType.MESSAGE) => {
    const tempId = sendMessage(content, type);
    
    if (onSendMessage) {
      onSendMessage(content, type);
    }
    
    console.log(`📤 Message sent with temp ID: ${tempId}`);
  }, [sendMessage, onSendMessage]);

  // Handle offer sending
  const handleSendOffer = useCallback((amount: number, message?: string) => {
    const content = message || `I'd like to offer $${amount}`;
    const tempId = sendMessage(content, MessageType.OFFER, { amount, currency: 'USD' });
    
    if (onSendOffer) {
      onSendOffer(amount, message);
    }
    
    console.log(`💰 Offer sent with temp ID: ${tempId}`);
  }, [sendMessage, onSendOffer]);

  // Handle typing indicators
  const handleTypingStart = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      startTyping();
    }

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout to stop typing
    const timeout = setTimeout(() => {
      setIsTyping(false);
      stopTyping();
    }, 3000);

    setTypingTimeout(timeout);
  }, [isTyping, typingTimeout, startTyping, stopTyping]);

  const handleTypingStop = useCallback(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    setIsTyping(false);
    stopTyping();
  }, [typingTimeout, stopTyping]);

  // Export cache data
  const handleExportCache = useCallback(() => {
    try {
      const cacheData = exportCache();
      const blob = new Blob([cacheData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-cache-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export cache:', error);
    }
  }, [exportCache]);

  // Import cache data
  const handleImportCache = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = e.target?.result as string;
            const success = importCache(data);
            console.log(success ? '✅ Cache imported successfully' : '❌ Cache import failed');
          } catch (error) {
            console.error('Failed to import cache:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [importCache]);

  // Get current typing users for this negotiation
  const currentTypingUsers = typingUsers.filter(t => 
    t.user._id !== user?._id
  );

  // Check if there are any issues that need attention
  const hasIssues = !isConnected || connectionQuality === 'poor' || pendingMessages > 0 || 
                   messageDeliveryStatuses.some(s => s.status === 'failed');

  return (
    <div className={cn('space-y-4', className)}>
      {/* Connection Status Bar */}
      <ConnectionQuality
        isConnected={isConnected}
        connectionStatus={connectionStatus}
        quality={connectionQuality}
        latency={latency}
        pendingMessages={pendingMessages}
        onRetry={() => connect()}
        compact={!showAdvancedFeatures}
        showDetails={showAdvancedFeatures}
      />

      {/* Issues Alert */}
      {hasIssues && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-3 p-3 rounded-lg bg-yellow-500/20 border border-yellow-400/30"
        >
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-yellow-100">
              {!isConnected && 'Connection lost. '}
              {connectionQuality === 'poor' && 'Poor connection quality. '}
              {pendingMessages > 0 && `${pendingMessages} messages pending. `}
              {messageDeliveryStatuses.some(s => s.status === 'failed') && 'Some messages failed to send. '}
            </p>
          </div>
          <ModernButton
            variant="outline"
            size="sm"
            onClick={retryFailedMessages}
            className="border-yellow-400/30 text-yellow-400 hover:bg-yellow-500/20"
          >
            Retry
          </ModernButton>
        </motion.div>
      )}

      {/* Main Chat Interface */}
      <ChatBox
        negotiationId={negotiationId}
        productId={productId}
        productTitle={productTitle}
        productImage={productImage}
        productPrice={productPrice}
        sellerName={sellerName}
        sellerAvatar={sellerAvatar}
        buyerName={buyerName}
        buyerAvatar={buyerAvatar}
        messages={messages}
        currentUserRole={currentUserRole}
        isTyping={currentTypingUsers.length > 0}
        typingUser={currentTypingUsers[0]?.user.username}
        onSendMessage={handleSendMessage}
        onSendOffer={handleSendOffer}
        connectionStatus={connectionStatus === 'reconnecting' ? 'connecting' : connectionStatus}
        isLoading={!isAuthenticated}
      />

      {/* Advanced Features Panel */}
      {showAdvancedFeatures && (
        <BlurCard variant="elevated" className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Chat Management</h3>
            <div className="flex space-x-2">
              <ModernButton
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Cog6ToothIcon className="w-4 h-4 mr-2" />
                Settings
              </ModernButton>
              <ModernButton
                variant="outline"
                size="sm"
                onClick={() => setShowAnalytics(!showAnalytics)}
              >
                <ChartBarIcon className="w-4 h-4 mr-2" />
                Analytics
              </ModernButton>
            </div>
          </div>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 pt-3 border-t border-white/10"
              >
                <h4 className="font-medium text-white/90">Cache Management</h4>
                <div className="grid grid-cols-2 gap-3">
                  <ModernButton
                    variant="outline"
                    size="sm"
                    onClick={handleExportCache}
                    className="text-sm"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                    Export Cache
                  </ModernButton>
                  <ModernButton
                    variant="outline"
                    size="sm"
                    onClick={handleImportCache}
                    className="text-sm"
                  >
                    <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                    Import Cache
                  </ModernButton>
                  <ModernButton
                    variant="outline"
                    size="sm"
                    onClick={refreshCacheStats}
                    className="text-sm"
                  >
                    Refresh Stats
                  </ModernButton>
                  <ModernButton
                    variant="outline"
                    size="sm"
                    onClick={clearCache}
                    className="text-sm text-red-400 border-red-400/30 hover:bg-red-500/20"
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Clear Cache
                  </ModernButton>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-white/70">Cached Messages:</span>
                    <span className="ml-2 font-mono text-white">{cacheStats.totalMessages}</span>
                  </div>
                  <div>
                    <span className="text-white/70">Cache Size:</span>
                    <span className="ml-2 font-mono text-white">
                      {(cacheStats.cacheSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Analytics Panel */}
          <AnimatePresence>
            {showAnalytics && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 pt-3 border-t border-white/10"
              >
                <h4 className="font-medium text-white/90">Performance Analytics</h4>
                
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="text-center p-3 rounded-lg bg-white/5">
                    <div className="text-lg font-mono text-white">{latency}ms</div>
                    <div className="text-white/70">Latency</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-white/5">
                    <div className="text-lg font-mono text-white">{onlineCount}</div>
                    <div className="text-white/70">Online</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-white/5">
                    <div className="text-lg font-mono text-white">{messages.length}</div>
                    <div className="text-white/70">Messages</div>
                  </div>
                </div>

                {/* Message Delivery Status */}
                {messageDeliveryStatuses.length > 0 && (
                  <MessageDeliveryList
                    deliveryStatuses={messageDeliveryStatuses}
                    onRetry={(messageId) => {
                      console.log(`🔄 Retrying message: ${messageId}`);
                      retryFailedMessages();
                    }}
                    maxItems={3}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </BlurCard>
      )}
    </div>
  );
};

export default ChatManager;
