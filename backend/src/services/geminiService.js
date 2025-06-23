const { generateContent, healthCheck, getRateLimitStatus } = require('../config/gemini');
const { geminiAnalytics, trackRequest } = require('../utils/geminiAnalytics');
const { PromptTemplates, TemplateUtils } = require('../utils/promptTemplates');

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
  }

  // Generate negotiation response with enhanced tracking
  async generateNegotiationResponse(context) {
    const startTime = Date.now();
    
    try {
      // Use enhanced prompt templates
      const scenario = TemplateUtils.detectScenario(context);
      const enhancedContext = TemplateUtils.generateContextData(context);
      const template = TemplateUtils.getTemplate(scenario, context.personality, context.category);
      
      const prompt = TemplateUtils.replacePlaceholders(template, enhancedContext);
      
      const response = await generateContent(prompt, {
        userId: context.userId || 'anonymous',
        timeout: 15000,
        retries: 2
      });

      const result = this.parseNegotiationResponse(response, context);
      
      // Track successful request
      const responseTime = Date.now() - startTime;
      geminiAnalytics.recordRequest('negotiation', responseTime, true);
      
      return result;
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

  // Parse AI response and extract structured data
  parseNegotiationResponse(response, context) {
    const { basePrice, minPrice, currentOffer } = context;

    // Default response structure
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
        originalResponse: response
      }
    };

    try {
      // Clean the response
      const cleanResponse = response.trim();
      const upperResponse = cleanResponse.toUpperCase();
      
      // Extract action from response
      if (upperResponse.includes('ACCEPT')) {
        result.action = 'accept';
        result.offer = { amount: currentOffer, final: true };
        result.confidence = 0.9;
      } else if (upperResponse.includes('REJECT')) {
        result.action = 'reject';
        result.confidence = 0.8;
      } else if (upperResponse.includes('COUNTER')) {
        result.action = 'counter';
        
        // Extract counter-offer amount
        const priceMatches = cleanResponse.match(/\$[\d,]+(?:\.\d{2})?/g);
        if (priceMatches && priceMatches.length > 0) {
          // Get the last price mentioned (likely the counter-offer)
          const lastPrice = priceMatches[priceMatches.length - 1];
          const amount = parseFloat(lastPrice.replace(/[$,]/g, ''));
          
          if (amount >= minPrice && amount <= basePrice) {
            result.offer = { amount, final: false };
            result.confidence = 0.8;
          } else {
            // Use strategic calculation if extracted price is invalid
            result.offer = { 
              amount: this.calculateStrategicCounterOffer(currentOffer, basePrice, minPrice),
              final: false 
            };
            result.confidence = 0.6;
          }
        } else {
          // No valid price found, calculate strategic counter
          result.offer = { 
            amount: this.calculateStrategicCounterOffer(currentOffer, basePrice, minPrice),
            final: false 
          };
          result.confidence = 0.5;
        }
      }

      // Extract reasoning if available
      const reasoningPatterns = [
        /because\s+(.+?)(?:\.|$)/i,
        /since\s+(.+?)(?:\.|$)/i,
        /as\s+(.+?)(?:\.|$)/i
      ];

      for (const pattern of reasoningPatterns) {
        const match = cleanResponse.match(pattern);
        if (match && match[1]) {
          result.reasoning = match[1].trim();
          break;
        }
      }

      // Clean up the content for display
      result.content = this.cleanResponseContent(cleanResponse);

    } catch (error) {
      console.error('Error parsing negotiation response:', error);
      result.confidence = 0.3;
    }

    return result;
  }

  // Clean response content for display
  cleanResponseContent(content) {
    // Remove action indicators and formatting
    return content
      .replace(/\b(ACCEPT|REJECT|COUNTER|CONTINUE)\b/gi, '')
      .replace(/\$[\d,]+(?:\.\d{2})?/g, match => match) // Keep prices as-is
      .replace(/\s+/g, ' ')
      .trim();
  }
  // Calculate strategic counter-offer
  calculateStrategicCounterOffer(currentOffer, basePrice, minPrice) {
    const offerGap = basePrice - currentOffer;
    const minimumGap = basePrice - minPrice;
    
    let counterOffer;
    
    if (currentOffer >= minPrice * 1.2) {
      // Offer is reasonable, counter closer to their offer
      counterOffer = currentOffer + (offerGap * 0.4);
    } else if (currentOffer >= minPrice) {
      // Offer is at or near minimum, counter closer to base
      counterOffer = currentOffer + (offerGap * 0.6);
    } else {
      // Offer is below minimum, counter significantly higher
      counterOffer = minPrice + (minimumGap * 0.3);
    }

    // Ensure counter-offer is within acceptable range
    return Math.max(minPrice, Math.min(basePrice * 0.95, Math.round(counterOffer)));
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
