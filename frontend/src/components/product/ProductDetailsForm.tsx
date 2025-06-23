import React from 'react';
import { motion } from 'framer-motion';
import { BackdropBlur } from '../ui/BackdropBlur';

interface ProductDetailsFormProps {
  data: {
    title: string;
    description: string;
    category: string;
    subcategory: string;
    condition: string;
    brand: string;
    model: string;
    tags: string[];
    urgency: {
      level: string;
      reason: string;
    };
  };
  onChange: (updates: any) => void;
  errors: any;
}

const categories = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing & Fashion' },
  { value: 'home', label: 'Home & Garden' },
  { value: 'sports', label: 'Sports & Recreation' },
  { value: 'books', label: 'Books & Media' },
  { value: 'beauty', label: 'Health & Beauty' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'toys', label: 'Toys & Games' },
  { value: 'jewelry', label: 'Jewelry & Accessories' },
  { value: 'art', label: 'Art & Collectibles' },
  { value: 'music', label: 'Musical Instruments' },
  { value: 'other', label: 'Other' }
];

const conditions = [
  { value: 'new', label: 'New - Never used' },
  { value: 'like_new', label: 'Like New - Excellent condition' },
  { value: 'good', label: 'Good - Normal wear' },
  { value: 'fair', label: 'Fair - Obvious wear' },
  { value: 'poor', label: 'Poor - Heavy wear' }
];

const urgencyLevels = [
  { value: 'low', label: 'Low - No rush', color: 'text-green-600' },
  { value: 'medium', label: 'Medium - Normal timing', color: 'text-yellow-600' },
  { value: 'high', label: 'High - Quick sale preferred', color: 'text-orange-600' },
  { value: 'urgent', label: 'Urgent - Need to sell ASAP', color: 'text-red-600' }
];

export const ProductDetailsForm: React.FC<ProductDetailsFormProps> = ({
  data,
  onChange,
  errors
}) => {
  const handleInputChange = (field: string, value: any) => {
    onChange({ [field]: value });
  };

  const handleTagAdd = (tag: string) => {
    if (tag && !data.tags.includes(tag) && data.tags.length < 10) {
      handleInputChange('tags', [...data.tags, tag]);
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    handleInputChange('tags', data.tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const input = e.target as HTMLInputElement;
      const tag = input.value.trim().toLowerCase();
      if (tag) {
        handleTagAdd(tag);
        input.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Product Details
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Provide accurate information about your product to attract buyers
        </p>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <BackdropBlur className="p-6 rounded-xl border border-white/20 dark:border-gray-700/50">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Product Title *
          </label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter a descriptive title for your product"
            className={`w-full px-4 py-3 rounded-lg border bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-200 ${
              errors.title
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20'
            } focus:ring-4 focus:outline-none`}
            maxLength={100}
          />
          <div className="flex justify-between items-center mt-2">
            {errors.title && (
              <span className="text-red-500 text-sm">{errors.title}</span>
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
              {data.title.length}/100
            </span>
          </div>
        </BackdropBlur>

        {/* Description */}
        <BackdropBlur className="p-6 rounded-xl border border-white/20 dark:border-gray-700/50">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            value={data.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe your product in detail. Include condition, features, and any relevant information."
            rows={4}
            className={`w-full px-4 py-3 rounded-lg border bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-200 ${
              errors.description
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20'
            } focus:ring-4 focus:outline-none resize-vertical`}
            maxLength={2000}
          />
          <div className="flex justify-between items-center mt-2">
            {errors.description && (
              <span className="text-red-500 text-sm">{errors.description}</span>
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
              {data.description.length}/2000
            </span>
          </div>
        </BackdropBlur>

        {/* Category & Condition Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BackdropBlur className="p-6 rounded-xl border border-white/20 dark:border-gray-700/50">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category *
            </label>
            <select
              value={data.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-200 ${
                errors.category
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20'
              } focus:ring-4 focus:outline-none`}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <span className="text-red-500 text-sm mt-2 block">{errors.category}</span>
            )}
          </BackdropBlur>

          <BackdropBlur className="p-6 rounded-xl border border-white/20 dark:border-gray-700/50">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Condition *
            </label>
            <select
              value={data.condition}
              onChange={(e) => handleInputChange('condition', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-200 ${
                errors.condition
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20'
              } focus:ring-4 focus:outline-none`}
            >
              {conditions.map((condition) => (
                <option key={condition.value} value={condition.value}>
                  {condition.label}
                </option>
              ))}
            </select>
            {errors.condition && (
              <span className="text-red-500 text-sm mt-2 block">{errors.condition}</span>
            )}
          </BackdropBlur>
        </div>

        {/* Brand & Model Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BackdropBlur className="p-6 rounded-xl border border-white/20 dark:border-gray-700/50">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Brand (Optional)
            </label>
            <input
              type="text"
              value={data.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
              placeholder="e.g., Apple, Samsung, Nike"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
              maxLength={50}
            />
          </BackdropBlur>

          <BackdropBlur className="p-6 rounded-xl border border-white/20 dark:border-gray-700/50">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Model (Optional)
            </label>
            <input
              type="text"
              value={data.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              placeholder="e.g., iPhone 15, Galaxy S24"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
              maxLength={50}
            />
          </BackdropBlur>
        </div>

        {/* Tags */}
        <BackdropBlur className="p-6 rounded-xl border border-white/20 dark:border-gray-700/50">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags (Optional)
          </label>
          <input
            type="text"
            placeholder="Type tags and press Enter or comma to add (max 10)"
            onKeyDown={handleTagKeyPress}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
          />
          
          {data.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {data.tags.map((tag, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700"
                >
                  {tag}
                  <button
                    onClick={() => handleTagRemove(tag)}
                    className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    ×
                  </button>
                </motion.span>
              ))}
            </div>
          )}
          
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {data.tags.length}/10 tags • Tags help buyers find your product
          </div>
        </BackdropBlur>

        {/* Urgency Level */}
        <BackdropBlur className="p-6 rounded-xl border border-white/20 dark:border-gray-700/50">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Urgency Level
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {urgencyLevels.map((level) => (
              <label
                key={level.value}
                className={`relative flex items-center p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  data.urgency.level === level.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <input
                  type="radio"
                  value={level.value}
                  checked={data.urgency.level === level.value}
                  onChange={(e) => handleInputChange('urgency', { 
                    ...data.urgency, 
                    level: e.target.value 
                  })}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className={`font-medium ${level.color}`}>
                    {level.label.split(' - ')[0]}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {level.label.split(' - ')[1]}
                  </div>
                </div>
                {data.urgency.level === level.value && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </label>
            ))}
          </div>

          {data.urgency.level === 'urgent' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4"
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for urgency (Optional)
              </label>
              <input
                type="text"
                value={data.urgency.reason}
                onChange={(e) => handleInputChange('urgency', {
                  ...data.urgency,
                  reason: e.target.value
                })}
                placeholder="e.g., Moving, need cash quickly"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
              />
            </motion.div>
          )}
        </BackdropBlur>
      </div>
    </div>
  );
};
