import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BackdropBlur } from '../ui/BackdropBlur';
import { ModernButton } from '../ui/ModernButton';
import { ExclamationTriangleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { productAPI } from '../../utils/api';

interface ProductDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  product: {
    _id: string;
    title: string;
    pricing: {
      basePrice: number;
      currency: string;
    };
    images: Array<{
      url: string;
      isPrimary: boolean;
    }>;
  } | null;
  bulkMode?: boolean;
  selectedCount?: number;
}

export const ProductDeleteModal: React.FC<ProductDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  product,
  bulkMode = false,
  selectedCount = 0
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'soft' | 'permanent'>('soft');

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      if (product) {
        if (deleteMode === 'permanent') {
          // For permanent deletion, you would call a different endpoint
          await productAPI.delete(product._id);
        } else {
          // Soft delete by updating status
          await productAPI.updateStatus(product._id, 'deleted');
        }
      }
      
      onConfirm();
    } catch (error) {
      console.error('Delete error:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <BackdropBlur className="absolute inset-0">
          <div></div>
        </BackdropBlur>
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 max-w-md w-full"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {bulkMode ? 'Delete Products' : 'Delete Product'}
              </h3>
              <p className="text-white/60 text-sm">
                {bulkMode 
                  ? `You're about to delete ${selectedCount} products`
                  : 'This action cannot be undone'
                }
              </p>
            </div>
          </div>

          {/* Product Preview (for single product) */}
          {!bulkMode && product && (
            <div className="bg-white/5 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10">
                  {product.images.length > 0 ? (
                    <img
                      src={product.images.find(img => img.isPrimary)?.url || product.images[0]?.url}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/50">
                      <TrashIcon className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate">{product.title}</h4>
                  <p className="text-white/60 text-sm">
                    ${product.pricing.basePrice.toLocaleString()} {product.pricing.currency}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Delete Options */}
          <div className="space-y-3 mb-6">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-white/20 cursor-pointer hover:bg-white/5">
              <input
                type="radio"
                name="deleteMode"
                value="soft"
                checked={deleteMode === 'soft'}
                onChange={(e) => setDeleteMode(e.target.value as 'soft' | 'permanent')}
                className="text-blue-500"
              />
              <div>
                <div className="text-white font-medium">Move to Trash</div>
                <div className="text-white/60 text-sm">
                  Hide from listings but keep data (recommended)
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-white/20 cursor-pointer hover:bg-white/5">
              <input
                type="radio"
                name="deleteMode"
                value="permanent"
                checked={deleteMode === 'permanent'}
                onChange={(e) => setDeleteMode(e.target.value as 'soft' | 'permanent')}
                className="text-blue-500"
              />
              <div>
                <div className="font-medium text-red-400">Permanent Delete</div>
                <div className="text-white/60 text-sm">
                  Completely remove all data (cannot be undone)
                </div>
              </div>
            </label>
          </div>

          {/* Warning */}
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 mb-6">
            <div className="flex items-start gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-yellow-200 text-sm">
                {deleteMode === 'permanent' ? (
                  <>
                    <strong>Warning:</strong> This will permanently delete all product data, 
                    including images, analytics, and conversation history. This action cannot be undone.
                  </>
                ) : (
                  <>
                    <strong>Note:</strong> The product will be hidden from listings but can be 
                    restored later from your trash.
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <ModernButton
              variant="secondary"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1"
            >
              Cancel
            </ModernButton>
            <ModernButton
              variant="primary"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Deleting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <TrashIcon className="w-4 h-4" />
                  {deleteMode === 'permanent' ? 'Delete Forever' : 'Move to Trash'}
                </div>
              )}
            </ModernButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
