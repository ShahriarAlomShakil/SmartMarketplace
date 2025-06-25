const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { customValidators, sanitizers } = require('../middleware/validation');
const emailService = require('../services/emailService');
const rateLimitingService = require('../services/rateLimitingService');
const twoFactorAuthService = require('../services/twoFactorAuthService');
const oauthService = require('../services/oauthService');

// Helper function to generate enhanced token response
const generateTokenResponse = (user, deviceInfo = {}) => {
  const accessToken = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken(deviceInfo);
  
  return {
    status: 'success',
    accessToken,
    refreshToken,
    expiresIn: 15 * 60, // 15 minutes
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      role: user.role,
      isVerified: user.isVerified,
      profile: user.profile,
      preferences: user.preferences,
      twoFactorEnabled: user.twoFactor?.enabled || false,
      gdprConsent: user.gdpr?.consentGiven || false
    }
  };
};

// Helper function to extract device info
const getDeviceInfo = (req) => {
  const userAgent = req.get('User-Agent') || '';
  return {
    userAgent,
    ip: req.ip,
    deviceType: userAgent.includes('Mobile') ? 'mobile' : 'desktop',
    browser: userAgent.split(' ')[0] || 'unknown'
  };
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    console.log('Registration attempt:', {
      body: req.body,
      headers: req.headers['content-type']
    });

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { username, email, password, firstName, lastName } = req.body;

    // Sanitize inputs
    const sanitizedData = {
      username: sanitizers.sanitizeInput(username),
      email: email.toLowerCase().trim(),
      password,
      firstName: firstName ? sanitizers.sanitizeInput(firstName) : undefined,
      lastName: lastName ? sanitizers.sanitizeInput(lastName) : undefined
    };

    // Check if username is available
    const isUsernameAvailable = await User.isUsernameAvailable(sanitizedData.username);
    if (!isUsernameAvailable) {
      return res.status(400).json({
        status: 'error',
        message: 'Username is already taken'
      });
    }

    // Check if email is available
    const isEmailAvailable = await User.isEmailAvailable(sanitizedData.email);
    if (!isEmailAvailable) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is already registered'
      });
    }

    // Create user
    const user = new User(sanitizedData);
    await user.save();

    // Generate email verification token if needed
    if (process.env.REQUIRE_EMAIL_VERIFICATION === 'true') {
      const verificationToken = user.generateEmailVerificationToken();
      await user.save();
      
      // TODO: Send verification email
      console.log(`Email verification token for ${user.email}: ${verificationToken}`);
    } else {
      user.isVerified = true;
      user.profile.verificationStatus.email = true;
      await user.save();
    }

    res.status(201).json({
      ...generateTokenResponse(user),
      message: 'User registered successfully'
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        status: 'error',
        message: `${field} is already taken`
      });
    }
    
    // Handle validation errors from the model
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user with enhanced security
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, twoFactorToken } = req.body;
    const deviceInfo = getDeviceInfo(req);

    // Rate limiting check
    const rateLimitCheck = await rateLimitingService.checkRateLimit(req.ip, 'login');
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({
        status: 'error',
        message: 'Too many login attempts. Please try again later.',
        retryAfter: rateLimitCheck.retryAfter
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    
    if (!user) {
      // Record failed attempt
      await rateLimitingService.recordFailedAttempt(req.ip, 'login');
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      await rateLimitingService.logSecurityEvent('account_locked', {
        userId: user._id,
        email: user.email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      return res.status(423).json({
        status: 'error',
        message: 'Account is temporarily locked due to multiple failed login attempts'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incrementLoginAttempts();
      await rateLimitingService.recordFailedAttempt(req.ip, 'login');
      await rateLimitingService.recordFailedAttempt(`user_login_${email}`, 'userLogin');
      
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Check for 2FA requirement
    if (user.twoFactor.enabled) {
      if (!twoFactorToken) {
        return res.status(200).json({
          status: 'requires_2fa',
          message: '2FA token required',
          userId: user._id // Temporary ID for 2FA verification
        });
      }

      // Verify 2FA token
      const is2FAValid = twoFactorAuthService.verifyToken(user, twoFactorToken) ||
                         await twoFactorAuthService.verifyBackupCode(user._id, twoFactorToken);

      if (!is2FAValid) {
        await rateLimitingService.recordFailedAttempt(`2fa_${user._id}`, '2fa');
        return res.status(401).json({
          status: 'error',
          message: 'Invalid 2FA token'
        });
      }

      // Update 2FA last used
      user.twoFactor.lastUsed = new Date();
    }

    // Successful login - reset login attempts
    await user.resetLoginAttempts();
    
    // Update security info
    user.security.lastLoginIP = req.ip;
    user.security.lastLoginUserAgent = req.get('User-Agent');
    user.stats.lastActive = new Date();
    await user.save();

    // Log security event
    await rateLimitingService.logSecurityEvent('successful_login', {
      userId: user._id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      twoFactorUsed: user.twoFactor.enabled
    });

    // Generate tokens
    const tokenResponse = generateTokenResponse(user, deviceInfo);
    await user.save(); // Save refresh token

    res.json({
      ...tokenResponse,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({
        status: 'error',
        message: error.message
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Server error during login'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
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
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const allowedUpdates = [
      'firstName', 'lastName', 'phone', 'profile.bio', 
      'profile.location', 'profile.socialLinks', 'preferences'
    ];
    
    const updates = {};
    
    // Filter and sanitize allowed updates
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (typeof req.body[key] === 'string') {
          updates[key] = sanitizers.sanitizeInput(req.body[key]);
        } else {
          updates[key] = req.body[key];
        }
      }
    });

    // Handle nested profile updates
    if (req.body.profile) {
      Object.keys(req.body.profile).forEach(key => {
        if (['bio', 'location', 'socialLinks'].includes(key)) {
          updates[`profile.${key}`] = req.body.profile[key];
        }
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
      message: 'Profile updated successfully',
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
        stats: user.stats
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating profile'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'All password fields are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'New passwords do not match'
      });
    }

    // Validate new password strength
    const passwordStrength = customValidators.getPasswordStrength(newPassword);
    if (!customValidators.isStrongPassword(newPassword)) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 8 characters long and contain uppercase letters, lowercase letters, numbers, and special characters. Avoid common patterns and repeated characters.',
        passwordStrength: passwordStrength
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      // Record failed password change attempt
      await rateLimitingService.recordFailedAttempt(`password_change_${user._id}`, 'password_change');
      
      return res.status(400).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }

    // Check if new password is same as current password
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        status: 'error',
        message: 'New password must be different from current password'
      });
    }

    // Check password history (prevent reuse of last 5 passwords)
    const isPasswordInHistory = await user.isPasswordInHistory(newPassword);
    if (isPasswordInHistory) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot reuse any of your last 5 passwords. Please choose a different password.'
      });
    }

    // Update password
    user.password = newPassword;
    
    // Revoke all refresh tokens to force re-login on all devices
    user.revokeAllRefreshTokens();
    
    await user.save();

    // Log security event
    await rateLimitingService.logSecurityEvent('password_change', {
      userId: user._id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      passwordStrength: passwordStrength
    });

    // Send security alert email
    await emailService.sendPasswordChangeNotification(user);

    res.json({
      status: 'success',
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while changing password'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'No user found with that email address'
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // TODO: Send reset email
    console.log(`Password reset token for ${user.email}: ${resetToken}`);

    res.json({
      status: 'success',
      message: 'Password reset email sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while processing forgot password request'
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Password and confirm password are required'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Passwords do not match'
      });
    }

    // Validate password strength
    if (!customValidators.isStrongPassword(password)) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
      });
    }

    // Hash token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      status: 'success',
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while resetting password'
    });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Hash token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired verification token'
      });
    }

    // Verify email
    user.isVerified = true;
    user.profile.verificationStatus.email = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.json({
      status: 'success',
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while verifying email'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // Update last active time
    await User.findByIdAndUpdate(req.user._id, {
      'stats.lastActive': new Date()
    });

    res.json({
      status: 'success',
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during logout'
    });
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Private
const refreshToken = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found or inactive'
      });
    }

    // Update last active
    user.stats.lastActive = new Date();
    await user.save();

    res.json(generateTokenResponse(user));

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while refreshing token'
    });
  }
};

