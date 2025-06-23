const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const negotiationController = require('../controllers/negotiationController');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// @route   GET /api/negotiations
// @desc    Get user's negotiations
// @access  Private
router.get('/', [
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
  query('role')
    .optional()
    .isIn(['buyer', 'seller'])
    .withMessage('Role must be buyer or seller'),
  validate
], negotiationController.getUserNegotiations);

// @route   GET /api/negotiations/:id
// @desc    Get negotiation by ID
// @access  Private (Participants only)
router.get('/:id', auth, negotiationController.getNegotiationById);

// @route   POST /api/negotiations/start
// @desc    Start a new negotiation
// @access  Private
router.post('/start', [
  auth,
  body('productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('initialOffer')
    .isFloat({ min: 1 })
    .withMessage('Initial offer must be at least $1'),
  body('message')
    .optional()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  validate
], negotiationController.startNegotiation);

// @route   POST /api/negotiations/:id/message
// @desc    Send a message in negotiation
// @access  Private (Participants only)
router.post('/:id/message', [
  auth,
  body('content')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content must be between 1 and 1000 characters'),
  body('type')
    .optional()
    .isIn(['offer', 'counter_offer', 'acceptance', 'rejection', 'message'])
    .withMessage('Invalid message type'),
  validate
], negotiationController.sendMessage);

// @route   POST /api/negotiations/:id/offer
// @desc    Send an offer in negotiation
// @access  Private (Participants only)
router.post('/:id/offer', [
  auth,
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Offer amount must be at least $1'),
  body('message')
    .optional()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  validate
], negotiationController.sendOffer);

// @route   POST /api/negotiations/:id/accept
// @desc    Accept current offer
// @access  Private (Participants only)
router.post('/:id/accept', auth, negotiationController.acceptOffer);

// @route   POST /api/negotiations/:id/reject
// @desc    Reject current offer
// @access  Private (Participants only)
router.post('/:id/reject', [
  auth,
  body('reason')
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage('Rejection reason must be between 1 and 500 characters'),
  validate
], negotiationController.rejectOffer);

// @route   POST /api/negotiations/:id/cancel
// @desc    Cancel negotiation
// @access  Private (Participants only)
router.post('/:id/cancel', [
  auth,
  body('reason')
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage('Cancellation reason must be between 1 and 500 characters'),
  validate
], negotiationController.cancelNegotiation);

// @route   GET /api/negotiations/:id/history
// @desc    Get negotiation message history
// @access  Private (Participants only)
router.get('/:id/history', [
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
], negotiationController.getNegotiationHistory);

// @route   GET /api/negotiations/product/:productId
// @desc    Get negotiations for a product
// @access  Private (Product owner only)
router.get('/product/:productId', [
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
], negotiationController.getProductNegotiations);

// @route   GET /api/negotiations/active
// @desc    Get active negotiations for user
// @access  Private
router.get('/active', auth, negotiationController.getActiveNegotiations);

// @route   GET /api/negotiations/completed
// @desc    Get completed negotiations for user
// @access  Private
router.get('/completed', [
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
], negotiationController.getCompletedNegotiations);

// @route   GET /api/negotiations/analytics
// @desc    Get negotiation analytics for user
// @access  Private
router.get('/analytics', auth, negotiationController.getNegotiationAnalytics);

// @route   POST /api/negotiations/:id/typing
// @desc    Send typing indicator
// @access  Private (Participants only)
router.post('/:id/typing', [
  auth,
  body('isTyping')
    .isBoolean()
    .withMessage('isTyping must be true or false'),
  validate
], negotiationController.sendTypingIndicator);

// @route   POST /api/negotiations/:id/read
// @desc    Mark messages as read
// @access  Private (Participants only)
router.post('/:id/read', auth, negotiationController.markMessagesAsRead);

// @route   GET /api/negotiations/:id/ai-suggestions
// @desc    Get AI suggestions for negotiation
// @access  Private (Participants only)
router.get('/:id/ai-suggestions', auth, negotiationController.getAISuggestions);

module.exports = router;
