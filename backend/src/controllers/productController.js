const Product = require('../models/Product');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { sanitizers } = require('../middleware/validation');

// Helper function to format product response
const formatProductResponse = (product) => {
  return {
    _id: product._id,
    title: product.title,
    description: product.description,
    category: product.category,
    subcategory: product.subcategory,
    condition: product.condition,
    brand: product.brand,
    model: product.model,
    images: product.images,
    pricing: product.pricing,
    priceRange: product.priceRange,
    seller: product.seller,
    location: product.location,
    specifications: product.specifications,
    tags: product.tags,
    status: product.status,
    urgency: product.urgency,
    availability: product.availability,
    availableQuantity: product.availableQuantity,
    analytics: product.analytics,
    featured: product.featured,
    primaryImage: product.primaryImage,
    url: product.url,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    expiresAt: product.expiresAt
  };
};

// @desc    Get all products with filtering and pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      condition,
      minPrice,
      maxPrice,
      location,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      featured,
      seller
    } = req.query;

    // Build filter object
    const filters = { status: 'active' };

    if (category) {
      filters.category = category;
    }

    if (condition) {
      filters.condition = Array.isArray(condition) ? { $in: condition } : condition;
    }

    if (minPrice || maxPrice) {
      filters['pricing.basePrice'] = {};
      if (minPrice) filters['pricing.basePrice'].$gte = parseFloat(minPrice);
      if (maxPrice) filters['pricing.basePrice'].$lte = parseFloat(maxPrice);
    }

    if (featured === 'true') {
      filters['featured.isFeatured'] = true;
      filters['featured.featuredUntil'] = { $gt: new Date() };
    }

    if (seller) {
      filters.seller = seller;
    }

    // Location-based filtering
    if (location && location.coordinates) {
      filters['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(location.coordinates[1]), parseFloat(location.coordinates[0])]
          },
          $maxDistance: location.maxDistance || 50000 // 50km default
        }
      };
    }

    // Text search
    if (search) {
      filters.$text = { $search: sanitizers.sanitizeSearchQuery(search) };
    }

    // Build sort object
    const sortObj = {};
    if (search && filters.$text) {
      sortObj.score = { $meta: 'textScore' };
    }
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [products, total] = await Promise.all([
      Product.find(filters)
        .populate('seller', 'username profile.rating avatar')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(filters)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      status: 'success',
      data: {
        products: products.map(formatProductResponse),
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
    console.error('Get products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching products'
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'username profile.rating avatar profile.location stats createdAt');

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Increment view count if not the seller viewing
    if (!req.user || req.user._id.toString() !== product.seller._id.toString()) {
      await product.incrementViews();
    }

    res.json({
      status: 'success',
      data: {
        product: formatProductResponse(product)
      }
    });

  } catch (error) {
    console.error('Get product error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching product'
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Parse JSON fields from FormData
    const location = req.body.location ? JSON.parse(req.body.location) : {};
    const tags = req.body.tags ? JSON.parse(req.body.tags) : [];
    const urgency = req.body.urgency ? JSON.parse(req.body.urgency) : { level: 'medium' };
    const primaryImageIndex = req.body.primaryImageIndex ? parseInt(req.body.primaryImageIndex) : 0;

    // Process uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        const imageUrl = `/uploads/products/${file.filename}`;
        images.push({
          url: imageUrl,
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
          isPrimary: index === primaryImageIndex,
          uploadedAt: new Date()
        });
      });
    }

    // Validate price range
    const basePrice = parseFloat(req.body.basePrice);
    const minPrice = parseFloat(req.body.minPrice);
    
    if (minPrice > basePrice) {
      return res.status(400).json({
        status: 'error',
        message: 'Minimum price cannot be greater than base price'
      });
    }

    // Build product data structure
    const productData = {
      title: sanitizers.sanitizeInput(req.body.title),
      description: sanitizers.sanitizeInput(req.body.description),
      category: req.body.category,
      subcategory: req.body.subcategory || '',
      condition: req.body.condition,
      brand: req.body.brand || '',
      model: req.body.model || '',
      images: images,
      pricing: {
        basePrice: basePrice,
        minPrice: minPrice,
        currency: req.body.currency || 'USD',
        negotiable: req.body.negotiable === 'true'
      },
      seller: req.user._id,
      location: {
        city: location.city || '',
        state: location.state || '',
        country: location.country || '',
        zipCode: location.zipCode || '',
        coordinates: location.coordinates || null,
        shippingAvailable: location.shippingAvailable || false,
        localPickupOnly: location.localPickupOnly || true
      },
      tags: sanitizers.sanitizeTags(tags),
      urgency: urgency,
      status: 'active',
      availability: {
        isAvailable: true,
        quantity: 1,
        reservedQuantity: 0
      },
      analytics: {
        views: 0,
        likes: 0,
        shares: 0,
        inquiries: 0
      }
    };

    const product = new Product(productData);
    await product.save();

    // Update user stats
    await User.updateUserStats(req.user._id, { 'stats.productsListed': 1 });

    // Populate seller info for response
    await product.populate('seller', 'username profile.rating avatar');

    res.status(201).json({
      status: 'success',
      message: 'Product created successfully',
      data: {
        product: formatProductResponse(product)
      }
    });

  } catch (error) {
    console.error('Create product error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating product'
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (owner only)
const updateProduct = async (req, res) => {
  try {
    const allowedUpdates = [
      'title', 'description', 'category', 'subcategory', 'condition',
      'brand', 'model', 'pricing', 'location', 'specifications',
      'tags', 'urgency', 'availability'
    ];

    const updates = {};

    // Filter allowed updates and sanitize
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (typeof req.body[key] === 'string') {
          updates[key] = sanitizers.sanitizeInput(req.body[key]);
        } else if (key === 'tags') {
          updates[key] = sanitizers.sanitizeTags(req.body[key]);
        } else {
          updates[key] = req.body[key];
        }
      }
    });

    // Validate price range if pricing is being updated
    if (updates.pricing) {
      const product = await Product.findById(req.params.id);
      const newPricing = { ...product.pricing.toObject(), ...updates.pricing };
      
      if (newPricing.minPrice > newPricing.basePrice) {
        return res.status(400).json({
          status: 'error',
          message: 'Minimum price cannot be greater than base price'
        });
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('seller', 'username profile.rating avatar');

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Product updated successfully',
      data: {
        product: formatProductResponse(product)
      }
    });

  } catch (error) {
    console.error('Update product error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating product'
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (owner only)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Soft delete by changing status
    product.status = 'deleted';
    await product.save();

    // Update user stats
    await User.updateUserStats(req.user._id, { 'stats.productsListed': -1 });

    res.json({
      status: 'success',
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting product'
    });
  }
};

