import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon,
  SparklesIcon,
  TrophyIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { BlurCard } from '../ui/BlurCard';

/**
 * SuccessCelebration Component - Animated celebration for successful deals
 * 
 * Features:
 * - Confetti animation
 * - Success metrics display
 * - Congratulatory messaging
 * - Social sharing integration
 * - Achievement unlocking
 */

interface SuccessCelebrationProps {
  isVisible: boolean;
  dealAmount: number;
  savings: number;
  savingsPercentage: number;
  productTitle: string;
  userRole: 'buyer' | 'seller';
  negotiationRounds: number;
  onClose: () => void;
  onShare?: () => void;
  currency?: string;
  className?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  velocityX: number;
  velocityY: number;
  life: number;
}

export const SuccessCelebration: React.FC<SuccessCelebrationProps> = ({
  isVisible,
  dealAmount,
  savings,
  savingsPercentage,
  productTitle,
  userRole,
  negotiationRounds,
  onClose,
  onShare,
  currency = 'USD',
  className = ""
}) => {

  const [particles, setParticles] = useState<Particle[]>([]);
  const [showAchievements, setShowAchievements] = useState(false);

  // Currency symbol
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

  // Generate confetti particles
  useEffect(() => {
    if (!isVisible) return;

    const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];
    const newParticles: Particle[] = [];

    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 400,
        y: Math.random() * 300,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        velocityX: (Math.random() - 0.5) * 4,
        velocityY: Math.random() * -8 - 2,
        life: 1
      });
    }

    setParticles(newParticles);

    // Animate particles
    const interval = setInterval(() => {
      setParticles(prevParticles => 
        prevParticles.map(particle => ({
          ...particle,
          x: particle.x + particle.velocityX,
          y: particle.y + particle.velocityY,
          velocityY: particle.velocityY + 0.3, // gravity
          life: particle.life - 0.02
        })).filter(particle => particle.life > 0)
      );
    }, 16);

    // Show achievements after delay
    const achievementTimeout = setTimeout(() => {
      setShowAchievements(true);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(achievementTimeout);
    };
  }, [isVisible]);

  // Get celebration message
  const getCelebrationMessage = () => {
    if (userRole === 'buyer') {
      if (savingsPercentage > 20) {
        return "Amazing deal! You're a negotiation master! 🎉";
      } else if (savingsPercentage > 10) {
        return "Great job! You saved money on this purchase! 👏";
      } else {
        return "Congratulations on your successful purchase! ✨";
      }
    } else {
      if (negotiationRounds <= 3) {
        return "Quick and successful sale! Well done! 🚀";
      } else {
        return "Patience paid off! Successful negotiation! 🎯";
      }
    }
  };

  // Generate achievements
  const getAchievements = () => {
    const achievements = [];

    if (userRole === 'buyer') {
      if (savingsPercentage > 25) {
        achievements.push({ 
          icon: '🏆', 
          title: 'Master Negotiator', 
          description: 'Saved over 25%!' 
        });
      }
      if (savingsPercentage > 15) {
        achievements.push({ 
          icon: '💰', 
          title: 'Smart Shopper', 
          description: 'Great savings achieved!' 
        });
      }
      if (negotiationRounds <= 2) {
        achievements.push({ 
          icon: '⚡', 
          title: 'Quick Deal', 
          description: 'Closed in 2 rounds or less!' 
        });
      }
    } else {
      if (negotiationRounds <= 3) {
        achievements.push({ 
          icon: '🎯', 
          title: 'Efficient Seller', 
          description: 'Quick successful sale!' 
        });
      }
      if (dealAmount >= 1000) {
        achievements.push({ 
          icon: '💎', 
          title: 'High Value Sale', 
          description: 'Sold for $1000+!' 
        });
      }
    }

    if (Math.random() > 0.7) {
      achievements.push({ 
        icon: '🌟', 
        title: 'Perfect Match', 
        description: 'Great negotiation chemistry!' 
      });
    }

    return achievements;
  };

  const achievements = getAchievements();

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className={`relative max-w-md w-full mx-4 ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Confetti Particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
            {particles.map(particle => (
              <motion.div
                key={particle.id}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: particle.color,
                  left: particle.x,
                  top: particle.y,
                  width: particle.size,
                  height: particle.size,
                  opacity: particle.life
                }}
              />
            ))}
          </div>

          <BlurCard className="p-8 text-center space-y-6 border-2 border-green-500/30">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", duration: 0.8 }}
              className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500/30"
            >
              <CheckCircleIcon className="w-12 h-12 text-green-400" />
            </motion.div>

            {/* Celebration Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <h2 className="text-2xl font-bold text-white">
                Deal Completed! 🎉
              </h2>
              <p className="text-white/80">
                {getCelebrationMessage()}
              </p>
            </motion.div>

            {/* Deal Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">
                  {productTitle}
                </h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Final Price:</span>
                    <span className="text-2xl font-bold text-green-400">
                      {currencySymbol}{dealAmount.toLocaleString()}
                    </span>
                  </div>
                  
                  {savings > 0 && userRole === 'buyer' && (
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">You Saved:</span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-emerald-400">
                          {currencySymbol}{savings.toLocaleString()}
                        </div>
                        <div className="text-sm text-emerald-300">
                          ({savingsPercentage.toFixed(1)}% off)
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Negotiation Rounds:</span>
                    <span className="text-white font-medium">{negotiationRounds}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Achievements */}
            <AnimatePresence>
              {showAchievements && achievements.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <TrophyIcon className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-medium">Achievements Unlocked!</span>
                  </div>
                  
                  <div className="space-y-2">
                    {achievements.map((achievement, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 }}
                        className="flex items-center space-x-3 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg"
                      >
                        <span className="text-2xl">{achievement.icon}</span>
                        <div className="flex-1 text-left">
                          <div className="text-yellow-300 font-medium text-sm">
                            {achievement.title}
                          </div>
                          <div className="text-yellow-300/80 text-xs">
                            {achievement.description}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              {onShare && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onShare}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <SparklesIcon className="w-5 h-5" />
                  <span>Share Success</span>
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors border border-white/20"
              >
                <span>Close</span>
              </motion.button>
            </motion.div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 pointer-events-none">
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity }
                }}
              >
                <StarIcon className="w-8 h-8 text-yellow-400" />
              </motion.div>
            </div>

            <div className="absolute -bottom-4 -left-4 pointer-events-none">
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <HeartIcon className="w-6 h-6 text-pink-400" />
              </motion.div>
            </div>
          </BlurCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
