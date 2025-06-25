import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BlurCard } from '../ui/BlurCard';
import { ModernBadge } from '../ui/ModernBadge';
import { cn } from '../../utils/cn';
import {
  UserIcon,
  SignalIcon,
  SignalSlashIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';

/**
 * ChatHeader Component - Chat header with product info and user details
 * 
 * Features:
 * - Product information display
 * - Participant avatars and names
 * - Connection status indicator
 * - Modern blur design
 * - Responsive layout
 */

interface ChatHeaderProps {
  productTitle: string;
  productImage?: string;
  productPrice: number;
  sellerName: string;
  sellerAvatar?: string;
  buyerName: string;
  buyerAvatar?: string;
  connectionStatus?: 'connected' | 'connecting' | 'disconnected';
  className?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  productTitle,
  productImage,
  productPrice,
  sellerName,
  sellerAvatar,
  buyerName,
  buyerAvatar,
  connectionStatus = 'connected',
  className
}) => {
  const connectionIcon = {
    connected: <SignalIcon className="w-4 h-4 text-green-400" />,
    connecting: <SignalIcon className="w-4 h-4 text-yellow-400 animate-pulse" />,
    disconnected: <SignalSlashIcon className="w-4 h-4 text-red-400" />
  };

  const connectionText = {
    connected: 'Connected',
    connecting: 'Connecting...',
    disconnected: 'Disconnected'
  };

  return (
    <div className={cn(
      'flex items-center justify-between p-4 border-b border-white/15',
      'bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl',
      className
    )}>
      {/* Product Info */}
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {/* Product Image */}
        <div className="relative w-12 h-12 flex-shrink-0">
          {productImage ? (
            <Image
              src={productImage}
              alt={productTitle}
              fill
              className="rounded-lg object-cover"
            />
          ) : (
            <div className="w-full h-full bg-white/20 rounded-lg flex items-center justify-center">
              <ShoppingBagIcon className="w-6 h-6 text-white/60" />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate text-sm lg:text-base">
            {productTitle}
          </h3>
          <div className="flex items-center space-x-2 mt-1">
            <CurrencyDollarIcon className="w-4 h-4 text-white/60" />
            <span className="text-white/80 text-sm font-medium">
              ${productPrice.toLocaleString()}
            </span>
            <ModernBadge variant="info" size="sm">
              Negotiating
            </ModernBadge>
          </div>
        </div>
      </div>

      {/* Participants */}
      <div className="flex items-center space-x-4 flex-shrink-0">
        {/* Buyer */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-2"
        >
          <div className="relative">
            {buyerAvatar ? (
              <Image
                src={buyerAvatar}
                alt={buyerName}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-blue-500/30 rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-blue-300" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white/20" />
          </div>
          <span className="text-white/80 text-sm font-medium hidden sm:block">
            {buyerName}
          </span>
        </motion.div>

        {/* VS Indicator */}
        <div className="text-white/40 text-xs font-bold">VS</div>

        {/* Seller */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-2"
        >
          <div className="relative">
            {sellerAvatar ? (
              <Image
                src={sellerAvatar}
                alt={sellerName}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-purple-300" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white/20" />
          </div>
          <span className="text-white/80 text-sm font-medium hidden sm:block">
            {sellerName}
          </span>
        </motion.div>

        {/* Connection Status */}
        <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-white/15">
          {connectionIcon[connectionStatus]}
          <span className={cn(
            'text-xs font-medium',
            connectionStatus === 'connected' && 'text-green-400',
            connectionStatus === 'connecting' && 'text-yellow-400',
            connectionStatus === 'disconnected' && 'text-red-400'
          )}>
            {connectionText[connectionStatus]}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
