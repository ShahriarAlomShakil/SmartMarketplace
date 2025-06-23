const mongoose = require('mongoose');

// Database utility functions
const dbUtils = {
  // Check if ID is valid MongoDB ObjectId
  isValidObjectId: (id) => {
    return mongoose.Types.ObjectId.isValid(id);
  },

  // Convert string to ObjectId
  toObjectId: (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid ObjectId format');
    }
    return new mongoose.Types.ObjectId(id);
  },

  // Pagination helper
  getPaginationParams: (page = 1, limit = 10, maxLimit = 100) => {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(maxLimit, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    return {
      page: pageNum,
      limit: limitNum,
      skip
    };
  },

  // Build sort object from query params
  buildSortObject: (sortBy = 'createdAt', sortOrder = 'desc') => {
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
    return sortObj;
  },

  // Build date range filter
  buildDateRangeFilter: (startDate, endDate) => {
    const filter = {};
    
    if (startDate || endDate) {
      filter.createdAt = {};
      
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }
    
    return filter;
  },

  // Build text search filter
  buildTextSearchFilter: (query) => {
    if (!query || typeof query !== 'string') {
      return {};
    }
    
    return {
      $text: { $search: query }
    };
  },

  // Build price range filter
  buildPriceRangeFilter: (minPrice, maxPrice, field = 'pricing.basePrice') => {
    const filter = {};
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter[field] = {};
      
      if (minPrice !== undefined) {
        filter[field].$gte = parseFloat(minPrice);
      }
      
      if (maxPrice !== undefined) {
        filter[field].$lte = parseFloat(maxPrice);
      }
    }
    
    return filter;
  },

  // Build location filter
  buildLocationFilter: (coordinates, maxDistance = 10000) => {
    if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
      return {};
    }
    
    return {
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [coordinates.longitude, coordinates.latitude]
          },
          $maxDistance: maxDistance
        }
      }
    };
  },

  // Validate and sanitize filters
  sanitizeFilters: (filters, allowedFields) => {
    const sanitized = {};
    
    Object.keys(filters).forEach(key => {
      if (allowedFields.includes(key) && filters[key] !== undefined) {
        sanitized[key] = filters[key];
      }
    });
    
    return sanitized;
  },

  // Build aggregation pipeline for analytics
  buildAnalyticsPipeline: (matchStage = {}, groupBy = '_id') => {
    return [
      { $match: matchStage },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
          createdAt: { $first: '$createdAt' }
        }
      },
      { $sort: { count: -1 } }
    ];
  },

  // Aggregate pipeline for pagination
  createPaginationPipeline: (matchStage = {}, sortStage = { createdAt: -1 }, page = 1, limit = 10) => {
    const { skip } = dbUtils.getPaginationParams(page, limit);
    
    return [
      { $match: matchStage },
      { $sort: sortStage },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit }
          ],
          totalCount: [
            { $count: 'count' }
          ]
        }
      },
      {
        $project: {
          data: 1,
          total: { $arrayElemAt: ['$totalCount.count', 0] },
          page: { $literal: page },
          limit: { $literal: limit }
        }
      }
    ];
  },

  // Calculate pagination metadata
  calculatePaginationMeta: (total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    
    return {
      current: parseInt(page),
      pages: totalPages,
      total: parseInt(total),
      hasNext: parseInt(page) < totalPages,
      hasPrev: parseInt(page) > 1,
      nextPage: parseInt(page) < totalPages ? parseInt(page) + 1 : null,
      prevPage: parseInt(page) > 1 ? parseInt(page) - 1 : null
    };
  },

  // Safe update with validation
  safeUpdate: async (Model, id, updateData, options = {}) => {
    try {
      const doc = await Model.findByIdAndUpdate(
        id,
        { $set: updateData },
        { 
          new: true, 
          runValidators: true,
          ...options 
        }
      );
      
      if (!doc) {
        throw new Error('Document not found');
      }
      
      return doc;
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new Error(`Validation failed: ${Object.values(error.errors).map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  },

  // Bulk operations helper
  createBulkUpdateOps: (updates) => {
    return updates.map(({ id, data }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: data },
        upsert: false
      }
    }));
  },

  // Transaction helper
  withTransaction: async (operations) => {
    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();
      
      const results = await Promise.all(
        operations.map(op => op(session))
      );
      
      await session.commitTransaction();
      return results;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  // Aggregation helpers
  createLookupStage: (from, localField, foreignField, as, pipeline = []) => {
    const stage = {
      $lookup: {
        from,
        localField,
        foreignField,
        as
      }
    };
    
    if (pipeline.length > 0) {
      stage.$lookup.pipeline = pipeline;
    }
    
    return stage;
  },

  // Create match stage for filters
  createMatchStage: (filters) => {
    const matchStage = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          matchStage[key] = { $in: value };
        } else {
          matchStage[key] = value;
        }
      }
    });
    
    return { $match: matchStage };
  },

  // Geospatial query helper
  createNearQuery: (coordinates, maxDistance = 10000) => {
    return {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates // [longitude, latitude]
          },
          $maxDistance: maxDistance // in meters
        }
      }
    };
  },

  // Index management helpers
  createTextIndex: async (Model, fields) => {
    const indexObject = {};
    fields.forEach(field => {
      indexObject[field] = 'text';
    });
    
    try {
      await Model.createIndex(indexObject);
      console.log(`✅ Text index created for ${Model.modelName}:`, fields);
    } catch (error) {
      console.error(`❌ Failed to create text index for ${Model.modelName}:`, error.message);
    }
  },

  // Validation helpers
  validateDateRange: (startDate, endDate) => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start >= end) {
        throw new Error('Start date must be before end date');
      }
      
      if (end > new Date()) {
        throw new Error('End date cannot be in the future');
      }
    }
    
    return true;
  },

  // Statistics helpers
  createStatsAggregation: (matchStage = {}) => {
    return [
      { $match: matchStage },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          averagePrice: { $avg: '$pricing.basePrice' },
          minPrice: { $min: '$pricing.basePrice' },
          maxPrice: { $max: '$pricing.basePrice' },
          totalViews: { $sum: '$analytics.views' }
        }
      }
    ];
  },

  // Execute paginated aggregation
  executePaginatedAggregation: async (model, pipeline, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    
    const facetPipeline = [
      {
        $facet: {
          data: [
            ...pipeline,
            { $skip: skip },
            { $limit: limit }
          ],
          totalCount: [
            ...pipeline,
            { $count: 'count' }
          ]
        }
      }
    ];
    
    const result = await model.aggregate(facetPipeline);
    const data = result[0].data;
    const totalCount = result[0].totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    
    return {
      data,
      pagination: {
        current: page,
        pages: totalPages,
        total: totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  },

  // Batch update with error handling
  batchUpdate: async (model, updates, options = {}) => {
    const batchSize = options.batchSize || 100;
    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };
    
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      try {
        const bulkOps = batch.map(update => ({
          updateOne: {
            filter: update.filter,
            update: update.update,
            upsert: update.upsert || false
          }
        }));
        
        const result = await model.bulkWrite(bulkOps);
        results.successful += result.modifiedCount;
      } catch (error) {
        results.failed += batch.length;
        results.errors.push({
          batch: i / batchSize + 1,
          error: error.message
        });
      }
    }
    
    return results;
  },

  // Database health check
  healthCheck: async () => {
    try {
      const dbState = mongoose.connection.readyState;
      const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };
      
      const collections = await mongoose.connection.db.listCollections().toArray();
      const dbStats = await mongoose.connection.db.stats();
      
      return {
        status: states[dbState],
        state: dbState,
        collections: collections.length,
        dataSize: dbStats.dataSize,
        storageSize: dbStats.storageSize,
        indexes: dbStats.indexes,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date()
      };
    }
  },

  // Advanced search with multiple filters
  buildAdvancedSearchQuery: (filters) => {
    const query = {};
    
    // Text search
    if (filters.q) {
      query.$text = { $search: filters.q };
    }
    
    // Category filter
    if (filters.category) {
      query.category = Array.isArray(filters.category) 
        ? { $in: filters.category }
        : filters.category;
    }
    
    // Status filter
    if (filters.status) {
      query.status = Array.isArray(filters.status)
        ? { $in: filters.status }
        : filters.status;
    }
    
    // Price range
    if (filters.minPrice || filters.maxPrice) {
      query['pricing.basePrice'] = {};
      if (filters.minPrice) query['pricing.basePrice'].$gte = parseFloat(filters.minPrice);
      if (filters.maxPrice) query['pricing.basePrice'].$lte = parseFloat(filters.maxPrice);
    }
    
    // Date range
    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
    }
    
    // Location
    if (filters.location && filters.location.coordinates) {
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [filters.location.longitude, filters.location.latitude]
          },
          $maxDistance: filters.location.maxDistance || 50000
        }
      };
    }
    
    return query;
  },

  // Data validation helpers
  validators: {
    // Validate email format
    isValidEmail: (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
    
    // Validate phone number
    isValidPhone: (phone) => {
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
      return phoneRegex.test(phone);
    },
    
    // Validate price range
    isValidPriceRange: (minPrice, maxPrice) => {
      return minPrice > 0 && maxPrice > 0 && minPrice <= maxPrice;
    },
    
    // Validate coordinates
    isValidCoordinates: (lat, lng) => {
      return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    },
    
    // Validate MongoDB ObjectId
    isValidObjectId: (id) => {
      return mongoose.Types.ObjectId.isValid(id);
    }
  },

  // Data transformation helpers
  transformers: {
    // Transform user data for public display
    publicUser: (user) => {
      return {
        _id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        profile: {
          bio: user.profile?.bio,
          rating: user.profile?.rating,
          verificationStatus: user.profile?.verificationStatus
        },
        createdAt: user.createdAt
      };
    },
    
    // Transform product data for listing
    productListing: (product) => {
      return {
        _id: product._id,
        title: product.title,
        description: product.description,
        category: product.category,
        condition: product.condition,
        pricing: product.pricing,
        primaryImage: product.images?.find(img => img.isPrimary) || product.images?.[0],
        seller: product.seller,
        location: product.location,
        analytics: {
          views: product.analytics?.views || 0,
          favorites: product.analytics?.favorites || 0
        },
        createdAt: product.createdAt
      };
    },
    
    // Transform negotiation data
    negotiationSummary: (negotiation) => {
      return {
        _id: negotiation._id,
        product: negotiation.product,
        status: negotiation.status,
        pricing: negotiation.pricing,
        rounds: negotiation.rounds,
        lastMessage: negotiation.messages[negotiation.messages.length - 1],
        createdAt: negotiation.createdAt,
        updatedAt: negotiation.updatedAt
      };
    }
  }
};

module.exports = dbUtils;
