import { NegotiationMessage } from '../../../shared/types/Negotiation';

/**
 * Message Cache Utility - Local storage for chat messages
 * 
 * Features:
 * - Message persistence across browser sessions
 * - Automatic cache cleanup
 * - Message queuing for offline scenarios
 * - Performance optimization with indexed storage
 * - Cache size management
 */

interface CachedNegotiation {
  negotiationId: string;
  messages: NegotiationMessage[];
  lastUpdated: Date;
  messageCount: number;
}

interface PendingMessage {
  id: string;
  negotiationId: string;
  content: string;
  type: string;
  offer?: any;
  timestamp: Date;
  retryCount: number;
}

interface CacheStats {
  totalMessages: number;
  totalNegotiations: number;
  cacheSize: number;
  pendingMessages: number;
  oldestMessage: Date | null;
  newestMessage: Date | null;
}

class MessageCacheManager {
  private static instance: MessageCacheManager;
  private readonly CACHE_PREFIX = 'chat_cache_';
  private readonly PENDING_PREFIX = 'pending_msg_';
  private readonly CACHE_STATS_KEY = 'cache_stats';
  private readonly MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly MAX_MESSAGES_PER_NEGOTIATION = 1000;
  private readonly CACHE_EXPIRY_DAYS = 30;
  private readonly MAX_RETRY_COUNT = 3;

  private constructor() {
    this.initializeCache();
  }

  static getInstance(): MessageCacheManager {
    if (!MessageCacheManager.instance) {
      MessageCacheManager.instance = new MessageCacheManager();
    }
    return MessageCacheManager.instance;
  }

  // Initialize cache and perform cleanup
  private initializeCache(): void {
    try {
      this.cleanupExpiredMessages();
      this.optimizeCacheSize();
    } catch (error) {
      console.warn('Cache initialization failed:', error);
    }
  }

  // Store messages for a negotiation
  cacheMessages(negotiationId: string, messages: NegotiationMessage[]): void {
    try {
      const cached: CachedNegotiation = {
        negotiationId,
        messages: messages.slice(-this.MAX_MESSAGES_PER_NEGOTIATION), // Keep only recent messages
        lastUpdated: new Date(),
        messageCount: messages.length
      };

      const key = this.CACHE_PREFIX + negotiationId;
      localStorage.setItem(key, JSON.stringify(cached));
      this.updateCacheStats();
    } catch (error) {
      console.warn('Failed to cache messages:', error);
      this.handleStorageQuotaExceeded();
    }
  }

  // Retrieve cached messages
  getCachedMessages(negotiationId: string): NegotiationMessage[] {
    try {
      const key = this.CACHE_PREFIX + negotiationId;
      const cached = localStorage.getItem(key);
      
      if (!cached) return [];

      const parsedCache: CachedNegotiation = JSON.parse(cached);
      
      // Check if cache is expired
      const cacheAge = Date.now() - new Date(parsedCache.lastUpdated).getTime();
      const maxAge = this.CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      
      if (cacheAge > maxAge) {
        this.removeCachedMessages(negotiationId);
        return [];
      }

      return parsedCache.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    } catch (error) {
      console.warn('Failed to retrieve cached messages:', error);
      return [];
    }
  }

  // Add new message to cache
  addMessageToCache(negotiationId: string, message: NegotiationMessage): void {
    const cachedMessages = this.getCachedMessages(negotiationId);
    const updatedMessages = [...cachedMessages, message];
    this.cacheMessages(negotiationId, updatedMessages);
  }

  // Update existing message in cache
  updateMessageInCache(negotiationId: string, messageId: string, updates: Partial<NegotiationMessage>): void {
    const cachedMessages = this.getCachedMessages(negotiationId);
    const updatedMessages = cachedMessages.map(msg => 
      msg._id === messageId ? { ...msg, ...updates } : msg
    );
    this.cacheMessages(negotiationId, updatedMessages);
  }

  // Remove cached messages for a negotiation
  removeCachedMessages(negotiationId: string): void {
    try {
      const key = this.CACHE_PREFIX + negotiationId;
      localStorage.removeItem(key);
      this.updateCacheStats();
    } catch (error) {
      console.warn('Failed to remove cached messages:', error);
    }
  }

