const { getGeminiModel, geminiConfig } = require('../config/gemini');

class GeminiService {
  constructor() {
    this.model = getGeminiModel();
  }

  // Generate negotiation response
  async generateNegotiationResponse(context) {
    try {
      const {
        productTitle,
        basePrice,
        minPrice,
        currentOffer,
        rounds,
        maxRounds,
        urgency = 'medium',
        conversationHistory = [],
        userMessage
      } = context;

      // Calculate negotiation flexibility based on various factors
      const priceRange = basePrice - minPrice;
      const currentDiscount = basePrice - currentOffer;
      const discountPercentage = (currentDiscount / basePrice) * 100;
      const progressPercentage = (rounds / maxRounds) * 100;

      // Build AI prompt
      const prompt = this.buildNegotiationPrompt({
        productTitle,
        basePrice,
        minPrice,
        currentOffer,
        rounds,
        maxRounds,
        urgency,
        conversationHistory,
        userMessage,
        discountPercentage,
        progressPercentage
      });

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      // Parse the response to extract structured data
      return this.parseNegotiationResponse(response, context);

    } catch (error) {
      console.error('Gemini AI Error:', error);
      return this.getFallbackResponse(context);
    }
  }

  // Build the negotiation prompt
  buildNegotiationPrompt(context) {
    const {
      productTitle,
      basePrice,
      minPrice,
      currentOffer,
      rounds,
      maxRounds,
      urgency,
      conversationHistory,
      userMessage,
      discountPercentage,
      progressPercentage
    } = context;

    return `
You are an AI assistant representing a seller in a marketplace negotiation for "${productTitle}".

PRODUCT DETAILS:
- Listed Price: $${basePrice}
- Minimum Acceptable: $${minPrice}
- Current Buyer Offer: $${currentOffer}
- Discount Requested: ${discountPercentage.toFixed(1)}%

NEGOTIATION STATUS:
- Round: ${rounds}/${maxRounds}
- Progress: ${progressPercentage.toFixed(1)}%
- Urgency Level: ${urgency}

CONVERSATION HISTORY:
${conversationHistory.slice(-3).join('\n')}

LATEST BUYER MESSAGE: "${userMessage}"

GUIDELINES:
1. Be professional, friendly, but protect seller's interests
2. Consider urgency: high = more flexible, low = firmer stance
3. Pricing strategy:
   - 0-10% discount: Negotiate firmly, small concessions
   - 10-20% discount: Show flexibility, reasonable counters
   - 20-30% discount: Push back politely, justify value
   - 30%+ discount: Decline or make minimal counter

RESPONSE FORMAT:
Your response should indicate your action and be conversational. Include:
1. A natural conversational message (max 150 words)
2. Clear action: ACCEPT, COUNTER, REJECT, or CONTINUE
3. If countering, suggest a specific price
4. Brief reasoning for your decision

Be human-like in your communication - use appropriate enthusiasm, concern, or firmness based on the situation.

Respond now:`;
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
      metadata: {
        model: 'gemini-pro',
        promptId: Date.now().toString(),
        processingTime: Date.now(),
        tokensUsed: response.length
      }
    };

    // Extract action from response
    const upperResponse = response.toUpperCase();
    
    if (upperResponse.includes('ACCEPT')) {
      result.action = 'accept';
      result.confidence = 0.9;
    } else if (upperResponse.includes('REJECT') || upperResponse.includes('DECLINE')) {
      result.action = 'reject';
      result.confidence = 0.8;
    } else if (upperResponse.includes('COUNTER')) {
      result.action = 'counter';
      
      // Extract counter-offer amount
      const priceMatch = response.match(/\$(\d+(?:\.\d{2})?)/);
      if (priceMatch) {
        const amount = parseFloat(priceMatch[1]);
        if (amount >= minPrice && amount <= basePrice) {
          result.offer = {
            amount,
            reasoning: 'Counter-offer based on product value and market analysis'
          };
          result.confidence = 0.8;
        }
      }

      // If no valid counter-offer found, generate one strategically
      if (!result.offer) {
        const strategicOffer = this.calculateStrategicCounterOffer(currentOffer, basePrice, minPrice);
        result.offer = {
          amount: strategicOffer,
          reasoning: 'Strategic counter-offer to move negotiation forward'
        };
      }
    }

