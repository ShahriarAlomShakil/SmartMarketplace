/**
 * API utility functions for Smart Marketplace
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Get authentication headers
 */
const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/**
 * Handle API response
 */
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
};

/**
 * Product API functions
 */
export const productAPI = {
  /**
   * Create a new product listing
   */
  create: async (formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        // Don't set Content-Type for FormData - browser sets it with boundary
      },
      body: formData,
    });
    
    return handleResponse(response);
  },

  /**
   * Get all products with optional filters
   */
  getAll: async (params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
  } = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/api/products?${queryParams}`);
    return handleResponse(response);
  },

  /**
   * Get product by ID
   */
  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
    return handleResponse(response);
  },

  /**
   * Update product by ID
   */
  update: async (id: string, formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    });
    
    return handleResponse(response);
  },

  /**
   * Delete product by ID
   */
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
      },
    });
    
    return handleResponse(response);
  },

  /**
   * Search products
   */
  search: async (query: string, filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  } = {}) => {
    const queryParams = new URLSearchParams({
      q: query,
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined)
      )
    });

    const response = await fetch(`${API_BASE_URL}/api/products/search?${queryParams}`);
    return handleResponse(response);
  },

  /**
   * Get search suggestions
   */
  searchSuggestions: async (query: string) => {
    const response = await fetch(`${API_BASE_URL}/api/products/suggestions?q=${encodeURIComponent(query)}`);
    return handleResponse(response);
  },

  /**
   * Get similar products
   */
  getSimilar: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}/similar`);
    return handleResponse(response);
  },

  /**
   * Update product status
   */
  updateStatus: async (id: string, status: string) => {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ status }),
    });
    
    return handleResponse(response);
  },

  /**
   * Track product view
   */
  trackView: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    
    return handleResponse(response);
  },

  /**
   * Get product analytics
   */
  getAnalytics: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}/analytics`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    
    return handleResponse(response);
  },

  /**
   * Bulk update products
   */
  bulkUpdate: async (productIds: string[], updates: Record<string, any>) => {
    const response = await fetch(`${API_BASE_URL}/api/products/bulk`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ productIds, updates }),
    });
    
    return handleResponse(response);
  },

  /**
   * Get featured products
   */
  getFeatured: async (limit: number = 10) => {
    const response = await fetch(`${API_BASE_URL}/api/products/featured?limit=${limit}`);
    return handleResponse(response);
  },

  /**
   * Get trending products
   */
  getTrending: async (limit: number = 10) => {
    const response = await fetch(`${API_BASE_URL}/api/products/trending?limit=${limit}`);
    return handleResponse(response);
  },

  /**
   * Get products by user
   */
  getByUser: async (userId: string, params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && !(key === 'status' && value === 'all')) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/products?${queryParams}`);
    return handleResponse(response);
  },

  /**
   * Get product categories
   */
  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/api/products/categories`);
    return handleResponse(response);
  },

  /**
   * Like a product
   */
  like: async (productId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    
    return handleResponse(response);
  },

  /**
   * Unlike a product
   */
  unlike: async (productId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}/like`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    
    return handleResponse(response);
  }
};

/**
 * Authentication API functions
 */
export const authAPI = {
  /**
   * Login user
   */
  login: async (email: string, password: string) => {
    console.log('🌐 API: Login request started');
    console.log('📡 API: Target URL:', `${API_BASE_URL}/api/auth/login`);
    console.log('📝 API: Request data:', { email, password: '***' });
    
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    console.log('📡 API: Response status:', response.status);
    console.log('📡 API: Response ok:', response.ok);
    
    const result = await handleResponse(response);
    console.log('✅ API: Login response processed successfully');
    return result;
  },

  /**
   * Register user
   */
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    return handleResponse(response);
  },

  /**
   * Get user profile
   */
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    
    return handleResponse(response);
  },

  /**
   * Update user profile
   */
  updateProfile: async (profileData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(profileData),
    });
    
    return handleResponse(response);
  },

  /**
   * Logout user
   */
  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
      },
    });
    
    return handleResponse(response);
  }
};

/**
 * Enhanced Profile API functions - Day 18
 */