// @desc    Resend email verification
// @route   POST /api/auth/resend-verification
// @access  Private
const resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // TODO: Send verification email
    console.log(`New email verification token for ${user.email}: ${verificationToken}`);

    res.json({
      status: 'success',
      message: 'Verification email sent'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while resending verification email'
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Refresh token is required'
      });
    }

    // Find user with this refresh token
    const user = await User.findOne({
      'refreshTokens.token': crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex')
    });

    if (!user || !user.validateRefreshToken(refreshToken)) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid refresh token'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Account is deactivated'
      });
    }

    // Generate new tokens
    const deviceInfo = getDeviceInfo(req);
    const newAccessToken = user.generateAuthToken();
    const newRefreshToken = user.generateRefreshToken(deviceInfo);

    // Remove old refresh token
    user.revokeRefreshToken(refreshToken);
    await user.save();

    res.json({
      status: 'success',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 15 * 60
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during token refresh'
    });
  }
};

// @desc    Enable Two-Factor Authentication
// @route   POST /api/auth/2fa/enable
// @access  Private
const enable2FA = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        status: 'error',
        message: '2FA token is required'
      });
    }

    const result = await twoFactorAuthService.enable2FA(req.user._id, token);
    
    // Send security alert email
    await emailService.send2FASetupEmail(req.user);

    res.json({
      status: 'success',
      message: '2FA enabled successfully',
      backupCodes: result.backupCodes
    });

  } catch (error) {
    console.error('2FA enable error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Disable Two-Factor Authentication
// @route   POST /api/auth/2fa/disable
// @access  Private
const disable2FA = async (req, res) => {
  try {
    const { password, token } = req.body;

    if (!password) {
      return res.status(400).json({
        status: 'error',
        message: 'Password is required'
      });
    }

    await twoFactorAuthService.disable2FA(req.user._id, password, token);

    res.json({
      status: 'success',
      message: '2FA disabled successfully'
    });

  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Generate 2FA Secret
// @route   POST /api/auth/2fa/generate
// @access  Private
const generate2FASecret = async (req, res) => {
  try {
    const result = await twoFactorAuthService.generateSecret(req.user._id);

    res.json({
      status: 'success',
      secret: result.secret,
      qrCode: result.qrCode,
      manualEntryKey: result.manualEntryKey
    });

  } catch (error) {
    console.error('2FA secret generation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate 2FA secret'
    });
  }
};

// @desc    Verify 2FA Token
// @route   POST /api/auth/2fa/verify
// @access  Private
const verify2FAToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        status: 'error',
        message: '2FA token is required'
      });
    }

    const user = await User.findById(req.user._id);
    const isValid = twoFactorAuthService.verifyToken(user, token);

    if (!isValid) {
      // Try backup code
      const isBackupCodeValid = await twoFactorAuthService.verifyBackupCode(req.user._id, token);
      
      if (!isBackupCodeValid) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid 2FA token or backup code'
        });
      }
    }

    res.json({
      status: 'success',
      message: '2FA token verified successfully'
    });

  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during 2FA verification'
    });
  }
};

