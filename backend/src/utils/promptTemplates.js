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
  },

  // Day 12 Enhancement: Advanced scenario-based templates
  advanced: {
    market_analysis: `Advanced market position analysis for "{productTitle}":

MARKET CONTEXT:
- Current market trend: \{marketTrend}
- Seasonal factors: \{seasonality}
- Competitor pricing: \{competitorPrices}
- Supply/demand ratio: \{supplyDemand}

LISTING PERFORMANCE:
- Views received: \{viewCount}
- Interest level: \{interestLevel}
- Time on market: \{timeOnMarket}
- Previous offers: \{previousOffers}

BUYER'S APPROACH: "\{userMessage}"

Provide a sophisticated response that considers market dynamics, timing, and strategic positioning. Include specific reasoning for pricing decisions.`,

    psychological_negotiation: `Psychological negotiation framework for "{productTitle}":

NEGOTIATION PSYCHOLOGY:
- Buyer's urgency signals: \{urgencySignals}
- Price anchoring opportunities: \{anchoringOpportunities}
- Scarcity factors: \{scarcityFactors}
- Social proof elements: \{socialProof}

CONVERSATION DYNAMICS:
- Rapport level: \{rapportLevel}
- Trust indicators: \{trustIndicators}
- Resistance patterns: \{resistancePatterns}
- Motivation drivers: \{motivationDrivers}

BUYER COMMUNICATION: "\{userMessage}"

Craft a response using psychological principles to guide the negotiation toward mutual benefit while maintaining ethical standards.`,

    adaptive_strategy: `Adaptive negotiation strategy for "{productTitle}":

CONTEXT ADAPTATION:
- Negotiation stage: \{negotiationStage}
- Buyer profile: \{buyerProfile}
- Market conditions: \{marketConditions}
- Time constraints: \{timeConstraints}

STRATEGY ELEMENTS:
- Primary objective: \{primaryObjective}
- Fallback positions: \{fallbackPositions}
- Concession strategy: \{concessionStrategy}
- Closure approach: \{closureApproach}

CURRENT INTERACTION: "\{userMessage}"

Adapt your response to the current negotiation dynamics while maintaining strategic alignment with your objectives.`,

    emotional_intelligence: `Emotionally intelligent response for "{productTitle}":

EMOTIONAL CONTEXT:
- Buyer's emotional state: \{emotionalState}
- Stress indicators: \{stressIndicators}
- Enthusiasm level: \{enthusiasmLevel}
- Frustration signals: \{frustrationSignals}

RELATIONSHIP DYNAMICS:
- Communication style match: \{communicationMatch}
- Trust building opportunities: \{trustOpportunities}
- Empathy moments: \{empathyMoments}
- Positive reinforcement: \{positiveReinforcement}

BUYER'S MESSAGE: "\{userMessage}"

Respond with high emotional intelligence, addressing both the business transaction and the human element of the interaction.`
  },

  // Day 12 Enhancement: Context-aware template selection
  contextual: {
    opening_strong: `Strong opening position for "{productTitle}":

You're representing a premium {category} item with strong market position.

STRENGTH INDICATORS:
- High demand category: \{demandLevel}
- Excellent condition: \{condition}
- Competitive pricing: \{pricePosition}
- Unique features: \{uniqueFeatures}

BUYER'S INQUIRY: "\{userMessage}"

Maintain confident positioning while showing openness to serious inquiries. Emphasize value and market position.`,

    opening_flexible: `Flexible opening approach for "{productTitle}":

You're in a good position to negotiate with room for movement.

FLEXIBILITY FACTORS:
- Reasonable time on market: \{timeOnMarket}
- Multiple options available: \{alternatives}
- Good but not urgent demand: \{demandLevel}
- Room for win-win outcomes: \{negotiationSpace}

BUYER'S APPROACH: "\{userMessage}"

Show openness to negotiation while maintaining value perception. Focus on finding mutually beneficial solutions.`,

    closing_urgent: `Urgent closing approach for "{productTitle}":

You need to close this deal with appropriate urgency.

URGENCY FACTORS:
- Extended time on market: \{timeOnMarket}
- Seasonal considerations: \{seasonalFactors}
- Carrying costs: \{carryingCosts}
- Alternative opportunities: \{alternatives}

BUYER'S POSITION: "\{userMessage}"

Balance urgency with value protection. Create appropriate pressure while maintaining deal integrity.`,

    relationship_building: `Relationship-focused approach for "{productTitle}":

Priority on building long-term relationship and trust.

RELATIONSHIP FACTORS:
- Potential repeat customer: \{repeatPotential}
- Referral opportunities: \{referralPotential}
- Community connections: \{communityTies}
- Brand building: \{brandBuilding}

BUYER INTERACTION: "\{userMessage}"

Focus on relationship building while conducting business. Consider long-term value beyond this single transaction.`
  },

  // Template utility functions
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

  // Day 12 Enhancement: Advanced scenario detection
  detectAdvancedScenario: (context) => {
    const { rounds, maxRounds, currentOffer, basePrice, minPrice, urgency, timeOnMarket, viewCount } = context;
    
    // Calculate key metrics
    const negotiationProgress = rounds / maxRounds;
    const priceRatio = currentOffer / basePrice;
    const marginRatio = (currentOffer - minPrice) / (basePrice - minPrice);

    // Market strength analysis
    const marketStrength = TemplateUtils.analyzeMarketStrength(context);
    
    // Complex scenario detection
    if (negotiationProgress > 0.8 && priceRatio < 0.8) {
      return 'final_stand'; // Near end with low offer
    }
    
    if (priceRatio > 0.95 && marketStrength === 'strong') {
      return 'premium_acceptance'; // High offer in strong market
    }
    
    if (urgency === 'high' && timeOnMarket > 30) {
      return 'urgent_liquidation'; // Need to sell quickly
    }
    
    if (viewCount > 100 && priceRatio < 0.7) {
      return 'high_interest_lowball'; // Popular item with low offer
    }
    
    if (negotiationProgress < 0.3 && priceRatio > 0.8) {
      return 'early_strong_offer'; // Good offer early in negotiation
    }
    
    return TemplateUtils.detectScenario(context); // Fallback to basic detection
  },

  // Day 12 Enhancement: Market strength analysis
  analyzeMarketStrength: (context) => {
    const { viewCount = 0, timeOnMarket = 0, category, condition, pricePosition } = context;
    
    let strengthScore = 0;
    
    // View engagement
    if (viewCount > 50) strengthScore += 2;
    else if (viewCount > 20) strengthScore += 1;
    
    // Time on market
    if (timeOnMarket < 7) strengthScore += 2;
    else if (timeOnMarket < 14) strengthScore += 1;
    else if (timeOnMarket > 30) strengthScore -= 1;
    
    // Category demand
    const highDemandCategories = ['electronics', 'gaming', 'mobile'];
    if (highDemandCategories.includes(category)) strengthScore += 1;
    
    // Condition factor
    if (condition === 'new' || condition === 'like-new') strengthScore += 1;
    
    // Price positioning
    if (pricePosition === 'competitive') strengthScore += 1;
    else if (pricePosition === 'premium') strengthScore -= 1;
    
    if (strengthScore >= 4) return 'strong';
    if (strengthScore >= 2) return 'moderate';
    return 'weak';
  },

  // Day 12 Enhancement: Dynamic template selection
  selectOptimalTemplate: (context) => {
    const scenario = TemplateUtils.detectAdvancedScenario(context);
    const marketStrength = TemplateUtils.analyzeMarketStrength(context);
    const { personality, category } = context;
    
    // Advanced template mapping
    const templateMap = {
      'final_stand': `advanced.closing_urgent`,
      'premium_acceptance': `advanced.market_analysis`,
      'urgent_liquidation': `contextual.closing_urgent`,
      'high_interest_lowball': `contextual.opening_strong`,
      'early_strong_offer': `advanced.psychological_negotiation`,
      'counter_offer': `negotiation.counter_offer`,
      'initial': `negotiation.initial`,
      'final_round': `negotiation.final_round`
    };
    
    // Get primary template
    let templatePath = templateMap[scenario] || `negotiation.${scenario}`;
    
    // Category override if specific template exists
    if (PromptTemplates.category[category]) {
      templatePath = `category.${category}`;
    }
    
    // Market strength modifier
    if (marketStrength === 'strong' && scenario.includes('opening')) {
      templatePath = 'contextual.opening_strong';
    } else if (marketStrength === 'weak' && scenario.includes('closing')) {
      templatePath = 'contextual.closing_urgent';
    }
    
    return templatePath;
  },

  // Day 12 Enhancement: Context enrichment
  enrichContext: (context) => {
    const enriched = { ...context };
    
    // Add market analysis
    enriched.marketStrength = TemplateUtils.analyzeMarketStrength(context);
    enriched.negotiationStage = TemplateUtils.getNegotiationStage(context);
    enriched.competitivePosition = TemplateUtils.getCompetitivePosition(context);
    
    // Add psychological factors
    enriched.urgencySignals = TemplateUtils.detectUrgencySignals(context);
    enriched.trustIndicators = TemplateUtils.analyzeTrustIndicators(context);
    enriched.rapportLevel = TemplateUtils.assessRapportLevel(context);
    
    // Add strategic elements
    enriched.primaryObjective = TemplateUtils.determinePrimaryObjective(context);
    enriched.fallbackPositions = TemplateUtils.calculateFallbackPositions(context);
    enriched.concessionStrategy = TemplateUtils.developConcessionStrategy(context);
    
    return enriched;
  },

  // Day 12 Enhancement: Negotiation stage analysis
  getNegotiationStage: (context) => {
    const progress = context.rounds / context.maxRounds;
    const priceMovement = Math.abs(context.currentOffer - context.basePrice) / context.basePrice;
    
    if (progress < 0.2) return 'opening';
    if (progress < 0.5 && priceMovement < 0.1) return 'exploration';
    if (progress < 0.8 && priceMovement > 0.1) return 'active_negotiation';
    if (progress >= 0.8) return 'closing';
    
    return 'standard';
  },

  // Day 12 Enhancement: Competitive position analysis
  getCompetitivePosition: (context) => {
    const { basePrice, currentOffer, marketValue = basePrice, condition } = context;
    
    const marketRatio = basePrice / marketValue;
    const offerRatio = currentOffer / marketValue;
    
    if (marketRatio <= 0.9 && condition === 'excellent') return 'premium';
    if (marketRatio <= 1.0 && offerRatio >= 0.9) return 'competitive';
    if (marketRatio > 1.1) return 'aggressive';
    
    return 'standard';
  },

  // Day 12 Enhancement: Urgency signal detection
  detectUrgencySignals: (context) => {
    const signals = [];
    
    if (context.urgency === 'high') signals.push('explicit_urgency');
    if (context.timeOnMarket > 30) signals.push('extended_listing');
    if (context.rounds > context.maxRounds * 0.8) signals.push('negotiation_deadline');
    if (context.userMessage?.toLowerCase().includes('quick')) signals.push('buyer_urgency');
    
    return signals;
  },

  // Day 12 Enhancement: Trust indicator analysis
  analyzeTrustIndicators: (context) => {
    const indicators = [];
    
    if (context.rounds > 3) indicators.push('sustained_engagement');
    if (context.userMessage?.toLowerCase().includes('thank')) indicators.push('polite_communication');
    if (context.currentOffer >= context.minPrice) indicators.push('reasonable_offers');
    
    return indicators;
  },

  // Day 12 Enhancement: Rapport assessment
  assessRapportLevel: (context) => {
    let rapportScore = 0;
    
    if (context.personality === 'friendly') rapportScore += 2;
    if (context.rounds > 2) rapportScore += 1;
    if (context.userMessage?.toLowerCase().includes('please')) rapportScore += 1;
    
    if (rapportScore >= 3) return 'high';
    if (rapportScore >= 2) return 'medium';
    return 'building';
  },

  // Day 12 Enhancement: Primary objective determination
  determinePrimaryObjective: (context) => {
    const { urgency, timeOnMarket, currentOffer, minPrice, basePrice } = context;
    
    if (urgency === 'high' || timeOnMarket > 45) return 'quick_sale';
    if (currentOffer >= basePrice * 0.95) return 'premium_price';
    if (currentOffer < minPrice * 1.1) return 'minimum_protection';
    
    return 'balanced_negotiation';
  },

  // Day 12 Enhancement: Fallback position calculation
  calculateFallbackPositions: (context) => {
    const { basePrice, minPrice, currentOffer } = context;
    
    return {
      ideal: Math.round(basePrice * 0.95),
      acceptable: Math.round((basePrice + minPrice) / 2),
      minimum: minPrice,
      walkaway: Math.round(minPrice * 0.9)
    };
  },

  // Day 12 Enhancement: Concession strategy development
  developConcessionStrategy: (context) => {
    const { rounds, maxRounds, urgency, marketStrength } = context;
    
    const remainingRounds = maxRounds - rounds;
    const progressRatio = rounds / maxRounds;
    
    if (urgency === 'high' || progressRatio > 0.8) {
      return 'accelerated'; // Larger concessions quickly
    }
    
    if (marketStrength === 'strong' && remainingRounds > 2) {
      return 'conservative'; // Small concessions slowly
    }
    
    return 'standard'; // Moderate concessions at steady pace
  },

  // Calculate offer quality with enhanced metrics
  calculateOfferQuality: (currentOffer, basePrice, minPrice) => {
    const percentage = ((currentOffer - minPrice) / (basePrice - minPrice)) * 100;
    
    if (percentage >= 90) return 'excellent';
    if (percentage >= 75) return 'very good';
    if (percentage >= 60) return 'good';
    if (percentage >= 40) return 'fair';
    if (percentage >= 20) return 'low';
    return 'very low';
  },

  // Generate dynamic context data with Day 12 enhancements
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

    // Basic calculations
    const basicData = {
      ...context,
      discountPercentage: ((basePrice - currentOffer) / basePrice * 100).toFixed(1),
      priceGap: basePrice - currentOffer,
      offerQuality: TemplateUtils.calculateOfferQuality(currentOffer, basePrice, minPrice),
      scenario: TemplateUtils.detectScenario(context),
      progressPercentage: ((rounds / maxRounds) * 100).toFixed(1)
    };

    // Day 12 enhancements
    const enrichedData = TemplateUtils.enrichContext(basicData);
    
    return enrichedData;
  },

  // Day 12 Enhancement: Advanced template processing
  processAdvancedTemplate: (templatePath, context) => {
    const enrichedContext = TemplateUtils.enrichContext(context);
    const template = TemplateUtils.getTemplateByPath(templatePath);
    
    if (!template) {
      console.warn(`Template not found: ${templatePath}, using fallback`);
      return PromptTemplates.fallback.generic;
    }
    
    return TemplateUtils.replacePlaceholders(template, enrichedContext);
  },

  // Get template by path (e.g., "advanced.market_analysis")
  getTemplateByPath: (path) => {
    const parts = path.split('.');
    let current = PromptTemplates;
    
    for (const part of parts) {
      current = current[part];
      if (!current) return null;
    }
    
    return current;
  }
};

