const Negotiation = require('../models/Negotiation');
const Product = require('../models/Product');
const User = require('../models/User');
const { getGeminiModel, geminiConfig } = require('../config/gemini');
const { validationResult } = require('express-validator');
const { sanitizers } = require('../middleware/validation');

// Day 12 Enhancement - Import enhanced processing systems
const responseProcessor = require('../utils/responseProcessor');
const contextManager = require('../utils/contextManager');
const GeminiService = require('../services/geminiService');

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
    const product = negotiation.product;
    
    // Build enhanced context for AI with Day 12 improvements
    const context = {
      productTitle: product.title,
      basePrice: product.pricing.basePrice,
      minPrice: product.pricing.minPrice,
      currentOffer: userOffer || negotiation.pricing.currentOffer,
      rounds: negotiation.rounds,
      maxRounds: negotiation.maxRounds,
      urgency: product.urgency?.level || 'medium',
      personality: product.seller?.personality || 'professional',
      category: product.category || 'general',
      conversationHistory: negotiation.messages.slice(-5),
      userMessage: userMessage,
      userId: negotiation.buyer.toString(),
      negotiationId: negotiation._id.toString()
    };

    // Use enhanced response processing pipeline
    const rawResponse = await GeminiService.generateNegotiationResponse(context);
    const processedResponse = await responseProcessor.processResponse(rawResponse.content, context);

    // Store conversation context for future reference
    contextManager.addMessage(negotiation._id.toString(), {
      content: userMessage,
      sender: 'buyer',
      action: 'message',
      offer: userOffer ? { amount: userOffer } : null
    });

    contextManager.addMessage(negotiation._id.toString(), {
      content: processedResponse.data.message,
      sender: 'ai',
      action: processedResponse.data.action,
      offer: processedResponse.data.offer,
      confidence: processedResponse.data.confidence / 100
    });

    return {
      content: processedResponse.data.message,
      action: processedResponse.data.action,
      offer: processedResponse.data.offer,
      confidence: processedResponse.data.confidence / 100,
      reasoning: processedResponse.data.reasoning || '',
      metadata: processedResponse.data.metadata
    };

  } catch (error) {
    console.error('Error generating AI response:', error);
    
    // Enhanced fallback response with better logic
    const { currentOffer, basePrice, minPrice } = {
      currentOffer: userOffer || negotiation.pricing.currentOffer,
      basePrice: negotiation.product.pricing.basePrice,
      minPrice: negotiation.product.pricing.minPrice
    };

    const fallbackResponses = [
      "Thank you for your offer. Let me think about this and get back to you.",
      "I appreciate your interest. Let me review your proposal carefully.",
      "That's an interesting offer. Give me a moment to consider it.",
      "Thanks for reaching out. I need to evaluate this offer."
    ];

    let action = 'continue';
    let offer = null;

    // Enhanced fallback logic
    if (currentOffer >= minPrice * 1.1) {
      action = 'counter';
      const strategicPrice = Math.round(currentOffer + ((basePrice - currentOffer) * 0.5));
      offer = { amount: strategicPrice, final: false, formatted: `$${strategicPrice.toLocaleString()}` };
    } else if (currentOffer < minPrice * 0.8) {
      action = 'reject';
    } else if (negotiation.rounds >= negotiation.maxRounds - 1) {
      // Final round logic
      if (currentOffer >= minPrice) {
        action = 'accept';
        offer = { amount: currentOffer, final: true, formatted: `$${currentOffer.toLocaleString()}` };
      } else {
        action = 'reject';
      }
    }

    return {
      content: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
      action,
      offer,
      confidence: 0.3,
      reasoning: 'Fallback response - AI service temporarily unavailable',
      metadata: {
        model: 'fallback',
        isFallback: true,
        error: error.message,
        timestamp: new Date().toISOString()
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

// @desc    Accept current offer
// @route   POST /api/negotiations/:id/accept
// @access  Private
const acceptOffer = async (req, res) => {
  try {
    res.json({
      status: 'success',
      message: 'Offer accepted functionality coming soon'
    });
  } catch (error) {
    console.error('Accept offer error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while accepting offer'
    });
  }
};

// @desc    Reject current offer
// @route   POST /api/negotiations/:id/reject
// @access  Private
const rejectOffer = async (req, res) => {
  try {
    res.json({
      status: 'success',
      message: 'Offer rejected functionality coming soon'
    });
  } catch (error) {
    console.error('Reject offer error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while rejecting offer'
    });
  }
};

// @desc    Cancel negotiation
// @route   POST /api/negotiations/:id/cancel
// @access  Private
const cancelNegotiation = async (req, res) => {
  try {
    res.json({
      status: 'success',
      message: 'Cancel negotiation functionality coming soon'
    });
  } catch (error) {
    console.error('Cancel negotiation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while canceling negotiation'
    });
  }
};

