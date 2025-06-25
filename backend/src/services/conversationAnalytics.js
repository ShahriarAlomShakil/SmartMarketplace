/**
 * Conversation Analytics Service for Day 16 - Smart Marketplace
 * 
 * Advanced analytics and insights for conversation management
 */

const Negotiation = require('../models/Negotiation');
const conversationManager = require('./conversationManager');

class ConversationAnalytics {
  constructor() {
    this.analyticsCache = new Map();
    this.insightGenerators = new Map();
    this.reportGenerators = new Map();
    
    this.initializeAnalytics();
  }

  initializeAnalytics() {
    // Register insight generators
    this.registerInsightGenerator('sentiment', this.generateSentimentInsights.bind(this));
    this.registerInsightGenerator('behavior', this.generateBehaviorInsights.bind(this));
    this.registerInsightGenerator('performance', this.generatePerformanceInsights.bind(this));
    this.registerInsightGenerator('prediction', this.generatePredictionInsights.bind(this));
    
    // Register report generators
    this.registerReportGenerator('summary', this.generateSummaryReport.bind(this));
    this.registerReportGenerator('detailed', this.generateDetailedReport.bind(this));
    this.registerReportGenerator('comparison', this.generateComparisonReport.bind(this));
  }

  registerInsightGenerator(type, generator) {
    this.insightGenerators.set(type, generator);
  }

  registerReportGenerator(type, generator) {
    this.reportGenerators.set(type, generator);
  }

  /**
   * Generate comprehensive conversation insights
   */
  async generateInsights(negotiationId, insightTypes = ['sentiment', 'behavior', 'performance']) {
    try {
      const insights = {
        negotiationId,
        generatedAt: new Date(),
        insights: {}
      };

      // Generate each type of insight
      for (const type of insightTypes) {
        const generator = this.insightGenerators.get(type);
        if (generator) {
          insights.insights[type] = await generator(negotiationId);
        }
      }

      // Cache insights
      this.analyticsCache.set(`insights:${negotiationId}`, insights);

      return insights;
    } catch (error) {
      console.error('Error generating insights:', error);
      throw error;
    }
  }

  /**
   * Sentiment Analysis Insights
   */
  async generateSentimentInsights(negotiationId) {
    const messageHistory = await conversationManager.getMessageHistory(negotiationId, {
      limit: 1000,
      includeContext: true
    });

    const sentimentData = {
      overall: { positive: 0, neutral: 0, negative: 0 },
      byParticipant: {},
      timeline: [],
      triggers: [],
      recommendations: []
    };

    // Analyze sentiment for each message
    for (const message of messageHistory.messages) {
      const sentiment = await this.analyzeSentiment(message.content);
      
      // Update overall sentiment
      sentimentData.overall[sentiment.label]++;
      
      // Update participant sentiment
      if (!sentimentData.byParticipant[message.sender]) {
        sentimentData.byParticipant[message.sender] = { positive: 0, neutral: 0, negative: 0 };
      }
      sentimentData.byParticipant[message.sender][sentiment.label]++;
      
      // Add to timeline
      sentimentData.timeline.push({
        timestamp: message.timestamp,
        sender: message.sender,
        sentiment: sentiment.label,
        confidence: sentiment.confidence,
        content: message.content.substring(0, 100)
      });
      
      // Identify sentiment triggers
      if (sentiment.label === 'negative' && sentiment.confidence > 0.8) {
        sentimentData.triggers.push({
          timestamp: message.timestamp,
          sender: message.sender,
          trigger: 'negative_sentiment',
          content: message.content,
          confidence: sentiment.confidence
        });
      }
    }

    // Generate recommendations
    sentimentData.recommendations = this.generateSentimentRecommendations(sentimentData);

    return sentimentData;
  }

