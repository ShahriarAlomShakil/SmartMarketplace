const User = require('../models/User');
const Product = require('../models/Product');
const Negotiation = require('../models/Negotiation');
const profileService = require('../services/profileService');
const oauthService = require('../services/oauthService');
const { validationResult } = require('express-validator');

/**
 * Enhanced Profile Controller - Day 18 Implementation
 * 
 * Features:
 * - Trust score management
 * - Profile analytics
 * - Social authentication integration
 * - Privacy controls
 * - Activity timeline
 * - Verification badge system
 */

// @desc    Get comprehensive profile data with trust score
// @route   GET /api/profile/complete
// @access  Private
const getCompleteProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Get trust score (calculate if not recent)
    let trustScore = user.profile?.trustScore;
    if (!trustScore || 
        !trustScore.lastCalculated || 
        Date.now() - trustScore.lastCalculated > 24 * 60 * 60 * 1000) { // 24 hours
      trustScore = await profileService.calculateTrustScore(user._id);
    }

    // Get OAuth connections
    const oauthConnections = await oauthService.getUserOAuthConnections(user._id);

    // Get recent activity timeline
    const activityTimeline = await profileService.generateActivityTimeline(user._id, 20);

    const completeProfile = {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        avatar: user.avatar,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        profile: user.profile,
        preferences: user.preferences,
        stats: user.stats,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      trustScore,
      oauthConnections,
      activityTimeline
    };

    res.json({
      status: 'success',
      data: completeProfile
    });

  } catch (error) {
    console.error('Get complete profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching complete profile'
    });
  }
};

// @desc    Get profile analytics
// @route   GET /api/profile/analytics
// @access  Private
const getProfileAnalytics = async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    const analytics = await profileService.getProfileAnalytics(req.user._id, timeRange);

    res.json({
      status: 'success',
      data: {
        analytics,
        timeRange,
        generatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Get profile analytics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching profile analytics'
    });
  }
};

// @desc    Update trust score manually
// @route   POST /api/profile/trust-score/recalculate
// @access  Private
const recalculateTrustScore = async (req, res) => {
  try {
    const trustScore = await profileService.calculateTrustScore(req.user._id);

    res.json({
      status: 'success',
      message: 'Trust score recalculated successfully',
      data: { trustScore }
    });

  } catch (error) {
    console.error('Recalculate trust score error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while recalculating trust score'
    });
  }
};

// @desc    Get activity timeline
// @route   GET /api/profile/activity-timeline
// @access  Private
const getActivityTimeline = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const timeline = await profileService.generateActivityTimeline(
      req.user._id, 
      parseInt(limit)
    );

    res.json({
      status: 'success',
      data: {
        timeline,
        count: timeline.length
      }
    });

  } catch (error) {
    console.error('Get activity timeline error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching activity timeline'
    });
  }
};

// @desc    Update privacy settings
// @route   PUT /api/profile/privacy
// @access  Private
const updatePrivacySettings = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { showProfile, showActivity, allowMessages } = req.body;
    
    const privacySettings = await profileService.updatePrivacySettings(req.user._id, {
      showProfile,
      showActivity,
      allowMessages
    });

    res.json({
      status: 'success',
      message: 'Privacy settings updated successfully',
      data: { privacySettings }
    });

  } catch (error) {
    console.error('Update privacy settings error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating privacy settings'
    });
  }
};

// @desc    Get user's OAuth connections
// @route   GET /api/profile/oauth-connections
// @access  Private
const getOAuthConnections = async (req, res) => {
  try {
    const connections = await oauthService.getUserOAuthConnections(req.user._id);

    res.json({
      status: 'success',
      data: { connections }
    });

  } catch (error) {
    console.error('Get OAuth connections error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching OAuth connections'
    });
  }
};

// @desc    Link OAuth account
// @route   POST /api/profile/oauth/:provider/link
// @access  Private
const linkOAuthAccount = async (req, res) => {
  try {
    const { provider } = req.params;
    const { accessToken, profile } = req.body;

    // In a real implementation, you would verify the access token with the provider
    // For now, we'll simulate this
    const user = await oauthService.linkOAuthAccount(req.user._id, provider, profile);

    res.json({
      status: 'success',
      message: `${provider} account linked successfully`,
      data: { user: { _id: user._id, oauth: user.oauth } }
    });

  } catch (error) {
    console.error('Link OAuth account error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Server error while linking OAuth account'
    });
  }
};

