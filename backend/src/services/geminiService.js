const { generateContent, healthCheck, getRateLimitStatus } = require('../config/gemini');
const { geminiAnalytics, trackRequest } = require('../utils/geminiAnalytics');
const { PromptTemplates, TemplateUtils } = require('../utils/promptTemplates');
const responseProcessor = require('../utils/responseProcessor');
const contextManager = require('../utils/contextManager');

class GeminiService {
  constructor() {
    // Enhanced prompt templates with better structure
    this.promptTemplates = {
      negotiation: {
        base: PromptTemplates.negotiation.counter_offer,
        initial: PromptTemplates.negotiation.initial,
        final: PromptTemplates.negotiation.final_round,
        urgent: PromptTemplates.negotiation.urgent_sale
      },

      productDescription: `Enhance this product description to make it more appealing and informative:

CURRENT DESCRIPTION:
\{description}

PRODUCT DETAILS:
- Title: \{title}
- Category: \{category}
- Condition: \{condition}
- Price: $\{price}

Please provide:
1. Enhanced description (2-3 paragraphs)
2. Key selling points (3-5 bullet points)
3. Suggested improvements for listing

Keep it natural, honest, and appealing to potential buyers.`,

      insights: `Analyze this negotiation and provide strategic insights:

NEGOTIATION DATA:
- Product: \{productTitle}
- Base Price: $\{basePrice}
- Current Offer: $\{currentOffer}
- Rounds: \{rounds}/\{maxRounds}
- Status: \{status}

CONVERSATION SUMMARY:
\{conversationSummary}

Provide:
1. Negotiation assessment (going well, challenging, etc.)
2. Buyer behavior analysis
3. Recommended next steps
4. Price recommendations
5. Success probability estimate

Be analytical and strategic in your response.`
    };

    // Context preservation for better conversation memory
    this.conversationContexts = new Map();
    this.maxContextAge = 24 * 60 * 60 * 1000; // 24 hours
    
    // Response validation schemas
    this.responseSchemas = {
      negotiation: {
        required: ['content', 'action', 'confidence'],
        optional: ['offer', 'reasoning', 'metadata'],
        actions: ['accept', 'reject', 'counter', 'continue']
      }
    };

    // Safety filters for response sanitization
    this.safetyFilters = {
      profanity: /\b(badword1|badword2)\b/gi, // Add actual profanity words
      personalInfo: /\b\d{3}-\d{2}-\d{4}\b|\b\d{3}-\d{3}-\d{4}\b/g, // SSN, Phone patterns
      inappropriateContent: /\b(spam|scam|fake|counterfeit)\b/gi
    };

    // Start context cleanup interval
    this.startContextCleanup();
  }

  // Day 12 Enhancement: Advanced negotiation response generation
  async generateNegotiationResponse(context) {
    const startTime = Date.now();
    
    try {
      // Day 12 Enhancement: Use advanced template selection
      const scenario = TemplateUtils.detectAdvancedScenario(context);
      const templatePath = TemplateUtils.selectOptimalTemplate(context);
      
      // Enhanced context generation with market intelligence
      const enrichedContext = TemplateUtils.enrichContext(context);
      
      // Generate sophisticated prompt using advanced templates
      const prompt = TemplateUtils.processAdvancedTemplate(templatePath, enrichedContext);
      
      // Get AI response
      const response = await generateContent(prompt, {
        userId: context.userId || 'anonymous',
        timeout: 15000,
        retries: 2
      });

      // Day 12 Enhancement: Use advanced response processing
      const processedResult = await responseProcessor.processResponse(response, enrichedContext, {
        useAdvancedAnalysis: true,
        includeMarketFactors: true,
        enablePsychologicalAnalysis: true
      });

      // Store conversation context with enhanced analytics
      if (context.negotiationId) {
        contextManager.addMessage(context.negotiationId, {
          content: response,
          sender: 'ai',
          action: processedResult.data.action,
          offer: processedResult.data.offer,
          confidence: processedResult.data.confidence / 100,
          reasoning: processedResult.data.reasoning,
          templateUsed: templatePath,
          scenario: scenario
        });
      }
      
      // Track successful request with enhanced metrics
      const responseTime = Date.now() - startTime;
      geminiAnalytics.recordRequest('negotiation', responseTime, true, null, {
        scenario: scenario,
        templatePath: templatePath,
        marketStrength: enrichedContext.marketStrength,
        confidence: processedResult.data.confidence
      });
      
      return processedResult.data;
    } catch (error) {
      console.error('Error generating negotiation response:', error);
      
      // Track failed request
      const responseTime = Date.now() - startTime;
      geminiAnalytics.recordRequest('negotiation', responseTime, false, error);
      
      return this.getFallbackResponse(context);
    }
  }

