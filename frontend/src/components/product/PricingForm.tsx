import React from 'react';
import { motion } from 'framer-motion';
import { BackdropBlur } from '../ui/BackdropBlur';
import { CurrencyDollarIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface PricingFormProps {
  data: {
    basePrice: string;
    minPrice: string;
    currency: string;
    negotiable: boolean;
  };
  onChange: (updates: any) => void;
  errors: any;
}

const currencies = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
  { value: 'CAD', label: 'CAD (C$)', symbol: 'C$' },
  { value: 'AUD', label: 'AUD (A$)', symbol: 'A$' }
];

export const PricingForm: React.FC<PricingFormProps> = ({
  data,
  onChange,
  errors
}) => {
  const handleInputChange = (field: string, value: any) => {
    onChange({ [field]: value });
  };

  const formatPrice = (value: string) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    return numericValue;
  };

  const handlePriceChange = (field: string, value: string) => {
    const formattedValue = formatPrice(value);
    handleInputChange(field, formattedValue);
  };

  const selectedCurrency = currencies.find(c => c.value === data.currency) || currencies[0];
  const basePriceNum = parseFloat(data.basePrice) || 0;
  const minPriceNum = parseFloat(data.minPrice) || 0;
  const negotiationRange = basePriceNum > 0 ? ((basePriceNum - minPriceNum) / basePriceNum * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Set Your Prices
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Set competitive prices to attract buyers and enable negotiations
        </p>
      </div>

      <div className="space-y-6">
        {/* Currency Selection */}
        <BackdropBlur className="p-6 rounded-xl border border-white/20 dark:border-gray-700/50">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Currency
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {currencies.map((currency) => (
              <label
                key={currency.value}
                className={`relative flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  data.currency === currency.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <input
                  type="radio"
                  value={currency.value}
                  checked={data.currency === currency.value}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {currency.symbol}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {currency.value}
                  </div>
                </div>
                {data.currency === currency.value && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </label>
            ))}
          </div>
        </BackdropBlur>

        {/* Price Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Base Price */}
          <BackdropBlur className="p-6 rounded-xl border border-white/20 dark:border-gray-700/50">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Base Price *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400 text-lg">
                  {selectedCurrency.symbol}
                </span>
              </div>
              <input
                type="text"
                value={data.basePrice}
                onChange={(e) => handlePriceChange('basePrice', e.target.value)}
                placeholder="0.00"
                className={`w-full pl-8 pr-4 py-3 text-lg rounded-lg border bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-200 ${
                  errors.basePrice
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20'
                } focus:ring-4 focus:outline-none`}
              />
            </div>
            {errors.basePrice && (
              <span className="text-red-500 text-sm mt-2 block">{errors.basePrice}</span>
            )}
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Your asking price - what you'd like to get
            </div>
          </BackdropBlur>

          {/* Minimum Price */}
          <BackdropBlur className="p-6 rounded-xl border border-white/20 dark:border-gray-700/50">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Minimum Price *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400 text-lg">
                  {selectedCurrency.symbol}
                </span>
              </div>
              <input
                type="text"
                value={data.minPrice}
                onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                placeholder="0.00"
                className={`w-full pl-8 pr-4 py-3 text-lg rounded-lg border bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-200 ${
                  errors.minPrice
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20'
                } focus:ring-4 focus:outline-none`}
              />
            </div>
            {errors.minPrice && (
              <span className="text-red-500 text-sm mt-2 block">{errors.minPrice}</span>
            )}
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Lowest price you'll accept
            </div>
          </BackdropBlur>
        </div>

        {/* Price Analysis */}
        {basePriceNum > 0 && minPriceNum > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <BackdropBlur className="p-6 rounded-xl border border-white/20 dark:border-gray-700/50">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Price Analysis
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {selectedCurrency.symbol}{basePriceNum.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Starting Price
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {selectedCurrency.symbol}{minPriceNum.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Minimum Price
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {negotiationRange}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Negotiation Range
                  </div>
                </div>
              </div>

              {parseFloat(negotiationRange.toString()) > 30 && (
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-700">
                  <div className="flex items-start">
                    <InformationCircleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                      <strong>Tip:</strong> A negotiation range over 30% might signal pricing uncertainty to buyers. 
                      Consider researching similar items to set more competitive prices.
                    </div>
                  </div>
                </div>
              )}
            </BackdropBlur>
          </motion.div>
        )}

        {/* Negotiation Settings */}
        <BackdropBlur className="p-6 rounded-xl border border-white/20 dark:border-gray-700/50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Negotiation Settings
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Allow buyers to negotiate and make offers on your product
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={data.negotiable}
                onChange={(e) => handleInputChange('negotiable', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {data.negotiable && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700"
            >
              <div className="flex items-center">
                <CurrencyDollarIcon className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                <div className="text-sm text-green-800 dark:text-green-200">
                  <strong>Negotiation Enabled:</strong> Buyers can make offers between your minimum 
                  and base price. Our AI will help facilitate negotiations.
                </div>
              </div>
            </motion.div>
          )}

          {!data.negotiable && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Fixed Price:</strong> Buyers will see your base price as the final price. 
                No negotiations will be allowed.
              </div>
            </motion.div>
          )}
        </BackdropBlur>

        {/* Pricing Tips */}
        <BackdropBlur className="p-6 rounded-xl border border-white/20 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            💡 Pricing Tips
          </h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Research similar items to set competitive prices
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Consider the item's condition when pricing
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Leave room for negotiation to attract more buyers
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Use psychological pricing (e.g., $99 instead of $100)
              </div>
            </div>
          </div>
        </BackdropBlur>
      </div>
    </div>
  );
};
