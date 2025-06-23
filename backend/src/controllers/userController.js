const User = require('../models/User');
const Product = require('../models/Product');
const Negotiation = require('../models/Negotiation');
const { validationResult } = require('express-validator');
const { sanitizers } = require('../middleware/validation');

// Helper function to format user response
const formatUserResponse = (user, includePrivate = false) => {
  const publicData = {
    _id: user._id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    avatar: user.avatar,
    role: user.role,
    isVerified: user.isVerified,
    profile: {
      bio: user.profile?.bio,
      location: user.profile?.location,
      socialLinks: user.profile?.socialLinks,
      verificationStatus: user.profile?.verificationStatus,
      rating: user.profile?.rating
    },
    stats: user.stats,
    createdAt: user.createdAt
  };

  if (includePrivate) {
    return {
      ...publicData,
      email: user.email,
      phone: user.phone,
      preferences: user.preferences,
      updatedAt: user.updatedAt
    };
  }

  return publicData;
};

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getCurrentUserProfile = async (req, res) => {
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
      user: formatUserResponse(user, true) // Include private data for own profile
    });

  } catch (error) {
    console.error('Get current user profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching profile'
    });
  }
};

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.isActive) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if requesting user's own profile
    const isOwnProfile = req.user && req.user._id.toString() === user._id.toString();

    res.json({
      status: 'success',
      data: {
        user: formatUserResponse(user, isOwnProfile)
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching user profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id/profile
// @access  Private (own profile only)
const updateUserProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

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
          if (typeof req.body.profile[key] === 'string') {
            updates[`profile.${key}`] = sanitizers.sanitizeInput(req.body.profile[key]);
          } else {
            updates[`profile.${key}`] = req.body.profile[key];
          }
        }
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
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
      data: {
        user: formatUserResponse(user, true)
      }
    });

  } catch (error) {
    console.error('Update user profile error:', error);
    
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

// @desc    Get user's products
// @route   GET /api/users/:id/products
// @access  Public
const getUserProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      status = 'active',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const userId = req.params.id;

    // Build filter
    const filters = { seller: userId };
    
    // If not the seller themselves, only show active products
    if (!req.user || req.user._id.toString() !== userId) {
      filters.status = 'active';
    } else if (status !== 'all') {
      filters.status = status;
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [products, total] = await Promise.all([
      Product.find(filters)
        .populate('seller', 'username profile.rating avatar')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(filters)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      status: 'success',
      data: {
        products,
        pagination: {
          current: parseInt(page),
          pages: totalPages,
          total,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get user products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching user products'
    });
  }
};

// @desc    Get user's negotiations
// @route   GET /api/users/:id/negotiations
// @access  Private (own negotiations only)
const getUserNegotiations = async (req, res) => {
  try {
    const {
      status,
      role = 'buyer',
      page = 1,
      limit = 10,
      sortBy = 'updatedAt',
      sortOrder = 'desc'
    } = req.query;

    const userId = req.params.id;
    
    // Build filter
    const filters = {};
    filters[role] = userId;
    
    if (status) {
      filters.status = Array.isArray(status) ? { $in: status } : status;
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [negotiations, total] = await Promise.all([
      Negotiation.find(filters)
        .populate('product', 'title images pricing condition')
        .populate('buyer seller', 'username avatar profile.rating')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit)),
      Negotiation.countDocuments(filters)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      status: 'success',
      data: {
        negotiations,
        pagination: {
          current: parseInt(page),
          pages: totalPages,
          total,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get user negotiations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching user negotiations'
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Public
const getUserStats = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select('stats profile.rating');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Get additional statistics
    const [
      activeProducts,
      completedNegotiations,
      avgNegotiationTime
    ] = await Promise.all([
      Product.countDocuments({ seller: userId, status: 'active' }),
      Negotiation.countDocuments({ 
        $or: [{ buyer: userId }, { seller: userId }],
        status: 'completed'
      }),
      Negotiation.aggregate([
        {
          $match: {
            $or: [{ buyer: userId }, { seller: userId }],
            status: 'completed',
            'analytics.duration': { $exists: true }
          }
        },
        {
          $group: {
            _id: null,
            avgTime: { $avg: '$analytics.duration' }
          }
        }
      ])
    ]);

    const stats = {
      ...user.stats.toObject(),
      activeProducts,
      completedNegotiations,
      averageNegotiationTime: avgNegotiationTime[0]?.avgTime || 0,
      rating: user.profile.rating
    };

    res.json({
      status: 'success',
      data: {
        stats
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching user statistics'
    });
  }
};

// @desc    Add review for user
// @route   POST /api/users/:id/reviews
// @access  Private
const addUserReview = async (req, res) => {
  try {
    const { rating, comment, productId, negotiationId } = req.body;
    const reviewedUserId = req.params.id;
    const reviewerId = req.user._id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        status: 'error',
        message: 'Rating must be between 1 and 5'
      });
    }

    if (reviewedUserId === reviewerId.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot review yourself'
      });
    }

    const reviewedUser = await User.findById(reviewedUserId);
    const reviewer = await User.findById(reviewerId);

    if (!reviewedUser || !reviewer) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if reviewer has already reviewed this user for this product/negotiation
    const existingReviewIndex = reviewedUser.profile.rating.reviews.findIndex(
      review => 
        review.reviewerId.toString() === reviewerId.toString() &&
        (productId ? review.productId?.toString() === productId : true) &&
        (negotiationId ? review.negotiationId?.toString() === negotiationId : true)
    );

    const newReview = {
      reviewerId,
      reviewerName: reviewer.username,
      reviewerAvatar: reviewer.avatar,
      rating,
      comment: comment ? sanitizers.sanitizeInput(comment) : undefined,
      productId: productId || undefined,
      negotiationId: negotiationId || undefined
    };

    if (existingReviewIndex !== -1) {
      // Update existing review
      reviewedUser.profile.rating.reviews[existingReviewIndex] = newReview;
    } else {
      // Add new review
      reviewedUser.profile.rating.reviews.push(newReview);
      reviewedUser.profile.rating.count += 1;
    }

    // Recalculate average rating
    const totalRating = reviewedUser.profile.rating.reviews.reduce(
      (sum, review) => sum + review.rating, 
      0
    );
    reviewedUser.profile.rating.average = totalRating / reviewedUser.profile.rating.reviews.length;

    await reviewedUser.save();

    res.json({
      status: 'success',
      message: existingReviewIndex !== -1 ? 'Review updated successfully' : 'Review added successfully',
      data: {
        review: newReview,
        rating: reviewedUser.profile.rating
      }
    });

  } catch (error) {
    console.error('Add user review error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while adding review'
    });
  }
};