class TemplateUtils {
  static analyzeMarketStrength(context) {
    // Basic market strength analysis
    return 'moderate';
  }

  static detectScenario(context) {
    return 'standard_negotiation';
  }

  static detectAdvancedScenario(context) {
    return this.detectScenario(context);
  }

  static getNegotiationStage(context) {
    return 'initial';
  }

  static getCompetitivePosition(context) {
    return 'neutral';
  }

  static detectUrgencySignals(context) {
    return [];
  }

  static analyzeTrustIndicators(context) {
    return 'medium';
  }

  static assessRapportLevel(context) {
    return 'neutral';
  }

  static determinePrimaryObjective(context) {
    return 'fair_deal';
  }

  static calculateFallbackPositions(context) {
    return [];
  }

  static developConcessionStrategy(context) {
    return 'gradual';
  }

  static calculateOfferQuality(currentOffer, basePrice, minPrice) {
    if (currentOffer >= basePrice) return 'excellent';
    if (currentOffer >= minPrice) return 'acceptable';
    return 'poor';
  }

  static enrichContext(context) {
    return {
      ...context,
      marketStrength: this.analyzeMarketStrength(context),
      scenario: this.detectScenario(context)
    };
  }

  static getTemplateByPath(templatePath) {
    return 'Default template for: {productTitle}';
  }

  static replacePlaceholders(template, context) {
    let result = template;
    Object.keys(context).forEach(key => {
      const placeholder = `{${key}}`;
      if (result.includes(placeholder)) {
        result = result.replace(new RegExp(placeholder, 'g'), context[key] || '');
      }
    });
    return result;
  }
}

module.exports = {
  PromptTemplates,
  TemplateUtils
};
