const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Format validation errors
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: formattedErrors,
      details: {
        errorCount: formattedErrors.length,
        timestamp: new Date().toISOString()
      }
    });
  }

  next();
};

// Custom validation helpers
const customValidators = {
  // Enhanced strong password validation
  isStrongPassword: (password) => {
    const minLength = 8;
    const maxLength = 128;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    // Check for common weak patterns
    const weakPatterns = [
      /123456/, /password/, /qwerty/, /admin/, /letmein/,
      /welcome/, /monkey/, /dragon/, /master/, /superman/
    ];
    
    const hasWeakPattern = weakPatterns.some(pattern => pattern.test(password.toLowerCase()));
    
    // Check for repeated characters (more than 3 in a row)
    const hasRepeatedChars = /(.)\1{3,}/.test(password);
    
    // Check for sequential characters
    const hasSequential = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password);

    return (
      password.length >= minLength &&
      password.length <= maxLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar &&
      !hasWeakPattern &&
      !hasRepeatedChars &&
      !hasSequential
    );
  },

  // Get password strength score (0-100)
  getPasswordStrength: (password) => {
    let score = 0;
    
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[a-z]/.test(password)) score += 15;
    if (/\d/.test(password)) score += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;
    if (password.length >= 16) score += 10;
    
    // Deduct points for common weaknesses
    const weakPatterns = [/123456/, /password/, /qwerty/];
    if (weakPatterns.some(pattern => pattern.test(password.toLowerCase()))) score -= 30;
    if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
    
    return Math.max(0, Math.min(100, score));
  },

  // Check if email domain is allowed
  isAllowedEmailDomain: (email) => {
    const allowedDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
      'icloud.com', 'protonmail.com', 'tutanota.com'
    ];
    
    const domain = email.split('@')[1];
    return allowedDomains.includes(domain) || domain.includes('.edu') || domain.includes('.org');
  },

  // Check if username is available
  isUsernameAvailable: async (username) => {
    const User = require('../models/User');
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    return !existingUser;
  },

  // Check if email is available
  isEmailAvailable: async (email) => {
    const User = require('../models/User');
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    return !existingUser;
  },

  // Validate product price range
  isValidPriceRange: (minPrice, basePrice) => {
    return minPrice > 0 && basePrice > 0 && minPrice <= basePrice;
  },

  // Check if user can negotiate on product
  canNegotiate: async (userId, productId) => {
    const Product = require('../models/Product');
    const Negotiation = require('../models/Negotiation');
    
    const product = await Product.findById(productId);
    if (!product || product.seller.toString() === userId) {
      return false;
    }

    // Check if user already has an active negotiation
    const existingNegotiation = await Negotiation.findOne({
      product: productId,
      buyer: userId,
      status: { $in: ['initiated', 'in_progress'] }
    });

    return !existingNegotiation;
  },

  // Validate file upload
  isValidFileUpload: (file, allowedTypes, maxSize) => {
    if (!file) return true; // Optional files are valid
    
    const isValidType = allowedTypes.includes(file.mimetype);
    const isValidSize = file.size <= maxSize;
    
    return isValidType && isValidSize;
  },

  // Check if negotiation round limit is not exceeded
  isWithinRoundLimit: async (negotiationId, maxRounds) => {
    const Negotiation = require('../models/Negotiation');
    const negotiation = await Negotiation.findById(negotiationId);
    
    if (!negotiation) return false;
    
    return negotiation.rounds < maxRounds;
  },

  // Validate price offer in negotiation
  isValidOffer: async (negotiationId, offer) => {
    const Negotiation = require('../models/Negotiation');
    const negotiation = await Negotiation.findById(negotiationId).populate('product');
    
    if (!negotiation) return false;
    
    const { product } = negotiation;
    return offer >= product.pricing.minPrice && offer <= product.pricing.basePrice;
  }
};

// Sanitization helpers
const sanitizers = {
  // Sanitize user input to prevent XSS
  sanitizeInput: (input) => {
    if (typeof input !== 'string') return input;
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove basic HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, ''); // Remove event handlers
  },

  // Sanitize search queries
  sanitizeSearchQuery: (query) => {
    if (typeof query !== 'string') return '';
    
    return query
      .trim()
      .replace(/[<>]/g, '')
      .replace(/[^a-zA-Z0-9\s\-_.]/g, '') // Allow only alphanumeric, spaces, hyphens, underscores, dots
      .slice(0, 100); // Limit length
  },

  // Sanitize product tags
  sanitizeTags: (tags) => {
    if (!Array.isArray(tags)) return [];
    
    return tags
      .map(tag => tag.toString().trim().toLowerCase())
      .filter(tag => tag.length > 0 && tag.length <= 20)
      .slice(0, 10); // Limit number of tags
  },

  // Clean phone numbers
  sanitizePhoneNumber: (phone) => {
    if (typeof phone !== 'string') return '';
    
    return phone.replace(/[^\d+\-\s()]/g, '').trim();
  }
};

// Validation middleware factory
const createValidationMiddleware = (rules) => {
  return [
    ...rules,
    validate
  ];
};

module.exports = {
  validate,
  customValidators,
  sanitizers,
  createValidationMiddleware
};
