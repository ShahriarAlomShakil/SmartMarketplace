const Joi = require('joi');
const mongoose = require('mongoose');

// User validation schemas
const userSchemas = {
  register: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(20)
      .required()
      .messages({
        'string.alphanum': 'Username can only contain letters and numbers',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 20 characters',
        'any.required': 'Username is required'
      }),
    
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    
    password: Joi.string()
      .min(6)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required'
      }),
    
    firstName: Joi.string()
      .max(50)
      .optional()
      .messages({
        'string.max': 'First name cannot exceed 50 characters'
      }),
    
    lastName: Joi.string()
      .max(50)
      .optional()
      .messages({
        'string.max': 'Last name cannot exceed 50 characters'
      }),
    
    phone: Joi.string()
      .pattern(/^\+?[\d\s\-\(\)]+$/)
      .optional()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number'
      }),
    
    role: Joi.string()
      .valid('buyer', 'seller')
      .default('buyer')
      .messages({
        'any.only': 'Role must be either buyer or seller'
      })
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  }),

  updateProfile: Joi.object({
    firstName: Joi.string().max(50).optional(),
    lastName: Joi.string().max(50).optional(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
    bio: Joi.string().max(500).optional(),
    location: Joi.object({
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      country: Joi.string().optional(),
      coordinates: Joi.object({
        latitude: Joi.number().min(-90).max(90).optional(),
        longitude: Joi.number().min(-180).max(180).optional()
      }).optional()
    }).optional(),
    socialLinks: Joi.object({
      website: Joi.string().uri().optional(),
      twitter: Joi.string().optional(),
      instagram: Joi.string().optional(),
      facebook: Joi.string().optional()
    }).optional()
  })
};

// Product validation schemas
const productSchemas = {
  create: Joi.object({
    title: Joi.string()
      .min(3)
      .max(100)
      .required()
      .messages({
        'string.min': 'Title must be at least 3 characters long',
        'string.max': 'Title cannot exceed 100 characters',
        'any.required': 'Product title is required'
      }),
    
    description: Joi.string()
      .min(10)
      .max(2000)
      .required()
      .messages({
        'string.min': 'Description must be at least 10 characters long',
        'string.max': 'Description cannot exceed 2000 characters',
        'any.required': 'Product description is required'
      }),
    
    category: Joi.string()
      .valid('electronics', 'clothing', 'home', 'sports', 'books', 'beauty', 'automotive', 'toys', 'jewelry', 'art', 'music', 'other')
      .required()
      .messages({
        'any.only': 'Please select a valid category',
        'any.required': 'Product category is required'
      }),
    
    subcategory: Joi.string()
      .max(50)
      .optional(),
    
    condition: Joi.string()
      .valid('new', 'like_new', 'good', 'fair', 'poor')
      .required()
      .messages({
        'any.only': 'Please select a valid condition',
        'any.required': 'Product condition is required'
      }),
    
    brand: Joi.string().max(50).optional(),
    model: Joi.string().max(50).optional(),
    
    basePrice: Joi.number()
      .positive()
      .required()
      .messages({
        'number.positive': 'Base price must be greater than 0',
        'any.required': 'Base price is required'
      }),
    
    minPrice: Joi.number()
      .positive()
      .required()
      .messages({
        'number.positive': 'Minimum price must be greater than 0',
        'any.required': 'Minimum price is required'
      }),
    
    currency: Joi.string()
      .valid('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD')
      .default('USD'),
    
    location: Joi.object({
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      country: Joi.string().optional(),
      zipCode: Joi.string().optional(),
      coordinates: Joi.object({
        latitude: Joi.number().min(-90).max(90).optional(),
        longitude: Joi.number().min(-180).max(180).optional()
      }).optional()
    }).optional(),
    
    tags: Joi.array()
      .items(Joi.string().max(20))
      .max(10)
      .optional()
      .messages({
        'array.max': 'Maximum 10 tags allowed'
      }),
    
    urgency: Joi.object({
      level: Joi.string()
        .valid('low', 'medium', 'high', 'urgent')
        .default('medium'),
      reason: Joi.string().optional()
    }).optional()
  }),

  update: Joi.object({
    title: Joi.string().min(3).max(100).optional(),
    description: Joi.string().min(10).max(2000).optional(),
    condition: Joi.string().valid('new', 'like_new', 'good', 'fair', 'poor').optional(),
    basePrice: Joi.number().positive().optional(),
    minPrice: Joi.number().positive().optional(),
    tags: Joi.array().items(Joi.string().max(20)).max(10).optional(),
    urgency: Joi.object({
      level: Joi.string().valid('low', 'medium', 'high', 'urgent'),
      reason: Joi.string().optional()
    }).optional()
  }),

  search: Joi.object({
    q: Joi.string().max(100).optional(),
    category: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ).optional(),
    condition: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ).optional(),
    minPrice: Joi.number().positive().optional(),
    maxPrice: Joi.number().positive().optional(),
    location: Joi.object({
      coordinates: Joi.object({
        latitude: Joi.number().min(-90).max(90).required(),
        longitude: Joi.number().min(-180).max(180).required()
      }).required(),
      maxDistance: Joi.number().positive().default(50000)
    }).optional(),
    sortBy: Joi.string()
      .valid('createdAt', 'pricing.basePrice', 'analytics.views', 'title')
      .default('createdAt'),
    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .default('desc'),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  })
};

