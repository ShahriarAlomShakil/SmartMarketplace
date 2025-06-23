const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters'],
    index: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: [
      'electronics',
      'clothing',
      'home',
      'sports',
      'books',
      'beauty',
      'automotive',
      'toys',
      'jewelry',
      'art',
      'music',
      'other'
    ],
    index: true
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: [50, 'Subcategory cannot exceed 50 characters']
  },
  condition: {
    type: String,
    required: [true, 'Product condition is required'],
    enum: ['new', 'like_new', 'good', 'fair', 'poor'],
    default: 'good'
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [50, 'Brand cannot exceed 50 characters']
  },
  model: {
    type: String,
    trim: true,
    maxlength: [50, 'Model cannot exceed 50 characters']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  pricing: {
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0.01, 'Base price must be greater than 0']
    },
    minPrice: {
      type: Number,
      required: [true, 'Minimum price is required'],
      min: [0.01, 'Minimum price must be greater than 0']
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']
    },
    negotiable: {
      type: Boolean,
      default: true
    }
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller is required'],
    index: true
  },
  location: {
    city: String,
    state: String,
    country: String,
    zipCode: String,
    coordinates: {
      latitude: {
        type: Number,
        min: [-90, 'Invalid latitude'],
        max: [90, 'Invalid latitude']
      },
      longitude: {
        type: Number,
        min: [-180, 'Invalid longitude'],
        max: [180, 'Invalid longitude']
      }
    },
    shippingAvailable: {
      type: Boolean,
      default: false
    },
    localPickupOnly: {
      type: Boolean,
      default: true
    }
  },
  specifications: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['cm', 'inch'],
        default: 'cm'
      }
    },
    color: String,
    size: String,
    material: String,
    customFields: [{
      name: String,
      value: String
    }]
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'sold', 'inactive', 'deleted'],
    default: 'active',
    index: true
  },
  urgency: {
    level: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    reason: String
  },
  availability: {
    quantity: {
      type: Number,
      default: 1,
      min: [0, 'Quantity cannot be negative']
    },
    reservedQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Reserved quantity cannot be negative']
    },
    availableUntil: Date
  },
  analytics: {
    views: {
      type: Number,
      default: 0,
      min: 0
    },
    favorites: {
      type: Number,
      default: 0,
      min: 0
    },
    negotiations: {
      type: Number,
      default: 0,
      min: 0
    },
    inquiries: {
      type: Number,
      default: 0,
      min: 0
    },
    averageOfferPrice: {
      type: Number,
      default: 0,
      min: 0
    },
    lastViewed: Date,
    impressions: [{
      date: { type: Date, default: Date.now },
      count: { type: Number, default: 1 }
    }]
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    slug: {
      type: String,
      unique: true,
      sparse: true
    }
  },
  moderation: {
    isApproved: {
      type: Boolean,
      default: true
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    moderatedAt: Date,
    rejectionReason: String,
    flags: [{
      reason: String,
      reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reportedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  featured: {
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    featuredUntil: Date,
    featuredLevel: {
      type: String,
      enum: ['basic', 'premium', 'highlight'],
      default: 'basic'
    }
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Default expiry: 30 days from creation
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    },
    index: { expireAfterSeconds: 0 } // TTL index
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ 'pricing.basePrice': 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ seller: 1, status: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'analytics.views': -1 });
productSchema.index({ 'featured.isFeatured': 1, createdAt: -1 });
productSchema.index({ 'location.coordinates': '2dsphere' });

// Virtual for available quantity
productSchema.virtual('availableQuantity').get(function() {
  return this.availability.quantity - this.availability.reservedQuantity;
});

// Virtual for price range
productSchema.virtual('priceRange').get(function() {
  return {
    min: this.pricing.minPrice,
    max: this.pricing.basePrice,
    difference: this.pricing.basePrice - this.pricing.minPrice,
    negotiabilityPercentage: ((this.pricing.basePrice - this.pricing.minPrice) / this.pricing.basePrice * 100).toFixed(2)
  };
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primaryImg = this.images.find(img => img.isPrimary);
  return primaryImg || this.images[0] || null;
});

// Virtual for product URL
productSchema.virtual('url').get(function() {
  return `/products/${this._id}`;
});

// Virtual for seller rating
productSchema.virtual('sellerRating', {
  ref: 'User',
  localField: 'seller',
  foreignField: '_id',
  justOne: true,
  options: { select: 'profile.rating username' }
});

// Virtual for active negotiations count
productSchema.virtual('activeNegotiationsCount', {
  ref: 'Negotiation',
  localField: '_id',
  foreignField: 'product',
  count: true,
  match: { status: { $in: ['initiated', 'in_progress'] } }
});

// Pre-save middleware to validate price range
productSchema.pre('save', function(next) {
  if (this.pricing.minPrice > this.pricing.basePrice) {
    return next(new Error('Minimum price cannot be greater than base price'));
  }
  next();
});

// Pre-save middleware to generate slug
productSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.seo.slug) {
    this.seo.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      + '-' + this._id;
  }
  next();
});

