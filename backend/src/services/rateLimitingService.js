const { RateLimiterRedis, RateLimiterMemory } = require('rate-limiter-flexible');

class RateLimitingService {
  constructor() {
    // Different rate limiters for different scenarios
    this.initializeRateLimiters();
  }

  initializeRateLimiters() {
    // General authentication rate limiter
    this.authLimiter = new RateLimiterMemory({
      keyGenerator: (req) => req.ip,
      points: 5, // 5 requests
      duration: 900, // Per 15 minutes
      blockDuration: 900, // Block for 15 minutes
    });

    // Login rate limiter
    this.loginLimiter = new RateLimiterMemory({
      keyGenerator: (req) => `login_${req.ip}`,
      points: 5, // 5 login attempts
      duration: 900, // Per 15 minutes
      blockDuration: 1800, // Block for 30 minutes
    });

    // Failed login attempts per user
    this.userLoginLimiter = new RateLimiterMemory({
      keyGenerator: (req) => `user_login_${req.body.email}`,
      points: 3, // 3 attempts per user
      duration: 900, // Per 15 minutes
      blockDuration: 3600, // Block for 1 hour
    });

    // Registration rate limiter
    this.registerLimiter = new RateLimiterMemory({
      keyGenerator: (req) => req.ip,
      points: 3, // 3 registration attempts
      duration: 3600, // Per hour
      blockDuration: 3600, // Block for 1 hour
    });

    // Password reset rate limiter
    this.passwordResetLimiter = new RateLimiterMemory({
      keyGenerator: (req) => `reset_${req.ip}`,
      points: 3, // 3 password reset requests
      duration: 3600, // Per hour
      blockDuration: 3600, // Block for 1 hour
    });

    // Email verification rate limiter
    this.emailVerificationLimiter = new RateLimiterMemory({
      keyGenerator: (req) => `verify_${req.ip}`,
      points: 5, // 5 verification requests
      duration: 3600, // Per hour
      blockDuration: 1800, // Block for 30 minutes
    });

    // 2FA rate limiter
    this.twoFALimiter = new RateLimiterMemory({
      keyGenerator: (req) => `2fa_${req.user?.id || req.ip}`,
      points: 5, // 5 2FA attempts
      duration: 300, // Per 5 minutes
      blockDuration: 900, // Block for 15 minutes
    });

    // API rate limiter (general)
    this.apiLimiter = new RateLimiterMemory({
      keyGenerator: (req) => req.ip,
      points: 100, // 100 requests
      duration: 60, // Per minute
      blockDuration: 60, // Block for 1 minute
    });

    console.log('Rate limiters initialized');
  }

  // Middleware factory for different rate limiters
  createRateLimitMiddleware(limiterType = 'auth') {
    return async (req, res, next) => {
      try {
        let limiter;
        
        switch (limiterType) {
          case 'login':
            limiter = this.loginLimiter;
            break;
          case 'userLogin':
            limiter = this.userLoginLimiter;
            break;
          case 'register':
            limiter = this.registerLimiter;
            break;
          case 'passwordReset':
            limiter = this.passwordResetLimiter;
            break;
          case 'emailVerification':
            limiter = this.emailVerificationLimiter;
            break;
          case '2fa':
            limiter = this.twoFALimiter;
            break;
          case 'api':
            limiter = this.apiLimiter;
            break;
          default:
            limiter = this.authLimiter;
        }

        await limiter.consume(limiter.keyGenerator(req));
        next();
      } catch (rejRes) {
        const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
        
        res.set('Retry-After', String(secs));
        res.status(429).json({
          status: 'error',
          message: 'Too many requests. Please try again later.',
          retryAfter: secs,
          type: 'RATE_LIMITED'
        });
      }
    };
  }

