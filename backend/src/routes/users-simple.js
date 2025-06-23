const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { uploadAvatar } = require('../middleware/upload');

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, userController.getCurrentUserProfile);

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/:id', userController.getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update current user profile
// @access  Private
router.put('/profile', [
  auth,
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('location.city')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('City must be between 1 and 100 characters'),
  body('location.country')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Country must be between 1 and 100 characters'),
  body('socialLinks.website')
    .optional()
    .isURL()
    .withMessage('Website must be a valid URL'),
  body('socialLinks.twitter')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Twitter handle must be less than 100 characters'),
  body('socialLinks.instagram')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Instagram handle must be less than 100 characters'),
  body('socialLinks.facebook')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Facebook handle must be less than 100 characters'),
  validate
], userController.updateUserProfile);

// @route   GET /api/users/:id/stats
// @desc    Get user statistics
// @access  Public
router.get('/:id/stats', userController.getUserStats);

// @route   GET /api/users/:id/products
// @desc    Get user's products
// @access  Public
router.get('/:id/products', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['active', 'sold', 'draft', 'expired'])
    .withMessage('Invalid status'),
  validate
], userController.getUserProducts);

// @route   GET /api/users/:id/negotiations
// @desc    Get user's negotiations
// @access  Private (Self only)
router.get('/:id/negotiations', [
  auth,
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['initiated', 'in_progress', 'completed', 'cancelled', 'expired'])
    .withMessage('Invalid status'),
  validate
], userController.getUserNegotiations);

// Note: Other routes temporarily disabled for Day 7 functionality
// They will be implemented in later phases

module.exports = router;
