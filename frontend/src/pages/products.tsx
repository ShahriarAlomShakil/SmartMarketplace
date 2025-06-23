import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { ProductGrid } from '../components/product/ProductGrid';
import { ProductFilters, FilterState } from '../components/product/ProductFilters';
import { ModernButton } from '../components/ui/ModernButton';
import { BlurCard } from '../components/ui/BlurCard';
import { Navigation } from '../components/Navigation';
import { productAPI } from '../utils/api';
import { 
  MapPinIcon,
  TagIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

/**
 * Products Listing Page - Browse and search products
 * 
 * Features:
 * - Product grid with search and filters
 * - Responsive design with modern blur backgrounds
 * - Infinite scroll loading
 * - Real-time search and filtering
 * - Category and location filtering
 * - Price range filtering
 */

interface Product {
  _id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  brand?: string;
  images: Array<{
    url: string;
    isPrimary: boolean;
  }>;
  pricing: {
    basePrice: number;
    minPrice: number;
    currency: string;
    negotiable: boolean;
  };
  seller: {
    _id: string;
    username: string;
    avatar?: string;
    profile?: {
      rating: number;
    };
  };
  location: {
    city?: string;
    state?: string;
    country?: string;
  };
  tags: string[];
  status: string;
  analytics: {
    views: number;
    likes: number;
  };
  createdAt: string;
  urgency?: {
    level: string;
    reason?: string;
  };
}

interface ProductsResponse {
  products: Product[];
  totalCount: number;
  hasMore: boolean;
  categories: string[];
  locations: string[];
  popularTags: string[];
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [likedProducts, setLikedProducts] = useState<string[]>([]);
  
  // Filter and search state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    condition: [],
    priceRange: { min: null, max: null },
    location: '',
    tags: [],
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Additional data for filters
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);

  // Load products
  const loadProducts = useCallback(async (pageNum: number = 1, resetProducts: boolean = true) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const queryParams = new URLSearchParams();
      
      // Add filters to query
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.condition.length > 0) queryParams.append('condition', filters.condition.join(','));
      if (filters.priceRange.min !== null) queryParams.append('minPrice', filters.priceRange.min.toString());
      if (filters.priceRange.max !== null) queryParams.append('maxPrice', filters.priceRange.max.toString());
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.tags.length > 0) queryParams.append('tags', filters.tags.join(','));
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
      
      queryParams.append('page', pageNum.toString());
      queryParams.append('limit', '20');

      // Convert queryParams to object for the API call
      const params: any = {};
      queryParams.forEach((value, key) => {
        if (key === 'condition' || key === 'tags') {
          params[key] = value.split(',');
        } else if (key === 'minPrice' || key === 'maxPrice' || key === 'page' || key === 'limit') {
          params[key] = parseInt(value);
        } else {
          params[key] = value;
        }
      });

      const response = await productAPI.getAll(params);
      const data: ProductsResponse = response.data || response;

      if (resetProducts || pageNum === 1) {
        setProducts(data.products);
      } else {
        setProducts(prev => [...prev, ...data.products]);
      }

      setTotalCount(data.totalCount);
      setHasMore(data.hasMore);
      
      // Update filter options
      if (data.categories) setCategories(data.categories);
      if (data.locations) setLocations(data.locations);
      if (data.popularTags) setPopularTags(data.popularTags);

    } catch (err: any) {
      console.error('Error loading products:', err);
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters]);

  // Initial load and filter changes
  useEffect(() => {
    setPage(1);
    loadProducts(1, true);
  }, [filters]);

  // Load more products
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadProducts(nextPage, false);
    }
  }, [page, loadingMore, hasMore, loadProducts]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  // Handle product like
  const handleLike = useCallback(async (productId: string) => {
    try {
      if (likedProducts.includes(productId)) {
        await productAPI.unlike(productId);
        setLikedProducts(prev => prev.filter(id => id !== productId));
      } else {
        await productAPI.like(productId);
        setLikedProducts(prev => [...prev, productId]);
      }

      // Update the product's like count in the list
      setProducts(prev => prev.map(product => 
        product._id === productId 
          ? {
              ...product,
              analytics: {
                ...product.analytics,
                likes: likedProducts.includes(productId) 
                  ? product.analytics.likes - 1 
                  : product.analytics.likes + 1
              }
            }
          : product
      ));
    } catch (err) {
      console.error('Error updating like:', err);
    }
  }, [likedProducts]);

  // Handle negotiate
  const handleNegotiate = useCallback((productId: string) => {
    // Navigate to negotiation page or open chat
    window.location.href = `/negotiate/${productId}`;
  }, []);

  // Retry loading
  const handleRetry = () => {
    setError(null);
    loadProducts(1, true);
  };

  // Get page title based on filters
  const getPageTitle = () => {
    if (filters.search) return `Search: "${filters.search}"`;
    if (filters.category) return `${filters.category} Products`;
    return 'All Products';
  };

  return (
    <>
      <Head>
        <title>{getPageTitle()} - Smart Marketplace</title>
        <meta 
          name="description" 
          content="Browse and search products on our smart marketplace. Find great deals and negotiate with AI-powered assistance." 
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
      </Head>

      <div className="modern-layout">
        {/* Dynamic Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Primary gradient orbs */}
          <div 
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float" 
            style={{ animationDelay: '0s', animationDuration: '8s' }} 
          />
          <div 
            className="absolute top-3/4 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-float" 
            style={{ animationDelay: '2s', animationDuration: '10s' }} 
          />
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-float" 
            style={{ animationDelay: '4s', animationDuration: '12s' }} 
          />
          
          {/* Secondary ambient lights */}
          <div 
            className="absolute top-20 right-20 w-32 h-32 bg-cyan-400/15 rounded-full blur-2xl animate-float" 
            style={{ animationDelay: '1s', animationDuration: '6s' }} 
          />
          <div 
            className="absolute bottom-32 left-20 w-40 h-40 bg-emerald-400/15 rounded-full blur-2xl animate-float" 
            style={{ animationDelay: '3s', animationDuration: '9s' }} 
          />
          <div 
            className="absolute top-1/3 right-1/3 w-24 h-24 bg-rose-400/10 rounded-full blur-xl animate-float" 
            style={{ animationDelay: '5s', animationDuration: '7s' }} 
          />
        </div>

        {/* Navigation */}
        <Navigation items={[]} />

        {/* Main Content - Full Width */}
        <main className="relative z-10 min-h-screen">
          <div className="py-8">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              {/* Page header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {getPageTitle()}
                </h1>
                <p className="text-white/70">
                  Discover amazing products and negotiate with our AI-powered assistance
                </p>
              </div>

              {/* Error state */}
              {error && (
                <BlurCard variant="default" className="p-6 mb-6">
                  <div className="flex items-center gap-3">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-400 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-1">
                        Failed to load products
                      </h3>
                      <p className="text-white/70 text-sm">{error}</p>
                    </div>
                    <ModernButton
                      variant="secondary"
                      size="sm"
                      onClick={handleRetry}
                      leftIcon={<ArrowPathIcon className="w-4 h-4" />}
                    >
                      Retry
                    </ModernButton>
                  </div>
                </BlurCard>
              )}

              {/* Filters */}
              <ProductFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                categories={categories}
                locations={locations}
                popularTags={popularTags}
                totalResults={totalCount}
              />

              {/* Products grid */}
              <ProductGrid
                products={products}
                loading={loadingMore}
                hasMore={hasMore}
                onLoadMore={handleLoadMore}
                onLike={handleLike}
                onNegotiate={handleNegotiate}
                likedProducts={likedProducts}
                emptyMessage={
                  filters.search || filters.category || filters.condition.length > 0 || 
                  filters.priceRange.min !== null || filters.priceRange.max !== null ||
                  filters.location || filters.tags.length > 0
                    ? "No products match your filters"
                    : "No products available"
                }
                emptyDescription={
                  filters.search || filters.category || filters.condition.length > 0 || 
                  filters.priceRange.min !== null || filters.priceRange.max !== null ||
                  filters.location || filters.tags.length > 0
                    ? "Try adjusting your search criteria or filters to find more products."
                    : "Be the first to list a product on our marketplace!"
                }
              />

              {/* Featured categories (when no search/filters) */}
              {!loading && !error && products.length === 0 && !filters.search && 
               categories.length === 0 && (
                <div className="mt-12">
                  <BlurCard variant="default" className="p-8 text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <TagIcon className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-4">
                      Start Your Marketplace Journey
                    </h3>
                    <p className="text-white/70 mb-6 max-w-md mx-auto">
                      Be among the first to experience our AI-powered marketplace. 
                      List your products or check back soon for new listings!
                    </p>
                    <Link href="/sell">
                      <ModernButton variant="primary">
                        List Your First Product
                      </ModernButton>
                    </Link>
                  </BlurCard>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/10 bg-black/30 backdrop-blur-lg dark:bg-black/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SM</span>
                </div>
                <div>
                  <span className="text-white font-semibold">Smart Marketplace</span>
                  <div className="text-white/60 text-xs">AI-Powered Trading</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-white/60">
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
                <a href="#" className="hover:text-white transition-colors">Support</a>
                <a href="#" className="hover:text-white transition-colors">Contact</a>
              </div>
              
              <p className="text-white/50 text-sm">
                © 2025 Smart Marketplace. All rights reserved.
              </p>
            </div>
          </div>
        </footer>

        {/* Ambient lighting effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/5" />
        </div>
      </div>
    </>
  );
};

export default ProductsPage;
