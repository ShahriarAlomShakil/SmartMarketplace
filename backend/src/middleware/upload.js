const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    // Allowed image formats
    const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (allowedFormats.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only JPEG, PNG, and WebP are allowed.'), false);
    }
  } else {
    cb(new Error('Only image files are allowed.'), false);
  }
};

// Cloudinary storage configuration for product images
const productImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'smart-marketplace/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const filename = file.originalname.split('.')[0];
      return `product-${timestamp}-${filename}`;
    }
  }
});

// Cloudinary storage configuration for user avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'smart-marketplace/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      return `avatar-${req.user._id}-${timestamp}`;
    }
  }
});

// Local storage configuration (fallback)
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    
    // Create directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `${file.fieldname}-${timestamp}${ext}`;
    cb(null, filename);
  }
});

// Memory storage for processing before upload
const memoryStorage = multer.memoryStorage();

// File size limits
const limits = {
  fileSize: 10 * 1024 * 1024, // 10MB
  files: 10 // Maximum 10 files per request
};

// Upload configurations
const uploadConfigs = {
  // Product images upload
  productImages: multer({
    storage: productImageStorage,
    fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 10
    }
  }),

  // User avatar upload
  avatar: multer({
    storage: avatarStorage,
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
      files: 1
    }
  }),

  // General file upload with local storage
  local: multer({
    storage: localStorage,
    fileFilter,
    limits
  }),

  // Memory upload for processing
  memory: multer({
    storage: memoryStorage,
    fileFilter,
    limits
  })
};

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    let message = 'File upload error';
    
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File size too large. Maximum allowed size is 10MB.';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files. Maximum allowed is 10 files.';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field.';
        break;
      case 'LIMIT_PART_COUNT':
        message = 'Too many parts in the request.';
        break;
      default:
        message = error.message;
    }
    
    return res.status(400).json({
      status: 'error',
      message,
      code: error.code
    });
  }
  
  if (error.message.includes('Invalid file format') || error.message.includes('Only image files')) {
    return res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
  
  next(error);
};

// Helper functions
const uploadHelpers = {
  // Delete file from Cloudinary
  deleteFromCloudinary: async (publicId) => {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error);
      throw error;
    }
  },

  // Get optimized image URL
  getOptimizedImageUrl: (publicId, options = {}) => {
    const defaultOptions = {
      quality: 'auto',
      fetch_format: 'auto'
    };
    
    return cloudinary.url(publicId, { ...defaultOptions, ...options });
  },

  // Generate image thumbnails
  generateThumbnails: (publicId) => {
    const sizes = [
      { name: 'thumbnail', width: 150, height: 150 },
      { name: 'small', width: 300, height: 300 },
      { name: 'medium', width: 600, height: 600 },
      { name: 'large', width: 1200, height: 1200 }
    ];

    return sizes.map(size => ({
      size: size.name,
      url: cloudinary.url(publicId, {
        width: size.width,
        height: size.height,
        crop: 'fill',
        quality: 'auto',
        fetch_format: 'auto'
      })
    }));
  },

  // Validate uploaded files
  validateFiles: (files, maxCount = 10, maxSize = 10 * 1024 * 1024) => {
    if (!files || files.length === 0) {
      return { valid: false, message: 'No files provided' };
    }

    if (files.length > maxCount) {
      return { valid: false, message: `Maximum ${maxCount} files allowed` };
    }

    for (const file of files) {
      if (file.size > maxSize) {
        return { valid: false, message: `File ${file.originalname} is too large` };
      }

      if (!file.mimetype.startsWith('image/')) {
        return { valid: false, message: `File ${file.originalname} is not an image` };
      }
    }

    return { valid: true };
  }
};

module.exports = {
  upload: uploadConfigs.productImages,
  uploadAvatar: uploadConfigs.avatar,
  uploadLocal: uploadConfigs.local,
  uploadMemory: uploadConfigs.memory,
  handleUploadError,
  uploadHelpers,
  cloudinary
};
