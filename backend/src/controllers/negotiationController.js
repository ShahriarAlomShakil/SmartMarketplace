const Negotiation = require('../models/Negotiation');
const Product = require('../models/Product');
const User = require('../models/User');
const { getGeminiModel, geminiConfig } = require('../config/gemini');
const { validationResult } = require('express-validator');
const { sanitizers } = require('../middleware/validation');

// Helper function to format negotiation response
const formatNegotiationResponse = (negotiation) => {
  return {
    _id: negotiation._id,
    product: negotiation.product,
    buyer: negotiation.buyer,
    seller: negotiation.seller,
    status: negotiation.status,
    messages: negotiation.messages,
    pricing: negotiation.pricing,
    rounds: negotiation.rounds,
    maxRounds: negotiation.maxRounds,
    progress: negotiation.progress,
    priceRange: negotiation.priceRange,
    analytics: negotiation.analytics,
    timeline: negotiation.timeline,
    lastMessage: negotiation.lastMessage,
    unreadMessagesCount: negotiation.unreadMessagesCount,
    createdAt: negotiation.createdAt,
    updatedAt: negotiation.updatedAt,
    expiresAt: negotiation.expiresAt
  };
};

// Helper function to generate AI response using Gemini
const generateAIResponse = async (negotiation, userMessage, userOffer) => {
  try {
    const model = getGeminiModel();
    const product = negotiation.product;
    
    // Build context for AI
    const context = {
      productTitle: product.title,
      basePrice: product.pricing.basePrice,
      minPrice: product.pricing.minPrice,
      currentOffer: userOffer || negotiation.pricing.currentOffer,
      rounds: negotiation.rounds,
      maxRounds: negotiation.maxRounds,
      urgency: product.urgency?.level || 'medium',
      conversationHistory: negotiation.messages.slice(-5).map(msg => 
        `${msg.sender}: ${msg.content}${msg.offer ? ` (Offer: $${msg.offer.amount})` : ''}`
      ).join('\n')
    };

    // Calculate negotiation flexibility
    const priceRange = product.pricing.basePrice - product.pricing.minPrice;
    const currentDiscount = product.pricing.basePrice - (userOffer || negotiation.pricing.currentOffer);
    const discountPercentage = (currentDiscount / product.pricing.basePrice) * 100;
    
    // Build AI prompt
    const prompt = `
You are an AI assistant representing a seller in a price negotiation for "${context.productTitle}".

Product Details:
- Listed Price: $${context.basePrice}
- Minimum Acceptable Price: $${context.minPrice}
- Current Buyer Offer: $${context.currentOffer}
- Urgency Level: ${context.urgency}
- Negotiation Round: ${context.rounds}/${context.maxRounds}

Current Conversation:
${context.conversationHistory}

Latest buyer message: "${userMessage}"

Guidelines:
1. Be friendly but firm in negotiations
2. Consider the urgency level - higher urgency means more flexibility
3. You can accept offers within 5% of minimum price
4. Counter-offer strategically, moving closer to minimum price gradually
5. If offer is very low (>30% discount), politely decline and provide reasoning
6. If offer is reasonable (10-25% discount), counter-offer
7. If offer is good (5-15% discount), show interest and minor counter
8. Keep responses concise and professional
9. Build rapport while protecting the seller's interests
10. Reference the product's value and condition when justifying price

Current offer is ${discountPercentage.toFixed(1)}% below listed price.

Respond with:
1. A conversational message (max 150 words)
2. An action: "accept", "counter", "reject", or "continue"
3. If counter-offering, provide the counter-offer amount and reasoning
4. Rate your confidence (0-1) in this negotiation strategy

Format your response as a conversation, not a business letter.
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Parse AI response to extract action and counter-offer
    let action = 'continue';
    let counterOffer = null;
    let reasoning = '';
    
    // Simple parsing logic - in production, you might want more sophisticated parsing
    if (response.toLowerCase().includes('accept')) {
      action = 'accept';
    } else if (response.toLowerCase().includes('reject') || response.toLowerCase().includes('decline')) {
      action = 'reject';
    } else if (response.toLowerCase().includes('counter')) {
      action = 'counter';
      
      // Extract counter-offer amount (simple regex)
      const counterMatch = response.match(/\$(\d+(?:\.\d{2})?)/);
      if (counterMatch) {
        const amount = parseFloat(counterMatch[1]);
        if (amount >= product.pricing.minPrice && amount <= product.pricing.basePrice) {
          counterOffer = amount;
        }
      }
      
      // If no valid counter-offer found, generate one
      if (!counterOffer) {
        const offerGap = product.pricing.basePrice - (userOffer || negotiation.pricing.currentOffer);
        const counterAmount = (userOffer || negotiation.pricing.currentOffer) + (offerGap * 0.6);
        counterOffer = Math.max(product.pricing.minPrice, Math.min(product.pricing.basePrice, counterAmount));
      }
    }

    return {
      content: response.trim(),
      action,
      offer: counterOffer ? {
        amount: counterOffer,
        reasoning: reasoning || 'Counter-offer based on product value and market conditions'
      } : undefined,
      confidence: 0.8, // Default confidence
      metadata: {
        model: 'gemini-pro',
        promptId: Date.now().toString(),
        processingTime: Date.now(),
        tokensUsed: response.length // Approximate
      }
    };

  } catch (error) {
    console.error('AI response generation error:', error);
    
    // Fallback response
    return {
      content: "Thank you for your offer. Let me consider this and get back to you shortly.",
      action: 'continue',
      confidence: 0.3,
      metadata: {
        model: 'fallback',
        promptId: 'fallback-' + Date.now(),
        processingTime: 0,
        tokensUsed: 0,
        error: error.message
      }
    };
  }
};

// @desc    Start a new negotiation
// @route   POST /api/negotiations/start
// @access  Private
const startNegotiation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { productId, initialOffer, message } = req.body;
    const buyerId = req.user._id;

    // Get product and populate seller
    const product = await Product.findById(productId).populate('seller');
    
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    if (product.status !== 'active') {
      return res.status(400).json({
        status: 'error',
        message: 'Product is not available for negotiation'
      });
    }

    // Check if buyer is not the seller
    if (product.seller._id.toString() === buyerId.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot negotiate on your own product'
      });
    }

    // Check if there's already an active negotiation
    const existingNegotiation = await Negotiation.findOne({
      product: productId,
      buyer: buyerId,
      status: { $in: ['initiated', 'in_progress'] }
    });

    if (existingNegotiation) {
      return res.status(400).json({
        status: 'error',
        message: 'You already have an active negotiation for this product'
      });
    }

    // Validate offer range
    if (initialOffer < product.pricing.minPrice * 0.5) {
      return res.status(400).json({
        status: 'error',
        message: 'Offer is too low. Please make a reasonable offer.'
      });
    }

    if (initialOffer > product.pricing.basePrice) {
      return res.status(400).json({
        status: 'error',
        message: 'Offer cannot exceed the listed price'
      });
    }

    // Create negotiation
    const negotiationData = {
      product: productId,
      buyer: buyerId,
      seller: product.seller._id,
      pricing: {
        initialOffer,
        currentOffer: initialOffer
      },
      messages: [],
      aiContext: {
        personality: 'friendly',
        negotiationStrategy: product.urgency?.level === 'high' ? 'moderate' : 'aggressive',
        priceFlexibility: product.urgency?.level === 'high' ? 0.4 : 0.3,
        urgencyLevel: product.urgency?.level === 'high' ? 0.8 : 0.5
      }
    };

    const negotiation = new Negotiation(negotiationData);

    // Add initial buyer message
    const initialMessage = message || `I'd like to offer $${initialOffer} for your ${product.title}.`;
    await negotiation.addMessage({
      sender: 'buyer',
      type: 'offer',
      content: initialMessage,
      offer: {
        amount: initialOffer,
        currency: product.pricing.currency
      }
    });

    // Generate AI response
    const aiResponse = await generateAIResponse(negotiation, initialMessage, initialOffer);
    
    // Add AI response
    await negotiation.addMessage({
      sender: 'ai',
      type: aiResponse.offer ? 'counter_offer' : 'text',
      content: aiResponse.content,
      offer: aiResponse.offer,
      metadata: aiResponse.metadata
    });

    // Handle AI action
    if (aiResponse.action === 'accept') {
      await negotiation.acceptOffer('seller');
      
      // Update product and user stats
      product.status = 'sold';
      await product.save();
      
      await User.updateUserStats(buyerId, { 
        'stats.productsBought': 1,
        'stats.totalSpent': initialOffer,
        'stats.successfulNegotiations': 1
      });
      
      await User.updateUserStats(product.seller._id, { 
        'stats.productsSold': 1,
        'stats.totalEarnings': initialOffer,
        'stats.successfulNegotiations': 1
      });
    } else if (aiResponse.action === 'reject') {
      await negotiation.rejectOffer('seller', 'Offer is too low for this quality product');
    }

    // Update product analytics
    product.analytics.negotiations += 1;
    if (product.analytics.averageOfferPrice === 0) {
      product.analytics.averageOfferPrice = initialOffer;
    } else {
      product.analytics.averageOfferPrice = 
        (product.analytics.averageOfferPrice + initialOffer) / 2;
    }
    await product.save();

    // Populate for response
    await negotiation.populate([
      { path: 'product', select: 'title images pricing' },
      { path: 'buyer', select: 'username avatar' },
      { path: 'seller', select: 'username avatar' }
    ]);

    // Emit socket event
    if (req.io) {
      req.io.to(`product-${productId}`).emit('negotiation-started', {
        negotiationId: negotiation._id,
        buyerId,
        productId
      });
    }

    res.status(201).json({
      status: 'success',
      message: 'Negotiation started successfully',
      data: {
        negotiation: formatNegotiationResponse(negotiation)
      }
    });

  } catch (error) {
    console.error('Start negotiation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while starting negotiation'
    });
  }
};

