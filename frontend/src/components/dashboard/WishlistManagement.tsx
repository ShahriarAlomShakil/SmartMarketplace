import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  HeartIcon,
  TrashIcon,
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { BlurCard } from '../ui/BlurCard';
import { ModernButton } from '../ui/ModernButton';
import { ModernBadge } from '../ui/ModernBadge';
import { BackdropBlur } from '../ui/BackdropBlur';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

interface WishlistItem {
  _id: string;
  product: {
    _id: string;
    title: string;
    description: string;
    images: Array<{ url: string; alt?: string }>;
    pricing: {
      basePrice: number;
      minPrice: number;
      currency: string;
    };
    seller: {
      _id: string;
      username: string;
      avatar?: string;
      profile?: {
        rating: number;
        totalReviews: number;
      };
    };
    status: string;
    category: string;
    createdAt: string;
    analytics?: {
      views: number;
      negotiations: number;
    };
  };
  addedAt: string;
  priceAlert?: {
    enabled: boolean;
    targetPrice: number;
  };
}

interface WishlistManagementProps {
  className?: string;
}

export const WishlistManagement: React.FC<WishlistManagementProps> = ({
  className = ""
}) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-low' | 'price-high'>('newest');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockWishlist: WishlistItem[] = [
        {
          _id: '1',
          product: {
            _id: 'prod1',
            title: 'iPhone 13 Pro Max',
            description: 'Excellent condition iPhone 13 Pro Max with original box',
            images: [{ url: '/api/placeholder/300/200', alt: 'iPhone 13 Pro Max' }],
            pricing: {
              basePrice: 899,
              minPrice: 750,
              currency: 'USD'
            },
            seller: {
              _id: 'seller1',
              username: 'TechDealer',
              avatar: '/api/placeholder/40/40',
              profile: {
                rating: 4.8,
                totalReviews: 156
              }
            },
            status: 'active',
            category: 'Electronics',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            analytics: {
              views: 234,
              negotiations: 12
            }
          },
          addedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          priceAlert: {
            enabled: true,
            targetPrice: 800
          }
        },
        {
          _id: '2',
          product: {
            _id: 'prod2',
            title: 'MacBook Pro 14" M2',
            description: 'Like new MacBook Pro with M2 chip, perfect for developers',
            images: [{ url: '/api/placeholder/300/200', alt: 'MacBook Pro' }],
            pricing: {
              basePrice: 1599,
              minPrice: 1400,
              currency: 'USD'
            },
            seller: {
              _id: 'seller2',
              username: 'AppleExpert',
              profile: {
                rating: 4.9,
                totalReviews: 89
              }
            },
            status: 'active',
            category: 'Electronics',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            analytics: {
              views: 187,
              negotiations: 8
            }
          },
          addedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          priceAlert: {
            enabled: false,
            targetPrice: 1500
          }
        },
        {
          _id: '3',
          product: {
            _id: 'prod3',
            title: 'Vintage Leather Jacket',
            description: 'Authentic vintage leather jacket from the 80s',
            images: [{ url: '/api/placeholder/300/200', alt: 'Leather Jacket' }],
            pricing: {
              basePrice: 280,
              minPrice: 200,
              currency: 'USD'
            },
            seller: {
              _id: 'seller3',
              username: 'VintageCollector',
              profile: {
                rating: 4.6,
                totalReviews: 34
              }
            },
            status: 'active',
            category: 'Fashion',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            analytics: {
              views: 89,
              negotiations: 5
            }
          },
          addedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setWishlistItems(mockWishlist);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedItems = React.useMemo(() => {
    let filtered = wishlistItems.filter(item => {
      const matchesSearch = item.product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        case 'oldest':
          return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
        case 'price-low':
          return a.product.pricing.basePrice - b.product.pricing.basePrice;
        case 'price-high':
          return b.product.pricing.basePrice - a.product.pricing.basePrice;
        default:
          return 0;
      }
    });
  }, [wishlistItems, searchQuery, sortBy, categoryFilter]);

  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const removeFromWishlist = async (itemId: string) => {
    try {
      // Call API to remove item
      // await api.wishlistAPI.removeItem(itemId);
      setWishlistItems(prev => prev.filter(item => item._id !== itemId));
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const removeSelectedItems = async () => {
    try {
      // Call API to remove multiple items
      // await api.wishlistAPI.removeItems(Array.from(selectedItems));
      setWishlistItems(prev => prev.filter(item => !selectedItems.has(item._id)));
      setSelectedItems(new Set());
      setShowBulkActions(false);
    } catch (error) {
      console.error('Error removing selected items:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const time = new Date(date);
    const diffMs = now.getTime() - time.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const categories = Array.from(new Set(wishlistItems.map(item => item.product.category)));

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <BlurCard key={i} className="p-6 animate-pulse">
              <div className="h-48 bg-white/10 rounded-lg mb-4"></div>
              <div className="h-4 bg-white/10 rounded mb-2"></div>
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
            </BlurCard>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            My Wishlist
          </h1>
          <p className="text-white/70">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {/* Bulk Actions */}
        <AnimatePresence>
          {showBulkActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-3"
            >
              <ModernBadge variant="info">
                {selectedItems.size} selected
              </ModernBadge>
              <ModernButton
                variant="secondary"
                size="sm"
                onClick={removeSelectedItems}
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Remove Selected
              </ModernButton>
              <ModernButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedItems(new Set());
                  setShowBulkActions(false);
                }}
              >
                Cancel
              </ModernButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filters and Search */}
      <BlurCard className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
            <input
              type="text"
              placeholder="Search wishlist items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-white/60" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </BlurCard>

      {/* Wishlist Items */}
      {filteredAndSortedItems.length === 0 ? (
        <BlurCard className="p-12 text-center">
          <HeartIcon className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchQuery || categoryFilter !== 'all' ? 'No items found' : 'Your wishlist is empty'}
          </h3>
          <p className="text-white/60 mb-6">
            {searchQuery || categoryFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Start adding products you love to your wishlist'
            }
          </p>
          {!searchQuery && categoryFilter === 'all' && (
            <Link href="/products">
              <ModernButton variant="primary">
                Browse Products
              </ModernButton>
            </Link>
          )}
        </BlurCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedItems.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <BlurCard className="overflow-hidden hover:scale-[1.02] transition-transform">
                {/* Selection Checkbox */}
                <div className="absolute top-3 left-3 z-10">
                  <button
                    onClick={() => toggleItemSelection(item._id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedItems.has(item._id)
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-white/30 hover:border-white/60'
                    }`}
                  >
                    {selectedItems.has(item._id) && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Remove Button */}
                <div className="absolute top-3 right-3 z-10">
                  <button
                    onClick={() => removeFromWishlist(item._id)}
                    className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 rounded-full flex items-center justify-center transition-colors group"
                  >
                    <HeartIconSolid className="w-4 h-4 text-red-400 group-hover:text-red-300" />
                  </button>
                </div>

                {/* Product Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={item.product.images[0]?.url || '/api/placeholder/300/200'}
                    alt={item.product.title}
                    fill
                    className="object-cover"
                  />
                  
                  {/* Status Badge */}
                  <div className="absolute bottom-3 left-3">
                    <ModernBadge 
                      variant={item.product.status === 'active' ? 'success' : 'secondary'}
                      size="sm"
                    >
                      {item.product.status}
                    </ModernBadge>
                  </div>

                  {/* Price Alert Badge */}
                  {item.priceAlert?.enabled && (
                    <div className="absolute bottom-3 right-3">
                      <ModernBadge variant="warning" size="sm">
                        Price Alert
                      </ModernBadge>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white line-clamp-1">
                      {item.product.title}
                    </h3>
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">
                        {formatCurrency(item.product.pricing.basePrice)}
                      </div>
                      <div className="text-sm text-white/60">
                        Min: {formatCurrency(item.product.pricing.minPrice)}
                      </div>
                    </div>
                  </div>

                  {/* Seller Info */}
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-white/10">
                      {item.product.seller.avatar ? (
                        <Image
                          src={item.product.seller.avatar}
                          alt={item.product.seller.username}
                          width={24}
                          height={24}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xs text-white/60">
                            {item.product.seller.username[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-white/70">
                      {item.product.seller.username}
                    </span>
                    {item.product.seller.profile?.rating && (
                      <div className="flex items-center space-x-1">
                        <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-white/70">
                          {item.product.seller.profile.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Analytics */}
                  {item.product.analytics && (
                    <div className="flex items-center space-x-4 mb-3 text-sm text-white/60">
                      <div className="flex items-center space-x-1">
                        <EyeIcon className="w-4 h-4" />
                        <span>{item.product.analytics.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                        <span>{item.product.analytics.negotiations}</span>
                      </div>
                    </div>
                  )}

                  {/* Added Date */}
                  <div className="flex items-center space-x-1 mb-4 text-sm text-white/60">
                    <ClockIcon className="w-4 h-4" />
                    <span>Added {formatTimeAgo(item.addedAt)}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Link href={`/products/${item.product._id}`} className="flex-1">
                      <ModernButton variant="primary" className="w-full">
                        <EyeIcon className="w-4 h-4 mr-2" />
                        View
                      </ModernButton>
                    </Link>
                    <ModernButton variant="secondary" size="sm" className="px-3">
                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    </ModernButton>
                  </div>
                </div>
              </BlurCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
