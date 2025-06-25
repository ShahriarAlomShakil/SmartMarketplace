const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    index: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please provide a valid phone number']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['buyer', 'seller', 'admin'],
    default: 'buyer'
  },
  profile: {
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    location: {
      city: String,
      state: String,
      country: String,
      coordinates: {
        latitude: {
          type: Number,
          min: [-90, 'Invalid latitude'],
          max: [90, 'Invalid latitude']
        },
        longitude: {
          type: Number,
          min: [-180, 'Invalid longitude'],
          max: [180, 'Invalid longitude']
        }
      }
    },
    socialLinks: {
      website: {
        type: String,
        match: [/^https?:\/\/.+/, 'Please provide a valid website URL']
      },
      twitter: String,
      instagram: String,
      facebook: String
    },
    verificationStatus: {
      email: { type: Boolean, default: false },
      phone: { type: Boolean, default: false },
      identity: { type: Boolean, default: false },
      address: { type: Boolean, default: false }
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
      reviews: [{
        reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reviewerName: String,
        reviewerAvatar: String,
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: String,
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        negotiationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Negotiation' },
        createdAt: { type: Date, default: Date.now }
      }]
    },
    // Trust Score System
    trustScore: {
      overall: { type: Number, default: 0, min: 0, max: 100 },
      level: { 
        type: String, 
        enum: ['New', 'Fair', 'Average', 'Good', 'Very Good', 'Excellent', 'Elite'],
        default: 'New' 
      },
      breakdown: {
        verification: { type: Number, default: 0, min: 0, max: 100 },
        activity: { type: Number, default: 0, min: 0, max: 100 },
        reviews: { type: Number, default: 0, min: 0, max: 100 },
        completion: { type: Number, default: 0, min: 0, max: 100 },
        consistency: { type: Number, default: 0, min: 0, max: 100 },
        social: { type: Number, default: 0, min: 0, max: 100 }
      },
      badges: [{
        id: String,
        name: String,
        description: String,
        icon: String,
        color: String,
        earnedAt: { type: Date, default: Date.now }
      }],
      lastCalculated: { type: Date, default: Date.now }
    },
    // Profile Analytics
    analytics: {
      profileViews: { type: Number, default: 0 },
      searchAppearances: { type: Number, default: 0 },
      contactAttempts: { type: Number, default: 0 },
      responseRate: { type: Number, default: 100, min: 0, max: 100 },
      averageResponseTime: { type: Number, default: 0 }, // in minutes
      lastAnalyticsUpdate: { type: Date, default: Date.now }
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    language: {
      type: String,
      default: 'en'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      marketing: { type: Boolean, default: false }
    },
    privacy: {
      showProfile: { type: Boolean, default: true },
      showActivity: { type: Boolean, default: true },
      allowMessages: { type: Boolean, default: true }
    }
  },
  stats: {
    productsListed: { type: Number, default: 0, min: 0 },
    productsSold: { type: Number, default: 0, min: 0 },
    productsBought: { type: Number, default: 0, min: 0 },
    totalEarnings: { type: Number, default: 0, min: 0 },
    totalSpent: { type: Number, default: 0, min: 0 },
    successfulNegotiations: { type: Number, default: 0, min: 0 },
    averageNegotiationTime: { type: Number, default: 0, min: 0 },
    joinDate: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now }
  },
  // Security features
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  
  // Refresh tokens for JWT
  refreshTokens: [{
    token: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // 7 days
    deviceInfo: {
      userAgent: String,
      ip: String,
      deviceType: String,
      browser: String
    }
  }],
  
  // Two-factor authentication
  twoFactor: {
    enabled: { type: Boolean, default: false },
    secret: String,
    backupCodes: [String],
    lastUsed: Date
  },
  
  // OAuth providers
  oauth: {
    google: {
      id: String,
      email: String,
      verified: { type: Boolean, default: false }
    },
    facebook: {
      id: String,
      email: String,
      verified: { type: Boolean, default: false }
    },
    apple: {
      id: String,
      email: String,
      verified: { type: Boolean, default: false }
    }
  },
  
  // Security and account protection
  security: {
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    lastLoginIP: String,
    lastLoginUserAgent: String,
    lastPasswordChange: { type: Date, default: Date.now },
    securityQuestions: [{
      question: String,
      answer: String // Should be hashed
    }],
    sessionTimeout: { type: Number, default: 30 }, // minutes
    passwordHistory: [String] // Store last 5 password hashes
  },
  
  // GDPR compliance
  gdpr: {
    consentGiven: { type: Boolean, default: false },
    consentDate: Date,
    dataProcessingConsent: { type: Boolean, default: false },
    marketingConsent: { type: Boolean, default: false },
    dataRetentionPeriod: { type: Number, default: 365 }, // days
    lastDataExport: Date,
    deletionRequested: { type: Boolean, default: false },
    deletionRequestDate: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.firstName || this.lastName || this.username;
});