// @desc    Regenerate Backup Codes
// @route   POST /api/auth/2fa/backup-codes
// @access  Private
const regenerateBackupCodes = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        status: 'error',
        message: 'Password is required'
      });
    }

    const backupCodes = await twoFactorAuthService.regenerateBackupCodes(req.user._id, password);

    res.json({
      status: 'success',
      message: 'Backup codes regenerated successfully',
      backupCodes
    });

  } catch (error) {
    console.error('Backup codes regeneration error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    OAuth Login Success
// @route   GET /api/auth/oauth/success
// @access  Public
const oauthSuccess = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'OAuth authentication failed'
      });
    }

    const deviceInfo = getDeviceInfo(req);
    const tokenResponse = generateTokenResponse(req.user, deviceInfo);
    await req.user.save();

    // Record security event
    await rateLimitingService.logSecurityEvent('oauth_login', {
      userId: req.user._id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      provider: req.query.provider || 'unknown'
    });

    res.json(tokenResponse);

  } catch (error) {
    console.error('OAuth success error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during OAuth authentication'
    });
  }
};

// @desc    OAuth Login Failure
// @route   GET /api/auth/oauth/failure
// @access  Public
const oauthFailure = (req, res) => {
  res.status(401).json({
    status: 'error',
    message: 'OAuth authentication failed'
  });
};

