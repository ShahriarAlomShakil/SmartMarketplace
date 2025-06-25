const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const profileController = require('../controllers/profileController');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

/**
 * Enhanced Profile Routes - Day 18 Implementation
 * 
 * Features:
 * - Complete profile management
 * - Trust score endpoints
 * - Analytics and insights
 * - OAuth integration
 * - Privacy controls
 * - Verification system
 */

// @route   GET /api/profile/complete
// @desc    Get comprehensive profile data with trust score
// @access  Private
router.get('/complete', auth, profileController.getCompleteProfile);

// @route   GET /api/profile/analytics
// @desc    Get profile analytics
// @access  Private
router.get('/analytics', [
  auth,
  query('timeRange')
    .optional()
    .isIn(['7d', '30d', '90d', '1y'])
    .withMessage('Time range must be 7d, 30d, 90d, or 1y'),
  validate
], profileController.getProfileAnalytics);

// @route   POST /api/profile/trust-score/recalculate
// @desc    Recalculate trust score manually
// @access  Private
router.post('/trust-score/recalculate', auth, profileController.recalculateTrustScore);

// @route   GET /api/profile/activity-timeline
// @desc    Get user activity timeline
// @access  Private
router.get('/activity-timeline', [
  auth,
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validate
], profileController.getActivityTimeline);

// @route   PUT /api/profile/privacy
// @desc    Update privacy settings
// @access  Private
router.put('/privacy', [
  auth,
  body('showProfile')
    .optional()
    .isBoolean()
    .withMessage('Show profile must be true or false'),
  body('showActivity')
    .optional()
    .isBoolean()
    .withMessage('Show activity must be true or false'),
  body('allowMessages')
    .optional()
    .isBoolean()
    .withMessage('Allow messages must be true or false'),
  validate
], profileController.updatePrivacySettings);

// @route   GET /api/profile/oauth-connections
// @desc    Get OAuth connections
// @access  Private
router.get('/oauth-connections', auth, profileController.getOAuthConnections);

// @route   POST /api/profile/oauth/:provider/link
// @desc    Link OAuth account
// @access  Private
router.post('/oauth/:provider/link', [
  auth,
  body('accessToken')
    .notEmpty()
    .withMessage('Access token is required'),
  body('profile')
    .isObject()
    .withMessage('Profile data is required'),
  validate
], profileController.linkOAuthAccount);

// @route   DELETE /api/profile/oauth/:provider
// @desc    Unlink OAuth account
// @access  Private
router.delete('/oauth/:provider', auth, profileController.unlinkOAuthAccount);

// @route   PUT /api/profile/preferences
// @desc    Update profile preferences
// @access  Private
router.put('/preferences', [
  auth,
  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark', 'system'])
    .withMessage('Theme must be light, dark, or system'),
  body('preferences.language')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Language must be a valid language code'),
  body('preferences.currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'])
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
  validate
], profileController.updateProfilePreferences);

// @route   POST /api/profile/verification/:type
// @desc    Request profile verification
// @access  Private
router.post('/verification/:type', [
  auth,
  validate
], profileController.requestVerification);

// @route   GET /api/profile/insights
// @desc    Get profile insights and recommendations
// @access  Private
router.get('/insights', auth, profileController.getProfileInsights);

// @route   GET /api/profile/export
// @desc    Export user data
// @access  Private
router.get('/export', auth, profileController.exportUserData);

module.exports = router;
