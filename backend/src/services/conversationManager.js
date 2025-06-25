/**
 * Advanced Conversation Manager for Day 16 - Smart Marketplace
 * 
 * Features:
 * - Real-time conversation state tracking
 * - Message history storage and retrieval
 * - Conversation branching for different scenarios
 * - Context switching between products/buyers
 * - Conversation resumption after interruptions
 * - Negotiation round management and limits
 * - Memory management for long conversations
 * - Performance optimization for concurrent chats
 */

const Negotiation = require('../models/Negotiation');
const Redis = require('redis');

class ConversationManager {
  constructor() {
    this.activeConversations = new Map(); // In-memory cache
    this.conversationStates = new Map(); // Real-time state tracking
    this.contextCache = new Map(); // Context switching cache
    this.roundLimits = new Map(); // Round management
    this.memoryPool = new Map(); // Memory management
    
    // Initialize Redis for distributed state management (optional)
    this.redis = null;
    this.initializeRedis();
    
    // Performance monitoring
    this.metrics = {
      totalConversations: 0,
      activeConversations: 0,
      messagesProcessed: 0,
      averageResponseTime: 0,
      cacheHitRate: 0
    };
    
    // Memory management settings
    this.maxCachedConversations = 1000;
    this.maxMessagesPerConversation = 5000;
    this.cacheCleanupInterval = 300000; // 5 minutes
    
    this.startCleanupProcess();
  }

  async initializeRedis() {
    try {
      if (process.env.REDIS_URL) {
        this.redis = Redis.createClient({
          url: process.env.REDIS_URL
        });
        await this.redis.connect();
        console.log('🔗 Redis connected for conversation management');
      }
    } catch (error) {
      console.log('⚠️ Redis not available, using in-memory storage');
    }
  }

  /**
   * 1. Real-time Conversation State Tracking
   */
  async trackConversationState(negotiationId, state) {
    const timestamp = new Date();
    const stateData = {
      ...state,
      timestamp,
      lastActivity: timestamp
    };

    // Update in-memory state
    this.conversationStates.set(negotiationId, stateData);

    // Update Redis if available
    if (this.redis) {
      await this.redis.setEx(
        `conv_state:${negotiationId}`,
        3600, // 1 hour TTL
        JSON.stringify(stateData)
      );
    }

    // Emit real-time update
    this.emitStateUpdate(negotiationId, stateData);

    return stateData;
  }

  async getConversationState(negotiationId) {
    // Try in-memory first
    let state = this.conversationStates.get(negotiationId);
    
    if (!state && this.redis) {
      // Try Redis
      const redisState = await this.redis.get(`conv_state:${negotiationId}`);
      if (redisState) {
        state = JSON.parse(redisState);
        this.conversationStates.set(negotiationId, state);
      }
    }

    if (!state) {
      // Create default state
      state = await this.createDefaultState(negotiationId);
    }

    this.metrics.cacheHitRate = state ? 1 : 0;
    return state;
  }

  async createDefaultState(negotiationId) {
    try {
      const negotiation = await Negotiation.findById(negotiationId)
        .populate('product', 'title pricing')
        .populate('buyer', 'username')
        .populate('seller', 'username');

      if (!negotiation) return null;

      const state = {
        negotiationId,
        status: negotiation.status,
        currentRound: negotiation.rounds,
        maxRounds: negotiation.maxRounds,
        lastMessage: negotiation.lastMessage,
        participants: {
          buyer: {
            id: negotiation.buyer._id,
            username: negotiation.buyer.username,
            isActive: false,
            lastSeen: null,
            isTyping: false
          },
          seller: {
            id: negotiation.seller._id,
            username: negotiation.seller.username,
            isActive: false,
            lastSeen: null,
            isTyping: false
          }
        },
        context: {
          productTitle: negotiation.product.title,
          currentOffer: negotiation.pricing.currentOffer,
          priceRange: {
            min: negotiation.product.pricing.minPrice,
            max: negotiation.product.pricing.basePrice
          }
        },
        branching: {
          activeBranch: 'main',
          availableBranches: ['main'],
          branchHistory: []
        },
        timestamp: new Date(),
        lastActivity: new Date()
      };

      await this.trackConversationState(negotiationId, state);
      return state;
    } catch (error) {
      console.error('Error creating default state:', error);
      return null;
    }
  }

