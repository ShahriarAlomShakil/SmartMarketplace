import React from 'react';
import Image from 'next/image';
import { AuthUser } from '../../../../shared/types/User';
import { BlurCard } from '../ui/BlurCard';
import { ModernButton } from '../ui/ModernButton';
import { ModernBadge } from '../ui/ModernBadge';

interface UserProfileCardProps {
  user: AuthUser & {
    firstName?: string;
    lastName?: string;
    profile?: {
      rating?: { average: number; count: number };
      trustScore?: { overall: number; level: string; badges?: any[] };
      verificationStatus?: Record<string, boolean>;
    };
    stats?: {
      productsListed?: number;
      productsSold?: number;
      successfulNegotiations?: number;
    };
  };
  showActions?: boolean;
  onEdit?: () => void;
  onViewProfile?: () => void;
  className?: string;
}

/**
 * UserProfileCard - Enhanced user profile card with trust scores and analytics
 * 
 * Day 18 Features:
 * - Trust score display with color coding
 * - Verification badges and status
 * - Achievement badges
 * - User statistics
 * - Modern design with blur backgrounds
 * - Enhanced role indicators
 */
export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  user,
  showActions = true,
  onEdit,
  onViewProfile,
  className
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const getUserDisplayName = () => {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.username;
  };

  const getVerificationLevel = () => {
    if (!user.profile?.verificationStatus) return 'Unverified';
    
    const verifications = user.profile.verificationStatus;
    const verifiedCount = Object.values(verifications).filter(Boolean).length;
    const totalCount = Object.keys(verifications).length;
    
    if (verifiedCount === totalCount) return 'Fully Verified';
    if (verifiedCount > totalCount / 2) return 'Partially Verified';
    return 'Unverified';
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-gray-500';
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'seller':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <BlurCard variant="elevated" className={`p-6 ${className}`}>
      {/* Header Section */}
      <div className="flex items-start space-x-4 mb-6">
        {/* Avatar */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
            {user.avatar ? (
              <Image 
                src={user.avatar} 
                alt={getUserDisplayName()} 
                width={64}
                height={64}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials(getUserDisplayName())
            )}
          </div>
          
          {/* Verification Badge */}
          {user.isVerified && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white/20">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold text-white truncate">
              {getUserDisplayName()}
            </h3>
            <ModernBadge 
              variant="secondary" 
              size="sm"
              className={getRoleBadgeColor(user.role)}
            >
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </ModernBadge>
          </div>
          
          <p className="text-sm text-white/60 mb-2">@{user.username}</p>
          
          {/* Trust Score */}
          {user.profile?.trustScore && (
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm text-white/70">Trust Score:</span>
              <span className={`text-sm font-medium ${getTrustScoreColor(user.profile.trustScore.overall)}`}>
                {user.profile.trustScore.overall}/100
              </span>
              <ModernBadge variant="secondary" size="sm">
                {user.profile.trustScore.level}
              </ModernBadge>
            </div>
          )}

          {/* Rating */}
          {user.profile?.rating && user.profile.rating.count > 0 && (
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(user.profile?.rating?.average || 0)
                        ? 'text-yellow-400'
                        : 'text-gray-600'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-white/70">
                {user.profile.rating.average.toFixed(1)} ({user.profile.rating.count} reviews)
              </span>
            </div>
          )}

          {/* Verification Status */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-white/70">Status:</span>
            <ModernBadge 
              variant={user.isVerified ? "success" : "secondary"} 
              size="sm"
            >
              {getVerificationLevel()}
            </ModernBadge>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {user.stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-xl font-bold text-white">{user.stats.productsListed || 0}</div>
            <div className="text-xs text-white/60">Products</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-white">{user.stats.productsSold || 0}</div>
            <div className="text-xs text-white/60">Sold</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-white">{user.stats.successfulNegotiations || 0}</div>
            <div className="text-xs text-white/60">Deals</div>
          </div>
        </div>
      )}

      {/* Trust Badges */}
      {user.profile?.trustScore?.badges && user.profile.trustScore.badges.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-white/80 mb-2">Achievements</h4>
          <div className="flex flex-wrap gap-2">
            {user.profile.trustScore.badges.slice(0, 3).map((badge, index) => (
              <ModernBadge 
                key={index}
                variant="warning" 
                size="sm"
                className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30"
              >
                {badge.name}
              </ModernBadge>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {showActions && (
        <div className="flex space-x-3">
          <ModernButton
            variant="primary"
            size="sm"
            onClick={onEdit}
            className="flex-1"
          >
            Edit Profile
          </ModernButton>
          <ModernButton
            variant="secondary"
            size="sm"
            onClick={onViewProfile}
            className="flex-1"
          >
            View Details
          </ModernButton>
        </div>
      )}
    </BlurCard>
  );
};
