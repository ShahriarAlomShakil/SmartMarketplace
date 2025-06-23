import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { productAPI } from '../../utils/api';
import { BackdropBlur } from '../ui/BackdropBlur';
import { ModernButton } from '../ui/ModernButton';
import { 
  SparklesIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  TagIcon,
  EyeIcon,
  HeartIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface ProductRecommendation {
  type: 'pricing' | 'promotion' | 'optimization' | 'market';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action?: string;
  impact?: string;
  data?: any;
}

interface ProductRecommendationsProps {
  productId: string;
  onClose?: () => void;
}

export const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  productId,
  onClose
}) => {
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    generateRecommendations();
  }, [productId]);

  const generateRecommendations = async () => {
    try {
      setLoading(true);
      
      // Fetch product details
      const productResponse = await productAPI.getById(productId);
      const currentProduct = productResponse.data.product;
      setProduct(currentProduct);

      // Fetch similar products for market analysis
      const similarResponse = await productAPI.getSimilar(productId);
      const similarProducts = similarResponse.data.products;

      // Generate recommendations based on analytics
      const recs: ProductRecommendation[] = [];

      // Pricing recommendations
      if (similarProducts.length > 0) {
        const avgPrice = similarProducts.reduce((sum: number, p: any) => sum + p.pricing.basePrice, 0) / similarProducts.length;
        const priceDiff = ((currentProduct.pricing.basePrice - avgPrice) / avgPrice) * 100;

        if (priceDiff > 20) {
          recs.push({
            type: 'pricing',
            priority: 'high',
            title: 'Consider Price Adjustment',
            description: `Your product is priced ${priceDiff.toFixed(0)}% higher than similar items. Consider lowering the price to increase visibility.`,
            action: `Recommended price: $${(avgPrice * 1.1).toFixed(0)}`,
            impact: 'Could increase views by 30-50%',
            data: { suggestedPrice: avgPrice * 1.1, currentPrice: currentProduct.pricing.basePrice }
          });
        } else if (priceDiff < -15) {
          recs.push({
            type: 'pricing',
            priority: 'medium',
            title: 'Potential for Price Increase',
            description: `Your product is priced ${Math.abs(priceDiff).toFixed(0)}% lower than similar items. You might be able to increase the price.`,
            action: `Consider pricing at: $${(avgPrice * 0.95).toFixed(0)}`,
            impact: 'Could increase revenue without affecting demand',
            data: { suggestedPrice: avgPrice * 0.95, currentPrice: currentProduct.pricing.basePrice }
          });
        }
      }

      // View-based recommendations
      const daysSinceListed = Math.floor((Date.now() - new Date(currentProduct.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      const viewsPerDay = currentProduct.analytics.views / Math.max(daysSinceListed, 1);

      if (viewsPerDay < 2 && daysSinceListed > 3) {
        recs.push({
          type: 'promotion',
          priority: 'high',
          title: 'Low Visibility Detected',
          description: 'Your product is receiving fewer views than expected. Consider improving the listing.',
          action: 'Update images, title, or description',
          impact: 'Could double your daily views',
          data: { currentViewsPerDay: viewsPerDay, targetViewsPerDay: 5 }
        });
      }

      // Description optimization
      if (currentProduct.description.length < 100) {
        recs.push({
          type: 'optimization',
          priority: 'medium',
          title: 'Expand Product Description',
          description: 'Longer, detailed descriptions perform better in search and build buyer confidence.',
          action: 'Add at least 100 more characters to your description',
          impact: 'Could improve search ranking and conversion rate',
          data: { currentLength: currentProduct.description.length, targetLength: 200 }
        });
      }

      // Image recommendations
      if (currentProduct.images.length < 3) {
        recs.push({
          type: 'optimization',
          priority: 'high',
          title: 'Add More Images',
          description: 'Products with 3+ images receive significantly more views and inquiries.',
          action: `Add ${3 - currentProduct.images.length} more high-quality images`,
          impact: 'Could increase inquiries by 40%',
          data: { currentImages: currentProduct.images.length, targetImages: 5 }
        });
      }

      // Tag optimization
      if (currentProduct.tags.length < 3) {
        recs.push({
          type: 'optimization',
          priority: 'medium',
          title: 'Add Relevant Tags',
          description: 'Tags help buyers find your product through search. Add relevant keywords.',
          action: `Add ${3 - currentProduct.tags.length} more descriptive tags`,
          impact: 'Improves search discoverability',
          data: { currentTags: currentProduct.tags.length, suggestedTags: ['vintage', 'premium', 'rare'] }
        });
      }

      // Market timing recommendations
      const currentHour = new Date().getHours();
      if (currentProduct.analytics.views > 0) {
        recs.push({
          type: 'market',
          priority: 'low',
          title: 'Optimal Posting Time',
          description: 'Consider reposting or promoting during peak hours (6-9 PM) for maximum visibility.',
          action: 'Schedule promotions for evening hours',
          impact: 'Could increase immediate visibility',
          data: { peakHours: '6-9 PM', currentTime: `${currentHour}:00` }
        });
      }

      // Negotiation strategy
      if (currentProduct.analytics.negotiations > 0) {
        const negotiationRate = (currentProduct.analytics.negotiations / currentProduct.analytics.views) * 100;
        if (negotiationRate > 10) {
          recs.push({
            type: 'pricing',
            priority: 'medium',
            title: 'High Negotiation Interest',
            description: `${negotiationRate.toFixed(0)}% of viewers are starting negotiations. This indicates strong interest but possible price resistance.`,
            action: 'Consider slight price reduction or highlight value propositions',
            impact: 'Could convert more negotiations to sales',
            data: { negotiationRate, avgNegotiations: currentProduct.analytics.negotiations }
          });
        }
      }

      setRecommendations(recs);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/20 border-red-400/30';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'low': return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pricing': return <CurrencyDollarIcon className="w-5 h-5" />;
      case 'promotion': return <ArrowTrendingUpIcon className="w-5 h-5" />;
      case 'optimization': return <SparklesIcon className="w-5 h-5" />;
      case 'market': return <ClockIcon className="w-5 h-5" />;
      default: return <SparklesIcon className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <BackdropBlur className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4 text-center">Analyzing your product...</p>
        </div>
      </BackdropBlur>
    );
  }

  return (
    <BackdropBlur className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <SparklesIcon className="w-6 h-6 text-yellow-400" />
                Smart Recommendations
              </h2>
              {product && (
                <p className="text-white/70 mt-1">For: {product.title}</p>
              )}
            </div>
            <ModernButton variant="secondary" onClick={onClose}>
              Close
            </ModernButton>
          </div>

          {/* Product Summary */}
          {product && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-white mb-1">
                    <EyeIcon className="w-4 h-4" />
                    <span className="text-2xl font-bold">{product.analytics.views}</span>
                  </div>
                  <div className="text-white/60 text-sm">Views</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-white mb-1">
                    <HeartIcon className="w-4 h-4" />
                    <span className="text-2xl font-bold">{product.analytics.favorites}</span>
                  </div>
                  <div className="text-white/60 text-sm">Favorites</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-white mb-1">
                    <CurrencyDollarIcon className="w-4 h-4" />
                    <span className="text-2xl font-bold">${product.pricing.basePrice}</span>
                  </div>
                  <div className="text-white/60 text-sm">Price</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-white mb-1">
                    <ClockIcon className="w-4 h-4" />
                    <span className="text-2xl font-bold">
                      {Math.floor((Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                    </span>
                  </div>
                  <div className="text-white/60 text-sm">Days Listed</div>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 rounded-xl p-4 border border-white/10"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-lg ${getPriorityColor(rec.priority)}`}>
                        {getTypeIcon(rec.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-white font-semibold">{rec.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(rec.priority)}`}>
                          {rec.priority} priority
                        </span>
                      </div>
                      
                      <p className="text-white/80 mb-3">{rec.description}</p>
                      
                      {rec.action && (
                        <div className="bg-white/5 rounded-lg p-3 mb-2">
                          <div className="text-white font-medium text-sm">Action:</div>
                          <div className="text-white/80 text-sm">{rec.action}</div>
                        </div>
                      )}
                      
                      {rec.impact && (
                        <div className="text-green-400 text-sm font-medium">
                          Expected Impact: {rec.impact}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <SparklesIcon className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Great Job!
              </h3>
              <p className="text-white/70">
                Your product listing is already well-optimized. Keep monitoring your analytics for new opportunities.
              </p>
            </div>
          )}

          {/* General Tips */}
          <div className="mt-8 bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-yellow-400" />
              General Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="text-white/80">
                • Update your listing regularly to maintain freshness
                • Respond quickly to inquiries and negotiations
                • Use high-quality, well-lit photos from multiple angles
              </div>
              <div className="text-white/80">
                • Write detailed, honest descriptions
                • Research competitor pricing regularly
                • Consider seasonal trends in your category
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </BackdropBlur>
  );
};
