// 🧠 Advanced Context Management & Conversation Memory
// Day 12 Enhancement - Sophisticated Context Preservation & Analytics

const EventEmitter = require('events');
const { geminiAnalytics } = require('./geminiAnalytics');

class ConversationContextManager extends EventEmitter {
  constructor() {
    super();
    
    // In-memory context store with TTL
    this.contexts = new Map();
    this.contextTTL = 24 * 60 * 60 * 1000; // 24 hours
    
    // Context analytics
    this.analytics = {
      totalContexts: 0,
      activeContexts: 0,
      averageConversationLength: 0,
      memoryUsage: 0
    };

    // Pattern recognition for conversation analysis
    this.patterns = {
      priceProgression: [],
      commonPhrases: new Map(),
      negotiationStrategies: new Map(),
      successIndicators: []
    };

    // Start cleanup and analytics intervals
    this.startCleanupTimer();
    this.startAnalyticsTimer();
  }

  // Create or update conversation context
  createContext(negotiationId, initialData = {}) {
    const contextKey = this.getContextKey(negotiationId);
    
    const context = {
      id: negotiationId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      messages: [],
      offers: [],
      patterns: {
        priceMovement: [],
        responseTime: [],
        sentimentProgress: []
      },
      analytics: {
        totalRounds: 0,
        averageResponseTime: 0,
        priceFlexibility: 0,
        negotiationStyle: 'unknown',
        successProbability: 0.5
      },
      metadata: {
        productInfo: initialData.productInfo || {},
        participantInfo: initialData.participantInfo || {},
        negotiationSettings: initialData.settings || {}
      }
    };

    this.contexts.set(contextKey, context);
    this.analytics.totalContexts++;
    this.analytics.activeContexts = this.contexts.size;

    this.emit('contextCreated', { negotiationId, context });
    return context;
  }

  // Add message to conversation context
  addMessage(negotiationId, message, analysis = {}) {
    const contextKey = this.getContextKey(negotiationId);
    const context = this.contexts.get(contextKey);

    if (!context) {
      console.warn(`Context not found for negotiation: ${negotiationId}`);
      return null;
    }

    const messageEntry = {
      id: this.generateMessageId(),
      timestamp: Date.now(),
      content: message.content,
      sender: message.sender, // 'buyer', 'seller', 'ai'
      action: message.action,
      offer: message.offer,
      confidence: message.confidence,
      analysis: {
        sentiment: analysis.sentiment || 'neutral',
        urgency: analysis.urgency || 'medium',
        strategy: analysis.strategy || 'standard',
        ...analysis
      }
    };

    context.messages.push(messageEntry);
    context.lastActivity = Date.now();
    context.analytics.totalRounds = context.messages.length;

    // Update offer tracking
    if (message.offer) {
      context.offers.push({
        round: context.messages.length,
        amount: message.offer.amount,
        timestamp: Date.now(),
        sender: message.sender
      });
      this.updatePriceProgression(context);
    }

    // Update pattern analysis
    this.analyzeConversationPatterns(context, messageEntry);

    // Update success probability
    this.updateSuccessProbability(context);

    this.emit('messageAdded', { negotiationId, message: messageEntry, context });
    return messageEntry;
  }

  // Get conversation context with analytics
  getContext(negotiationId, includeAnalytics = true) {
    const contextKey = this.getContextKey(negotiationId);
    const context = this.contexts.get(contextKey);

    if (!context) {
      return null;
    }

    // Update last access time
    context.lastActivity = Date.now();

    if (includeAnalytics) {
      return {
        ...context,
        analytics: {
          ...context.analytics,
          conversationAge: Date.now() - context.startTime,
          recentActivity: this.getRecentActivity(context),
          negotiationPhase: this.determineNegotiationPhase(context),
          predictedOutcome: this.predictOutcome(context)
        }
      };
    }

    return context;
  }

