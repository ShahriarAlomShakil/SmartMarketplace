import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LightBulbIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { BlurCard } from '../ui/BlurCard';

/**
 * CounterOfferSuggestions Component - Smart counter-offer suggestion system
 * 
 * Features:
 * - AI-powered price suggestions
 * - Market analysis integration
 * - Strategic negotiation recommendations
 * - Risk assessment for each suggestion
 * - Contextual reasoning for offers
 */

export interface CounterOfferSuggestion {
  id: string;
  amount: number;
  strategy: 'conservative' | 'balanced' | 'aggressive' | 'final';
  confidence: number;
  reasoning: string;
  pros: string[];
  cons: string[];
  riskLevel: 'low' | 'medium' | 'high';
  successProbability: number;
}

interface CounterOfferSuggestionsProps {
  currentOffer: number;
  listPrice: number;
  minPrice: number;
  rounds: number;
  maxRounds: number;
  userRole: 'buyer' | 'seller';
  marketData?: {
    averagePrice?: number;
    competitorPrices?: number[];
    demand?: 'low' | 'medium' | 'high';
  };
  negotiationHistory?: Array<{
    round: number;
    amount: number;
    offeredBy: 'buyer' | 'seller' | 'ai';
  }>;
  onSelectSuggestion: (suggestion: CounterOfferSuggestion) => void;
  disabled?: boolean;
  className?: string;
}