  /**
   * 2. Message History Storage and Retrieval with Advanced Filtering
   */
  async storeMessage(negotiationId, messageData, context = {}) {
    try {
      const startTime = Date.now();
      
      // Get or create conversation in cache
      let conversation = this.activeConversations.get(negotiationId);
      
      if (!conversation) {
        conversation = await this.loadConversation(negotiationId);
      }

      // Enhanced message storage with metadata
      const enhancedMessage = {
        ...messageData,
        id: messageData._id || this.generateMessageId(),
        timestamp: new Date(),
        context: {
          conversationRound: conversation.rounds,
          branch: context.branch || 'main',
          previousMessageId: conversation.lastMessage?._id,
          responseTime: context.responseTime,
          sentiment: context.sentiment,
          confidence: context.confidence
        },
        metadata: {
          storedAt: new Date(),
          processingTime: 0,
          cacheLevel: 'memory'
        }
      };

      // Store in database
      const negotiation = await Negotiation.findById(negotiationId);
      if (negotiation) {
        await negotiation.addMessage(enhancedMessage);
      }

      // Update cache
      if (!conversation.messages) conversation.messages = [];
      conversation.messages.push(enhancedMessage);
      
      // Limit messages in memory
      if (conversation.messages.length > this.maxMessagesPerConversation) {
        conversation.messages = conversation.messages.slice(-this.maxMessagesPerConversation);
      }

      this.activeConversations.set(negotiationId, conversation);

      // Update metrics
      const processingTime = Date.now() - startTime;
      enhancedMessage.metadata.processingTime = processingTime;
      this.metrics.messagesProcessed++;
      this.updateAverageResponseTime(processingTime);

      return enhancedMessage;
    } catch (error) {
      console.error('Error storing message:', error);
      throw error;
    }
  }

  async getMessageHistory(negotiationId, options = {}) {
    const {
      limit = 50,
      offset = 0,
      sender = null,
      messageType = null,
      dateRange = null,
      branch = 'main',
      includeContext = false
    } = options;

    try {
      // Try cache first
      const cachedConversation = this.activeConversations.get(negotiationId);
      let messages = [];

      if (cachedConversation?.messages) {
        messages = cachedConversation.messages;
      } else {
        // Load from database
        const negotiation = await Negotiation.findById(negotiationId)
          .select('messages')
          .lean();
        
        if (negotiation) {
          messages = negotiation.messages || [];
        }
      }

      // Apply filters
      let filteredMessages = messages;

      if (sender) {
        filteredMessages = filteredMessages.filter(msg => msg.sender === sender);
      }

      if (messageType) {
        filteredMessages = filteredMessages.filter(msg => msg.type === messageType);
      }

      if (dateRange) {
        filteredMessages = filteredMessages.filter(msg => {
          const msgDate = new Date(msg.timestamp);
          return msgDate >= dateRange.start && msgDate <= dateRange.end;
        });
      }

      if (branch && branch !== 'main') {
        filteredMessages = filteredMessages.filter(msg => 
          msg.context?.branch === branch
        );
      }

      // Apply pagination
      const total = filteredMessages.length;
      const paginatedMessages = filteredMessages
        .slice(offset, offset + limit);

      // Include conversation context if requested
      let conversationContext = null;
      if (includeContext) {
        conversationContext = await this.getConversationContext(negotiationId);
      }

      return {
        messages: paginatedMessages,
        total,
        hasMore: offset + limit < total,
        pagination: {
          offset,
          limit,
          page: Math.floor(offset / limit) + 1,
          pages: Math.ceil(total / limit)
        },
        context: conversationContext
      };
    } catch (error) {
      console.error('Error retrieving message history:', error);
      throw error;
    }
  }

  /**
   * 3. Conversation Branching for Different Scenarios
   */
  async createConversationBranch(negotiationId, branchName, branchType = 'scenario', parentBranch = 'main') {
    try {
      const state = await this.getConversationState(negotiationId);
      
      if (!state) {
        throw new Error('Conversation state not found');
      }

      const branch = {
        name: branchName,
        type: branchType,
        parent: parentBranch,
        createdAt: new Date(),
        messages: [],
        context: {
          ...state.context,
          branchReason: `Branched for ${branchType}`,
          branchPoint: state.currentRound
        }
      };

      // Update available branches
      state.branching.availableBranches.push(branchName);
      state.branching.branchHistory.push({
        action: 'created',
        branch: branchName,
        timestamp: new Date(),
        reason: `${branchType} branch created`
      });

      await this.trackConversationState(negotiationId, state);

      // Store branch data
      if (this.redis) {
        await this.redis.setEx(
          `conv_branch:${negotiationId}:${branchName}`,
          7200, // 2 hours TTL
          JSON.stringify(branch)
        );
      }

      return branch;
    } catch (error) {
      console.error('Error creating conversation branch:', error);
      throw error;
    }
  }

