/**
 * Advanced Conversation Controller for Day 16 - Smart Marketplace
 * 
 * Enhanced controller with advanced conversation management features
 */

const { validationResult } = require('express-validator');
const conversationManager = require('../services/conversationManager');
const conversationAnalytics = require('../services/conversationAnalytics');
const Negotiation = require('../models/Negotiation');

class ConversationController {
  
  /**
   * Get conversation state with real-time tracking
   * GET /api/conversations/:id/state
   */
  async getConversationState(req, res) {
    try {
      const { id: negotiationId } = req.params;
      const userId = req.user.id;

      // Validate user can access this conversation
      const negotiation = await Negotiation.findById(negotiationId);
      if (!negotiation || !negotiation.canParticipate(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this conversation'
        });
      }

      const state = await conversationManager.getConversationState(negotiationId);
      
      if (!state) {
        return res.status(404).json({
          success: false,
          message: 'Conversation state not found'
        });
      }

      res.json({
        success: true,
        data: {
          state,
          userRole: negotiation.getParticipantRole(userId),
          permissions: {
            canMessage: negotiation.canContinue(),
            canOffer: negotiation.canContinue() && negotiation.getParticipantRole(userId) !== 'ai',
            canManageRounds: negotiation.getParticipantRole(userId) === 'seller'
          }
        }
      });
    } catch (error) {
      console.error('Error getting conversation state:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get conversation state',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Update conversation state
   * PUT /api/conversations/:id/state
   */
  async updateConversationState(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id: negotiationId } = req.params;
      const { state } = req.body;
      const userId = req.user.id;

      // Validate user can modify this conversation
      const negotiation = await Negotiation.findById(negotiationId);
      if (!negotiation || !negotiation.canParticipate(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this conversation'
        });
      }

      const updatedState = await conversationManager.trackConversationState(negotiationId, {
        ...state,
        lastUpdatedBy: userId,
        lastUpdatedAt: new Date()
      });

      res.json({
        success: true,
        data: updatedState
      });
    } catch (error) {
      console.error('Error updating conversation state:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update conversation state',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get enhanced message history with advanced filtering
   * GET /api/conversations/:id/messages
   */
  async getMessageHistory(req, res) {
    try {
      const { id: negotiationId } = req.params;
      const {
        limit = 50,
        offset = 0,
        sender,
        messageType,
        dateRange,
        branch = 'main',
        includeContext = false
      } = req.query;

      const userId = req.user.id;

      // Validate user can access this conversation
      const negotiation = await Negotiation.findById(negotiationId);
      if (!negotiation || !negotiation.canParticipate(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this conversation'
        });
      }

      // Parse date range if provided
      let parsedDateRange = null;
      if (dateRange) {
        const [start, end] = dateRange.split(',');
        parsedDateRange = {
          start: new Date(start),
          end: new Date(end)
        };
      }

      const messageHistory = await conversationManager.getMessageHistory(negotiationId, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        sender,
        messageType,
        dateRange: parsedDateRange,
        branch,
        includeContext: includeContext === 'true'
      });

      // Mark messages as read for the requesting user
      await negotiation.markMessagesAsRead(userId);

      res.json({
        success: true,
        data: messageHistory
      });
    } catch (error) {
      console.error('Error getting message history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get message history',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Store message with enhanced context
   * POST /api/conversations/:id/messages
   */
  async storeMessage(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id: negotiationId } = req.params;
      const { content, type, offer, metadata, context } = req.body;
      const userId = req.user.id;

      // Validate user can participate in this conversation
      const negotiation = await Negotiation.findById(negotiationId);
      if (!negotiation || !negotiation.canParticipate(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this conversation'
        });
      }

      if (!negotiation.canContinue()) {
        return res.status(400).json({
          success: false,
          message: 'This conversation cannot continue'
        });
      }

      const userRole = negotiation.getParticipantRole(userId);
      
      const messageData = {
        sender: userRole,
        senderId: userId,
        content,
        type: type || 'text',
        offer,
        metadata: {
          ...metadata,
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip,
          timestamp: new Date()
        }
      };

      const enhancedMessage = await conversationManager.storeMessage(
        negotiationId,
        messageData,
        {
          ...context,
          responseTime: context?.responseTime || 0,
          branch: context?.branch || 'main'
        }
      );

      // Emit real-time update
      if (global.io) {
        global.io.to(`negotiation:${negotiationId}`).emit('conversation:new-message', {
          negotiationId,
          message: enhancedMessage,
          timestamp: new Date()
        });
      }

      res.status(201).json({
        success: true,
        data: enhancedMessage
      });
    } catch (error) {
      console.error('Error storing message:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to store message',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Create conversation branch
   * POST /api/conversations/:id/branches
   */
  async createBranch(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id: negotiationId } = req.params;
      const { branchName, branchType = 'scenario', parentBranch = 'main' } = req.body;
      const userId = req.user.id;

      // Validate user can manage this conversation
      const negotiation = await Negotiation.findById(negotiationId);
      if (!negotiation || !negotiation.canParticipate(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this conversation'
        });
      }

      const branch = await conversationManager.createConversationBranch(
        negotiationId,
        branchName,
        branchType,
        parentBranch
      );

      res.status(201).json({
        success: true,
        data: branch,
        message: `Branch '${branchName}' created successfully`
      });
    } catch (error) {
      console.error('Error creating conversation branch:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create conversation branch',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Switch to conversation branch
   * PUT /api/conversations/:id/branches/:branchName/switch
   */
  async switchBranch(req, res) {
    try {
      const { id: negotiationId, branchName } = req.params;
      const userId = req.user.id;

      // Validate user can manage this conversation
      const negotiation = await Negotiation.findById(negotiationId);
      if (!negotiation || !negotiation.canParticipate(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this conversation'
        });
      }

      const result = await conversationManager.switchToBranch(negotiationId, branchName);

      res.json({
        success: true,
        data: result,
        message: `Switched to branch '${branchName}'`
      });
    } catch (error) {
      console.error('Error switching conversation branch:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to switch conversation branch',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Switch conversation context
   * POST /api/conversations/switch-context
   */
  async switchContext(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { fromNegotiationId, toNegotiationId } = req.body;
      const userId = req.user.id;

      // Validate user can access both conversations
      const fromNegotiation = await Negotiation.findById(fromNegotiationId);
      const toNegotiation = await Negotiation.findById(toNegotiationId);

      if (!fromNegotiation || !fromNegotiation.canParticipate(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to source conversation'
        });
      }

      if (!toNegotiation || !toNegotiation.canParticipate(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to target conversation'
        });
      }

      const result = await conversationManager.switchContext(
        userId,
        fromNegotiationId,
        toNegotiationId
      );

      res.json({
        success: true,
        data: result,
        message: 'Context switched successfully'
      });
    } catch (error) {
      console.error('Error switching conversation context:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to switch conversation context',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Resume conversation after interruption
   * POST /api/conversations/:id/resume
   */
  async resumeConversation(req, res) {
    try {
      const { id: negotiationId } = req.params;
      const { interruption, resumptionData } = req.body;
      const userId = req.user.id;

      // Validate user can access this conversation
      const negotiation = await Negotiation.findById(negotiationId);
      if (!negotiation || !negotiation.canParticipate(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this conversation'
        });
      }

      const result = await conversationManager.resumeConversation(
        negotiationId,
        userId,
        {
          interruption,
          ...resumptionData
        }
      );

      res.json({
        success: true,
        data: result,
        message: 'Conversation resumed successfully'
      });
    } catch (error) {
      console.error('Error resuming conversation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resume conversation',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Manage negotiation rounds
   * POST /api/conversations/:id/rounds/:action
   */
  async manageRounds(req, res) {
    try {
      const { id: negotiationId, action } = req.params;
      const { context } = req.body;
      const userId = req.user.id;

      // Validate user can manage rounds
      const negotiation = await Negotiation.findById(negotiationId);
      if (!negotiation || !negotiation.canParticipate(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this conversation'
        });
      }

      // Only sellers can manage rounds in most cases
      if (action !== 'check_limit' && negotiation.getParticipantRole(userId) !== 'seller') {
        return res.status(403).json({
          success: false,
          message: 'Only sellers can manage round limits'
        });
      }

      const result = await conversationManager.manageNegotiationRounds(
        negotiationId,
        action,
        context
      );

      res.json({
        success: true,
        data: result,
        message: `Round ${action} completed successfully`
      });
    } catch (error) {
      console.error('Error managing rounds:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to manage negotiation rounds',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Generate conversation analytics
   * GET /api/conversations/:id/analytics
   */
  async getAnalytics(req, res) {
    try {
      const { id: negotiationId } = req.params;
      const { timeframe = '7d', types = 'sentiment,behavior,performance' } = req.query;
      const userId = req.user.id;

      // Validate user can access this conversation
      const negotiation = await Negotiation.findById(negotiationId);
      if (!negotiation || !negotiation.canParticipate(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this conversation'
        });
      }

      const insightTypes = types.split(',').map(t => t.trim());
      const analytics = await conversationAnalytics.generateInsights(negotiationId, insightTypes);

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Error getting conversation analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get conversation analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Generate conversation report
   * GET /api/conversations/:id/reports/:type
   */
  async generateReport(req, res) {
    try {
      const { id: negotiationId, type } = req.params;
      const userId = req.user.id;

      // Validate user can access this conversation
      const negotiation = await Negotiation.findById(negotiationId);
      if (!negotiation || !negotiation.canParticipate(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this conversation'
        });
      }

      const report = await conversationAnalytics.generateReport(
        negotiationId,
        type,
        req.query
      );

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Error generating conversation report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate conversation report',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Export conversation
   * GET /api/conversations/:id/export
   */
  async exportConversation(req, res) {
    try {
      const { id: negotiationId } = req.params;
      const { format = 'json', ...options } = req.query;
      const userId = req.user.id;

      // Validate user can access this conversation
      const negotiation = await Negotiation.findById(negotiationId);
      if (!negotiation || !negotiation.canParticipate(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this conversation'
        });
      }

      const exportData = await conversationManager.exportConversation(
        negotiationId,
        format,
        {
          ...options,
          includeMetadata: options.includeMetadata === 'true',
          includeAnalytics: options.includeAnalytics === 'true'
        }
      );

      // Set appropriate headers based on format
      const contentTypes = {
        json: 'application/json',
        csv: 'text/csv',
        txt: 'text/plain',
        html: 'text/html'
      };

      const fileExtensions = {
        json: 'json',
        csv: 'csv',
        txt: 'txt',
        html: 'html'
      };

      res.setHeader('Content-Type', contentTypes[format] || 'application/octet-stream');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="conversation-${negotiationId}.${fileExtensions[format] || 'txt'}"`
      );

      res.send(exportData);
    } catch (error) {
      console.error('Error exporting conversation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export conversation',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Share conversation
   * POST /api/conversations/:id/share
   */
  async shareConversation(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id: negotiationId } = req.params;
      const shareOptions = req.body;
      const userId = req.user.id;

      // Validate user can share this conversation
      const negotiation = await Negotiation.findById(negotiationId);
      if (!negotiation || !negotiation.canParticipate(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this conversation'
        });
      }

      const shareResult = await conversationManager.shareConversation(
        negotiationId,
        {
          ...shareOptions,
          sharedBy: userId
        }
      );

      res.status(201).json({
        success: true,
        data: shareResult,
        message: 'Conversation shared successfully'
      });
    } catch (error) {
      console.error('Error sharing conversation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to share conversation',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get conversation performance metrics
   * GET /api/conversations/metrics
   */
  async getPerformanceMetrics(req, res) {
    try {
      const userId = req.user.id;
      const { timeframe = '24h' } = req.query;

      // Get user's conversations for metrics
      const userNegotiations = await Negotiation.findActiveByUser(userId);
      
      const metrics = {
        totalConversations: userNegotiations.length,
        activeConversations: userNegotiations.filter(n => n.status === 'in_progress').length,
        completedConversations: userNegotiations.filter(n => n.status === 'completed').length,
        averageResponseTime: 0,
        totalMessages: 0,
        successRate: 0
      };

      // Calculate detailed metrics
      for (const negotiation of userNegotiations) {
        metrics.totalMessages += negotiation.messages?.length || 0;
        
        if (negotiation.analytics?.averageResponseTime) {
          metrics.averageResponseTime += negotiation.analytics.averageResponseTime;
        }
      }

      if (userNegotiations.length > 0) {
        metrics.averageResponseTime /= userNegotiations.length;
        metrics.successRate = metrics.completedConversations / userNegotiations.length;
      }

      // Get system-wide performance metrics
      const systemMetrics = conversationManager.reportPerformanceMetrics();

      res.json({
        success: true,
        data: {
          user: metrics,
          system: systemMetrics,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get performance metrics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Compare multiple conversations
   * POST /api/conversations/compare
   */
  async compareConversations(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { negotiationIds } = req.body;
      const userId = req.user.id;

      // Validate user can access all conversations
      for (const negotiationId of negotiationIds) {
        const negotiation = await Negotiation.findById(negotiationId);
        if (!negotiation || !negotiation.canParticipate(userId)) {
          return res.status(403).json({
            success: false,
            message: `Access denied to conversation ${negotiationId}`
          });
        }
      }

      const comparisonReport = await conversationAnalytics.generateReport(
        negotiationIds,
        'comparison',
        req.query
      );

      res.json({
        success: true,
        data: comparisonReport
      });
    } catch (error) {
      console.error('Error comparing conversations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to compare conversations',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get conversation insights
   * GET /api/conversations/:id/insights
   */
  async getInsights(req, res) {
    try {
      const { id: negotiationId } = req.params;
      const { types = 'sentiment,behavior,performance,prediction' } = req.query;
      const userId = req.user.id;

      // Validate user can access this conversation
      const negotiation = await Negotiation.findById(negotiationId);
      if (!negotiation || !negotiation.canParticipate(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this conversation'
        });
      }

      const insightTypes = types.split(',').map(t => t.trim());
      const insights = await conversationAnalytics.generateInsights(negotiationId, insightTypes);

      res.json({
        success: true,
        data: insights
      });
    } catch (error) {
      console.error('Error getting conversation insights:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get conversation insights',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new ConversationController();