// @desc    Get products by seller
// @route   GET /api/products/seller/:sellerId
// @access  Public
const getProductsBySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const {
      page = 1,
      limit = 12,
      status = 'active',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filters = { seller: sellerId };
    
    // If not the seller themselves, only show active products
    if (!req.user || req.user._id.toString() !== sellerId) {
      filters.status = 'active';
    } else if (status !== 'all') {
      filters.status = status;
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [products, total] = await Promise.all([
      Product.find(filters)
        .populate('seller', 'username profile.rating avatar')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(filters)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      status: 'success',
      data: {
        products: products.map(formatProductResponse),
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
    console.error('Get products by seller error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching seller products'
    });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const products = await Product.getFeatured(parseInt(limit));

    res.json({
      status: 'success',
      data: {
        products: products.map(formatProductResponse)
      }
    });

  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching featured products'
    });
  }
};

// @desc    Get trending products
// @route   GET /api/products/trending
// @access  Public
const getTrendingProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const products = await Product.getTrending(parseInt(limit));

    res.json({
      status: 'success',
      data: {
        products: products.map(formatProductResponse)
      }
    });

  } catch (error) {
    console.error('Get trending products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching trending products'
    });
  }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
const searchProducts = async (req, res) => {
  try {
    const {
      q: query,
      category,
      condition,
      minPrice,
      maxPrice,
      location,
      page = 1,
      limit = 12,
      sortBy = 'relevance'
    } = req.query;

    if (!query) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required'
      });
    }

    // Build filters
    const filters = {};

    if (category) filters.category = category;
    if (condition) filters.condition = Array.isArray(condition) ? { $in: condition } : condition;
    
    if (minPrice || maxPrice) {
      filters.priceRange = {};
      if (minPrice) filters.priceRange.min = parseFloat(minPrice);
      if (maxPrice) filters.priceRange.max = parseFloat(maxPrice);
    }

    if (location && location.coordinates) {
      filters.location = {
        coordinates: [parseFloat(location.coordinates[1]), parseFloat(location.coordinates[0])],
        maxDistance: location.maxDistance || 50000
      };
    }

    // Execute search
    let searchQuery = Product.searchProducts(sanitizers.sanitizeSearchQuery(query), filters);

    // Apply sorting
    if (sortBy === 'price_low') {
      searchQuery = searchQuery.sort({ 'pricing.basePrice': 1 });
    } else if (sortBy === 'price_high') {
      searchQuery = searchQuery.sort({ 'pricing.basePrice': -1 });
    } else if (sortBy === 'newest') {
      searchQuery = searchQuery.sort({ createdAt: -1 });
    } else if (sortBy === 'oldest') {
      searchQuery = searchQuery.sort({ createdAt: 1 });
    }
    // 'relevance' sorting is handled by searchProducts method

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const products = await searchQuery.skip(skip).limit(parseInt(limit));

    // Get total count for the same search
    const total = await Product.countDocuments({
      status: 'active',
      $text: { $search: sanitizers.sanitizeSearchQuery(query) },
      ...(filters.category && { category: filters.category }),
      ...(filters.condition && { condition: filters.condition }),
      ...(filters.priceRange && {
        'pricing.basePrice': {
          ...(filters.priceRange.min && { $gte: filters.priceRange.min }),
          ...(filters.priceRange.max && { $lte: filters.priceRange.max })
        }
      })
    });

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      status: 'success',
      data: {
        products: products.map(formatProductResponse),
        query: sanitizers.sanitizeSearchQuery(query),
        filters,
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
    console.error('Search products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while searching products'
    });
  }
};

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category', { status: 'active' });
    
    // Get category counts
    const categoryCounts = await Product.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      status: 'success',
      data: {
        categories,
        categoryCounts: categoryCounts.map(cat => ({
          category: cat._id,
          count: cat.count
        }))
      }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching categories'
    });
  }
};

