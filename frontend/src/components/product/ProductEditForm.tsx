import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ProductListingForm } from './ProductListingForm';
import { productAPI } from '../../utils/api';
import { ModernButton } from '../ui/ModernButton';
import { BackdropBlur } from '../ui/BackdropBlur';

interface ProductEditFormProps {
  productId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ProductEditForm: React.FC<ProductEditFormProps> = ({
  productId,
  onSuccess,
  onCancel
}) => {
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productAPI.getById(productId);
        setProduct(response.data.product);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleProductUpdate = async (formData: FormData) => {
    setIsSubmitting(true);
    
    try {
      console.log('Updating product...');
      
      const result = await productAPI.update(productId, formData);
      console.log('Product updated successfully:', result);

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/products/${productId}`);
      }

    } catch (error) {
      console.error('Product update error:', error);
      alert(error instanceof Error ? error.message : 'Failed to update product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <BackdropBlur className="min-h-screen flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4 text-center">Loading product...</p>
        </div>
      </BackdropBlur>
    );
  }

  if (error) {
    return (
      <BackdropBlur className="min-h-screen flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-md">
          <h2 className="text-xl font-semibold text-white mb-4">Error Loading Product</h2>
          <p className="text-white/80 mb-6">{error}</p>
          <div className="flex gap-3">
            <ModernButton
              variant="secondary"
              onClick={() => router.back()}
              className="flex-1"
            >
              Go Back
            </ModernButton>
            <ModernButton
              variant="primary"
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Retry
            </ModernButton>
          </div>
        </div>
      </BackdropBlur>
    );
  }

  if (!product) {
    return (
      <BackdropBlur className="min-h-screen flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <p className="text-white text-center">Product not found</p>
        </div>
      </BackdropBlur>
    );
  }

  return (
    <div className="min-h-screen">
      <ProductListingForm 
        onSubmit={handleProductUpdate}
        initialData={product}
        mode="edit"
        isSubmitting={isSubmitting}
        onCancel={onCancel}
      />
    </div>
  );
};
