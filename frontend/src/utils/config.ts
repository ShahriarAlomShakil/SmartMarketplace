// Environment configuration utility for Smart Marketplace
// This file helps manage environment variables across the application

export const config = {
  // App configuration
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Smart Marketplace',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    environment: process.env.NODE_ENV || 'development',
  },

  // API configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    timeout: 10000, // 10 seconds
    retries: 3,
  },

  // Feature flags
  features: {
    darkMode: true,
    animations: true,
    glassEffects: true,
    notifications: true,
  },

  // UI configuration
  ui: {
    defaultTheme: 'system' as 'light' | 'dark' | 'system',
    animationDuration: 300,
    blurIntensity: 'md' as 'sm' | 'md' | 'lg' | 'xl',
    maxToasts: 5,
  },

  // Validation rules
  validation: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    minPasswordLength: 8,
    maxDescriptionLength: 1000,
  },

  // Development helpers
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Logging
  enableConsoleLog: process.env.NODE_ENV === 'development',
};

// Helper functions
export const getApiUrl = (endpoint: string) => {
  const baseUrl = config.api.baseUrl.replace(/\/$/, ''); // Remove trailing slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

export const isFeatureEnabled = (feature: keyof typeof config.features) => {
  return config.features[feature];
};

export const logDev = (...args: any[]) => {
  if (config.enableConsoleLog) {
    console.log('[Smart Marketplace]', ...args);
  }
};

export default config;