// @desc    Get similar products
// @route   GET /api/products/:id/similar
// @access  Public
const getSimilarProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    const similarProducts = await Product.getSimilarProducts(req.params.id, 6);

    res.json({
      status: 'success',
      data: {
        products: similarProducts.map(formatProductResponse)
      }
    });

  } catch (error) {
    console.error('Get similar products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching similar products'
    });
  }
};

// @desc    Update product status
// @route   PATCH /api/products/:id/status
// @access  Private (owner only)
const updateProductStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['draft', 'active', 'sold', 'inactive', 'deleted'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Check ownership
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this product'
      });
    }

    product.status = status;
    await product.save();

    res.json({
      status: 'success',
      message: 'Product status updated successfully',
      data: {
        product: formatProductResponse(product)
      }
    });

  } catch (error) {
    console.error('Update product status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating product status'
    });
  }
};

// @desc    Bulk update products
// @route   PATCH /api/products/bulk
// @access  Private
const bulkUpdateProducts = async (req, res) => {
  try {
    const { productIds, updates } = req.body;
    
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Product IDs array is required'
      });
    }

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({
        status: 'error',
        message: 'Updates object is required'
      });
    }

    // Validate ownership of all products
    const products = await Product.find({
      _id: { $in: productIds },
      seller: req.user._id
    });

    if (products.length !== productIds.length) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update some products'
      });
    }

    // Perform bulk update
    const result = await Product.updateMany(
      { _id: { $in: productIds }, seller: req.user._id },
      { $set: updates },
      { runValidators: true }
    );

    res.json({
      status: 'success',
      message: `${result.modifiedCount} products updated successfully`,
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      }
    });

  } catch (error) {
    console.error('Bulk update products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating products'
    });
  }
};

// @desc    Track product view
// @route   POST /api/products/:id/view
// @access  Public
const trackProductView = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Don't track views from the seller
    if (req.user && req.user._id.toString() === product.seller.toString()) {
      return res.json({
        status: 'success',
        message: 'View not tracked (owner)'
      });
    }

    await product.incrementViews();

    res.json({
      status: 'success',
      message: 'View tracked successfully'
    });

  } catch (error) {
    console.error('Track product view error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while tracking view'
    });
  }
};

// @desc    Get product analytics
// @route   GET /api/products/:id/analytics
// @access  Private (owner only)
const getProductAnalytics = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Check ownership
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view analytics for this product'
      });
    }

    // Get additional analytics data
    const Negotiation = require('../models/Negotiation');
    const negotiations = await Negotiation.find({ product: req.params.id });
    
    const analyticsData = {
      views: product.analytics.views,
      favorites: product.analytics.favorites,
      inquiries: product.analytics.inquiries,
      negotiations: negotiations.length,
      activeNegotiations: negotiations.filter(n => n.status === 'active').length,
      averageOfferPrice: product.analytics.averageOfferPrice,
      lastViewed: product.analytics.lastViewed,
      impressions: product.analytics.impressions || [],
      conversionRate: negotiations.length > 0 ? (negotiations.filter(n => n.status === 'completed').length / negotiations.length * 100) : 0
    };

    res.json({
      status: 'success',
      data: {
        analytics: analyticsData
      }
    });

  } catch (error) {
    console.error('Get product analytics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching analytics'
    });
  }
};

// @desc    Feature/unfeature product
// @route   PATCH /api/products/:id/feature
// @access  Private (admin only)
const toggleProductFeature = async (req, res) => {
  try {
    const { featured, featuredLevel = 'basic', featuredUntil } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    product.featured.isFeatured = featured;
    if (featured) {
      product.featured.featuredLevel = featuredLevel;
      product.featured.featuredUntil = featuredUntil ? new Date(featuredUntil) : null;
    } else {
      product.featured.featuredLevel = 'basic';
      product.featured.featuredUntil = null;
    }

    await product.save();

    res.json({
      status: 'success',
      message: `Product ${featured ? 'featured' : 'unfeatured'} successfully`,
      data: {
        product: formatProductResponse(product)
      }
    });

  } catch (error) {
    console.error('Toggle product feature error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating featured status'
    });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsBySeller,
  getFeaturedProducts,
  getTrendingProducts,
  searchProducts,
  getCategories,
  getSimilarProducts,
  updateProductStatus,
  bulkUpdateProducts,
  trackProductView,
  getProductAnalytics,
  toggleProductFeature
};
