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

// @route   PUT /api/users/:id/profile
// @desc    Update user profile
// @access  Private (Self only)
router.put('/:id/profile', [
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
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('location.city')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('City must be between 1 and 50 characters'),
  body('location.state')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('State must be between 1 and 50 characters'),
  body('location.country')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Country must be between 1 and 50 characters'),
  body('socialLinks.website')
    .optional()
    .isURL()
    .withMessage('Website must be a valid URL'),
  body('socialLinks.twitter')
    .optional()
    .isURL()
    .withMessage('Twitter must be a valid URL'),
  body('socialLinks.instagram')
    .optional()
    .isURL()
    .withMessage('Instagram must be a valid URL'),
  body('socialLinks.facebook')
    .optional()
    .isURL()
    .withMessage('Facebook must be a valid URL'),
  validate
], userController.updateUserProfile);

// @route   POST /api/users/:id/avatar
// @desc    Upload user avatar
// @access  Private (Self only)
router.post('/:id/avatar', [
  auth,
  uploadAvatar.single('avatar')
], userController.uploadAvatar);

// @route   POST /api/users/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/avatar', [auth, uploadAvatar], userController.uploadAvatar);

// @route   PUT /api/users/:id/preferences
// @desc    Update user preferences
// @access  Private (Self only)
router.put('/:id/preferences', [
  auth,
  body('theme')
    .optional()
    .isIn(['light', 'dark', 'system'])
    .withMessage('Theme must be light, dark, or system'),
  body('language')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Language must be a valid language code'),
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD'])
    .withMessage('Invalid currency'),
  body('notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notifications must be true or false'),
  body('notifications.push')
    .optional()
    .isBoolean()
    .withMessage('Push notifications must be true or false'),
  body('notifications.sms')
    .optional()
    .isBoolean()
    .withMessage('SMS notifications must be true or false'),
  body('notifications.marketing')
    .optional()
    .isBoolean()
    .withMessage('Marketing notifications must be true or false'),
  body('privacy.showProfile')
    .optional()
    .isBoolean()
    .withMessage('Show profile must be true or false'),
  body('privacy.showActivity')
    .optional()
    .isBoolean()
    .withMessage('Show activity must be true or false'),
  body('privacy.allowMessages')
    .optional()
    .isBoolean()
    .withMessage('Allow messages must be true or false'),
  validate
], userController.updateUserPreferences);

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
    .isIn(['active', 'sold', 'expired', 'draft'])
    .withMessage('Invalid product status'),
  validate
], userController.getUserProducts);

// @route   GET /api/users/:id/reviews
// @desc    Get user reviews
// @access  Public
router.get('/:id/reviews', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validate
], userController.getUserReviews);

// @route   POST /api/users/:id/reviews
// @desc    Add user review
// @access  Private
router.post('/:id/reviews', [
  auth,
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Comment must be less than 500 characters'),
  body('productId')
    .optional()
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('negotiationId')
    .optional()
    .isMongoId()
    .withMessage('Invalid negotiation ID'),
  validate
], userController.addUserReview);

// @route   GET /api/users/:id/favorites
// @desc    Get user's favorite products
// @access  Private (Self only)
router.get('/:id/favorites', [
  auth,
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validate
], userController.getUserFavorites);

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
    .isIn(['initiated', 'in_progress', 'accepted', 'rejected', 'expired', 'cancelled'])
    .withMessage('Invalid negotiation status'),
  validate
], userController.getUserNegotiations);

// @route   POST /api/users/:id/block
// @desc    Block a user
// @access  Private
router.post('/:id/block', auth, userController.blockUser);

// @route   POST /api/users/:id/unblock
// @desc    Unblock a user
// @access  Private
router.post('/:id/unblock', auth, userController.unblockUser);

// @route   POST /api/users/:id/report
// @desc    Report a user
// @access  Private
router.post('/:id/report', [
  auth,
  body('reason')
    .isIn(['spam', 'harassment', 'fraud', 'inappropriate_content', 'fake_profile', 'other'])
    .withMessage('Invalid report reason'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  validate
], userController.reportUser);

// @route   DELETE /api/users/:id
// @desc    Delete user account
// @access  Private (Self only)
router.delete('/:id', [
  auth,
  body('password')
    .isLength({ min: 1 })
    .withMessage('Password is required for account deletion'),
  validate
], userController.deleteUserAccount);

// @route   GET /api/users/search
// @desc    Search users
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
], userController.searchUsers);

module.exports = router;