  /**
   * Behavior Analysis Insights
   */
  async generateBehaviorInsights(negotiationId) {
    const messageHistory = await conversationManager.getMessageHistory(negotiationId, {
      limit: 1000,
      includeContext: true
    });

    const behaviorData = {
      communicationPatterns: {},
      negotiationStyle: {},
      responsePatterns: {},
      offerBehavior: {},
      recommendations: []
    };

    // Analyze communication patterns
    behaviorData.communicationPatterns = this.analyzeCommunicationPatterns(messageHistory.messages);
    
    // Analyze negotiation style
    behaviorData.negotiationStyle = this.analyzeNegotiationStyle(messageHistory.messages);
    
    // Analyze response patterns
    behaviorData.responsePatterns = this.analyzeResponsePatterns(messageHistory.messages);
    
    // Analyze offer behavior
    behaviorData.offerBehavior = this.analyzeOfferBehavior(messageHistory.messages);
    
    // Generate recommendations
    behaviorData.recommendations = this.generateBehaviorRecommendations(behaviorData);

    return behaviorData;
  }

  /**
   * Performance Analysis Insights
   */
  async generatePerformanceInsights(negotiationId) {
    const conversation = await conversationManager.loadConversation(negotiationId);
    const messageHistory = await conversationManager.getMessageHistory(negotiationId, {
      limit: 1000,
      includeContext: true
    });

    const performanceData = {
      efficiency: {},
      engagement: {},
      progression: {},
      bottlenecks: [],
      optimizations: []
    };

    // Analyze efficiency metrics
    performanceData.efficiency = this.analyzeEfficiency(conversation, messageHistory.messages);
    
    // Analyze engagement metrics
    performanceData.engagement = this.analyzeEngagement(messageHistory.messages);
    
    // Analyze progression metrics
    performanceData.progression = this.analyzeProgression(conversation, messageHistory.messages);
    
    // Identify bottlenecks
    performanceData.bottlenecks = this.identifyBottlenecks(messageHistory.messages);
    
    // Suggest optimizations
    performanceData.optimizations = this.suggestOptimizations(performanceData);

    return performanceData;
  }

  /**
   * Prediction Insights
   */
  async generatePredictionInsights(negotiationId) {
    const conversation = await conversationManager.loadConversation(negotiationId);
    const messageHistory = await conversationManager.getMessageHistory(negotiationId, {
      limit: 1000,
      includeContext: true
    });

    const predictionData = {
      successProbability: 0,
      completionTimeEstimate: null,
      priceConvergence: {},
      riskFactors: [],
      opportunities: [],
      recommendations: []
    };

    // Calculate success probability
    predictionData.successProbability = this.calculateSuccessProbability(conversation, messageHistory.messages);
    
    // Estimate completion time
    predictionData.completionTimeEstimate = this.estimateCompletionTime(messageHistory.messages);
    
    // Analyze price convergence
    predictionData.priceConvergence = this.analyzePriceConvergence(messageHistory.messages);
    
    // Identify risk factors
    predictionData.riskFactors = this.identifyRiskFactors(conversation, messageHistory.messages);
    
    // Identify opportunities
    predictionData.opportunities = this.identifyOpportunities(conversation, messageHistory.messages);
    
    // Generate recommendations
    predictionData.recommendations = this.generatePredictionRecommendations(predictionData);

    return predictionData;
  }

