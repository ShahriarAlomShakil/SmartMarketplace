const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure upload directories exist
const ensureUploadDirectories = () => {
  const uploadDirs = [
    path.join(__dirname, '../../uploads'),
    path.join(__dirname, '../../uploads/products'),
    path.join(__dirname, '../../uploads/avatars'),
    path.join(__dirname, '../../uploads/temp')
  ];

  uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Initialize upload directories
ensureUploadDirectories();

// Memory storage for processing before upload
const memoryStorage = multer.memoryStorage();

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

// Generate unique filename
const generateFileName = (originalname, prefix = 'file') => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(6).toString('hex');
  const ext = path.extname(originalname);
  return `${prefix}-${timestamp}-${randomString}${ext}`;
};

// Local storage configuration for product images
const productImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/products');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const filename = generateFileName(file.originalname, 'product');
    cb(null, filename);
  }
});

// Local storage configuration for user avatars
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/avatars');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const filename = generateFileName(file.originalname, `avatar-${req.user?._id || 'user'}`);
    cb(null, filename);
  }
});

// General local storage configuration
const generalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/temp');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const filename = generateFileName(file.originalname);
    cb(null, filename);
  }
});

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
  general: multer({
    storage: generalStorage,
    fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 10
    }
  }),

  // Memory upload for processing
  memory: multer({
    storage: memoryStorage,
    fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 10
    }
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
  // Delete file from local storage
  deleteFromLocal: async (filename, subfolder = '') => {
    try {
      const filePath = path.join(__dirname, '../../uploads', subfolder, filename);
      
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return { success: true, message: 'File deleted successfully' };
      } else {
        return { success: false, message: 'File not found' };
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },

  // Get local file URL
  getFileUrl: (filename, subfolder = '') => {
    return `/uploads/${subfolder}${subfolder ? '/' : ''}${filename}`;
  },

  // Move file from temp to permanent location
  moveFile: async (tempFilename, targetFolder, newFilename = null) => {
    try {
      const tempPath = path.join(__dirname, '../../uploads/temp', tempFilename);
      const targetPath = path.join(__dirname, '../../uploads', targetFolder, newFilename || tempFilename);
      
      await fs.promises.rename(tempPath, targetPath);
      return { success: true, filename: newFilename || tempFilename };
    } catch (error) {
      console.error('Error moving file:', error);
      throw error;
    }
  },

  // Clean up temp files older than 1 hour
  cleanupTempFiles: async () => {
    try {
      const tempDir = path.join(__dirname, '../../uploads/temp');
      const files = await fs.promises.readdir(tempDir);
      const oneHourAgo = Date.now() - (60 * 60 * 1000);

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.promises.stat(filePath);
        
        if (stats.mtime.getTime() < oneHourAgo) {
          await fs.promises.unlink(filePath);
        }
      }
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
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
  },

  // Generate multiple image sizes (placeholder for future image processing)
  generateImageSizes: (filename, subfolder = 'products') => {
    const baseUrl = `/uploads/${subfolder}/${filename}`;
    
    // For now, return the same image for all sizes
    // In the future, you could implement image resizing here using sharp or similar
    return {
      thumbnail: baseUrl,
      small: baseUrl,
      medium: baseUrl,
      large: baseUrl,
      original: baseUrl
    };
  }
};

// Schedule cleanup of temp files every hour
setInterval(uploadHelpers.cleanupTempFiles, 60 * 60 * 1000);

module.exports = {
  upload: uploadConfigs.productImages,
  uploadAvatar: uploadConfigs.avatar,
  uploadGeneral: uploadConfigs.general,
  uploadMemory: uploadConfigs.memory,
  handleUploadError,
  uploadHelpers
};
