import React from 'react';
import Image from 'next/image';
import { BlurCard } from '../ui/BlurCard';
import { ModernBadge } from '../ui/ModernBadge';
import { UserIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

interface UserProfileCardProps {
  user: {
    _id: string;
    username: string;
    email?: string;
    avatar?: string;
    isVerified?: boolean;
    role?: string;
    profile?: {
      rating?: {
        average?: number;
        count?: number;
      } | number; // Support both old and new format
    };
    stats?: {
      productsListed?: number;
      productsSold?: number;
      productsBought?: number;
      totalEarnings?: number;
      totalSpent?: number;
    };
  };
  className?: string;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({ 
  user, 
  className = "" 
}) => {
  const getRoleBadgeVariant = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'seller':
        return 'info' as const;
      case 'buyer':
        return 'success' as const;
      case 'admin':
        return 'error' as const;
      default:
        return 'secondary' as const;
    }
  };

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <BlurCard className={`p-4 ${className}`}>
      <div className="flex items-center space-x-3 mb-3">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.username}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-white/60" />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-white font-semibold truncate">
              {user.username}
            </h3>
            {user.isVerified && (
              <CheckBadgeIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {user.role && (
              <ModernBadge variant={getRoleBadgeVariant(user.role)} size="sm">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </ModernBadge>
            )}
            
            {user.profile?.rating && (
              <div className="text-xs text-white/60">
                ⭐ {typeof user.profile.rating === 'number' 
                     ? Number(user.profile.rating).toFixed(1)
                     : Number(user.profile.rating.average || 0).toFixed(1)
                   }
                {(typeof user.profile.rating === 'object' && user.profile.rating.count) && 
                  ` (${user.profile.rating.count})`
                }
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {user.stats && (
        <div className="grid grid-cols-2 gap-3 text-xs">
          {user.role === 'seller' ? (
            <>
              <div className="text-center p-2 bg-white/5 rounded-lg">
                <div className="text-white font-medium">
                  {user.stats.productsListed || 0}
                </div>
                <div className="text-white/60">Listed</div>
              </div>
              <div className="text-center p-2 bg-white/5 rounded-lg">
                <div className="text-white font-medium">
                  {formatCurrency(user.stats.totalEarnings)}
                </div>
                <div className="text-white/60">Earned</div>
              </div>
            </>
          ) : (
            <>
              <div className="text-center p-2 bg-white/5 rounded-lg">
                <div className="text-white font-medium">
                  {user.stats.productsBought || 0}
                </div>
                <div className="text-white/60">Bought</div>
              </div>
              <div className="text-center p-2 bg-white/5 rounded-lg">
                <div className="text-white font-medium">
                  {formatCurrency(user.stats.totalSpent)}
                </div>
                <div className="text-white/60">Spent</div>
              </div>
            </>
          )}
        </div>
      )}
    </BlurCard>
  );
};