  /**
   * Generate conversation reports
   */
  async generateReport(negotiationId, reportType = 'summary', options = {}) {
    try {
      const generator = this.reportGenerators.get(reportType);
      if (!generator) {
        throw new Error(`Unknown report type: ${reportType}`);
      }

      const report = await generator(negotiationId, options);
      
      // Cache report
      this.analyticsCache.set(`report:${reportType}:${negotiationId}`, report);

      return report;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  /**
   * Summary Report Generator
   */
  async generateSummaryReport(negotiationId, options = {}) {
    const conversation = await conversationManager.loadConversation(negotiationId);
    const insights = await this.generateInsights(negotiationId);

    return {
      reportType: 'summary',
      negotiationId,
      generatedAt: new Date(),
      
      overview: {
        status: conversation.status,
        duration: this.calculateDuration(conversation),
        messageCount: conversation.messages?.length || 0,
        currentRound: conversation.rounds,
        maxRounds: conversation.maxRounds
      },
      
      keyMetrics: {
        responseTime: insights.insights.performance?.efficiency?.averageResponseTime || 0,
        engagementLevel: insights.insights.performance?.engagement?.level || 0,
        sentimentScore: this.calculateOverallSentiment(insights.insights.sentiment),
        successProbability: insights.insights.prediction?.successProbability || 0
      },
      
      highlights: this.extractHighlights(insights),
      
      recommendations: this.consolidateRecommendations(insights),
      
      nextSteps: this.generateNextSteps(conversation, insights)
    };
  }

  /**
   * Detailed Report Generator
   */
  async generateDetailedReport(negotiationId, options = {}) {
    const conversation = await conversationManager.loadConversation(negotiationId);
    const insights = await this.generateInsights(negotiationId, ['sentiment', 'behavior', 'performance', 'prediction']);
    const messageHistory = await conversationManager.getMessageHistory(negotiationId, {
      limit: 1000,
      includeContext: true
    });

    return {
      reportType: 'detailed',
      negotiationId,
      generatedAt: new Date(),
      
      conversationOverview: {
        ...conversation,
        timeline: this.buildDetailedTimeline(messageHistory.messages),
        milestones: this.extractMilestones(messageHistory.messages)
      },
      
      detailedAnalysis: {
        sentiment: insights.insights.sentiment,
        behavior: insights.insights.behavior,
        performance: insights.insights.performance,
        prediction: insights.insights.prediction
      },
      
      participantProfiles: this.buildParticipantProfiles(messageHistory.messages),
      
      conversationFlow: this.analyzeConversationFlow(messageHistory.messages),
      
      criticalMoments: this.identifyCriticalMoments(messageHistory.messages),
      
      recommendations: {
        immediate: this.generateImmediateRecommendations(insights),
        strategic: this.generateStrategicRecommendations(insights),
        tactical: this.generateTacticalRecommendations(insights)
      }
    };
  }

  /**
   * Comparison Report Generator
   */
  async generateComparisonReport(negotiationIds, options = {}) {
    const comparisons = {
      reportType: 'comparison',
      negotiationIds,
      generatedAt: new Date(),
      comparisons: {}
    };

    const conversationData = [];
    
    // Gather data for all conversations
    for (const negotiationId of negotiationIds) {
      const conversation = await conversationManager.loadConversation(negotiationId);
      const insights = await this.generateInsights(negotiationId);
      
      conversationData.push({
        negotiationId,
        conversation,
        insights
      });
    }

    // Compare metrics
    comparisons.comparisons = {
      duration: this.compareDurations(conversationData),
      engagement: this.compareEngagement(conversationData),
      sentiment: this.compareSentiment(conversationData),
      success: this.compareSuccess(conversationData),
      efficiency: this.compareEfficiency(conversationData)
    };

    // Identify patterns
    comparisons.patterns = this.identifyComparativePatterns(conversationData);

    // Generate insights
    comparisons.insights = this.generateComparativeInsights(comparisons);

    return comparisons;
  }

  /**
   * Helper methods for analysis
   */
  async analyzeSentiment(text) {
    // Simplified sentiment analysis - in production, use a proper NLP service
    const positiveWords = ['good', 'great', 'excellent', 'perfect', 'love', 'amazing', 'wonderful', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'disgusting', 'worst'];
    
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });
    
    let label = 'neutral';
    if (score > 0) label = 'positive';
    if (score < 0) label = 'negative';
    
    return {
      label,
      score,
      confidence: Math.min(Math.abs(score) / words.length * 10, 1)
    };
  }

  analyzeCommunicationPatterns(messages) {
    const patterns = {
      messageFrequency: {},
      averageLength: {},
      timeOfDay: {},
      responseSpeed: {}
    };

    messages.forEach((message, index) => {
      const sender = message.sender;
      
      // Message frequency
      if (!patterns.messageFrequency[sender]) {
        patterns.messageFrequency[sender] = 0;
      }
      patterns.messageFrequency[sender]++;
      
      // Average length
      if (!patterns.averageLength[sender]) {
        patterns.averageLength[sender] = { total: 0, count: 0 };
      }
      patterns.averageLength[sender].total += message.content.length;
      patterns.averageLength[sender].count++;
      
      // Time of day
      const hour = new Date(message.timestamp).getHours();
      if (!patterns.timeOfDay[sender]) {
        patterns.timeOfDay[sender] = {};
      }
      patterns.timeOfDay[sender][hour] = (patterns.timeOfDay[sender][hour] || 0) + 1;
      
      // Response speed
      if (index > 0 && messages[index - 1].sender !== sender) {
        const responseTime = new Date(message.timestamp) - new Date(messages[index - 1].timestamp);
        if (!patterns.responseSpeed[sender]) {
          patterns.responseSpeed[sender] = [];
        }
        patterns.responseSpeed[sender].push(responseTime);
      }
    });

    // Calculate averages
    Object.keys(patterns.averageLength).forEach(sender => {
      const data = patterns.averageLength[sender];
      patterns.averageLength[sender] = data.total / data.count;
    });

    Object.keys(patterns.responseSpeed).forEach(sender => {
      const times = patterns.responseSpeed[sender];
      patterns.responseSpeed[sender] = times.reduce((a, b) => a + b, 0) / times.length;
    });

    return patterns;
  }