  // Build the negotiation prompt with personality and context
  buildNegotiationPrompt(context) {
    const {
      productTitle,
      basePrice,
      minPrice,
      currentOffer,
      rounds,
      maxRounds,
      urgency = 'medium',
      conversationHistory = [],
      userMessage,
      personality = 'professional'
    } = context;

    // Calculate metrics
    const discountPercentage = ((basePrice - currentOffer) / basePrice * 100).toFixed(1);
    const progressPercentage = ((rounds / maxRounds) * 100).toFixed(1);

    // Format conversation history
    const formattedHistory = conversationHistory.slice(-5).map(msg => 
      `${msg.sender}: ${msg.content}${msg.offer ? ` (Offer: $${msg.offer.amount})` : ''}`
    ).join('\n') || 'No previous messages';

    // Build prompt with template
    let prompt = this.promptTemplates.negotiation.base
      .replace(/\{productTitle\}/g, productTitle)
      .replace(/\{basePrice\}/g, basePrice)
      .replace(/\{minPrice\}/g, minPrice)
      .replace(/\{currentOffer\}/g, currentOffer)
      .replace(/\{discountPercentage\}/g, discountPercentage)
      .replace(/\{rounds\}/g, rounds)
      .replace(/\{maxRounds\}/g, maxRounds)
      .replace(/\{progressPercentage\}/g, progressPercentage)
      .replace(/\{urgency\}/g, urgency)
      .replace(/\{personality\}/g, personality)
      .replace(/\{conversationHistory\}/g, formattedHistory)
      .replace(/\{userMessage\}/g, userMessage || 'Starting negotiation');

    return prompt;
  }

  // Enhanced response processing with better validation
  parseNegotiationResponse(response, context) {
    const { basePrice, minPrice, currentOffer, negotiationId } = context;

    // Default response structure with enhanced validation
    const result = {
      content: response.trim(),
      action: 'continue',
      offer: null,
      confidence: 0.7,
      reasoning: '',
      metadata: {
        model: 'gemini-pro',
        promptId: Date.now().toString(),
        processingTime: Date.now(),
        tokensUsed: response.length,
        originalResponse: response,
        validationStatus: 'pending'
      }
    };

    try {
      // Enhanced content sanitization
      const sanitizedResponse = this.sanitizeResponse(response);
      const cleanResponse = sanitizedResponse.trim();
      const upperResponse = cleanResponse.toUpperCase();
      
      // Advanced action detection with confidence scoring
      const actionAnalysis = this.analyzeResponseAction(cleanResponse, context);
      result.action = actionAnalysis.action;
      result.confidence = actionAnalysis.confidence;
      result.reasoning = actionAnalysis.reasoning;

      // Enhanced price extraction with validation
      if (result.action === 'counter') {
        const offerAnalysis = this.extractAndValidateOffer(cleanResponse, context);
        result.offer = offerAnalysis.offer;
        result.confidence = Math.min(result.confidence, offerAnalysis.confidence);
      } else if (result.action === 'accept') {
        result.offer = { amount: currentOffer, final: true };
        result.confidence = 0.9;
      }

      // Enhanced content cleaning with context preservation
      result.content = this.cleanResponseContent(cleanResponse, context);
      
      // Validate response structure
      const validation = this.validateResponse(result);
      result.metadata.validationStatus = validation.isValid ? 'valid' : 'invalid';
      result.metadata.validationErrors = validation.errors;

      // Store context for future use
      this.storeConversationContext(negotiationId, result, context);

    } catch (error) {
      console.error('Error parsing negotiation response:', error);
      result.confidence = 0.3;
      result.metadata.validationStatus = 'error';
      result.metadata.parsingError = error.message;
    }

    return result;
  }

