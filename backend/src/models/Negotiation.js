const mongoose = require('mongoose');

const negotiationMessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['buyer', 'seller', 'ai'],
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'offer', 'counter_offer', 'acceptance', 'rejection', 'system'],
    default: 'text'
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  offer: {
    amount: {
      type: Number,
      min: [0, 'Offer amount must be positive']
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  metadata: {
    aiModel: String,
    promptId: String,
    processingTime: Number,
    tokensUsed: Number,
    confidence: {
      type: Number,
      min: 0,
      max: 1
    }
  },
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reaction: {
      type: String,
      enum: ['👍', '👎', '😊', '😞', '🤔', '✅', '❌']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  editedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const negotiationSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required'],
    index: true
  },
  participant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Participant is required'],
    index: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required'],
    index: true
  },
  status: {
    type: String,
    enum: ['initiated', 'in_progress', 'completed', 'cancelled', 'expired', 'rejected'],
    default: 'initiated',
    index: true
  },
  messages: [negotiationMessageSchema],
  pricing: {
    initialOffer: {
      type: Number,
      required: [true, 'Initial offer is required'],
      min: [0, 'Initial offer must be positive']
    },
    currentOffer: {
      type: Number,
      min: [0, 'Current offer must be positive']
    },
    finalPrice: {
      type: Number,
      min: [0, 'Final price must be positive']
    },
    currency: {
      type: String,
      default: 'USD'
    },
    offerHistory: [{
      amount: {
        type: Number,
        required: true,
        min: 0
      },
      offeredBy: {
        type: String,
        enum: ['buyer', 'seller', 'ai'],
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      messageId: {
        type: mongoose.Schema.Types.ObjectId
      }
    }]
  },
  rounds: {
    type: Number,
    default: 1,
    min: 1
  },
  maxRounds: {
    type: Number,
    default: 10,
    min: 1,
    max: 20
  },
  aiContext: {
    personality: {
      type: String,
      default: 'friendly'
    },
    negotiationStrategy: {
      type: String,
      enum: ['aggressive', 'moderate', 'passive', 'adaptive'],
      default: 'moderate'
    },
    priceFlexibility: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.3
    },
    urgencyLevel: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    marketContext: {
      averagePrice: Number,
      competitorPrices: [Number],
      demand: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      }
    },
    conversationHistory: [String],
    userPreferences: {
      communicationStyle: String,
      pricePreferences: String
    }
  },
  analytics: {
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: Date,
    duration: Number, // in minutes
    averageResponseTime: {
      type: Number,
      default: 0
    },
    totalMessages: {
      type: Number,
      default: 0
    },
    priceMovement: {
      direction: {
        type: String,
        enum: ['up', 'down', 'stable']
      },
      magnitude: Number,
      percentage: Number
    },
    sentimentAnalysis: {
      overall: {
        type: String,
        enum: ['positive', 'neutral', 'negative']
      },
      trend: {
        type: String,
        enum: ['improving', 'stable', 'declining']
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1
      }
    },
    responseTimeHistory: [{
      timestamp: Date,
      responseTime: Number, // in seconds
      sender: {
        type: String,
        enum: ['buyer', 'seller', 'ai']
      }
    }]
  },
  settings: {
    autoAcceptThreshold: Number,
    timeoutMinutes: {
      type: Number,
      default: 1440 // 24 hours
    },
    allowCounterOffers: {
      type: Boolean,
      default: true
    },
    requireFinalConfirmation: {
      type: Boolean,
      default: true
    }
  },
  timeline: [{
    event: {
      type: String,
      enum: ['initiated', 'message_sent', 'offer_made', 'offer_accepted', 'offer_rejected', 'completed', 'cancelled', 'expired'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    actor: {
      type: String,
      enum: ['buyer', 'seller', 'ai', 'system']
    },
    details: String,
    metadata: mongoose.Schema.Types.Mixed
  }],
  completedAt: Date,
  cancelledAt: Date,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: String,
  expiresAt: {
    type: Date,
    default: function() {
      // Default expiry: 7 days from creation
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    },
    index: { expireAfterSeconds: 0 } // TTL index for expired negotiations
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
negotiationSchema.index({ product: 1, buyer: 1 }, { unique: true });
negotiationSchema.index({ seller: 1, status: 1 });
negotiationSchema.index({ createdAt: -1 });
negotiationSchema.index({ status: 1, expiresAt: 1 });

// Virtual for negotiation progress
negotiationSchema.virtual('progress').get(function() {
  return {
    currentRound: this.rounds,
    maxRounds: this.maxRounds,
    percentage: (this.rounds / this.maxRounds) * 100,
    remainingRounds: this.maxRounds - this.rounds
  };
});

// Virtual for price range
negotiationSchema.virtual('priceRange').get(function() {
  if (!this.populated('product')) return null;
  
  return {
    min: this.product.pricing.minPrice,
    max: this.product.pricing.basePrice,
    current: this.pricing.currentOffer,
    initial: this.pricing.initialOffer
  };
});

// Virtual for active participants
negotiationSchema.virtual('participants').get(function() {
  return [this.buyer, this.seller];
});

// Virtual for last message
negotiationSchema.virtual('lastMessage').get(function() {
  return this.messages[this.messages.length - 1] || null;
});

// Virtual for unread messages count
negotiationSchema.virtual('unreadMessagesCount').get(function() {
  return this.messages.filter(msg => !msg.isRead).length;
});

// Pre-save middleware to update analytics
negotiationSchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    this.analytics.totalMessages = this.messages.length;
    
    // Calculate average response time
    if (this.analytics.responseTimeHistory.length > 0) {
      const totalTime = this.analytics.responseTimeHistory.reduce((sum, entry) => sum + entry.responseTime, 0);
      this.analytics.averageResponseTime = totalTime / this.analytics.responseTimeHistory.length;
    }
  }
  
  // Update current offer from latest offer message
  const latestOffer = this.messages
    .filter(msg => msg.type === 'offer' || msg.type === 'counter_offer')
    .pop();
  
  if (latestOffer && latestOffer.offer) {
    this.pricing.currentOffer = latestOffer.offer.amount;
  }
  
  next();
});

