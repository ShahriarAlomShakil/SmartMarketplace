import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { BackdropBlur } from '../ui/BackdropBlur';
import { ModernButton } from '../ui/ModernButton';
import { EyeIcon } from '@heroicons/react/24/outline';

/**
 * RelatedProducts Component - Display similar/related products
 * 
 * Features:
 * - Grid layout of related products
 * - Hover effects and interactions
 * - Modern blur design
 * - Click navigation to product detail
 */

interface Product {
  _id: string;
  title: string;
  images: Array<{
    url: string;
    isPrimary: boolean;
  }>;
  pricing: {
    basePrice: number;
    negotiable: boolean;
  };
  condition: string;
  analytics: {
    views: number;
  };
}

interface RelatedProductsProps {
  products: Product[];
  category: string;
  currentProductId: string;
  className?: string;
}

export const RelatedProducts: React.FC<RelatedProductsProps> = ({
  products,
  category,
  currentProductId,
  className = ''
}) => {
  const router = useRouter();

  // Filter out current product and limit to 4
  const filteredProducts = products
    .filter(product => product._id !== currentProductId)
    .slice(0, 4);

  if (filteredProducts.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <BackdropBlur className="p-6 rounded-2xl border border-white/20 dark:border-gray-700/50">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Similar Products
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="group cursor-pointer"
              onClick={() => router.push(`/products/${product._id}`)}
            >
              <BackdropBlur className="p-4 rounded-xl border border-white/20 dark:border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 group-hover:transform group-hover:scale-105">
                {/* Product Image */}
                <div className="aspect-square relative rounded-lg overflow-hidden mb-3">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={`http://localhost:5000${product.images[0].url}`}
                      alt={product.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <EyeIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {product.title}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ${product.pricing.basePrice.toFixed(2)}
                    </span>
                    {product.pricing.negotiable && (
                      <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                        Negotiable
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{product.condition}</span>
                    <span>{product.analytics.views} views</span>
                  </div>
                </div>
              </BackdropBlur>
            </div>
          ))}
        </div>

        {products.length > 4 && (
          <div className="mt-6 text-center">
            <ModernButton 
              variant="outline" 
              onClick={() => router.push(`/products?category=${category}`)}
            >
              View More in {category}
            </ModernButton>
          </div>
        )}
      </BackdropBlur>
    </div>
  );
};

export default RelatedProducts;
