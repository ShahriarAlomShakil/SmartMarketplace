import React from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { BlurCard } from '../ui/BlurCard';

/**
 * PriceHistoryChart Component - Visual chart showing price movement during negotiation
 * 
 * Features:
 * - Line chart of price offers over time
 * - Trend indicators and analysis
 * - Interactive data points
 * - Modern blur background design
 */

interface PriceDataPoint {
  round: number;
  amount: number;
  offeredBy: 'buyer' | 'seller' | 'ai';
  timestamp: Date;
  accepted?: boolean;
}

interface PriceHistoryChartProps {
  priceHistory: PriceDataPoint[];
  listPrice: number;
  minPrice: number;
  currentOffer: number;
  currency?: string;
  className?: string;
}

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
  priceHistory,
  listPrice,
  minPrice,
  currentOffer,
  currency = 'USD',
  className = ""
}) => {
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

  // Calculate chart dimensions and scaling
  const chartHeight = 200;
  const chartWidth = 300;
  const padding = 20;

  const maxPrice = Math.max(listPrice, ...priceHistory.map(p => p.amount));
  const minChartPrice = Math.min(minPrice, ...priceHistory.map(p => p.amount));
  const priceRange = maxPrice - minChartPrice;

  // Calculate trend
  const calculateTrend = () => {
    if (priceHistory.length < 2) return 'stable';
    
    const firstPrice = priceHistory[0].amount;
    const lastPrice = priceHistory[priceHistory.length - 1].amount;
    const change = ((lastPrice - firstPrice) / firstPrice) * 100;
    
    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'stable';
  };

  const trend = calculateTrend();

  // Get trend icon and color
  const getTrendDisplay = () => {
    switch (trend) {
      case 'up':
        return {
          icon: <ArrowTrendingUpIcon className="w-4 h-4" />,
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          label: 'Price Increasing'
        };
      case 'down':
        return {
          icon: <ArrowTrendingDownIcon className="w-4 h-4" />,
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          label: 'Price Decreasing'
        };
      default:
        return {
          icon: <MinusIcon className="w-4 h-4" />,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
          label: 'Price Stable'
        };
    }
  };

  const trendDisplay = getTrendDisplay();

  // Convert price to chart coordinates
  const getYPosition = (price: number) => {
    const ratio = (maxPrice - price) / priceRange;
    return padding + (ratio * (chartHeight - 2 * padding));
  };

  const getXPosition = (index: number) => {
    if (priceHistory.length <= 1) return chartWidth / 2;
    return padding + ((index / (priceHistory.length - 1)) * (chartWidth - 2 * padding));
  };

  // Generate SVG path for the line chart
  const generatePath = () => {
    if (priceHistory.length === 0) return '';
    
    const pathCommands = priceHistory.map((point, index) => {
      const x = getXPosition(index);
      const y = getYPosition(point.amount);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    });
    
    return pathCommands.join(' ');
  };

  const pathData = generatePath();

  if (priceHistory.length === 0) {
    return (
      <BlurCard className={`p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <ChartBarIcon className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Price History</h3>
        </div>
        <div className="text-center py-8 text-white/60">
          No price history available yet
        </div>
      </BlurCard>
    );
  }

  return (
    <BlurCard className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <ChartBarIcon className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Price History</h3>
        </div>
        
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${trendDisplay.bgColor}`}>
          <span className={trendDisplay.color}>{trendDisplay.icon}</span>
          <span className={`text-sm ${trendDisplay.color}`}>
            {trendDisplay.label}
          </span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative mb-4">
        <svg
          width={chartWidth}
          height={chartHeight}
          className="w-full h-auto"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        >
          {/* Background grid lines */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Price reference lines */}
          <line
            x1={padding}
            y1={getYPosition(listPrice)}
            x2={chartWidth - padding}
            y2={getYPosition(listPrice)}
            stroke="rgba(59, 130, 246, 0.5)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <line
            x1={padding}
            y1={getYPosition(minPrice)}
            x2={chartWidth - padding}
            y2={getYPosition(minPrice)}
            stroke="rgba(239, 68, 68, 0.5)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          
          {/* Price history line */}
          <motion.path
            d={pathData}
            fill="none"
            stroke="url(#priceGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
          
          {/* Gradient definition for the line */}
          <defs>
            <linearGradient id="priceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          
          {/* Data points */}
          {priceHistory.map((point, index) => (
            <motion.g key={index}>
              <motion.circle
                cx={getXPosition(index)}
                cy={getYPosition(point.amount)}
                r="6"
                fill={point.offeredBy === 'buyer' ? '#3B82F6' : '#8B5CF6'}
                stroke="rgba(255,255,255,0.8)"
                strokeWidth="2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="cursor-pointer"
              >
                <title>
                  Round {point.round}: {currencySymbol}{point.amount.toLocaleString()} 
                  by {point.offeredBy}
                </title>
              </motion.circle>
            </motion.g>
          ))}
        </svg>
      </div>

      {/* Legend and Statistics */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-white/70">Buyer Offers</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-white/70">Seller/AI Offers</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-white/60">Current Offer:</span>
            <div className="font-semibold text-white">
              {currencySymbol}{currentOffer.toLocaleString()}
            </div>
          </div>
          <div>
            <span className="text-white/60">Total Rounds:</span>
            <div className="font-semibold text-white">
              {priceHistory.length}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-white/60">List Price:</span>
            <div className="font-semibold text-blue-300">
              {currencySymbol}{listPrice.toLocaleString()}
            </div>
          </div>
          <div>
            <span className="text-white/60">Min Price:</span>
            <div className="font-semibold text-red-300">
              {currencySymbol}{minPrice.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </BlurCard>
  );
};
