import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  UsersIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserPlusIcon,
  HeartIcon,
  ShoppingBagIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  EyeIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { BlurCard } from '../ui/BlurCard';
import { ModernButton } from '../ui/ModernButton';
import { ModernBadge } from '../ui/ModernBadge';
import { BackdropBlur } from '../ui/BackdropBlur';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

interface Customer {
  _id: string;
  buyer: {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
    profile?: {
      rating: number;
      totalReviews: number;
      joinedDate: string;
      verificationStatus: boolean;
      location?: {
        city?: string;
        state?: string;
        country?: string;
      };
    };
  };
  relationship: {
    firstContactDate: string;
    lastInteractionDate: string;
    totalNegotiations: number;
    completedPurchases: number;
    totalSpent: number;
    averageNegotiationTime: number;
    successRate: number;
    favoriteCategories: string[];
    communicationPreference: 'email' | 'chat' | 'phone';
    responseRate: number;
    avgResponseTime: number; // in minutes
    trustScore: number;
  };
  currentNegotiations: Array<{
    _id: string;
    product: {
      _id: string;
      title: string;
      pricing: { basePrice: number };
      images: Array<{ url: string }>;
    };
    currentOffer: number;
    status: string;
    lastActivity: string;
    roundsCompleted: number;
  }>;
  purchaseHistory: Array<{
    _id: string;
    product: {
      title: string;
      category: string;
    };
    finalPrice: number;
    purchaseDate: string;
    rating?: number;
    review?: string;
  }>;
  notes: Array<{
    _id: string;
    content: string;
    createdAt: string;
    type: 'general' | 'preference' | 'issue' | 'reminder';
  }>;
}

interface CustomerManagementProps {
  className?: string;
}

