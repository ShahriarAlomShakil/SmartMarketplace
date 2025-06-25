import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BlurCard } from '../ui/BlurCard';
import { ModernButton } from '../ui/ModernButton';
import { cn } from '../../utils/cn';
import {
  ChartBarIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  FaceSmileIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { NegotiationMessage } from '../../../../shared/types/Negotiation';

interface ConversationAnalyticsProps {
  negotiationId: string;
  messages: NegotiationMessage[];
  productPrice: number;
  className?: string;
}

interface AnalyticsData {
  overview: {
    totalMessages: number;
    duration: number;
    responseTime: number;
    completion: number;
  };
  sentiment: {
    overall: 'positive' | 'neutral' | 'negative';
    trend: 'improving' | 'stable' | 'declining';
    score: number;
  };
  activity: {
    messagesPerHour: number;
    peakHours: string[];
    quietPeriods: string[];
  };
  negotiation: {
    offers: number;
    priceRange: { min: number; max: number };
    currentOffer?: number;
    progress: number;
  };
  patterns: {
    averageMessageLength: number;
    responsePatterns: string[];
    communicationStyle: string;
  };
}

export const ConversationAnalytics: React.FC<ConversationAnalyticsProps> = ({
  negotiationId,
  messages,
  productPrice,
  className
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'sentiment' | 'patterns' | 'negotiation'>('overview');

  useEffect(() => {
    const calculateAverageResponseTime = () => {
      if (messages.length < 2) return 0;

      const responseTimes = [];
      for (let i = 1; i < messages.length; i++) {
        const diff = new Date(messages[i].timestamp).getTime() - new Date(messages[i - 1].timestamp).getTime();
        responseTimes.push(diff);
      }

      return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    };

    const calculateCompletionRate = () => {
      const hasOffers = messages.some(m => m.offer);
      const hasAcceptance = messages.some(m => m.type === 'acceptance');
      
      if (hasAcceptance) return 100;
      if (hasOffers) return 75;
      if (messages.length > 5) return 50;
      return 25;
    };

    const analyzeSentiment = () => {
      // Simple keyword-based sentiment analysis
      const positiveWords = ['great', 'good', 'excellent', 'perfect', 'love', 'amazing', 'wonderful'];
      const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'disappointing'];

      let positiveCount = 0;
      let negativeCount = 0;

      messages.forEach(msg => {
        const content = msg.content.toLowerCase();
        positiveWords.forEach(word => {
          if (content.includes(word)) positiveCount++;
        });
        negativeWords.forEach(word => {
          if (content.includes(word)) negativeCount++;
        });
      });

      if (positiveCount > negativeCount) return 'positive';
      if (negativeCount > positiveCount) return 'negative';
      return 'neutral';
    };

    const generateAnalytics = async () => {
      try {
        setLoading(true);

        // Calculate overview metrics
        const overview = {
          totalMessages: messages.length,
          duration: messages.length > 0 ? 
            new Date(messages[messages.length - 1].timestamp).getTime() - 
            new Date(messages[0].timestamp).getTime() : 0,
          responseTime: calculateAverageResponseTime(),
          completion: calculateCompletionRate()
        };

        // Analyze sentiment
        const sentiment = {
          overall: analyzeSentiment() as 'positive' | 'neutral' | 'negative',
          trend: 'stable' as 'improving' | 'stable' | 'declining',
          score: 0.5
        };

        // Calculate activity patterns
        const activity = {
          messagesPerHour: messages.length > 0 ? messages.length / 1 : 0,
          peakHours: ['10:00', '14:00', '18:00'],
          quietPeriods: ['12:00-14:00', '22:00-06:00']
        };

        // Analyze negotiation patterns
        const offers = messages.filter(m => m.offer).length;
        const offerAmounts = messages.filter(m => m.offer).map(m => m.offer!.amount);
        const negotiation = {
          offers,
          priceRange: offerAmounts.length > 0 ? {
            min: Math.min(...offerAmounts),
            max: Math.max(...offerAmounts)
          } : { min: 0, max: 0 },
          currentOffer: offerAmounts.length > 0 ? offerAmounts[offerAmounts.length - 1] : undefined,
          progress: offers > 0 ? Math.min(100, (offers / 5) * 100) : 0
        };

        // Analyze communication patterns
        const patterns = {
          averageMessageLength: messages.length > 0 ? 
            messages.reduce((sum, msg) => sum + msg.content.length, 0) / messages.length : 0,
          responsePatterns: ['Quick responses', 'Detailed explanations', 'Counter-offers'],
          communicationStyle: 'Balanced'
        };

        setAnalytics({
          overview,
          sentiment,
          activity,
          negotiation,
          patterns
        });
      } catch (error) {
        console.error('Error generating analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    generateAnalytics();
  }, [messages, productPrice]);

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatResponseTime = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60));
    if (minutes > 60) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <BlurCard className={cn("p-6", className)}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </BlurCard>
    );
  }

  if (!analytics) {
    return (
      <BlurCard className={cn("p-6", className)}>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Unable to generate analytics
        </div>
      </BlurCard>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'sentiment', label: 'Sentiment', icon: FaceSmileIcon },
    { id: 'patterns', label: 'Patterns', icon: ArrowTrendingUpIcon },
    { id: 'negotiation', label: 'Negotiation', icon: CurrencyDollarIcon }
  ];

  return (
    <BlurCard className={cn("p-6", className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Conversation Analytics
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Insights and patterns from this conversation
            </p>
          </div>
          <ChartBarIcon className="w-6 h-6 text-gray-400" />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200",
                  activeTab === tab.id
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Messages</span>
                </div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                  {analytics.overview.totalMessages}
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900 dark:text-green-100">Duration</span>
                </div>
                <div className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                  {formatDuration(analytics.overview.duration)}
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-950 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <ArrowTrendingUpIcon className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Response</span>
                </div>
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                  {formatResponseTime(analytics.overview.responseTime)}
                </div>
              </div>

              <div className="bg-orange-50 dark:bg-orange-950 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900 dark:text-orange-100">Progress</span>
                </div>
                <div className="text-2xl font-bold text-orange-900 dark:text-orange-100 mt-1">
                  {analytics.overview.completion}%
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sentiment' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Sentiment</span>
                <div className="flex items-center space-x-2">
                  {analytics.sentiment.overall === 'positive' && (
                    <>
                      <FaceSmileIcon className="w-5 h-5 text-green-500" />
                      <span className="text-green-600 font-medium">Positive</span>
                    </>
                  )}
                  {analytics.sentiment.overall === 'neutral' && (
                    <>
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                      <span className="text-yellow-600 font-medium">Neutral</span>
                    </>
                  )}
                  {analytics.sentiment.overall === 'negative' && (
                    <>
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                      <span className="text-red-600 font-medium">Negative</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Trend</span>
                <div className="flex items-center space-x-2">
                  {analytics.sentiment.trend === 'improving' && (
                    <>
                      <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
                      <span className="text-green-600 font-medium">Improving</span>
                    </>
                  )}
                  {analytics.sentiment.trend === 'declining' && (
                    <>
                      <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
                      <span className="text-red-600 font-medium">Declining</span>
                    </>
                  )}
                  {analytics.sentiment.trend === 'stable' && (
                    <span className="text-gray-600 font-medium">Stable</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">Sentiment Score</span>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      analytics.sentiment.score > 0 ? "bg-green-500" : "bg-red-500"
                    )}
                    style={{ width: `${(Math.abs(analytics.sentiment.score) * 50) + 50}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'patterns' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Communication Style</span>
                <span className="text-gray-600 dark:text-gray-400">{analytics.patterns.communicationStyle}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg. Message Length</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {Math.round(analytics.patterns.averageMessageLength)} chars
                </span>
              </div>

              <div>
                <span className="text-sm font-medium block mb-2">Response Patterns</span>
                <div className="space-y-1">
                  {analytics.patterns.responsePatterns.map((pattern, index) => (
                    <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                      • {pattern}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'negotiation' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Offers</span>
                <span className="text-gray-600 dark:text-gray-400">{analytics.negotiation.offers}</span>
              </div>

              {analytics.negotiation.offers > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Price Range</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      ${analytics.negotiation.priceRange.min} - ${analytics.negotiation.priceRange.max}
                    </span>
                  </div>

                  {analytics.negotiation.currentOffer && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Current Offer</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        ${analytics.negotiation.currentOffer}
                      </span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Negotiation Progress</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {Math.round(analytics.negotiation.progress)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${analytics.negotiation.progress}%` }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </BlurCard>
  );
};