// @desc    Send message in negotiation
// @route   POST /api/negotiations/:id/message
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { content, type = 'text' } = req.body;
    const negotiationId = req.params.id;
    const userId = req.user._id;

    const negotiation = await Negotiation.findById(negotiationId)
      .populate('product')
      .populate('buyer seller', 'username avatar');

    if (!negotiation) {
      return res.status(404).json({
        status: 'error',
        message: 'Negotiation not found'
      });
    }

    // Check if user can participate
    if (!negotiation.canParticipate(userId)) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to participate in this negotiation'
      });
    }

    // Check if negotiation can continue
    if (!negotiation.canContinue()) {
      return res.status(400).json({
        status: 'error',
        message: 'This negotiation cannot continue'
      });
    }

    const userRole = negotiation.getParticipantRole(userId);
    const sanitizedContent = sanitizers.sanitizeInput(content);

    // Add user message
    await negotiation.addMessage({
      sender: userRole,
      type,
      content: sanitizedContent
    });

    // Generate AI response if user is buyer
    if (userRole === 'buyer') {
      const aiResponse = await generateAIResponse(negotiation, sanitizedContent);
      
      await negotiation.addMessage({
        sender: 'ai',
        type: aiResponse.offer ? 'counter_offer' : 'text',
        content: aiResponse.content,
        offer: aiResponse.offer,
        metadata: aiResponse.metadata
      });

      // Handle AI actions
      if (aiResponse.action === 'accept') {
        await negotiation.acceptOffer('seller');
        
        // Update product and user stats
        const product = negotiation.product;
        product.status = 'sold';
        await product.save();
        
        await User.updateUserStats(negotiation.buyer._id, { 
          'stats.productsBought': 1,
          'stats.totalSpent': negotiation.pricing.currentOffer,
          'stats.successfulNegotiations': 1
        });
        
        await User.updateUserStats(negotiation.seller._id, { 
          'stats.productsSold': 1,
          'stats.totalEarnings': negotiation.pricing.currentOffer,
          'stats.successfulNegotiations': 1
        });
      } else if (aiResponse.action === 'reject') {
        await negotiation.rejectOffer('seller', 'Unable to accept this offer');
      }
    }

    // Emit socket events
    if (req.io) {
      req.io.to(`negotiation-${negotiationId}`).emit('new-message', {
        negotiationId,
        message: negotiation.lastMessage
      });
    }

    res.json({
      status: 'success',
      message: 'Message sent successfully',
      data: {
        negotiation: formatNegotiationResponse(negotiation)
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while sending message'
    });
  }
};

