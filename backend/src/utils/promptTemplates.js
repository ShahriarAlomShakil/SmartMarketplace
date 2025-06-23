// 📝 Advanced Prompt Templates for Gemini AI
// Day 11 Enhancement - Comprehensive prompt library

const PromptTemplates = {
  // Base negotiation prompts by scenario
  negotiation: {
    // Initial contact scenario
    initial: `You are representing a seller for "{productTitle}" in an online marketplace.

PRODUCT DETAILS:
- Listed Price: $\{basePrice}
- Your Minimum: $\{minPrice}
- Condition: \{condition}
- Category: \{category}

BUYER'S FIRST MESSAGE: "\{userMessage}"

Your personality is \{personality}. Respond warmly but professionally. Show interest in making a deal while protecting your price. Ask clarifying questions if needed.

Keep response under 100 words. End with a specific next step or question.`,

    // Mid-negotiation scenarios
    counter_offer: `Ongoing negotiation for "{productTitle}":

CURRENT SITUATION:
- Your minimum: $\{minPrice}
- Their offer: $\{currentOffer}
- Discount requested: \{discountPercentage}%
- Round: \{rounds}/\{maxRounds}

CONVERSATION SO FAR:
\{conversationHistory}

THEIR LATEST: "\{userMessage}"

You're \{personality} and \{urgency} urgency. The offer is \{offerQuality}. 

Respond with COUNTER, ACCEPT, or REJECT. If countering, suggest a specific price and explain why.`,

    // Final round scenarios
    final_round: `FINAL NEGOTIATION ROUND for "{productTitle}":

CRITICAL DECISION POINT:
- This is round \{rounds}/\{maxRounds} (LAST CHANCE)
- Their offer: $\{currentOffer}
- Your minimum: $\{minPrice}
- Gap: $\{priceGap}

BUYER SAYS: "\{userMessage}"

You must decide: ACCEPT or REJECT. If accepting, be enthusiastic. If rejecting, be firm but polite. Explain your final decision clearly.`,

    // Price justification
    justify_price: `Buyer is questioning your price for "{productTitle}":

PRICE DEFENSE NEEDED:
- Listed: $\{basePrice}
- Their complaint: "\{userMessage}"
- Product condition: \{condition}
- Unique features: \{features}

Defend your pricing professionally. Mention:
1. Product condition/quality
2. Market value comparison  
3. Special features
4. Your flexibility (if any)

Be convincing but not aggressive.`,

    // Urgency scenarios
    urgent_sale: `URGENT SALE scenario for "{productTitle}":

TIME PRESSURE:
- You need to sell quickly
- Current offer: $\{currentOffer}
- Your minimum: $\{minPrice}
- Urgency: HIGH

BUYER'S MESSAGE: "\{userMessage}"

You're motivated to close the deal but don't want to seem desperate. Show flexibility while maintaining dignity. Consider accepting reasonable offers.`,

    // Bundle deal scenarios
    bundle_offer: `BUNDLE NEGOTIATION for multiple items:

BUNDLE DETAILS:
- Main item: "{productTitle}" ($\{basePrice})
- Additional items: \{bundleItems}
- Total value: $\{bundleValue}
- Their bundle offer: $\{bundleOffer}

THEIR PROPOSAL: "\{userMessage}"

Consider the bundle discount vs individual sales. Respond about the overall package value and your flexibility on bulk pricing.`
  },

  // Personality-specific templates
  personality: {
    friendly: {
      greeting: "Hi there! 😊 Thanks for your interest in my {productTitle}!",
      acceptance: "That sounds perfect! I'm happy to accept your offer. 🎉",
      counter: "I appreciate your offer! How about we meet somewhere in the middle? 😄",
      rejection: "I'm sorry, but that's a bit too low for me. I hope you understand! 😅",
      urgency_high: "I do need to sell this soon, so I'm definitely open to negotiating! 😊",
      urgency_low: "I'm not in a huge rush, but I'm always open to fair offers! 😄"
    },
    professional: {
      greeting: "Thank you for your interest in the {productTitle}.",
      acceptance: "Your offer is acceptable. We can proceed with the transaction.",
      counter: "I would like to propose a counter-offer that better reflects the value.",
      rejection: "Unfortunately, that offer doesn't meet my minimum requirements.",
      urgency_high: "I am looking to complete this sale in a timely manner.",
      urgency_low: "I can afford to wait for the right offer."
    },
    firm: {
      greeting: "I see you're interested in my {productTitle}. The price reflects its value.",
      acceptance: "Agreed. That's a fair offer.",
      counter: "My price is firm, but I can consider a slight adjustment.",
      rejection: "That offer is too low. My pricing is based on market value.",
      urgency_high: "While I'd like to sell soon, I won't compromise on fair value.",
      urgency_low: "I can wait for a buyer who appreciates the true value."
    },
    flexible: {
      greeting: "Great to see your interest! I'm open to reasonable negotiations.",
      acceptance: "Perfect! I'm glad we could reach an agreement.",
      counter: "Let's find a price that works for both of us. What about...",
      rejection: "That's quite low, but let's see if we can work something out.",
      urgency_high: "I'm motivated to sell and willing to be creative with pricing!",
      urgency_low: "No rush on my end, so let's find something that works for everyone."
    }
  },

  // Product category specific prompts
  category: {
    electronics: `Electronics-specific considerations for "{productTitle}":

TECH FACTORS:
- Age/model year: \{age}
- Condition: \{condition}
- Original retail: $\{originalPrice}
- Current market: $\{marketValue}
- Accessories included: \{accessories}

Buyer mentioned: "\{userMessage}"

Address tech depreciation, functionality, and included accessories. Be knowledgeable about the specific device.`,

    clothing: `Fashion item negotiation for "{productTitle}":

FASHION FACTORS:
- Brand: \{brand}
- Size: \{size}
- Condition: \{condition}
- Season: \{season}
- Original tags: \{hasTagsç}

Buyer's comment: "\{userMessage}"

Consider fashion trends, brand value, and condition. Mention care taken and authenticity if relevant.`,

    collectibles: `Collectible item discussion for "{productTitle}":

COLLECTIBLE VALUE:
- Rarity: \{rarity}
- Condition grade: \{condition}
- Market demand: \{demand}
- Authentication: \{authenticated}

Collector's inquiry: "\{userMessage}"

Emphasize rarity, condition, and investment potential. Be knowledgeable about the collectible market.`
  },

  // Error and fallback templates
  fallback: {
    generic: "Thanks for your interest in {productTitle}. I'll review your offer and get back to you shortly with a thoughtful response.",
    error: "I appreciate your message about {productTitle}. Let me take a moment to consider your proposal properly.",
    timeout: "Thank you for your patience. I'm reviewing your offer for {productTitle} and will respond with my thoughts shortly."
  },

  // Analysis and insight prompts
  analysis: {
    negotiation_summary: `Analyze this negotiation for "{productTitle}":

NEGOTIATION DATA:
- Rounds: \{rounds}
- Starting offer: $\{startingOffer}
- Current offer: $\{currentOffer}
- Seller minimum: $\{minPrice}
- Listed price: $\{basePrice}

CONVERSATION SUMMARY:
\{conversationSummary}

Provide:
1. Negotiation progress assessment
2. Buyer behavior analysis
3. Likelihood of successful deal
4. Recommended seller strategy
5. Optimal counter-offer suggestion

Be analytical and strategic.`,

    market_insights: `Provide market insights for "{productTitle}":

CURRENT LISTING:
- Category: \{category}
- Condition: \{condition}
- Listed price: $\{basePrice}
- Time listed: \{timeOnMarket}

MARKET DATA:
- Similar items: $\{similarItemPrices}
- Average time to sell: \{averageSellTime}
- Demand level: \{demandLevel}

Analyze pricing strategy and provide recommendations for optimal selling approach.`,

    buyer_profile: `Analyze buyer behavior pattern:

BUYER INTERACTION DATA:
- Number of messages: \{messageCount}
- Price change requests: \{priceRequests}
- Questions asked: \{questionsAsked}
- Response time: \{responseTime}
- Negotiation style: \{negotiationStyle}

Provide insights on:
1. Buyer seriousness/intent
2. Negotiation style classification
3. Likelihood to complete purchase
4. Recommended engagement approach`
  },

  // Multi-language support templates
  language: {
    spanish: {
      greeting: "¡Hola! Gracias por tu interés en {productTitle}.",
      counter: "Aprecio tu oferta. ¿Qué te parece si llegamos a un punto medio?"
    },
    french: {
      greeting: "Bonjour! Merci pour votre intérêt pour {productTitle}.",
      counter: "J'apprécie votre offre. Que diriez-vous de nous rencontrer à mi-chemin?"
    }
  }
};