  // Get conversation summary for AI context
  getConversationSummary(negotiationId, maxMessages = 5) {
    const context = this.getContext(negotiationId, false);
    
    if (!context || context.messages.length === 0) {
      return 'No conversation history available.';
    }

    const recentMessages = context.messages.slice(-maxMessages);
    const summary = recentMessages.map(msg => {
      let line = `${msg.sender}: ${msg.content}`;
      if (msg.offer) {
        line += ` (Offered: $${msg.offer.amount})`;
      }
      return line;
    }).join('\n');

    // Add context metadata
    const metadata = [
      `Total rounds: ${context.analytics.totalRounds}`,
      `Current phase: ${this.determineNegotiationPhase(context)}`,
      `Success probability: ${Math.round(context.analytics.successProbability * 100)}%`
    ];

    return `${summary}\n\n[Context: ${metadata.join(', ')}]`;
  }

  // Analyze conversation patterns
  analyzeConversationPatterns(context, newMessage) {
    // Sentiment progression analysis
    if (newMessage.analysis.sentiment) {
      context.patterns.sentimentProgress.push({
        round: context.messages.length,
        sentiment: newMessage.analysis.sentiment,
        timestamp: Date.now()
      });
    }

    // Response time analysis
    if (context.messages.length > 1) {
      const previousMessage = context.messages[context.messages.length - 2];
      const responseTime = newMessage.timestamp - previousMessage.timestamp;
      context.patterns.responseTime.push(responseTime);
      
      // Update average response time
      const avgResponseTime = context.patterns.responseTime.reduce((sum, time) => sum + time, 0) / context.patterns.responseTime.length;
      context.analytics.averageResponseTime = avgResponseTime;
    }

    // Strategy pattern recognition
    if (newMessage.analysis.strategy) {
      const strategy = newMessage.analysis.strategy;
      if (!this.patterns.negotiationStrategies.has(strategy)) {
        this.patterns.negotiationStrategies.set(strategy, 0);
      }
      this.patterns.negotiationStrategies.set(strategy, this.patterns.negotiationStrategies.get(strategy) + 1);
      
      // Update context strategy
      context.analytics.negotiationStyle = this.determineDominantStrategy(context);
    }

    // Common phrase tracking
    const words = newMessage.content.toLowerCase().split(/\s+/);
    const phrases = this.extractPhrases(words);
    phrases.forEach(phrase => {
      if (!this.patterns.commonPhrases.has(phrase)) {
        this.patterns.commonPhrases.set(phrase, 0);
      }
      this.patterns.commonPhrases.set(phrase, this.patterns.commonPhrases.get(phrase) + 1);
    });
  }

  // Update price progression analytics
  updatePriceProgression(context) {
    if (context.offers.length < 2) return;

    const offers = context.offers;
    const priceMovements = [];

    for (let i = 1; i < offers.length; i++) {
      const current = offers[i];
      const previous = offers[i - 1];
      const movement = {
        round: current.round,
        change: current.amount - previous.amount,
        percentage: ((current.amount - previous.amount) / previous.amount) * 100,
        direction: current.amount > previous.amount ? 'up' : 'down'
      };
      priceMovements.push(movement);
    }

    context.patterns.priceMovement = priceMovements;

    // Calculate price flexibility
    const totalChange = Math.abs(offers[offers.length - 1].amount - offers[0].amount);
    const initialOffer = offers[0].amount;
    context.analytics.priceFlexibility = (totalChange / initialOffer) * 100;
  }

  // Determine negotiation phase
  determineNegotiationPhase(context) {
    const { totalRounds, successProbability } = context.analytics;
    const maxRounds = context.metadata.negotiationSettings.maxRounds || 10;

    if (totalRounds <= 2) {
      return 'opening';
    } else if (totalRounds <= maxRounds * 0.6) {
      return 'exploration';
    } else if (totalRounds <= maxRounds * 0.8) {
      return 'bargaining';
    } else {
      return 'closing';
    }
  }

