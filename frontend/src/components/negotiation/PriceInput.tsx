import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { BlurCard } from '../ui/BlurCard';

/**
 * PriceInput Component - Smart price input with validation and suggestions
 * 
 * Features:
 * - Real-time validation and feedback
 * - Smart price suggestions based on market data
 * - Visual feedback for price ranges
 * - Integration with negotiation context
 */

interface PriceInputProps {
  value: number | string;
  onChange: (value: number) => void;
  onSubmit: (value: number, message?: string) => void;
  minPrice: number;
  maxPrice: number;
  currentOffer?: number;
  suggestions?: number[];
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  currency?: string;
  productTitle?: string;
  className?: string;
}

export const PriceInput: React.FC<PriceInputProps> = ({
  value,
  onChange,
  onSubmit,
  minPrice,
  maxPrice,
  currentOffer,
  suggestions = [],
  disabled = false,
  placeholder = "Enter your offer",
  label = "Your Offer",
  currency = "USD",
  productTitle,
  className = ""
}) => {
  const [inputValue, setInputValue] = useState(value.toString());
  const [isValid, setIsValid] = useState(true);
  const [feedback, setFeedback] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  const numericValue = parseFloat(inputValue) || 0;

  // Currency symbol mapping
  const getCurrencySymbol = (curr: string) => {
    const symbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      BDT: '৳'
    };
    return symbols[curr] || curr;
  };

  const currencySymbol = getCurrencySymbol(currency);

  // Validate input and provide feedback
  useEffect(() => {
    if (numericValue === 0) {
      setIsValid(true);
      setFeedback('');
      return;
    }

    if (numericValue < minPrice * 0.5) {
      setIsValid(false);
      setFeedback('This offer is too low to be considered');
    } else if (numericValue < minPrice) {
      setIsValid(false);
      setFeedback('This is below the seller\'s minimum price');
    } else if (numericValue === minPrice) {
      setIsValid(true);
      setFeedback('This meets the minimum acceptable price');
    } else if (numericValue <= maxPrice * 0.8) {
      setIsValid(true);
      setFeedback('Good negotiation starting point');
    } else if (numericValue <= maxPrice * 0.95) {
      setIsValid(true);
      setFeedback('Strong offer - likely to be accepted');
    } else if (numericValue <= maxPrice) {
      setIsValid(true);
      setFeedback('Excellent offer!');
    } else {
      setIsValid(false);
      setFeedback('Offer cannot exceed the listed price');
    }
  }, [numericValue, minPrice, maxPrice]);

  // Generate smart suggestions
  const generateSuggestions = () => {
    const suggestedPrices = [];
    
    // Conservative offer (80% of max)
    suggestedPrices.push(Math.round(maxPrice * 0.8));
    
    // Balanced offer (87.5% of max)
    suggestedPrices.push(Math.round(maxPrice * 0.875));
    
    // Strong offer (95% of max)
    suggestedPrices.push(Math.round(maxPrice * 0.95));
    
    // If there's a current offer, suggest slightly higher
    if (currentOffer && currentOffer < maxPrice) {
      const increment = Math.round((maxPrice - currentOffer) * 0.3);
      suggestedPrices.push(currentOffer + increment);
    }
    
    return Array.from(new Set(suggestedPrices)).sort((a, b) => a - b);
  };

  const smartSuggestions = suggestions.length > 0 ? suggestions : generateSuggestions();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^0-9.]/g, '');
    setInputValue(newValue);
    onChange(parseFloat(newValue) || 0);
  };

  const handleSuggestionClick = (price: number) => {
    setInputValue(price.toString());
    onChange(price);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && numericValue > 0) {
      onSubmit(numericValue, customMessage || undefined);
      setCustomMessage('');
    }
  };

  const getValidationColor = () => {
    if (numericValue === 0) return 'border-gray-300 dark:border-gray-600';
    if (!isValid) return 'border-red-400 dark:border-red-500';
    if (numericValue >= maxPrice * 0.9) return 'border-green-400 dark:border-green-500';
    if (numericValue >= minPrice) return 'border-blue-400 dark:border-blue-500';
    return 'border-gray-300 dark:border-gray-600';
  };

  const getFeedbackIcon = () => {
    if (numericValue === 0) return null;
    if (!isValid) return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
    if (numericValue >= maxPrice * 0.9) return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
  };

  return (
    <BlurCard className={`p-6 space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{label}</h3>
        {productTitle && (
          <span className="text-sm text-white/60 truncate max-w-[200px]">
            for {productTitle}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Price Input */}
        <div className="relative">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 text-lg font-medium">
              {currencySymbol}
            </span>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={placeholder}
              disabled={disabled}
              className={`w-full pl-8 pr-4 py-3 bg-white/10 backdrop-blur-md border rounded-lg 
                text-white placeholder-white/50 text-lg font-medium
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200 ${getValidationColor()}`}
            />
          </div>

          {/* Validation Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mt-2 flex items-center space-x-2 text-sm ${
                  isValid ? 'text-blue-300' : 'text-red-300'
                }`}
              >
                {getFeedbackIcon()}
                <span>{feedback}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Price Range Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-white/60">
            <span>Min: {currencySymbol}{minPrice.toLocaleString()}</span>
            <span>Max: {currencySymbol}{maxPrice.toLocaleString()}</span>
          </div>
          
          <div className="relative h-2 bg-gray-700 rounded-full">
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-500 to-green-500 rounded-full"
              style={{ width: '100%' }}
            />
            {numericValue > 0 && (
              <div
                className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-gray-800"
                style={{ 
                  left: `${Math.min(100, Math.max(0, ((numericValue - minPrice) / (maxPrice - minPrice)) * 100))}%` 
                }}
              />
            )}
          </div>
        </div>

        {/* Smart Suggestions */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="flex items-center space-x-2 text-sm text-blue-300 hover:text-blue-200 transition-colors"
          >
            <ChartBarIcon className="w-4 h-4" />
            <span>Smart Price Suggestions</span>
          </button>

          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-2"
              >
                {smartSuggestions.map((price, index) => (
                  <motion.button
                    key={price}
                    type="button"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleSuggestionClick(price)}
                    className="p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 
                      rounded-lg text-sm text-blue-300 hover:text-blue-200 transition-colors"
                  >
                    {currencySymbol}{price.toLocaleString()}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Optional Message */}
        <div className="space-y-2">
          <label className="text-sm text-white/70">Add a message (optional):</label>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Explain your offer or ask questions..."
            className="w-full p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg 
              text-white placeholder-white/50 text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent
              resize-none h-20"
            maxLength={200}
          />
          <div className="text-xs text-white/50 text-right">
            {customMessage.length}/200
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={!isValid || numericValue === 0 || disabled}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 
            hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700
            text-white font-medium rounded-lg transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {disabled ? 'Please wait...' : 'Make Offer'}
        </motion.button>
      </form>
    </BlurCard>
  );
};