// @desc    Send offer in negotiation
// @route   POST /api/negotiations/:id/offer
// @access  Private
const sendOffer = async (req, res) => {
  try {
    const { amount, message } = req.body;
    const negotiationId = req.params.id;
    const userId = req.user._id;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Valid offer amount is required'
      });
    }

    const negotiation = await Negotiation.findById(negotiationId)
      .populate('product')
      .populate('buyer seller', 'username avatar');

    if (!negotiation) {
      return res.status(404).json({
        status: 'error',
        message: 'Negotiation not found'
      });
    }

    if (!negotiation.canParticipate(userId)) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to participate in this negotiation'
      });
    }

    if (!negotiation.canContinue()) {
      return res.status(400).json({
        status: 'error',
        message: 'This negotiation cannot continue'
      });
    }

    const product = negotiation.product;
    const userRole = negotiation.getParticipantRole(userId);

    // Validate offer amount
    if (amount > product.pricing.basePrice) {
      return res.status(400).json({
        status: 'error',
        message: 'Offer cannot exceed the listed price'
      });
    }

    if (amount < product.pricing.minPrice * 0.5) {
      return res.status(400).json({
        status: 'error',
        message: 'Offer is too low'
      });
    }

    // Add offer message
    const offerMessage = message || `I'd like to offer $${amount}.`;
    await negotiation.addMessage({
      sender: userRole,
      type: 'offer',
      content: offerMessage,
      offer: {
        amount,
        currency: product.pricing.currency
      }
    });

    // Generate AI response if user is buyer
    if (userRole === 'buyer') {
      const aiResponse = await generateAIResponse(negotiation, offerMessage, amount);
      
      await negotiation.addMessage({
        sender: 'ai',
        type: aiResponse.offer ? 'counter_offer' : 'text',
        content: aiResponse.content,
        offer: aiResponse.offer,
        metadata: aiResponse.metadata
      });

      // Handle AI actions
      if (aiResponse.action === 'accept') {
        await negotiation.acceptOffer('seller');
        
        // Update product and user stats
        product.status = 'sold';
        await product.save();
        
        await User.updateUserStats(negotiation.buyer._id, { 
          'stats.productsBought': 1,
          'stats.totalSpent': amount,
          'stats.successfulNegotiations': 1
        });
        
        await User.updateUserStats(negotiation.seller._id, { 
          'stats.productsSold': 1,
          'stats.totalEarnings': amount,
          'stats.successfulNegotiations': 1
        });
      } else if (aiResponse.action === 'reject') {
        await negotiation.rejectOffer('seller', 'Unable to accept this offer');
      }
    }

    // Update product analytics
    if (product.analytics.averageOfferPrice === 0) {
      product.analytics.averageOfferPrice = amount;
    } else {
      product.analytics.averageOfferPrice = 
        (product.analytics.averageOfferPrice + amount) / 2;
    }
    await product.save();

    // Emit socket events
    if (req.io) {
      req.io.to(`negotiation-${negotiationId}`).emit('new-offer', {
        negotiationId,
        offer: amount,
        sender: userRole
      });
    }

    res.json({
      status: 'success',
      message: 'Offer sent successfully',
      data: {
        negotiation: formatNegotiationResponse(negotiation)
      }
    });

  } catch (error) {
    console.error('Send offer error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while sending offer'
    });
  }
};

