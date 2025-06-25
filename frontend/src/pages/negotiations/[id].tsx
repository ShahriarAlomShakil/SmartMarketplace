import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Layout } from '../../components/Layout';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { ChatBox } from '../../components/chat/ChatBox';
import { BlurCard } from '../../components/ui/BlurCard';
import { ModernButton } from '../../components/ui/ModernButton';
import { ModernBadge } from '../../components/ui/ModernBadge';
import { BackdropBlur } from '../../components/ui/BackdropBlur';
import { ModernLoading } from '../../components/ui/ModernLoading';
import { ErrorAlert } from '../../components/ui/ErrorHandling';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../contexts/AuthContext';
import { negotiationAPI } from '../../utils/api';
import { Negotiation, NegotiationMessage, MessageType, NegotiationStatus } from '../../../../shared/types/Negotiation';
import { cn } from '../../utils/cn';
import {
  ArrowLeftIcon,
  ShareIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

/**
 * Negotiation Page - Real-time chat interface for product negotiations
 * 
 * Features:
 * - Full-screen chat interface with modern blur design
 * - Real-time messaging with typing indicators
 * - Negotiation status and progress tracking
 * - Price offer handling with AI responses
 * - Mobile-responsive design
 * - Connection status monitoring
 */

const NegotiationPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { id: negotiationId } = router.query;
  
  const [negotiation, setNegotiation] = useState<Negotiation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chat hook for real-time messaging
  const {
    messages,
    isLoading: chatLoading,
    isTyping,
    typingUser,
    connectionStatus,
    sendMessage,
    sendOffer,
    error: chatError
  } = useChat({
    negotiationId: negotiationId as string,
    currentUserRole: negotiation?.buyer._id === user?._id ? 'buyer' : 'seller',
    onMessageReceived: (message: NegotiationMessage) => {
      console.log('New message received:', message);
    },
    onTypingChanged: (isTyping: boolean, user: string) => {
      console.log('Typing status changed:', isTyping, user);
    }
  });

  // Load negotiation data
  useEffect(() => {
    const loadNegotiation = async () => {
      if (!negotiationId || typeof negotiationId !== 'string') return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await negotiationAPI.getById(negotiationId);
        const loadedNegotiation = response.data.negotiation;
        
        // Check if user can access this negotiation
        if (loadedNegotiation.buyer._id !== user?._id && loadedNegotiation.seller._id !== user?._id) {
          throw new Error('You do not have permission to view this negotiation');
        }
        
        setNegotiation(loadedNegotiation);
      } catch (error) {
        console.error('Failed to load negotiation:', error);
        setError(error instanceof Error ? error.message : 'Failed to load negotiation');
      } finally {
        setLoading(false);
      }
    };

    loadNegotiation();
  }, [negotiationId, user?._id]);

  // Handle message sending
  const handleSendMessage = async (message: string, type?: MessageType) => {
    try {
      await sendMessage(message, type);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Handle offer sending
  const handleSendOffer = async (amount: number, message?: string) => {
    try {
      await sendOffer(amount, message);
    } catch (error) {
      console.error('Failed to send offer:', error);
    }
  };

  // Handle going back
  const handleGoBack = () => {
    router.back();
  };

  // Handle sharing negotiation (for completed deals)
  const handleShare = () => {
    if (navigator.share && negotiation) {
      navigator.share({
        title: `Deal for ${negotiation.product.title}`,
        text: `Check out this successful negotiation on Smart Marketplace!`,
        url: window.location.href
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You might want to show a toast notification here
    }
  };

  // Get status configuration
  const getStatusConfig = (status: NegotiationStatus) => {
    switch (status) {
      case NegotiationStatus.ACCEPTED:
        return {
          icon: <CheckCircleIcon className="w-5 h-5" />,
          badge: 'success' as const,
          text: 'Deal Completed',
          bgClass: 'bg-green-500/10 border-green-400/30',
          textClass: 'text-green-100'
        };
      case NegotiationStatus.REJECTED:
        return {
          icon: <XCircleIcon className="w-5 h-5" />,
          badge: 'error' as const,
          text: 'Offer Rejected',
          bgClass: 'bg-red-500/10 border-red-400/30',
          textClass: 'text-red-100'
        };
      case NegotiationStatus.CANCELLED:
        return {
          icon: <ExclamationTriangleIcon className="w-5 h-5" />,
          badge: 'warning' as const,
          text: 'Negotiation Cancelled',
          bgClass: 'bg-yellow-500/10 border-yellow-400/30',
          textClass: 'text-yellow-100'
        };
      case NegotiationStatus.EXPIRED:
        return {
          icon: <ClockIcon className="w-5 h-5" />,
          badge: 'warning' as const,
          text: 'Negotiation Expired',
          bgClass: 'bg-orange-500/10 border-orange-400/30',
          textClass: 'text-orange-100'
        };
      case NegotiationStatus.IN_PROGRESS:
        return {
          icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />,
          badge: 'info' as const,
          text: 'Active Negotiation',
          bgClass: 'bg-blue-500/10 border-blue-400/30',
          textClass: 'text-blue-100'
        };
      default:
        return {
          icon: <SparklesIcon className="w-5 h-5" />,
          badge: 'info' as const,
          text: 'Negotiation Started',
          bgClass: 'bg-purple-500/10 border-purple-400/30',
          textClass: 'text-purple-100'
        };
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <ModernLoading size="lg" />
        </div>
      </Layout>
    );
  }

  if (error || !negotiation) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <BlurCard variant="elevated" className="max-w-md w-full p-6 text-center">
            <ErrorAlert 
              title="Failed to Load Negotiation"
              message={error || 'Negotiation not found'}
            />
            <ModernButton 
              onClick={handleGoBack} 
              variant="outline" 
              className="mt-4"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Go Back
            </ModernButton>
          </BlurCard>
        </div>
      </Layout>
    );
  }

  const statusConfig = getStatusConfig(negotiation.status);
  const currentUserRole = negotiation.buyer._id === user?._id ? 'buyer' : 'seller';
  const otherUser = currentUserRole === 'buyer' ? negotiation.seller : negotiation.buyer;

  return (
    <>
      <Head>
        <title>Negotiation - {negotiation.product.title} - Smart Marketplace</title>
        <meta name="description" content={`Negotiate for ${negotiation.product.title} on Smart Marketplace`} />
      </Head>

      <ProtectedRoute requireAuth={true}>
        <Layout>
          <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-0 z-10 backdrop-blur-xl bg-black/20 border-b border-white/10"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  {/* Back Button */}
                  <ModernButton 
                    onClick={handleGoBack}
                    variant="ghost"
                    size="sm"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back
                  </ModernButton>

                  {/* Status Badge */}
                  <div className={cn(
                    'flex items-center space-x-3 px-4 py-2 rounded-full border',
                    statusConfig.bgClass
                  )}>
                    {statusConfig.icon}
                    <ModernBadge variant={statusConfig.badge} size="sm">
                      {statusConfig.text}
                    </ModernBadge>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {negotiation.status === NegotiationStatus.ACCEPTED && (
                      <ModernButton 
                        onClick={handleShare}
                        variant="ghost"
                        size="sm"
                      >
                        <ShareIcon className="w-4 h-4" />
                      </ModernButton>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
                
                {/* Negotiation Info Sidebar */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="lg:col-span-1 space-y-4"
                >
                  {/* Product Info */}
                  <BlurCard variant="elevated" className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Product Details</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        {negotiation.product.images?.[0] && (
                          <img
                            src={negotiation.product.images[0].url}
                            alt={negotiation.product.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">
                            {negotiation.product.title}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <CurrencyDollarIcon className="w-4 h-4 text-white/60" />
                            <span className="text-white/80 text-sm">
                              ${negotiation.product.pricing.basePrice.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </BlurCard>

                  {/* Negotiation Stats */}
                  <BlurCard variant="elevated" className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Negotiation Progress</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/70">Round</span>
                        <span className="text-white font-medium">
                          {negotiation.rounds}/{negotiation.maxRounds}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-white/70">Current Offer</span>
                        <span className="text-white font-medium">
                          ${negotiation.currentOffer?.amount?.toLocaleString() || 'None'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-white/70">Final Price</span>
                        <span className="text-white font-medium">
                          {negotiation.finalPrice 
                            ? `$${negotiation.finalPrice.toLocaleString()}`
                            : 'Pending'
                          }
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-white/70">Started</span>
                        <span className="text-white/80 text-sm">
                          {new Date(negotiation.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </BlurCard>

                  {/* Participants */}
                  <BlurCard variant="elevated" className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Participants</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500/30 rounded-full flex items-center justify-center">
                          <span className="text-blue-300 text-sm font-medium">
                            {negotiation.buyer.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">
                            {negotiation.buyer.username}
                          </p>
                          <p className="text-white/60 text-xs">Buyer</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center">
                          <span className="text-purple-300 text-sm font-medium">
                            {negotiation.seller.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">
                            {negotiation.seller.username}
                          </p>
                          <p className="text-white/60 text-xs">Seller</p>
                        </div>
                      </div>
                    </div>
                  </BlurCard>
                </motion.div>

                {/* Chat Interface */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="lg:col-span-3"
                >
                  {chatError && (
                    <ErrorAlert 
                      title="Chat Connection Error"
                      message={chatError}
                      className="mb-4"
                    />
                  )}
                  
                  <ChatBox
                    negotiationId={negotiation._id}
                    productId={negotiation.product._id}
                    productTitle={negotiation.product.title}
                    productImage={negotiation.product.images?.[0]?.url}
                    productPrice={negotiation.product.pricing.basePrice}
                    sellerName={negotiation.seller.username}
                    sellerAvatar={negotiation.seller.avatar}
                    buyerName={negotiation.buyer.username}
                    buyerAvatar={negotiation.buyer.avatar}
                    messages={messages}
                    currentUserRole={currentUserRole}
                    isTyping={isTyping}
                    typingUser={typingUser}
                    onSendMessage={handleSendMessage}
                    onSendOffer={handleSendOffer}
                    isLoading={chatLoading}
                    connectionStatus={connectionStatus}
                    className="h-full"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    </>
  );
};

export default NegotiationPage;