// @desc    Unlink OAuth account
// @route   DELETE /api/profile/oauth/:provider
// @access  Private
const unlinkOAuthAccount = async (req, res) => {
  try {
    const { provider } = req.params;
    
    const user = await oauthService.unlinkOAuthAccount(req.user._id, provider);

    res.json({
      status: 'success',
      message: `${provider} account unlinked successfully`,
      data: { user: { _id: user._id, oauth: user.oauth } }
    });

  } catch (error) {
    console.error('Unlink OAuth account error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Server error while unlinking OAuth account'
    });
  }
};

// @desc    Update profile preferences
// @route   PUT /api/profile/preferences
// @access  Private
const updateProfilePreferences = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { preferences, notifications, privacy } = req.body;
    const updates = {};

    if (preferences) {
      Object.keys(preferences).forEach(key => {
        updates[`preferences.${key}`] = preferences[key];
      });
    }

    if (notifications) {
      Object.keys(notifications).forEach(key => {
        updates[`preferences.notifications.${key}`] = notifications[key];
      });
    }

    if (privacy) {
      Object.keys(privacy).forEach(key => {
        updates[`preferences.privacy.${key}`] = privacy[key];
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Preferences updated successfully',
      data: {
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating preferences'
    });
  }
};

// @desc    Request profile verification
// @route   POST /api/profile/verification/:type
// @access  Private
const requestVerification = async (req, res) => {
  try {
    const { type } = req.params; // email, phone, identity, address
    const validTypes = ['email', 'phone', 'identity', 'address'];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid verification type'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if already verified
    if (user.profile?.verificationStatus?.[type]) {
      return res.status(400).json({
        status: 'error',
        message: `${type} is already verified`
      });
    }

    // Simulate verification process (in real app, would send email/SMS/etc.)
    // For demo purposes, we'll mark as verified immediately
    const updatePath = `profile.verificationStatus.${type}`;
    await User.findByIdAndUpdate(req.user._id, {
      $set: { [updatePath]: true }
    });

    // Recalculate trust score after verification
    const trustScore = await profileService.calculateTrustScore(req.user._id);

    res.json({
      status: 'success',
      message: `${type} verification completed successfully`,
      data: { 
        verificationType: type,
        trustScore
      }
    });

  } catch (error) {
    console.error('Request verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while processing verification request'
    });
  }
};

// @desc    Get profile insights and recommendations
// @route   GET /api/profile/insights
// @access  Private
const getProfileInsights = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const trustScore = user.profile?.trustScore;

    const insights = {
      profileCompleteness: calculateProfileCompleteness(user),
      recommendedActions: generateRecommendations(user, trustScore),
      upcomingFeatures: getUpcomingFeatures(user),
      achievements: getRecentAchievements(user, trustScore)
    };

    res.json({
      status: 'success',
      data: { insights }
    });

  } catch (error) {
    console.error('Get profile insights error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching profile insights'
    });
  }
};

// Helper function to calculate profile completeness
const calculateProfileCompleteness = (user) => {
  const fields = [
    user.firstName,
    user.lastName,
    user.avatar,
    user.phone,
    user.profile?.bio,
    user.profile?.location?.city,
    user.profile?.location?.country
  ];

  const completed = fields.filter(Boolean).length;
  const percentage = Math.round((completed / fields.length) * 100);

  return {
    percentage,
    completedFields: completed,
    totalFields: fields.length,
    missingFields: fields.length - completed
  };
};

