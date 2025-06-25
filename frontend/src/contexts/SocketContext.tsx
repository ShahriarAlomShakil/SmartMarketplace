import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { socketService } from '../services/socketService';
import { NegotiationMessage } from '../../../shared/types/Negotiation';
import { useAuth } from './AuthContext';
import { messageCache } from '../utils/messageCache';

/**
 * Socket Context - React context for WebSocket state management
 * 
 * Features:
 * - Connection status tracking
 * - Authentication management
 * - Real-time message handling
 * - Typing indicators
 * - User presence tracking
 * - Automatic reconnection
 * - Event subscriptions
 * - Message caching and persistence
 * - Offline message queuing
 * - Connection quality monitoring
 */

interface UserInfo {
  _id: string;
  username: string;
  avatar?: string;
}

interface TypingUser {
  user: UserInfo;
  timestamp: Date;
}

interface MessageDeliveryStatus {
  messageId: string;
  tempId?: string;
  status: 'sending' | 'delivered' | 'failed' | 'read';
  timestamp: Date;
  error?: string;
  retryable?: boolean;
}

interface CacheStats {
  totalMessages: number;
  totalNegotiations: number;
  cacheSize: number;
  pendingMessages: number;
  oldestMessage: Date | null;
  newestMessage: Date | null;
}

interface SocketContextType {
  // Connection state
  isConnected: boolean;
  isAuthenticated: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'reconnecting';
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
  latency: number;
  
  // Current negotiation
  currentNegotiation: string | null;
  activeUsers: UserInfo[];
  onlineCount: number;
  
  // Typing indicators
  typingUsers: TypingUser[];
  
  // Messages
  messages: NegotiationMessage[];
  cachedMessages: NegotiationMessage[];
  pendingMessages: number;
  
  // Message delivery tracking
  messageDeliveryStatuses: MessageDeliveryStatus[];
  
  // Cache management
  cacheStats: CacheStats;
  
  // Methods
  connect: (token?: string) => Promise<void>;
  disconnect: () => void;
  joinNegotiation: (negotiationId: string) => void;
  leaveNegotiation: () => void;
  sendMessage: (content: string, type?: string, offer?: any) => string;
  startTyping: () => void;
  stopTyping: () => void;
  markMessagesRead: (messageIds: string[]) => void;
  
  // Cache methods
  getCachedMessages: (negotiationId: string) => NegotiationMessage[];
  clearCache: () => void;
  exportCache: () => string;
  importCache: (data: string) => boolean;
  refreshCacheStats: () => void;
  
  // Message delivery methods
  getMessageDeliveryStatus: (tempId: string) => MessageDeliveryStatus | null;
  retryFailedMessages: () => void;
  clearDeliveredMessages: () => void;
  
