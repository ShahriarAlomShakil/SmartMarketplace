const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const productController = require('../controllers/productController');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { upload, uploadMemory, handleUploadError } = require('../middleware/upload');

// @route   GET /api/products
// @desc    Get all products with filtering and pagination
// @access  Public
router.get('/', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('category')
    .optional()
    .isIn(['electronics', 'clothing', 'home_garden', 'automotive', 'sports', 'books', 'toys_games', 'health_beauty', 'jewelry', 'art_collectibles', 'musical_instruments', 'other'])
    .withMessage('Invalid category'),
  query('condition')
    .optional()
    .isIn(['new', 'like_new', 'excellent', 'good', 'fair', 'poor', 'for_parts'])
    .withMessage('Invalid condition'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'pricing.basePrice', 'analytics.views', 'title'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  validate
], productController.getProducts);

// @route   GET /api/products/search
// @desc    Search products
// @access  Public
router.get('/search', [
  query('q')
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query is required and must be between 1 and 100 characters'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validate
], productController.searchProducts);

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', productController.getFeaturedProducts);

// @route   GET /api/products/trending
// @desc    Get trending products
// @access  Public
router.get('/trending', productController.getTrendingProducts);

// @route   GET /api/products/categories
// @desc    Get product categories with counts
// @access  Public
router.get('/categories', productController.getCategories);

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', productController.getProduct);

// @route   GET /api/products/:id/similar
// @desc    Get similar products
// @access  Public
router.get('/:id/similar', productController.getSimilarProducts);

// @route   POST /api/products
// @desc    Create a new product
// @access  Private
router.post('/', [
  auth,
  upload.array('images', 10),
  body('title')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('category')
    .isIn(['electronics', 'clothing', 'home', 'sports', 'books', 'beauty', 'automotive', 'toys', 'jewelry', 'art', 'music', 'other'])
    .withMessage('Invalid category'),
  body('condition')
    .isIn(['new', 'like_new', 'excellent', 'good', 'fair', 'poor', 'for_parts'])
    .withMessage('Invalid condition'),
  body('basePrice')
    .isNumeric()
    .withMessage('Base price must be a number')
    .isFloat({ min: 1 })
    .withMessage('Base price must be at least $1'),
  body('minPrice')
    .isNumeric()
    .withMessage('Minimum price must be a number')
    .isFloat({ min: 1 })
    .withMessage('Minimum price must be at least $1')
    .custom((value, { req }) => {
      const basePrice = parseFloat(req.body.basePrice);
      const minPrice = parseFloat(value);
      if (minPrice > basePrice) {
        throw new Error('Minimum price cannot be greater than base price');
      }
      return true;
    }),
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD'])
    .withMessage('Invalid currency'),
  body('negotiable')
    .optional()
    .isBoolean()
    .withMessage('Negotiable must be a boolean'),
  validate
], productController.createProduct);

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Owner only)
router.put('/:id', [
  auth,
  upload.array('images', 10),
  body('title')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('category')
    .optional()
    .isIn(['electronics', 'clothing', 'home_garden', 'automotive', 'sports', 'books', 'toys_games', 'health_beauty', 'jewelry', 'art_collectibles', 'musical_instruments', 'other'])
    .withMessage('Invalid category'),
  body('condition')
    .optional()
    .isIn(['new', 'like_new', 'excellent', 'good', 'fair', 'poor', 'for_parts'])
    .withMessage('Invalid condition'),
  body('basePrice')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Base price must be at least $1'),
  body('minPrice')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Minimum price must be at least $1'),
  validate
], productController.updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Owner only)
router.delete('/:id', auth, productController.deleteProduct);

// @route   POST /api/products/:id/view
// @desc    Track product view
// @access  Public
router.post('/:id/view', productController.trackProductView);

// @route   GET /api/products/:id/analytics
// @desc    Get product analytics
// @access  Private (owner only)
router.get('/:id/analytics', auth, productController.getProductAnalytics);

// @route   PATCH /api/products/:id/status
// @desc    Update product status
// @access  Private (owner only)
router.patch('/:id/status', [
  auth,
  body('status')
    .isIn(['draft', 'active', 'sold', 'inactive', 'deleted'])
    .withMessage('Invalid status'),
  validate
], productController.updateProductStatus);

// @route   PATCH /api/products/:id/feature
// @desc    Feature/unfeature product
// @access  Private (admin only)
router.patch('/:id/feature', [
  auth,
  body('featured')
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  body('featuredLevel')
    .optional()
    .isIn(['basic', 'premium', 'highlight'])
    .withMessage('Invalid featured level'),
  validate
], productController.toggleProductFeature);

// @route   PATCH /api/products/bulk
// @desc    Bulk update products
// @access  Private
router.patch('/bulk', [
  auth,
  body('productIds')
    .isArray({ min: 1 })
    .withMessage('Product IDs array is required'),
  body('updates')
    .isObject()
    .withMessage('Updates object is required'),
  validate
], productController.bulkUpdateProducts);

// Test endpoint for Day 7 - Create product without auth
router.post('/test', [
  upload.array('images', 10),
  body('title')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('category')
    .isIn(['electronics', 'clothing', 'home', 'sports', 'books', 'beauty', 'automotive', 'toys', 'jewelry', 'art', 'music', 'other'])
    .withMessage('Invalid category'),
  body('condition')
    .isIn(['new', 'like_new', 'excellent', 'good', 'fair', 'poor', 'for_parts'])
    .withMessage('Invalid condition'),
  body('basePrice')
    .isNumeric()
    .withMessage('Base price must be a number')
    .isFloat({ min: 1 })
    .withMessage('Base price must be at least $1'),
  body('minPrice')
    .isNumeric()
    .withMessage('Minimum price must be a number')
    .isFloat({ min: 1 })
    .withMessage('Minimum price must be at least $1'),
  validate
], async (req, res) => {
  try {
    const testUserId = '507f1f77bcf86cd799439011'; // Test user ID
    const productData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      condition: req.body.condition,
      pricing: {
        basePrice: parseFloat(req.body.basePrice),
        minPrice: parseFloat(req.body.minPrice)
      },
      seller: testUserId
    };

    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(file => ({
        url: `/uploads/products/${file.filename}`,
        filename: file.filename,
        originalname: file.originalname,
        size: file.size
      }));
    }

    // Call the actual controller but with test user
    const Product = require('../models/Product');
    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      status: 'success',
      data: {
        product: {
          _id: product._id,
          title: product.title,
          description: product.description,
          category: product.category,
          condition: product.condition,
          pricing: product.pricing,
          images: product.images,
          seller: product.seller,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Test product creation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

module.exports = router;