  // Update success probability based on conversation analysis
  updateSuccessProbability(context) {
    let probability = 0.5; // Base probability

    // Factor 1: Sentiment progression
    const sentimentScores = context.patterns.sentimentProgress.map(s => {
      switch (s.sentiment) {
        case 'positive': return 1;
        case 'neutral': return 0.5;
        case 'negative': return 0;
        default: return 0.5;
      }
    });

    if (sentimentScores.length > 0) {
      const avgSentiment = sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length;
      probability += (avgSentiment - 0.5) * 0.3; // ±15% based on sentiment
    }

    // Factor 2: Price movement convergence
    if (context.offers.length >= 2) {
      const firstOffer = context.offers[0].amount;
      const lastOffer = context.offers[context.offers.length - 1].amount;
      const targetPrice = context.metadata.negotiationSettings.targetPrice || firstOffer;
      
      const convergence = 1 - Math.abs(lastOffer - targetPrice) / Math.abs(firstOffer - targetPrice);
      probability += convergence * 0.2; // Up to +20% for price convergence
    }

    // Factor 3: Response time (faster responses often indicate engagement)
    if (context.analytics.averageResponseTime > 0) {
      const responseTimeFactor = Math.max(0, 1 - (context.analytics.averageResponseTime / (60 * 60 * 1000))); // Penalize responses over 1 hour
      probability += responseTimeFactor * 0.1; // Up to +10% for quick responses
    }

    // Factor 4: Negotiation phase
    const phase = this.determineNegotiationPhase(context);
    const phaseMultipliers = {
      opening: 0.9,
      exploration: 1.0,
      bargaining: 1.1,
      closing: 1.2
    };
    probability *= phaseMultipliers[phase] || 1.0;

    // Clamp between 0 and 1
    context.analytics.successProbability = Math.max(0, Math.min(1, probability));
  }

  // Predict negotiation outcome
  predictOutcome(context) {
    const { successProbability, negotiationStyle, priceFlexibility } = context.analytics;
    const phase = this.determineNegotiationPhase(context);

    let prediction = 'uncertain';
    let confidence = 0.5;

    if (successProbability > 0.8) {
      prediction = 'likely_success';
      confidence = successProbability;
    } else if (successProbability > 0.6) {
      prediction = 'possible_success';
      confidence = successProbability * 0.8;
    } else if (successProbability < 0.3) {
      prediction = 'likely_failure';
      confidence = (1 - successProbability) * 0.8;
    }

    return {
      prediction,
      confidence: Math.round(confidence * 100),
      factors: {
        priceFlexibility: Math.round(priceFlexibility),
        negotiationStyle,
        phase,
        engagement: this.calculateEngagementScore(context)
      }
    };
  }

  // Calculate engagement score
  calculateEngagementScore(context) {
    const { messages, patterns } = context;
    
    let score = 0.5; // Base score

    // Message frequency
    if (messages.length > 5) score += 0.2;
    if (messages.length > 10) score += 0.1;

    // Response time consistency
    if (patterns.responseTime.length > 1) {
      const avgTime = patterns.responseTime.reduce((sum, time) => sum + time, 0) / patterns.responseTime.length;
      if (avgTime < 30 * 60 * 1000) score += 0.2; // Less than 30 minutes average
    }

    // Content richness (longer messages often indicate more engagement)
    const avgMessageLength = messages.reduce((sum, msg) => sum + msg.content.length, 0) / messages.length;
    if (avgMessageLength > 50) score += 0.1;

    return Math.max(0, Math.min(1, score));
  }

  // Get recent activity summary
  getRecentActivity(context, timeWindow = 60 * 60 * 1000) { // 1 hour default
    const cutoff = Date.now() - timeWindow;
    const recentMessages = context.messages.filter(msg => msg.timestamp > cutoff);
    
    return {
      messageCount: recentMessages.length,
      lastMessageTime: context.messages.length > 0 ? context.messages[context.messages.length - 1].timestamp : null,
      timeElapsed: Date.now() - (context.lastActivity || context.startTime),
      isActive: (Date.now() - context.lastActivity) < timeWindow
    };
  }

