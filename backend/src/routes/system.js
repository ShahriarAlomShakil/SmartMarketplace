const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

// Rate limiters for different endpoints
const rateLimiters = {
  // Strict rate limiting for auth endpoints
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs for auth
    message: {
      status: 'error',
      message: 'Too many authentication attempts, please try again later',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Moderate rate limiting for API calls
  api: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      status: 'error',
      message: 'Too many API requests, please try again later',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Strict rate limiting for file uploads
  upload: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // limit each IP to 20 upload requests per hour
    message: {
      status: 'error',
      message: 'Too many upload requests, please try again later',
      retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Very strict rate limiting for password reset
  passwordReset: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 password reset requests per hour
    message: {
      status: 'error',
      message: 'Too many password reset attempts, please try again later',
      retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
  })
};

/**
 * @swagger
 * /api/system/status:
 *   get:
 *     tags: [System]
 *     summary: Get comprehensive system status
 *     description: Returns detailed system health information including database connectivity, memory usage, and API statistics
 *     responses:
 *       200:
 *         description: System status information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 system:
 *                   type: object
 *                   properties:
 *                     uptime:
 *                       type: number
 *                       description: Server uptime in seconds
 *                     memory:
 *                       type: object
 *                       properties:
 *                         used:
 *                           type: number
 *                         total:
 *                           type: number
 *                         percentage:
 *                           type: number
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                         collections:
 *                           type: number
 *                     environment:
 *                       type: string
 *                     version:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 */
router.get('/status', async (req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    const memoryUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const memoryTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);

    // Database status check
    let dbStatus = 'disconnected';
    let collectionCount = 0;
    
    try {
      if (mongoose.connection.readyState === 1) {
        dbStatus = 'connected';
        const collections = await mongoose.connection.db.listCollections().toArray();
        collectionCount = collections.length;
      } else if (mongoose.connection.readyState === 2) {
        dbStatus = 'connecting';
      } else if (mongoose.connection.readyState === 3) {
        dbStatus = 'disconnecting';
      }
    } catch (error) {
      dbStatus = 'error';
    }

    res.json({
      status: 'success',
      system: {
        uptime: Math.floor(process.uptime()),
        memory: {
          used: memoryUsedMB,
          total: memoryTotalMB,
          percentage: Math.round((memoryUsedMB / memoryTotalMB) * 100)
        },
        database: {
          status: dbStatus,
          collections: collectionCount
        },
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('System status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve system status',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/system/info:
 *   get:
 *     tags: [System]
 *     summary: Get API information
 *     description: Returns basic API information and available endpoints
 *     responses:
 *       200:
 *         description: API information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 api:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     version:
 *                       type: string
 *                     description:
 *                       type: string
 *                     endpoints:
 *                       type: object
 *                     documentation:
 *                       type: string
 */
router.get('/info', (req, res) => {
  res.json({
    status: 'success',
    api: {
      name: 'Smart Marketplace API',
      version: '1.0.0',
      description: 'AI-powered marketplace for buying and selling products with intelligent negotiation features',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        products: '/api/products',
        negotiations: '/api/negotiations',
        system: '/api/system'
      },
      features: [
        'JWT Authentication',
        'Product Management',
        'AI-Powered Negotiations',
        'Real-time Chat',
        'Image Upload',
        'User Profiles',
        'Rating System',
        'Search & Filtering'
      ],
      documentation: '/api/docs',
      support: {
        email: 'api-support@smartmarketplace.com',
        docs: 'https://docs.smartmarketplace.com'
      }
    }
  });
});

/**
 * @swagger
 * /api/system/health:
 *   get:
 *     tags: [System]
 *     summary: Simple health check
 *     description: Quick health check endpoint for monitoring services
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Service is unhealthy
 */
router.get('/health', (req, res) => {
  // Simple health check - can be expanded to check dependencies
  const isHealthy = mongoose.connection.readyState === 1;
  
  if (isHealthy) {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(500).json({
      status: 'unhealthy',
      message: 'Database connection is not available',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/system/stats:
 *   get:
 *     tags: [System]
 *     summary: Get system statistics
 *     description: Returns statistics about API usage and system metrics
 *     responses:
 *       200:
 *         description: System statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: number
 *                     totalProducts:
 *                       type: number
 *                     totalNegotiations:
 *                       type: number
 *                     activeNegotiations:
 *                       type: number
 */
router.get('/stats', async (req, res) => {
  try {
    const User = require('../models/User');
    const Product = require('../models/Product');
    const Negotiation = require('../models/Negotiation');

    const [
      totalUsers,
      totalProducts,
      totalNegotiations,
      activeNegotiations,
      activeProducts
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Product.countDocuments(),
      Negotiation.countDocuments(),
      Negotiation.countDocuments({ status: { $in: ['initiated', 'in_progress'] } }),
      Product.countDocuments({ status: 'active' })
    ]);

    res.json({
      status: 'success',
      stats: {
        totalUsers,
        totalProducts,
        activeProducts,
        totalNegotiations,
        activeNegotiations,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('System stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve system statistics'
    });
  }
});

module.exports = {
  router,
  rateLimiters
};
