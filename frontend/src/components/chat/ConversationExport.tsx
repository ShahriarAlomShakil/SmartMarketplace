import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlurCard } from '../ui/BlurCard';
import { ModernButton } from '../ui/ModernButton';
import { cn } from '../../utils/cn';
import {
  ArrowDownTrayIcon,
  ShareIcon,
  DocumentTextIcon,
  PhotoIcon,
  CodeBracketIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { negotiationAPI } from '../../utils/api';
import { NegotiationMessage } from '../../../../shared/types/Negotiation';

interface ConversationExportProps {
  negotiationId: string;
  messages: NegotiationMessage[];
  productTitle: string;
  className?: string;
  onExportComplete?: (exportData: any) => void;
}

export interface ExportFormat {
  type: 'json' | 'csv' | 'pdf' | 'txt' | 'html';
  label: string;
  description: string;
  icon: React.ComponentType<any>;
}

export const ConversationExport: React.FC<ConversationExportProps> = ({
  negotiationId,
  messages,
  productTitle,
  className,
  onExportComplete
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');
  const [exportFormat, setExportFormat] = useState<ExportFormat['type']>('json');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeAnalytics, setIncludeAnalytics] = useState(false);

  const exportFormats: ExportFormat[] = [
    {
      type: 'json',
      label: 'JSON',
      description: 'Machine-readable format with full data',
      icon: CodeBracketIcon
    },
    {
      type: 'csv',
      label: 'CSV',
      description: 'Spreadsheet format for analysis',
      icon: DocumentTextIcon
    },
    {
      type: 'pdf',
      label: 'PDF',
      description: 'Formatted document for sharing',
      icon: DocumentTextIcon
    },
    {
      type: 'txt',
      label: 'Text',
      description: 'Plain text conversation',
      icon: DocumentTextIcon
    },
    {
      type: 'html',
      label: 'HTML',
      description: 'Web page with styling',
      icon: PhotoIcon
    }
  ];

  const handleExport = useCallback(async () => {
    if (isExporting) return;

    try {
      setIsExporting(true);
      setExportStatus('exporting');
      setExportProgress(0);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          const next = prev + 10;
          return next >= 90 ? 90 : next;
        });
      }, 200);

      // Prepare export data
      const exportData: any = {
        negotiationId,
        productTitle,
        exportedAt: new Date().toISOString(),
        format: exportFormat,
        includeMetadata,
        includeAnalytics,
        messages: messages.map(msg => ({
          id: msg._id,
          timestamp: msg.timestamp,
          sender: (msg as any).senderInfo?.username || msg.senderId || 'Unknown',
          content: msg.content,
          type: msg.type,
          offer: msg.offer
        }))
      };

      // Add metadata if requested
      if (includeMetadata) {
        const participantsSet = new Set(messages.map(m => (m as any).senderInfo?.username || m.senderId).filter(Boolean));
        exportData.metadata = {
          totalMessages: messages.length,
          duration: messages.length > 0 ? 
            new Date(messages[messages.length - 1].timestamp).getTime() - 
            new Date(messages[0].timestamp).getTime() : 0,
          participants: Array.from(participantsSet)
        };
      }

      // Add analytics if requested
      if (includeAnalytics) {
        try {
          // Add analytics data - would need to implement getAnalytics endpoint
          exportData.analytics = {
            messageCount: messages.length,
            averageResponseTime: 0,
            sentiment: 'neutral'
          };
        } catch (error) {
          console.warn('Analytics not available:', error);
        }
      }

      // Generate file based on format
      let blob: Blob;
      let filename: string;

      switch (exportFormat) {
        case 'json':
          blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          filename = `conversation_${negotiationId}_${Date.now()}.json`;
          break;
        
        case 'csv':
          const csvContent = generateCSV(exportData.messages);
          blob = new Blob([csvContent], { type: 'text/csv' });
          filename = `conversation_${negotiationId}_${Date.now()}.csv`;
          break;
        
        case 'txt':
          const txtContent = generateText(exportData);
          blob = new Blob([txtContent], { type: 'text/plain' });
          filename = `conversation_${negotiationId}_${Date.now()}.txt`;
          break;
        
        case 'html':
          const htmlContent = generateHTML(exportData);
          blob = new Blob([htmlContent], { type: 'text/html' });
          filename = `conversation_${negotiationId}_${Date.now()}.html`;
          break;
        
        default:
          throw new Error('Unsupported export format');
      }

      clearInterval(progressInterval);
      setExportProgress(100);

      // Download file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportStatus('success');
      onExportComplete?.(exportData);

      // Reset after delay
      setTimeout(() => {
        setExportStatus('idle');
        setExportProgress(0);
      }, 3000);

    } catch (error) {
      console.error('Export error:', error);
      setExportStatus('error');
      setTimeout(() => {
        setExportStatus('idle');
        setExportProgress(0);
      }, 3000);
    } finally {
      setIsExporting(false);
    }
  }, [
    negotiationId,
    messages,
    productTitle,
    exportFormat,
    includeMetadata,
    includeAnalytics,
    isExporting,
    onExportComplete
  ]);

  const generateCSV = (messages: any[]) => {
    const headers = ['Timestamp', 'Sender', 'Type', 'Content', 'Offer Amount'];
    const rows = messages.map(msg => [
      new Date(msg.timestamp).toISOString(),
      msg.sender,
      msg.type,
      `"${msg.content.replace(/"/g, '""')}"`,
      msg.offer?.amount || ''
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generateText = (data: any) => {
    let content = `Conversation Export\n`;
    content += `Product: ${data.productTitle}\n`;
    content += `Exported: ${new Date(data.exportedAt).toLocaleString()}\n`;
    content += `\n${'='.repeat(50)}\n\n`;
    
    data.messages.forEach((msg: any) => {
      content += `[${new Date(msg.timestamp).toLocaleString()}] ${msg.sender}:\n`;
      content += `${msg.content}\n`;
      if (msg.offer) {
        content += `💰 Offer: $${msg.offer.amount}\n`;
      }
      content += '\n';
    });
    
    return content;
  };

  const generateHTML = (data: any) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Conversation Export - ${data.productTitle}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 40px; }
        .header { border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px; }
        .message { margin-bottom: 20px; padding: 15px; background: #f9fafb; border-radius: 8px; }
        .sender { font-weight: bold; color: #1f2937; }
        .timestamp { color: #6b7280; font-size: 0.875rem; }
        .offer { background: #fef3c7; padding: 8px; border-radius: 4px; margin-top: 8px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Conversation Export</h1>
        <p><strong>Product:</strong> ${data.productTitle}</p>
        <p><strong>Exported:</strong> ${new Date(data.exportedAt).toLocaleString()}</p>
    </div>
    <div class="messages">
        ${data.messages.map((msg: any) => `
            <div class="message">
                <div class="sender">${msg.sender}</div>
                <div class="timestamp">${new Date(msg.timestamp).toLocaleString()}</div>
                <div class="content">${msg.content}</div>
                ${msg.offer ? `<div class="offer">💰 Offer: $${msg.offer.amount}</div>` : ''}
            </div>
        `).join('')}
    </div>
</body>
</html>`;
  };

  const copyToClipboard = async () => {
    try {
      const textContent = generateText({
        productTitle,
        exportedAt: new Date().toISOString(),
        messages
      });
      
      await navigator.clipboard.writeText(textContent);
      // Could add toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <BlurCard className={cn("p-6", className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Export Conversation
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Download or share conversation data
            </p>
          </div>
          <div className="flex space-x-2">
            <ModernButton
              onClick={copyToClipboard}
              variant="secondary"
              size="sm"
              className="flex items-center space-x-2"
            >
              <ClipboardDocumentIcon className="w-4 h-4" />
              <span>Copy</span>
            </ModernButton>
          </div>
        </div>

        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Export Format
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {exportFormats.map((format) => {
              const Icon = format.icon;
              return (
                <motion.button
                  key={format.type}
                  onClick={() => setExportFormat(format.type)}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all duration-200 text-left",
                    exportFormat === format.type
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {format.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {format.description}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Export Options
          </label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Include metadata (timestamps, statistics)
              </span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeAnalytics}
                onChange={(e) => setIncludeAnalytics(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Include analytics data
              </span>
            </label>
          </div>
        </div>

        {/* Progress */}
        <AnimatePresence>
          {isExporting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Exporting...</span>
                <span className="text-gray-600 dark:text-gray-400">{exportProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-blue-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${exportProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Messages */}
        <AnimatePresence>
          {exportStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-2 text-green-600 dark:text-green-400 text-sm"
            >
              <CheckCircleIcon className="w-5 h-5" />
              <span>Export completed successfully!</span>
            </motion.div>
          )}
          {exportStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm"
            >
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span>Export failed. Please try again.</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Export Button */}
        <ModernButton
          onClick={handleExport}
          disabled={isExporting}
          className="w-full flex items-center justify-center space-x-2"
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
          <span>
            {isExporting ? 'Exporting...' : `Export as ${exportFormat.toUpperCase()}`}
          </span>
        </ModernButton>
      </div>
    </BlurCard>
  );
};
