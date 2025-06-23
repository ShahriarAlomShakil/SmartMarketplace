// 🔌 Gemini AI API Routes
// Day 11 Enhancement - API endpoints for AI service management

const express = require('express');
const router = express.Router();
const GeminiService = require('../services/geminiService');
const { auth } = require('../middleware/auth');
const { validationResult } = require('express-validator');

/**
 * @swagger
 * /api/ai/health:
 *   get:
 *     summary: Check Gemini AI service health
 *     tags: [AI Service]
 *     responses:
 *       200:
 *         description: Service health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 service:
 *                   type: string
 *                   example: GeminiService
 *                 analytics:
 *                   type: object
 *                 insights:
 *                   type: array
 */
router.get('/health', async (req, res) => {
  try {
    const health = await GeminiService.checkHealth();
    res.json({
      status: 'success',
      data: health
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to check AI service health',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/ai/analytics:
 *   get:
 *     summary: Get AI service analytics dashboard
 *     tags: [AI Service]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics dashboard data
 */
router.get('/analytics', auth, async (req, res) => {
  try {
    const dashboard = GeminiService.getAnalyticsDashboard();
    res.json({
      status: 'success',
      data: dashboard
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to get analytics data',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/ai/test:
 *   post:
 *     summary: Test AI negotiation response
 *     tags: [AI Service]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productTitle
 *               - basePrice
 *               - minPrice
 *               - currentOffer
 *               - userMessage
 *             properties:
 *               productTitle:
 *                 type: string
 *                 example: iPhone 13 Pro
 *               basePrice:
 *                 type: number
 *                 example: 500
 *               minPrice:
 *                 type: number
 *                 example: 450
 *               currentOffer:
 *                 type: number
 *                 example: 400
 *               userMessage:
 *                 type: string
 *                 example: Would you accept $400?
 *               personality:
 *                 type: string
 *                 enum: [friendly, professional, firm, flexible]
 *                 example: friendly
 *               urgency:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 example: medium
 *     responses:
 *       200:
 *         description: AI negotiation response
 */
router.post('/test', auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      productTitle,
      basePrice,
      minPrice,
      currentOffer,
      userMessage,
      personality = 'professional',
      urgency = 'medium',
      rounds = 1,
      maxRounds = 5
    } = req.body;

    const context = {
      productTitle,
      basePrice,
      minPrice,
      currentOffer,
      userMessage,
      personality,
      urgency,
      rounds,
      maxRounds,
      userId: req.user._id.toString()
    };

    const response = await GeminiService.generateNegotiationResponse(context);

    res.json({
      status: 'success',
      data: {
        response,
        context,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate AI response',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/ai/rate-limit/{userId}:
 *   get:
 *     summary: Get rate limit info for user
 *     tags: [AI Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rate limit information
 */
router.get('/rate-limit/:userId', auth, (req, res) => {
  try {
    const { userId } = req.params;
    const rateLimitInfo = GeminiService.getRateLimitInfo(userId);
    
    res.json({
      status: 'success',
      data: {
        userId,
        ...rateLimitInfo,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to get rate limit info',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/ai/export-analytics:
 *   post:
 *     summary: Export analytics data
 *     tags: [AI Service]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filename:
 *                 type: string
 *                 example: analytics-2024-01-15.json
 *     responses:
 *       200:
 *         description: Analytics export successful
 */
router.post('/export-analytics', auth, async (req, res) => {
  try {
    const { filename } = req.body;
    const exportPath = await GeminiService.exportAnalytics(filename);
    
    res.json({
      status: 'success',
      message: 'Analytics exported successfully',
      data: {
        exportPath,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to export analytics',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/ai/prompt-templates:
 *   get:
 *     summary: Get available prompt templates
 *     tags: [AI Service]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available prompt templates
 */
router.get('/prompt-templates', auth, (req, res) => {
  try {
    const { PromptTemplates } = require('../utils/promptTemplates');
    
    const templates = {
      scenarios: Object.keys(PromptTemplates.negotiation),
      personalities: Object.keys(PromptTemplates.personality),
      categories: Object.keys(PromptTemplates.category),
      analysis: Object.keys(PromptTemplates.analysis)
    };
    
    res.json({
      status: 'success',
      data: templates
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to get prompt templates',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/ai/conversation/analyze:
 *   post:
 *     summary: Analyze negotiation conversation
 *     tags: [AI Service]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - negotiationId
 *             properties:
 *               negotiationId:
 *                 type: string
 *                 example: 60d0fe4f5311236168a109ca
 *     responses:
 *       200:
 *         description: Conversation analysis
 */
router.post('/conversation/analyze', auth, async (req, res) => {
  try {
    const { negotiationId } = req.body;
    
    // This would typically fetch the negotiation from database
    // For now, we'll return a placeholder response
    const analysis = {
      negotiationId,
      progress: 'mid-stage',
      buyerProfile: 'serious_negotiator',
      recommendations: [
        'Buyer seems committed but price-sensitive',
        'Consider a small concession to close the deal',
        'Emphasize product value and condition'
      ],
      predictedOutcome: 'likely_success',
      confidence: 0.75
    };
    
    res.json({
      status: 'success',
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to analyze conversation',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/ai/config:
 *   get:
 *     summary: Get AI service configuration
 *     tags: [AI Service]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AI service configuration
 */
router.get('/config', auth, (req, res) => {
  try {
    const config = {
      model: process.env.GEMINI_MODEL || 'gemini-pro',
      maxTokens: 512,
      temperature: 0.7,
      rateLimits: {
        requestsPerMinute: 60,
        windowMs: 60000
      },
      features: {
        caching: true,
        analytics: true,
        fallback: true,
        multiLanguage: false
      }
    };
    
    res.json({
      status: 'success',
      data: config
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to get configuration',
      error: error.message
    });
  }
});

module.exports = router;