// Template utility functions
const TemplateUtils = {
  // Replace placeholders in template
  replacePlaceholders: (template, data) => {
    let result = template;
    
    // Replace all placeholders with actual values
    Object.keys(data).forEach(key => {
      const placeholder = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(placeholder, data[key] || '');
    });
    
    return result;
  },

  // Get template by scenario and personality
  getTemplate: (scenario, personality = 'professional', category = null) => {
    // Try specific category template first
    if (category && PromptTemplates.category[category]) {
      return PromptTemplates.category[category];
    }
    
    // Try negotiation scenario
    if (PromptTemplates.negotiation[scenario]) {
      return PromptTemplates.negotiation[scenario];
    }
    
    // Try personality-specific template
    if (PromptTemplates.personality[personality] && PromptTemplates.personality[personality][scenario]) {
      return PromptTemplates.personality[personality][scenario];
    }
    
    // Fallback to generic
    return PromptTemplates.fallback.generic;
  },

  // Determine scenario based on context
  detectScenario: (context) => {
    const { rounds, maxRounds, currentOffer, minPrice, basePrice } = context;
    
    // Final round
    if (rounds >= maxRounds) {
      return 'final_round';
    }
    
    // Initial contact
    if (rounds === 1) {
      return 'initial';
    }
    
    // Price justification needed
    if (currentOffer < minPrice * 0.8) {
      return 'justify_price';
    }
    
    // Urgent sale
    if (context.urgency === 'high') {
      return 'urgent_sale';
    }
    
    // Default to counter offer
    return 'counter_offer';
  },

  // Calculate offer quality
  calculateOfferQuality: (currentOffer, basePrice, minPrice) => {
    const percentage = (currentOffer / basePrice) * 100;
    
    if (percentage >= 95) return 'excellent';
    if (percentage >= 85) return 'good';
    if (percentage >= 75) return 'fair';
    if (percentage >= 60) return 'low';
    return 'very low';
  },

  // Generate dynamic context data
  generateContextData: (context) => {
    const {
      productTitle,
      basePrice,
      minPrice,
      currentOffer,
      rounds,
      maxRounds,
      urgency = 'medium',
      personality = 'professional',
      category = 'general'
    } = context;

    return {
      ...context,
      discountPercentage: ((basePrice - currentOffer) / basePrice * 100).toFixed(1),
      priceGap: basePrice - currentOffer,
      offerQuality: TemplateUtils.calculateOfferQuality(currentOffer, basePrice, minPrice),
      scenario: TemplateUtils.detectScenario(context),
      progressPercentage: ((rounds / maxRounds) * 100).toFixed(1)
    };
  }
};

module.exports = {
  PromptTemplates,
  TemplateUtils
};
