import React, { useState, useRef, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { ProductSkeleton } from './ProductSkeleton';
import { BlurCard } from '../ui/BlurCard';
import { ModernButton } from '../ui/ModernButton';
import { 
  ViewColumnsIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';

/**
 * ProductGrid Component - Responsive grid layout for products
 * 
 * Features:
 * - Grid and list view modes
 * - Infinite scroll loading
 * - View mode persistence
 * - Responsive breakpoints
 * - Loading states with skeletons
 * - Scroll to top functionality
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

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onLike?: (productId: string) => void;
  onNegotiate?: (productId: string) => void;
  likedProducts?: string[];
  emptyMessage?: string;
  emptyDescription?: string;
  className?: string;
}

type ViewMode = 'grid' | 'list';

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  hasMore = false,
  onLoadMore,
  onLike,
  onNegotiate,
  likedProducts = [],
  emptyMessage = "No products found",
  emptyDescription = "Try adjusting your search or filters to find what you're looking for.",
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Load view mode from localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem('productViewMode') as ViewMode;
    if (savedViewMode && ['grid', 'list'].includes(savedViewMode)) {
      setViewMode(savedViewMode);
    }
  }, []);

  // Save view mode to localStorage
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('productViewMode', mode);
  };

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || loading || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 1000);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    gridRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getGridClasses = () => {
    if (viewMode === 'list') {
      return 'space-y-4';
    }
    return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6';
  };

  // Empty state
  if (products.length === 0 && !loading) {
    return (
      <div className={`${className}`}>
        {/* View mode controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ModernButton
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('grid')}
              leftIcon={<Squares2X2Icon className="w-4 h-4" />}
            >
              Grid
            </ModernButton>
            <ModernButton
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('list')}
              leftIcon={<ListBulletIcon className="w-4 h-4" />}
            >
              List
            </ModernButton>
          </div>
          <span className="text-white/60 text-sm">0 products</span>
        </div>

        {/* Empty state */}
        <BlurCard variant="default" className="p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
            <ViewColumnsIcon className="w-12 h-12 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {emptyMessage}
          </h3>
          <p className="text-white/70 max-w-md mx-auto">
            {emptyDescription}
          </p>
        </BlurCard>
      </div>
    );
  }

  return (
    <div className={`${className}`} ref={gridRef}>
      {/* View mode controls and count */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ModernButton
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => handleViewModeChange('grid')}
            leftIcon={<Squares2X2Icon className="w-4 h-4" />}
          >
            Grid
          </ModernButton>
          <ModernButton
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => handleViewModeChange('list')}
            leftIcon={<ListBulletIcon className="w-4 h-4" />}
          >
            List
          </ModernButton>
        </div>
        <span className="text-white/60 text-sm">
          {products.length} product{products.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Products grid */}
      <div className={getGridClasses()}>
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            variant={viewMode}
            onLike={onLike}
            onNegotiate={onNegotiate}
            isLiked={likedProducts.includes(product._id)}
          />
        ))}

        {/* Loading skeletons */}
        {loading && (
          <>
            {Array.from({ length: viewMode === 'list' ? 5 : 12 }).map((_, index) => (
              <ProductSkeleton key={`skeleton-${index}`} variant={viewMode} />
            ))}
          </>
        )}
      </div>

      {/* Load more trigger */}
      {hasMore && !loading && (
        <div ref={loadMoreRef} className="mt-8 text-center">
          <ModernButton
            variant="secondary"
            onClick={onLoadMore}
            disabled={loading}
          >
            Load More Products
          </ModernButton>
        </div>
      )}

      {/* Loading indicator */}
      {loading && products.length > 0 && (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-white/60">
            <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
            Loading more products...
          </div>
        </div>
      )}

      {/* No more products message */}
      {!hasMore && products.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-white/60 text-sm">
            You've reached the end of the product list
          </p>
        </div>
      )}

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          aria-label="Scroll to top"
        >
          <ArrowUpIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default ProductGrid;
