import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingBagIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { BlurCard } from '../ui/BlurCard';
import { ModernButton } from '../ui/ModernButton';
import { ModernBadge } from '../ui/ModernBadge';
import { BackdropBlur } from '../ui/BackdropBlur';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

interface PurchaseRecord {
  _id: string;
  negotiation: {
    _id: string;
    product: {
      _id: string;
      title: string;
      description: string;
      images: Array<{ url: string; alt?: string }>;
      category: string;
      seller: {
        _id: string;
        username: string;
        avatar?: string;
        profile?: {
          rating: number;
          totalReviews: number;
        };
      };
    };
    finalPrice: number;
    originalPrice: number;
    negotiationRounds: number;
    startedAt: string;
    completedAt: string;
    status: 'completed' | 'cancelled' | 'refunded';
    paymentMethod?: string;
    deliveryStatus?: 'pending' | 'shipped' | 'delivered' | 'returned';
    trackingNumber?: string;
  };
  transaction: {
    _id: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    transactionId: string;
    processedAt: string;
    fees: number;
  };
  review?: {
    rating: number;
    comment: string;
    createdAt: string;
  };
  savings: number;
  savingsPercentage: number;
}

interface PurchaseHistoryProps {
  className?: string;
}

export const PurchaseHistory: React.FC<PurchaseHistoryProps> = ({
  className = ""
}) => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'all' | '30d' | '90d' | '1y'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-high' | 'price-low' | 'savings'>('newest');
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseRecord | null>(null);

  useEffect(() => {
    fetchPurchaseHistory();
  }, [dateRange]);

  const fetchPurchaseHistory = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockPurchases: PurchaseRecord[] = [
        {
          _id: 'purchase1',
          negotiation: {
            _id: 'neg1',
            product: {
              _id: 'prod1',
              title: 'iPhone 13 Pro Max 256GB',
              description: 'Excellent condition iPhone with original accessories',
              images: [{ url: '/api/placeholder/300/200', alt: 'iPhone 13 Pro Max' }],
              category: 'Electronics',
              seller: {
                _id: 'seller1',
                username: 'TechDealer',
                avatar: '/api/placeholder/40/40',
                profile: {
                  rating: 4.8,
                  totalReviews: 156
                }
              }
            },
            finalPrice: 750,
            originalPrice: 899,
            negotiationRounds: 4,
            startedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
            paymentMethod: 'Credit Card',
            deliveryStatus: 'delivered',
            trackingNumber: 'TR123456789'
          },
          transaction: {
            _id: 'trans1',
            amount: 750,
            currency: 'USD',
            paymentMethod: 'visa_****_1234',
            transactionId: 'txn_1234567890',
            processedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            fees: 22.50
          },
          review: {
            rating: 5,
            comment: 'Excellent product and fast shipping. Seller was very responsive!',
            createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
          },
          savings: 149,
          savingsPercentage: 16.6
        },
        {
          _id: 'purchase2',
          negotiation: {
            _id: 'neg2',
            product: {
              _id: 'prod2',
              title: 'Sony WH-1000XM4 Headphones',
              description: 'Premium noise-cancelling headphones',
              images: [{ url: '/api/placeholder/300/200', alt: 'Sony Headphones' }],
              category: 'Electronics',
              seller: {
                _id: 'seller2',
                username: 'AudioPro',
                profile: {
                  rating: 4.9,
                  totalReviews: 89
                }
              }
            },
            finalPrice: 220,
            originalPrice: 280,
            negotiationRounds: 2,
            startedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
            completedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
            paymentMethod: 'PayPal',
            deliveryStatus: 'delivered'
          },
          transaction: {
            _id: 'trans2',
            amount: 220,
            currency: 'USD',
            paymentMethod: 'paypal_****@email.com',
            transactionId: 'txn_9876543210',
            processedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            fees: 6.60
          },
          review: {
            rating: 4,
            comment: 'Good quality headphones, quick delivery.',
            createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
          },
          savings: 60,
          savingsPercentage: 21.4
        },
        {
          _id: 'purchase3',
          negotiation: {
            _id: 'neg3',
            product: {
              _id: 'prod3',
              title: 'Designer Leather Wallet',
              description: 'Genuine leather wallet with card slots',
              images: [{ url: '/api/placeholder/300/200', alt: 'Leather Wallet' }],
              category: 'Fashion',
              seller: {
                _id: 'seller3',
                username: 'LeatherCraft',
                profile: {
                  rating: 4.7,
                  totalReviews: 67
                }
              }
            },
            finalPrice: 85,
            originalPrice: 120,
            negotiationRounds: 3,
            startedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
            completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
            paymentMethod: 'Credit Card',
            deliveryStatus: 'delivered'
          },
          transaction: {
            _id: 'trans3',
            amount: 85,
            currency: 'USD',
            paymentMethod: 'mastercard_****_5678',
            transactionId: 'txn_5555666677',
            processedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            fees: 2.55
          },
          savings: 35,
          savingsPercentage: 29.2
        }
      ];
      setPurchases(mockPurchases);
    } catch (error) {
      console.error('Error fetching purchase history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedPurchases = React.useMemo(() => {
    let filtered = purchases.filter(purchase => {
      const matchesSearch = purchase.negotiation.product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          purchase.negotiation.product.seller.username.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || purchase.negotiation.status === statusFilter;
      
      let matchesDate = true;
      if (dateRange !== 'all') {
        const purchaseDate = new Date(purchase.negotiation.completedAt);
        const now = new Date();
        const daysAgo = dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
        const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        matchesDate = purchaseDate >= cutoffDate;
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.negotiation.completedAt).getTime() - new Date(a.negotiation.completedAt).getTime();
        case 'oldest':
          return new Date(a.negotiation.completedAt).getTime() - new Date(b.negotiation.completedAt).getTime();
        case 'price-high':
          return b.negotiation.finalPrice - a.negotiation.finalPrice;
        case 'price-low':
          return a.negotiation.finalPrice - b.negotiation.finalPrice;
        case 'savings':
          return b.savings - a.savings;
        default:
          return 0;
      }
    });
  }, [purchases, searchQuery, statusFilter, dateRange, sortBy]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'cancelled':
        return 'text-red-400';
      case 'refunded':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getDeliveryStatusColor = (status?: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-400';
      case 'shipped':
        return 'text-blue-400';
      case 'pending':
        return 'text-yellow-400';
      case 'returned':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const totalSpent = filteredAndSortedPurchases.reduce((sum, purchase) => sum + purchase.negotiation.finalPrice, 0);
  const totalSavings = filteredAndSortedPurchases.reduce((sum, purchase) => sum + purchase.savings, 0);
  const averageRating = filteredAndSortedPurchases.filter(p => p.review).reduce((sum, p) => sum + (p.review?.rating || 0), 0) / filteredAndSortedPurchases.filter(p => p.review).length || 0;

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <BlurCard key={i} className="p-6 animate-pulse">
              <div className="h-16 bg-white/10 rounded"></div>
            </BlurCard>
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <BlurCard key={i} className="p-6 animate-pulse">
              <div className="h-24 bg-white/10 rounded"></div>
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
            Purchase History
          </h1>
          <p className="text-white/70">
            {filteredAndSortedPurchases.length} {filteredAndSortedPurchases.length === 1 ? 'purchase' : 'purchases'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ModernButton variant="secondary" size="sm">
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            Export
          </ModernButton>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <BlurCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <ShoppingBagIcon className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">
              {filteredAndSortedPurchases.length}
            </span>
          </div>
          <div className="text-white/70 text-sm">Total Purchases</div>
        </BlurCard>

        <BlurCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <CurrencyDollarIcon className="w-8 h-8 text-green-400" />
            <span className="text-2xl font-bold text-white">
              {formatCurrency(totalSpent)}
            </span>
          </div>
          <div className="text-white/70 text-sm">Total Spent</div>
        </BlurCard>

        <BlurCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <CurrencyDollarIcon className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">
              {formatCurrency(totalSavings)}
            </span>
          </div>
          <div className="text-white/70 text-sm">Total Saved</div>
        </BlurCard>

        <BlurCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <StarIcon className="w-8 h-8 text-yellow-400" />
            <span className="text-2xl font-bold text-white">
              {averageRating.toFixed(1)}
            </span>
          </div>
          <div className="text-white/70 text-sm">Avg Rating Given</div>
        </BlurCard>
      </div>

      {/* Filters */}
      <BlurCard className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
            <input
              type="text"
              placeholder="Search purchases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>

          {/* Date Range */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="all">All Time</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-high">Price: High to Low</option>
            <option value="price-low">Price: Low to High</option>
            <option value="savings">Most Savings</option>
          </select>
        </div>
      </BlurCard>

      {/* Purchase List */}
      {filteredAndSortedPurchases.length === 0 ? (
        <BlurCard className="p-12 text-center">
          <ShoppingBagIcon className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No purchases found
          </h3>
          <p className="text-white/60">
            {searchQuery || statusFilter !== 'all' || dateRange !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Start browsing products to make your first purchase'
            }
          </p>
        </BlurCard>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedPurchases.map((purchase, index) => (
            <motion.div
              key={purchase._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <BlurCard className="p-6 hover:bg-white/5 transition-colors">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Product Image */}
                  <div className="w-full lg:w-24 h-24 relative rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                    <Image
                      src={purchase.negotiation.product.images[0]?.url || '/api/placeholder/96/96'}
                      alt={purchase.negotiation.product.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Purchase Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {purchase.negotiation.product.title}
                        </h3>
                        <div className="flex items-center space-x-3 text-sm text-white/70">
                          <span>Sold by {purchase.negotiation.product.seller.username}</span>
                          <span>•</span>
                          <span>{purchase.negotiation.product.category}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xl font-bold text-white">
                          {formatCurrency(purchase.negotiation.finalPrice)}
                        </div>
                        <div className="text-sm text-white/60 line-through">
                          {formatCurrency(purchase.negotiation.originalPrice)}
                        </div>
                        <div className="text-sm text-green-400">
                          Saved {formatCurrency(purchase.savings)} ({purchase.savingsPercentage.toFixed(1)}%)
                        </div>
                      </div>
                    </div>

                    {/* Status and Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-white/60">Status:</span>
                        <ModernBadge 
                          variant={purchase.negotiation.status === 'completed' ? 'success' : 'secondary'}
                          size="sm"
                        >
                          {purchase.negotiation.status}
                        </ModernBadge>
                      </div>

                      {purchase.negotiation.deliveryStatus && (
                        <div className="flex items-center space-x-2">
                          <span className="text-white/60">Delivery:</span>
                          <ModernBadge 
                            variant={purchase.negotiation.deliveryStatus === 'delivered' ? 'success' : 'secondary'}
                            size="sm"
                          >
                            {purchase.negotiation.deliveryStatus}
                          </ModernBadge>
                        </div>
                      )}

                      <div className="flex items-center space-x-1 text-white/60">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{formatDate(purchase.negotiation.completedAt)}</span>
                      </div>

                      <div className="flex items-center space-x-1 text-white/60">
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                        <span>{purchase.negotiation.negotiationRounds} rounds</span>
                      </div>
                    </div>

                    {/* Transaction Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                      <span>Transaction ID: {purchase.transaction.transactionId}</span>
                      <span>•</span>
                      <span>Paid via {purchase.transaction.paymentMethod}</span>
                      {purchase.negotiation.trackingNumber && (
                        <>
                          <span>•</span>
                          <span>Tracking: {purchase.negotiation.trackingNumber}</span>
                        </>
                      )}
                    </div>

                    {/* Review */}
                    {purchase.review && (
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm text-white/70">Your Review:</span>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`w-4 h-4 ${
                                  i < purchase.review!.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-white/30'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-white/80">{purchase.review.comment}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2 lg:w-32">
                    <Link href={`/products/${purchase.negotiation.product._id}`}>
                      <ModernButton variant="primary" size="sm" className="w-full">
                        <EyeIcon className="w-4 h-4 mr-2" />
                        View Product
                      </ModernButton>
                    </Link>
                    <ModernButton 
                      variant="secondary" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSelectedPurchase(purchase)}
                    >
                      <DocumentTextIcon className="w-4 h-4 mr-2" />
                      Details
                    </ModernButton>
                  </div>
                </div>
              </BlurCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Purchase Detail Modal */}
      {selectedPurchase && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPurchase(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Purchase Details</h2>
              <button
                onClick={() => setSelectedPurchase(null)}
                className="text-white/60 hover:text-white p-2"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Product Info */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Product Information</h3>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-white/10">
                      <Image
                        src={selectedPurchase.negotiation.product.images[0]?.url || '/api/placeholder/80/80'}
                        alt={selectedPurchase.negotiation.product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">
                        {selectedPurchase.negotiation.product.title}
                      </h4>
                      <p className="text-white/70 text-sm mb-2">
                        {selectedPurchase.negotiation.product.description}
                      </p>
                      <div className="text-sm text-white/60">
                        Category: {selectedPurchase.negotiation.product.category}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Details */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Pricing Details</h3>
                <div className="bg-white/5 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/70">Original Price:</span>
                    <span className="text-white line-through">
                      {formatCurrency(selectedPurchase.negotiation.originalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Final Price:</span>
                    <span className="text-white font-semibold">
                      {formatCurrency(selectedPurchase.negotiation.finalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Transaction Fees:</span>
                    <span className="text-white">
                      {formatCurrency(selectedPurchase.transaction.fees)}
                    </span>
                  </div>
                  <div className="border-t border-white/20 pt-3">
                    <div className="flex justify-between text-green-400">
                      <span className="font-medium">You Saved:</span>
                      <span className="font-bold">
                        {formatCurrency(selectedPurchase.savings)} ({selectedPurchase.savingsPercentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Transaction Details</h3>
                <div className="bg-white/5 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/70">Transaction ID:</span>
                    <span className="text-white font-mono text-sm">
                      {selectedPurchase.transaction.transactionId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Payment Method:</span>
                    <span className="text-white">
                      {selectedPurchase.transaction.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Processed At:</span>
                    <span className="text-white">
                      {formatDate(selectedPurchase.transaction.processedAt)}
                    </span>
                  </div>
                  {selectedPurchase.negotiation.trackingNumber && (
                    <div className="flex justify-between">
                      <span className="text-white/70">Tracking Number:</span>
                      <span className="text-white font-mono text-sm">
                        {selectedPurchase.negotiation.trackingNumber}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Negotiation Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Negotiation Timeline</h3>
                <div className="bg-white/5 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/70">Started:</span>
                    <span className="text-white">
                      {formatDate(selectedPurchase.negotiation.startedAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Completed:</span>
                    <span className="text-white">
                      {formatDate(selectedPurchase.negotiation.completedAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Negotiation Rounds:</span>
                    <span className="text-white">
                      {selectedPurchase.negotiation.negotiationRounds}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