  async switchToBranch(negotiationId, branchName) {
    try {
      const state = await this.getConversationState(negotiationId);
      
      if (!state.branching.availableBranches.includes(branchName)) {
        throw new Error(`Branch ${branchName} does not exist`);
      }

      const previousBranch = state.branching.activeBranch;
      state.branching.activeBranch = branchName;
      state.branching.branchHistory.push({
        action: 'switched',
        from: previousBranch,
        to: branchName,
        timestamp: new Date()
      });

      await this.trackConversationState(negotiationId, state);

      return {
        success: true,
        previousBranch,
        currentBranch: branchName,
        branchData: await this.getBranchData(negotiationId, branchName)
      };
    } catch (error) {
      console.error('Error switching conversation branch:', error);
      throw error;
    }
  }

  async getBranchData(negotiationId, branchName) {
    if (this.redis) {
      const branchData = await this.redis.get(`conv_branch:${negotiationId}:${branchName}`);
      if (branchData) {
        return JSON.parse(branchData);
      }
    }
    
    // Return default branch data if not found
    return {
      name: branchName,
      type: 'default',
      parent: 'main',
      messages: [],
      context: {}
    };
  }

  /**
   * 4. Context Switching Between Products/Buyers
   */
  async switchContext(userId, fromNegotiationId, toNegotiationId) {
    try {
      const startTime = Date.now();

      // Save current context
      const currentContext = await this.captureCurrentContext(fromNegotiationId, userId);
      
      // Store context for resumption
      this.contextCache.set(`${userId}:${fromNegotiationId}`, {
        ...currentContext,
        savedAt: new Date(),
        switchReason: 'context_switch'
      });

      // Load target context
      const targetContext = await this.loadTargetContext(toNegotiationId, userId);

      // Update user's active conversation
      await this.setActiveConversation(userId, toNegotiationId);

      const switchTime = Date.now() - startTime;

      return {
        success: true,
        fromNegotiation: fromNegotiationId,
        toNegotiation: toNegotiationId,
        contextData: targetContext,
        switchTime,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error switching context:', error);
      throw error;
    }
  }

  async captureCurrentContext(negotiationId, userId) {
    const state = await this.getConversationState(negotiationId);
    const conversation = this.activeConversations.get(negotiationId);

    return {
      negotiationId,
      userId,
      currentState: state,
      recentMessages: conversation?.messages?.slice(-10) || [],
      userInput: {
        draftMessage: '', // Would be captured from frontend
        typingState: false
      },
      scrollPosition: 0, // Would be captured from frontend
      timestamp: new Date()
    };
  }

  async loadTargetContext(negotiationId, userId) {
    // Check if we have cached context
    const cachedContext = this.contextCache.get(`${userId}:${negotiationId}`);
    
    if (cachedContext) {
      return cachedContext;
    }

    // Load fresh context
    const state = await this.getConversationState(negotiationId);
    const messageHistory = await this.getMessageHistory(negotiationId, {
      limit: 20,
      includeContext: true
    });

    return {
      negotiationId,
      state,
      recentMessages: messageHistory.messages,
      conversationSummary: await this.generateConversationSummary(negotiationId),
      timestamp: new Date()
    };
  }

  /**
   * 5. Conversation Resumption After Interruptions
   */
  async resumeConversation(negotiationId, userId, resumptionData = {}) {
    try {
      const startTime = Date.now();

      // Get conversation state
      const state = await this.getConversationState(negotiationId);
      
      if (!state) {
        throw new Error('Conversation not found');
      }

      // Check if conversation can be resumed
      const canResume = await this.validateResumption(negotiationId, userId);
      
      if (!canResume.valid) {
        throw new Error(canResume.reason);
      }

      // Load cached context if available
      const cachedContext = this.contextCache.get(`${userId}:${negotiationId}`);

      // Prepare resumption data
      const resumption = {
        negotiationId,
        userId,
        resumedAt: new Date(),
        interruption: {
          duration: cachedContext ? Date.now() - cachedContext.savedAt.getTime() : 0,
          reason: resumptionData.interruption || 'unknown'
        },
        context: cachedContext || await this.loadTargetContext(negotiationId, userId),
        state: {
          ...state,
          participants: {
            ...state.participants,
            [this.getUserRole(state, userId)]: {
              ...state.participants[this.getUserRole(state, userId)],
              isActive: true,
              lastSeen: new Date(),
              resumedAt: new Date()
            }
          }
        }
      };

      // Update conversation state
      await this.trackConversationState(negotiationId, resumption.state);

      // Load conversation into active memory
      await this.loadConversation(negotiationId);

      // Generate resumption summary
      const summary = await this.generateResumptionSummary(negotiationId, resumption);

      const resumptionTime = Date.now() - startTime;

      return {
        success: true,
        resumption,
        summary,
        resumptionTime,
        recommendations: await this.generateResumptionRecommendations(negotiationId, resumption)
      };
    } catch (error) {
      console.error('Error resuming conversation:', error);
      throw error;
    }
  }

  async validateResumption(negotiationId, userId) {
    try {
      const negotiation = await Negotiation.findById(negotiationId);
      
      if (!negotiation) {
        return { valid: false, reason: 'Negotiation not found' };
      }

      if (!negotiation.canParticipate(userId)) {
        return { valid: false, reason: 'User not authorized for this negotiation' };
      }

      if (!negotiation.canContinue()) {
        return { valid: false, reason: 'Negotiation cannot continue' };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, reason: 'Validation failed' };
    }
  }

  /**
   * 6. Negotiation Round Management and Limits
   */
  async manageNegotiationRounds(negotiationId, action, context = {}) {
    try {
      const state = await this.getConversationState(negotiationId);
      const limits = this.roundLimits.get(negotiationId) || await this.createRoundLimits(negotiationId);

      const roundData = {
        current: state.currentRound,
        max: state.maxRounds,
        action,
        timestamp: new Date(),
        context
      };

      switch (action) {
        case 'increment':
          return await this.incrementRound(negotiationId, roundData, limits);
        
        case 'check_limit':
          return await this.checkRoundLimit(negotiationId, roundData, limits);
        
        case 'extend_limit':
          return await this.extendRoundLimit(negotiationId, context.newLimit, limits);
        
        case 'reset':
          return await this.resetRounds(negotiationId, limits);
        
        default:
          throw new Error(`Unknown round action: ${action}`);
      }
    } catch (error) {
      console.error('Error managing negotiation rounds:', error);
      throw error;
    }
  }

  async createRoundLimits(negotiationId) {
    const negotiation = await Negotiation.findById(negotiationId);
    
    const limits = {
      negotiationId,
      maxRounds: negotiation.maxRounds,
      warningThreshold: Math.floor(negotiation.maxRounds * 0.8),
      escalationThreshold: Math.floor(negotiation.maxRounds * 0.9),
      timeBasedLimits: {
        maxDuration: 24 * 60 * 60 * 1000, // 24 hours
        warningDuration: 20 * 60 * 60 * 1000 // 20 hours
      },
      customRules: {
        allowExtension: true,
        maxExtensions: 2,
        extensionsUsed: 0,
        requireApproval: false
      }
    };

    this.roundLimits.set(negotiationId, limits);
    return limits;
  }

  async incrementRound(negotiationId, roundData, limits) {
    const newRound = roundData.current + 1;
    
    // Check if increment is allowed
    if (newRound > limits.maxRounds) {
      return {
        success: false,
        reason: 'Maximum rounds exceeded',
        current: roundData.current,
        max: limits.maxRounds
      };
    }

    // Update round in database
    await Negotiation.findByIdAndUpdate(negotiationId, {
      rounds: newRound
    });

    // Update state
    const state = await this.getConversationState(negotiationId);
    state.currentRound = newRound;
    await this.trackConversationState(negotiationId, state);

    // Check for warnings
    const warnings = [];
    if (newRound >= limits.warningThreshold) {
      warnings.push('Approaching round limit');
    }
    if (newRound >= limits.escalationThreshold) {
      warnings.push('Escalation threshold reached');
    }

    return {
      success: true,
      round: newRound,
      maxRounds: limits.maxRounds,
      remaining: limits.maxRounds - newRound,
      warnings,
      canContinue: newRound < limits.maxRounds
    };
  }

  /**
   * 7. Conversation Analytics and Insights
   */
  async generateConversationAnalytics(negotiationId, timeframe = '7d') {
    try {
      const conversation = await this.loadConversation(negotiationId);
      const messageHistory = await this.getMessageHistory(negotiationId, {
        limit: 1000,
        includeContext: true
      });

      const analytics = {
        negotiationId,
        timeframe,
        generatedAt: new Date(),
        
        // Message Analytics
        messageStats: {
          total: messageHistory.total,
          byType: this.groupMessagesByType(messageHistory.messages),
          bySender: this.groupMessagesBySender(messageHistory.messages),
          averageLength: this.calculateAverageMessageLength(messageHistory.messages),
          responseTimesMs: this.calculateResponseTimes(messageHistory.messages)
        },

        // Conversation Flow
        conversationFlow: {
          rounds: conversation.rounds,
          maxRounds: conversation.maxRounds,
          progress: (conversation.rounds / conversation.maxRounds) * 100,
          priceMovement: this.analyzePriceMovement(messageHistory.messages),
          negotiationMomentum: this.calculateNegotiationMomentum(messageHistory.messages)
        },

        // Participant Behavior
        participantBehavior: {
          buyer: this.analyzeParticipantBehavior(messageHistory.messages, 'buyer'),
          seller: this.analyzeParticipantBehavior(messageHistory.messages, 'seller'),
          ai: this.analyzeParticipantBehavior(messageHistory.messages, 'ai')
        },

        // Sentiment Analysis
        sentiment: await this.analyzeSentiment(messageHistory.messages),

        // Success Indicators
        successIndicators: {
          engagementLevel: this.calculateEngagementLevel(messageHistory.messages),
          progressTowardsDeal: this.calculateDealProgress(conversation),
          cooperationScore: this.calculateCooperationScore(messageHistory.messages),
          riskFactors: this.identifyRiskFactors(conversation, messageHistory.messages)
        },

        // Performance Metrics
        performance: {
          averageResponseTime: this.metrics.averageResponseTime,
          cacheHitRate: this.metrics.cacheHitRate,
          processedMessages: this.metrics.messagesProcessed
        }
      };

      // Store analytics for future reference
      if (this.redis) {
        await this.redis.setEx(
          `conv_analytics:${negotiationId}`,
          3600,
          JSON.stringify(analytics)
        );
      }

      return analytics;
    } catch (error) {
      console.error('Error generating conversation analytics:', error);
      throw error;
    }
  }

  /**
   * 8. Memory Management for Long Conversations
   */
  startCleanupProcess() {
    setInterval(() => {
      this.performMemoryCleanup();
    }, this.cacheCleanupInterval);
  }

  async performMemoryCleanup() {
    try {
      const startTime = Date.now();
      let cleanedItems = 0;

      // Clean inactive conversations
      for (const [negotiationId, conversation] of this.activeConversations.entries()) {
        const lastActivity = conversation.lastActivity || conversation.updatedAt;
        const inactiveTime = Date.now() - new Date(lastActivity).getTime();
        
        // Remove conversations inactive for more than 1 hour
        if (inactiveTime > 3600000) {
          this.activeConversations.delete(negotiationId);
          cleanedItems++;
        }
      }

      // Clean conversation states
      for (const [negotiationId, state] of this.conversationStates.entries()) {
        const inactiveTime = Date.now() - new Date(state.lastActivity).getTime();
        
        if (inactiveTime > 3600000) {
          this.conversationStates.delete(negotiationId);
          cleanedItems++;
        }
      }

      // Clean context cache
      for (const [key, context] of this.contextCache.entries()) {
        const inactiveTime = Date.now() - new Date(context.savedAt).getTime();
        
        // Remove cached contexts older than 2 hours
        if (inactiveTime > 7200000) {
          this.contextCache.delete(key);
          cleanedItems++;
        }
      }

      // Clean memory pool
      this.cleanMemoryPool();

      const cleanupTime = Date.now() - startTime;
      
      console.log(`🧹 Memory cleanup completed: ${cleanedItems} items cleaned in ${cleanupTime}ms`);
      
      // Update metrics
      this.metrics.activeConversations = this.activeConversations.size;
      
    } catch (error) {
      console.error('Error during memory cleanup:', error);
    }
  }

  cleanMemoryPool() {
    // Implement memory pool cleanup logic
    for (const [key, data] of this.memoryPool.entries()) {
      if (data.lastAccessed && Date.now() - data.lastAccessed > 3600000) {
        this.memoryPool.delete(key);
      }
    }
  }

  /**
   * 9. Conversation Export and Sharing Features
   */
  async exportConversation(negotiationId, format = 'json', options = {}) {
    try {
      const {
        includeMetadata = true,
        includeAnalytics = false,
        dateRange = null,
        participants = [],
        messageTypes = []
      } = options;

      // Get conversation data
      const conversation = await this.loadConversation(negotiationId);
      const messageHistory = await this.getMessageHistory(negotiationId, {
        limit: 10000,
        includeContext: true,
        dateRange,
        messageType: messageTypes.length > 0 ? messageTypes : null
      });

      // Prepare export data
      const exportData = {
        exportInfo: {
          negotiationId,
          exportedAt: new Date(),
          format,
          version: '1.0.0'
        },
        conversation: {
          id: conversation._id,
          product: conversation.product,
          participants: conversation.participants,
          status: conversation.status,
          timeline: conversation.timeline,
          pricing: conversation.pricing
        },
        messages: messageHistory.messages,
        metadata: includeMetadata ? {
          totalMessages: messageHistory.total,
          conversationDuration: this.calculateConversationDuration(conversation),
          finalOutcome: conversation.status
        } : null,
        analytics: includeAnalytics ? await this.generateConversationAnalytics(negotiationId) : null
      };

      // Format based on requested format
      switch (format.toLowerCase()) {
        case 'json':
          return JSON.stringify(exportData, null, 2);
        
        case 'csv':
          return this.convertToCSV(exportData);
        
        case 'txt':
          return this.convertToText(exportData);
        
        case 'html':
          return this.convertToHTML(exportData);
        
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('Error exporting conversation:', error);
      throw error;
    }
  }

  async shareConversation(negotiationId, shareOptions) {
    try {
      const {
        shareWith = [],
        permissions = 'read',
        expiresIn = '7d',
        includePersonalData = false
      } = shareOptions;

      // Generate sharing token
      const shareToken = this.generateShareToken();
      
      // Create share record
      const shareData = {
        negotiationId,
        shareToken,
        sharedBy: shareOptions.sharedBy,
        shareWith,
        permissions,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + this.parseTimeString(expiresIn)),
        includePersonalData,
        accessCount: 0,
        lastAccessed: null
      };

      // Store share record
      if (this.redis) {
        await this.redis.setEx(
          `conv_share:${shareToken}`,
          this.parseTimeString(expiresIn) / 1000,
          JSON.stringify(shareData)
        );
      }

      return {
        shareToken,
        shareUrl: `${process.env.FRONTEND_URL}/shared/conversation/${shareToken}`,
        expiresAt: shareData.expiresAt,
        permissions: shareData.permissions
      };
    } catch (error) {
      console.error('Error sharing conversation:', error);
      throw error;
    }
  }

  /**
   * 10. Performance Optimization for Concurrent Chats
   */
  async optimizeForConcurrentChats() {
    // Implement connection pooling
    this.setupConnectionPooling();
    
    // Implement batch processing
    this.setupBatchProcessing();
    
    // Implement caching strategies
    this.setupAdvancedCaching();
    
    // Monitor performance
    this.setupPerformanceMonitoring();
  }

  setupConnectionPooling() {
    // Database connection pooling configuration
    this.connectionPool = {
      maxConnections: 100,
      minConnections: 10,
      acquireTimeoutMillis: 60000,
      idleTimeoutMillis: 300000
    };
  }

  setupBatchProcessing() {
    this.messageBatch = [];
    this.batchTimeout = null;
    this.batchSize = 50;
    this.batchInterval = 1000; // 1 second
  }

  setupAdvancedCaching() {
    // Implement LRU cache for frequently accessed conversations
    this.conversationLRU = new Map();
    this.maxCacheSize = 1000;
  }

  setupPerformanceMonitoring() {
    setInterval(() => {
      this.reportPerformanceMetrics();
    }, 60000); // Every minute
  }

  reportPerformanceMetrics() {
    const metrics = {
      timestamp: new Date(),
      activeConversations: this.activeConversations.size,
      cachedStates: this.conversationStates.size,
      contextCache: this.contextCache.size,
      memoryUsage: process.memoryUsage(),
      ...this.metrics
    };

    console.log('📊 Conversation Manager Metrics:', metrics);
    return metrics;
  }

  // Helper methods
  generateMessageId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  generateShareToken() {
    return Math.random().toString(36).substr(2) + Date.now().toString(36);
  }

  parseTimeString(timeStr) {
    const unit = timeStr.slice(-1);
    const value = parseInt(timeStr.slice(0, -1));
    
    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return value;
    }
  }