  // Determine dominant negotiation strategy
  determineDominantStrategy(context) {
    const strategies = new Map();
    
    context.messages.forEach(msg => {
      if (msg.analysis.strategy) {
        const strategy = msg.analysis.strategy;
        strategies.set(strategy, (strategies.get(strategy) || 0) + 1);
      }
    });

    if (strategies.size === 0) return 'unknown';

    // Find most common strategy
    let dominantStrategy = 'unknown';
    let maxCount = 0;

    for (const [strategy, count] of strategies.entries()) {
      if (count > maxCount) {
        maxCount = count;
        dominantStrategy = strategy;
      }
    }

    return dominantStrategy;
  }

  // Extract meaningful phrases from text
  extractPhrases(words) {
    const phrases = [];
    const skipWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);

    // Extract 2-3 word phrases
    for (let i = 0; i < words.length - 1; i++) {
      const word1 = words[i];
      const word2 = words[i + 1];
      
      if (!skipWords.has(word1) && !skipWords.has(word2) && word1.length > 2 && word2.length > 2) {
        phrases.push(`${word1} ${word2}`);
        
        // Check for 3-word phrases
        if (i < words.length - 2) {
          const word3 = words[i + 2];
          if (!skipWords.has(word3) && word3.length > 2) {
            phrases.push(`${word1} ${word2} ${word3}`);
          }
        }
      }
    }

    return phrases;
  }

  // Cleanup expired contexts
  startCleanupTimer() {
    setInterval(() => {
      const now = Date.now();
      let cleaned = 0;

      for (const [key, context] of this.contexts.entries()) {
        if (now - context.lastActivity > this.contextTTL) {
          this.contexts.delete(key);
          cleaned++;
          this.emit('contextExpired', { contextKey: key, context });
        }
      }

      if (cleaned > 0) {
        this.analytics.activeContexts = this.contexts.size;
        console.log(`Cleaned up ${cleaned} expired conversation contexts`);
      }
    }, 60 * 60 * 1000); // Check every hour
  }

  // Update analytics periodically
  startAnalyticsTimer() {
    setInterval(() => {
      this.updateGlobalAnalytics();
    }, 5 * 60 * 1000); // Update every 5 minutes
  }

  // Update global analytics
  updateGlobalAnalytics() {
    const contexts = Array.from(this.contexts.values());
    
    if (contexts.length === 0) return;

    // Calculate average conversation length
    const totalMessages = contexts.reduce((sum, ctx) => sum + ctx.messages.length, 0);
    this.analytics.averageConversationLength = totalMessages / contexts.length;

    // Estimate memory usage
    const estimatedMemory = contexts.reduce((sum, ctx) => {
      return sum + JSON.stringify(ctx).length;
    }, 0);
    this.analytics.memoryUsage = estimatedMemory;

    // Update active contexts count
    this.analytics.activeContexts = contexts.length;

    this.emit('analyticsUpdated', this.analytics);
  }

  // Get global analytics
  getAnalytics() {
    return {
      ...this.analytics,
      contextSample: this.contexts.size > 0 ? Array.from(this.contexts.keys()).slice(0, 5) : [],
      topPhrases: Array.from(this.patterns.commonPhrases.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      topStrategies: Array.from(this.patterns.negotiationStrategies.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    };
  }

  // Utility methods
  getContextKey(negotiationId) {
    return `nego_${negotiationId}`;
  }

  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  // Export context data
  exportContext(negotiationId) {
    const context = this.getContext(negotiationId, true);
    if (!context) return null;

    return {
      exportTime: new Date().toISOString(),
      negotiationId,
      summary: {
        totalRounds: context.analytics.totalRounds,
        successProbability: context.analytics.successProbability,
        negotiationStyle: context.analytics.negotiationStyle,
        phase: this.determineNegotiationPhase(context),
        outcome: this.predictOutcome(context)
      },
      timeline: context.messages.map(msg => ({
        round: context.messages.indexOf(msg) + 1,
        timestamp: new Date(msg.timestamp).toISOString(),
        sender: msg.sender,
        action: msg.action,
        offer: msg.offer,
        sentiment: msg.analysis.sentiment
      })),
      analytics: context.analytics,
      patterns: context.patterns
    };
  }
}

module.exports = new ConversationContextManager();
