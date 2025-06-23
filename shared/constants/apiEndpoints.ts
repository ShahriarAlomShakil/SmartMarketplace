// API endpoint constants for Smart Marketplace
export const API_ENDPOINTS = {
  // Base URL
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
  },

  // User endpoints
  USERS: {
    BASE: '/users',
    PROFILE: (userId: string) => `/users/${userId}`,
    UPDATE_PROFILE: (userId: string) => `/users/${userId}/profile`,
    AVATAR: (userId: string) => `/users/${userId}/avatar`,
    PREFERENCES: (userId: string) => `/users/${userId}/preferences`,
    STATS: (userId: string) => `/users/${userId}/stats`,
    REVIEWS: (userId: string) => `/users/${userId}/reviews`,
    BLOCK: (userId: string) => `/users/${userId}/block`,
    UNBLOCK: (userId: string) => `/users/${userId}/unblock`,
    DELETE: (userId: string) => `/users/${userId}`,
  },

  // Product endpoints
  PRODUCTS: {
    BASE: '/products',
    BY_ID: (productId: string) => `/products/${productId}`,
    BY_SELLER: (sellerId: string) => `/products/seller/${sellerId}`,
    CREATE: '/products',
    UPDATE: (productId: string) => `/products/${productId}`,
    DELETE: (productId: string) => `/products/${productId}`,
    IMAGES: (productId: string) => `/products/${productId}/images`,
    SEARCH: '/products/search',
    CATEGORIES: '/products/categories',
    FEATURED: '/products/featured',
    TRENDING: '/products/trending',
    SIMILAR: (productId: string) => `/products/${productId}/similar`,
    FAVORITES: '/products/favorites',
    ADD_FAVORITE: (productId: string) => `/products/${productId}/favorite`,
    REMOVE_FAVORITE: (productId: string) => `/products/${productId}/favorite`,
    ANALYTICS: (productId: string) => `/products/${productId}/analytics`,
    VIEW: (productId: string) => `/products/${productId}/view`,
  },

  // Negotiation endpoints
  NEGOTIATIONS: {
    BASE: '/negotiations',
    BY_ID: (negotiationId: string) => `/negotiations/${negotiationId}`,
    BY_PRODUCT: (productId: string) => `/negotiations/product/${productId}`,
    BY_USER: (userId: string) => `/negotiations/user/${userId}`,
    START: '/negotiations/start',
    SEND_MESSAGE: (negotiationId: string) => `/negotiations/${negotiationId}/message`,
    SEND_OFFER: (negotiationId: string) => `/negotiations/${negotiationId}/offer`,
    ACCEPT: (negotiationId: string) => `/negotiations/${negotiationId}/accept`,
    REJECT: (negotiationId: string) => `/negotiations/${negotiationId}/reject`,
    CANCEL: (negotiationId: string) => `/negotiations/${negotiationId}/cancel`,
    HISTORY: (negotiationId: string) => `/negotiations/${negotiationId}/history`,
    ANALYTICS: '/negotiations/analytics',
    ACTIVE: '/negotiations/active',
    COMPLETED: '/negotiations/completed',
  },

  // File upload endpoints
  UPLOAD: {
    PRODUCT_IMAGES: '/upload/product-images',
    AVATAR: '/upload/avatar',
    DOCUMENTS: '/upload/documents',
  },

  // Admin endpoints
  ADMIN: {
    BASE: '/admin',
    USERS: '/admin/users',
    PRODUCTS: '/admin/products',
    NEGOTIATIONS: '/admin/negotiations',
    ANALYTICS: '/admin/analytics',
    REPORTS: '/admin/reports',
    SETTINGS: '/admin/settings',
    MODERATION: '/admin/moderation',
  },

  // Analytics endpoints
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    PRODUCTS: '/analytics/products',
    USERS: '/analytics/users',
    NEGOTIATIONS: '/analytics/negotiations',
    REVENUE: '/analytics/revenue',
    PERFORMANCE: '/analytics/performance',
  },

  // Notification endpoints
  NOTIFICATIONS: {
    BASE: '/notifications',
    BY_USER: (userId: string) => `/notifications/user/${userId}`,
    MARK_READ: (notificationId: string) => `/notifications/${notificationId}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    PREFERENCES: '/notifications/preferences',
    SUBSCRIBE: '/notifications/subscribe',
    UNSUBSCRIBE: '/notifications/unsubscribe',
  },

  // Search endpoints
  SEARCH: {
    GLOBAL: '/search',
    PRODUCTS: '/search/products',
    USERS: '/search/users',
    SUGGESTIONS: '/search/suggestions',
    TRENDING: '/search/trending',
    HISTORY: '/search/history',
  },

  // Support endpoints
  SUPPORT: {
    TICKETS: '/support/tickets',
    CREATE_TICKET: '/support/tickets/create',
    FAQ: '/support/faq',
    CONTACT: '/support/contact',
    FEEDBACK: '/support/feedback',
  },

  // External service endpoints
  EXTERNAL: {
    GEMINI: '/external/gemini',
    CLOUDINARY: '/external/cloudinary',
    LOCATION: '/external/location',
    CURRENCY: '/external/currency',
  },
} as const;

// WebSocket events
export const SOCKET_EVENTS = {
  // Connection events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  ERROR: 'error',

  // Authentication events
  AUTH_SUCCESS: 'auth:success',
  AUTH_ERROR: 'auth:error',
  AUTH_REQUIRED: 'auth:required',

  // Negotiation events
  NEGOTIATION_JOIN: 'negotiation:join',
  NEGOTIATION_LEAVE: 'negotiation:leave',
  NEGOTIATION_MESSAGE: 'negotiation:message',
  NEGOTIATION_OFFER: 'negotiation:offer',
  NEGOTIATION_ACCEPT: 'negotiation:accept',
  NEGOTIATION_REJECT: 'negotiation:reject',
  NEGOTIATION_STATUS_CHANGE: 'negotiation:status-change',
  NEGOTIATION_TYPING: 'negotiation:typing',
  NEGOTIATION_ERROR: 'negotiation:error',

  // User events
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  USER_UPDATE: 'user:update',

  // Product events
  PRODUCT_UPDATE: 'product:update',
  PRODUCT_SOLD: 'product:sold',
  PRODUCT_VIEW: 'product:view',

  // Notification events
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',
  NOTIFICATION_DELETE: 'notification:delete',

  // System events
  SYSTEM_MAINTENANCE: 'system:maintenance',
  SYSTEM_UPDATE: 'system:update',
  SYSTEM_ERROR: 'system:error',
} as const;

// API response status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Application constants
export const APP_CONSTANTS = {
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // File upload limits
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGES_PER_PRODUCT: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],

  // Negotiation limits
  MAX_NEGOTIATION_ROUNDS: 10,
  DEFAULT_NEGOTIATION_ROUNDS: 5,
  NEGOTIATION_TIMEOUT_HOURS: 24,

  // Price constraints
  MIN_PRODUCT_PRICE: 1,
  MAX_PRODUCT_PRICE: 1000000,
  CURRENCY_PRECISION: 2,

  // Text limits
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_MESSAGE_LENGTH: 1000,
  MAX_BIO_LENGTH: 500,

  // Cache durations (in seconds)
  CACHE_DURATION: {
    SHORT: 300, // 5 minutes
    MEDIUM: 1800, // 30 minutes
    LONG: 3600, // 1 hour
    VERY_LONG: 86400, // 24 hours
  },

  // Rate limiting
  RATE_LIMIT: {
    AUTH: 5, // 5 requests per minute
    API: 100, // 100 requests per minute
    UPLOAD: 10, // 10 uploads per minute
    NEGOTIATION: 20, // 20 messages per minute
  },
} as const;

// Error messages
export const ERROR_MESSAGES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_EXISTS: 'Email already registered',
  USERNAME_ALREADY_EXISTS: 'Username already taken',
  ACCOUNT_NOT_VERIFIED: 'Please verify your email address',
  TOKEN_EXPIRED: 'Session expired, please login again',
  UNAUTHORIZED: 'You are not authorized to perform this action',

  // Product errors
  PRODUCT_NOT_FOUND: 'Product not found',
  PRODUCT_UNAVAILABLE: 'Product is no longer available',
  INVALID_PRICE_RANGE: 'Minimum price cannot be greater than base price',
  IMAGE_UPLOAD_FAILED: 'Failed to upload image',

  // Negotiation errors
  NEGOTIATION_NOT_FOUND: 'Negotiation not found',
  NEGOTIATION_EXPIRED: 'Negotiation has expired',
  NEGOTIATION_CONCLUDED: 'Negotiation has already been concluded',
  INVALID_OFFER: 'Invalid offer amount',
  MAX_ROUNDS_EXCEEDED: 'Maximum negotiation rounds exceeded',

  // General errors
  NETWORK_ERROR: 'Network error, please try again',
  SERVER_ERROR: 'Server error, please try again later',
  VALIDATION_ERROR: 'Please check your input and try again',
  FILE_TOO_LARGE: 'File size exceeds maximum limit',
  INVALID_FILE_TYPE: 'Invalid file type',
} as const;
