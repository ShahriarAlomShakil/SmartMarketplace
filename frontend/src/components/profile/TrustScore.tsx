import React, { useState } from 'react';
import { BlurCard } from '../ui/BlurCard';
import { ModernButton } from '../ui/ModernButton';
import { ModernBadge } from '../ui/ModernBadge';

interface TrustScoreProps {
  trustScore: {
    overall: number;
    level: string;
    breakdown: {
      verification: number;
      activity: number;
      reviews: number;
      completion: number;
      consistency: number;
      social: number;
    };
    badges: Array<{
      id: string;
      name: string;
      description: string;
      icon: string;
      color: string;
    }>;
    lastCalculated: Date;
  };
  onRecalculate?: () => void;
  className?: string;
}

/**
 * Trust Score Display Component - Day 18 Implementation
 * 
 * Features:
 * - Visual trust score representation
 * - Detailed breakdown of score components
 * - Achievement badges display
 * - Progress bars for each category
 * - Trust level indicators
 * - Recalculation functionality
 */
export const TrustScore: React.FC<TrustScoreProps> = ({
  trustScore,
  onRecalculate,
  className
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-green-400';
    if (score >= 60) return 'from-blue-500 to-cyan-400';
    if (score >= 40) return 'from-yellow-500 to-orange-400';
    return 'from-gray-500 to-gray-400';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'elite': return 'from-purple-500 to-pink-500';
      case 'excellent': return 'from-emerald-500 to-green-400';
      case 'very good': return 'from-blue-500 to-cyan-400';
      case 'good': return 'from-green-500 to-emerald-400';
      case 'average': return 'from-yellow-500 to-orange-400';
      case 'fair': return 'from-orange-500 to-red-400';
      default: return 'from-gray-500 to-gray-400';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const breakdownCategories = [
    { key: 'verification', label: 'Account Verification', icon: '🛡️' },
    { key: 'activity', label: 'Platform Activity', icon: '⚡' },
    { key: 'reviews', label: 'User Reviews', icon: '⭐' },
    { key: 'completion', label: 'Deal Completion', icon: '✅' },
    { key: 'consistency', label: 'Behavioral Consistency', icon: '📊' },
    { key: 'social', label: 'Social Verification', icon: '👥' }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Trust Score Display */}
      <BlurCard variant="elevated" className="p-6">
        <div className="text-center mb-6">
          <div className="relative inline-block">
            {/* Circular Progress */}
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                {/* Background circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  stroke="url(#trustGradient)"
                  strokeWidth="8"
                  fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray={`${(trustScore.overall / 100) * 283} 283`}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="trustGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" className={`stop-color-${getScoreColor(trustScore.overall).split(' ')[0].replace('from-', '')}`} />
                    <stop offset="100%" className={`stop-color-${getScoreColor(trustScore.overall).split(' ')[2].replace('to-', '')}`} />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Score Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getScoreTextColor(trustScore.overall)}`}>
                    {trustScore.overall}
                  </div>
                  <div className="text-xs text-white/60">/ 100</div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Level Badge */}
          <div className="mt-4">
            <ModernBadge 
              variant="info"
              size="lg"
              className={`bg-gradient-to-r ${getLevelColor(trustScore.level)} text-white border-transparent`}
            >
              {trustScore.level}
            </ModernBadge>
          </div>

          {/* Description */}
          <p className="text-white/70 text-sm mt-2 max-w-md mx-auto">
            Your trust score reflects your reliability and credibility on the platform
          </p>

          {/* Last Updated */}
          <p className="text-white/50 text-xs mt-2">
            Last updated: {formatDate(trustScore.lastCalculated)}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <ModernButton
            variant="secondary"
            size="sm"
            onClick={() => setShowBreakdown(!showBreakdown)}
          >
            {showBreakdown ? 'Hide Details' : 'View Breakdown'}
          </ModernButton>
          {onRecalculate && (
            <ModernButton
              variant="primary"
              size="sm"
              onClick={onRecalculate}
            >
              Recalculate Score
            </ModernButton>
          )}
        </div>
      </BlurCard>

      {/* Detailed Breakdown */}
      {showBreakdown && (
        <BlurCard variant="elevated" className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Score Breakdown</h3>
          
          <div className="space-y-4">
            {breakdownCategories.map((category) => {
              const score = trustScore.breakdown[category.key as keyof typeof trustScore.breakdown];
              return (
                <div key={category.key} className="flex items-center space-x-4">
                  <div className="text-lg">{category.icon}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-white">{category.label}</span>
                      <span className={`text-sm font-bold ${getScoreTextColor(score)}`}>
                        {score}/100
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${getScoreColor(score)} transition-all duration-500`}
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Improvement Tips */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-400 mb-2">💡 How to Improve</h4>
            <ul className="text-sm text-white/70 space-y-1">
              {trustScore.breakdown.verification < 80 && (
                <li>• Complete account verification (email, phone, identity)</li>
              )}
              {trustScore.breakdown.activity < 60 && (
                <li>• Stay active by listing products and engaging in negotiations</li>
              )}
              {trustScore.breakdown.reviews < 70 && (
                <li>• Provide excellent service to earn positive reviews</li>
              )}
              {trustScore.breakdown.social < 50 && (
                <li>• Connect your social media accounts for additional verification</li>
              )}
            </ul>
          </div>
        </BlurCard>
      )}

      {/* Achievement Badges */}
      {trustScore.badges.length > 0 && (
        <BlurCard variant="elevated" className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Trust Badges</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trustScore.badges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="text-2xl">{badge.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {badge.name}
                  </div>
                  <div className="text-xs text-white/60">
                    {badge.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </BlurCard>
      )}
    </div>
  );
};