  getUserRole(state, userId) {
    if (state.participants.buyer.id.toString() === userId.toString()) return 'buyer';
    if (state.participants.seller.id.toString() === userId.toString()) return 'seller';
    return null;
  }

  emitStateUpdate(negotiationId, state) {
    // Emit to WebSocket clients if io is available
    if (global.io) {
      global.io.to(`negotiation:${negotiationId}`).emit('conversation:state-update', {
        negotiationId,
        state,
        timestamp: new Date()
      });
    }
  }

  updateAverageResponseTime(newTime) {
    const totalMessages = this.metrics.messagesProcessed;
    const currentAverage = this.metrics.averageResponseTime;
    
    this.metrics.averageResponseTime = 
      (currentAverage * (totalMessages - 1) + newTime) / totalMessages;
  }

  async loadConversation(negotiationId) {
    // Try cache first
    let conversation = this.activeConversations.get(negotiationId);
    
    if (!conversation) {
      // Load from database
      conversation = await Negotiation.findById(negotiationId)
        .populate('product', 'title pricing')
        .populate('buyer', 'username avatar')
        .populate('seller', 'username avatar')
        .lean();
      
      if (conversation) {
        this.activeConversations.set(negotiationId, conversation);
      }
    }
    
    return conversation;
  }

  // Placeholder methods for analytics (would be implemented based on specific requirements)
  groupMessagesByType(messages) {
    const grouped = {};
    messages.forEach(msg => {
      grouped[msg.type] = (grouped[msg.type] || 0) + 1;
    });
    return grouped;
  }

