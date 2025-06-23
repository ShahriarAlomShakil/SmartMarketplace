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
   * Get products by seller
   */
  getBySeller: async (sellerId: string, params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/api/products/seller/${sellerId}?${queryParams}`);
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
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    return handleResponse(response);
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
 * Negotiation API functions
 */
export const negotiationAPI = {
  /**
   * Start negotiation for a product
   */
  start: async (productId: string, initialOffer?: number) => {
    const response = await fetch(`${API_BASE_URL}/api/negotiations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ productId, initialOffer }),
    });
    
    return handleResponse(response);
  },

  /**
   * Send message in negotiation
   */
  sendMessage: async (negotiationId: string, message: string, offer?: number) => {
    const response = await fetch(`${API_BASE_URL}/api/negotiations/${negotiationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ message, offer }),
    });
    
    return handleResponse(response);
  },

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
   * Get user's negotiations
   */
  getUserNegotiations: async () => {
    const response = await fetch(`${API_BASE_URL}/api/negotiations/user`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    
    return handleResponse(response);
  }
};

export default {
  productAPI,
  authAPI,
  negotiationAPI
};