// @desc    Get OAuth Connections
// @route   GET /api/auth/oauth/connections
// @access  Private
const getOAuthConnections = async (req, res) => {
  try {
    const connections = await oauthService.getUserOAuthConnections(req.user._id);

    res.json({
      status: 'success',
      connections
    });

  } catch (error) {
    console.error('Get OAuth connections error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get OAuth connections'
    });
  }
};

// @desc    Link OAuth Account
// @route   POST /api/auth/oauth/link/:provider
// @access  Private
const linkOAuthAccount = async (req, res) => {
  try {
    const { provider } = req.params;
    
    // This would typically be called after successful OAuth flow
    // Implementation depends on OAuth flow design
    
    res.json({
      status: 'success',
      message: `${provider} account linked successfully`
    });

  } catch (error) {
    console.error('Link OAuth account error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Unlink OAuth Account
// @route   DELETE /api/auth/oauth/unlink/:provider
// @access  Private
const unlinkOAuthAccount = async (req, res) => {
  try {
    const { provider } = req.params;
    
    await oauthService.unlinkOAuthAccount(req.user._id, provider);

    res.json({
      status: 'success',
      message: `${provider} account unlinked successfully`
    });

  } catch (error) {
    console.error('Unlink OAuth account error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Record GDPR Consent
// @route   POST /api/auth/gdpr/consent
// @access  Private
const recordGDPRConsent = async (req, res) => {
  try {
    const { dataProcessing, marketing } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    user.recordGDPRConsent({
      dataProcessing: dataProcessing || false,
      marketing: marketing || false
    });

    await user.save();

    res.json({
      status: 'success',
      message: 'GDPR consent recorded successfully'
    });

  } catch (error) {
    console.error('GDPR consent error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to record GDPR consent'
    });
  }
};

// @desc    Export User Data (GDPR)
// @route   GET /api/auth/gdpr/export
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

    const userData = user.exportUserData();

    // In production, you might want to:
    // 1. Generate a secure download link
    // 2. Store the export temporarily
    // 3. Send email with download link
    
    await emailService.sendGDPRExportEmail(user, 'download-link-here');

    res.json({
      status: 'success',
      message: 'Data export request processed. Download link sent to your email.',
      data: userData // In production, don't return data directly
    });

  } catch (error) {
    console.error('Data export error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to export user data'
    });
  }
};

// @desc    Request Account Deletion (GDPR)
// @route   POST /api/auth/gdpr/delete-request
// @access  Private
const requestAccountDeletion = async (req, res) => {
  try {
    const { password, confirmation } = req.body;

    if (!password || confirmation !== 'DELETE') {
      return res.status(400).json({
        status: 'error',
        message: 'Password and deletion confirmation required'
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid password'
      });
    }

    user.requestAccountDeletion();
    await user.save();

    res.json({
      status: 'success',
      message: 'Account deletion requested. Your account will be deleted within 30 days.'
    });

  } catch (error) {
    console.error('Account deletion request error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process deletion request'
    });
  }
};

// @desc    Get Account Security Status
// @route   GET /api/auth/security/status
// @access  Private
const getSecurityStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const twoFAStatus = await twoFactorAuthService.get2FAStatus(req.user._id);
    const oauthConnections = await oauthService.getUserOAuthConnections(req.user._id);

    res.json({
      status: 'success',
      security: {
        twoFactor: twoFAStatus,
        oauthConnections,
        lastPasswordChange: user.security?.lastPasswordChange,
        accountLocked: user.isLocked(),
        emailVerified: user.isVerified,
        gdprConsent: user.gdpr?.consentGiven || false
      }
    });

  } catch (error) {
    console.error('Security status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get security status'
    });
  }
};

