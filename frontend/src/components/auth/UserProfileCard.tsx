import React from 'react';
import { AuthUser } from '../../../../shared/types/User';
import { BlurCard } from '../ui/BlurCard';
import { ModernButton } from '../ui/ModernButton';
import { ModernBadge } from '../ui/ModernBadge';

interface UserProfileCardProps {
  user: AuthUser;
  showActions?: boolean;
  onEdit?: () => void;
  onViewProfile?: () => void;
  className?: string;
}

/**
 * UserProfileCard - Modern user profile card with blur overlays
 * 
 * Features:
 * - Modern design with blur backgrounds
 * - User avatar and information display
 * - Action buttons for editing and viewing
 * - Status badges and role indicators
 * - Responsive design
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
    // For now, just use username since AuthUser doesn't have firstName/lastName
    return user.username;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      case 'user':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      default:
        return 'bg-white/20 text-white/80 border-white/30';
    }
  };

  return (
    <BlurCard variant="elevated" className={`p-6 ${className}`}>
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="relative">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={getUserDisplayName()}
              className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center border-2 border-white/20">
              <span className="text-white font-semibold text-lg">
                {getInitials(getUserDisplayName())}
              </span>
            </div>
          )}
          
          {/* Verification Badge */}
          {user.isVerified && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white/20">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
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
            {user.role && (
              <ModernBadge
                variant="info"
                className={getRoleBadgeColor(user.role)}
              >
                {user.role}
              </ModernBadge>
            )}
          </div>
          
          <p className="text-white/70 text-sm mb-2">@{user.username}</p>
          <p className="text-white/60 text-sm">{user.email}</p>
          
          {/* Status Indicators */}
          <div className="flex items-center space-x-4 mt-3">
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${user.isVerified ? 'bg-green-400' : 'bg-yellow-400'}`} />
              <span className="text-xs text-white/60">
                {user.isVerified ? 'Verified' : 'Unverified'}
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs text-white/60">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex space-x-3 mt-6">
          {onEdit && (
            <ModernButton
              variant="outline"
              size="sm"
              onClick={onEdit}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
            >
              Edit Profile
            </ModernButton>
          )}
          
          {onViewProfile && (
            <ModernButton
              variant="ghost"
              size="sm"
              onClick={onViewProfile}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              }
            >
              View Profile
            </ModernButton>
          )}
        </div>
      )}
    </BlurCard>
  );
};