// Helper function to generate recommendations
const generateRecommendations = (user, trustScore) => {
  const recommendations = [];

  // Profile completeness recommendations
  if (!user.avatar) {
    recommendations.push({
      type: 'profile',
      priority: 'high',
      title: 'Add Profile Photo',
      description: 'Users with profile photos receive 40% more messages',
      action: 'upload_avatar'
    });
  }

  if (!user.profile?.bio) {
    recommendations.push({
      type: 'profile',
      priority: 'medium',
      title: 'Write Bio',
      description: 'Tell others about yourself to build trust',
      action: 'add_bio'
    });
  }

  // Trust score recommendations
  if (trustScore && trustScore.overall < 70) {
    if (trustScore.breakdown.verification < 50) {
      recommendations.push({
        type: 'verification',
        priority: 'high',
        title: 'Verify Your Account',
        description: 'Increase trust score by verifying email and phone',
        action: 'verify_account'
      });
    }

    if (trustScore.breakdown.social < 30) {
      recommendations.push({
        type: 'social',
        priority: 'low',
        title: 'Connect Social Accounts',
        description: 'Link your social media accounts to boost credibility',
        action: 'connect_social'
      });
    }
  }

  return recommendations;
};

// Helper function to get upcoming features
const getUpcomingFeatures = (user) => {
  const features = [
    {
      name: 'Video Verification',
      description: 'Verify your identity with a quick video selfie',
      availability: 'Coming Soon',
      benefit: '+15 Trust Score'
    },
    {
      name: 'AI-Powered Insights',
      description: 'Get personalized selling recommendations',
      availability: 'Beta Access',
      benefit: 'Increase Sales 25%'
    }
  ];

  return features;
};

// Helper function to get recent achievements
const getRecentAchievements = (user, trustScore) => {
  const achievements = [];

  // Check for recent badges
  if (trustScore && trustScore.badges && trustScore.badges.length > 0) {
    const recentBadges = trustScore.badges
      .filter(badge => {
        const daysSinceEarned = (Date.now() - badge.earnedAt) / (1000 * 60 * 60 * 24);
        return daysSinceEarned <= 30; // Last 30 days
      })
      .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt));

    achievements.push(...recentBadges.map(badge => ({
      type: 'badge',
      title: badge.name,
      description: badge.description,
      earnedAt: badge.earnedAt,
      icon: badge.icon,
      color: badge.color
    })));
  }

  return achievements;
};

// @desc    Export user data
// @route   GET /api/profile/export
// @access  Private
const exportUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Get user's products
    const products = await Product.find({ seller: user._id });

    // Get user's negotiations
    const negotiations = await Negotiation.find({
      $or: [{ buyer: user._id }, { seller: user._id }]
    }).populate('product buyer seller', 'title username');

    // Prepare export data
    const exportData = {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profile: user.profile,
        preferences: user.preferences,
        stats: user.stats,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      products: products.map(product => ({
        _id: product._id,
        title: product.title,
        description: product.description,
        basePrice: product.basePrice,
        minPrice: product.minPrice,
        status: product.status,
        createdAt: product.createdAt
      })),
      negotiations: negotiations.map(negotiation => ({
        _id: negotiation._id,
        product: negotiation.product?.title,
        status: negotiation.status,
        finalPrice: negotiation.finalPrice,
        createdAt: negotiation.createdAt
      })),
      exportedAt: new Date(),
      exportVersion: '1.0'
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=profile-data-${user.username}-${new Date().toISOString().split('T')[0]}.json`);
    res.json(exportData);

  } catch (error) {
    console.error('Export user data error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while exporting data'
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/profile/delete
// @access  Private
const deleteUserAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Perform any necessary cleanup, like removing related data
    await Product.deleteMany({ seller: user._id });
    await Negotiation.deleteMany({
      $or: [{ buyer: user._id }, { seller: user._id }]
    });

    // Delete the user account
    await User.findByIdAndDelete(req.user._id);

    res.json({
      status: 'success',
      message: 'User account deleted successfully'
    });

  } catch (error) {
    console.error('Delete user account error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting user account'
    });
  }
};

module.exports = {
  getCompleteProfile,
  getProfileAnalytics,
  recalculateTrustScore,
  getActivityTimeline,
  updatePrivacySettings,
  getOAuthConnections,
  linkOAuthAccount,
  unlinkOAuthAccount,
  updateProfilePreferences,
  requestVerification,
  getProfileInsights,
  exportUserData,
  deleteUserAccount
};