  analyzeNegotiationStyle(messages) {
    const styles = {};
    
    messages.forEach(message => {
      const sender = message.sender;
      if (!styles[sender]) {
        styles[sender] = {
          assertiveness: 0,
          cooperation: 0,
          flexibility: 0,
          directness: 0
        };
      }
      
      // Analyze message content for style indicators
      const content = message.content.toLowerCase();
      
      // Assertiveness indicators
      if (content.includes('must') || content.includes('need') || content.includes('require')) {
        styles[sender].assertiveness += 1;
      }
      
      // Cooperation indicators
      if (content.includes('we') || content.includes('together') || content.includes('understand')) {
        styles[sender].cooperation += 1;
      }
      
      // Flexibility indicators
      if (content.includes('maybe') || content.includes('consider') || content.includes('flexible')) {
        styles[sender].flexibility += 1;
      }
      
      // Directness indicators
      if (message.offer || content.includes('price') || content.includes('$')) {
        styles[sender].directness += 1;
      }
    });

    return styles;
  }

  analyzeResponsePatterns(messages) {
    const patterns = {
      turnTaking: [],
      responseTypes: {},
      escalation: []
    };

    for (let i = 0; i < messages.length - 1; i++) {
      const current = messages[i];
      const next = messages[i + 1];
      
      // Turn taking analysis
      if (current.sender !== next.sender) {
        patterns.turnTaking.push({
          from: current.sender,
          to: next.sender,
          responseTime: new Date(next.timestamp) - new Date(current.timestamp)
        });
      }
      
      // Response type analysis
      if (current.offer && next.sender !== current.sender) {
        const responseType = next.offer ? 'counter_offer' : 'discussion';
        if (!patterns.responseTypes[responseType]) {
          patterns.responseTypes[responseType] = 0;
        }
        patterns.responseTypes[responseType]++;
      }
    }

    return patterns;
  }

  analyzeOfferBehavior(messages) {
    const offerMessages = messages.filter(msg => msg.offer);
    
    return {
      offerCount: offerMessages.length,
      offerProgression: offerMessages.map(msg => ({
        timestamp: msg.timestamp,
        sender: msg.sender,
        amount: msg.offer.amount
      })),
      offerStrategy: this.analyzeOfferStrategy(offerMessages),
      priceMovement: this.analyzePriceMovement(offerMessages)
    };
  }

  analyzeOfferStrategy(offerMessages) {
    const strategies = {
      aggressive: 0,
      moderate: 0,
      conservative: 0
    };

    offerMessages.forEach((offer, index) => {
      if (index === 0) return; // Skip first offer
      
      const previous = offerMessages[index - 1];
      const change = Math.abs(offer.offer.amount - previous.offer.amount);
      const percentChange = change / previous.offer.amount;
      
      if (percentChange > 0.1) strategies.aggressive++;
      else if (percentChange > 0.05) strategies.moderate++;
      else strategies.conservative++;
    });

    return strategies;
  }

  analyzePriceMovement(offerMessages) {
    if (offerMessages.length < 2) return { direction: 'stable', trend: 'none' };
    
    const prices = offerMessages.map(msg => msg.offer.amount);
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    
    return {
      direction: lastPrice > firstPrice ? 'up' : lastPrice < firstPrice ? 'down' : 'stable',
      magnitude: Math.abs(lastPrice - firstPrice),
      percentChange: ((lastPrice - firstPrice) / firstPrice) * 100,
      trend: this.calculateTrend(prices)
    };
  }

