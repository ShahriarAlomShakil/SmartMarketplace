const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validation');
const upload = require('../middleware/upload');

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
    .isIn(['price', 'date', 'popularity', 'rating'])
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
router.get('/:id', [
  body('id')
    .isMongoId()
    .withMessage('Invalid product ID'),
  validate
], productController.getProductById);

// @route   GET /api/products/:id/similar
// @desc    Get similar products
// @access  Public
router.get('/:id/similar', [
  body('id')
    .isMongoId()
    .withMessage('Invalid product ID'),
  validate
], productController.getSimilarProducts);

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
    .isIn(['electronics', 'clothing', 'home_garden', 'automotive', 'sports', 'books', 'toys_games', 'health_beauty', 'jewelry', 'art_collectibles', 'musical_instruments', 'other'])
    .withMessage('Invalid category'),
  body('condition')
    .isIn(['new', 'like_new', 'excellent', 'good', 'fair', 'poor', 'for_parts'])
    .withMessage('Invalid condition'),
  body('basePrice')
    .isFloat({ min: 1 })
    .withMessage('Base price must be at least $1'),
  body('minPrice')
    .isFloat({ min: 1 })
    .withMessage('Minimum price must be at least $1')
    .custom((value, { req }) => {
      if (value > req.body.basePrice) {
        throw new Error('Minimum price cannot be greater than base price');
      }
      return true;
    }),
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD'])
    .withMessage('Invalid currency'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isLength({ min: 1, max: 20 })
    .withMessage('Each tag must be between 1 and 20 characters'),
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
router.post('/:id/view', productController.trackView);

// @route   POST /api/products/:id/favorite
// @desc    Add product to favorites
// @access  Private
router.post('/:id/favorite', auth, productController.addToFavorites);

// @route   DELETE /api/products/:id/favorite
// @desc    Remove product from favorites
// @access  Private
router.delete('/:id/favorite', auth, productController.removeFromFavorites);

// @route   GET /api/products/:id/analytics
// @desc    Get product analytics (Owner only)
// @access  Private
router.get('/:id/analytics', auth, productController.getProductAnalytics);

// @route   GET /api/products/seller/:sellerId
// @desc    Get products by seller
// @access  Public
router.get('/seller/:sellerId', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validate
], productController.getProductsBySeller);

module.exports = router;