// Index for text search
userSchema.index({
  username: 'text',
  firstName: 'text',
  lastName: 'text',
  'profile.bio': 'text'
});

// Pre-save middleware to hash password and manage password history
userSchema.pre('save', async function(next) {
  // Only hash password if it's been modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Check password strength for new passwords
    const { customValidators } = require('../middleware/validation');
    if (!customValidators.isStrongPassword(this.password)) {
      const error = new Error('Password does not meet complexity requirements');
      error.name = 'ValidationError';
      return next(error);
    }

    // Store old password hash in history before hashing new password
    if (!this.isNew && this.password) {
      // Get the current password hash from database
      const currentUser = await this.constructor.findById(this._id).select('+password');
      if (currentUser && currentUser.password) {
        // Initialize security object if it doesn't exist
        if (!this.security) {
          this.security = {};
        }
        if (!this.security.passwordHistory) {
          this.security.passwordHistory = [];
        }
        
        // Add current password to history
        this.security.passwordHistory.push(currentUser.password);
        
        // Keep only last 5 passwords
        if (this.security.passwordHistory.length > 5) {
          this.security.passwordHistory = this.security.passwordHistory.slice(-5);
        }
        
        // Update password change timestamp
        this.security.lastPasswordChange = new Date();
      }
    }

    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update lastActive
userSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.stats.lastActive = new Date();
  }
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to generate JWT token (updated for better security)
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      username: this.username,
      email: this.email,
      role: this.role,
      tokenVersion: this.security?.passwordHistory?.length || 0 // Invalidate tokens on password change
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' } // Shorter token expiry
  );
};

// Instance method to generate refresh token
userSchema.methods.generateRefreshToken = function(deviceInfo = {}) {
  const refreshToken = require('crypto').randomBytes(40).toString('hex');
  
  // Clean up expired refresh tokens
  this.refreshTokens = this.refreshTokens.filter(
    token => token.expiresAt > new Date()
  );
  
  // Add new refresh token
  this.refreshTokens.push({
    token: require('crypto')
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex'),
    deviceInfo: {
      userAgent: deviceInfo.userAgent || '',
      ip: deviceInfo.ip || '',
      deviceType: deviceInfo.deviceType || 'unknown',
      browser: deviceInfo.browser || ''
    }
  });
  
  // Limit to 5 refresh tokens per user
  if (this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }
  
  return refreshToken;
};

// Instance method to validate refresh token
userSchema.methods.validateRefreshToken = function(token) {
  const hashedToken = require('crypto')
    .createHash('sha256')
    .update(token)
    .digest('hex');
    
  const tokenRecord = this.refreshTokens.find(
    t => t.token === hashedToken && t.expiresAt > new Date()
  );
  
  return !!tokenRecord;
};

// Instance method to revoke refresh token
userSchema.methods.revokeRefreshToken = function(token) {
  const hashedToken = require('crypto')
    .createHash('sha256')
    .update(token)
    .digest('hex');
    
  this.refreshTokens = this.refreshTokens.filter(t => t.token !== hashedToken);
};

// Instance method to revoke all refresh tokens
userSchema.methods.revokeAllRefreshTokens = function() {
  this.refreshTokens = [];
};

// Instance method to generate 2FA secret
userSchema.methods.generate2FASecret = function() {
  const speakeasy = require('speakeasy');
  const secret = speakeasy.generateSecret({
    name: `Smart Marketplace (${this.email})`,
    issuer: 'Smart Marketplace'
  });
  
  this.twoFactor.secret = secret.base32;
  this.twoFactor.enabled = false; // Will be enabled after verification
  
  return {
    secret: secret.base32,
    qrCode: secret.otpauth_url
  };
};

