/**
 * Negotiation Components - Day 15 Interactive Negotiation Features
 * 
 * A comprehensive set of components for interactive negotiation experiences:
 * - PriceInput: Smart price input with validation and suggestions
 * - QuickActions: Quick action buttons for common responses
 * - NegotiationProgress: Visual progress indicator with feedback
 * - DealSummary: Complete deal summary with modern blur backgrounds
 * - CounterOfferSuggestions: Smart counter-offer suggestion system
 * - NegotiationTimeline: Visual timeline of negotiation events
 * - SuccessCelebration: Animated celebration for successful deals
 */

export { PriceInput } from './PriceInput';
export { QuickActions } from './QuickActions';
export { NegotiationProgress } from './NegotiationProgress';
export { DealSummary } from './DealSummary';
export { CounterOfferSuggestions } from './CounterOfferSuggestions';
export { NegotiationTimeline } from './NegotiationTimeline';
export { SuccessCelebration } from './SuccessCelebration';
export { NegotiationInterface } from './NegotiationInterface';
export { PriceHistoryChart } from './PriceHistoryChart';
export { SmartMessageTemplates } from './SmartMessageTemplates';

// Component types for external usage
export type { CounterOfferSuggestion } from './CounterOfferSuggestions';
export type { TimelineEvent } from './NegotiationTimeline';
