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
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerificationToken: String,
  emailVerificationExpire: Date
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

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's been modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
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

// Instance method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      username: this.username,
      email: this.email,
      role: this.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Instance method to generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const resetToken = require('crypto').randomBytes(20).toString('hex');
  
  // Hash and set to resetPasswordToken field
  this.resetPasswordToken = require('crypto')
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Set expire time (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

// Instance method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const verificationToken = require('crypto').randomBytes(20).toString('hex');
  
  // Hash and set to emailVerificationToken field
  this.emailVerificationToken = require('crypto')
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  // Set expire time (24 hours)
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;
  
  return verificationToken;
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
