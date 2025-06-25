import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ModernButton } from '../ui/ModernButton';
import { GlassInput } from '../ui/GlassInput';
import { BlurCard } from '../ui/BlurCard';
import { cn } from '../../utils/cn';
import {
  PaperAirplaneIcon,
  CurrencyDollarIcon,
  FaceSmileIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';

/**
 * MessageInput Component - Message input with auto-resize and offer support
 * 
 * Features:
 * - Auto-resize textarea
 * - Emoji support
 * - Offer button for buyers
 * - Send on Enter (Shift+Enter for new line)
 * - Character counter
 * - Modern blur design
 */

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onSendOffer: (amount: number, message?: string) => void;
  placeholder?: string;
  disabled?: boolean;
  showOfferButton?: boolean;
  maxPrice?: number;
  className?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onSendOffer,
  placeholder = "Type your message...",
  disabled = false,
  showOfferButton = false,
  maxPrice,
  className
}) => {
  const [message, setMessage] = useState('');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const offerInputRef = useRef<HTMLInputElement>(null);

  const maxLength = 1000;
  const isNearLimit = message.length > maxLength * 0.8;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Focus offer input when modal opens
  useEffect(() => {
    if (showOfferModal && offerInputRef.current) {
      offerInputRef.current.focus();
    }
  }, [showOfferModal]);

  const handleSendMessage = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleSendOffer = () => {
    const amount = parseFloat(offerAmount);
    if (amount > 0 && !disabled) {
      onSendOffer(amount, message.trim() || undefined);
      setMessage('');
      setOfferAmount('');
      setShowOfferModal(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showOfferModal) {
        handleSendOffer();
      } else {
        handleSendMessage();
      }
    }
  };

  const commonEmojis = ['😊', '👍', '👎', '🤔', '😂', '😮', '💰', '🔥', '✅', '❌'];

  const handleEmojiClick = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  return (
    <div className={cn('relative', className)}>
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-full mb-2 left-0 bg-black/40 backdrop-blur-xl rounded-lg p-3 border border-white/20"
        >
          <div className="grid grid-cols-5 gap-2">
            {commonEmojis.map((emoji) => (
              <motion.button
                key={emoji}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleEmojiClick(emoji)}
                className="text-lg hover:bg-white/10 rounded p-1 transition-colors"
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Offer Modal */}
      {showOfferModal && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full mb-2 left-0 right-0"
        >
          <BlurCard variant="elevated" className="p-4">
            <h3 className="text-white font-semibold mb-3">Make an Offer</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-white/80 text-sm mb-1">
                  Offer Amount
                </label>
                <div className="relative">
                  <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                  <input
                    ref={offerInputRef}
                    type="number"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="0.00"
                    min="1"
                    max={maxPrice}
                    className="w-full pl-10 pr-4 py-2 bg-white/15 border border-white/25 rounded-lg text-white placeholder-white/50 focus:bg-white/20 focus:border-white/40 transition-colors"
                  />
                </div>
                {maxPrice && (
                  <p className="text-white/60 text-xs mt-1">
                    Maximum: ${maxPrice.toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex space-x-2">
                <ModernButton
                  onClick={handleSendOffer}
                  disabled={!offerAmount || parseFloat(offerAmount) <= 0}
                  size="sm"
                  className="flex-1"
                >
                  Send Offer
                </ModernButton>
                <ModernButton
                  onClick={() => setShowOfferModal(false)}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </ModernButton>
              </div>
            </div>
          </BlurCard>
        </motion.div>
      )}

      {/* Main Input Area */}
      <div className="flex items-end space-x-2">
        {/* Message Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              'w-full px-4 py-3 pr-20 resize-none',
              'bg-white/15 border border-white/25 rounded-xl',
              'text-white placeholder-white/50',
              'focus:bg-white/20 focus:border-white/40 focus:outline-none',
              'transition-colors duration-200',
              'scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          />

          {/* Input Actions */}
          <div className="absolute right-2 bottom-2 flex items-center space-x-1">
            {/* Emoji Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={disabled}
              className="p-1 text-white/60 hover:text-white transition-colors disabled:opacity-50"
            >
              <FaceSmileIcon className="w-4 h-4" />
            </motion.button>

            {/* Character Counter */}
            <span className={cn(
              'text-xs px-1',
              isNearLimit ? 'text-yellow-400' : 'text-white/50'
            )}>
              {message.length}/{maxLength}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {/* Offer Button */}
          {showOfferButton && (
            <ModernButton
              onClick={() => setShowOfferModal(!showOfferModal)}
              disabled={disabled}
              variant="outline"
              size="sm"
              className="px-3"
            >
              <CurrencyDollarIcon className="w-4 h-4" />
            </ModernButton>
          )}

          {/* Send Button */}
          <ModernButton
            onClick={showOfferModal ? handleSendOffer : handleSendMessage}
            disabled={disabled || (!message.trim() && !showOfferModal) || (showOfferModal && !offerAmount)}
            size="sm"
            className="px-3"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </ModernButton>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
