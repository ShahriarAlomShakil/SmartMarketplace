const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const NodeCache = require('node-cache');

// Initialize cache for responses (TTL: 5 minutes)
const responseCache = new NodeCache({ stdTTL: 300 });

// Rate limiting configuration
const rateLimiter = {
  requests: new Map(),
  windowMs: 60000, // 1 minute
  maxRequests: 60 // 60 requests per minute
};

// Validate API key
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required');
}

// Initialize Gemini AI with error handling
let genAI;
try {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} catch (error) {
  console.error('Failed to initialize Gemini AI:', error);
  throw new Error('Gemini AI initialization failed');
}

// Enhanced configuration with proper placement of safety settings
const geminiConfig = {
  temperature: 0.7,
  candidateCount: 1,
  maxOutputTokens: 512,
  topP: 0.8,
  topK: 40
};

// Safety settings configured separately
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Rate limiting check
const checkRateLimit = (userId) => {
  const now = Date.now();
  const userRequests = rateLimiter.requests.get(userId) || [];
  
  // Remove requests outside the window
  const validRequests = userRequests.filter(time => now - time < rateLimiter.windowMs);
  
  if (validRequests.length >= rateLimiter.maxRequests) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }
  
  // Add current request
  validRequests.push(now);
  rateLimiter.requests.set(userId, validRequests);
  
  return true;
};

// Get Gemini model with enhanced error handling
const getGeminiModel = (modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash') => {
  try {
    if (!genAI) {
      throw new Error('Gemini AI not initialized');
    }
    return genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: geminiConfig,
      safetySettings: safetySettings
    });
  } catch (error) {
    console.error('Error getting Gemini model:', error);
    throw new Error('Failed to get Gemini model');
  }
};

// Enhanced generate content with caching and error handling
const generateContent = async (prompt, options = {}) => {
  const {
    userId = 'anonymous',
    useCache = true,
    timeout = 30000,
    retries = 2
  } = options;

  try {
    // Check rate limit
    checkRateLimit(userId);

    // Check cache first
    const cacheKey = `gemini:${Buffer.from(prompt).toString('base64').slice(0, 50)}`;
    if (useCache) {
      const cached = responseCache.get(cacheKey);
      if (cached) {
        console.log('Returning cached response for user:', userId);
        return cached;
      }
    }

    // Generate content with timeout and retries
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const model = getGeminiModel();
        
        // Set timeout for the request
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), timeout);
        });

        const generatePromise = model.generateContent(prompt);
        const result = await Promise.race([generatePromise, timeoutPromise]);
        
        if (!result || !result.response) {
          throw new Error('Invalid response from Gemini API');
        }

        const response = await result.response;
        const text = response.text();
        
        if (!text || text.trim().length === 0) {
          throw new Error('Empty response from Gemini API');
        }

        // Cache the response
        if (useCache) {
          responseCache.set(cacheKey, text);
        }

        // Log successful generation
        console.log(`Gemini API success for user ${userId}: ${text.length} characters generated`);
        
        return text;

      } catch (error) {
        lastError = error;
        console.warn(`Gemini API attempt ${attempt + 1} failed:`, error.message);
        
        // Don't retry on rate limit or auth errors
        if (error.message.includes('rate limit') || error.message.includes('API key')) {
          break;
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError || new Error('Failed to generate content after retries');

  } catch (error) {
    console.error('Gemini API error:', error);
    
    // Return fallback response for specific errors
    if (error.message.includes('rate limit')) {
      throw new Error('AI service is currently busy. Please try again in a moment.');
    }
    
    if (error.message.includes('API key')) {
      throw new Error('AI service configuration error. Please contact support.');
    }
    
    throw new Error('AI service temporarily unavailable. Please try again later.');
  }
};

// Clear rate limit for user (useful for admin operations)
const clearRateLimit = (userId) => {
  rateLimiter.requests.delete(userId);
};

// Get rate limit status for user
const getRateLimitStatus = (userId) => {
  const userRequests = rateLimiter.requests.get(userId) || [];
  const now = Date.now();
  const validRequests = userRequests.filter(time => now - time < rateLimiter.windowMs);
  
  return {
    remaining: Math.max(0, rateLimiter.maxRequests - validRequests.length),
    resetTime: validRequests.length > 0 ? Math.min(...validRequests) + rateLimiter.windowMs : null
  };
};

// Health check for Gemini service
const healthCheck = async () => {
  try {
    const testPrompt = "Hello, this is a health check. Please respond with 'OK'.";
    const response = await generateContent(testPrompt, { 
      userId: 'healthcheck', 
      useCache: false,
      timeout: 10000,
      retries: 0
    });
    
    return {
      status: 'healthy',
      model: process.env.GEMINI_MODEL || 'gemini-pro',
      response: response.slice(0, 50) + (response.length > 50 ? '...' : '')
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      model: process.env.GEMINI_MODEL || 'gemini-pro'
    };
  }
};

module.exports = {
  genAI,
  getGeminiModel,
  geminiConfig,
  generateContent,
  checkRateLimit,
  clearRateLimit,
  getRateLimitStatus,
  healthCheck,
  responseCache
};