  // Manual rate limit check
  async checkRateLimit(key, limiterType = 'auth') {
    try {
      let limiter;
      
      switch (limiterType) {
        case 'login':
          limiter = this.loginLimiter;
          break;
        case 'register':
          limiter = this.registerLimiter;
          break;
        case 'passwordReset':
          limiter = this.passwordResetLimiter;
          break;
        case 'emailVerification':
          limiter = this.emailVerificationLimiter;
          break;
        case '2fa':
          limiter = this.twoFALimiter;
          break;
        default:
          limiter = this.authLimiter;
      }

      const resRateLimiter = await limiter.get(key);
      
      if (resRateLimiter && resRateLimiter.remainingPoints <= 0) {
        return {
          allowed: false,
          retryAfter: Math.round(resRateLimiter.msBeforeNext / 1000) || 1
        };
      }
      
      return { allowed: true };
    } catch (error) {
      console.error('Rate limit check error:', error);
      return { allowed: true }; // Allow on error
    }
  }

  // Record failed attempt
  async recordFailedAttempt(key, limiterType = 'auth') {
    try {
      let limiter;
      
      switch (limiterType) {
        case 'login':
          limiter = this.loginLimiter;
          break;
        case 'userLogin':
          limiter = this.userLoginLimiter;
          break;
        case '2fa':
          limiter = this.twoFALimiter;
          break;
        default:
          limiter = this.authLimiter;
      }

      await limiter.consume(key);
    } catch (error) {
      // Expected to throw when limit exceeded
      throw error;
    }
  }

  // Reset rate limit for a key
  async resetRateLimit(key, limiterType = 'auth') {
    try {
      let limiter;
      
      switch (limiterType) {
        case 'login':
          limiter = this.loginLimiter;
          break;
        case 'userLogin':
          limiter = this.userLoginLimiter;
          break;
        case 'register':
          limiter = this.registerLimiter;
          break;
        case 'passwordReset':
          limiter = this.passwordResetLimiter;
          break;
        case 'emailVerification':
          limiter = this.emailVerificationLimiter;
          break;
        case '2fa':
          limiter = this.twoFALimiter;
          break;
        default:
          limiter = this.authLimiter;
      }

      await limiter.delete(key);
    } catch (error) {
      console.error('Error resetting rate limit:', error);
    }
  }

  // Get remaining attempts
  async getRemainingAttempts(key, limiterType = 'auth') {
    try {
      let limiter;
      
      switch (limiterType) {
        case 'login':
          limiter = this.loginLimiter;
          break;
        case 'userLogin':
          limiter = this.userLoginLimiter;
          break;
        case '2fa':
          limiter = this.twoFALimiter;
          break;
        default:
          limiter = this.authLimiter;
      }

      const resRateLimiter = await limiter.get(key);
      
      if (!resRateLimiter) {
        return limiter.points;
      }
      
      return Math.max(0, resRateLimiter.remainingPoints);
    } catch (error) {
      console.error('Error getting remaining attempts:', error);
      return 0;
    }
  }

  // Security monitoring
  async logSecurityEvent(type, details) {
    const securityEvent = {
      timestamp: new Date(),
      type,
      details,
      severity: this.getEventSeverity(type)
    };

    // Log to console (in production, this should go to a security log system)
    console.log('SECURITY EVENT:', JSON.stringify(securityEvent, null, 2));

    // In production, you might want to:
    // - Send to security monitoring system
    // - Store in database
    // - Send alerts for high severity events
    
    return securityEvent;
  }

  getEventSeverity(type) {
    const severityMap = {
      'failed_login': 'low',
      'account_locked': 'medium',
      'suspicious_activity': 'high',
      'brute_force_attempt': 'high',
      'rate_limit_exceeded': 'medium',
      'password_reset_abuse': 'medium',
      '2fa_bypass_attempt': 'high'
    };

    return severityMap[type] || 'low';
  }

  // Advanced security checks
  async detectSuspiciousActivity(req) {
    const ip = req.ip;
    const userAgent = req.get('User-Agent');
    
    // Check for multiple account access from same IP
    const suspiciousPatterns = [];
    
    // Add your suspicious activity detection logic here
    // For example:
    // - Multiple failed logins from same IP
    // - Rapid registration attempts
    // - Unusual user agent patterns
    // - Geographic anomalies
    
    if (suspiciousPatterns.length > 0) {
      await this.logSecurityEvent('suspicious_activity', {
        ip,
        userAgent,
        patterns: suspiciousPatterns,
        timestamp: new Date()
      });
      
      return true;
    }
    
    return false;
  }
}

module.exports = new RateLimitingService();