  calculateTrend(prices) {
    if (prices.length < 3) return 'insufficient_data';
    
    let increases = 0;
    let decreases = 0;
    
    for (let i = 1; i < prices.length; i++) {
      if (prices[i] > prices[i - 1]) increases++;
      else if (prices[i] < prices[i - 1]) decreases++;
    }
    
    if (increases > decreases) return 'increasing';
    if (decreases > increases) return 'decreasing';
    return 'fluctuating';
  }

  analyzeEfficiency(conversation, messages) {
    return {
      messagesPerRound: messages.length / conversation.rounds,
      averageResponseTime: this.calculateAverageResponseTime(messages),
      offerEfficiency: this.calculateOfferEfficiency(messages),
      progressRate: conversation.rounds / this.calculateDuration(conversation)
    };
  }

  analyzeEngagement(messages) {
    return {
      level: Math.min(messages.length / 20, 1), // Normalized engagement level
      consistency: this.calculateEngagementConsistency(messages),
      participantBalance: this.calculateParticipantBalance(messages)
    };
  }

  analyzeProgression(conversation, messages) {
    return {
      currentProgress: conversation.rounds / conversation.maxRounds,
      milestones: this.extractMilestones(messages),
      stagnationPoints: this.identifyStagnationPoints(messages),
      accelerationPoints: this.identifyAccelerationPoints(messages)
    };
  }

  // Additional helper methods would continue here...
  // For brevity, I'm including placeholder implementations

  calculateSuccessProbability(conversation, messages) {
    // Simplified calculation - in production, use ML models
    let probability = 0.5; // Base probability
    
    // Adjust based on engagement
    const engagement = this.analyzeEngagement(messages);
    probability += engagement.level * 0.3;
    
    // Adjust based on progression
    if (conversation.rounds > 1) probability += 0.2;
    
    // Adjust based on recent activity
    const recentMessages = messages.slice(-5);
    if (recentMessages.some(msg => msg.offer)) probability += 0.2;
    
    return Math.min(probability, 1);
  }

  estimateCompletionTime(messages) {
    if (messages.length < 2) return null;
    
    const averageGap = this.calculateAverageResponseTime(messages);
    const estimatedRemainingMessages = 5; // Rough estimate
    
    return averageGap * estimatedRemainingMessages;
  }

  analyzePriceConvergence(messages) {
    const offerMessages = messages.filter(msg => msg.offer);
    if (offerMessages.length < 2) return { converging: false };
    
    const prices = offerMessages.map(msg => msg.offer.amount);
    const recentPrices = prices.slice(-4); // Last 4 offers
    
    if (recentPrices.length < 2) return { converging: false };
    
    const priceRange = Math.max(...recentPrices) - Math.min(...recentPrices);
    const initialRange = Math.max(...prices.slice(0, 2)) - Math.min(...prices.slice(0, 2));
    
    return {
      converging: priceRange < initialRange,
      convergenceRate: initialRange > 0 ? (initialRange - priceRange) / initialRange : 0,
      estimatedConvergencePrice: recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length
    };
  }

  identifyRiskFactors(conversation, messages) {
    const risks = [];
    
    // High round count
    if (conversation.rounds > conversation.maxRounds * 0.8) {
      risks.push({
        type: 'high_round_count',
        severity: 'medium',
        description: 'Approaching maximum rounds'
      });
    }
    
    // Long periods of inactivity
    const lastMessage = messages[messages.length - 1];
    if (lastMessage) {
      const inactiveTime = Date.now() - new Date(lastMessage.timestamp).getTime();
      if (inactiveTime > 24 * 60 * 60 * 1000) {
        risks.push({
          type: 'inactivity',
          severity: 'high',
          description: 'Long period of inactivity'
        });
      }
    }
    
    return risks;
  }

  identifyOpportunities(conversation, messages) {
    const opportunities = [];
    
    // Recent engagement
    const recentMessages = messages.slice(-5);
    if (recentMessages.length >= 3) {
      opportunities.push({
        type: 'active_engagement',
        description: 'High recent activity suggests motivated participants'
      });
    }
    
    // Price convergence
    const convergence = this.analyzePriceConvergence(messages);
    if (convergence.converging) {
      opportunities.push({
        type: 'price_convergence',
        description: 'Prices are converging, deal may be close'
      });
    }
    
    return opportunities;
  }