  // Event handlers
  onMessage: (callback: (message: NegotiationMessage) => void) => () => void;
  onUserJoined: (callback: (user: UserInfo) => void) => () => void;
  onUserLeft: (callback: (user: UserInfo) => void) => () => void;
  onTyping: (callback: (user: UserInfo, isTyping: boolean) => void) => () => void;
  onError: (callback: (error: string) => void) => () => void;
  onConnectionQualityChanged: (callback: (quality: string, latency: number) => void) => () => void;
  onMessageDeliveryUpdate: (callback: (status: MessageDeliveryStatus) => void) => () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user } = useAuth();
  
  // Get token from localStorage or user object
  const getToken = useCallback(() => {
    return localStorage.getItem('token') || (user as any)?.token || null;
  }, [user]);
  
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'reconnecting'>('disconnected');
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'offline'>('offline');
  const [latency, setLatency] = useState(0);
  
  // Negotiation state
  const [currentNegotiation, setCurrentNegotiation] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<UserInfo[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  
  // Typing state
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  
  // Messages state
  const [messages, setMessages] = useState<NegotiationMessage[]>([]);
  const [cachedMessages, setCachedMessages] = useState<NegotiationMessage[]>([]);
  const [pendingMessages, setPendingMessages] = useState(0);
  
  // Message delivery state
  const [messageDeliveryStatuses, setMessageDeliveryStatuses] = useState<MessageDeliveryStatus[]>([]);
  
  // Cache state
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    totalMessages: 0,
    totalNegotiations: 0,
    cacheSize: 0,
    pendingMessages: 0,
    oldestMessage: null,
    newestMessage: null
  });

  // Connection management
  const connect = useCallback(async (authToken?: string) => {
    try {
      setConnectionStatus('connecting');
      await socketService.connect(authToken || getToken());
      setIsConnected(true);
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Failed to connect socket:', error);
      setIsConnected(false);
      setConnectionStatus('disconnected');
    }
  }, [getToken]);

  const disconnect = useCallback(() => {
    socketService.disconnect();
    setIsConnected(false);
    setIsAuthenticated(false);
    setConnectionStatus('disconnected');
    setConnectionQuality('offline');
    setCurrentNegotiation(null);
    setActiveUsers([]);
    setOnlineCount(0);
    setTypingUsers([]);
    setLatency(0);
  }, []);

  // Negotiation management
  const joinNegotiation = useCallback((negotiationId: string) => {
    socketService.joinNegotiation(negotiationId);
    setCurrentNegotiation(negotiationId);
    setMessages([]); // Clear messages when joining new negotiation
    
    // Load cached messages
    const cached = messageCache.getCachedMessages(negotiationId);
    setCachedMessages(cached);
    setMessages(cached);
  }, []);

  const leaveNegotiation = useCallback(() => {
    socketService.leaveNegotiation();
    setCurrentNegotiation(null);
    setActiveUsers([]);
    setOnlineCount(0);
    setTypingUsers([]);
    setMessages([]);
    setCachedMessages([]);
  }, []);

  // Message management
  const sendMessage = useCallback((content: string, type: string = 'message', offer?: any) => {
    const tempId = socketService.sendMessage(content, type, offer);
    
    // Update pending message count
    const pendingCount = messageCache.getPendingMessages().length;
    setPendingMessages(pendingCount);
    
    return tempId;
  }, []);

  const markMessagesRead = useCallback((messageIds: string[]) => {
    socketService.markMessagesRead(messageIds);
  }, []);

  // Typing indicators
  const startTyping = useCallback(() => {
    socketService.startTyping();
  }, []);

  const stopTyping = useCallback(() => {
    socketService.stopTyping();
  }, []);

  // Cache management methods
  const getCachedMessages = useCallback((negotiationId: string) => {
    return messageCache.getCachedMessages(negotiationId);
  }, []);

  const clearCache = useCallback(() => {
    messageCache.clearCache();
    refreshCacheStats();
  }, []);

  const exportCache = useCallback(() => {
    return messageCache.exportCache();
  }, []);

  const importCache = useCallback((data: string) => {
    const success = messageCache.importCache(data);
    if (success) {
      refreshCacheStats();
    }
    return success;
  }, []);

  const refreshCacheStats = useCallback(() => {
    const stats = messageCache.getCacheStats();
    setCacheStats(stats);
    
    const pendingCount = messageCache.getPendingMessages().length;
    setPendingMessages(pendingCount);
  }, []);

  // Message delivery methods
  const getMessageDeliveryStatus = useCallback((tempId: string) => {
    return socketService.getMessageDeliveryStatus(tempId);
  }, []);

  const retryFailedMessages = useCallback(() => {
    // Trigger retry for failed messages
    const deliveries = socketService.getPendingDeliveries();
    deliveries.forEach(delivery => {
      if (delivery.status === 'failed' && delivery.retryable) {
        // Re-send the message
        console.log(`🔄 Retrying failed message: ${delivery.tempId}`);
      }
    });
  }, []);

  const clearDeliveredMessages = useCallback(() => {
    socketService.clearDeliveredMessages();
    setMessageDeliveryStatuses(socketService.getPendingDeliveries());
  }, []);

  // Event subscription methods
  const onMessage = useCallback((callback: (message: NegotiationMessage) => void) => {
    socketService.on('new-message', callback);
    return () => socketService.off('new-message', callback);
  }, []);

  const onUserJoined = useCallback((callback: (user: UserInfo) => void) => {
    const handler = (data: { user: UserInfo; timestamp: Date }) => {
      callback(data.user);
    };
    socketService.on('user-joined', handler);
    return () => socketService.off('user-joined', handler);
  }, []);

  const onUserLeft = useCallback((callback: (user: UserInfo) => void) => {
    const handler = (data: { user: UserInfo; timestamp: Date }) => {
      callback(data.user);
    };
    socketService.on('user-left', handler);
    return () => socketService.off('user-left', handler);
  }, []);

  const onTyping = useCallback((callback: (user: UserInfo, isTyping: boolean) => void) => {
    const handler = (data: { user: UserInfo; isTyping: boolean; timestamp: Date }) => {
      callback(data.user, data.isTyping);
    };
    socketService.on('user-typing', handler);
    return () => socketService.off('user-typing', handler);
  }, []);

  const onError = useCallback((callback: (error: string) => void) => {
    const handler = (data: { message: string }) => {
      callback(data.message);
    };
    socketService.on('error', handler);
    return () => socketService.off('error', handler);
  }, []);

  const onConnectionQualityChanged = useCallback((callback: (quality: string, latency: number) => void) => {
    // Monitor connection quality changes
    const interval = setInterval(() => {
      const currentQuality = socketService.quality;
      const currentLatency = socketService.latency;
      
      if (currentQuality !== connectionQuality || Math.abs(currentLatency - latency) > 50) {
        setConnectionQuality(currentQuality);
        setLatency(currentLatency);
        callback(currentQuality, currentLatency);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [connectionQuality, latency]);

  const onMessageDeliveryUpdate = useCallback((callback: (status: MessageDeliveryStatus) => void) => {
    const deliveredHandler = (data: { messageId: string; tempId?: string; timestamp: Date }) => {
      const status = socketService.getMessageDeliveryStatus(data.tempId || data.messageId);
      if (status) {
        callback(status);
      }
    };
    
    const failedHandler = (data: { messageId: string; tempId?: string; error: string; retryable: boolean }) => {
      const status = socketService.getMessageDeliveryStatus(data.tempId || data.messageId);
      if (status) {
        callback(status);
      }
    };
    
    socketService.on('message-delivered', deliveredHandler);
    socketService.on('message-failed', failedHandler);
    
    return () => {
      socketService.off('message-delivered', deliveredHandler);
      socketService.off('message-failed', failedHandler);
    };
  }, []);

  // Effect for socket event listeners
  useEffect(() => {
    // Connection events
    const handleConnect = () => {
      setIsConnected(true);
      setConnectionStatus('connected');
      setConnectionQuality(socketService.quality);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setIsAuthenticated(false);
      setConnectionStatus('disconnected');
      setConnectionQuality('offline');
    };

    const handleReconnect = () => {
      setConnectionStatus('connected');
      setConnectionQuality(socketService.quality);
    };

    const handleConnectError = () => {
      setConnectionStatus('disconnected');
      setConnectionQuality('offline');
    };

    const handleReconnectError = () => {
      setConnectionStatus('reconnecting');
      setConnectionQuality('poor');
    };

    // Authentication events
    const handleAuthenticated = (data: { user: UserInfo }) => {
      setIsAuthenticated(true);
    };

    const handleAuthError = (data: { message: string }) => {
      setIsAuthenticated(false);
      console.error('Socket authentication error:', data.message);
    };

    // Room events
    const handleRoomStatus = (data: { negotiationId: string; activeUsers: UserInfo[]; onlineCount: number }) => {
      setActiveUsers(data.activeUsers);
      setOnlineCount(data.onlineCount);
    };

    const handleUserJoined = (data: { user: UserInfo; timestamp: Date }) => {
      setActiveUsers(prev => {
        const exists = prev.some(u => u._id === data.user._id);
        return exists ? prev : [...prev, data.user];
      });
      setOnlineCount(prev => prev + 1);
    };

    const handleUserLeft = (data: { user: UserInfo; timestamp: Date }) => {
      setActiveUsers(prev => prev.filter(u => u._id !== data.user._id));
      setOnlineCount(prev => Math.max(0, prev - 1));
      
      // Remove from typing users
      setTypingUsers(prev => prev.filter(t => t.user._id !== data.user._id));
    };

    // Message events
    const handleNewMessage = (message: NegotiationMessage) => {
      setMessages(prev => [...prev, message]);
      
      // Update cached messages
      if (currentNegotiation) {
        const cached = messageCache.getCachedMessages(currentNegotiation);
        setCachedMessages([...cached, message]);
      }
    };

    const handleMessageError = (data: { message: string; tempId?: string }) => {
      console.error('Message error:', data.message);
      // Update delivery status
      setMessageDeliveryStatuses(prev => [...prev, {
        messageId: data.tempId || '',
        tempId: data.tempId,
        status: 'failed',
        timestamp: new Date(),
        error: data.message,
        retryable: true
      }]);
    };

    // Typing events
    const handleUserTyping = (data: { user: UserInfo; isTyping: boolean; timestamp: Date }) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(t => t.user._id !== data.user._id);
        
        if (data.isTyping) {
          return [...filtered, { user: data.user, timestamp: data.timestamp }];
        } else {
          return filtered;
        }
      });
    };

    // Message delivery events
    const handleMessageDelivered = (data: { messageId: string; tempId?: string; timestamp: Date }) => {
      setMessageDeliveryStatuses(prev => {
        const updated = prev.map(status => 
          status.tempId === data.tempId 
            ? { ...status, status: 'delivered' as const, messageId: data.messageId, timestamp: new Date(data.timestamp) }
            : status
        );
        
        // Add new status if not found
        if (!updated.some(s => s.tempId === data.tempId)) {
          updated.push({
            messageId: data.messageId,
            tempId: data.tempId,
            status: 'delivered',
            timestamp: new Date(data.timestamp)
          });
        }
        
        return updated;
      });
    };

    const handleMessageFailed = (data: { messageId: string; tempId?: string; error: string; retryable: boolean }) => {
      setMessageDeliveryStatuses(prev => {
        const updated = prev.map(status => 
          status.tempId === data.tempId 
            ? { ...status, status: 'failed' as const, error: data.error, retryable: data.retryable }
            : status
        );
        
        // Add new status if not found
        if (!updated.some(s => s.tempId === data.tempId)) {
          updated.push({
            messageId: data.messageId,
            tempId: data.tempId,
            status: 'failed',
            timestamp: new Date(),
            error: data.error,
            retryable: data.retryable
          });
        }
        
        return updated;
      });
    };

    // Register event listeners
    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    socketService.on('reconnect', handleReconnect);
    socketService.on('connect_error', handleConnectError);
    socketService.on('reconnect_error', handleReconnectError);
    socketService.on('authenticated', handleAuthenticated);
    socketService.on('auth-error', handleAuthError);
    socketService.on('room-status', handleRoomStatus);
    socketService.on('user-joined', handleUserJoined);
    socketService.on('user-left', handleUserLeft);
    socketService.on('new-message', handleNewMessage);
    socketService.on('message-error', handleMessageError);
    socketService.on('user-typing', handleUserTyping);
    socketService.on('message-delivered', handleMessageDelivered);
    socketService.on('message-failed', handleMessageFailed);

    // Cleanup on unmount
    return () => {
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
      socketService.off('reconnect', handleReconnect);
      socketService.off('connect_error', handleConnectError);
      socketService.off('reconnect_error', handleReconnectError);
      socketService.off('authenticated', handleAuthenticated);
      socketService.off('auth-error', handleAuthError);
      socketService.off('room-status', handleRoomStatus);
      socketService.off('user-joined', handleUserJoined);
      socketService.off('user-left', handleUserLeft);
      socketService.off('new-message', handleNewMessage);
      socketService.off('message-error', handleMessageError);
      socketService.off('user-typing', handleUserTyping);
      socketService.off('message-delivered', handleMessageDelivered);
      socketService.off('message-failed', handleMessageFailed);
    };
  }, [currentNegotiation]);

  // Auto-connect when user is authenticated
  useEffect(() => {
    const token = getToken();
    if (user && token && !isConnected) {
      connect(token);
    } else if (!user && isConnected) {
      disconnect();
    }
  }, [user, getToken, isConnected, connect, disconnect]);

  // Clean up typing users (remove stale typing indicators)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => 
        prev.filter(t => now - new Date(t.timestamp).getTime() < 10000) // Remove typing after 10 seconds
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Update cache stats periodically
  useEffect(() => {
    refreshCacheStats();
    
    const interval = setInterval(refreshCacheStats, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [refreshCacheStats]);

  // Update connection quality and latency
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        setConnectionQuality(socketService.quality);
        setLatency(socketService.latency);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isConnected]);

  // Update message delivery statuses
  useEffect(() => {
    const interval = setInterval(() => {
      const deliveries = socketService.getPendingDeliveries();
      setMessageDeliveryStatuses(deliveries);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const contextValue: SocketContextType = {
    // Connection state
    isConnected,
    isAuthenticated,
    connectionStatus,
    connectionQuality,
    latency,
    
    // Current negotiation
    currentNegotiation,
    activeUsers,
    onlineCount,
    
    // Typing indicators
    typingUsers,
    
    // Messages
    messages,
    cachedMessages,
    pendingMessages,
    
    // Message delivery tracking
    messageDeliveryStatuses,
    
    // Cache management
    cacheStats,
    
    // Methods
    connect,
    disconnect,
    joinNegotiation,
    leaveNegotiation,
    sendMessage,
    startTyping,
    stopTyping,
    markMessagesRead,
    
    // Cache methods
    getCachedMessages,
    clearCache,
    exportCache,
    importCache,
    refreshCacheStats,
    
    // Message delivery methods
    getMessageDeliveryStatus,
    retryFailedMessages,
    clearDeliveredMessages,
    
    // Event handlers
    onMessage,
    onUserJoined,
    onUserLeft,
    onTyping,
    onError,
    onConnectionQualityChanged,
    onMessageDeliveryUpdate
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketProvider;
