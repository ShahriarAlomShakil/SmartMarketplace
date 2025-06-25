/**
 * Advanced Conversation Routes for Day 16 - Smart Marketplace
 * 
 * Enhanced routes for advanced conversation management
 */

const express = require('express');
const router = express.Router();
const { body, query, param } = require('express-validator');
const conversationController = require('../controllers/conversationController');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Validation middleware
const validateNegotiationId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid negotiation ID')
];

const validateBranchName = [
  param('branchName')
    .isLength({ min: 1, max: 50 })
    .withMessage('Branch name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Branch name can only contain letters, numbers, hyphens, and underscores')
];

const validateMessageData = [
  body('content')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content must be between 1 and 1000 characters'),
  body('type')
    .optional()
    .isIn(['text', 'offer', 'counter_offer', 'acceptance', 'rejection', 'system'])
    .withMessage('Invalid message type'),
  body('offer.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Offer amount must be a positive number'),
  body('context.branch')
    .optional()
    .isString()
    .withMessage('Branch must be a string')
];

const validateStateUpdate = [
  body('state')
    .isObject()
    .withMessage('State must be an object'),
  body('state.participants')
    .optional()
    .isObject()
    .withMessage('Participants must be an object')
];

const validateBranchCreation = [
  body('branchName')
    .isLength({ min: 1, max: 50 })
    .withMessage('Branch name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Branch name can only contain letters, numbers, hyphens, and underscores'),
  body('branchType')
    .optional()
    .isIn(['scenario', 'alternative', 'backup', 'test'])
    .withMessage('Invalid branch type'),
  body('parentBranch')
    .optional()
    .isString()
    .withMessage('Parent branch must be a string')
];

const validateContextSwitch = [
  body('fromNegotiationId')
    .isMongoId()
    .withMessage('Invalid source negotiation ID'),
  body('toNegotiationId')
    .isMongoId()
    .withMessage('Invalid target negotiation ID')
];

const validateShareOptions = [
  body('shareWith')
    .optional()
    .isArray()
    .withMessage('shareWith must be an array'),
  body('permissions')
    .optional()
    .isIn(['read', 'comment', 'edit'])
    .withMessage('Invalid permissions'),
  body('expiresIn')
    .optional()
    .matches(/^\d+[smhd]$/)
    .withMessage('expiresIn must be in format like "7d", "24h", "60m"'),
  body('includePersonalData')
    .optional()
    .isBoolean()
    .withMessage('includePersonalData must be a boolean')
];

const validateComparison = [
  body('negotiationIds')
    .isArray({ min: 2, max: 10 })
    .withMessage('Must provide 2-10 negotiation IDs for comparison'),
  body('negotiationIds.*')
    .isMongoId()
    .withMessage('All negotiation IDs must be valid')
];

// Conversation State Management
/**
 * @route   GET /api/conversations/:id/state
 * @desc    Get real-time conversation state
 * @access  Private (Participants only)
 */
router.get('/:id/state', [
  auth,
  validateNegotiationId,
  validate
], conversationController.getConversationState);

/**
 * @route   PUT /api/conversations/:id/state
 * @desc    Update conversation state
 * @access  Private (Participants only)
 */
router.put('/:id/state', [
  auth,
  validateNegotiationId,
  validateStateUpdate,
  validate
], conversationController.updateConversationState);

// Enhanced Message Management
/**
 * @route   GET /api/conversations/:id/messages
 * @desc    Get enhanced message history with advanced filtering
 * @access  Private (Participants only)
 */
router.get('/:id/messages', [
  auth,
  validateNegotiationId,
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),
  query('sender')
    .optional()
    .isIn(['buyer', 'seller', 'ai', 'system'])
    .withMessage('Invalid sender type'),
  query('messageType')
    .optional()
    .isIn(['text', 'offer', 'counter_offer', 'acceptance', 'rejection', 'system'])
    .withMessage('Invalid message type'),
  query('branch')
    .optional()
    .isString()
    .withMessage('Branch must be a string'),
  query('includeContext')
    .optional()
    .isBoolean()
    .withMessage('includeContext must be a boolean'),
  validate
], conversationController.getMessageHistory);

/**
 * @route   POST /api/conversations/:id/messages
 * @desc    Store message with enhanced context
 * @access  Private (Participants only)
 */
router.post('/:id/messages', [
  auth,
  validateNegotiationId,
  validateMessageData,
  validate
], conversationController.storeMessage);

// Conversation Branching
/**
 * @route   POST /api/conversations/:id/branches
 * @desc    Create conversation branch for different scenarios
 * @access  Private (Participants only)
 */
router.post('/:id/branches', [
  auth,
  validateNegotiationId,
  validateBranchCreation,
  validate
], conversationController.createBranch);

