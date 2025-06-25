import { io, Socket } from 'socket.io-client';
import { NegotiationMessage, TypingIndicator } from '../../../shared/types/Negotiation';
import { messageCache } from '../utils/messageCache';

/**
 * Socket Service - WebSocket client for real-time communication
 * 
 * Features:
 * - Automatic connection management
 * - Authentication with JWT tokens
 * - Room management for negotiations
 * - Message broadcasting
 * - Typing indicators
 * - Connection status tracking
 * - Automatic reconnection
 * - Event emission and listening
 * - Message caching and persistence
 * - Offline message queuing
 * - Delivery confirmation
 */

interface UserInfo {
  _id: string;
  username: string;
  avatar?: string;
}

interface SocketEvents {
  // Authentication events
  'authenticated': (data: { user: UserInfo }) => void;
  'auth-error': (data: { message: string }) => void;
  
  // Room events
  'room-status': (data: { negotiationId: string; activeUsers: UserInfo[]; onlineCount: number }) => void;
  'user-joined': (data: { user: UserInfo; timestamp: Date }) => void;
  'user-left': (data: { user: UserInfo; timestamp: Date }) => void;
  
  // Message events
  'new-message': (message: NegotiationMessage) => void;
  'message-error': (data: { message: string; tempId?: string }) => void;
  'messages-read': (data: { messageIds: string[]; readBy: UserInfo; timestamp: Date }) => void;
  'message-delivered': (data: { messageId: string; tempId?: string; timestamp: Date }) => void;
  'message-failed': (data: { messageId: string; tempId?: string; error: string; retryable: boolean }) => void;
  
  // Typing events
  'user-typing': (data: { user: UserInfo; isTyping: boolean; timestamp: Date }) => void;
  
  // General events
  'error': (data: { message: string }) => void;
  'connect': () => void;
  'disconnect': () => void;
  'connect_error': (error: Error) => void;
  'reconnect': () => void;
  'reconnect_error': (error: Error) => void;
}

interface MessageDeliveryStatus {
  messageId: string;
  tempId?: string;
  status: 'sending' | 'delivered' | 'failed' | 'read';
  timestamp: Date;
  error?: string;
  retryable?: boolean;
}