// @desc    Get negotiation by ID
// @route   GET /api/negotiations/:id
// @access  Private
const getNegotiation = async (req, res) => {
  try {
    const negotiation = await Negotiation.findById(req.params.id)
      .populate('product', 'title images pricing condition')
      .populate('buyer seller', 'username avatar profile.rating');

    if (!negotiation) {
      return res.status(404).json({
        status: 'error',
        message: 'Negotiation not found'
      });
    }

    // Check if user can access this negotiation
    if (!negotiation.canParticipate(req.user._id)) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to access this negotiation'
      });
    }

    // Mark messages as read
    await negotiation.markMessagesAsRead(req.user._id);

    res.json({
      status: 'success',
      data: {
        negotiation: formatNegotiationResponse(negotiation)
      }
    });

  } catch (error) {
    console.error('Get negotiation error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        status: 'error',
        message: 'Negotiation not found'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching negotiation'
    });
  }
};

// @desc    Get user's negotiations
// @route   GET /api/negotiations
// @access  Private
const getUserNegotiations = async (req, res) => {
  try {
    const {
      status,
      role = 'buyer',
      page = 1,
      limit = 10,
      sortBy = 'updatedAt',
      sortOrder = 'desc'
    } = req.query;

    const userId = req.user._id;
    
    // Build filter
    const filters = {};
    filters[role] = userId;
    
    if (status) {
      filters.status = Array.isArray(status) ? { $in: status } : status;
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [negotiations, total] = await Promise.all([
      Negotiation.find(filters)
        .populate('product', 'title images pricing condition')
        .populate('buyer seller', 'username avatar profile.rating')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit)),
      Negotiation.countDocuments(filters)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      status: 'success',
      data: {
        negotiations: negotiations.map(formatNegotiationResponse),
        pagination: {
          current: parseInt(page),
          pages: totalPages,
          total,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get user negotiations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching negotiations'
    });
  }
};

module.exports = {
  startNegotiation,
  sendMessage,
  sendOffer,
  getNegotiation,
  getUserNegotiations
};
