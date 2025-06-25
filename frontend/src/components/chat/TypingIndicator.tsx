import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

/**
 * TypingIndicator Component - Animated typing indicator with modern blur effects
 * 
 * Features:
 * - Animated dots showing typing activity
 * - User name display
 * - Modern blur background
 * - Smooth animations
 */

interface TypingIndicatorProps {
  userName: string;
  isVisible: boolean;
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  userName,
  isVisible,
  className
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'flex items-center space-x-2 max-w-xs',
        className
      )}
    >
      {/* Avatar Placeholder */}
      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-white/60 text-xs font-medium">
          {userName.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Typing Bubble */}
      <div className="bg-white/15 backdrop-blur-xl border border-white/10 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center space-x-1">
          <span className="text-white/80 text-sm mr-2">
            {userName} is typing
          </span>
          
          {/* Animated Dots */}
          <div className="flex space-x-1">
            {[0, 1, 2].map((dot) => (
              <motion.div
                key={dot}
                className="w-2 h-2 bg-white/60 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  delay: dot * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;