  // Advanced action analysis with context awareness
  analyzeResponseAction(response, context) {
    const { rounds, maxRounds, currentOffer, minPrice, basePrice } = context;
    const upperResponse = response.toUpperCase();
    
    let action = 'continue';
    let confidence = 0.5;
    let reasoning = '';

    // Explicit action keywords with confidence weights
    const actionPatterns = {
      accept: {
        patterns: [/\bACCEPT\b/i, /\bAGREE\b/i, /\bDEAL\b/i, /\bSOLD\b/i],
        confidence: 0.9
      },
      reject: {
        patterns: [/\bREJECT\b/i, /\bDECLINE\b/i, /\bNO DEAL\b/i, /\bTOO LOW\b/i],
        confidence: 0.8
      },
      counter: {
        patterns: [/\bCOUNTER\b/i, /\bOFFER\b/i, /\$\d+/i, /\bMEET IN THE MIDDLE\b/i],
        confidence: 0.7
      }
    };

    // Check for explicit action patterns
    for (const [actionType, config] of Object.entries(actionPatterns)) {
      for (const pattern of config.patterns) {
        if (pattern.test(response)) {
          action = actionType;
          confidence = config.confidence;
          reasoning = `Detected explicit ${actionType} signal in response`;
          break;
        }
      }
      if (action !== 'continue') break;
    }

    // Context-based action inference if no explicit action found
    if (action === 'continue') {
      const contextAnalysis = this.inferActionFromContext(response, context);
      action = contextAnalysis.action;
      confidence = contextAnalysis.confidence;
      reasoning = contextAnalysis.reasoning;
    }

    return { action, confidence, reasoning };
  }

  // Context-based action inference
  inferActionFromContext(response, context) {
    const { rounds, maxRounds, currentOffer, minPrice, basePrice } = context;
    
    // Final round logic
    if (rounds >= maxRounds) {
      if (currentOffer >= minPrice) {
        return {
          action: 'accept',
          confidence: 0.8,
          reasoning: 'Final round with acceptable offer'
        };
      } else {
        return {
          action: 'reject',
          confidence: 0.7,
          reasoning: 'Final round with unacceptable offer'
        };
      }
    }

    // Offer quality analysis
    const offerQuality = (currentOffer / basePrice);
    
    if (offerQuality >= 0.9) {
      return {
        action: 'accept',
        confidence: 0.8,
        reasoning: 'High-quality offer (90%+ of base price)'
      };
    } else if (offerQuality >= 0.7) {
      return {
        action: 'counter',
        confidence: 0.7,
        reasoning: 'Good offer deserving negotiation'
      };
    } else if (currentOffer < minPrice) {
      return {
        action: 'reject',
        confidence: 0.6,
        reasoning: 'Offer below minimum acceptable price'
      };
    }

    return {
      action: 'continue',
      confidence: 0.5,
      reasoning: 'Standard negotiation continuation'
    };
  }

  // Enhanced price extraction with multiple validation layers
  extractAndValidateOffer(response, context) {
    const { basePrice, minPrice, currentOffer } = context;
    
    // Multiple price extraction patterns
    const pricePatterns = [
      /\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
      /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?) dollars?/gi,
      /price of (\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi
    ];

    const extractedPrices = [];
    
    for (const pattern of pricePatterns) {
      let match;
      while ((match = pattern.exec(response)) !== null) {
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(price) && price > 0) {
          extractedPrices.push(price);
        }
      }
    }

    // Price validation and selection
    if (extractedPrices.length === 0) {
      // No prices found, calculate strategic counter-offer
      return {
        offer: {
          amount: this.calculateStrategicCounterOffer(currentOffer, basePrice, minPrice),
          final: false,
          source: 'calculated'
        },
        confidence: 0.5
      };
    }