// @desc    Get negotiation history
// @route   GET /api/negotiations/history
// @access  Private
const getNegotiationHistory = async (req, res) => {
  try {
    res.json({
      status: 'success',
      data: { negotiations: [] },
      message: 'Negotiation history functionality coming soon'
    });
  } catch (error) {
    console.error('Get negotiation history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching negotiation history'
    });
  }
};

// @desc    Get product negotiations
// @route   GET /api/negotiations/product/:productId
// @access  Private
const getProductNegotiations = async (req, res) => {
  try {
    res.json({
      status: 'success',
      data: { negotiations: [] },
      message: 'Product negotiations functionality coming soon'
    });
  } catch (error) {
    console.error('Get product negotiations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching product negotiations'
    });
  }
};

// @desc    Get active negotiations
// @route   GET /api/negotiations/active
// @access  Private
const getActiveNegotiations = async (req, res) => {
  try {
    res.json({
      status: 'success',
      data: { negotiations: [] },
      message: 'Active negotiations functionality coming soon'
    });
  } catch (error) {
    console.error('Get active negotiations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching active negotiations'
    });
  }
};

// @desc    Get completed negotiations
// @route   GET /api/negotiations/completed
// @access  Private
const getCompletedNegotiations = async (req, res) => {
  try {
    res.json({
      status: 'success',
      data: { negotiations: [] },
      message: 'Completed negotiations functionality coming soon'
    });
  } catch (error) {
    console.error('Get completed negotiations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching completed negotiations'
    });
  }
};

// @desc    Get negotiation analytics
// @route   GET /api/negotiations/analytics
// @access  Private
const getNegotiationAnalytics = async (req, res) => {
  try {
    res.json({
      status: 'success',
      data: { analytics: {} },
      message: 'Negotiation analytics functionality coming soon'
    });
  } catch (error) {
    console.error('Get negotiation analytics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching negotiation analytics'
    });
  }
};

// @desc    Send typing indicator
// @route   POST /api/negotiations/:id/typing
// @access  Private
const sendTypingIndicator = async (req, res) => {
  try {
    res.json({
      status: 'success',
      message: 'Typing indicator functionality coming soon'
    });
  } catch (error) {
    console.error('Send typing indicator error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while sending typing indicator'
    });
  }
};

// @desc    Mark messages as read
// @route   POST /api/negotiations/:id/read
// @access  Private
const markMessagesAsRead = async (req, res) => {
  try {
    res.json({
      status: 'success',
      message: 'Mark messages as read functionality coming soon'
    });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while marking messages as read'
    });
  }
};

// @desc    Get AI suggestions
// @route   GET /api/negotiations/:id/ai-suggestions
// @access  Private
const getAISuggestions = async (req, res) => {
  try {
    res.json({
      status: 'success',
      data: { suggestions: [] },
      message: 'AI suggestions functionality coming soon'
    });
  } catch (error) {
    console.error('Get AI suggestions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching AI suggestions'
    });
  }
};

module.exports = {
  startNegotiation,
  sendMessage,
  sendOffer,
  getNegotiation,
  getUserNegotiations,
  acceptOffer,
  rejectOffer,
  cancelNegotiation,
  getNegotiationHistory,
  getProductNegotiations,
  getActiveNegotiations,
  getCompletedNegotiations,
  getNegotiationAnalytics,
  sendTypingIndicator,
  markMessagesAsRead,
  getAISuggestions
};