export const profileAPI = {
  /**
   * Get complete profile with trust score and analytics
   */
  getCompleteProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/api/profile/complete`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    
    return handleResponse(response);
  },

  /**
   * Get profile analytics
   */
  getAnalytics: async (timeRange = '30d') => {
    const response = await fetch(`${API_BASE_URL}/api/profile/analytics?timeRange=${timeRange}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    
    return handleResponse(response);
  },

  /**
   * Recalculate trust score
   */
  recalculateTrustScore: async () => {
    const response = await fetch(`${API_BASE_URL}/api/profile/trust-score/recalculate`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
      },
    });
    
    return handleResponse(response);
  },

  /**
   * Get activity timeline
   */
  getActivityTimeline: async (limit = 50) => {
    const response = await fetch(`${API_BASE_URL}/api/profile/activity-timeline?limit=${limit}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    
    return handleResponse(response);
  },

  /**
   * Update privacy settings
   */
  updatePrivacySettings: async (settings: {
    showProfile?: boolean;
    showActivity?: boolean;
    allowMessages?: boolean;
  }) => {
    const response = await fetch(`${API_BASE_URL}/api/profile/privacy`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(settings),
    });
    
    return handleResponse(response);
  },

  /**
   * Get OAuth connections
   */
  getOAuthConnections: async () => {
    const response = await fetch(`${API_BASE_URL}/api/profile/oauth-connections`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    
    return handleResponse(response);
  },

  /**
   * Link OAuth account
   */
  linkOAuthAccount: async (provider: string, accessToken: string, profile: any) => {
    const response = await fetch(`${API_BASE_URL}/api/profile/oauth/${provider}/link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ accessToken, profile }),
    });
    
    return handleResponse(response);
  },

  /**
   * Unlink OAuth account
   */
  unlinkOAuthAccount: async (provider: string) => {
    const response = await fetch(`${API_BASE_URL}/api/profile/oauth/${provider}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
      },
    });
    
    return handleResponse(response);
  },

  /**
   * Update profile preferences
   */
  updatePreferences: async (preferences: any) => {
    const response = await fetch(`${API_BASE_URL}/api/profile/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(preferences),
    });
    
    return handleResponse(response);
  },

  /**
   * Request verification
   */
  requestVerification: async (type: string) => {
    const response = await fetch(`${API_BASE_URL}/api/profile/verification/${type}`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
      },
    });
    
    return handleResponse(response);
  },

  /**
   * Get profile insights
   */
  getInsights: async () => {
    const response = await fetch(`${API_BASE_URL}/api/profile/insights`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    
    return handleResponse(response);
  }
};

/**
 * Negotiation API functions
 */
export const negotiationAPI = {
  /**
   * Get negotiation by ID
   */
  getById: async (negotiationId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/negotiations/${negotiationId}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    
    return handleResponse(response);
  },

  /**
   * Start a new negotiation
   */
  start: async (data: { productId: string; initialOffer: number; message?: string }) => {
    const response = await fetch(`${API_BASE_URL}/api/negotiations/start`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return handleResponse(response);
  },

  /**
   * Send a message in negotiation
   */
  sendMessage: async (negotiationId: string, content: string, amount?: number) => {
    const endpoint = amount 
      ? `${API_BASE_URL}/api/negotiations/${negotiationId}/offer`
      : `${API_BASE_URL}/api/negotiations/${negotiationId}/message`;
    
    const body = amount 
      ? JSON.stringify({ amount, message: content })
      : JSON.stringify({ content });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body,
    });
    
    return handleResponse(response);
  },

  /**
   * Send an offer in negotiation
   */
  sendOffer: async (negotiationId: string, amount: number, message?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/negotiations/${negotiationId}/offer`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, message }),
    });
    
    return handleResponse(response);
  },

  /**
   * Accept current offer
   */
  accept: async (negotiationId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/negotiations/${negotiationId}/accept`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
      },
    });
    
    return handleResponse(response);
  },

  /**
   * Reject current offer
   */
  reject: async (negotiationId: string, reason?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/negotiations/${negotiationId}/reject`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });
    
    return handleResponse(response);
  },

  /**
   * Cancel negotiation
   */
  cancel: async (negotiationId: string, reason?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/negotiations/${negotiationId}/cancel`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });
    
    return handleResponse(response);
  },

  /**
   * Get user's negotiations
   */
  getUserNegotiations: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    role?: 'buyer' | 'seller';
  }) => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const url = `${API_BASE_URL}/api/negotiations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    
    return handleResponse(response);
  },

  /**
   * Get negotiations for a product
   */
  getByProduct: async (productId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/negotiations/product/${productId}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    
    return handleResponse(response);
  },

  /**
   * Get active negotiations
   */
  getActive: async () => {
    const response = await fetch(`${API_BASE_URL}/api/negotiations/active`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    
    return handleResponse(response);
  },

  /**
   * Get completed negotiations
   */
  getCompleted: async (params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const url = `${API_BASE_URL}/api/negotiations/completed${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    
    return handleResponse(response);
  },

  /**
   * Get negotiation analytics
   */
  getAnalytics: async () => {
    const response = await fetch(`${API_BASE_URL}/api/negotiations/analytics`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    
    return handleResponse(response);
  },

  /**
   * Get negotiation history
   */
  getHistory: async (negotiationId: string, params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const url = `${API_BASE_URL}/api/negotiations/${negotiationId}/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    
    return handleResponse(response);
  },

  /**
   * Send typing indicator
   */
  sendTyping: async (negotiationId: string, isTyping: boolean) => {
    const response = await fetch(`${API_BASE_URL}/api/negotiations/${negotiationId}/typing`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isTyping }),
    });
    
    return handleResponse(response);
  },

  /**
   * Mark messages as read
   */
  markAsRead: async (negotiationId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/negotiations/${negotiationId}/read`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
      },
    });
    
    return handleResponse(response);
  }
};

const api = {
  productAPI,
  authAPI,
  profileAPI,
  negotiationAPI
};

export default api;