  // Placeholder implementations for remaining methods
  generateSentimentRecommendations(sentimentData) {
    return ['Monitor negative sentiment triggers', 'Encourage positive communication'];
  }

  generateBehaviorRecommendations(behaviorData) {
    return ['Improve response time', 'Consider more flexible approaches'];
  }

  suggestOptimizations(performanceData) {
    return ['Streamline communication', 'Focus on key decision points'];
  }

  generatePredictionRecommendations(predictionData) {
    return ['Address identified risk factors', 'Capitalize on opportunities'];
  }

  calculateDuration(conversation) {
    const start = new Date(conversation.createdAt);
    const end = conversation.completedAt ? new Date(conversation.completedAt) : new Date();
    return end - start;
  }

  calculateOverallSentiment(sentimentData) {
    if (!sentimentData?.overall) return 0;
    const total = sentimentData.overall.positive + sentimentData.overall.neutral + sentimentData.overall.negative;
    return total > 0 ? (sentimentData.overall.positive - sentimentData.overall.negative) / total : 0;
  }

  extractHighlights(insights) {
    return ['Active engagement', 'Positive sentiment trend', 'Price convergence detected'];
  }

  consolidateRecommendations(insights) {
    const recommendations = [];
    Object.values(insights.insights).forEach(insight => {
      if (insight.recommendations) {
        recommendations.push(...insight.recommendations);
      }
    });
    return recommendations;
  }

  generateNextSteps(conversation, insights) {
    return ['Review current offers', 'Continue active engagement', 'Consider final terms'];
  }

  buildDetailedTimeline(messages) {
    return messages.map(msg => ({
      timestamp: msg.timestamp,
      event: msg.type,
      sender: msg.sender,
      content: msg.content.substring(0, 100),
      offer: msg.offer
    }));
  }

  extractMilestones(messages) {
    return messages
      .filter(msg => msg.offer || msg.type === 'acceptance')
      .map(msg => ({
        timestamp: msg.timestamp,
        type: 'milestone',
        description: msg.offer ? `Offer of $${msg.offer.amount}` : msg.type
      }));
  }

  buildParticipantProfiles(messages) {
    const profiles = {};
    const participants = [...new Set(messages.map(msg => msg.sender))];
    
    participants.forEach(participant => {
      const participantMessages = messages.filter(msg => msg.sender === participant);
      profiles[participant] = {
        messageCount: participantMessages.length,
        averageLength: participantMessages.reduce((sum, msg) => sum + msg.content.length, 0) / participantMessages.length,
        offerCount: participantMessages.filter(msg => msg.offer).length,
        engagementLevel: participantMessages.length / messages.length
      };
    });
    
    return profiles;
  }

  analyzeConversationFlow(messages) {
    return {
      phases: this.identifyConversationPhases(messages),
      turningPoints: this.identifyTurningPoints(messages),
      momentum: this.calculateMomentum(messages)
    };
  }

  identifyCriticalMoments(messages) {
    return messages
      .filter((msg, index) => {
        // Critical moments: first offer, acceptance, major price changes
        if (msg.offer && index === 0) return true;
        if (msg.type === 'acceptance') return true;
        if (msg.offer && index > 0) {
          const prevOffer = messages.slice(0, index).reverse().find(m => m.offer);
          if (prevOffer) {
            const change = Math.abs(msg.offer.amount - prevOffer.offer.amount) / prevOffer.offer.amount;
            if (change > 0.1) return true; // 10% change
          }
        }
        return false;
      })
      .map(msg => ({
        timestamp: msg.timestamp,
        type: 'critical_moment',
        description: this.describeCriticalMoment(msg),
        impact: 'high'
      }));
  }

  generateImmediateRecommendations(insights) {
    return ['Respond promptly to recent messages', 'Consider the current offer carefully'];
  }

  generateStrategicRecommendations(insights) {
    return ['Develop long-term negotiation strategy', 'Focus on building rapport'];
  }

  generateTacticalRecommendations(insights) {
    return ['Use specific price points', 'Reference market conditions'];
  }

