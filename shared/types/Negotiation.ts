// Negotiation type definitions for Smart Marketplace
import { User } from './User';
import { Product } from './Product';

export interface Negotiation {
  _id: string;
  product: Product;
  buyer: {
    _id: string;
    username: string;
    avatar?: string;
  };
  seller: {
    _id: string;
    username: string;
    avatar?: string;
  };
  messages: NegotiationMessage[];
  status: NegotiationStatus;
  currentOffer: {
    amount: number;
    currency: string;
    offeredBy: 'buyer' | 'seller' | 'ai';
    offeredAt: Date;
  };
  finalPrice?: number;
  rounds: number;
  maxRounds: number;
  aiContext: AIContext;
  analytics: NegotiationAnalytics;
  createdAt: Date;
  updatedAt: Date;
  concludedAt?: Date;
}

export enum NegotiationStatus {
  INITIATED = 'initiated',
  IN_PROGRESS = 'in_progress',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export enum MessageType {
  OFFER = 'offer',
  COUNTER_OFFER = 'counter_offer',
  ACCEPTANCE = 'acceptance',
  REJECTION = 'rejection',
  MESSAGE = 'message',
  SYSTEM = 'system'
}

export enum MessageSender {
  BUYER = 'buyer',
  SELLER = 'seller',
  AI = 'ai',
  SYSTEM = 'system'
}

export interface NegotiationMessage {
  _id: string;
  type: MessageType;
  sender: MessageSender;
  senderId?: string;
  content: string;
  offer?: {
    amount: number;
    currency: string;
    reasoning?: string;
  };
  metadata?: {
    aiGenerated: boolean;
    aiModel?: string;
    aiPromptId?: string;
    confidence?: number;
    processingTime?: number;
  };
  reactions?: MessageReaction[];
  isRead: boolean;
  timestamp: Date;
}

export interface MessageReaction {
  userId: string;
  reaction: '👍' | '👎' | '😊' | '😞' | '🤔' | '✅' | '❌';
  timestamp: Date;
}

export interface AIContext {
  personality: string;
  negotiationStrategy: string;
  priceFlexibility: number; // 0-1 scale
  urgencyLevel: number; // 0-1 scale
  marketContext?: {
    averagePrice?: number;
    competitorPrices?: number[];
    demand?: 'low' | 'medium' | 'high';
  };
  conversationHistory: string[];
  userPreferences?: {
    communicationStyle?: string;
    pricePreferences?: string;
  };
}

export interface NegotiationAnalytics {
  initialOffer: number;
  finalOffer?: number;
  offerCount: number;
  averageResponseTime: number;
  priceMovement: {
    direction: 'up' | 'down' | 'stable';
    magnitude: number;
    percentage: number;
  };
  sentimentAnalysis?: {
    overall: 'positive' | 'neutral' | 'negative';
    trend: 'improving' | 'stable' | 'declining';
    confidence: number;
  };
}

export interface StartNegotiationData {
  productId: string;
  initialOffer: number;
  message?: string;
}

export interface SendOfferData {
  negotiationId: string;
  amount: number;
  message?: string;
}

export interface SendMessageData {
  negotiationId: string;
  content: string;
  type?: MessageType;
}

export interface AIResponse {
  content: string;
  offer?: {
    amount: number;
    reasoning: string;
  };
  action: 'continue' | 'accept' | 'reject' | 'counter';
  confidence: number;
  metadata: {
    model: string;
    promptId: string;
    processingTime: number;
    tokensUsed: number;
  };
}

export interface NegotiationFilters {
  status?: NegotiationStatus[];
  productId?: string;
  buyerId?: string;
  sellerId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  sortBy?: 'date' | 'price' | 'status' | 'rounds';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface NegotiationSearchResult {
  negotiations: Negotiation[];
  total: number;
  page: number;
  pages: number;
  hasMore: boolean;
}

export interface NegotiationSummary {
  total: number;
  byStatus: Record<NegotiationStatus, number>;
  averagePrice: number;
  averageRounds: number;
  successRate: number;
  averageTime: number;
}

// Real-time events
export interface SocketEvents {
  'negotiation:join': (negotiationId: string) => void;
  'negotiation:leave': (negotiationId: string) => void;
  'negotiation:message': (message: NegotiationMessage) => void;
  'negotiation:offer': (offer: SendOfferData) => void;
  'negotiation:typing': (data: { negotiationId: string; isTyping: boolean }) => void;
  'negotiation:status-change': (data: { negotiationId: string; status: NegotiationStatus }) => void;
}

export interface TypingIndicator {
  negotiationId: string;
  userId: string;
  username: string;
  isTyping: boolean;
  timestamp: Date;
}
