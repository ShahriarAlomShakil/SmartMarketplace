const User = require('../models/User');
const Product = require('../models/Product');
const Negotiation = require('../models/Negotiation');

/**
 * Profile Service - Comprehensive user profile management
 * 
 * Features:
 * - Trust score calculation and management
 * - Profile analytics and insights
 * - Verification badge system
 * - Activity timeline generation
 * - Privacy controls
 * - Social verification features
 */
class ProfileService {
  
  /**
   * Calculate comprehensive trust score for a user
   * @param {string} userId - User ID
   * @returns {Object} Trust score data
   */
  async calculateTrustScore(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const scores = {
        verification: await this.calculateVerificationScore(user),
        activity: await this.calculateActivityScore(user),
        reviews: await this.calculateReviewScore(user),
        completion: await this.calculateCompletionScore(userId),
        consistency: await this.calculateConsistencyScore(userId),
        social: await this.calculateSocialScore(user)
      };

      // Weighted calculation
      const weights = {
        verification: 0.25,  // 25% - Account verification status
        activity: 0.20,      // 20% - Platform activity
        reviews: 0.25,       // 25% - User reviews and ratings
        completion: 0.15,    // 15% - Transaction completion rate
        consistency: 0.10,   // 10% - Behavioral consistency
        social: 0.05         // 5% - Social verification
      };

      const totalScore = Object.keys(scores).reduce((total, key) => {
        return total + (scores[key] * weights[key]);
      }, 0);

      const trustScore = {
        overall: Math.round(totalScore),
        breakdown: scores,
        level: this.getTrustLevel(totalScore),
        badges: await this.calculateTrustBadges(user, scores),
        lastCalculated: new Date()
      };

      // Update user's trust score
      await User.findByIdAndUpdate(userId, {
        'profile.trustScore': trustScore
      });

      return trustScore;
    } catch (error) {
      console.error('Trust score calculation error:', error);
      throw error;
    }
  }

  /**
   * Calculate verification score based on verified accounts
   */
  async calculateVerificationScore(user) {
    const verifications = user.profile?.verificationStatus || {};
    const total = Object.keys(verifications).length;
    const verified = Object.values(verifications).filter(Boolean).length;
    
    let score = (verified / total) * 100;
    
    // Bonus for OAuth connections
    const oauthVerified = Object.values(user.oauth || {})
      .filter(provider => provider.verified).length;
    score += oauthVerified * 5; // 5 points per verified OAuth
    
    return Math.min(score, 100);
  }

  /**
   * Calculate activity score based on platform engagement
   */
  async calculateActivityScore(user) {
    const stats = user.stats || {};
    const daysSinceJoin = Math.max(1, (Date.now() - stats.joinDate) / (1000 * 60 * 60 * 24));
    
    // Activity metrics
    const metrics = {
      listings: stats.productsListed || 0,
      sales: stats.productsSold || 0,
      purchases: stats.productsBought || 0,
      negotiations: stats.successfulNegotiations || 0
    };

    // Activity rate per day
    const activityRate = Object.values(metrics).reduce((sum, val) => sum + val, 0) / daysSinceJoin;
    
    // Score based on activity rate (capped at 100)
    let score = Math.min(activityRate * 20, 80);
    
    // Bonus for recent activity
    const daysSinceLastActive = (Date.now() - stats.lastActive) / (1000 * 60 * 60 * 24);
    if (daysSinceLastActive < 7) score += 20;
    else if (daysSinceLastActive < 30) score += 10;
    
    return Math.min(score, 100);
  }

  /**
   * Calculate review score based on user ratings
   */
  async calculateReviewScore(user) {
    const rating = user.profile?.rating;
    if (!rating || rating.count === 0) return 0;
    
    let score = (rating.average / 5) * 80; // Base score from rating
    
    // Bonus for review count (more reviews = more reliable)
    const reviewBonus = Math.min(rating.count * 2, 20);
    score += reviewBonus;
    
    return Math.min(score, 100);
  }

  /**
   * Calculate completion score based on successful transactions
   */
  async calculateCompletionScore(userId) {
    try {
      const [totalNegotiations, completedNegotiations] = await Promise.all([
        Negotiation.countDocuments({
          $or: [{ buyer: userId }, { seller: userId }]
        }),
        Negotiation.countDocuments({
          $or: [{ buyer: userId }, { seller: userId }],
          status: 'completed'
        })
      ]);

      if (totalNegotiations === 0) return 0;
      
      const completionRate = (completedNegotiations / totalNegotiations) * 100;
      return Math.min(completionRate, 100);
    } catch (error) {
      console.error('Completion score calculation error:', error);
      return 0;
    }
  }

  /**
   * Calculate consistency score based on user behavior patterns
   */
  async calculateConsistencyScore(userId) {
    try {
      // Get recent negotiations to analyze response patterns
      const recentNegotiations = await Negotiation.find({
        $or: [{ buyer: userId }, { seller: userId }],
        updatedAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // Last 90 days
      }).limit(20);

      if (recentNegotiations.length < 3) return 50; // Default for new users

      // Analyze response time consistency, pricing consistency, etc.
      let consistencyFactors = [];
      
      // Response time consistency
      const responseTimes = recentNegotiations
        .flatMap(neg => neg.chatHistory || [])
        .filter(msg => msg.sender.toString() === userId)
        .map((msg, index, array) => {
          if (index === 0) return null;
          return msg.timestamp - array[index - 1].timestamp;
        })
        .filter(Boolean);

      if (responseTimes.length > 0) {
        const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const variance = responseTimes.reduce((sum, time) => sum + Math.pow(time - avgResponseTime, 2), 0) / responseTimes.length;
        const consistency = Math.max(0, 100 - (variance / 1000000)); // Lower variance = higher consistency
        consistencyFactors.push(consistency);
      }

      // Return average of all consistency factors
      const score = consistencyFactors.length > 0 
        ? consistencyFactors.reduce((a, b) => a + b, 0) / consistencyFactors.length 
        : 50;
      
      return Math.min(score, 100);
    } catch (error) {
      console.error('Consistency score calculation error:', error);
      return 50;
    }
  }

  /**
   * Calculate social score based on social connections and verification
   */
  async calculateSocialScore(user) {
    const socialLinks = user.profile?.socialLinks || {};
    const linkedAccounts = Object.values(socialLinks).filter(Boolean).length;
    
    let score = linkedAccounts * 15; // 15 points per social link
    
    // Bonus for profile completeness
    const profileFields = [user.firstName, user.lastName, user.profile?.bio, user.avatar];
    const completedFields = profileFields.filter(Boolean).length;
    score += (completedFields / profileFields.length) * 40;
    
    return Math.min(score, 100);
  }

  /**
   * Get trust level based on score
   */
  getTrustLevel(score) {
    if (score >= 90) return 'Elite';
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Very Good';
    if (score >= 60) return 'Good';
    if (score >= 50) return 'Average';
    if (score >= 30) return 'Fair';
    return 'New';
  }

  /**
   * Calculate trust badges based on achievements
   */
  async calculateTrustBadges(user, scores) {
    const badges = [];

    // Verification badges
    if (scores.verification >= 90) badges.push({
      id: 'verified_champion',
      name: 'Verification Champion',
      description: 'All verification requirements completed',
      icon: 'shield-check',
      color: 'blue'
    });

    // Activity badges
    if (scores.activity >= 80) badges.push({
      id: 'super_active',
      name: 'Super Active',
      description: 'Highly engaged community member',
      icon: 'lightning-bolt',
      color: 'yellow'
    });

    // Review badges
    if (scores.reviews >= 90 && user.profile?.rating?.count >= 10) badges.push({
      id: 'five_star_seller',
      name: 'Five Star Seller',
      description: 'Consistently excellent reviews',
      icon: 'star',
      color: 'gold'
    });

    // Completion badges
    if (scores.completion >= 95) badges.push({
      id: 'reliable_trader',
      name: 'Reliable Trader',
      description: 'Exceptional completion rate',
      icon: 'check-circle',
      color: 'green'
    });

    // Special badges based on stats
    const stats = user.stats || {};
    if (stats.productsSold >= 50) badges.push({
      id: 'power_seller',
      name: 'Power Seller',
      description: '50+ successful sales',
      icon: 'trending-up',
      color: 'purple'
    });

    if (stats.successfulNegotiations >= 100) badges.push({
      id: 'negotiation_master',
      name: 'Negotiation Master',
      description: '100+ successful negotiations',
      icon: 'chat-bubble-left-right',
      color: 'indigo'
    });

    return badges;
  }

  /**
   * Get comprehensive profile analytics
   */
  async getProfileAnalytics(userId, timeRange = '30d') {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      const days = this.getTimeRangeDays(timeRange);
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const analytics = {
        overview: await this.getOverviewAnalytics(userId, startDate),
        activity: await this.getActivityAnalytics(userId, startDate),
        negotiations: await this.getNegotiationAnalytics(userId, startDate),
        earnings: await this.getEarningsAnalytics(userId, startDate),
        performance: await this.getPerformanceAnalytics(userId, startDate),
        trends: await this.getTrendAnalytics(userId, startDate)
      };

      return analytics;
    } catch (error) {
      console.error('Profile analytics error:', error);
      throw error;
    }
  }

  /**
   * Get overview analytics
   */
  async getOverviewAnalytics(userId, startDate) {
    const [products, negotiations, reviews] = await Promise.all([
      Product.find({ seller: userId, createdAt: { $gte: startDate } }),
      Negotiation.find({ 
        $or: [{ buyer: userId }, { seller: userId }],
        createdAt: { $gte: startDate }
      }),
      User.findById(userId, 'profile.rating')
    ]);

    return {
      totalProducts: products.length,
      activeNegotiations: negotiations.filter(n => n.status === 'active').length,
      completedDeals: negotiations.filter(n => n.status === 'completed').length,
      averageRating: reviews.profile?.rating?.average || 0,
      totalReviews: reviews.profile?.rating?.count || 0
    };
  }

  /**
   * Get activity analytics with daily breakdown
   */
  async getActivityAnalytics(userId, startDate) {
    const negotiations = await Negotiation.find({
      $or: [{ buyer: userId }, { seller: userId }],
      createdAt: { $gte: startDate }
    });

    const products = await Product.find({
      seller: userId,
      createdAt: { $gte: startDate }
    });

    // Group by day
    const dailyActivity = {};
    const addToDay = (date, type) => {
      const day = date.toISOString().split('T')[0];
      if (!dailyActivity[day]) {
        dailyActivity[day] = { date: day, negotiations: 0, products: 0 };
      }
      dailyActivity[day][type]++;
    };

    negotiations.forEach(neg => addToDay(neg.createdAt, 'negotiations'));
    products.forEach(prod => addToDay(prod.createdAt, 'products'));

    return {
      daily: Object.values(dailyActivity).sort((a, b) => new Date(a.date) - new Date(b.date)),
      totalActivity: negotiations.length + products.length
    };
  }

  /**
   * Get negotiation analytics
   */
  async getNegotiationAnalytics(userId, startDate) {
    const negotiations = await Negotiation.find({
      $or: [{ buyer: userId }, { seller: userId }],
      createdAt: { $gte: startDate }
    });

    const statusBreakdown = negotiations.reduce((acc, neg) => {
      acc[neg.status] = (acc[neg.status] || 0) + 1;
      return acc;
    }, {});

    const avgNegotiationTime = negotiations
      .filter(neg => neg.status === 'completed')
      .reduce((sum, neg) => {
        const duration = neg.updatedAt - neg.createdAt;
        return sum + duration;
      }, 0) / Math.max(1, negotiations.filter(neg => neg.status === 'completed').length);

    return {
      total: negotiations.length,
      statusBreakdown,
      averageNegotiationTime: avgNegotiationTime / (1000 * 60 * 60), // Convert to hours
      successRate: negotiations.length > 0 ? 
        (statusBreakdown.completed || 0) / negotiations.length * 100 : 0
    };
  }

  /**
   * Get earnings analytics (for sellers)
   */
  async getEarningsAnalytics(userId, startDate) {
    const completedNegotiations = await Negotiation.find({
      seller: userId,
      status: 'completed',
      createdAt: { $gte: startDate }
    });

    const earnings = completedNegotiations.reduce((sum, neg) => sum + (neg.finalPrice || 0), 0);
    const avgDealValue = completedNegotiations.length > 0 ? earnings / completedNegotiations.length : 0;

    return {
      totalEarnings: earnings,
      totalDeals: completedNegotiations.length,
      averageDealValue: avgDealValue
    };
  }

  /**
   * Get performance analytics
   */
  async getPerformanceAnalytics(userId, startDate) {
    const user = await User.findById(userId);
    const trustScore = await this.calculateTrustScore(userId);

    return {
      trustScore: trustScore.overall,
      trustLevel: trustScore.level,
      badges: trustScore.badges,
      profileViews: user.stats?.profileViews || 0,
      responseRate: await this.calculateResponseRate(userId, startDate)
    };
  }

  /**
   * Get trend analytics
   */
  async getTrendAnalytics(userId, startDate) {
    // Compare with previous period
    const periodLength = Date.now() - startDate.getTime();
    const previousPeriodStart = new Date(startDate.getTime() - periodLength);

    const [currentPeriod, previousPeriod] = await Promise.all([
      this.getOverviewAnalytics(userId, startDate),
      this.getOverviewAnalytics(userId, previousPeriodStart)
    ]);

    const calculateTrend = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      productsListed: calculateTrend(currentPeriod.totalProducts, previousPeriod.totalProducts),
      negotiations: calculateTrend(currentPeriod.activeNegotiations, previousPeriod.activeNegotiations),
      completedDeals: calculateTrend(currentPeriod.completedDeals, previousPeriod.completedDeals)
    };
  }

  /**
   * Calculate response rate for user
   */
  async calculateResponseRate(userId, startDate) {
    const negotiations = await Negotiation.find({
      $or: [{ buyer: userId }, { seller: userId }],
      createdAt: { $gte: startDate }
    });

    let totalMessages = 0;
    let responseCount = 0;

    negotiations.forEach(neg => {
      const userMessages = neg.chatHistory?.filter(msg => 
        msg.sender.toString() === userId
      ) || [];
      
      const otherMessages = neg.chatHistory?.filter(msg => 
        msg.sender.toString() !== userId
      ) || [];

      totalMessages += otherMessages.length;
      
      // Count responses (user message after other user's message)
      otherMessages.forEach(otherMsg => {
        const hasResponse = userMessages.some(userMsg => 
          userMsg.timestamp > otherMsg.timestamp &&
          userMsg.timestamp < otherMsg.timestamp + (24 * 60 * 60 * 1000) // Within 24 hours
        );
        if (hasResponse) responseCount++;
      });
    });

    return totalMessages > 0 ? (responseCount / totalMessages) * 100 : 100;
  }

  /**
   * Generate activity timeline for user
   */
  async generateActivityTimeline(userId, limit = 50) {
    try {
      const activities = [];

      // Get recent products
      const products = await Product.find({ seller: userId })
        .sort({ createdAt: -1 })
        .limit(limit / 2)
        .select('title createdAt status');

      products.forEach(product => {
        activities.push({
          type: 'product_listed',
          title: `Listed "${product.title}"`,
          description: `New product listing created`,
          timestamp: product.createdAt,
          icon: 'plus-circle',
          color: 'blue'
        });
      });

      // Get recent negotiations
      const negotiations = await Negotiation.find({
        $or: [{ buyer: userId }, { seller: userId }]
      })
        .sort({ createdAt: -1 })
        .limit(limit / 2)
        .populate('product', 'title')
        .select('product status createdAt buyer seller');

      negotiations.forEach(negotiation => {
        const isBuyer = negotiation.buyer.toString() === userId;
        activities.push({
          type: isBuyer ? 'negotiation_started' : 'negotiation_received',
          title: isBuyer ? 'Started negotiation' : 'Received negotiation',
          description: `For "${negotiation.product?.title || 'Unknown Product'}"`,
          timestamp: negotiation.createdAt,
          icon: isBuyer ? 'chat-bubble-left' : 'chat-bubble-right',
          color: 'green'
        });
      });

      // Sort by timestamp (most recent first)
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return activities.slice(0, limit);
    } catch (error) {
      console.error('Activity timeline generation error:', error);
      throw error;
    }
  }

  /**
   * Update user privacy settings
   */
  async updatePrivacySettings(userId, privacySettings) {
    try {
      const allowedSettings = ['showProfile', 'showActivity', 'allowMessages'];
      const updates = {};

      Object.keys(privacySettings).forEach(key => {
        if (allowedSettings.includes(key)) {
          updates[`preferences.privacy.${key}`] = privacySettings[key];
        }
      });

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
      );

      return user.preferences.privacy;
    } catch (error) {
      console.error('Privacy settings update error:', error);
      throw error;
    }
  }

  /**
   * Helper method to convert time range to days
   */
  getTimeRangeDays(timeRange) {
    switch (timeRange) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      default: return 30;
    }
  }
}

module.exports = new ProfileService();
