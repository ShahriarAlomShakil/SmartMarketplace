/**
 * Advanced Conversation Management Hook for Day 16 - Smart Marketplace
 * 
 * Enhanced React hook for advanced conversation management features
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { conversationAPI } from '../utils/api';

interface ConversationState {
  negotiationId: string;
  status: string;
  currentRound: number;
  maxRounds: number;
  lastMessage: any;
  participants: {
    buyer: {
      id: string;
      username: string;
      isActive: boolean;
      lastSeen: Date | null;
      isTyping: boolean;
    };
    seller: {
      id: string;
      username: string;
      isActive: boolean;
      lastSeen: Date | null;
      isTyping: boolean;
    };
  };
  context: {
    productTitle: string;
    currentOffer: number;
    priceRange: {
      min: number;
      max: number;
    };
  };
  branching: {
    activeBranch: string;
    availableBranches: string[];
    branchHistory: any[];
  };
  timestamp: Date;
  lastActivity: Date;
}

interface MessageHistoryOptions {
  limit?: number;
  offset?: number;
  sender?: 'buyer' | 'seller' | 'ai' | 'system';
  messageType?: 'text' | 'offer' | 'counter_offer' | 'acceptance' | 'rejection' | 'system';
  dateRange?: {
    start: Date;
    end: Date;
  };
  branch?: string;
  includeContext?: boolean;
}

interface ConversationAnalytics {
  messageStats: {
    total: number;
    byType: Record<string, number>;
    bySender: Record<string, number>;
    averageLength: number;
    responseTimesMs: number[];
  };
  conversationFlow: {
    rounds: number;
    maxRounds: number;
    progress: number;
    priceMovement: any;
    negotiationMomentum: number;
  };
  participantBehavior: Record<string, any>;
  sentiment: any;
  successIndicators: {
    engagementLevel: number;
    progressTowardsDeal: number;
    cooperationScore: number;
    riskFactors: string[];
  };
}

interface UseConversationManagerReturn {
  // State management
  conversationState: ConversationState | null;
  isLoading: boolean;
  error: string | null;
  
  // Message management
  messageHistory: any[];
  totalMessages: number;
  hasMoreMessages: boolean;
  
  // Advanced features
  analytics: ConversationAnalytics | null;
  insights: any;
  availableBranches: string[];
  activeBranch: string;
  
  // Actions
  loadConversationState: () => Promise<void>;
  updateConversationState: (updates: Partial<ConversationState>) => Promise<void>;
  loadMessageHistory: (options?: MessageHistoryOptions) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  storeMessage: (messageData: any, context?: any) => Promise<void>;
  
  // Branching
  createBranch: (branchName: string, branchType?: string, parentBranch?: string) => Promise<void>;
  switchBranch: (branchName: string) => Promise<void>;
  
  // Context switching
  switchContext: (toNegotiationId: string) => Promise<void>;
  resumeConversation: (resumptionData?: any) => Promise<void>;
  
  // Round management
  manageRounds: (action: string, context?: any) => Promise<void>;
  
  // Analytics
  loadAnalytics: (timeframe?: string, types?: string[]) => Promise<void>;
  generateReport: (reportType: string, options?: any) => Promise<any>;
  exportConversation: (format?: string, options?: any) => Promise<void>;
  shareConversation: (shareOptions: any) => Promise<any>;
  
  // Performance
  getPerformanceMetrics: () => Promise<any>;
  compareConversations: (negotiationIds: string[]) => Promise<any>;
  
  // Utilities
  refreshData: () => Promise<void>;
  clearCache: () => void;
}

export const useConversationManager = (
  negotiationId: string,
  options: {
    autoLoad?: boolean;
    realTimeUpdates?: boolean;
    analyticsEnabled?: boolean;
    cacheEnabled?: boolean;
  } = {}
): UseConversationManagerReturn => {
  const {
    autoLoad = true,
    realTimeUpdates = true,
    analyticsEnabled = true,
    cacheEnabled = true
  } = options;

  // Core state
  const [conversationState, setConversationState] = useState<ConversationState | null>(null);
  const [messageHistory, setMessageHistory] = useState<any[]>([]);
  const [totalMessages, setTotalMessages] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [analytics, setAnalytics] = useState<ConversationAnalytics | null>(null);
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived state
  const availableBranches = conversationState?.branching?.availableBranches || ['main'];
  const activeBranch = conversationState?.branching?.activeBranch || 'main';

  // Refs for managing state
  const messageHistoryOptions = useRef<MessageHistoryOptions>({
    limit: 50,
    offset: 0,
    branch: 'main'
  });
  const cache = useRef(new Map());
  const lastLoadTime = useRef<Date | null>(null);

  // Socket integration
  const { socket, isConnected } = useSocket();

  // Load conversation state
  const loadConversationState = useCallback(async () => {
    if (!negotiationId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Check cache first
      if (cacheEnabled) {
        const cached = cache.current.get(`state:${negotiationId}`);
        if (cached && Date.now() - cached.timestamp < 30000) { // 30 second cache
          setConversationState(cached.data);
          return;
        }
      }

      const response = await conversationAPI.getConversationState(negotiationId);
      
      if (response.success) {
        setConversationState(response.data.state);
        
        // Cache the result
        if (cacheEnabled) {
          cache.current.set(`state:${negotiationId}`, {
            data: response.data.state,
            timestamp: Date.now()
          });
        }
      } else {
        setError(response.message || 'Failed to load conversation state');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load conversation state');
      console.error('Error loading conversation state:', err);
    } finally {
      setIsLoading(false);
    }
  }, [negotiationId, cacheEnabled]);

  // Update conversation state
  const updateConversationState = useCallback(async (updates: Partial<ConversationState>) => {
    if (!negotiationId) return;

    try {
      setError(null);

      const response = await conversationAPI.updateConversationState(negotiationId, {
        state: {
          ...conversationState,
          ...updates,
          lastUpdatedAt: new Date()
        }
      });

      if (response.success) {
        setConversationState(response.data);
        
        // Clear cache
        if (cacheEnabled) {
          cache.current.delete(`state:${negotiationId}`);
        }
      } else {
        setError(response.message || 'Failed to update conversation state');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update conversation state');
      console.error('Error updating conversation state:', err);
    }
  }, [negotiationId, conversationState, cacheEnabled]);

  // Load message history
  const loadMessageHistory = useCallback(async (options: MessageHistoryOptions = {}) => {
    if (!negotiationId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Merge with existing options
      const queryOptions = {
        ...messageHistoryOptions.current,
        ...options
      };

      // Check cache
      const cacheKey = `messages:${negotiationId}:${JSON.stringify(queryOptions)}`;
      if (cacheEnabled) {
        const cached = cache.current.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < 60000) { // 1 minute cache
          setMessageHistory(cached.data.messages);
          setTotalMessages(cached.data.total);
          setHasMoreMessages(cached.data.hasMore);
          return;
        }
      }

      const response = await conversationAPI.getMessageHistory(negotiationId, queryOptions);

      if (response.success) {
        const { messages, total, hasMore } = response.data;
        
        if (queryOptions.offset === 0) {
          setMessageHistory(messages);
        } else {
          setMessageHistory(prev => [...prev, ...messages]);
        }
        
        setTotalMessages(total);
        setHasMoreMessages(hasMore);

        // Cache the result
        if (cacheEnabled) {
          cache.current.set(cacheKey, {
            data: response.data,
            timestamp: Date.now()
          });
        }

        // Update options for next load
        messageHistoryOptions.current = queryOptions;
      } else {
        setError(response.message || 'Failed to load message history');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load message history');
      console.error('Error loading message history:', err);
    } finally {
      setIsLoading(false);
    }
  }, [negotiationId, cacheEnabled]);

  // Load more messages
  const loadMoreMessages = useCallback(async () => {
    if (!hasMoreMessages || isLoading) return;

    await loadMessageHistory({
      ...messageHistoryOptions.current,
      offset: messageHistory.length
    });
  }, [hasMoreMessages, isLoading, loadMessageHistory, messageHistory.length]);

  // Store message
  const storeMessage = useCallback(async (messageData: any, context: any = {}) => {
    if (!negotiationId) return;

    try {
      setError(null);

      const response = await conversationAPI.storeMessage(negotiationId, {
        ...messageData,
        context: {
          ...context,
          branch: activeBranch,
          timestamp: new Date()
        }
      });

      if (response.success) {
        // Add message to local state immediately (optimistic update)
        setMessageHistory(prev => [...prev, response.data]);
        setTotalMessages(prev => prev + 1);

        // Clear message cache
        if (cacheEnabled) {
          for (const key of cache.current.keys()) {
            if (key.startsWith(`messages:${negotiationId}`)) {
              cache.current.delete(key);
            }
          }
        }

        // Refresh conversation state
        await loadConversationState();
      } else {
        setError(response.message || 'Failed to store message');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to store message');
      console.error('Error storing message:', err);
    }
  }, [negotiationId, activeBranch, cacheEnabled, loadConversationState]);

  // Create branch
  const createBranch = useCallback(async (
    branchName: string,
    branchType: string = 'scenario',
    parentBranch: string = 'main'
  ) => {
    if (!negotiationId) return;

    try {
      setError(null);

      const response = await conversationAPI.createBranch(negotiationId, {
        branchName,
        branchType,
        parentBranch
      });

      if (response.success) {
        // Refresh conversation state to get updated branches
        await loadConversationState();
      } else {
        setError(response.message || 'Failed to create branch');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create branch');
      console.error('Error creating branch:', err);
    }
  }, [negotiationId, loadConversationState]);

  // Switch branch
  const switchBranch = useCallback(async (branchName: string) => {
    if (!negotiationId) return;

    try {
      setError(null);

      const response = await conversationAPI.switchBranch(negotiationId, branchName);

      if (response.success) {
        // Update conversation state
        await loadConversationState();
        
        // Reload messages for the new branch
        messageHistoryOptions.current.branch = branchName;
        messageHistoryOptions.current.offset = 0;
        await loadMessageHistory({ branch: branchName, offset: 0 });
      } else {
        setError(response.message || 'Failed to switch branch');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to switch branch');
      console.error('Error switching branch:', err);
    }
  }, [negotiationId, loadConversationState, loadMessageHistory]);

  // Switch context
  const switchContext = useCallback(async (toNegotiationId: string) => {
    if (!negotiationId) return;

    try {
      setError(null);

      const response = await conversationAPI.switchContext({
        fromNegotiationId: negotiationId,
        toNegotiationId
      });

      if (response.success) {
        // The actual context switch would be handled by the parent component
        // This just returns the context data
        return response.data;
      } else {
        setError(response.message || 'Failed to switch context');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to switch context');
      console.error('Error switching context:', err);
    }
  }, [negotiationId]);

  // Resume conversation
  const resumeConversation = useCallback(async (resumptionData: any = {}) => {
    if (!negotiationId) return;

    try {
      setError(null);

      const response = await conversationAPI.resumeConversation(negotiationId, resumptionData);

      if (response.success) {
        // Refresh all data
        await refreshData();
        return response.data;
      } else {
        setError(response.message || 'Failed to resume conversation');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resume conversation');
      console.error('Error resuming conversation:', err);
    }
  }, [negotiationId]);

  // Manage rounds
  const manageRounds = useCallback(async (action: string, context: any = {}) => {
    if (!negotiationId) return;

    try {
      setError(null);

      const response = await conversationAPI.manageRounds(negotiationId, action, context);

      if (response.success) {
        // Refresh conversation state
        await loadConversationState();
        return response.data;
      } else {
        setError(response.message || 'Failed to manage rounds');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to manage rounds');
      console.error('Error managing rounds:', err);
    }
  }, [negotiationId, loadConversationState]);

  // Load analytics
  const loadAnalytics = useCallback(async (
    timeframe: string = '7d',
    types: string[] = ['sentiment', 'behavior', 'performance']
  ) => {
    if (!negotiationId || !analyticsEnabled) return;

    try {
      setError(null);

      // Check cache
      const cacheKey = `analytics:${negotiationId}:${timeframe}:${types.join(',')}`;
      if (cacheEnabled) {
        const cached = cache.current.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < 300000) { // 5 minute cache
          setAnalytics(cached.data);
          return;
        }
      }

      const response = await conversationAPI.getAnalytics(negotiationId, {
        timeframe,
        types: types.join(',')
      });

      if (response.success) {
        setAnalytics(response.data);

        // Cache the result
        if (cacheEnabled) {
          cache.current.set(cacheKey, {
            data: response.data,
            timestamp: Date.now()
          });
        }
      } else {
        setError(response.message || 'Failed to load analytics');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
      console.error('Error loading analytics:', err);
    }
  }, [negotiationId, analyticsEnabled, cacheEnabled]);

  // Generate report
  const generateReport = useCallback(async (reportType: string, options: any = {}) => {
    if (!negotiationId) return null;

    try {
      setError(null);

      const response = await conversationAPI.generateReport(negotiationId, reportType, options);

      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to generate report');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate report');
      console.error('Error generating report:', err);
      return null;
    }
  }, [negotiationId]);

  // Export conversation
  const exportConversation = useCallback(async (format: string = 'json', options: any = {}) => {
    if (!negotiationId) return;

    try {
      setError(null);

      const response = await conversationAPI.exportConversation(negotiationId, {
        format,
        ...options
      });

      // Handle the file download
      const blob = new Blob([response], { type: getContentType(format) });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `conversation-${negotiationId}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Failed to export conversation');
      console.error('Error exporting conversation:', err);
    }
  }, [negotiationId]);

  // Share conversation
  const shareConversation = useCallback(async (shareOptions: any) => {
    if (!negotiationId) return null;

    try {
      setError(null);

      const response = await conversationAPI.shareConversation(negotiationId, shareOptions);

      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to share conversation');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to share conversation');
      console.error('Error sharing conversation:', err);
      return null;
    }
  }, [negotiationId]);

  // Get performance metrics
  const getPerformanceMetrics = useCallback(async () => {
    try {
      setError(null);

      const response = await conversationAPI.getPerformanceMetrics();

      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to get performance metrics');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get performance metrics');
      console.error('Error getting performance metrics:', err);
      return null;
    }
  }, []);

  // Compare conversations
  const compareConversations = useCallback(async (negotiationIds: string[]) => {
    try {
      setError(null);

      const response = await conversationAPI.compareConversations(negotiationIds);

      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to compare conversations');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to compare conversations');
      console.error('Error comparing conversations:', err);
      return null;
    }
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    if (cacheEnabled) {
      cache.current.clear();
    }
    
    await Promise.all([
      loadConversationState(),
      loadMessageHistory({ offset: 0 }),
      analyticsEnabled ? loadAnalytics() : Promise.resolve()
    ]);
  }, [loadConversationState, loadMessageHistory, loadAnalytics, analyticsEnabled, cacheEnabled]);

  // Clear cache
  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !realTimeUpdates || !negotiationId) return;

    const handleStateUpdate = (data: any) => {
      if (data.negotiationId === negotiationId) {
        setConversationState(data.state);
      }
    };

    const handleNewMessage = (data: any) => {
      if (data.negotiationId === negotiationId) {
        setMessageHistory(prev => [...prev, data.message]);
        setTotalMessages(prev => prev + 1);
      }
    };

    socket.on('conversation:state-update', handleStateUpdate);
    socket.on('conversation:new-message', handleNewMessage);

    return () => {
      socket.off('conversation:state-update', handleStateUpdate);
      socket.off('conversation:new-message', handleNewMessage);
    };
  }, [socket, realTimeUpdates, negotiationId]);

  // Auto-load data
  useEffect(() => {
    if (autoLoad && negotiationId) {
      refreshData();
    }
  }, [autoLoad, negotiationId, refreshData]);

  // Periodic refresh for analytics
  useEffect(() => {
    if (!analyticsEnabled || !negotiationId) return;

    const interval = setInterval(() => {
      loadAnalytics();
    }, 300000); // Refresh analytics every 5 minutes

    return () => clearInterval(interval);
  }, [analyticsEnabled, negotiationId, loadAnalytics]);

  return {
    // State
    conversationState,
    isLoading,
    error,
    messageHistory,
    totalMessages,
    hasMoreMessages,
    analytics,
    insights,
    availableBranches,
    activeBranch,

    // Actions
    loadConversationState,
    updateConversationState,
    loadMessageHistory,
    loadMoreMessages,
    storeMessage,
    createBranch,
    switchBranch,
    switchContext,
    resumeConversation,
    manageRounds,
    loadAnalytics,
    generateReport,
    exportConversation,
    shareConversation,
    getPerformanceMetrics,
    compareConversations,
    refreshData,
    clearCache
  };
};

// Helper function to get content type for export
function getContentType(format: string): string {
  const types: Record<string, string> = {
    json: 'application/json',
    csv: 'text/csv',
    txt: 'text/plain',
    html: 'text/html'
  };
  return types[format] || 'application/octet-stream';
}

export default useConversationManager;
