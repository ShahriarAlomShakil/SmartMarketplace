// 🎯 Enhanced Response Processing & Validation System
// Day 12 Enhancement - Advanced AI Response Management & Standardization

const Joi = require('joi');
const { geminiAnalytics } = require('./geminiAnalytics');

class ResponseProcessor {
  constructor() {
    // Response validation schemas
    this.schemas = {
      negotiationResponse: Joi.object({
        content: Joi.string().min(1).max(500).required(),
        action: Joi.string().valid('accept', 'reject', 'counter', 'continue').required(),
        offer: Joi.object({
          amount: Joi.number().positive().required(),
          final: Joi.boolean().required(),
          source: Joi.string().valid('extracted', 'calculated', 'fallback', 'accepted').optional(),
          formatted: Joi.string().optional()
        }).optional(),
        confidence: Joi.number().min(0).max(1).required(),
        reasoning: Joi.string().max(200).optional(),
        metadata: Joi.object({
          model: Joi.string().required(),
          promptId: Joi.string().required(),
          processingTime: Joi.number().required(),
          tokensUsed: Joi.number().optional(),
          validationStatus: Joi.string().valid('valid', 'invalid', 'pending', 'error').required(),
          validationErrors: Joi.array().items(Joi.string()).optional(),
          originalResponse: Joi.string().optional(),
          parsingError: Joi.string().optional(),
          isFallback: Joi.boolean().optional()
        }).required()
      }),

      contextData: Joi.object({
        productTitle: Joi.string().required(),
        basePrice: Joi.number().positive().required(),
        minPrice: Joi.number().positive().required(),
        currentOffer: Joi.number().positive().required(),
        rounds: Joi.number().integer().min(1).required(),
        maxRounds: Joi.number().integer().min(1).required(),
        urgency: Joi.string().valid('low', 'medium', 'high').optional(),
        personality: Joi.string().valid('friendly', 'professional', 'firm', 'flexible').optional(),
        category: Joi.string().optional(),
        userMessage: Joi.string().max(1000).optional(),
        negotiationId: Joi.string().optional(),
        userId: Joi.string().optional()
      })
    };

    // Content safety patterns
    this.safetyPatterns = {
      profanity: /\b(fuck|shit|damn|hell|ass|bitch|crap)\b/gi,
      personalInfo: {
        ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
        phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
        email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g
      },
      inappropriateContent: /\b(scam|fraud|fake|counterfeit|stolen|illegal)\b/gi,
      spam: /\b(click here|buy now|limited time|act now|guaranteed|free money)\b/gi
    };

    // Response formatting templates
    this.formatTemplates = {
      success: {
        status: 'success',
        data: null,
        metadata: {
          timestamp: null,
          requestId: null,
          version: '1.0'
        }
      },
      error: {
        status: 'error',
        error: {
          code: null,
          message: null,
          details: null
        },
        metadata: {
          timestamp: null,
          requestId: null,
          version: '1.0'
        }
      }
    };
  }

