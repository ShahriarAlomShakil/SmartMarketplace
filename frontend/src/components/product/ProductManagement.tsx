import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { productAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { BackdropBlur } from '../ui/BackdropBlur';
import { ModernButton } from '../ui/ModernButton';
import { ProductEditForm } from './ProductEditForm';
import { ProductAnalytics } from './ProductAnalytics';
import { ProductExport } from './ProductExport';
import { ProductRecommendations } from './ProductRecommendations';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  StarIcon,
  DocumentArrowDownIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface Product {
  _id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  pricing: {
    basePrice: number;
    minPrice: number;
    currency: string;
  };
  images: Array<{
    url: string;
    isPrimary: boolean;
  }>;
  status: string;
  analytics: {
    views: number;
    favorites: number;
    inquiries: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProductManagementProps {
  onEditProduct?: (productId: string) => void;
  onViewProduct?: (productId: string) => void;
}

const statusColors = {
  active: 'bg-green-500/20 text-green-300 border-green-500/30',
  draft: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  sold: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  inactive: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  deleted: 'bg-red-500/20 text-red-300 border-red-500/30'
};

const statusIcons = {
  active: CheckCircleIcon,
  draft: ClockIcon,
  sold: StarIcon,
  inactive: XCircleIcon,
  deleted: TrashIcon
};

export const ProductManagement: React.FC<ProductManagementProps> = ({
  onEditProduct,
  onViewProduct
}) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [viewingAnalytics, setViewingAnalytics] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [viewingRecommendations, setViewingRecommendations] = useState<string | null>(null);

  const fetchProducts = async (page: number = 1, status: string = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?._id) {
        throw new Error('User not authenticated');
      }

      const params: any = { page, limit: 12 };
      if (status !== 'all') {
        params.status = status;
      }

      const response = await productAPI.getByUser(user._id, params);
      setProducts(response.data.products);
      setTotalPages(response.data.pagination.pages);
      setCurrentPage(response.data.pagination.current);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage, statusFilter);
  }, [user?._id, currentPage, statusFilter]);

  const handleStatusChange = async (productId: string, newStatus: string) => {
    try {
      await productAPI.updateStatus(productId, newStatus);
      fetchProducts(currentPage, statusFilter);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedProducts.length === 0) return;

    try {
      if (bulkAction === 'delete') {
        await productAPI.bulkUpdate(selectedProducts, { status: 'deleted' });
      } else {
        await productAPI.bulkUpdate(selectedProducts, { status: bulkAction });
      }
      
      setSelectedProducts([]);
      setBulkAction('');
      fetchProducts(currentPage, statusFilter);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to perform bulk action');
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p._id));
    }
  };

  if (loading && products.length === 0) {
    return (
      <BackdropBlur className="min-h-screen flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4 text-center">Loading your products...</p>
        </div>
      </BackdropBlur>
    );
  }

  if (error) {
    return (
      <BackdropBlur className="min-h-screen flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-md">
          <h2 className="text-xl font-semibold text-white mb-4">Error Loading Products</h2>
          <p className="text-white/80 mb-6">{error}</p>
          <ModernButton
            variant="primary"
            onClick={() => fetchProducts(currentPage, statusFilter)}
            className="w-full"
          >
            Retry
          </ModernButton>
        </div>
      </BackdropBlur>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Products</h1>
          <p className="text-white/60 text-sm mt-1">
            {products.length} products • Page {currentPage} of {totalPages}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 lg:w-64">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/50"
            />
          </div>
          
          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-3 py-2 text-white min-w-0"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="sold">Sold</option>
              <option value="inactive">Inactive</option>
            </select>
            
            <ModernButton
              variant="secondary"
              onClick={() => setShowExport(true)}
              className="flex items-center gap-2"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              Export
            </ModernButton>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <span className="text-white">
              {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
            </span>
            
            <div className="flex gap-3">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Select Action</option>
                <option value="active">Mark Active</option>
                <option value="inactive">Mark Inactive</option>
                <option value="delete">Delete</option>
              </select>
              
              <ModernButton
                variant="primary"
                size="sm"
                onClick={handleBulkAction}
                disabled={!bulkAction}
              >
                Apply
              </ModernButton>
              
              <ModernButton
                variant="secondary"
                size="sm"
                onClick={() => setSelectedProducts([])}
              >
                Cancel
              </ModernButton>
            </div>
          </div>
        </motion.div>
      )}

      {/* Products Grid */}
      {products.length === 0 ? (
        <BackdropBlur className="text-center py-12">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-2">No Products Found</h3>
            <p className="text-white/80 mb-6">
              {statusFilter !== 'all' 
                ? `No products with status "${statusFilter}"`
                : 'You haven\'t listed any products yet.'
              }
            </p>
            <ModernButton
              variant="primary"
              onClick={() => window.location.href = '/sell'}
            >
              Create Your First Listing
            </ModernButton>
          </div>
        </BackdropBlur>
      ) : (
        <div className="space-y-4">
          {/* Select All */}
          <div className="flex items-center gap-3 px-2">
            <input
              type="checkbox"
              checked={selectedProducts.length === products.length}
              onChange={handleSelectAll}
              className="rounded border-white/20 bg-white/10 text-blue-500"
            />
            <span className="text-white/80 text-sm">Select All</span>
          </div>

          {/* Products List */}
          <div className="grid gap-4">
            <AnimatePresence>
              {products.map((product) => {
                const StatusIcon = statusIcons[product.status as keyof typeof statusIcons];
                
                return (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 hover:bg-white/15 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => handleSelectProduct(product._id)}
                        className="rounded border-white/20 bg-white/10 text-blue-500"
                      />

                      {/* Product Image */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5">
                        {product.images.length > 0 ? (
                          <img
                            src={product.images.find(img => img.isPrimary)?.url || product.images[0]?.url}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/50">
                            <EyeIcon className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate">{product.title}</h3>
                        <p className="text-white/60 text-sm truncate">{product.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-white font-medium">
                            ${product.pricing.basePrice.toLocaleString()} {product.pricing.currency}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs border ${statusColors[product.status as keyof typeof statusColors]}`}>
                            <StatusIcon className="w-3 h-3 inline mr-1" />
                            {product.status}
                          </span>
                        </div>
                      </div>

                      {/* Analytics */}
                      <div className="hidden sm:block text-white/60 text-sm">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <EyeIcon className="w-4 h-4" />
                            {product.analytics.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <ChartBarIcon className="w-4 h-4" />
                            {product.analytics.inquiries}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <ModernButton
                          variant="secondary"
                          size="sm"
                          onClick={() => onViewProduct?.(product._id)}
                          title="View Product"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </ModernButton>
                        
                        <ModernButton
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditingProduct(product._id)}
                          title="Edit Product"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </ModernButton>

                        <ModernButton
                          variant="secondary"
                          size="sm"
                          onClick={() => setViewingAnalytics(product._id)}
                          title="View Analytics"
                        >
                          <ChartBarIcon className="w-4 h-4" />
                        </ModernButton>

                        <ModernButton
                          variant="secondary"
                          size="sm"
                          onClick={() => setViewingRecommendations(product._id)}
                          title="Get Recommendations"
                        >
                          <SparklesIcon className="w-4 h-4" />
                        </ModernButton>

                        <select
                          value={product.status}
                          onChange={(e) => handleStatusChange(product._id, e.target.value)}
                          className="bg-white/10 backdrop-blur-md border border-white/20 rounded px-2 py-1 text-white text-sm"
                          title="Change Status"
                        >
                          <option value="active">Active</option>
                          <option value="draft">Draft</option>
                          <option value="sold">Sold</option>
                          <option value="inactive">Inactive</option>
                          <option value="deleted">Delete</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <ModernButton
                variant="secondary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </ModernButton>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <ModernButton
                  key={page}
                  variant={page === currentPage ? "primary" : "secondary"}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </ModernButton>
              ))}
              
              <ModernButton
                variant="secondary"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </ModernButton>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {editingProduct && (
        <ProductEditForm
          productId={editingProduct}
          onSuccess={() => {
            setEditingProduct(null);
            fetchProducts(currentPage, statusFilter);
          }}
          onCancel={() => setEditingProduct(null)}
        />
      )}

      {viewingAnalytics && (
        <ProductAnalytics
          productId={viewingAnalytics}
          onClose={() => setViewingAnalytics(null)}
        />
      )}

      {showExport && (
        <ProductExport
          onClose={() => setShowExport(false)}
        />
      )}

      {viewingRecommendations && (
        <ProductRecommendations
          productId={viewingRecommendations}
          onClose={() => setViewingRecommendations(null)}
        />
      )}
    </div>
  );
};
