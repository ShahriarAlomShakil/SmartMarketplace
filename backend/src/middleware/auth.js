const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided, authorization denied'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Token is not valid, user not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Account is deactivated'
      });
    }

    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error during authentication'
    });
  }
};

// Optional auth middleware - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Access forbidden: insufficient permissions'
      });
    }

    next();
  };
};

// Check if user owns the resource
const checkOwnership = (resourceIdParam = 'id', userField = 'seller') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required'
        });
      }

      const resourceId = req.params[resourceIdParam];
      
      // Admin can access everything
      if (req.user.role === 'admin') {
        return next();
      }

      // For user profile endpoints
      if (userField === 'self') {
        if (resourceId !== req.user._id.toString()) {
          return res.status(403).json({
            status: 'error',
            message: 'Access forbidden: you can only access your own resources'
          });
        }
        return next();
      }

      // Get the resource based on the route
      let Model;
      let populateField = '';

      if (req.route.path.includes('/products')) {
        Model = require('../models/Product');
        populateField = 'seller';
      } else if (req.route.path.includes('/negotiations')) {
        Model = require('../models/Negotiation');
        populateField = 'buyer seller';
      } else {
        // For direct user resources
        if (resourceId !== req.user._id.toString()) {
          return res.status(403).json({
            status: 'error',
            message: 'Access forbidden: you can only access your own resources'
          });
        }
        return next();
      }

      const resource = await Model.findById(resourceId).populate(populateField);

      if (!resource) {
        return res.status(404).json({
          status: 'error',
          message: 'Resource not found'
        });
      }

      // Check ownership based on the resource type
      let hasAccess = false;

      if (userField === 'seller' && resource.seller) {
        hasAccess = resource.seller._id.toString() === req.user._id.toString();
      } else if (userField === 'buyer' && resource.buyer) {
        hasAccess = resource.buyer._id.toString() === req.user._id.toString();
      } else if (userField === 'participant') {
        // For negotiations - both buyer and seller can access
        hasAccess = 
          (resource.buyer && resource.buyer._id.toString() === req.user._id.toString()) ||
          (resource.seller && resource.seller._id.toString() === req.user._id.toString());
      }

      if (!hasAccess) {
        return res.status(403).json({
          status: 'error',
          message: 'Access forbidden: you do not own this resource'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Server error during authorization'
      });
    }
  };
};

module.exports = {
  auth,
  optionalAuth,
  authorize,
  checkOwnership
};
