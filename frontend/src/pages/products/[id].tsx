import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Layout } from '../../components/Layout';
import { BackdropBlur } from '../../components/ui/BackdropBlur';
import { ModernButton } from '../../components/ui/ModernButton';
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
  ChatBubbleLeftRightIcon
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
  };
  createdAt: string;
}

const ProductDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      const response = await productAPI.getById(productId);
      setProduct(response.data.product);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleStartNegotiation = () => {
    if (product) {
      router.push(`/negotiate/${product._id}`);
    }
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
              <BackdropBlur className="rounded-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
                <div className="aspect-square relative">
                  {primaryImage ? (
                    <Image
                      src={`http://localhost:5000${primaryImage.url}`}
                      alt={product.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <EyeIcon className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Urgency Badge */}
                  {product.urgency.level === 'urgent' && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white rounded-full text-sm font-medium">
                      🔥 Urgent Sale
                    </div>
                  )}
                </div>

                {/* Thumbnail Grid */}
                {product.images.length > 1 && (
                  <div className="p-4 grid grid-cols-4 gap-2">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                          index === selectedImageIndex 
                            ? 'border-blue-500' 
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <Image
                          src={`http://localhost:5000${image.url}`}
                          alt={`${product.title} ${index + 1}`}
                          width={100}
                          height={100}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </BackdropBlur>

              {/* Product Information */}
              <div className="space-y-6">
                
                {/* Header */}
                <BackdropBlur className="p-6 rounded-2xl border border-white/20 dark:border-gray-700/50">
                  <div className="flex items-start justify-between mb-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(product.urgency.level)}`}>
                      {product.urgency.level.charAt(0).toUpperCase() + product.urgency.level.slice(1)}
                    </span>
                    <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400">
                      <button className="hover:text-red-500 transition-colors">
                        <HeartIcon className="w-5 h-5" />
                      </button>
                      <button className="hover:text-blue-500 transition-colors">
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
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{product.analytics.views} views</span>
                    <span>{product.analytics.likes} likes</span>
                    <span>Listed {new Date(product.createdAt).toLocaleDateString()}</span>
                  </div>
                </BackdropBlur>
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
                    <>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {product.seller.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {product.seller.username}
                          </div>
                          {hasValidRating(product.seller.profile?.rating) && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              ⭐ {formatRating(product.seller.profile?.rating)} rating
                            </div>
                          )}
                        </div>
                      </div>

                      <ModernButton variant="outline" className="w-full">
                        View Seller Profile
                      </ModernButton>
                    </>
                  ) : (
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                        <span className="text-white font-medium">?</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          Anonymous Seller
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          No seller information available
                        </div>
                      </div>
                    </div>
                  )}
                </BackdropBlur>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default ProductDetailPage;