/**
 * @route   PUT /api/conversations/:id/branches/:branchName/switch
 * @desc    Switch to conversation branch
 * @access  Private (Participants only)
 */
router.put('/:id/branches/:branchName/switch', [
  auth,
  validateNegotiationId,
  validateBranchName,
  validate
], conversationController.switchBranch);

// Context Switching
/**
 * @route   POST /api/conversations/switch-context
 * @desc    Switch context between different conversations
 * @access  Private
 */
router.post('/switch-context', [
  auth,
  validateContextSwitch,
  validate
], conversationController.switchContext);

// Conversation Resumption
/**
 * @route   POST /api/conversations/:id/resume
 * @desc    Resume conversation after interruption
 * @access  Private (Participants only)
 */
router.post('/:id/resume', [
  auth,
  validateNegotiationId,
  body('interruption')
    .optional()
    .isString()
    .withMessage('Interruption reason must be a string'),
  validate
], conversationController.resumeConversation);

// Round Management
/**
 * @route   POST /api/conversations/:id/rounds/:action
 * @desc    Manage negotiation rounds and limits
 * @access  Private (Participants only)
 */
router.post('/:id/rounds/:action', [
  auth,
  validateNegotiationId,
  param('action')
    .isIn(['increment', 'check_limit', 'extend_limit', 'reset'])
    .withMessage('Invalid round action'),
  body('context.newLimit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('New limit must be between 1 and 50'),
  validate
], conversationController.manageRounds);

// Analytics and Insights
/**
 * @route   GET /api/conversations/:id/analytics
 * @desc    Generate conversation analytics and insights
 * @access  Private (Participants only)
 */
router.get('/:id/analytics', [
  auth,
  validateNegotiationId,
  query('timeframe')
    .optional()
    .matches(/^\d+[smhd]$/)
    .withMessage('Timeframe must be in format like "7d", "24h", "60m"'),
  query('types')
    .optional()
    .isString()
    .withMessage('Types must be a comma-separated string'),
  validate
], conversationController.getAnalytics);

/**
 * @route   GET /api/conversations/:id/insights
 * @desc    Get conversation insights
 * @access  Private (Participants only)
 */
router.get('/:id/insights', [
  auth,
  validateNegotiationId,
  query('types')
    .optional()
    .isString()
    .withMessage('Types must be a comma-separated string'),
  validate
], conversationController.getInsights);

// Reports
/**
 * @route   GET /api/conversations/:id/reports/:type
 * @desc    Generate conversation reports
 * @access  Private (Participants only)
 */
router.get('/:id/reports/:type', [
  auth,
  validateNegotiationId,
  param('type')
    .isIn(['summary', 'detailed', 'comparison'])
    .withMessage('Invalid report type'),
  validate
], conversationController.generateReport);

// Export and Sharing
/**
 * @route   GET /api/conversations/:id/export
 * @desc    Export conversation data
 * @access  Private (Participants only)
 */
router.get('/:id/export', [
  auth,
  validateNegotiationId,
  query('format')
    .optional()
    .isIn(['json', 'csv', 'txt', 'html'])
    .withMessage('Invalid export format'),
  query('includeMetadata')
    .optional()
    .isBoolean()
    .withMessage('includeMetadata must be a boolean'),
  query('includeAnalytics')
    .optional()
    .isBoolean()
    .withMessage('includeAnalytics must be a boolean'),
  validate
], conversationController.exportConversation);

/**
 * @route   POST /api/conversations/:id/share
 * @desc    Share conversation with others
 * @access  Private (Participants only)
 */
router.post('/:id/share', [
  auth,
  validateNegotiationId,
  validateShareOptions,
  validate
], conversationController.shareConversation);

// Performance and Comparison
/**
 * @route   GET /api/conversations/metrics
 * @desc    Get conversation performance metrics
 * @access  Private
 */
router.get('/metrics', [
  auth,
  query('timeframe')
    .optional()
    .matches(/^\d+[smhd]$/)
    .withMessage('Timeframe must be in format like "7d", "24h", "60m"'),
  validate
], conversationController.getPerformanceMetrics);

/**
 * @route   POST /api/conversations/compare
 * @desc    Compare multiple conversations
 * @access  Private
 */
router.post('/compare', [
  auth,
  validateComparison,
  validate
], conversationController.compareConversations);

// Health Check
/**
 * @route   GET /api/conversations/health
 * @desc    Get conversation manager health status
 * @access  Private
 */
router.get('/health', auth, (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date(),
      version: '1.0.0',
      features: [
        'real-time state tracking',
        'message history with filtering',
        'conversation branching',
        'context switching',
        'conversation resumption',
        'round management',
        'analytics and insights',
        'export and sharing',
        'performance optimization'
      ]
    }
  });
});

module.exports = router;