// Instance method to verify 2FA token
userSchema.methods.verify2FAToken = function(token) {
  if (!this.twoFactor.enabled || !this.twoFactor.secret) {
    return false;
  }
  
  const speakeasy = require('speakeasy');
  return speakeasy.totp.verify({
    secret: this.twoFactor.secret,
    encoding: 'base32',
    token: token,
    window: 2
  });
};

// Instance method to generate backup codes
userSchema.methods.generateBackupCodes = function() {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    codes.push(require('crypto').randomBytes(4).toString('hex').toUpperCase());
  }
  
  // Hash the codes before storing
  this.twoFactor.backupCodes = codes.map(code => 
    require('crypto').createHash('sha256').update(code).digest('hex')
  );
  
  return codes; // Return unhashed codes to show user
};

// Instance method to use backup code
userSchema.methods.useBackupCode = function(code) {
  const hashedCode = require('crypto')
    .createHash('sha256')
    .update(code.toUpperCase())
    .digest('hex');
    
  const index = this.twoFactor.backupCodes.indexOf(hashedCode);
  if (index > -1) {
    this.twoFactor.backupCodes.splice(index, 1);
    return true;
  }
  return false;
};

// Instance method to check if account is locked
userSchema.methods.isLocked = function() {
  return !!(this.security.lockUntil && this.security.lockUntil > Date.now());
};

// Instance method to increment login attempts
userSchema.methods.incrementLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.security.lockUntil && this.security.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { 'security.lockUntil': 1 },
      $set: { 'security.loginAttempts': 1 }
    });
  }
  
  const updates = { $inc: { 'security.loginAttempts': 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.security.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { 'security.lockUntil': Date.now() + 2 * 60 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      'security.loginAttempts': 1,
      'security.lockUntil': 1
    }
  });
};

// Instance method to check password history
userSchema.methods.isPasswordInHistory = async function(newPassword) {
  const passwordHistory = this.security?.passwordHistory || [];
  
  for (const hashedPassword of passwordHistory) {
    const isMatch = await bcrypt.compare(newPassword, hashedPassword);
    if (isMatch) {
      return true;
    }
  }
  
  return false;
};

// Instance method to add password to history
userSchema.methods.addPasswordToHistory = async function(hashedPassword) {
  if (!this.security.passwordHistory) {
    this.security.passwordHistory = [];
  }
  
  // Add new password to history
  this.security.passwordHistory.push(hashedPassword);
  
  // Keep only last 5 passwords
  if (this.security.passwordHistory.length > 5) {
    this.security.passwordHistory = this.security.passwordHistory.slice(-5);
  }
  
  // Update password change timestamp
  this.security.lastPasswordChange = new Date();
};

// Instance method to check password strength
userSchema.methods.checkPasswordStrength = function(password) {
  const { customValidators } = require('../middleware/validation');
  return {
    isStrong: customValidators.isStrongPassword(password),
    strength: customValidators.getPasswordStrength(password)
  };
};

// Instance method to generate comprehensive security info
userSchema.methods.getSecurityInfo = function() {
  return {
    twoFactorEnabled: this.twoFactor?.enabled || false,
    emailVerified: this.isVerified,
    phoneVerified: this.profile?.verificationStatus?.phone || false,
    identityVerified: this.profile?.verificationStatus?.identity || false,
    lastPasswordChange: this.security?.lastPasswordChange,
    lastLogin: this.stats?.lastActive,
    activeRefreshTokens: this.refreshTokens?.length || 0,
    accountLocked: this.isLocked(),
    loginAttempts: this.security?.loginAttempts || 0
  };
};

// Static method to find by credentials
userSchema.statics.findByCredentials = async function(email, password) {
  const user = await this.findOne({ email }).select('+password');
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }
  
  return user;
};

// Static method to check if username is available
userSchema.statics.isUsernameAvailable = async function(username, excludeId = null) {
  const query = { username: new RegExp(`^${username}$`, 'i') };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  const existingUser = await this.findOne(query);
  return !existingUser;
};

// Static method to check if email is available
userSchema.statics.isEmailAvailable = async function(email, excludeId = null) {
  const query = { email: email.toLowerCase() };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  const existingUser = await this.findOne(query);
  return !existingUser;
};

// Static method to update user stats
userSchema.statics.updateUserStats = async function(userId, updateData) {
  return await this.findByIdAndUpdate(
    userId,
    { 
      $inc: updateData,
      'stats.lastActive': new Date()
    },
    { new: true }
  );
};

module.exports = mongoose.model('User', userSchema);
