const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

class SecurityMiddleware {
  
  // Enhanced security headers
  static securityHeaders() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", 'https://apis.google.com'],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'https://api.gemini.com'],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          manifestSrc: ["'self'"],
          workerSrc: ["'self'"]
        }
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      },
      noSniff: true,
      frameguard: { action: 'deny' },
      xssFilter: true,
      referrerPolicy: { policy: 'same-origin' }
    });
  }

  // Session timeout middleware
  static sessionTimeout(timeoutMinutes = 30) {
    return async (req, res, next) => {
      if (!req.user) {
        return next();
      }

      try {
        const User = require('../models/User');
        const user = await User.findById(req.user._id);
        
        if (!user) {
          return res.status(401).json({
            status: 'error',
            message: 'User not found'
          });
        }

        const sessionTimeout = user.security?.sessionTimeout || timeoutMinutes;
        const lastActive = user.stats?.lastActive || new Date();
        const timeoutThreshold = new Date(Date.now() - sessionTimeout * 60 * 1000);

        if (lastActive < timeoutThreshold) {
          // Session has timed out
          user.revokeAllRefreshTokens();
          await user.save();

          return res.status(401).json({
            status: 'error',
            message: 'Session has expired due to inactivity. Please log in again.',
            code: 'SESSION_TIMEOUT'
          });
        }

        // Update last active time
        user.stats.lastActive = new Date();
        await user.save();

        next();
      } catch (error) {
        console.error('Session timeout middleware error:', error);
        next(error);
      }
    };
  }

  // IP whitelist middleware (for admin functions)
  static ipWhitelist(allowedIPs = []) {
    return (req, res, next) => {
      if (allowedIPs.length === 0) {
        return next();
      }

      const clientIP = req.ip || req.connection.remoteAddress;
      
      if (!allowedIPs.includes(clientIP)) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied from this IP address'
        });
      }

      next();
    };
  }

  // Suspicious activity detection
  static suspiciousActivityDetection() {
    const suspiciousPatterns = new Map();

    return async (req, res, next) => {
      try {
        const clientIP = req.ip;
        const userAgent = req.get('User-Agent') || '';
        const now = Date.now();

        // Track requests per IP
        if (!suspiciousPatterns.has(clientIP)) {
          suspiciousPatterns.set(clientIP, {
            requests: [],
            userAgents: new Set(),
            lastSeen: now
          });
        }

        const ipData = suspiciousPatterns.get(clientIP);
        ipData.requests.push(now);
        ipData.userAgents.add(userAgent);
        ipData.lastSeen = now;

        // Clean old requests (older than 1 hour)
        ipData.requests = ipData.requests.filter(time => now - time < 3600000);

        // Check for suspicious patterns
        const suspiciousIndicators = [];

        // Too many requests in short time
        if (ipData.requests.length > 100) {
          suspiciousIndicators.push('high_request_rate');
        }

        // Multiple user agents from same IP
        if (ipData.userAgents.size > 5) {
          suspiciousIndicators.push('multiple_user_agents');
        }

        // Suspicious user agent patterns
        const suspiciousUAPatterns = [
          /bot/i, /crawler/i, /spider/i, /scraper/i,
          /python/i, /curl/i, /wget/i, /postman/i
        ];
        
        if (suspiciousUAPatterns.some(pattern => pattern.test(userAgent))) {
          suspiciousIndicators.push('suspicious_user_agent');
        }

        // If suspicious activity detected, log it
        if (suspiciousIndicators.length > 0 && req.user) {
          const rateLimitingService = require('../services/rateLimitingService');
          await rateLimitingService.logSecurityEvent('suspicious_activity', {
            userId: req.user._id,
            ip: clientIP,
            userAgent,
            indicators: suspiciousIndicators,
            requestCount: ipData.requests.length,
            userAgentCount: ipData.userAgents.size
          });
        }

        // Set suspicious activity flag for further processing
        req.suspiciousActivity = suspiciousIndicators.length > 0;
        req.suspiciousIndicators = suspiciousIndicators;

        next();
      } catch (error) {
        console.error('Suspicious activity detection error:', error);
        next();
      }
    };
  }

  // API versioning and deprecation middleware
  static apiVersioning() {
    return (req, res, next) => {
      const version = req.headers['api-version'] || '1.0';
      req.apiVersion = version;

      // Add deprecation warnings for old versions
      if (version < '1.0') {
        res.set('Deprecation', 'true');
        res.set('Sunset', new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString());
      }

      next();
    };
  }

  // Request logging with security context
  static securityLogger() {
    return (req, res, next) => {
      const startTime = Date.now();

      // Override res.end to log response
      const originalEnd = res.end;
      res.end = function(...args) {
        const duration = Date.now() - startTime;
        
        // Log security-relevant requests
        const securityEndpoints = [
          '/auth/login', '/auth/register', '/auth/2fa',
          '/auth/password', '/auth/forgot-password'
        ];

        const isSecurityEndpoint = securityEndpoints.some(endpoint => 
          req.path.includes(endpoint)
        );

        if (isSecurityEndpoint || req.suspiciousActivity) {
          console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            method: req.method,
            path: req.path,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            userId: req.user?._id,
            statusCode: res.statusCode,
            duration,
            suspiciousActivity: req.suspiciousActivity || false,
            suspiciousIndicators: req.suspiciousIndicators || []
          }));
        }

        originalEnd.apply(this, args);
      };

      next();
    };
  }

  // General rate limiting configuration
  static createRateLimit(options = {}) {
    const defaultOptions = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        status: 'error',
        message: 'Too many requests from this IP, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => req.ip,
      skip: (req) => {
        // Skip rate limiting for admin users (optional)
        return req.user?.role === 'admin';
      }
    };

    return rateLimit({ ...defaultOptions, ...options });
  }
}

module.exports = SecurityMiddleware;