    return result;
  }

  // Calculate strategic counter-offer
  calculateStrategicCounterOffer(currentOffer, basePrice, minPrice) {
    const offerGap = basePrice - currentOffer;
    const minimumGap = basePrice - minPrice;
    
    // Offer somewhere between current offer and base price
    // Closer to current offer if it's reasonable, closer to base if it's too low
    let counterOffer;
    
    if (currentOffer >= minPrice * 1.2) {
      // Reasonable offer - meet them partway
      counterOffer = currentOffer + (offerGap * 0.6);
    } else if (currentOffer >= minPrice) {
      // Low but acceptable - small concession
      counterOffer = currentOffer + (offerGap * 0.8);
    } else {
      // Too low - minimal concession
      counterOffer = basePrice * 0.9;
    }

    // Ensure counter-offer is within acceptable range
    return Math.max(minPrice, Math.min(basePrice, Math.round(counterOffer)));
  }

  // Fallback response when AI fails
  getFallbackResponse(context) {
    const { currentOffer, basePrice, minPrice } = context;
    
    const fallbackResponses = [
      "Thank you for your offer. Let me consider this and get back to you shortly.",
      "I appreciate your interest. Let me review your proposal.",
      "That's an interesting offer. I need a moment to think about it.",
      "Thanks for the offer. Let me see what I can do."
    ];

    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

    // Simple logic for fallback action
    let action = 'continue';
    let offer = null;

    if (currentOffer >= minPrice * 1.1) {
      // Close to acceptable - might counter
      action = 'counter';
      offer = {
        amount: Math.round(currentOffer + ((basePrice - currentOffer) * 0.5)),
        reasoning: 'Counter-offer based on product value'
      };
    } else if (currentOffer < minPrice * 0.8) {
      // Too low - likely reject
      action = 'reject';
    }

    return {
      content: randomResponse,
      action,
      offer,
      confidence: 0.3,
      metadata: {
        model: 'fallback',
        promptId: 'fallback-' + Date.now(),
        processingTime: 0,
        tokensUsed: 0,
        error: 'AI service unavailable'
      }
    };
  }

  // Generate product description enhancement
  async enhanceProductDescription(productData) {
    try {
      const prompt = `
Enhance this product listing to make it more appealing to buyers:

Title: ${productData.title}
Category: ${productData.category}
Condition: ${productData.condition}
Current Description: ${productData.description}

Please provide:
1. An improved, engaging description (max 300 words)
2. Suggested tags/keywords
3. Highlight key selling points

Keep it honest and accurate while making it more attractive.
`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      return {
        enhancedDescription: response,
        suggestions: this.extractDescriptionSuggestions(response)
      };

    } catch (error) {
      console.error('Description enhancement error:', error);
      return {
        enhancedDescription: productData.description,
        suggestions: []
      };
    }
  }

  // Extract suggestions from enhanced description
  extractDescriptionSuggestions(response) {
    const suggestions = [];
    
    // Simple extraction logic - could be improved
    if (response.includes('tags:') || response.includes('keywords:')) {
      const tagMatch = response.match(/(?:tags|keywords):\s*([^\n]+)/i);
      if (tagMatch) {
        const tags = tagMatch[1].split(',').map(tag => tag.trim().toLowerCase());
        suggestions.push(...tags);
      }
    }

    return suggestions.filter(tag => tag.length > 0 && tag.length <= 20).slice(0, 10);
  }

  // Generate negotiation insights
  async generateNegotiationInsights(negotiationData) {
    try {
      const {
        product,
        pricing,
        rounds,
        messages,
        analytics
      } = negotiationData;

      const prompt = `
Analyze this negotiation and provide insights:

Product: ${product.title} - $${product.pricing.basePrice}
Initial Offer: $${pricing.initialOffer}
Current Offer: $${pricing.currentOffer}
Rounds: ${rounds}
Message Count: ${messages.length}

Recent messages:
${messages.slice(-3).map(m => `${m.sender}: ${m.content}`).join('\n')}

Provide brief insights on:
1. Negotiation momentum
2. Buyer's strategy
3. Likelihood of successful deal
4. Recommended next steps

Keep response under 200 words.
`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      return {
        insights: response,
        recommendations: this.extractRecommendations(response)
      };

    } catch (error) {
      console.error('Insights generation error:', error);
      return {
        insights: 'Analysis unavailable at this time.',
        recommendations: []
      };
    }
  }

  // Extract recommendations from insights
  extractRecommendations(response) {
    const recommendations = [];
    
    // Look for action items or recommendations
    const lines = response.split('\n');
    lines.forEach(line => {
      if (line.includes('recommend') || line.includes('suggest') || line.includes('should')) {
        recommendations.push(line.trim());
      }
    });

    return recommendations.slice(0, 3);
  }
}

module.exports = new GeminiService();
