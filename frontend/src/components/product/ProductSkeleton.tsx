import React from 'react';
import { BlurCard } from '../ui/BlurCard';

/**
 * ProductSkeleton Component - Loading skeleton for product cards
 * 
 * Features:
 * - Grid and list variants
 * - Smooth pulse animations
 * - Modern blur backgrounds
 * - Responsive design
 */

interface ProductSkeletonProps {
  variant?: 'grid' | 'list';
  className?: string;
}

export const ProductSkeleton: React.FC<ProductSkeletonProps> = ({
  variant = 'grid',
  className = ''
}) => {
  if (variant === 'list') {
    return (
      <BlurCard className={`animate-pulse ${className}`}>
        <div className="flex gap-4 p-4">
          {/* Image skeleton */}
          <div className="w-32 h-24 bg-white/10 rounded-xl flex-shrink-0" />
          
          {/* Content skeleton */}
          <div className="flex-1 space-y-3">
            {/* Title and heart */}
            <div className="flex items-center justify-between">
              <div className="h-5 bg-white/10 rounded-lg w-3/4" />
              <div className="w-5 h-5 bg-white/10 rounded" />
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <div className="h-3 bg-white/10 rounded w-full" />
              <div className="h-3 bg-white/10 rounded w-2/3" />
            </div>
            
            {/* Price and button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 bg-white/10 rounded w-20" />
                <div className="h-4 bg-white/10 rounded w-16" />
              </div>
              <div className="h-8 bg-white/10 rounded w-16" />
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-3 bg-white/10 rounded w-8" />
                <div className="h-3 bg-white/10 rounded w-8" />
                <div className="h-3 bg-white/10 rounded w-16" />
              </div>
              <div className="h-3 bg-white/10 rounded w-12" />
            </div>
          </div>
        </div>
      </BlurCard>
    );
  }

  return (
    <BlurCard className={`animate-pulse h-full ${className}`}>
      <div className="relative">
        {/* Image skeleton */}
        <div className="w-full h-48 bg-white/10 rounded-t-2xl" />
        
        {/* Content skeleton */}
        <div className="p-4 space-y-4">
          {/* Title and price */}
          <div className="space-y-2">
            <div className="h-5 bg-white/10 rounded-lg w-3/4" />
            <div className="flex items-center gap-2">
              <div className="h-6 bg-white/10 rounded w-24" />
              <div className="h-4 bg-white/10 rounded w-16" />
            </div>
            <div className="h-3 bg-white/10 rounded w-20" />
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <div className="h-3 bg-white/10 rounded w-full" />
            <div className="h-3 bg-white/10 rounded w-2/3" />
          </div>
          
          {/* Seller info */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white/10 rounded-full" />
            <div className="h-3 bg-white/10 rounded w-20" />
            <div className="h-3 bg-white/10 rounded w-8" />
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-3 bg-white/10 rounded w-8" />
              <div className="h-3 bg-white/10 rounded w-8" />
              <div className="h-3 bg-white/10 rounded w-12" />
            </div>
            <div className="h-3 bg-white/10 rounded w-12" />
          </div>
          
          {/* Tags */}
          <div className="flex gap-1">
            <div className="h-5 bg-white/10 rounded w-12" />
            <div className="h-5 bg-white/10 rounded w-16" />
            <div className="h-5 bg-white/10 rounded w-10" />
          </div>
        </div>
      </div>
    </BlurCard>
  );
};

export default ProductSkeleton;
