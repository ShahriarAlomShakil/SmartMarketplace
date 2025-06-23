import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BlurCard } from '../ui/BlurCard';
import { ModernButton } from '../ui/ModernButton';
import { ModernBadge } from '../ui/ModernBadge';
import { formatRating, hasValidRating } from '@/utils/rating';
import { 
  MapPinIcon, 
  TagIcon,
  CurrencyDollarIcon,
  HeartIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

/**
 * ProductCard Component - Modern product card with blurry backgrounds
 * 
 * Features:
 * - Product image with lazy loading
 * - Price display with negotiable indicators
 * - Hover animations and micro-interactions
 * - Quick action buttons
 * - Seller information
 * - Responsive design
 */

interface ProductCardProps {
  product: {
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
  };
  onLike?: (productId: string) => void;
  onNegotiate?: (productId: string) => void;
  isLiked?: boolean;
  variant?: 'grid' | 'list';
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onLike,
  onNegotiate,
  isLiked = false,
  variant = 'grid',
  className = ''
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [liked, setLiked] = useState(isLiked);

  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
  
  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      BDT: '৳'
    };
    return symbols[currency] || currency;
  };

  const getLocationString = () => {
    const { city, state, country } = product.location;
    const parts = [city, state, country].filter(Boolean);
    return parts.join(', ');
  };

  const getConditionColor = (condition: string) => {
    const colors: { [key: string]: string } = {
      'new': 'bg-green-500/20 text-green-300 border-green-500/30',
      'like-new': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'excellent': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      'good': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'fair': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'poor': 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return colors[condition.toLowerCase()] || colors['good'];
  };

  const getUrgencyColor = (level: string) => {
    const colors: { [key: string]: string } = {
      'high': 'bg-red-500/20 text-red-300 border-red-500/30',
      'medium': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'low': 'bg-green-500/20 text-green-300 border-green-500/30'
    };
    return colors[level?.toLowerCase()] || '';
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(!liked);
    onLike?.(product._id);
  };

  const handleNegotiate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onNegotiate?.(product._id);
  };

  const timeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / 60000);
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (variant === 'list') {
    return (
      <Link href={`/products/${product._id}`}>
        <BlurCard 
          variant="default" 
          hover={true}
          className={`group cursor-pointer transition-all duration-300 ${className}`}
        >
          <div className="flex gap-4 p-4">
            {/* Image */}
            <div className="relative w-32 h-24 flex-shrink-0 rounded-xl overflow-hidden">
              {primaryImage ? (
                <Image
                  src={primaryImage.url}
                  alt={product.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  onLoad={() => setImageLoading(false)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <TagIcon className="w-8 h-8 text-gray-500" />
                </div>
              )}
              
              {imageLoading && (
                <div className="absolute inset-0 bg-gray-800/50 backdrop-blur-sm animate-pulse" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-white font-semibold text-lg truncate group-hover:text-blue-300 transition-colors">
                  {product.title}
                </h3>
                <button
                  onClick={handleLike}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {liked ? (
                    <HeartIconSolid className="w-5 h-5 text-red-400" />
                  ) : (
                    <HeartIcon className="w-5 h-5 text-white/60 hover:text-red-400" />
                  )}
                </button>
              </div>

              <p className="text-white/70 text-sm mb-3 line-clamp-2">
                {product.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">
                    {getCurrencySymbol(product.pricing.currency)}{product.pricing.basePrice.toLocaleString()}
                  </span>
                  {product.pricing.negotiable && (
                    <ModernBadge variant="secondary" size="sm">
                      Negotiable
                    </ModernBadge>
                  )}
                </div>

                <ModernButton
                  variant="primary"
                  size="sm"
                  onClick={handleNegotiate}
                  leftIcon={<ChatBubbleLeftRightIcon className="w-4 h-4" />}
                >
                  Chat
                </ModernButton>
              </div>

              <div className="flex items-center justify-between mt-3 text-xs text-white/60">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <EyeIcon className="w-4 h-4" />
                    {product.analytics.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <HeartIcon className="w-4 h-4" />
                    {product.analytics.likes}
                  </span>
                  {getLocationString() && (
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4" />
                      {getLocationString()}
                    </span>
                  )}
                </div>
                <span>{timeAgo(product.createdAt)}</span>
              </div>
            </div>
          </div>
        </BlurCard>
      </Link>
    );
  }

  return (
    <Link href={`/products/${product._id}`}>
      <BlurCard 
        variant="default" 
        hover={true}
        className={`group cursor-pointer transition-all duration-300 h-full ${className}`}
      >
        <div className="relative">
          {/* Image */}
          <div className="relative w-full h-48 rounded-t-2xl overflow-hidden">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={product.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                onLoad={() => setImageLoading(false)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <TagIcon className="w-12 h-12 text-gray-500" />
              </div>
            )}
            
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-800/50 backdrop-blur-sm animate-pulse" />
            )}

            {/* Overlay badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <ModernBadge 
                variant="secondary" 
                size="sm"
                className={getConditionColor(product.condition)}
              >
                {product.condition}
              </ModernBadge>
              {product.urgency?.level && (
                <ModernBadge 
                  variant="secondary" 
                  size="sm"
                  className={getUrgencyColor(product.urgency.level)}
                >
                  {product.urgency.level} urgency
                </ModernBadge>
              )}
            </div>

            {/* Like button */}
            <button
              onClick={handleLike}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50 transition-colors"
            >
              {liked ? (
                <HeartIconSolid className="w-5 h-5 text-red-400" />
              ) : (
                <HeartIcon className="w-5 h-5 text-white hover:text-red-400" />
              )}
            </button>

            {/* Quick actions on hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <ModernButton
                variant="primary"
                size="sm"
                onClick={handleNegotiate}
                leftIcon={<ChatBubbleLeftRightIcon className="w-4 h-4" />}
              >
                Start Chat
              </ModernButton>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Title and Price */}
            <div className="mb-3">
              <h3 className="text-white font-semibold text-lg mb-1 truncate group-hover:text-blue-300 transition-colors">
                {product.title}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">
                  {getCurrencySymbol(product.pricing.currency)}{product.pricing.basePrice.toLocaleString()}
                </span>
                {product.pricing.negotiable && (
                  <ModernBadge variant="secondary" size="sm">
                    Negotiable
                  </ModernBadge>
                )}
              </div>
              {product.pricing.negotiable && (
                <p className="text-xs text-white/60 mt-1">
                  Min: {getCurrencySymbol(product.pricing.currency)}{product.pricing.minPrice.toLocaleString()}
                </p>
              )}
            </div>

            {/* Description */}
            <p className="text-white/70 text-sm mb-3 line-clamp-2">
              {product.description}
            </p>

            {/* Seller info */}
            <div className="flex items-center gap-2 mb-3">
              {product.seller ? (
                <>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                    {product.seller.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white/80 text-sm">{product.seller.username}</span>
                  {hasValidRating(product.seller.profile?.rating) && (
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-white/60 text-xs">
                        {formatRating(product.seller.profile?.rating)}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-xs font-semibold">
                    ?
                  </div>
                  <span className="text-white/60 text-sm">Anonymous Seller</span>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-white/60">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <EyeIcon className="w-4 h-4" />
                  {product.analytics.views}
                </span>
                <span className="flex items-center gap-1">
                  <HeartIcon className="w-4 h-4" />
                  {product.analytics.likes}
                </span>
                {getLocationString() && (
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />
                    {getLocationString().split(',')[0]} {/* Show only city */}
                  </span>
                )}
              </div>
              <span>{timeAgo(product.createdAt)}</span>
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {product.tags.slice(0, 3).map((tag, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-white/10 text-white/70 text-xs rounded-lg"
                  >
                    #{tag}
                  </span>
                ))}
                {product.tags.length > 3 && (
                  <span className="px-2 py-1 bg-white/10 text-white/70 text-xs rounded-lg">
                    +{product.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </BlurCard>
    </Link>
  );
};

export default ProductCard;