  groupMessagesBySender(messages) {
    const grouped = {};
    messages.forEach(msg => {
      grouped[msg.sender] = (grouped[msg.sender] || 0) + 1;
    });
    return grouped;
  }

  calculateAverageMessageLength(messages) {
    const totalLength = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    return totalLength / messages.length;
  }

  calculateResponseTimes(messages) {
    const responseTimes = [];
    for (let i = 1; i < messages.length; i++) {
      const timeDiff = new Date(messages[i].timestamp) - new Date(messages[i-1].timestamp);
      responseTimes.push(timeDiff);
    }
    return responseTimes;
  }

  analyzePriceMovement(messages) {
    const offerMessages = messages.filter(msg => msg.offer && msg.offer.amount);
    if (offerMessages.length < 2) return { direction: 'stable', magnitude: 0 };
    
    const firstOffer = offerMessages[0].offer.amount;
    const lastOffer = offerMessages[offerMessages.length - 1].offer.amount;
    
    return {
      direction: lastOffer > firstOffer ? 'up' : lastOffer < firstOffer ? 'down' : 'stable',
      magnitude: Math.abs(lastOffer - firstOffer),
      percentage: ((lastOffer - firstOffer) / firstOffer) * 100
    };
  }

  calculateNegotiationMomentum(messages) {
    // Simplified momentum calculation based on message frequency
    const recentMessages = messages.slice(-10);
    const timeSpan = recentMessages.length > 1 ? 
      new Date(recentMessages[recentMessages.length - 1].timestamp) - new Date(recentMessages[0].timestamp) : 0;
    
    return timeSpan > 0 ? recentMessages.length / (timeSpan / 3600000) : 0; // messages per hour
  }