  // Queue message for offline sending
  queuePendingMessage(negotiationId: string, content: string, type: string = 'message', offer?: any): string {
    try {
      const messageId = `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const pendingMessage: PendingMessage = {
        id: messageId,
        negotiationId,
        content,
        type,
        offer,
        timestamp: new Date(),
        retryCount: 0
      };

      const key = this.PENDING_PREFIX + messageId;
      localStorage.setItem(key, JSON.stringify(pendingMessage));
      return messageId;
    } catch (error) {
      console.warn('Failed to queue pending message:', error);
      return '';
    }
  }

  // Get all pending messages
  getPendingMessages(): PendingMessage[] {
    try {
      const pendingMessages: PendingMessage[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.PENDING_PREFIX)) {
          const messageData = localStorage.getItem(key);
          if (messageData) {
            const message: PendingMessage = JSON.parse(messageData);
            message.timestamp = new Date(message.timestamp);
            pendingMessages.push(message);
          }
        }
      }

      return pendingMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    } catch (error) {
      console.warn('Failed to get pending messages:', error);
      return [];
    }
  }

  // Get pending messages for specific negotiation
  getPendingMessagesForNegotiation(negotiationId: string): PendingMessage[] {
    return this.getPendingMessages().filter(msg => msg.negotiationId === negotiationId);
  }

  // Remove pending message after successful send
  removePendingMessage(messageId: string): void {
    try {
      const key = this.PENDING_PREFIX + messageId;
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove pending message:', error);
    }
  }

  // Increment retry count for pending message
  incrementRetryCount(messageId: string): boolean {
    try {
      const key = this.PENDING_PREFIX + messageId;
      const messageData = localStorage.getItem(key);
      
      if (!messageData) return false;

      const message: PendingMessage = JSON.parse(messageData);
      message.retryCount++;

      if (message.retryCount > this.MAX_RETRY_COUNT) {
        this.removePendingMessage(messageId);
        return false;
      }

      localStorage.setItem(key, JSON.stringify(message));
      return true;
    } catch (error) {
      console.warn('Failed to increment retry count:', error);
      return false;
    }
  }

  // Get cache statistics
  getCacheStats(): CacheStats {
    try {
      let totalMessages = 0;
      let totalNegotiations = 0;
      let cacheSize = 0;
      let pendingMessages = 0;
      let oldestMessage: Date | null = null;
      let newestMessage: Date | null = null;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;

        const value = localStorage.getItem(key);
        if (!value) continue;

        cacheSize += new Blob([value]).size;

        if (key.startsWith(this.CACHE_PREFIX)) {
          totalNegotiations++;
          const cached: CachedNegotiation = JSON.parse(value);
          totalMessages += cached.messageCount;

          const lastUpdated = new Date(cached.lastUpdated);
          if (!oldestMessage || lastUpdated < oldestMessage) {
            oldestMessage = lastUpdated;
          }
          if (!newestMessage || lastUpdated > newestMessage) {
            newestMessage = lastUpdated;
          }
        } else if (key.startsWith(this.PENDING_PREFIX)) {
          pendingMessages++;
        }
      }

      return {
        totalMessages,
        totalNegotiations,
        cacheSize,
        pendingMessages,
        oldestMessage,
        newestMessage
      };
    } catch (error) {
      console.warn('Failed to get cache stats:', error);
      return {
        totalMessages: 0,
        totalNegotiations: 0,
        cacheSize: 0,
        pendingMessages: 0,
        oldestMessage: null,
        newestMessage: null
      };
    }
  }

  // Update cache statistics
  private updateCacheStats(): void {
    try {
      const stats = this.getCacheStats();
      localStorage.setItem(this.CACHE_STATS_KEY, JSON.stringify({
        ...stats,
        lastUpdated: new Date()
      }));
    } catch (error) {
      console.warn('Failed to update cache stats:', error);
    }
  }

  // Clean up expired messages
  private cleanupExpiredMessages(): void {
    try {
      const now = Date.now();
      const maxAge = this.CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(this.CACHE_PREFIX)) continue;

        const cached = localStorage.getItem(key);
        if (!cached) continue;

        const parsedCache: CachedNegotiation = JSON.parse(cached);
        const cacheAge = now - new Date(parsedCache.lastUpdated).getTime();

        if (cacheAge > maxAge) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      if (keysToRemove.length > 0) {
        console.log(`🧹 Cleaned up ${keysToRemove.length} expired cache entries`);
      }
    } catch (error) {
      console.warn('Failed to cleanup expired messages:', error);
    }
  }

  // Optimize cache size if it exceeds limit
  private optimizeCacheSize(): void {
    try {
      const stats = this.getCacheStats();
      
      if (stats.cacheSize > this.MAX_CACHE_SIZE) {
        console.log('🗃️ Cache size exceeded limit, optimizing...');
        
        // Get all cached negotiations with timestamps
        const cacheEntries: { key: string; lastUpdated: Date }[] = [];
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key || !key.startsWith(this.CACHE_PREFIX)) continue;

          const cached = localStorage.getItem(key);
          if (!cached) continue;

          const parsedCache: CachedNegotiation = JSON.parse(cached);
          cacheEntries.push({
            key,
            lastUpdated: new Date(parsedCache.lastUpdated)
          });
        }

        // Sort by last updated (oldest first)
        cacheEntries.sort((a, b) => a.lastUpdated.getTime() - b.lastUpdated.getTime());

        // Remove oldest 30% of entries
        const entriesToRemove = Math.ceil(cacheEntries.length * 0.3);
        for (let i = 0; i < entriesToRemove; i++) {
          localStorage.removeItem(cacheEntries[i].key);
        }

        console.log(`🗃️ Removed ${entriesToRemove} old cache entries`);
      }
    } catch (error) {
      console.warn('Failed to optimize cache size:', error);
    }
  }

  // Handle storage quota exceeded
  private handleStorageQuotaExceeded(): void {
    try {
      console.warn('⚠️ Storage quota exceeded, performing emergency cleanup');
      
      // Remove oldest 50% of cache entries
      const cacheEntries: { key: string; lastUpdated: Date }[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(this.CACHE_PREFIX)) continue;

        const cached = localStorage.getItem(key);
        if (!cached) continue;

        const parsedCache: CachedNegotiation = JSON.parse(cached);
        cacheEntries.push({
          key,
          lastUpdated: new Date(parsedCache.lastUpdated)
        });
      }

      cacheEntries.sort((a, b) => a.lastUpdated.getTime() - b.lastUpdated.getTime());
      const entriesToRemove = Math.ceil(cacheEntries.length * 0.5);
      
      for (let i = 0; i < entriesToRemove; i++) {
        localStorage.removeItem(cacheEntries[i].key);
      }

      console.log(`🚨 Emergency cleanup: removed ${entriesToRemove} cache entries`);
    } catch (error) {
      console.error('Emergency cleanup failed:', error);
    }
  }

  // Clear all cache
  clearCache(): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith(this.CACHE_PREFIX) || key.startsWith(this.PENDING_PREFIX))) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
      localStorage.removeItem(this.CACHE_STATS_KEY);
      
      console.log(`🧹 Cleared ${keysToRemove.length} cache entries`);
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  // Export cache data for backup
  exportCache(): string {
    try {
      const cacheData: any = {};
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith(this.CACHE_PREFIX) || key.startsWith(this.PENDING_PREFIX))) {
          cacheData[key] = localStorage.getItem(key);
        }
      }

      return JSON.stringify({
        exportDate: new Date().toISOString(),
        version: '1.0',
        data: cacheData
      });
    } catch (error) {
      console.warn('Failed to export cache:', error);
      return '{}';
    }
  }

  // Import cache data from backup
  importCache(cacheDataString: string): boolean {
    try {
      const imported = JSON.parse(cacheDataString);
      
      if (!imported.data || !imported.version) {
        throw new Error('Invalid cache data format');
      }

      Object.entries(imported.data).forEach(([key, value]) => {
        if (typeof value === 'string') {
          localStorage.setItem(key, value);
        }
      });

      this.updateCacheStats();
      console.log('✅ Cache data imported successfully');
      return true;
    } catch (error) {
      console.warn('Failed to import cache:', error);
      return false;
    }
  }
}

// Export singleton instance
export const messageCache = MessageCacheManager.getInstance();
export default messageCache;
