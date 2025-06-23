import React from 'react';
import { motion } from 'framer-motion';
import { BackdropBlur } from '../ui/BackdropBlur';
import { 
  EyeIcon, 
  MapPinIcon, 
  TagIcon,
  CurrencyDollarIcon,
  TruckIcon,
  BuildingStorefrontIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';

interface PreviewFormProps {
  data: {
    title: string;
    description: string;
    category: string;
    condition: string;
    brand: string;
    model: string;
    images: Array<{
      id: string;
      file: File;
      preview: string;
      isPrimary: boolean;
    }>;
    basePrice: string;
    minPrice: string;
    currency: string;
    negotiable: boolean;
    location: {
      city: string;
      state: string;
      country: string;
      zipCode: string;
      shippingAvailable: boolean;
      localPickupOnly: boolean;
    };
    tags: string[];
    urgency: {
      level: string;
      reason: string;
    };
  };
  onChange: (updates: any) => void;
  errors: any;
}

const categoryLabels: { [key: string]: string } = {
  electronics: 'Electronics',
  clothing: 'Clothing & Fashion',
  home: 'Home & Garden',
  sports: 'Sports & Recreation',
  books: 'Books & Media',
  beauty: 'Health & Beauty',
  automotive: 'Automotive',
  toys: 'Toys & Games',
  jewelry: 'Jewelry & Accessories',
  art: 'Art & Collectibles',
  music: 'Musical Instruments',
  other: 'Other'
};

const conditionLabels: { [key: string]: string } = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor'
};

const urgencyColors: { [key: string]: string } = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
};

const currencies: { [key: string]: string } = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$'
};

export const PreviewForm: React.FC<PreviewFormProps> = ({
  data,
  onChange,
  errors
}) => {
  const primaryImage = data.images.find(img => img.isPrimary) || data.images[0];
  const currencySymbol = currencies[data.currency] || '$';
  const categoryLabel = categoryLabels[data.category] || data.category;
  const conditionLabel = conditionLabels[data.condition] || data.condition;

  const getLocationString = () => {
    const parts = [];
    if (data.location.city) parts.push(data.location.city);
    if (data.location.state) parts.push(data.location.state);
    if (data.location.country) parts.push(data.location.country);
    return parts.join(', ') || 'Location not specified';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Preview Your Listing
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          This is how your listing will appear to buyers
        </p>
      </div>

      {/* Product Preview Card */}
      <BackdropBlur className="overflow-hidden rounded-2xl border border-white/20 dark:border-gray-700/50">
        <div className="md:flex">
          {/* Image Section */}
          <div className="md:w-1/2 relative">
            {primaryImage ? (
              <div className="aspect-square relative">
                <img
                  src={primaryImage.preview}
                  alt={data.title}
                  className="w-full h-full object-cover"
                />
                {data.images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    +{data.images.length - 1} more
                  </div>
                )}
                {data.urgency.level === 'urgent' && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    🔥 Urgent Sale
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <div className="text-center">
                  <EyeIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">No image uploaded</p>
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="md:w-1/2 p-6">
            <div className="space-y-4">
              {/* Title and Category */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    urgencyColors[data.urgency.level]
                  }`}>
                    {data.urgency.level.charAt(0).toUpperCase() + data.urgency.level.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {categoryLabel}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.title || 'Product Title'}
                </h1>
                {(data.brand || data.model) && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {[data.brand, data.model].filter(Boolean).join(' ')}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {currencySymbol}{parseFloat(data.basePrice || '0').toFixed(2)}
                  </span>
                  {data.negotiable && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      (negotiable)
                    </span>
                  )}
                </div>
                {data.negotiable && data.minPrice && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Minimum price: {currencySymbol}{parseFloat(data.minPrice).toFixed(2)}
                  </p>
                )}
              </div>

              {/* Condition */}
              <div className="flex items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
                  Condition:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {conditionLabel}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <MapPinIcon className="w-4 h-4 mr-2" />
                {getLocationString()}
              </div>

              {/* Delivery Options */}
              <div className="flex flex-wrap gap-2">
                {data.location.localPickupOnly && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    <BuildingStorefrontIcon className="w-3 h-3 mr-1" />
                    Local Pickup
                  </span>
                )}
                {data.location.shippingAvailable && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    <TruckIcon className="w-3 h-3 mr-1" />
                    Shipping Available
                  </span>
                )}
              </div>

              {/* Tags */}
              {data.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {data.tags.slice(0, 5).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      <TagIcon className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                  {data.tags.length > 5 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      +{data.tags.length - 5} more
                    </span>
                  )}
                </div>
              )}

              {/* Action Buttons Preview */}
              <div className="flex space-x-3 pt-4">
                <button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200">
                  <CurrencyDollarIcon className="w-4 h-4 inline mr-2" />
                  {data.negotiable ? 'Start Negotiation' : 'Buy Now'}
                </button>
                <button className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                  <EyeIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Description
          </h3>
          <div className="prose prose-sm max-w-none text-gray-600 dark:text-gray-400">
            {data.description ? (
              <p className="whitespace-pre-wrap">{data.description}</p>
            ) : (
              <p className="italic">No description provided</p>
            )}
          </div>
        </div>
      </BackdropBlur>

      {/* Listing Summary */}
      <BackdropBlur className="p-6 rounded-xl border border-white/20 dark:border-gray-700/50">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📋 Listing Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Images:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.images.length}/10
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Category:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {categoryLabel}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Condition:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {conditionLabel}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Negotiable:</span>
              <span className={`font-medium ${
                data.negotiable ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'
              }`}>
                {data.negotiable ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Base Price:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {currencySymbol}{parseFloat(data.basePrice || '0').toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Min Price:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {currencySymbol}{parseFloat(data.minPrice || '0').toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tags:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.tags.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Urgency:</span>
              <span className={`font-medium capitalize ${
                data.urgency.level === 'urgent' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
              }`}>
                {data.urgency.level}
              </span>
            </div>
          </div>
        </div>
      </BackdropBlur>

      {/* Final Checklist */}
      <BackdropBlur className="p-6 rounded-xl border border-white/20 dark:border-gray-700/50">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          ✅ Pre-listing Checklist
        </h3>
        
        <div className="space-y-3">
          <div className={`flex items-center ${data.title ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
            <div className={`w-4 h-4 rounded-full mr-3 ${data.title ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
            Clear and descriptive title
          </div>
          
          <div className={`flex items-center ${data.description ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
            <div className={`w-4 h-4 rounded-full mr-3 ${data.description ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
            Detailed description
          </div>
          
          <div className={`flex items-center ${data.images.length > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
            <div className={`w-4 h-4 rounded-full mr-3 ${data.images.length > 0 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
            At least one high-quality image
          </div>
          
          <div className={`flex items-center ${data.basePrice && data.minPrice ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
            <div className={`w-4 h-4 rounded-full mr-3 ${data.basePrice && data.minPrice ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
            Competitive pricing set
          </div>
          
          <div className={`flex items-center ${data.location.city || data.location.country ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
            <div className={`w-4 h-4 rounded-full mr-3 ${data.location.city || data.location.country ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
            Location information provided
          </div>
        </div>
      </BackdropBlur>
    </div>
  );
};