  // Additional placeholder methods for comparison reports
  compareDurations(conversationData) {
    return conversationData.map(data => ({
      negotiationId: data.negotiationId,
      duration: this.calculateDuration(data.conversation)
    }));
  }

  compareEngagement(conversationData) {
    return conversationData.map(data => ({
      negotiationId: data.negotiationId,
      engagement: data.insights.insights.performance?.engagement?.level || 0
    }));
  }

  compareSentiment(conversationData) {
    return conversationData.map(data => ({
      negotiationId: data.negotiationId,
      sentiment: this.calculateOverallSentiment(data.insights.insights.sentiment)
    }));
  }

  compareSuccess(conversationData) {
    return conversationData.map(data => ({
      negotiationId: data.negotiationId,
      successProbability: data.insights.insights.prediction?.successProbability || 0
    }));
  }

  compareEfficiency(conversationData) {
    return conversationData.map(data => ({
      negotiationId: data.negotiationId,
      efficiency: data.insights.insights.performance?.efficiency || {}
    }));
  }

  identifyComparativePatterns(conversationData) {
    return {
      commonSuccessFactors: ['Active engagement', 'Quick responses'],
      riskPatterns: ['Long delays', 'Negative sentiment'],
      bestPractices: ['Regular communication', 'Fair pricing']
    };
  }

  generateComparativeInsights(comparisons) {
    return {
      topPerformers: 'Negotiations with highest engagement',
      improvementAreas: 'Response time optimization',
      patterns: 'Successful negotiations show consistent engagement'
    };
  }

  // Additional helper methods
  calculateAverageResponseTime(messages) {
    if (messages.length < 2) return 0;
    
    let totalTime = 0;
    let responseCount = 0;
    
    for (let i = 1; i < messages.length; i++) {
      if (messages[i].sender !== messages[i-1].sender) {
        totalTime += new Date(messages[i].timestamp) - new Date(messages[i-1].timestamp);
        responseCount++;
      }
    }
    
    return responseCount > 0 ? totalTime / responseCount : 0;
  }

  calculateOfferEfficiency(messages) {
    const offerMessages = messages.filter(msg => msg.offer);
    return offerMessages.length > 0 ? messages.length / offerMessages.length : 0;
  }

  calculateEngagementConsistency(messages) {
    // Simplified consistency calculation
    return 0.8; // Placeholder
  }

  calculateParticipantBalance(messages) {
    const senderCounts = {};
    messages.forEach(msg => {
      senderCounts[msg.sender] = (senderCounts[msg.sender] || 0) + 1;
    });
    
    const counts = Object.values(senderCounts);
    const max = Math.max(...counts);
    const min = Math.min(...counts);
    
    return max > 0 ? min / max : 1;
  }

  identifyStagnationPoints(messages) {
    // Identify periods of low activity or repetitive exchanges
    return [];
  }

  identifyAccelerationPoints(messages) {
    // Identify periods of increased activity or progress
    return [];
  }

  identifyConversationPhases(messages) {
    return [
      { phase: 'initiation', start: 0, end: Math.min(5, messages.length) },
      { phase: 'negotiation', start: 5, end: Math.max(5, messages.length - 3) },
      { phase: 'conclusion', start: Math.max(5, messages.length - 3), end: messages.length }
    ];
  }

  identifyTurningPoints(messages) {
    return messages
      .filter((msg, index) => msg.offer && index > 0)
      .map(msg => ({
        timestamp: msg.timestamp,
        type: 'turning_point',
        description: `New offer: $${msg.offer.amount}`
      }));
  }

  calculateMomentum(messages) {
    const recentMessages = messages.slice(-10);
    const timeSpan = recentMessages.length > 1 ? 
      new Date(recentMessages[recentMessages.length - 1].timestamp) - new Date(recentMessages[0].timestamp) : 0;
    
    return timeSpan > 0 ? recentMessages.length / (timeSpan / 3600000) : 0; // messages per hour
  }

  describeCriticalMoment(msg) {
    if (msg.offer) return `Offer of $${msg.offer.amount} made`;
    if (msg.type === 'acceptance') return 'Offer accepted';
    return 'Critical moment identified';
  }
}

module.exports = new ConversationAnalytics();
