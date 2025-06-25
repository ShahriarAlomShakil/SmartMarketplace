import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlurCard } from '../ui/BlurCard';
import { ModernButton } from '../ui/ModernButton';
import { cn } from '../../utils/cn';
import {
  ShareIcon,
  LinkIcon,
  QrCodeIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  EyeIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { negotiationAPI } from '../../utils/api';
import { NegotiationMessage } from '../../../../shared/types/Negotiation';

interface ConversationSharingProps {
  negotiationId: string;
  messages: NegotiationMessage[];
  productTitle: string;
  productImage?: string;
  className?: string;
  onShareComplete?: (shareData: any) => void;
}

interface ShareOption {
  type: 'public' | 'private' | 'anonymous';
  label: string;
  description: string;
  icon: React.ComponentType<any>;
}

export const ConversationSharing: React.FC<ConversationSharingProps> = ({
  negotiationId,
  messages,
  productTitle,
  productImage,
  className,
  onShareComplete
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareType, setShareType] = useState<ShareOption['type']>('private');
  const [expiresIn, setExpiresIn] = useState<number>(7); // days
  const [includePersonalInfo, setIncludePersonalInfo] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle');
  const [copied, setCopied] = useState(false);

  const shareOptions: ShareOption[] = [
    {
      type: 'public',
      label: 'Public Link',
      description: 'Anyone with the link can view',
      icon: LinkIcon
    },
    {
      type: 'private',
      label: 'Private Link',
      description: 'Only specified people can view',
      icon: LockClosedIcon
    },
    {
      type: 'anonymous',
      label: 'Anonymous',
      description: 'No personal information included',
      icon: EyeIcon
    }
  ];

  const expirationOptions = [
    { value: 1, label: '1 day' },
    { value: 7, label: '1 week' },
    { value: 30, label: '1 month' },
    { value: 0, label: 'Never expires' }
  ];

  const createShareLink = useCallback(async () => {
    if (isSharing) return;

    try {
      setIsSharing(true);
      setShareStatus('creating');

      // Prepare share data
      const shareData = {
        negotiationId,
        productTitle,
        productImage,
        type: shareType,
        expiresIn: expiresIn > 0 ? expiresIn * 24 * 60 * 60 * 1000 : null, // Convert to milliseconds
        includePersonalInfo,
        messages: messages.map(msg => ({
          id: msg._id,
          timestamp: msg.timestamp,
          sender: includePersonalInfo ? 
            (msg as any).senderInfo?.username || msg.senderId : 
            msg.senderId === negotiationId ? 'Seller' : 'Buyer',
          content: msg.content,
          type: msg.type,
          offer: msg.offer
        })),
        createdAt: new Date().toISOString()
      };

      // Create share link (simulate API call)
      const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const baseUrl = window.location.origin;
      const generatedUrl = `${baseUrl}/shared/conversations/${shareId}`;

      // Store share data (would normally be an API call)
      localStorage.setItem(`share_${shareId}`, JSON.stringify(shareData));

      setShareUrl(generatedUrl);
      setShareStatus('success');
      onShareComplete?.(shareData);

    } catch (error) {
      console.error('Share creation error:', error);
      setShareStatus('error');
    } finally {
      setIsSharing(false);
    }
  }, [
    negotiationId,
    messages,
    productTitle,
    productImage,
    shareType,
    expiresIn,
    includePersonalInfo,
    isSharing,
    onShareComplete
  ]);

  const copyToClipboard = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const shareViaEmail = () => {
    if (!shareUrl) return;
    
    const subject = encodeURIComponent(`Conversation: ${productTitle}`);
    const body = encodeURIComponent(`Check out this conversation about "${productTitle}": ${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const generateQRCode = () => {
    if (!shareUrl) return;
    
    // Would integrate with QR code library like qrcode
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
    window.open(qrUrl, '_blank');
  };

  const resetShare = () => {
    setShareUrl(null);
    setShareStatus('idle');
    setCopied(false);
  };

  return (
    <BlurCard className={cn("p-6", className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Share Conversation
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Create a shareable link to this conversation
            </p>
          </div>
          <ChatBubbleLeftRightIcon className="w-6 h-6 text-gray-400" />
        </div>

        {!shareUrl ? (
          <div className="space-y-6">
            {/* Share Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Privacy Level
              </label>
              <div className="space-y-3">
                {shareOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <motion.button
                      key={option.type}
                      onClick={() => setShareType(option.type)}
                      className={cn(
                        "w-full p-4 rounded-lg border-2 transition-all duration-200 text-left",
                        shareType === option.type
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      )}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {option.label}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {option.description}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Expiration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Link Expiration
              </label>
              <select
                value={expiresIn}
                onChange={(e) => setExpiresIn(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {expirationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Share Options
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={includePersonalInfo}
                  onChange={(e) => setIncludePersonalInfo(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Include participant names
                </span>
              </label>
            </div>

            {/* Create Button */}
            <ModernButton
              onClick={createShareLink}
              disabled={isSharing}
              className="w-full flex items-center justify-center space-x-2"
            >
              <ShareIcon className="w-5 h-5" />
              <span>
                {isSharing ? 'Creating Link...' : 'Create Share Link'}
              </span>
            </ModernButton>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
              <CheckCircleIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Share link created successfully!</span>
            </div>

            {/* Share URL */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Share Link
              </label>
              <div className="flex space-x-2">
                <div className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {shareUrl}
                  </div>
                </div>
                <ModernButton
                  onClick={copyToClipboard}
                  variant="secondary"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  {copied ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <ClipboardDocumentIcon className="w-4 h-4" />
                  )}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </ModernButton>
              </div>
            </div>

            {/* Share Actions */}
            <div className="flex space-x-3">
              <ModernButton
                onClick={shareViaEmail}
                variant="secondary"
                size="sm"
                className="flex items-center space-x-2"
              >
                <EnvelopeIcon className="w-4 h-4" />
                <span>Email</span>
              </ModernButton>
              <ModernButton
                onClick={generateQRCode}
                variant="secondary"
                size="sm"
                className="flex items-center space-x-2"
              >
                <QrCodeIcon className="w-4 h-4" />
                <span>QR Code</span>
              </ModernButton>
            </div>

            {/* Share Info */}
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <div>Privacy: {shareOptions.find(o => o.type === shareType)?.label}</div>
              <div>
                Expires: {expiresIn > 0 ? 
                  `in ${expiresIn} day${expiresIn !== 1 ? 's' : ''}` : 
                  'Never'
                }
              </div>
              <div>Personal info: {includePersonalInfo ? 'Included' : 'Excluded'}</div>
            </div>

            {/* Reset Button */}
            <ModernButton
              onClick={resetShare}
              variant="secondary"
              size="sm"
              className="w-full"
            >
              Create New Link
            </ModernButton>
          </div>
        )}

        {/* Status Messages */}
        <AnimatePresence>
          {shareStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-red-600 dark:text-red-400 text-sm"
            >
              Failed to create share link. Please try again.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BlurCard>
  );
};
