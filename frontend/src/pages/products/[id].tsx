import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Layout } from '../../components/Layout';
import { BackdropBlur } from '../../components/ui/BackdropBlur';
import { ModernButton } from '../../components/ui/ModernButton';
import { ImageGallery } from '../../components/product/ImageGallery';
import { SellerProfile } from '../../components/product/SellerProfile';
import { RelatedProducts } from '../../components/product/RelatedProducts';
import { productAPI } from '../../utils/api';
import { formatRating, hasValidRating } from '../../utils/rating';
import { 
  MapPinIcon, 
  TagIcon,
  CurrencyDollarIcon,
  TruckIcon,
  BuildingStorefrontIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  ChatBubbleLeftRightIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

/**
 * Product Detail Page - Display individual product with all details
 * 
 * Features:
 * - Product image gallery
 * - Detailed product information
 * - Seller information
 * - Price and negotiation options
 * - Modern blur design
 */

interface Product {
  _id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  brand?: string;
  model?: string;
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
      bio?: string;
      joinDate?: string;
      totalSales?: number;
      responseTime?: string;
    };
  };
  location: {
    city?: string;
    state?: string;
    country?: string;
    shippingAvailable: boolean;
    localPickupOnly: boolean;
  };
  tags: string[];
  urgency: {
    level: string;
    reason?: string;
  };
  status: string;
  analytics: {
    views: number;
    likes: number;
    negotiations?: number;
  };
  specifications?: {
    [key: string]: string;
  };
  createdAt: string;
  updatedAt: string;
}

const ProductDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchProduct(id);
      trackView(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      const response = await productAPI.getById(productId);
      const productData = response.data.product;
      setProduct(productData);
      setLikeCount(productData.analytics.likes || 0);
      
      // Fetch related products
      fetchRelatedProducts(productId, productData.category);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (productId: string, category: string) => {
    try {
      setLoadingRelated(true);
      const response = await productAPI.getSimilar(productId);
      setRelatedProducts(response.data.products || []);
    } catch (err) {
      console.error('Failed to fetch related products:', err);
    } finally {
      setLoadingRelated(false);
    }
  };

  const trackView = async (productId: string) => {
    try {
      await productAPI.trackView(productId);
    } catch (err) {
      console.error('Failed to track view:', err);
    }
  };

  const handleLike = async () => {
    if (!product) return;
    
    try {
      // Optimistic update
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
      
      // Make API call (you'll need to implement this)
      // await productAPI.toggleLike(product._id);
    } catch (err) {
      // Revert optimistic update on error
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
      console.error('Failed to toggle like:', err);
    }
  };

  const handleShare = async () => {
    if (!product) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description.slice(0, 160),
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled or failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  const handleStartNegotiation = () => {
    if (product) {
      router.push(`/negotiate/${product._id}`);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      CAD: 'C$',
      AUD: 'A$'
    };
    return symbols[currency] || '$';
  };

  const getLocationString = () => {
    if (!product) return '';
    const parts = [];
    if (product.location.city) parts.push(product.location.city);
    if (product.location.state) parts.push(product.location.state);
    if (product.location.country) parts.push(product.location.country);
    return parts.join(', ') || 'Location not specified';
  };

  const getUrgencyColor = (level: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[level] || colors.medium;
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <BackdropBlur className="p-8 rounded-2xl border border-white/20 dark:border-gray-700/50 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Product Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || 'The product you are looking for does not exist.'}
            </p>
            <ModernButton onClick={() => router.push('/dashboard')}>
              Browse Products
            </ModernButton>
          </BackdropBlur>
        </div>
      </Layout>
    );
  }

  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
  const currencySymbol = getCurrencySymbol(product.pricing.currency);

  return (
    <>
      <Head>
        <title>{product.title} - Smart Marketplace</title>
        <meta name="description" content={product.description.slice(0, 160)} />
      </Head>
      
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Back Button */}
            <div className="mb-6">
              <ModernButton 
                variant="ghost" 
                onClick={() => router.back()}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                ← Back to Products
              </ModernButton>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              
              {/* Image Gallery */}
              <div className="space-y-4">
                {product.images && product.images.length > 0 ? (
                  <ImageGallery
                    images={product.images}
                    productTitle={product.title}
                  />
                ) : (
                  <BackdropBlur className="rounded-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
                    <div className="aspect-square relative bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <div className="text-center">
                        <EyeIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">No image available</p>
                      </div>
                    </div>
                  </BackdropBlur>
                )}
              </div>

              {/* Product Information */}
              <div className="space-y-6">
                
                {/* Header */}
                <BackdropBlur className="p-6 rounded-2xl border border-white/20 dark:border-gray-700/50">
                  <div className="flex items-start justify-between mb-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(product.urgency.level)}`}>
                      {product.urgency.level.charAt(0).toUpperCase() + product.urgency.level.slice(1)}
                    </span>
                    <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400">
                      <button className="hover:text-red-500 transition-colors" onClick={handleLike}>
                        <HeartIcon className="w-5 h-5" />
                      </button>
                      <button className="hover:text-blue-500 transition-colors" onClick={handleShare}>
                        <ShareIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {product.title}
                  </h1>
                  
                  {(product.brand || product.model) && (
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                      {[product.brand, product.model].filter(Boolean).join(' ')}
                    </p>
                  )}

                  {/* Price */}
                  <div className="space-y-2">
                    <div className="flex items-baseline space-x-3">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        {currencySymbol}{product.pricing.basePrice.toFixed(2)}
                      </span>
                      {product.pricing.negotiable && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          (negotiable)
                        </span>
                      )}
                    </div>
                    {product.pricing.negotiable && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Minimum price: {currencySymbol}{product.pricing.minPrice.toFixed(2)}
                      </p>
                    )}
                  </div>

                  {/* Location & Delivery */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <MapPinIcon className="w-4 h-4 mr-2" />
                      {getLocationString()}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {product.location.localPickupOnly && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          <BuildingStorefrontIcon className="w-3 h-3 mr-1" />
                          Local Pickup
                        </span>
                      )}
                      {product.location.shippingAvailable && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          <TruckIcon className="w-3 h-3 mr-1" />
                          Shipping Available
                        </span>
                      )}
                    </div>
                  </div>
                </BackdropBlur>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  {product.pricing.negotiable ? (
                    <ModernButton 
                      className="flex-1" 
                      onClick={handleStartNegotiation}
                    >
                      <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                      Start Negotiation
                    </ModernButton>
                  ) : (
                    <ModernButton className="flex-1">
                      <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                      Buy Now
                    </ModernButton>
                  )}
                  
                  <ModernButton variant="outline">
                    Contact Seller
                  </ModernButton>
                </div>

                {/* Product Stats */}
                <BackdropBlur className="p-4 rounded-xl border border-white/20 dark:border-gray-700/50">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400 mb-1">
                        <EyeIcon className="w-4 h-4" />
                        <span className="font-semibold">{product.analytics.views}</span>
                      </div>
                      <div className="text-xs text-gray-500">Views</div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400 mb-1">
                        <HeartIcon className="w-4 h-4" />
                        <span className="font-semibold">{likeCount}</span>
                      </div>
                      <div className="text-xs text-gray-500">Likes</div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400 mb-1">
                        <ClockIcon className="w-4 h-4" />
                        <span className="font-semibold text-xs">{getTimeAgo(product.createdAt)}</span>
                      </div>
                      <div className="text-xs text-gray-500">Listed</div>
                    </div>
                  </div>
                </BackdropBlur>

                {/* Product Specifications */}
                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <BackdropBlur className="p-6 rounded-xl border border-white/20 dark:border-gray-700/50">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Specifications
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                          <span className="text-gray-600 dark:text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="text-gray-900 dark:text-white font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </BackdropBlur>
                )}
              </div>
            </div>

            {/* Description and Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Description */}
              <div className="lg:col-span-2">
                <BackdropBlur className="p-6 rounded-2xl border border-white/20 dark:border-gray-700/50">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Description
                  </h2>
                  <div className="prose prose-sm max-w-none text-gray-600 dark:text-gray-400">
                    <p className="whitespace-pre-wrap">{product.description}</p>
                  </div>

                  {/* Tags */}
                  {product.tags.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          >
                            <TagIcon className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </BackdropBlur>
              </div>

              {/* Seller Information */}
              <div>
                <BackdropBlur className="p-6 rounded-2xl border border-white/20 dark:border-gray-700/50">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Seller Information
                  </h2>
                  
                  {product.seller ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                          {product.seller.avatar ? (
                            <Image 
                              src={product.seller.avatar} 
                              alt={product.seller.username}
                              width={64}
                              height={64}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold text-xl">
                              {product.seller.username.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 dark:text-white text-lg">
                            {product.seller.username}
                          </div>
                          {hasValidRating(product.seller.profile?.rating) && (
                            <div className="flex items-center gap-1 text-sm text-amber-500">
                              <span>⭐</span>
                              <span>{formatRating(product.seller.profile?.rating)}</span>
                              <span className="text-gray-500">rating</span>
                            </div>
                          )}
                          {product.seller.profile?.joinDate && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Member since {new Date(product.seller.profile.joinDate).getFullYear()}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Seller Stats */}
                      {product.seller.profile && (
                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          {product.seller.profile.totalSales && (
                            <div className="text-center">
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {product.seller.profile.totalSales}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Sales</div>
                            </div>
                          )}
                          {product.seller.profile.responseTime && (
                            <div className="text-center">
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {product.seller.profile.responseTime}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Response Time</div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Seller Bio */}
                      {product.seller.profile?.bio && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {product.seller.profile.bio}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <ModernButton variant="outline" className="flex-1">
                          View Profile
                        </ModernButton>
                        <ModernButton variant="secondary" className="flex-1">
                          Message Seller
                        </ModernButton>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-xl">?</span>
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white mb-2">
                        Anonymous Seller
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        No seller information available
                      </div>
                    </div>
                  )}
                </BackdropBlur>
              </div>
            </div>

            {/* Related Products Section */}
            <RelatedProducts
              products={relatedProducts}
              category={product.category}
              currentProductId={product._id}
              className="mt-12"
            />
          </div>
        </div>
      </Layout>
    </>
  );
};

export default ProductDetailPage;
