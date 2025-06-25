import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BlurCard } from '../ui/BlurCard';
import { 
  PriceInput,
  QuickActions,
  NegotiationProgress,
  DealSummary,
  CounterOfferSuggestions,
  NegotiationTimeline,
  SuccessCelebration,
  PriceHistoryChart,
  SmartMessageTemplates,
  type CounterOfferSuggestion,
  type TimelineEvent
} from './';
import { 
  Negotiation, 
  NegotiationStatus, 
  MessageType, 
  MessageSender 
} from '../../../../shared/types/Negotiation';

/**
 * NegotiationInterface Component - Integrated negotiation interface for Day 15
 * 
 * Features:
 * - Complete integration of all Day 15 negotiation components
 * - Smart component orchestration based on negotiation state
 * - Context-aware UI that adapts to user role and negotiation progress
 * - Real-time updates and interactive feedback
 */

interface NegotiationInterfaceProps {
  negotiation: Negotiation;
  currentUserRole: 'buyer' | 'seller';
  onSendMessage: (message: string, type?: MessageType) => void;
  onSendOffer: (amount: number, message?: string) => void;
  onAcceptOffer: () => void;
  onRejectOffer: (reason?: string) => void;
  isLoading?: boolean;
  className?: string;
}

export const NegotiationInterface: React.FC<NegotiationInterfaceProps> = ({
  negotiation,
  currentUserRole,
  onSendMessage,
  onSendOffer,
  onAcceptOffer,
  onRejectOffer,
  isLoading = false,
  className = ""
}) => {

  const [activeTab, setActiveTab] = useState<'chat' | 'timeline' | 'summary'>('chat');
  const [showCelebration, setShowCelebration] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<number | null>(null);

  const { product, status, rounds, maxRounds, messages } = negotiation;
  const currentOffer = negotiation.currentOffer?.amount || 0;
  const listPrice = product.pricing.basePrice;
  const minPrice = product.pricing.minPrice;
  const finalPrice = negotiation.finalPrice || currentOffer;
  const savings = listPrice - finalPrice;
  const savingsPercentage = (savings / listPrice) * 100;

  // Currency symbol helper
  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      BDT: '৳'
    };
    return symbols[currency] || currency;
  };

  const currencySymbol = getCurrencySymbol(product.pricing.currency);

  // Show celebration when deal is completed
  useEffect(() => {
    if (status === NegotiationStatus.ACCEPTED && !showCelebration) {
      setShowCelebration(true);
    }
  }, [status, showCelebration]);

  // Convert messages to timeline events
  const timelineEvents: TimelineEvent[] = messages.map((message, index) => ({
    id: message._id || `event-${index}`,
    type: message.type === MessageType.OFFER ? 'offer' :
          message.type === MessageType.COUNTER_OFFER ? 'counter_offer' :
          message.type === MessageType.ACCEPTANCE ? 'acceptance' :
          message.type === MessageType.REJECTION ? 'rejection' : 'message',
    sender: message.sender,
    timestamp: new Date(message.timestamp),
    content: message.content,
    offer: message.offer,
    metadata: message.metadata
  }));

  // Handle quick action selection
  const handleQuickAction = (action: any) => {
    switch (action.action) {
      case 'accept':
        onAcceptOffer();
        break;
      case 'reject':
        onRejectOffer(action.message);
        break;
      case 'counter':
        if (action.counterOffer) {
          onSendOffer(action.counterOffer, action.message);
        }
        break;
      case 'message':
      case 'ask_question':
        onSendMessage(action.message);
        break;
    }
  };

  // Handle counter-offer suggestion selection
  const handleSuggestionSelect = (suggestion: CounterOfferSuggestion) => {
    setSelectedOffer(suggestion.amount);
  };

  // Handle price input submission
  const handlePriceSubmit = (amount: number, message?: string) => {
    onSendOffer(amount, message);
    setSelectedOffer(null);
  };

  // Calculate price history for progress component
  const priceHistory = messages
    .filter(msg => msg.offer && msg.offer.amount)
    .map((msg, index) => ({
      round: index + 1,
      amount: msg.offer!.amount,
      offeredBy: msg.sender === MessageSender.BUYER ? 'buyer' as const :
                 msg.sender === MessageSender.SELLER ? 'seller' as const : 'ai' as const,
      timestamp: new Date(msg.timestamp)
    }));

  // Check if it's the last round
  const isLastRound = rounds >= maxRounds - 1;
  
  // Check if negotiation is active
  const isActive = status === NegotiationStatus.IN_PROGRESS || status === NegotiationStatus.INITIATED;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tab Navigation */}
      <BlurCard className="p-4">
        <div className="flex space-x-4">
          {(['chat', 'timeline', 'summary'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-blue-500/30 text-blue-300 border border-blue-400/30'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </BlurCard>

      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Negotiation Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Indicator */}
            <NegotiationProgress
              rounds={rounds}
              maxRounds={maxRounds}
              status={status}
              initialOffer={negotiation.analytics?.initialOffer || currentOffer}
              currentOffer={currentOffer}
              listPrice={listPrice}
              minPrice={minPrice}
              priceHistory={priceHistory}
              averageResponseTime={negotiation.analytics?.averageResponseTime}
            />

            {/* Price Input (for active negotiations) */}
            {isActive && (
              <PriceInput
                value={selectedOffer || ''}
                onChange={setSelectedOffer}
                onSubmit={handlePriceSubmit}
                minPrice={minPrice}
                maxPrice={listPrice}
                currentOffer={currentOffer}
                disabled={isLoading}
                productTitle={product.title}
                currency={product.pricing.currency}
              />
            )}

            {/* Quick Actions */}
            {isActive && (
              <QuickActions
                currentOffer={currentOffer}
                minPrice={minPrice}
                maxPrice={listPrice}
                rounds={rounds}
                maxRounds={maxRounds}
                isLastRound={isLastRound}
                userRole={currentUserRole}
                productTitle={product.title}
                onAction={handleQuickAction}
                disabled={isLoading}
              />
            )}
          </div>

          {/* Right Column - Suggestions and Info */}
          <div className="space-y-6">
            {/* Counter-offer Suggestions */}
            {isActive && (
              <CounterOfferSuggestions
                currentOffer={currentOffer}
                listPrice={listPrice}
                minPrice={minPrice}
                rounds={rounds}
                maxRounds={maxRounds}
                userRole={currentUserRole}
                negotiationHistory={priceHistory}
                onSelectSuggestion={handleSuggestionSelect}
                disabled={isLoading}
              />
            )}

            {/* Deal Summary for completed negotiations */}
            {(status === NegotiationStatus.ACCEPTED || status === NegotiationStatus.REJECTED) && (
              <DealSummary
                negotiation={{
                  _id: negotiation._id,
                  status: negotiation.status,
                  product: {
                    _id: negotiation.product._id,
                    title: negotiation.product.title,
                    category: negotiation.product.category,
                    condition: negotiation.product.condition,
                    images: negotiation.product.images.map(img => ({ 
                      url: img.url, 
                      isPrimary: img.isMain || false 
                    })),
                    pricing: {
                      basePrice: negotiation.product.pricing.basePrice,
                      minPrice: negotiation.product.pricing.minPrice,
                      currency: negotiation.product.pricing.currency
                    }
                  },
                  buyer: {
                    _id: negotiation.buyer._id,
                    username: negotiation.buyer.username,
                    avatar: negotiation.buyer.avatar
                  },
                  seller: {
                    _id: negotiation.seller._id,
                    username: negotiation.seller.username,
                    avatar: negotiation.seller.avatar
                  },
                  rounds: negotiation.rounds,
                  maxRounds: negotiation.maxRounds,
                  initialOffer: negotiation.analytics?.initialOffer || currentOffer,
                  currentOffer: currentOffer,
                  finalPrice: negotiation.finalPrice,
                  createdAt: negotiation.createdAt.toString(),
                  concludedAt: negotiation.concludedAt?.toString(),
                  analytics: negotiation.analytics ? {
                    averageResponseTime: negotiation.analytics.averageResponseTime,
                    totalMessages: messages.length,
                    priceMovement: negotiation.analytics.priceMovement
                  } : undefined
                }}
                userRole={currentUserRole}
                onShare={() => {
                  // Handle sharing
                  if (navigator.share) {
                    navigator.share({
                      title: `Deal completed for ${product.title}`,
                      text: `I just completed a negotiation on Smart Marketplace!`,
                      url: window.location.href
                    });
                  }
                }}
                onExport={() => {
                  // Handle export
                  const data = {
                    product: product.title,
                    finalPrice,
                    savings: currentUserRole === 'buyer' ? savings : 0,
                    rounds,
                    date: new Date().toISOString()
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { 
                    type: 'application/json' 
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `negotiation-${product.title}-${Date.now()}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              />
            )}
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <PriceHistoryChart
              priceHistory={priceHistory}
              listPrice={listPrice}
              minPrice={minPrice}
              currentOffer={currentOffer}
              currency={product.pricing.currency}
            />
            <SmartMessageTemplates
              userRole={currentUserRole}
              currentOffer={currentOffer}
              listPrice={listPrice}
              productTitle={product.title}
              rounds={rounds}
              onSelectTemplate={(message) => onSendMessage(message)}
            />
          </div>
          <NegotiationTimeline
            events={timelineEvents}
            currentUserRole={currentUserRole}
            productTitle={product.title}
            listPrice={listPrice}
            minPrice={minPrice}
          />
        </div>
      )}

      {activeTab === 'summary' && (
        <DealSummary
          negotiation={{
            _id: negotiation._id,
            status: negotiation.status,
            product: {
              _id: negotiation.product._id,
              title: negotiation.product.title,
              category: negotiation.product.category,
              condition: negotiation.product.condition,
              images: negotiation.product.images.map(img => ({ 
                url: img.url, 
                isPrimary: img.isMain || false 
              })),
              pricing: {
                basePrice: negotiation.product.pricing.basePrice,
                minPrice: negotiation.product.pricing.minPrice,
                currency: negotiation.product.pricing.currency
              }
            },
            buyer: {
              _id: negotiation.buyer._id,
              username: negotiation.buyer.username,
              avatar: negotiation.buyer.avatar
            },
            seller: {
              _id: negotiation.seller._id,
              username: negotiation.seller.username,
              avatar: negotiation.seller.avatar
            },
            rounds: negotiation.rounds,
            maxRounds: negotiation.maxRounds,
            initialOffer: negotiation.analytics?.initialOffer || currentOffer,
            currentOffer: currentOffer,
            finalPrice: negotiation.finalPrice,
            createdAt: negotiation.createdAt.toString(),
            concludedAt: negotiation.concludedAt?.toString(),
            analytics: negotiation.analytics ? {
              averageResponseTime: negotiation.analytics.averageResponseTime,
              totalMessages: messages.length,
              priceMovement: negotiation.analytics.priceMovement
            } : undefined
          }}
          userRole={currentUserRole}
          onShare={() => {
            if (navigator.share) {
              navigator.share({
                title: `Negotiation for ${product.title}`,
                text: `Check out this negotiation on Smart Marketplace!`,
                url: window.location.href
              });
            }
          }}
        />
      )}

      {/* Success Celebration Modal */}
      <SuccessCelebration
        isVisible={showCelebration}
        dealAmount={finalPrice}
        savings={currentUserRole === 'buyer' ? savings : 0}
        savingsPercentage={currentUserRole === 'buyer' ? savingsPercentage : 0}
        productTitle={product.title}
        userRole={currentUserRole}
        negotiationRounds={rounds}
        currency={product.pricing.currency}
        onClose={() => setShowCelebration(false)}
        onShare={() => {
          if (navigator.share) {
            navigator.share({
              title: `Deal completed for ${product.title}`,
              text: `I just saved ${currencySymbol}${savings.toLocaleString()} on Smart Marketplace!`,
              url: window.location.href
            });
          }
          setShowCelebration(false);
        }}
      />
    </div>
  );
};
