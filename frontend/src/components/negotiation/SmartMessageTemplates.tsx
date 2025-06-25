import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  LightBulbIcon,
  HandThumbUpIcon,
  QuestionMarkCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { BlurCard } from '../ui/BlurCard';
import { ModernButton } from '../ui/ModernButton';

/**
 * SmartMessageTemplates Component - Pre-built message templates for negotiations
 * 
 * Features:
 * - Context-aware message suggestions
 * - Categorized templates by negotiation stage
 * - Customizable template variables
 * - Personality-based messaging options
 */

interface MessageTemplate {
  id: string;
  category: 'opening' | 'negotiation' | 'inquiry' | 'closing' | 'objection';
  title: string;
  content: string;
  variables?: string[];
  tone: 'friendly' | 'professional' | 'direct' | 'enthusiastic';
  situation: string;
  useCase: string;
}

interface SmartMessageTemplatesProps {
  userRole: 'buyer' | 'seller';
  currentOffer?: number;
  listPrice?: number;
  productTitle?: string;
  rounds?: number;
  onSelectTemplate: (message: string) => void;
  className?: string;
}

export const SmartMessageTemplates: React.FC<SmartMessageTemplatesProps> = ({
  userRole,
  currentOffer,
  listPrice,
  productTitle,
  rounds = 0,
  onSelectTemplate,
  className = ""
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MessageTemplate['category']>('negotiation');
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  // Template data based on user role and context
  const getTemplates = (): MessageTemplate[] => {
    const buyerTemplates: MessageTemplate[] = [
      {
        id: 'buyer-opening-1',
        category: 'opening',
        title: 'Interested Buyer',
        content: 'Hi! I\'m really interested in your {productTitle}. Would you consider {offerAmount} for it?',
        variables: ['productTitle', 'offerAmount'],
        tone: 'friendly',
        situation: 'First contact',
        useCase: 'Starting a negotiation'
      },
      {
        id: 'buyer-negotiation-1',
        category: 'negotiation',
        title: 'Counter Offer',
        content: 'I understand your position, but my budget is around {offerAmount}. Can we work something out?',
        variables: ['offerAmount'],
        tone: 'professional',
        situation: 'Mid-negotiation',
        useCase: 'Making a counter-offer'
      },
      {
        id: 'buyer-negotiation-2',
        category: 'negotiation',
        title: 'Budget Constraint',
        content: 'I love the {productTitle}, but {offerAmount} is really the maximum I can spend. Is that workable for you?',
        variables: ['productTitle', 'offerAmount'],
        tone: 'direct',
        situation: 'Budget limitations',
        useCase: 'Explaining price constraints'
      },
      {
        id: 'buyer-inquiry-1',
        category: 'inquiry',
        title: 'Condition Question',
        content: 'Could you tell me more about the condition of the {productTitle}? Any wear or issues I should know about?',
        variables: ['productTitle'],
        tone: 'professional',
        situation: 'Need more info',
        useCase: 'Asking about product details'
      },
      {
        id: 'buyer-closing-1',
        category: 'closing',
        title: 'Final Offer',
        content: 'This is my final offer: {offerAmount}. If you can accept this, I\'m ready to buy today!',
        variables: ['offerAmount'],
        tone: 'direct',
        situation: 'Final round',
        useCase: 'Making final offer'
      },
      {
        id: 'buyer-objection-1',
        category: 'objection',
        title: 'Price Concern',
        content: 'I\'ve seen similar items for less. Would you consider matching {offerAmount} to make this deal work?',
        variables: ['offerAmount'],
        tone: 'professional',
        situation: 'Price comparison',
        useCase: 'Addressing high prices'
      }
    ];

    const sellerTemplates: MessageTemplate[] = [
      {
        id: 'seller-opening-1',
        category: 'opening',
        title: 'Welcome Buyer',
        content: 'Thanks for your interest in my {productTitle}! I\'m open to reasonable offers.',
        variables: ['productTitle'],
        tone: 'friendly',
        situation: 'First contact',
        useCase: 'Greeting potential buyer'
      },
      {
        id: 'seller-negotiation-1',
        category: 'negotiation',
        title: 'Counter Proposal',
        content: 'I appreciate your offer, but {counterAmount} would be more in line with the item\'s value. What do you think?',
        variables: ['counterAmount'],
        tone: 'professional',
        situation: 'Counter-offering',
        useCase: 'Responding to low offers'
      },
      {
        id: 'seller-negotiation-2',
        category: 'negotiation',
        title: 'Value Justification',
        content: 'The {productTitle} is in excellent condition and worth every penny. How about we meet in the middle at {counterAmount}?',
        variables: ['productTitle', 'counterAmount'],
        tone: 'enthusiastic',
        situation: 'Justifying price',
        useCase: 'Explaining item value'
      },
      {
        id: 'seller-inquiry-1',
        category: 'inquiry',
        title: 'Answer Questions',
        content: 'Great question! The {productTitle} is in {condition} condition with {details}. Any other questions?',
        variables: ['productTitle', 'condition', 'details'],
        tone: 'professional',
        situation: 'Providing info',
        useCase: 'Answering buyer questions'
      },
      {
        id: 'seller-closing-1',
        category: 'closing',
        title: 'Accept Offer',
        content: 'Perfect! I accept your offer of {finalAmount}. Let\'s arrange the details!',
        variables: ['finalAmount'],
        tone: 'enthusiastic',
        situation: 'Deal accepted',
        useCase: 'Accepting final offer'
      }
    ];

    return userRole === 'buyer' ? buyerTemplates : sellerTemplates;
  };

  const templates = getTemplates();
  const filteredTemplates = templates.filter(t => t.category === selectedCategory);

  // Replace template variables with actual values
  const processTemplate = (template: MessageTemplate) => {
    let processed = template.content;
    
    if (template.variables?.includes('productTitle') && productTitle) {
      processed = processed.replace('{productTitle}', productTitle);
    }
    
    if (template.variables?.includes('offerAmount') && currentOffer) {
      processed = processed.replace('{offerAmount}', `$${currentOffer.toLocaleString()}`);
    }
    
    if (template.variables?.includes('counterAmount') && listPrice && currentOffer) {
      const counterAmount = Math.round((listPrice + currentOffer) / 2);
      processed = processed.replace('{counterAmount}', `$${counterAmount.toLocaleString()}`);
    }

    if (template.variables?.includes('finalAmount') && currentOffer) {
      processed = processed.replace('{finalAmount}', `$${currentOffer.toLocaleString()}`);
    }
    
    // Remove any remaining placeholder variables
    processed = processed.replace(/\{[^}]+\}/g, '[value]');
    
    return processed;
  };

  const categories = [
    { id: 'opening', label: 'Opening', icon: <HandThumbUpIcon className="w-4 h-4" /> },
    { id: 'negotiation', label: 'Negotiation', icon: <ChatBubbleLeftRightIcon className="w-4 h-4" /> },
    { id: 'inquiry', label: 'Questions', icon: <QuestionMarkCircleIcon className="w-4 h-4" /> },
    { id: 'closing', label: 'Closing', icon: <SparklesIcon className="w-4 h-4" /> },
    { id: 'objection', label: 'Objections', icon: <ExclamationCircleIcon className="w-4 h-4" /> }
  ] as const;

  const getToneColor = (tone: MessageTemplate['tone']) => {
    switch (tone) {
      case 'friendly': return 'text-green-400';
      case 'professional': return 'text-blue-400';
      case 'direct': return 'text-orange-400';
      case 'enthusiastic': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <BlurCard className={`p-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-6">
        <LightBulbIcon className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-semibold text-white">Smart Message Templates</h3>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-500/30 text-blue-300 border border-blue-400/30'
                : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/20'
            }`}
          >
            {category.icon}
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      {/* Templates */}
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {filteredTemplates.map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="border border-white/20 rounded-lg overflow-hidden"
            >
              <div 
                className="p-4 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                onClick={() => setExpandedTemplate(
                  expandedTemplate === template.id ? null : template.id
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium text-white">{template.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full bg-opacity-20 ${getToneColor(template.tone)}`}>
                      {template.tone}
                    </span>
                  </div>
                  <span className="text-white/60 text-sm">{template.situation}</span>
                </div>
                
                <p className="text-white/70 text-sm mt-2 line-clamp-2">
                  {processTemplate(template)}
                </p>
              </div>

              <AnimatePresence>
                {expandedTemplate === template.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/20"
                  >
                    <div className="p-4 space-y-3">
                      <div>
                        <span className="text-white/60 text-sm">Full Message:</span>
                        <p className="text-white mt-1">{processTemplate(template)}</p>
                      </div>
                      
                      <div>
                        <span className="text-white/60 text-sm">Use Case:</span>
                        <p className="text-white/80 text-sm mt-1">{template.useCase}</p>
                      </div>

                      <ModernButton
                        onClick={() => onSelectTemplate(processTemplate(template))}
                        className="w-full"
                        variant="primary"
                      >
                        Use This Template
                      </ModernButton>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8 text-white/60">
            No templates available for this category
          </div>
        )}
      </div>
    </BlurCard>
  );
};
