import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Layout } from '../components/Layout';
import { ProductListingForm } from '../components/product/ProductListingForm';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { productAPI } from '../utils/api';

/**
 * Sell Page - Create new product listing
 * 
 * Features:
 * - Multi-step product listing form
 * - Image upload with compression
 * - Real-time validation
 * - Auto-save functionality
 * - Modern blur design
 */
const SellPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProductSubmit = async (productData: FormData) => {
    setIsSubmitting(true);
    
    try {
      console.log('Submitting product data...');
      
      // Submit to backend API using the utility
      const result = await productAPI.create(productData);

      console.log('Product created successfully:', result);

      // Success - redirect to the new product page or dashboard
      const productId = result.data?.product?._id;
      
      if (productId) {
        router.push(`/products/${productId}`);
      } else {
        router.push('/dashboard');
      }

    } catch (error) {
      console.error('Product submission error:', error);
      
      // Show error to user (you might want to use a toast notification here)
      alert(error instanceof Error ? error.message : 'Failed to create listing. Please try again.');
      
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sell Your Product - Smart Marketplace</title>
        <meta name="description" content="List your product for sale on Smart Marketplace with AI-powered negotiations" />
        <meta name="keywords" content="sell, product, listing, marketplace, AI negotiation" />
      </Head>
      
      <ProtectedRoute requireAuth={true}>
        <Layout>
          <div className="min-h-screen">
            <ProductListingForm 
              onSubmit={handleProductSubmit}
              mode="create"
            />
          </div>
        </Layout>
      </ProtectedRoute>
    </>
  );
};

export default SellPage;