  // Main response processing pipeline
  async processResponse(rawResponse, context, options = {}) {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      // Step 1: Validate input context
      const contextValidation = this.validateContext(context);
      if (!contextValidation.isValid) {
        throw new Error(`Invalid context: ${contextValidation.errors.join(', ')}`);
      }

      // Step 2: Sanitize raw response
      const sanitizedResponse = this.sanitizeContent(rawResponse);

      // Step 3: Parse and structure response
      const structuredResponse = this.parseStructuredResponse(sanitizedResponse, context);

      // Step 4: Validate structured response
      const validation = this.validateResponse(structuredResponse);
      if (!validation.isValid) {
        console.warn('Response validation failed:', validation.errors);
        structuredResponse.metadata.validationStatus = 'invalid';
        structuredResponse.metadata.validationErrors = validation.errors;
      }

      // Step 5: Apply business logic validation
      const businessValidation = this.validateBusinessLogic(structuredResponse, context);
      if (!businessValidation.isValid) {
        console.warn('Business logic validation failed:', businessValidation.errors);
        structuredResponse.metadata.businessValidationErrors = businessValidation.errors;
      }

      // Step 6: Format for frontend consumption
      const formattedResponse = this.formatForFrontend(structuredResponse, context);

      // Step 7: Add processing metadata
      formattedResponse.metadata.processingTime = Date.now() - startTime;
      formattedResponse.metadata.requestId = requestId;

      return this.createSuccessResponse(formattedResponse, requestId);

    } catch (error) {
      console.error('Response processing error:', error);
      return this.createErrorResponse(error, requestId);
    }
  }

  // Validate input context
  validateContext(context) {
    const { error } = this.schemas.contextData.validate(context);
    
    return {
      isValid: !error,
      errors: error ? error.details.map(detail => detail.message) : []
    };
  }

  // Advanced content sanitization
  sanitizeContent(content) {
    let sanitized = content.toString().trim();

    // Remove potential security threats
    sanitized = sanitized
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '[SCRIPT_REMOVED]')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '[IFRAME_REMOVED]')
      .replace(/javascript:/gi, '[JS_REMOVED]');

    // Apply safety filters
    for (const [category, patterns] of Object.entries(this.safetyPatterns)) {
      if (typeof patterns === 'object' && patterns.constructor === Object) {
        // Handle nested patterns (like personalInfo)
        for (const [type, pattern] of Object.entries(patterns)) {
          sanitized = sanitized.replace(pattern, `[${type.toUpperCase()}_FILTERED]`);
        }
      } else {
        // Handle direct patterns
        sanitized = sanitized.replace(patterns, `[${category.toUpperCase()}_FILTERED]`);
      }
    }

    // Normalize whitespace and characters
    sanitized = sanitized
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\$\.,!?;:()'-]/g, '')
      .trim();

    // Ensure reasonable length
    if (sanitized.length > 500) {
      sanitized = sanitized.substring(0, 497) + '...';
    }

    return sanitized;
  }

  // Parse structured response with enhanced logic
  parseStructuredResponse(content, context) {
    const response = {
      content: content,
      action: 'continue',
      offer: null,
      confidence: 0.5,
      reasoning: '',
      metadata: {
        model: 'gemini-pro',
        promptId: this.generatePromptId(),
        processingTime: Date.now(),
        tokensUsed: content.length,
        validationStatus: 'pending',
        originalResponse: content
      }
    };

    // Enhanced action detection
    const actionAnalysis = this.detectAction(content, context);
    response.action = actionAnalysis.action;
    response.confidence = actionAnalysis.confidence;
    response.reasoning = actionAnalysis.reasoning;

    // Enhanced offer extraction
    if (response.action === 'counter') {
      const offerAnalysis = this.extractOffer(content, context);
      response.offer = offerAnalysis.offer;
      response.confidence = Math.min(response.confidence, offerAnalysis.confidence);
    } else if (response.action === 'accept') {
      response.offer = {
        amount: context.currentOffer,
        final: true,
        source: 'accepted'
      };
    }

    // Clean content for display
    response.content = this.cleanContentForDisplay(content, response.action);

    return response;
  }

  // Advanced action detection with context awareness
  detectAction(content, context) {
    const upperContent = content.toUpperCase();
    const { rounds, maxRounds, currentOffer, minPrice, basePrice } = context;

    // Explicit action patterns with weights
    const patterns = [
      { action: 'accept', pattern: /\b(ACCEPT|AGREE|DEAL|SOLD|YES|OKAY|OK)\b/i, weight: 0.9 },
      { action: 'reject', pattern: /\b(REJECT|DECLINE|NO|NEVER|IMPOSSIBLE|TOO LOW|CANNOT|WON'T)\b/i, weight: 0.8 },
      { action: 'counter', pattern: /\b(COUNTER|OFFER|HOW ABOUT|\$\d+|WHAT IF|MEET IN THE MIDDLE)\b/i, weight: 0.7 }
    ];

    let bestMatch = { action: 'continue', confidence: 0.5, reasoning: 'No clear action detected' };

    for (const { action, pattern, weight } of patterns) {
      if (pattern.test(content)) {
        bestMatch = {
          action,
          confidence: weight,
          reasoning: `Detected ${action} pattern in response`
        };
        break;
      }
    }

    // Context-based action inference
    if (bestMatch.action === 'continue') {
      const contextInference = this.inferActionFromContext(context);
      if (contextInference.confidence > bestMatch.confidence) {
        bestMatch = contextInference;
      }
    }

    return bestMatch;
  }

  // Context-based action inference
  inferActionFromContext(context) {
    const { rounds, maxRounds, currentOffer, minPrice, basePrice, urgency } = context;
    const offerRatio = currentOffer / basePrice;

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

    // High urgency logic
    if (urgency === 'high' && currentOffer >= minPrice * 0.9) {
      return {
        action: 'accept',
        confidence: 0.75,
        reasoning: 'High urgency with near-minimum offer'
      };
    }

    // Offer quality analysis
    if (offerRatio >= 0.95) {
      return {
        action: 'accept',
        confidence: 0.9,
        reasoning: 'Excellent offer (95%+ of base price)'
      };
    } else if (offerRatio >= 0.8) {
      return {
        action: 'counter',
        confidence: 0.7,
        reasoning: 'Good offer worth negotiating'
      };
    } else if (currentOffer < minPrice * 0.8) {
      return {
        action: 'reject',
        confidence: 0.6,
        reasoning: 'Offer significantly below minimum'
      };
    }

    return {
      action: 'continue',
      confidence: 0.5,
      reasoning: 'Standard negotiation flow'
    };
  }

  // Enhanced offer extraction
  extractOffer(content, context) {
    const { basePrice, minPrice, currentOffer } = context;
    
    // Multiple extraction patterns
    const patterns = [
      /\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
      /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?) dollars?/gi,
      /offer (\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
      /how about (\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi
    ];

    const extractedOffers = [];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(amount) && amount > 0) {
          extractedOffers.push(amount);
        }
      }
    }

    // Validate and select best offer
    if (extractedOffers.length === 0) {
      return {
        offer: {
          amount: this.calculateStrategicOffer(currentOffer, basePrice, minPrice),
          final: false,
          source: 'calculated'
        },
        confidence: 0.5
      };
    }

    // Filter realistic offers
    const validOffers = extractedOffers.filter(offer => 
      offer >= minPrice * 0.7 && offer <= basePrice * 1.2
    );

    if (validOffers.length > 0) {
      const selectedOffer = validOffers[0]; // Take first valid offer
      return {
        offer: {
          amount: Math.round(selectedOffer),
          final: false,
          source: 'extracted'
        },
        confidence: 0.8
      };
    }

    // Fallback calculation
    return {
      offer: {
        amount: this.calculateStrategicOffer(currentOffer, basePrice, minPrice),
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

  // Validate response structure
  validateResponse(response) {
    const { error } = this.schemas.negotiationResponse.validate(response);
    
    return {
      isValid: !error,
      errors: error ? error.details.map(detail => detail.message) : []
    };
  }

  // Business logic validation
  validateBusinessLogic(response, context) {
    const errors = [];
    const { basePrice, minPrice, currentOffer, rounds, maxRounds } = context;

    // Validate offer amounts
    if (response.offer) {
      if (response.offer.amount < 0) {
        errors.push('Offer amount cannot be negative');
      }
      if (response.offer.amount > basePrice * 2) {
        errors.push('Offer amount unreasonably high');
      }
      if (response.action === 'counter' && response.offer.amount < minPrice * 0.5) {
        errors.push('Counter-offer too low to be reasonable');
      }
    }

    // Validate action logic
    if (response.action === 'accept' && currentOffer < minPrice * 0.9) {
      errors.push('Accepting offer below reasonable minimum');
    }
    if (response.action === 'counter' && !response.offer) {
      errors.push('Counter action requires offer amount');
    }
    if (rounds >= maxRounds && response.action === 'continue') {
      errors.push('Cannot continue negotiation past maximum rounds');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Format response for frontend consumption
  formatForFrontend(response, context) {
    return {
      message: response.content,
      action: response.action,
      offer: response.offer ? {
        amount: response.offer.amount,
        formatted: `$${response.offer.amount.toLocaleString()}`,
        isFinal: response.offer.final || false
      } : null,
      confidence: Math.round(response.confidence * 100),
      reasoning: response.reasoning,
      metadata: {
        ...response.metadata,
        timestamp: new Date().toISOString(),
        context: {
          round: context.rounds,
          maxRounds: context.maxRounds,
          progress: Math.round((context.rounds / context.maxRounds) * 100)
        }
      }
    };
  }

  // Clean content for display
  cleanContentForDisplay(content, action) {
    let cleaned = content
      .replace(/\b(ACCEPT|REJECT|COUNTER|CONTINUE)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Ensure it starts with capital letter
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }

    // Ensure proper punctuation
    if (cleaned && !cleaned.match(/[.!?]$/)) {
      cleaned += '.';
    }

    return cleaned || this.getDefaultMessage(action);
  }

  // Default messages for actions
  getDefaultMessage(action) {
    const defaults = {
      accept: 'I accept your offer!',
      reject: 'I cannot accept that offer.',
      counter: 'Let me make a counter-offer.',
      continue: 'Let\'s continue our negotiation.'
    };
    return defaults[action] || defaults.continue;
  }

  // Create success response
  createSuccessResponse(data, requestId) {
    return {
      ...this.formatTemplates.success,
      data,
      metadata: {
        ...this.formatTemplates.success.metadata,
        timestamp: new Date().toISOString(),
        requestId
      }
    };
  }

  // Create error response
  createErrorResponse(error, requestId) {
    return {
      ...this.formatTemplates.error,
      error: {
        code: error.code || 'PROCESSING_ERROR',
        message: error.message || 'Failed to process response',
        details: error.details || null
      },
      metadata: {
        ...this.formatTemplates.error.metadata,
        timestamp: new Date().toISOString(),
        requestId
      }
    };
  }

  // Utility functions
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generatePromptId() {
    return `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }
}

module.exports = new ResponseProcessor();