    // Select most appropriate price
    const validPrices = extractedPrices.filter(price => 
      price >= minPrice * 0.8 && price <= basePrice * 1.1
    );

    if (validPrices.length > 0) {
      // Use the most reasonable price (closest to expected range)
      const selectedPrice = validPrices.sort((a, b) => 
        Math.abs(a - (basePrice + currentOffer) / 2) - 
        Math.abs(b - (basePrice + currentOffer) / 2)
      )[0];

      return {
        offer: {
          amount: Math.round(selectedPrice),
          final: false,
          source: 'extracted'
        },
        confidence: 0.8
      };
    }

    // Fallback to strategic calculation
    return {
      offer: {
        amount: this.calculateStrategicCounterOffer(currentOffer, basePrice, minPrice),
        final: false,
        source: 'fallback'
      },
      confidence: 0.6
    };
  }

  // Strategic offer calculation
  calculateStrategicOffer(currentOffer, basePrice, minPrice) {
    const gap = basePrice - currentOffer;
    const minGap = basePrice - minPrice;
    
    if (currentOffer >= minPrice * 1.1) {
      // Close the gap by 40%
      return Math.round(currentOffer + (gap * 0.4));
    } else if (currentOffer >= minPrice) {
      // Close the gap by 60%
      return Math.round(currentOffer + (gap * 0.6));
    } else {
      // Offer minimum plus 30% of the gap
      return Math.round(minPrice + (minGap * 0.3));
    }
  }

  // Calculate strategic counter-offer (compatibility method)
  calculateStrategicCounterOffer(currentOffer, basePrice, minPrice) {
    return this.calculateStrategicOffer(currentOffer, basePrice, minPrice);
  }

  // Enhanced response sanitization with safety filters
  sanitizeResponse(response) {
    let sanitized = response;

    // Apply safety filters
    for (const [filterName, pattern] of Object.entries(this.safetyFilters)) {
      sanitized = sanitized.replace(pattern, '[FILTERED]');
    }

    // Remove excessive whitespace and normalize
    sanitized = sanitized
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\$\.,!?;:()-]/g, '')
      .trim();

    // Ensure response length is reasonable
    if (sanitized.length > 500) {
      sanitized = sanitized.substring(0, 497) + '...';
    }

    return sanitized;
  }

  // Enhanced response validation
  validateResponse(response) {
    const errors = [];
    const schema = this.responseSchemas.negotiation;

    // Check required fields
    for (const field of schema.required) {
      if (!(field in response) || response[field] === null || response[field] === undefined) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate action
    if (response.action && !schema.actions.includes(response.action)) {
      errors.push(`Invalid action: ${response.action}`);
    }

    // Validate confidence score
    if (response.confidence && (response.confidence < 0 || response.confidence > 1)) {
      errors.push(`Invalid confidence score: ${response.confidence}`);
    }

    // Validate offer structure
    if (response.offer) {
      if (typeof response.offer.amount !== 'number' || response.offer.amount <= 0) {
        errors.push('Invalid offer amount');
      }
      if (typeof response.offer.final !== 'boolean') {
        errors.push('Invalid offer final flag');
      }
    }

    // Validate content length
    if (response.content && (response.content.length === 0 || response.content.length > 500)) {
      errors.push('Invalid content length');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Context preservation system
  storeConversationContext(negotiationId, response, inputContext) {
    if (!negotiationId) return;

    const contextKey = `nego_${negotiationId}`;
    const existingContext = this.conversationContexts.get(contextKey) || {
      negotiationId,
      startTime: Date.now(),
      messages: [],
      patterns: {},
      analytics: {
        averageConfidence: 0,
        actionCounts: {},
        priceProgression: []
      }
    };

    // Add current response to context
    existingContext.messages.push({
      timestamp: Date.now(),
      response: {
        content: response.content,
        action: response.action,
        confidence: response.confidence,
        offer: response.offer
      },
      inputContext: {
        currentOffer: inputContext.currentOffer,
        rounds: inputContext.rounds,
        userMessage: inputContext.userMessage
      }
    });

    // Update analytics
    this.updateContextAnalytics(existingContext, response);

    // Store updated context
    this.conversationContexts.set(contextKey, existingContext);
  }

  // Update context analytics
  updateContextAnalytics(context, response) {
    const analytics = context.analytics;
    
    // Update confidence average
    const confidenceSum = context.messages.reduce((sum, msg) => sum + msg.response.confidence, 0);
    analytics.averageConfidence = confidenceSum / context.messages.length;

    // Update action counts
    analytics.actionCounts[response.action] = (analytics.actionCounts[response.action] || 0) + 1;

    // Update price progression
    if (response.offer) {
      analytics.priceProgression.push({
        round: context.messages.length,
        amount: response.offer.amount,
        timestamp: Date.now()
      });
    }
  }

  // Get conversation context for analysis
  getConversationContext(negotiationId) {
    const contextKey = `nego_${negotiationId}`;
    return this.conversationContexts.get(contextKey);
  }

  // Context cleanup to prevent memory leaks
  startContextCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, context] of this.conversationContexts.entries()) {
        if (now - context.startTime > this.maxContextAge) {
          this.conversationContexts.delete(key);
        }
      }
    }, 60 * 60 * 1000); // Clean every hour
  }

  // Fallback response when AI fails
  getFallbackResponse(context) {
    const { currentOffer, basePrice, minPrice, personality = 'professional' } = context;
    
    const personalityResponses = {
      friendly: [
        "Thanks for your offer! Let me think about this and get back to you soon. 😊",
        "I appreciate your interest! Give me a moment to consider your proposal.",
        "That's an interesting offer! Let me review it carefully."
      ],
      professional: [
        "Thank you for your offer. I will review it and respond shortly.",
        "I have received your proposal and will provide a response momentarily.",
        "Your offer is under consideration. Please allow me a moment to respond."
      ],
      firm: [
        "I need to consider your offer carefully given my pricing.",
        "Let me review your proposal against my minimum requirements.",
        "I'll evaluate your offer and respond accordingly."
      ],
      flexible: [
        "Thanks for the offer! I'm sure we can work something out.",
        "I appreciate your proposal. Let me see what we can do.",
        "Interesting offer! I'm open to finding a middle ground."
      ]
    };

    const responses = personalityResponses[personality] || personalityResponses.professional;
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    // Simple logic for fallback action
    let action = 'continue';
    let offer = null;

    if (currentOffer >= minPrice * 1.1) {
      action = 'counter';
      offer = { 
        amount: this.calculateStrategicCounterOffer(currentOffer, basePrice, minPrice),
        final: false 
      };
    } else if (currentOffer < minPrice * 0.8) {
      action = 'reject';
    }

    return {
      content: randomResponse,
      action,
      offer,
      confidence: 0.4,
      reasoning: 'Fallback response due to AI service unavailability',
      metadata: {
        model: 'fallback',
        promptId: Date.now().toString(),
        processingTime: Date.now(),
        isFallback: true
      }
    };
  }

  // Health check for the service
  async checkHealth() {
    try {
      const health = await healthCheck();
      const analytics = geminiAnalytics.getMetrics();
      
      return {
        ...health,
        service: 'GeminiService',
        timestamp: new Date().toISOString(),
        analytics: {
          totalRequests: analytics.totalRequests,
          successRate: analytics.successRate,
          averageResponseTime: analytics.averageResponseTime,
          cacheHitRate: (analytics.cacheHitRate * 100).toFixed(1) + '%'
        },
        insights: geminiAnalytics.getPerformanceInsights()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        service: 'GeminiService',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get rate limit status for user
  getRateLimitInfo(userId) {
    return getRateLimitStatus(userId);
  }

  // Get analytics dashboard data
  getAnalyticsDashboard() {
    return {
      metrics: geminiAnalytics.getMetrics(),
      insights: geminiAnalytics.getPerformanceInsights(),
      dailyReport: geminiAnalytics.generateDailyReport()
    };
  }

  // Export analytics data
  async exportAnalytics(filename) {
    return await geminiAnalytics.exportMetrics(filename);
  }
}

module.exports = new GeminiService();