// Negotiation validation schemas
const negotiationSchemas = {
  start: Joi.object({
    productId: Joi.string()
      .custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      })
      .required()
      .messages({
        'any.invalid': 'Invalid product ID',
        'any.required': 'Product ID is required'
      }),
    
    initialOffer: Joi.number()
      .positive()
      .required()
      .messages({
        'number.positive': 'Initial offer must be greater than 0',
        'any.required': 'Initial offer is required'
      }),
    
    message: Joi.string()
      .max(1000)
      .optional()
      .messages({
        'string.max': 'Message cannot exceed 1000 characters'
      })
  }),

  sendMessage: Joi.object({
    content: Joi.string()
      .min(1)
      .max(1000)
      .required()
      .messages({
        'string.min': 'Message cannot be empty',
        'string.max': 'Message cannot exceed 1000 characters',
        'any.required': 'Message content is required'
      }),
    
    type: Joi.string()
      .valid('text', 'offer', 'counter_offer')
      .default('text')
  }),

  sendOffer: Joi.object({
    amount: Joi.number()
      .positive()
      .required()
      .messages({
        'number.positive': 'Offer amount must be greater than 0',
        'any.required': 'Offer amount is required'
      }),
    
    message: Joi.string()
      .max(1000)
      .optional()
      .messages({
        'string.max': 'Message cannot exceed 1000 characters'
      })
  }),

  list: Joi.object({
    status: Joi.alternatives().try(
      Joi.string().valid('initiated', 'in_progress', 'completed', 'cancelled', 'expired', 'rejected'),
      Joi.array().items(Joi.string().valid('initiated', 'in_progress', 'completed', 'cancelled', 'expired', 'rejected'))
    ).optional(),
    role: Joi.string().valid('buyer', 'seller').default('buyer'),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('createdAt', 'updatedAt', 'rounds').default('updatedAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  })
};

// Custom validation functions
const customValidators = {
  // Validate that minPrice <= basePrice
  validatePriceRange: (data) => {
    if (data.minPrice && data.basePrice && data.minPrice > data.basePrice) {
      throw new Error('Minimum price cannot be greater than base price');
    }
    return true;
  },

  // Validate MongoDB ObjectId
  validateObjectId: (id, fieldName = 'ID') => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(`Invalid ${fieldName} format`);
    }
    return true;
  },

  // Validate file upload
  validateFileUpload: (file, allowedTypes = [], maxSize = 5 * 1024 * 1024) => {
    if (!file) return true; // Optional files

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
      throw new Error(`File type ${file.mimetype} is not allowed`);
    }

    if (file.size > maxSize) {
      throw new Error(`File size exceeds maximum limit of ${maxSize / (1024 * 1024)}MB`);
    }

    return true;
  },

  // Validate array of ObjectIds
  validateObjectIdArray: (ids, fieldName = 'IDs') => {
    if (!Array.isArray(ids)) {
      throw new Error(`${fieldName} must be an array`);
    }

    for (const id of ids) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid ${fieldName} format: ${id}`);
      }
    }

    return true;
  }
};

// Middleware factory for different validation types
const createValidationMiddleware = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source];
    const { error, value } = schema.validate(data, { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }))
      });
    }

    // Replace the original data with validated and sanitized data
    req[source] = value;
    next();
  };
};

module.exports = {
  userSchemas,
  productSchemas,
  negotiationSchemas,
  customValidators,
  createValidationMiddleware,
  
  // Convenience methods for common validations
  validateUser: {
    register: createValidationMiddleware(userSchemas.register),
    login: createValidationMiddleware(userSchemas.login),
    updateProfile: createValidationMiddleware(userSchemas.updateProfile)
  },
  
  validateProduct: {
    create: createValidationMiddleware(productSchemas.create),
    update: createValidationMiddleware(productSchemas.update),
    search: createValidationMiddleware(productSchemas.search, 'query')
  },
  
  validateNegotiation: {
    start: createValidationMiddleware(negotiationSchemas.start),
    sendMessage: createValidationMiddleware(negotiationSchemas.sendMessage),
    sendOffer: createValidationMiddleware(negotiationSchemas.sendOffer),
    list: createValidationMiddleware(negotiationSchemas.list, 'query')
  }
};