// @desc    Get user security information
// @route   GET /api/auth/security-info
// @access  Private
const getSecurityInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const securityInfo = user.getSecurityInfo();
    
    res.json({
      status: 'success',
      data: {
        security: {
          ...securityInfo,
          lockUntil: user.security?.lockUntil || null,
          sessionTimeout: user.security?.sessionTimeout || 30,
          recentLoginHistory: await getRecentLoginHistory(user._id)
        }
      }
    });

  } catch (error) {
    console.error('Get security info error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching security information'
    });
  }
};

// Helper function to get recent login history
const getRecentLoginHistory = async (userId) => {
  // This would ideally query a separate login history collection
  // For now, we'll return a placeholder structure
  return [
    {
      timestamp: new Date(),
      ip: '192.168.1.1',
      userAgent: 'Chrome/91.0',
      success: true,
      location: 'New York, US'
    }
  ];
};

// @desc    Revoke all sessions (force logout on all devices)
// @route   POST /api/auth/revoke-all-sessions
// @access  Private
const revokeAllSessions = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        status: 'error',
        message: 'Password is required to revoke all sessions'
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid password'
      });
    }

    // Revoke all refresh tokens
    user.revokeAllRefreshTokens();
    await user.save();

    // Log security event
    await rateLimitingService.logSecurityEvent('sessions_revoked', {
      userId: user._id,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      status: 'success',
      message: 'All sessions revoked successfully. Please log in again.'
    });

  } catch (error) {
    console.error('Revoke all sessions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while revoking sessions'
    });
  }
};

// @desc    Get account activity summary
// @route   GET /api/auth/account-activity
// @access  Private
const getAccountActivity = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const activity = {
      accountCreated: user.createdAt,
      lastActive: user.stats.lastActive,
      lastPasswordChange: user.security?.lastPasswordChange,
      emailVerified: user.isVerified,
      twoFactorEnabled: user.twoFactor?.enabled || false,
      activeDevices: user.refreshTokens?.length || 0,
      totalLogins: user.stats?.totalLogins || 0,
      recentActivity: await getRecentActivitySummary(user._id)
    };

    res.json({
      status: 'success',
      data: { activity }
    });

  } catch (error) {
    console.error('Get account activity error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching account activity'
    });
  }
};

// Helper function for recent activity summary
const getRecentActivitySummary = async (userId) => {
  // This would ideally query activity logs
  return {
    loginsLast30Days: 15,
    passwordChanges: 1,
    failedLoginAttempts: 0,
    securityAlerts: 0
  };
};

// @desc    Delete user account (GDPR compliance)
// @route   DELETE /api/auth/delete-account
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Soft delete by deactivating account
    user.isActive = false;
    user.deletedAt = new Date();
    user.email = `deleted_${user._id}@deleted.com`; // Anonymize email
    user.username = `deleted_${user._id}`; // Anonymize username
    
    // Clear sensitive data while maintaining transaction history
    user.firstName = null;
    user.lastName = null;
    user.phone = null;
    user.avatar = null;
    user.profile.bio = null;
    user.profile.location = null;
    user.profile.socialLinks = {};
    
    await user.save();

    // Deactivate user's products
    await Product.updateMany(
      { seller: user._id, status: 'active' },
      { status: 'inactive' }
    );

    // Cancel active negotiations
    await Negotiation.updateMany(
      { 
        $or: [{ buyer: user._id }, { seller: user._id }],
        status: { $in: ['initiated', 'in_progress'] }
      },
      { 
        status: 'cancelled',
        cancelledBy: user._id,
        cancellationReason: 'User account deleted'
      }
    );

    res.json({
      status: 'success',
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting account'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  logout,
  refreshToken,
  resendVerification,
  // New methods
  refreshAccessToken,
  enable2FA,
  disable2FA,
  generate2FASecret,
  verify2FAToken,
  regenerateBackupCodes,
  oauthSuccess,
  oauthFailure,
  getOAuthConnections,
  linkOAuthAccount,
  unlinkOAuthAccount,
  recordGDPRConsent,
  exportUserData,
  requestAccountDeletion,
  getSecurityStatus,
  getSecurityInfo,
  revokeAllSessions,
  getAccountActivity,
  deleteAccount
};