// Pre-save middleware to add timeline events
negotiationSchema.pre('save', function(next) {
  if (this.isNew) {
    this.timeline.push({
      event: 'initiated',
      actor: 'buyer',
      details: `Negotiation started with initial offer of ${this.pricing.initialOffer}`
    });
  }
  
  if (this.isModified('status')) {
    let event = this.status;
    let actor = 'system';
    
    if (this.status === 'completed') {
      this.completedAt = new Date();
      this.analytics.endTime = new Date();
      this.analytics.duration = (this.analytics.endTime - this.analytics.startTime) / (1000 * 60); // minutes
      event = 'completed';
    } else if (this.status === 'cancelled') {
      this.cancelledAt = new Date();
      event = 'cancelled';
    }
    
    this.timeline.push({
      event,
      actor,
      details: `Status changed to ${this.status}`
    });
  }
  
  next();
});

// Static method to find active negotiations for a user
negotiationSchema.statics.findActiveByUser = function(userId, role = 'buyer') {
  const query = { status: { $in: ['initiated', 'in_progress'] } };
  query[role] = userId;
  
  return this.find(query)
    .populate('product', 'title images pricing')
    .populate('buyer', 'username avatar')
    .populate('seller', 'username avatar')
    .sort({ updatedAt: -1 });
};

// Static method to get negotiation statistics
negotiationSchema.statics.getStatistics = function(filters = {}) {
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
        averageRounds: { $avg: '$rounds' },
        averageDuration: { $avg: '$analytics.duration' },
        averageFinalPrice: { $avg: '$pricing.finalPrice' }
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

// Instance method to add message
negotiationSchema.methods.addMessage = function(messageData) {
  const message = {
    sender: messageData.sender,
    type: messageData.type || 'text',
    content: messageData.content,
    offer: messageData.offer,
    metadata: messageData.metadata
  };
  
  this.messages.push(message);
  
  // Add to timeline
  this.timeline.push({
    event: 'message_sent',
    actor: messageData.sender,
    details: messageData.type === 'offer' ? 
      `${messageData.sender} made an offer of ${messageData.offer?.amount}` :
      `${messageData.sender} sent a message`
  });
  
  // Increment rounds if it's an offer
  if (messageData.type === 'offer' || messageData.type === 'counter_offer') {
    this.rounds += 1;
    
    // Add to offer history
    this.pricing.offerHistory.push({
      amount: messageData.offer.amount,
      offeredBy: messageData.sender,
      messageId: this.messages[this.messages.length - 1]._id
    });
    
    this.timeline.push({
      event: 'offer_made',
      actor: messageData.sender,
      details: `Offer of ${messageData.offer.amount} made`
    });
  }
  
  // Update status if first message
  if (this.status === 'initiated' && this.messages.length === 1) {
    this.status = 'in_progress';
  }
  
  return this.save();
};

// Instance method to accept negotiation
negotiationSchema.methods.acceptOffer = function(acceptedBy) {
  this.status = 'completed';
  this.pricing.finalPrice = this.pricing.currentOffer;
  
  this.timeline.push({
    event: 'offer_accepted',
    actor: acceptedBy,
    details: `Offer accepted at ${this.pricing.finalPrice}`
  });
  
  return this.save();
};

// Instance method to reject negotiation
negotiationSchema.methods.rejectOffer = function(rejectedBy, reason) {
  this.status = 'rejected';
  
  this.timeline.push({
    event: 'offer_rejected',
    actor: rejectedBy,
    details: reason || 'Offer rejected'
  });
  
  return this.save();
};

// Instance method to cancel negotiation
negotiationSchema.methods.cancel = function(cancelledBy, reason) {
  this.status = 'cancelled';
  this.cancelledBy = cancelledBy;
  this.cancellationReason = reason;
  
  this.timeline.push({
    event: 'cancelled',
    actor: 'user',
    details: reason || 'Negotiation cancelled'
  });
  
  return this.save();
};

// Instance method to check if user can participate
negotiationSchema.methods.canParticipate = function(userId) {
  return this.buyer.toString() === userId.toString() || 
         this.seller.toString() === userId.toString();
};

// Instance method to check if negotiation can continue
negotiationSchema.methods.canContinue = function() {
  if (this.status !== 'in_progress') return false;
  if (this.rounds >= this.maxRounds) return false;
  if (this.expiresAt && this.expiresAt < new Date()) return false;
  
  return true;
};

// Instance method to get participant role
negotiationSchema.methods.getParticipantRole = function(userId) {
  if (this.buyer.toString() === userId.toString()) return 'buyer';
  if (this.seller.toString() === userId.toString()) return 'seller';
  return null;
};

// Instance method to mark messages as read
negotiationSchema.methods.markMessagesAsRead = function(userId) {
  const userRole = this.getParticipantRole(userId);
  if (!userRole) return;
  
  this.messages.forEach(message => {
    if (message.sender !== userRole && !message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
    }
  });
  
  return this.save();
};

module.exports = mongoose.model('Negotiation', negotiationSchema);