export const CustomerManagement: React.FC<CustomerManagementProps> = ({
  className = ""
}) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'purchases' | 'value' | 'activity'>('recent');
  const [filterBy, setFilterBy] = useState<'all' | 'active' | 'recent' | 'vip'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState({ content: '', type: 'general' as const });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockCustomers: Customer[] = [
        {
          _id: 'cust1',
          buyer: {
            _id: 'buyer1',
            username: 'TechEnthusiast92',
            email: 'tech.lover@email.com',
            avatar: '/api/placeholder/40/40',
            profile: {
              rating: 4.8,
              totalReviews: 23,
              joinedDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
              verificationStatus: true,
              location: {
                city: 'San Francisco',
                state: 'CA',
                country: 'USA'
              }
            }
          },
          relationship: {
            firstContactDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
            lastInteractionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            totalNegotiations: 8,
            completedPurchases: 5,
            totalSpent: 2450,
            averageNegotiationTime: 3.5,
            successRate: 62.5,
            favoriteCategories: ['Electronics', 'Gaming'],
            communicationPreference: 'chat',
            responseRate: 95,
            avgResponseTime: 15,
            trustScore: 85
          },
          currentNegotiations: [
            {
              _id: 'neg1',
              product: {
                _id: 'prod1',
                title: 'MacBook Pro 16"',
                pricing: { basePrice: 1899 },
                images: [{ url: '/api/placeholder/100/100' }]
              },
              currentOffer: 1650,
              status: 'active',
              lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              roundsCompleted: 3
            }
          ],
          purchaseHistory: [
            {
              _id: 'purchase1',
              product: {
                title: 'iPhone 13 Pro',
                category: 'Electronics'
              },
              finalPrice: 750,
              purchaseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              rating: 5,
              review: 'Excellent seller, fast shipping!'
            },
            {
              _id: 'purchase2',
              product: {
                title: 'Gaming Mouse',
                category: 'Gaming'
              },
              finalPrice: 65,
              purchaseDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
              rating: 4
            }
          ],
          notes: [
            {
              _id: 'note1',
              content: 'Prefers quick negotiations, very responsive customer',
              createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              type: 'preference'
            }
          ]
        },
        {
          _id: 'cust2',
          buyer: {
            _id: 'buyer2',
            username: 'FashionLover',
            email: 'fashion@email.com',
            profile: {
              rating: 4.6,
              totalReviews: 15,
              joinedDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
              verificationStatus: false,
              location: {
                city: 'New York',
                state: 'NY',
                country: 'USA'
              }
            }
          },
          relationship: {
            firstContactDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
            lastInteractionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            totalNegotiations: 4,
            completedPurchases: 3,
            totalSpent: 890,
            averageNegotiationTime: 2.8,
            successRate: 75,
            favoriteCategories: ['Fashion', 'Accessories'],
            communicationPreference: 'email',
            responseRate: 88,
            avgResponseTime: 45,
            trustScore: 78
          },
          currentNegotiations: [],
          purchaseHistory: [
            {
              _id: 'purchase3',
              product: {
                title: 'Designer Handbag',
                category: 'Fashion'
              },
              finalPrice: 420,
              purchaseDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
              rating: 5,
              review: 'Beautiful bag, exactly as described'
            }
          ],
          notes: []
        },
        {
          _id: 'cust3',
          buyer: {
            _id: 'buyer3',
            username: 'HomeDecorFan',
            email: 'homedecor@email.com',
            profile: {
              rating: 4.9,
              totalReviews: 31,
              joinedDate: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
              verificationStatus: true,
              location: {
                city: 'Austin',
                state: 'TX',
                country: 'USA'
              }
            }
          },
          relationship: {
            firstContactDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            lastInteractionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            totalNegotiations: 12,
            completedPurchases: 9,
            totalSpent: 3200,
            averageNegotiationTime: 4.2,
            successRate: 75,
            favoriteCategories: ['Home & Garden', 'Furniture'],
            communicationPreference: 'chat',
            responseRate: 92,
            avgResponseTime: 25,
            trustScore: 92
          },
          currentNegotiations: [
            {
              _id: 'neg2',
              product: {
                _id: 'prod2',
                title: 'Vintage Coffee Table',
                pricing: { basePrice: 380 },
                images: [{ url: '/api/placeholder/100/100' }]
              },
              currentOffer: 320,
              status: 'active',
              lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
              roundsCompleted: 2
            }
          ],
          purchaseHistory: [
            {
              _id: 'purchase4',
              product: {
                title: 'Vintage Lamp',
                category: 'Home & Garden'
              },
              finalPrice: 150,
              purchaseDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
              rating: 5
            }
          ],
          notes: [
            {
              _id: 'note2',
              content: 'VIP customer - always pays promptly and leaves great reviews',
              createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              type: 'general'
            }
          ]
        }
      ];
      setCustomers(mockCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedCustomers = React.useMemo(() => {
    let filtered = customers.filter(customer => {
      const matchesSearch = customer.buyer.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          customer.buyer.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesFilter = true;
      switch (filterBy) {
        case 'active':
          matchesFilter = customer.currentNegotiations.length > 0;
          break;
        case 'recent':
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          matchesFilter = new Date(customer.relationship.lastInteractionDate) >= weekAgo;
          break;
        case 'vip':
          matchesFilter = customer.relationship.totalSpent > 1000 || customer.relationship.trustScore > 85;
          break;
      }
      
      return matchesSearch && matchesFilter;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.relationship.lastInteractionDate).getTime() - new Date(a.relationship.lastInteractionDate).getTime();
        case 'purchases':
          return b.relationship.completedPurchases - a.relationship.completedPurchases;
        case 'value':
          return b.relationship.totalSpent - a.relationship.totalSpent;
        case 'activity':
          return b.relationship.totalNegotiations - a.relationship.totalNegotiations;
        default:
          return 0;
      }
    });
  }, [customers, searchQuery, sortBy, filterBy]);

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
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffDays === 0) {
      if (diffHours === 0) return 'Less than an hour ago';
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const addNote = async () => {
    if (!selectedCustomer || !newNote.content.trim()) return;
    
    try {
      const note = {
        _id: `note_${Date.now()}`,
        content: newNote.content,
        createdAt: new Date().toISOString(),
        type: newNote.type
      };
      
      // Update local state
      setCustomers(prev => prev.map(customer => 
        customer._id === selectedCustomer._id 
          ? { ...customer, notes: [note, ...customer.notes] }
          : customer
      ));
      
      setSelectedCustomer(prev => prev ? { ...prev, notes: [note, ...prev.notes] } : null);
      setNewNote({ content: '', type: 'general' });
      setShowAddNote(false);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const totalCustomers = customers.length;
  const activeNegotiations = customers.reduce((sum, c) => sum + c.currentNegotiations.length, 0);
  const totalRevenue = customers.reduce((sum, c) => sum + c.relationship.totalSpent, 0);
  const avgCustomerValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <BlurCard key={i} className="p-6 animate-pulse">
              <div className="h-16 bg-white/10 rounded"></div>
            </BlurCard>
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <BlurCard key={i} className="p-6 animate-pulse">
              <div className="h-20 bg-white/10 rounded"></div>
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
            Customer Management
          </h1>
          <p className="text-white/70">
            Manage relationships with your buyers and track customer insights
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <BlurCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <UsersIcon className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">
              {totalCustomers}
            </span>
          </div>
          <div className="text-white/70 text-sm">Total Customers</div>
        </BlurCard>

        <BlurCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-green-400" />
            <span className="text-2xl font-bold text-white">
              {activeNegotiations}
            </span>
          </div>
          <div className="text-white/70 text-sm">Active Negotiations</div>
        </BlurCard>

        <BlurCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <CurrencyDollarIcon className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">
              {formatCurrency(totalRevenue)}
            </span>
          </div>
          <div className="text-white/70 text-sm">Total Revenue</div>
        </BlurCard>

        <BlurCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <ChartBarIcon className="w-8 h-8 text-yellow-400" />
            <span className="text-2xl font-bold text-white">
              {formatCurrency(avgCustomerValue)}
            </span>
          </div>
          <div className="text-white/70 text-sm">Avg Customer Value</div>
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
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-white/60" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="all">All Customers</option>
              <option value="active">Active Negotiations</option>
              <option value="recent">Recent Activity</option>
              <option value="vip">VIP Customers</option>
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="recent">Recent Activity</option>
            <option value="purchases">Most Purchases</option>
            <option value="value">Highest Value</option>
            <option value="activity">Most Active</option>
          </select>
        </div>
      </BlurCard>

      {/* Customer List */}
      {filteredAndSortedCustomers.length === 0 ? (
        <BlurCard className="p-12 text-center">
          <UsersIcon className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No customers found
          </h3>
          <p className="text-white/60">
            {searchQuery || filterBy !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Start selling products to build your customer base'
            }
          </p>
        </BlurCard>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedCustomers.map((customer, index) => (
            <motion.div
              key={customer._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <BlurCard className="p-6 hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => setSelectedCustomer(customer)}
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Customer Avatar & Basic Info */}
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                      {customer.buyer.avatar ? (
                        <Image
                          src={customer.buyer.avatar}
                          alt={customer.buyer.username}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xl font-semibold text-white/60">
                            {customer.buyer.username[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">
                          {customer.buyer.username}
                        </h3>
                        {customer.buyer.profile?.verificationStatus && (
                          <ModernBadge variant="success" size="sm">
                            Verified
                          </ModernBadge>
                        )}
                        {customer.relationship.totalSpent > 1000 && (
                          <ModernBadge variant="warning" size="sm">
                            VIP
                          </ModernBadge>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-white/70 mb-2">
                        <span>{customer.buyer.email}</span>
                        {customer.buyer.profile?.location && (
                          <span>
                            {customer.buyer.profile.location.city}, {customer.buyer.profile.location.state}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-sm">
                        {customer.buyer.profile?.rating && (
                          <div className="flex items-center space-x-1">
                            <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-white/70">
                              {customer.buyer.profile.rating.toFixed(1)} ({customer.buyer.profile.totalReviews})
                            </span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <span className="text-white/60">Trust Score:</span>
                          <span className={`font-medium ${getTrustScoreColor(customer.relationship.trustScore)}`}>
                            {customer.relationship.trustScore}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Relationship Stats */}
                  <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">
                        {customer.relationship.completedPurchases}
                      </div>
                      <div className="text-xs text-white/60">Purchases</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">
                        {formatCurrency(customer.relationship.totalSpent)}
                      </div>
                      <div className="text-xs text-white/60">Total Spent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">
                        {customer.relationship.successRate.toFixed(0)}%
                      </div>
                      <div className="text-xs text-white/60">Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">
                        {customer.currentNegotiations.length}
                      </div>
                      <div className="text-xs text-white/60">Active Chats</div>
                    </div>
                  </div>

                  {/* Last Activity */}
                  <div className="text-right">
                    <div className="text-sm text-white/60 mb-1">Last seen</div>
                    <div className="text-sm text-white">
                      {formatTimeAgo(customer.relationship.lastInteractionDate)}
                    </div>
                    {customer.currentNegotiations.length > 0 && (
                      <ModernBadge variant="info" size="sm" className="mt-2">
                        Active
                      </ModernBadge>
                    )}
                  </div>
                </div>
              </BlurCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCustomer(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10">
                  {selectedCustomer.buyer.avatar ? (
                    <Image
                      src={selectedCustomer.buyer.avatar}
                      alt={selectedCustomer.buyer.username}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-white/60">
                        {selectedCustomer.buyer.username[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedCustomer.buyer.username}
                  </h2>
                  <p className="text-white/70">{selectedCustomer.buyer.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-white/60 hover:text-white p-2"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Customer Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Current Negotiations */}
                {selectedCustomer.currentNegotiations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Active Negotiations ({selectedCustomer.currentNegotiations.length})
                    </h3>
                    <div className="space-y-3">
                      {selectedCustomer.currentNegotiations.map((negotiation) => (
                        <div key={negotiation._id} className="bg-white/5 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-white font-medium">{negotiation.product.title}</h4>
                              <div className="text-sm text-white/70">
                                Current offer: {formatCurrency(negotiation.currentOffer)} 
                                (Base: {formatCurrency(negotiation.product.pricing.basePrice)})
                              </div>
                            </div>
                            <ModernBadge variant="info" size="sm">
                              Round {negotiation.roundsCompleted}
                            </ModernBadge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Purchase History */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Purchase History ({selectedCustomer.purchaseHistory.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedCustomer.purchaseHistory.map((purchase) => (
                      <div key={purchase._id} className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-medium">{purchase.product.title}</h4>
                          <span className="text-white font-semibold">
                            {formatCurrency(purchase.finalPrice)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/70">{purchase.product.category}</span>
                          <span className="text-white/70">
                            {new Date(purchase.purchaseDate).toLocaleDateString()}
                          </span>
                        </div>
                        {purchase.rating && (
                          <div className="flex items-center space-x-2 mt-2">
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < purchase.rating!
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-white/30'
                                  }`}
                                />
                              ))}
                            </div>
                            {purchase.review && (
                              <span className="text-sm text-white/70">&ldquo;{purchase.review}&rdquo;</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Notes ({selectedCustomer.notes.length})
                    </h3>
                    <ModernButton
                      variant="primary"
                      size="sm"
                      onClick={() => setShowAddNote(true)}
                    >
                      Add Note
                    </ModernButton>
                  </div>

                  {showAddNote && (
                    <div className="bg-white/5 rounded-lg p-4 mb-4">
                      <textarea
                        value={newNote.content}
                        onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Add a note about this customer..."
                        className="w-full h-20 bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/60 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                      <div className="flex items-center justify-between mt-3">
                        <select
                          value={newNote.type}
                          onChange={(e) => setNewNote(prev => ({ ...prev, type: e.target.value as any }))}
                          className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm"
                        >
                          <option value="general">General</option>
                          <option value="preference">Preference</option>
                          <option value="issue">Issue</option>
                          <option value="reminder">Reminder</option>
                        </select>
                        <div className="flex space-x-2">
                          <ModernButton
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowAddNote(false);
                              setNewNote({ content: '', type: 'general' });
                            }}
                          >
                            Cancel
                          </ModernButton>
                          <ModernButton
                            variant="primary"
                            size="sm"
                            onClick={addNote}
                            disabled={!newNote.content.trim()}
                          >
                            Save Note
                          </ModernButton>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {selectedCustomer.notes.map((note) => (
                      <div key={note._id} className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <ModernBadge variant="secondary" size="sm">
                            {note.type}
                          </ModernBadge>
                          <span className="text-xs text-white/60">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-white/80">{note.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Customer Stats Sidebar */}
              <div className="space-y-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Customer Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/70">Member since:</span>
                      <span className="text-white">
                        {selectedCustomer.buyer.profile?.joinedDate 
                          ? new Date(selectedCustomer.buyer.profile.joinedDate).toLocaleDateString()
                          : 'Unknown'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Total negotiations:</span>
                      <span className="text-white">{selectedCustomer.relationship.totalNegotiations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Success rate:</span>
                      <span className="text-green-400">{selectedCustomer.relationship.successRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Avg negotiation time:</span>
                      <span className="text-white">{selectedCustomer.relationship.averageNegotiationTime.toFixed(1)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Response rate:</span>
                      <span className="text-white">{selectedCustomer.relationship.responseRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Avg response time:</span>
                      <span className="text-white">{selectedCustomer.relationship.avgResponseTime}min</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Preferences</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-white/70 text-sm block mb-1">Favorite Categories:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedCustomer.relationship.favoriteCategories.map((category) => (
                          <ModernBadge key={category} variant="info" size="sm">
                            {category}
                          </ModernBadge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-white/70 text-sm block mb-1">Communication:</span>
                      <ModernBadge variant="secondary" size="sm">
                        {selectedCustomer.relationship.communicationPreference}
                      </ModernBadge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <ModernButton variant="primary" className="w-full">
                    <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                    Send Message
                  </ModernButton>
                  <ModernButton variant="secondary" className="w-full">
                    <EnvelopeIcon className="w-4 h-4 mr-2" />
                    Send Email
                  </ModernButton>
                  <ModernButton variant="outline" className="w-full">
                    <EyeIcon className="w-4 h-4 mr-2" />
                    View Profile
                  </ModernButton>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