// @desc    Get user reviews
// @route   GET /api/users/:id/reviews
// @access  Public
const getUserReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const user = await User.findById(req.params.id).select('profile.rating');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Sort reviews
    let reviews = [...user.profile.rating.reviews];
    reviews.sort((a, b) => {
      if (sortBy === 'rating') {
        return sortOrder === 'desc' ? b.rating - a.rating : a.rating - b.rating;
      } else {
        // Default to createdAt
        return sortOrder === 'desc' ? 
          new Date(b.createdAt) - new Date(a.createdAt) :
          new Date(a.createdAt) - new Date(b.createdAt);
      }
    });

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedReviews = reviews.slice(skip, skip + parseInt(limit));
    const total = reviews.length;
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      status: 'success',
      data: {
        reviews: paginatedReviews,
        rating: {
          average: user.profile.rating.average,
          count: user.profile.rating.count
        },
        pagination: {
          current: parseInt(page),
          pages: totalPages,
          total,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching user reviews'
    });
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
const searchUsers = async (req, res) => {
  try {
    const {
      q: query,
      page = 1,
      limit = 12,
      sortBy = 'profile.rating.average',
      sortOrder = 'desc'
    } = req.query;

    if (!query) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required'
      });
    }

    const searchQuery = {
      isActive: true,
      $text: { $search: sanitizers.sanitizeSearchQuery(query) }
    };

    // Build sort object
    const sortObj = {};
    if (query) {
      sortObj.score = { $meta: 'textScore' };
    }
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [users, total] = await Promise.all([
      User.find(searchQuery)
        .select('username firstName lastName avatar profile.rating profile.bio stats createdAt')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(searchQuery)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      status: 'success',
      data: {
        users: users.map(user => formatUserResponse(user)),
        query: sanitizers.sanitizeSearchQuery(query),
        pagination: {
          current: parseInt(page),
          pages: totalPages,
          total,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while searching users'
    });
  }
};

// @desc    Deactivate user account
// @route   DELETE /api/users/:id
// @access  Private (own account only)
const deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Soft delete by deactivating
    user.isActive = false;
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
        cancellationReason: 'User account deactivated'
      }
    );

    res.json({
      status: 'success',
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deactivating account'
    });
  }
};

module.exports = {
  getCurrentUserProfile,
  getUserProfile,
  updateUserProfile,
  getUserProducts,
  getUserNegotiations,
  getUserStats,
  addUserReview,
  getUserReviews,
  searchUsers
};

// @desc    Upload user avatar
// @route   POST /api/users/:id/avatar
// @access  Private (Self only)
const uploadAvatar = async (req, res) => {
  try {
    res.status(501).json({
      status: 'error',
      message: 'Avatar upload functionality not yet implemented'
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while uploading avatar'
    });
  }
};

// @desc    Update user preferences
// @route   PUT /api/users/:id/preferences
// @access  Private (Self only)
const updateUserPreferences = async (req, res) => {
  try {
    res.status(501).json({
      status: 'error',
      message: 'User preferences functionality not yet implemented'
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating preferences'
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/:id
// @access  Private (Self only)
const deleteUserAccount = async (req, res) => {
  try {
    res.status(501).json({
      status: 'error',
      message: 'Account deletion functionality not yet implemented'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting account'
    });
  }
};

// Export the functions separately for now
module.exports.uploadAvatar = uploadAvatar;
module.exports.updateUserPreferences = updateUserPreferences;
module.exports.deleteUserAccount = deleteUserAccount;