export class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private isAuthenticated = false;
  private currentNegotiation: string | null = null;
  private eventListeners = new Map<string, Set<Function>>();
  private connectionPromise: Promise<void> | null = null;
  private authToken: string | null = null;
  private messageDeliveryQueue = new Map<string, MessageDeliveryStatus>();
  private pendingMessageRetries = new Map<string, number>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private connectionQuality: 'excellent' | 'good' | 'poor' | 'offline' = 'offline';
  private lastPingTime = 0;
  private avgLatency = 0;

  // Connect to the socket server
  async connect(token?: string): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        
        this.socket = io(serverUrl, {
          transports: ['websocket'],
          autoConnect: true,
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: this.maxReconnectAttempts,
          timeout: 20000,
          forceNew: true
        });

        // Store auth token
        if (token) {
          this.authToken = token;
        }

        // Connection event handlers
        this.socket.on('connect', () => {
          console.log('🔌 Socket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.connectionQuality = 'good';
          this.emit('connect');
          this.startHeartbeat();
          
          // Authenticate if token is available
          if (this.authToken) {
            this.authenticate(this.authToken);
          }

          // Process pending messages after reconnection
          this.processPendingMessages();
          
          resolve();
        });

        this.socket.on('disconnect', () => {
          console.log('🔌 Socket disconnected');
          this.isConnected = false;
          this.isAuthenticated = false;
          this.currentNegotiation = null;
          this.connectionQuality = 'offline';
          this.stopHeartbeat();
          this.emit('disconnect');
        });

        this.socket.on('connect_error', (error) => {
          console.error('🔌 Socket connection error:', error);
          this.connectionQuality = 'offline';
          this.emit('connect_error', error);
          
          if (!this.isConnected) {
            reject(error);
          }
        });

        this.socket.on('reconnect', () => {
          console.log('🔌 Socket reconnected');
          this.connectionQuality = 'good';
          this.emit('reconnect');
          
          // Re-authenticate and rejoin current negotiation
          if (this.authToken) {
            this.authenticate(this.authToken);
          }
          
          if (this.currentNegotiation) {
            setTimeout(() => {
              this.joinNegotiation(this.currentNegotiation!);
            }, 1000);
          }
        });

        this.socket.on('reconnect_error', (error) => {
          console.error('🔌 Socket reconnection error:', error);
          this.connectionQuality = 'poor';
          this.emit('reconnect_error', error);
        });

        // Authentication events
        this.socket.on('authenticated', (data) => {
          console.log('✅ Socket authenticated:', data.user.username);
          this.isAuthenticated = true;
          this.emit('authenticated', data);
        });

        this.socket.on('auth-error', (data) => {
          console.error('❌ Socket authentication error:', data.message);
          this.isAuthenticated = false;
          this.emit('auth-error', data);
        });

        // Enhanced message events
        this.socket.on('room-status', (data) => this.emit('room-status', data));
        this.socket.on('user-joined', (data) => this.emit('user-joined', data));
        this.socket.on('user-left', (data) => this.emit('user-left', data));
        this.socket.on('new-message', (data) => {
          // Cache received message
          if (this.currentNegotiation) {
            messageCache.addMessageToCache(this.currentNegotiation, data);
          }
          this.emit('new-message', data);
        });
        this.socket.on('message-error', (data) => {
          this.handleMessageError(data);
          this.emit('message-error', data);
        });
        this.socket.on('messages-read', (data) => this.emit('messages-read', data));
        this.socket.on('user-typing', (data) => this.emit('user-typing', data));
        this.socket.on('error', (data) => this.emit('error', data));

        // Enhanced delivery confirmation events
        this.socket.on('message-delivered', (data) => {
          this.handleMessageDelivered(data);
          this.emit('message-delivered', data);
        });

        this.socket.on('message-failed', (data) => {
          this.handleMessageFailed(data);
          this.emit('message-failed', data);
        });

        // Ping/pong for connection quality monitoring
        this.socket.on('pong', () => {
          const latency = Date.now() - this.lastPingTime;
          this.updateConnectionQuality(latency);
        });

      } catch (error) {
        console.error('Socket initialization error:', error);
        this.connectionPromise = null;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  // Disconnect from the socket server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.isAuthenticated = false;
    this.currentNegotiation = null;
    this.connectionPromise = null;
    this.connectionQuality = 'offline';
    this.stopHeartbeat();
  }

  // Authenticate with the server
  authenticate(token: string): void {
    if (!this.socket || !this.isConnected) {
      console.warn('Cannot authenticate: Socket not connected');
      return;
    }

    this.authToken = token;
    this.socket.emit('authenticate', token);
  }

  // Join a negotiation room
  joinNegotiation(negotiationId: string): void {
    if (!this.socket || !this.isConnected || !this.isAuthenticated) {
      console.warn('Cannot join negotiation: Socket not ready');
      return;
    }

    this.currentNegotiation = negotiationId;
    this.socket.emit('join-negotiation', negotiationId);
    
    // Load cached messages for this negotiation
    const cachedMessages = messageCache.getCachedMessages(negotiationId);
    if (cachedMessages.length > 0) {
      console.log(`📱 Loaded ${cachedMessages.length} cached messages for negotiation ${negotiationId}`);
    }
  }

  // Leave the current negotiation room
  leaveNegotiation(): void {
    if (!this.socket || !this.currentNegotiation) {
      return;
    }

    this.socket.emit('leave-negotiation', this.currentNegotiation);
    this.currentNegotiation = null;
  }

  // Send a message with enhanced delivery tracking
  sendMessage(content: string, type: string = 'message', offer?: any): string {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    if (!this.socket || !this.isAuthenticated || !this.currentNegotiation) {
      console.warn('Cannot send message: Socket not ready or not in negotiation');
      
      // Queue message for offline sending
      const queuedId = messageCache.queuePendingMessage(this.currentNegotiation || '', content, type, offer);
      console.log(`📤 Message queued for offline sending: ${queuedId}`);
      return queuedId;
    }

    // Track message delivery
    this.messageDeliveryQueue.set(tempId, {
      messageId: '',
      tempId,
      status: 'sending',
      timestamp: new Date()
    });

    this.socket.emit('send-message', {
      content,
      type,
      offer,
      tempId
    });

    return tempId;
  }

  // Start typing indicator
  startTyping(): void {
    if (!this.socket || !this.isAuthenticated || !this.currentNegotiation) {
      return;
    }

    this.socket.emit('typing-start', {
      negotiationId: this.currentNegotiation
    });
  }

  // Stop typing indicator
  stopTyping(): void {
    if (!this.socket || !this.isAuthenticated || !this.currentNegotiation) {
      return;
    }

    this.socket.emit('typing-stop', {
      negotiationId: this.currentNegotiation
    });
  }

  // Mark messages as read
  markMessagesRead(messageIds: string[]): void {
    if (!this.socket || !this.isAuthenticated || !this.currentNegotiation) {
      return;
    }

    this.socket.emit('mark-messages-read', {
      messageIds
    });
  }

  // Process pending messages after reconnection
  private processPendingMessages(): void {
    if (!this.currentNegotiation) return;

    const pendingMessages = messageCache.getPendingMessagesForNegotiation(this.currentNegotiation);
    
    if (pendingMessages.length === 0) return;

    console.log(`📤 Processing ${pendingMessages.length} pending messages`);

    pendingMessages.forEach(pendingMsg => {
      // Check retry count
      const retryCount = this.pendingMessageRetries.get(pendingMsg.id) || 0;
      
      if (retryCount >= 3) {
        console.warn(`❌ Message ${pendingMsg.id} exceeded retry limit, removing`);
        messageCache.removePendingMessage(pendingMsg.id);
        this.pendingMessageRetries.delete(pendingMsg.id);
        return;
      }

      // Retry sending
      this.pendingMessageRetries.set(pendingMsg.id, retryCount + 1);
      
      setTimeout(() => {
        this.sendMessage(pendingMsg.content, pendingMsg.type, pendingMsg.offer);
        
        // Remove from pending queue on successful send
        messageCache.removePendingMessage(pendingMsg.id);
        this.pendingMessageRetries.delete(pendingMsg.id);
      }, retryCount * 1000); // Exponential backoff
    });
  }

  // Handle message delivery confirmation
  private handleMessageDelivered(data: { messageId: string; tempId?: string; timestamp: Date }): void {
    if (data.tempId && this.messageDeliveryQueue.has(data.tempId)) {
      const delivery = this.messageDeliveryQueue.get(data.tempId)!;
      delivery.status = 'delivered';
      delivery.messageId = data.messageId;
      delivery.timestamp = new Date(data.timestamp);
      
      console.log(`✅ Message delivered: ${data.messageId}`);
    }
  }

  // Handle message failure
  private handleMessageFailed(data: { messageId: string; tempId?: string; error: string; retryable: boolean }): void {
    if (data.tempId && this.messageDeliveryQueue.has(data.tempId)) {
      const delivery = this.messageDeliveryQueue.get(data.tempId)!;
      delivery.status = 'failed';
      delivery.error = data.error;
      delivery.retryable = data.retryable;
      
      console.error(`❌ Message failed: ${data.error}`);
      
      // Retry if retryable
      if (data.retryable && this.currentNegotiation) {
        messageCache.queuePendingMessage(this.currentNegotiation, '', 'retry');
      }
    }
  }

  // Handle message error
  private handleMessageError(data: { message: string; tempId?: string }): void {
    if (data.tempId && this.messageDeliveryQueue.has(data.tempId)) {
      const delivery = this.messageDeliveryQueue.get(data.tempId)!;
      delivery.status = 'failed';
      delivery.error = data.message;
      delivery.retryable = true;
    }
  }

  // Start heartbeat for connection quality monitoring
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.isConnected) {
        this.lastPingTime = Date.now();
        this.socket.emit('ping');
      }
    }, 30000); // Every 30 seconds
  }

  // Stop heartbeat
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Update connection quality based on latency
  private updateConnectionQuality(latency: number): void {
    // Update average latency
    this.avgLatency = this.avgLatency === 0 ? latency : (this.avgLatency + latency) / 2;
    
    if (latency < 100) {
      this.connectionQuality = 'excellent';
    } else if (latency < 300) {
      this.connectionQuality = 'good';
    } else {
      this.connectionQuality = 'poor';
    }
  }

  // Event listener management
  on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emit<K extends keyof SocketEvents>(event: K, ...args: Parameters<SocketEvents[K]>): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          (callback as any)(...args);
        } catch (error) {
          console.error(`Error in socket event listener for ${event}:`, error);
        }
      });
    }
  }

  // Getters
  get connected(): boolean {
    return this.isConnected;
  }

  get authenticated(): boolean {
    return this.isAuthenticated;
  }

  get inNegotiation(): boolean {
    return this.currentNegotiation !== null;
  }

  get negotiationId(): string | null {
    return this.currentNegotiation;
  }

  get quality(): 'excellent' | 'good' | 'poor' | 'offline' {
    return this.connectionQuality;
  }

  get latency(): number {
    return this.avgLatency;
  }

  // Get message delivery status
  getMessageDeliveryStatus(tempId: string): MessageDeliveryStatus | null {
    return this.messageDeliveryQueue.get(tempId) || null;
  }

  // Get all pending message delivery statuses
  getPendingDeliveries(): MessageDeliveryStatus[] {
    return Array.from(this.messageDeliveryQueue.values());
  }

  // Clear delivery tracking for delivered messages
  clearDeliveredMessages(): void {
    const entriesToDelete: string[] = [];
    this.messageDeliveryQueue.forEach((delivery, tempId) => {
      if (delivery.status === 'delivered' || delivery.status === 'read') {
        entriesToDelete.push(tempId);
      }
    });
    entriesToDelete.forEach(tempId => this.messageDeliveryQueue.delete(tempId));
  }
}

// Create singleton instance
export const socketService = new SocketService();

export default socketService;