  analyzeParticipantBehavior(messages, sender) {
    const participantMessages = messages.filter(msg => msg.sender === sender);
    
    return {
      messageCount: participantMessages.length,
      averageLength: this.calculateAverageMessageLength(participantMessages),
      offerCount: participantMessages.filter(msg => msg.offer).length,
      responsiveness: this.calculateResponsiveness(messages, sender),
      sentiment: this.calculateSentiment(participantMessages)
    };
  }

  async analyzeSentiment(messages) {
    // Placeholder for sentiment analysis
    return {
      overall: 'neutral',
      trend: 'stable',
      confidence: 0.7
    };
  }

  calculateEngagementLevel(messages) {
    // Simplified engagement calculation
    return Math.min(messages.length / 20, 1); // Normalized to 0-1
  }

  calculateDealProgress(conversation) {
    return conversation.rounds / conversation.maxRounds;
  }

  calculateCooperationScore(messages) {
    // Simplified cooperation score
    const offerMessages = messages.filter(msg => msg.offer);
    return offerMessages.length > 0 ? 0.8 : 0.5; // Placeholder
  }

  identifyRiskFactors(conversation, messages) {
    const risks = [];
    
    if (conversation.rounds > conversation.maxRounds * 0.8) {
      risks.push('High round count');
    }
    
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const timeSinceLastMessage = Date.now() - new Date(lastMessage.timestamp).getTime();
      
      if (timeSinceLastMessage > 24 * 60 * 60 * 1000) {
        risks.push('Long period of inactivity');
      }
    }
    
