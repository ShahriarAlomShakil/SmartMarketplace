import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BackdropBlur } from '../ui/BackdropBlur';
import { ModernButton } from '../ui/ModernButton';
import { ModernBadge } from '../ui/ModernBadge';
import { formatRating, hasValidRating } from '../../utils/rating';
import {
  StarIcon,
  UserIcon,
  CalendarIcon,
  MapPinIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  TruckIcon,
  ClockIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

/**
 * SellerProfile Component - Enhanced seller information display
 * 
 * Features:
 * - Seller avatar and basic info
 * - Rating and review statistics
 * - Verification badges
 * - Response time indicators
 * - Quick contact options
 * - Seller stats and metrics
 * - Modern blur design
 */

interface SellerProfileProps {
  seller: {
    _id: string;
    username: string;
    avatar?: string;
    profile?: {
      rating: number;
      totalReviews: number;
      responseTime: string;
      joinedDate: string;
      isVerified: boolean;
      completedSales: number;
      location?: {
        city?: string;
        state?: string;
        country?: string;
      };
      bio?: string;
      badges?: string[];
    };
  };
  productId?: string;
  onContact?: () => void;
  onViewProfile?: () => void;
  className?: string;
}

export const SellerProfile: React.FC<SellerProfileProps> = ({
  seller,
  productId,
  onContact,
  onViewProfile,
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIconSolid key={i} className="w-4 h-4 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-4 h-4">
            <StarIcon className="absolute inset-0 w-4 h-4 text-gray-300 dark:text-gray-600" />
            <StarIconSolid 
              className="absolute inset-0 w-4 h-4 text-yellow-400"
              style={{ clipPath: 'inset(0 50% 0 0)' }}
            />
          </div>
        );
      } else {
        stars.push(
          <StarIcon key={i} className="w-4 h-4 text-gray-300 dark:text-gray-600" />
        );
      }
    }

    return stars;
  };

  const getResponseTimeColor = (responseTime: string) => {
    if (!responseTime) return 'text-gray-500';
    
    const time = responseTime.toLowerCase();
    if (time.includes('hour') || time.includes('minute')) {
      return 'text-green-600 dark:text-green-400';
    } else if (time.includes('day') && parseInt(time) <= 1) {
      return 'text-yellow-600 dark:text-yellow-400';
    } else {
      return 'text-red-600 dark:text-red-400';
    }
  };

  const getBadgeInfo = (badge: string) => {
    const badges: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      verified: {
        label: 'Verified',
        color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        icon: <ShieldCheckIcon className="w-3 h-3" />
      },
      top_seller: {
        label: 'Top Seller',
        color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        icon: <StarIconSolid className="w-3 h-3" />
      },
      fast_shipper: {
        label: 'Fast Shipper',
        color: 'bg-green-500/20 text-green-300 border-green-500/30',
        icon: <TruckIcon className="w-3 h-3" />
      },
      responsive: {
        label: 'Quick Response',
        color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        icon: <ChatBubbleLeftRightIcon className="w-3 h-3" />
      }
    };
    
    return badges[badge] || {
      label: badge,
      color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      icon: <TagIcon className="w-3 h-3" />
    };
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getLocationString = () => {
    if (!seller.profile?.location) return null;
    
    const { city, state, country } = seller.profile.location;
    const parts = [city, state, country].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <BackdropBlur className={`rounded-2xl border border-white/20 dark:border-gray-700/50 ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start space-x-4 mb-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
              {seller.avatar && !imageError ? (
                <Image
                  src={`http://localhost:5000${seller.avatar}`}
                  alt={seller.username}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Verification Badge */}
            {seller.profile?.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <ShieldCheckIcon className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {seller.username}
              </h3>
              
              {seller.profile?.isVerified && (
                <ModernBadge variant="success" size="sm">
                  Verified
                </ModernBadge>
              )}
            </div>

            {/* Rating */}
            {hasValidRating(seller.profile?.rating) && (
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex items-center space-x-1">
                  {renderStars(seller.profile!.rating)}
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatRating(seller.profile!.rating)}
                </span>
                {seller.profile?.totalReviews && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({seller.profile.totalReviews} reviews)
                  </span>
                )}
              </div>
            )}

            {/* Location */}
            {getLocationString() && (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                <MapPinIcon className="w-4 h-4 mr-1" />
                {getLocationString()}
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {seller.profile?.bio && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              {seller.profile.bio}
            </p>
          </div>
        )}

        {/* Badges */}
        {seller.profile?.badges && seller.profile.badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {seller.profile.badges.map((badge, index) => {
              const badgeInfo = getBadgeInfo(badge);
              return (
                <div
                  key={index}
                  className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${badgeInfo.color}`}
                >
                  {badgeInfo.icon}
                  <span>{badgeInfo.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Response Time */}
          {seller.profile?.responseTime && (
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <ClockIcon className="w-4 h-4 text-gray-400 mr-1" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Response Time</p>
              <p className={`text-sm font-medium ${getResponseTimeColor(seller.profile.responseTime)}`}>
                {seller.profile.responseTime}
              </p>
            </div>
          )}

          {/* Sales Count */}
          {seller.profile?.completedSales !== undefined && (
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <TagIcon className="w-4 h-4 text-gray-400 mr-1" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sales</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {seller.profile.completedSales}
              </p>
            </div>
          )}
        </div>

        {/* Join Date */}
        {seller.profile?.joinedDate && (
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-4">
            <CalendarIcon className="w-4 h-4 mr-1" />
            Member since {formatJoinDate(seller.profile.joinedDate)}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <ModernButton
            onClick={onContact}
            className="w-full"
            variant="primary"
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
            Contact Seller
          </ModernButton>
          
          <ModernButton
            onClick={onViewProfile}
            variant="ghost"
            className="w-full"
          >
            View Full Profile
          </ModernButton>
        </div>
      </div>
    </BackdropBlur>
  );
};

export default SellerProfile;
