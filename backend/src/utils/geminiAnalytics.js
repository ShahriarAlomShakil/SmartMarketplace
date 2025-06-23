// 📊 Gemini AI Analytics and Monitoring Service
// Day 11 Enhancement - Advanced monitoring and analytics

const fs = require('fs').promises;
const path = require('path');
const EventEmitter = require('events');

class GeminiAnalytics extends EventEmitter {
  constructor() {
    super();
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      rateLimitHits: 0,
      popularPromptTypes: new Map(),
      errorTypes: new Map(),
      responseTimes: [],
      dailyUsage: new Map()
    };
    
    this.logFile = path.join(__dirname, 'logs', 'gemini-analytics.log');
    this.ensureLogDirectory();
  }

  // Ensure log directory exists
  async ensureLogDirectory() {
    try {
      await fs.mkdir(path.dirname(this.logFile), { recursive: true });
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }
  }

  // Record API request
  recordRequest(type, responseTime, success, error = null) {
    this.metrics.totalRequests++;
    
    if (success) {
      this.metrics.successfulRequests++;
      this.metrics.responseTimes.push(responseTime);
      this.updateAverageResponseTime();
    } else {
      this.metrics.failedRequests++;
      if (error) {
        const errorType = this.categorizeError(error);
        this.metrics.errorTypes.set(errorType, (this.metrics.errorTypes.get(errorType) || 0) + 1);
      }
    }

    // Track daily usage
    const today = new Date().toISOString().split('T')[0];
    this.metrics.dailyUsage.set(today, (this.metrics.dailyUsage.get(today) || 0) + 1);

    // Track prompt types
    this.metrics.popularPromptTypes.set(type, (this.metrics.popularPromptTypes.get(type) || 0) + 1);

    // Emit analytics event
    this.emit('request', {
      type,
      responseTime,
      success,
      error,
      timestamp: new Date().toISOString()
    });

    // Log to file
    this.logToFile({
      timestamp: new Date().toISOString(),
      type,
      responseTime,
      success,
      error: error?.message || null
    });
  }

  // Update average response time
  updateAverageResponseTime() {
    if (this.metrics.responseTimes.length > 0) {
      const sum = this.metrics.responseTimes.reduce((a, b) => a + b, 0);
      this.metrics.averageResponseTime = Math.round(sum / this.metrics.responseTimes.length);
      
      // Keep only last 1000 response times
      if (this.metrics.responseTimes.length > 1000) {
        this.metrics.responseTimes = this.metrics.responseTimes.slice(-1000);
      }
    }
  }

  // Categorize errors
  categorizeError(error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('rate limit')) return 'rate_limit';
    if (message.includes('api key')) return 'authentication';
    if (message.includes('timeout')) return 'timeout';
    if (message.includes('network')) return 'network';
    if (message.includes('quota')) return 'quota_exceeded';
    if (message.includes('invalid')) return 'invalid_request';
    
    return 'unknown';
  }

  // Record cache hit/miss
  recordCacheEvent(hit) {
    const total = this.metrics.totalRequests;
    if (total > 0) {
      const currentHitRate = this.metrics.cacheHitRate;
      this.metrics.cacheHitRate = hit 
        ? ((currentHitRate * (total - 1)) + 1) / total
        : (currentHitRate * (total - 1)) / total;
    }
  }

  // Record rate limit hit
  recordRateLimitHit() {
    this.metrics.rateLimitHits++;
    this.emit('rateLimit', {
      timestamp: new Date().toISOString(),
      totalHits: this.metrics.rateLimitHits
    });
  }

  // Get current metrics
  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.totalRequests > 0 
        ? (this.metrics.successfulRequests / this.metrics.totalRequests * 100).toFixed(2)
        : 0,
      popularPromptTypes: Object.fromEntries(this.metrics.popularPromptTypes),
      errorTypes: Object.fromEntries(this.metrics.errorTypes),
      dailyUsage: Object.fromEntries(this.metrics.dailyUsage),
      lastUpdated: new Date().toISOString()
    };
  }

  // Get performance insights
  getPerformanceInsights() {
    const metrics = this.getMetrics();
    const insights = [];

    // Success rate insights
    if (metrics.successRate < 95) {
      insights.push({
        type: 'warning',
        message: `Success rate is ${metrics.successRate}% (target: >95%)`,
        recommendation: 'Check error logs and improve error handling'
      });
    }

    // Response time insights
    if (metrics.averageResponseTime > 5000) {
      insights.push({
        type: 'warning',
        message: `Average response time is ${metrics.averageResponseTime}ms (target: <5000ms)`,
        recommendation: 'Consider caching strategies or optimize prompts'
      });
    }

    // Rate limit insights
    if (metrics.rateLimitHits > metrics.totalRequests * 0.1) {
      insights.push({
        type: 'critical',
        message: 'High rate limit hit rate detected',
        recommendation: 'Implement request queuing or increase rate limits'
      });
    }

    // Cache efficiency
    if (metrics.cacheHitRate < 0.3 && metrics.totalRequests > 100) {
      insights.push({
        type: 'info',
        message: `Cache hit rate is ${(metrics.cacheHitRate * 100).toFixed(1)}%`,
        recommendation: 'Improve caching strategy for better performance'
      });
    }

    return insights;
  }

  // Generate daily report
  generateDailyReport() {
    const metrics = this.getMetrics();
    const insights = this.getPerformanceInsights();
    
    const report = {
      date: new Date().toISOString().split('T')[0],
      summary: {
        totalRequests: metrics.totalRequests,
        successRate: metrics.successRate + '%',
        averageResponseTime: metrics.averageResponseTime + 'ms',
        cacheHitRate: (metrics.cacheHitRate * 100).toFixed(1) + '%'
      },
      topPromptTypes: this.getTopItems(metrics.popularPromptTypes, 5),
      topErrors: this.getTopItems(metrics.errorTypes, 5),
      insights,
      recommendations: this.generateRecommendations(metrics, insights)
    };

    return report;
  }

  // Get top items from a map
  getTopItems(map, limit = 5) {
    return Object.entries(map)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([key, value]) => ({ type: key, count: value }));
  }

  // Generate recommendations
  generateRecommendations(metrics, insights) {
    const recommendations = [];

    if (insights.some(i => i.type === 'critical')) {
      recommendations.push('Immediate attention required: Critical issues detected');
    }

    if (metrics.averageResponseTime > 3000) {
      recommendations.push('Optimize prompt length and complexity');
      recommendations.push('Implement response caching for common queries');
    }

    if (metrics.successRate < 98) {
      recommendations.push('Review error handling and add more fallbacks');
      recommendations.push('Monitor API quota and billing status');
    }

    if (metrics.rateLimitHits > 0) {
      recommendations.push('Implement exponential backoff for retries');
      recommendations.push('Consider upgrading API tier for higher limits');
    }

    return recommendations;
  }

  // Log to file
  async logToFile(data) {
    try {
      const logEntry = JSON.stringify(data) + '\n';
      await fs.appendFile(this.logFile, logEntry);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  // Export metrics to JSON
  async exportMetrics(filename) {
    try {
      const metrics = this.getMetrics();
      const exportPath = path.join(__dirname, 'exports', filename || `gemini-metrics-${Date.now()}.json`);
      
      await fs.mkdir(path.dirname(exportPath), { recursive: true });
      await fs.writeFile(exportPath, JSON.stringify(metrics, null, 2));
      
      return exportPath;
    } catch (error) {
      console.error('Failed to export metrics:', error);
      throw error;
    }
  }

  // Reset metrics
  resetMetrics() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      rateLimitHits: 0,
      popularPromptTypes: new Map(),
      errorTypes: new Map(),
      responseTimes: [],
      dailyUsage: new Map()
    };
    
    this.emit('reset', { timestamp: new Date().toISOString() });
  }
}

// Create singleton instance
const geminiAnalytics = new GeminiAnalytics();

// Middleware function to track requests
const trackRequest = (type) => {
  return async (originalFunction, ...args) => {
    const startTime = Date.now();
    
    try {
      const result = await originalFunction(...args);
      const responseTime = Date.now() - startTime;
      
      geminiAnalytics.recordRequest(type, responseTime, true);
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      geminiAnalytics.recordRequest(type, responseTime, false, error);
      throw error;
    }
  };
};

module.exports = {
  GeminiAnalytics,
  geminiAnalytics,
  trackRequest
};