    return risks;
  }

  calculateResponsiveness(messages, sender) {
    // Calculate how quickly this sender responds
    const senderMessages = messages.filter(msg => msg.sender === sender);
    let totalResponseTime = 0;
    let responseCount = 0;
    
    for (let i = 1; i < messages.length; i++) {
      if (messages[i].sender === sender && messages[i-1].sender !== sender) {
        totalResponseTime += new Date(messages[i].timestamp) - new Date(messages[i-1].timestamp);
        responseCount++;
      }
    }
    
    return responseCount > 0 ? totalResponseTime / responseCount : 0;
  }

  calculateSentiment(messages) {
    // Placeholder sentiment calculation
    return 'neutral';
  }

  calculateConversationDuration(conversation) {
    const start = new Date(conversation.createdAt);
    const end = conversation.completedAt ? new Date(conversation.completedAt) : new Date();
    return end - start;
  }

  convertToCSV(data) {
    // Simplified CSV conversion
    const headers = ['timestamp', 'sender', 'type', 'content', 'offer'];
    const rows = data.messages.map(msg => [
      msg.timestamp,
      msg.sender,
      msg.type,
      msg.content.replace(/,/g, ';'),
      msg.offer ? msg.offer.amount : ''
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  convertToText(data) {
    // Simple text format
    let text = `Conversation Export - ${data.conversation.product.title}\n`;
    text += `==========================================\n\n`;
    
    data.messages.forEach(msg => {
      text += `[${msg.timestamp}] ${msg.sender}: ${msg.content}\n`;
      if (msg.offer) {
        text += `  → Offer: $${msg.offer.amount}\n`;
      }
      text += '\n';
    });
    
    return text;
  }

  convertToHTML(data) {
    // Simple HTML format
    let html = `
      <html>
        <head><title>Conversation Export</title></head>
        <body>
          <h1>Conversation: ${data.conversation.product.title}</h1>
          <div class="messages">
    `;
    
    data.messages.forEach(msg => {
      html += `
        <div class="message ${msg.sender}">
          <strong>${msg.sender}</strong> - ${msg.timestamp}<br>
          ${msg.content}
          ${msg.offer ? `<br><em>Offer: $${msg.offer.amount}</em>` : ''}
        </div>
      `;
    });
    
    html += `
          </div>
        </body>
      </html>
    `;
    
    return html;
  }

  async generateConversationSummary(negotiationId) {
    // Generate a brief summary of the conversation
    const messageHistory = await this.getMessageHistory(negotiationId, { limit: 100 });
    
    return {
      totalMessages: messageHistory.total,
      offerCount: messageHistory.messages.filter(msg => msg.offer).length,
      lastActivity: messageHistory.messages[messageHistory.messages.length - 1]?.timestamp,
      status: 'active', // Would be determined based on actual conversation state
      keyMilestones: [] // Would be populated with important events
    };
  }

  async generateResumptionSummary(negotiationId, resumption) {
    return {
      welcomeBack: true,
      interruption: resumption.interruption,
      missedEvents: [], // Events that occurred during interruption
      currentState: resumption.state,
      nextSteps: [] // Suggested next actions
    };
  }

  async generateResumptionRecommendations(negotiationId, resumption) {
    return [
      'Review recent messages',
      'Check current offer status',
      'Consider your next move'
    ];
  }

  async setActiveConversation(userId, negotiationId) {
    // Track user's currently active conversation
    if (this.redis) {
      await this.redis.setEx(`user_active:${userId}`, 3600, negotiationId);
    }
  }

  async checkRoundLimit(negotiationId, roundData, limits) {
    return {
      current: roundData.current,
      max: limits.maxRounds,
      canContinue: roundData.current < limits.maxRounds,
      warnings: roundData.current >= limits.warningThreshold ? ['Approaching limit'] : []
    };
  }

  async extendRoundLimit(negotiationId, newLimit, limits) {
    if (!limits.customRules.allowExtension) {
      return { success: false, reason: 'Extensions not allowed' };
    }
    
    if (limits.customRules.extensionsUsed >= limits.customRules.maxExtensions) {
      return { success: false, reason: 'Maximum extensions reached' };
    }
    
    // Update limits
    limits.maxRounds = newLimit;
    limits.customRules.extensionsUsed++;
    
    // Update in database
    await Negotiation.findByIdAndUpdate(negotiationId, { maxRounds: newLimit });
    
    return { success: true, newLimit, extensionsUsed: limits.customRules.extensionsUsed };
  }

  async resetRounds(negotiationId, limits) {
    await Negotiation.findByIdAndUpdate(negotiationId, { rounds: 1 });
    
    const state = await this.getConversationState(negotiationId);
    state.currentRound = 1;
    await this.trackConversationState(negotiationId, state);
    
    return { success: true, round: 1 };
  }
}

// Export singleton instance
module.exports = new ConversationManager();