export const CounterOfferSuggestions: React.FC<CounterOfferSuggestionsProps> = ({
  currentOffer,
  listPrice,
  minPrice,
  rounds,
  maxRounds,
  userRole,
  marketData,
  negotiationHistory = [],
  onSelectSuggestion,
  disabled = false,
  className = ""
}) => {

  const [suggestions, setSuggestions] = useState<CounterOfferSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<CounterOfferSuggestion | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  // Generate smart counter-offer suggestions
  useEffect(() => {
    const generateSuggestions = (): CounterOfferSuggestion[] => {
      const suggestions: CounterOfferSuggestion[] = [];
      const isLastRound = rounds >= maxRounds - 1;
      const priceRange = listPrice - minPrice;
      const currentPosition = (currentOffer - minPrice) / priceRange;

      if (userRole === 'buyer') {
        // Buyer suggestions - increase offers
        
        // Conservative: Small increase
        if (currentOffer < listPrice * 0.95) {
          const conservativeOffer = Math.round(currentOffer * 1.05);
          suggestions.push({
            id: 'conservative',
            amount: Math.min(conservativeOffer, listPrice),
            strategy: 'conservative',
            confidence: 0.8,
            reasoning: 'Small incremental increase to show continued interest while maintaining negotiation power.',
            pros: ['Shows good faith', 'Keeps negotiation active', 'Low risk'],
            cons: ['Slow progress', 'May extend negotiation'],
            riskLevel: 'low',
            successProbability: 75
          });
        }

        // Balanced: Middle ground
        const balancedOffer = Math.round(currentOffer + ((listPrice - currentOffer) * 0.4));
        suggestions.push({
          id: 'balanced',
          amount: balancedOffer,
          strategy: 'balanced',
          confidence: 0.9,
          reasoning: 'Strategic move towards the middle ground while leaving room for final negotiation.',
          pros: ['Good compromise position', 'Shows serious intent', 'Reasonable progress'],
          cons: ['May be rejected if seller is firm', 'Uses negotiation capital'],
          riskLevel: 'medium',
          successProbability: 65
        });

        // Aggressive: Strong move
        if (!isLastRound) {
          const aggressiveOffer = Math.round(currentOffer + ((listPrice - currentOffer) * 0.7));
          suggestions.push({
            id: 'aggressive',
            amount: aggressiveOffer,
            strategy: 'aggressive',
            confidence: 0.7,
            reasoning: 'Bold move to accelerate negotiation and signal strong purchase intent.',
            pros: ['Fast progress', 'Shows strong interest', 'May close deal quickly'],
            cons: ['Higher cost', 'Less room for counter-negotiation'],
            riskLevel: 'high',
            successProbability: 85
          });
        }

        // Final offer
        if (isLastRound) {
          const finalOffer = Math.round(listPrice * 0.95);
          suggestions.push({
            id: 'final',
            amount: finalOffer,
            strategy: 'final',
            confidence: 0.95,
            reasoning: 'Best final offer with maximum appeal to seller in the last round.',
            pros: ['Highest acceptance chance', 'Shows maximum commitment'],
            cons: ['Highest cost', 'No further negotiation room'],
            riskLevel: 'low',
            successProbability: 90
          });
        }

      } else {
        // Seller suggestions - decrease asking price

        // Conservative: Small concession
        if (currentOffer < listPrice * 0.9) {
          const conservativeOffer = Math.round(listPrice - ((listPrice - currentOffer) * 0.2));
          suggestions.push({
            id: 'conservative',
            amount: Math.max(conservativeOffer, minPrice),
            strategy: 'conservative',
            confidence: 0.8,
            reasoning: 'Minimal concession to keep buyer engaged while protecting your price.',
            pros: ['Maintains strong position', 'Tests buyer commitment', 'Preserves value'],
            cons: ['May lose buyer', 'Slow progress'],
            riskLevel: 'medium',
            successProbability: 60
          });
        }

        // Balanced: Fair counter
        const balancedOffer = Math.round(currentOffer + ((listPrice - currentOffer) * 0.5));
        if (balancedOffer >= minPrice) {
          suggestions.push({
            id: 'balanced',
            amount: balancedOffer,
            strategy: 'balanced',
            confidence: 0.9,
            reasoning: 'Fair counter-offer that splits the difference and shows flexibility.',
            pros: ['Fair compromise', 'Keeps negotiation moving', 'Good middle ground'],
            cons: ['Gives up profit margin', 'May invite more negotiation'],
            riskLevel: 'low',
            successProbability: 75
          });
        }

        // Aggressive: Accept or near-accept
        if (currentOffer >= minPrice * 1.1) {
          const aggressiveOffer = Math.round(currentOffer * 1.05);
          suggestions.push({
            id: 'aggressive',
            amount: aggressiveOffer,
            strategy: 'aggressive',
            confidence: 0.85,
            reasoning: 'Close to buyer\'s offer with minimal increase to secure the deal.',
            pros: ['High chance of acceptance', 'Quick resolution', 'Good relationship'],
            cons: ['Lower profit', 'May have accepted too quickly'],
            riskLevel: 'low',
            successProbability: 85
          });
        }
      }

      // Market-based adjustments
      if (marketData?.averagePrice && marketData.averagePrice < listPrice) {
        const marketBasedOffer = Math.round(marketData.averagePrice * 1.05);
        if (marketBasedOffer >= minPrice && marketBasedOffer <= listPrice) {
          suggestions.push({
            id: 'market-based',
            amount: marketBasedOffer,
            strategy: 'balanced',
            confidence: 0.8,
            reasoning: 'Based on current market data and similar item pricing.',
            pros: ['Market-justified price', 'Competitive positioning', 'Data-backed reasoning'],
            cons: ['May not reflect item condition', 'Market data may be outdated'],
            riskLevel: 'low',
            successProbability: 70
          });
        }
      }

      return suggestions.sort((a, b) => b.confidence - a.confidence);
    };

    setSuggestions(generateSuggestions());
  }, [currentOffer, listPrice, minPrice, rounds, maxRounds, userRole, marketData]);

  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case 'conservative':
        return <ChartBarIcon className="w-5 h-5" />;
      case 'aggressive':
        return <ArrowTrendingUpIcon className="w-5 h-5" />;
      case 'final':
        return <CheckCircleIcon className="w-5 h-5" />;
      default:
        return <CurrencyDollarIcon className="w-5 h-5" />;
    }
  };

  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case 'conservative':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'aggressive':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'final':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      default:
        return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'high':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const handleSuggestionSelect = (suggestion: CounterOfferSuggestion) => {
    if (!disabled) {
      setSelectedSuggestion(suggestion);
      onSelectSuggestion(suggestion);
    }
  };

  const toggleDetails = (suggestionId: string) => {
    setShowDetails(showDetails === suggestionId ? null : suggestionId);
  };

  return (
    <BlurCard className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <LightBulbIcon className="w-6 h-6 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">Smart Suggestions</h3>
        </div>
        <div className="text-sm text-white/60">
          Round {rounds}/{maxRounds}
        </div>
      </div>

      {/* Current Context */}
      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/70">Current Offer:</span>
          <span className="text-white font-medium">${currentOffer.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-sm mt-1">
          <span className="text-white/70">Target Range:</span>
          <span className="text-white/80">
            ${minPrice.toLocaleString()} - ${listPrice.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="space-y-3">
        <AnimatePresence>
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                selectedSuggestion?.id === suggestion.id
                  ? 'bg-blue-500/20 border-blue-400/50'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleSuggestionSelect(suggestion)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {/* Strategy Icon */}
                  <div className={`p-2 rounded-lg border ${getStrategyColor(suggestion.strategy)}`}>
                    {getStrategyIcon(suggestion.strategy)}
                  </div>

                  {/* Suggestion Details */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-white font-medium">
                        ${suggestion.amount.toLocaleString()}
                      </h4>
                      <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70 capitalize">
                        {suggestion.strategy}
                      </span>
                      <div className="flex items-center space-x-1">
                        <span className={`text-xs ${getRiskColor(suggestion.riskLevel)}`}>
                          {suggestion.riskLevel} risk
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-white/70 mb-2">
                      {suggestion.reasoning}
                    </p>

                    {/* Success Probability */}
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-white/60">Success chance:</span>
                      <div className="flex-1 h-2 bg-gray-700 rounded-full max-w-20">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"
                          style={{ width: `${suggestion.successProbability}%` }}
                        />
                      </div>
                      <span className="text-xs text-white font-medium">
                        {suggestion.successProbability}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDetails(suggestion.id);
                  }}
                  className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white/80 transition-colors"
                >
                  <InformationCircleIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Detailed Analysis */}
              <AnimatePresence>
                {showDetails === suggestion.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-white/10"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Pros */}
                      <div>
                        <h5 className="text-sm font-medium text-green-400 mb-2">Advantages</h5>
                        <ul className="space-y-1">
                          {suggestion.pros.map((pro, idx) => (
                            <li key={idx} className="text-xs text-white/70 flex items-start">
                              <span className="text-green-400 mr-2">•</span>
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Cons */}
                      <div>
                        <h5 className="text-sm font-medium text-red-400 mb-2">Considerations</h5>
                        <ul className="space-y-1">
                          {suggestion.cons.map((con, idx) => (
                            <li key={idx} className="text-xs text-white/70 flex items-start">
                              <span className="text-red-400 mr-2">•</span>
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Confidence Meter */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center text-xs text-white/60 mb-1">
                        <span>AI Confidence</span>
                        <span>{Math.round(suggestion.confidence * 100)}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${suggestion.confidence * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Selected Suggestion Preview */}
      {selectedSuggestion && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg"
        >
          <div className="flex items-center space-x-2 mb-2">
            <SparklesIcon className="w-5 h-5 text-blue-400" />
            <span className="text-blue-300 font-medium">Selected Suggestion</span>
          </div>
          <p className="text-sm text-blue-200">
            Ready to offer ${selectedSuggestion.amount.toLocaleString()} using the{' '}
            <span className="font-medium">{selectedSuggestion.strategy}</span> strategy.
          </p>
        </motion.div>
      )}

      {/* No Suggestions Message */}
      {suggestions.length === 0 && (
        <div className="text-center p-8 text-white/60">
          <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-4 text-white/40" />
          <p>No suggestions available for the current negotiation state.</p>
        </div>
      )}
    </BlurCard>
  );
};