// Pre-save middleware to ensure only one primary image
productSchema.pre('save', function(next) {
  if (this.isModified('images')) {
    const primaryImages = this.images.filter(img => img.isPrimary);
    if (primaryImages.length > 1) {
      // Keep only the first primary image
      this.images.forEach((img, index) => {
        if (index > 0) {
          img.isPrimary = false;
        }
      });
    } else if (primaryImages.length === 0 && this.images.length > 0) {
      // Set first image as primary if none is set
      this.images[0].isPrimary = true;
    }
  }
  next();
});

// Static method to find products by location
productSchema.statics.findByLocation = function(coordinates, maxDistance = 10000) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance
      }
    },
    status: 'active'
  });
};

// Static method to get trending products
productSchema.statics.getTrending = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ 'analytics.views': -1, createdAt: -1 })
    .limit(limit)
    .populate('seller', 'username profile.rating');
};

// Static method to get featured products
productSchema.statics.getFeatured = function(limit = 10) {
  return this.find({ 
    status: 'active',
    'featured.isFeatured': true,
    'featured.featuredUntil': { $gt: new Date() }
  })
    .sort({ 'featured.featuredLevel': 1, createdAt: -1 })
    .limit(limit)
    .populate('seller', 'username profile.rating');
};

// Static method to search products
productSchema.statics.searchProducts = function(query, filters = {}) {
  const searchQuery = { status: 'active' };
  
  // Text search
  if (query) {
    searchQuery.$text = { $search: query };
  }
  
  // Apply filters
  if (filters.category) {
    searchQuery.category = filters.category;
  }
  
  if (filters.condition) {
    searchQuery.condition = { $in: Array.isArray(filters.condition) ? filters.condition : [filters.condition] };
  }
  
  if (filters.priceRange) {
    searchQuery['pricing.basePrice'] = {};
    if (filters.priceRange.min) {
      searchQuery['pricing.basePrice'].$gte = filters.priceRange.min;
    }
    if (filters.priceRange.max) {
      searchQuery['pricing.basePrice'].$lte = filters.priceRange.max;
    }
  }
  
  if (filters.location && filters.location.coordinates) {
    searchQuery['location.coordinates'] = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: filters.location.coordinates
        },
        $maxDistance: filters.location.maxDistance || 50000
      }
    };
  }
  
  return this.find(searchQuery)
    .populate('seller', 'username profile.rating')
    .sort(query ? { score: { $meta: 'textScore' } } : { createdAt: -1 });
};

// Static method to get similar products
productSchema.statics.getSimilarProducts = function(productId, limit = 6) {
  return this.findById(productId)
    .then(product => {
      if (!product) {
        throw new Error('Product not found');
      }
      
      // Find similar products based on category, price range, and tags
      const similarityQuery = {
        _id: { $ne: productId },
        status: 'active',
        $or: [
          { category: product.category },
          { tags: { $in: product.tags } },
          {
            'pricing.basePrice': {
              $gte: product.pricing.basePrice * 0.5,
              $lte: product.pricing.basePrice * 1.5
            }
          }
        ]
      };
      
      return this.find(similarityQuery)
        .populate('seller', 'username profile.rating')
        .sort({ createdAt: -1 })
        .limit(limit);
    });
};

// Instance method to increment view count
productSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  this.analytics.lastViewed = new Date();
  
  // Update daily impressions
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayImpression = this.analytics.impressions.find(imp => 
    imp.date.toDateString() === today.toDateString()
  );
  
  if (todayImpression) {
    todayImpression.count += 1;
  } else {
    this.analytics.impressions.push({ date: today, count: 1 });
    
    // Keep only last 30 days of impressions
    if (this.analytics.impressions.length > 30) {
      this.analytics.impressions = this.analytics.impressions
        .sort((a, b) => b.date - a.date)
        .slice(0, 30);
    }
  }
  
  return this.save();
};

// Instance method to check availability
productSchema.methods.isAvailable = function(requestedQuantity = 1) {
  if (this.status !== 'active') {
    return false;
  }
  
  if (this.availability.availableUntil && this.availability.availableUntil < new Date()) {
    return false;
  }
  
  return this.availableQuantity >= requestedQuantity;
};

// Instance method to reserve quantity
productSchema.methods.reserveQuantity = function(quantity) {
  if (!this.isAvailable(quantity)) {
    throw new Error('Insufficient quantity available');
  }
  
  this.availability.reservedQuantity += quantity;
  return this.save();
};

// Instance method to release reserved quantity
productSchema.methods.releaseReservedQuantity = function(quantity) {
  this.availability.reservedQuantity = Math.max(0, this.availability.reservedQuantity - quantity);
  return this.save();
};

module.exports = mongoose.model('Product', productSchema);
