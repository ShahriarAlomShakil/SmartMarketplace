// Product type definitions for Smart Marketplace
export interface Product {
  _id: string;
  title: string;
  description: string;
  category: ProductCategory;
  condition: ProductCondition;
  images: ProductImage[];
  pricing: ProductPricing;
  seller?: {
    _id: string;
    username: string;
    avatar?: string;
    profile?: {
      rating?: {
        average: number;
        count: number;
        reviews: any[];
      };
    };
    totalSales?: number;
  } | null;
  specifications: ProductSpecification[];
  tags: string[];
  location: {
    city?: string;
    state?: string;
    country?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  status: ProductStatus;
  analytics: ProductAnalytics;
  negotiationSettings: NegotiationSettings;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export enum ProductCategory {
  ELECTRONICS = 'electronics',
  CLOTHING = 'clothing',
  HOME_GARDEN = 'home_garden',
  AUTOMOTIVE = 'automotive',
  SPORTS = 'sports',
  BOOKS = 'books',
  TOYS_GAMES = 'toys_games',
  HEALTH_BEAUTY = 'health_beauty',
  JEWELRY = 'jewelry',
  ART_COLLECTIBLES = 'art_collectibles',
  MUSICAL_INSTRUMENTS = 'musical_instruments',
  OTHER = 'other'
}

export enum ProductCondition {
  NEW = 'new',
  LIKE_NEW = 'like_new',
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  FOR_PARTS = 'for_parts'
}

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  SOLD = 'sold',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
  DELETED = 'deleted'
}

export interface ProductImage {
  _id: string;
  url: string;
  publicId: string;
  alt?: string;
  isMain: boolean;
  order: number;
  size: number;
  dimensions: {
    width: number;
    height: number;
  };
}

export interface ProductPricing {
  basePrice: number;
  minPrice: number;
  currency: string;
  negotiable: boolean;
  urgencyLevel: UrgencyLevel;
  priceHistory: PriceHistoryEntry[];
}

export enum UrgencyLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface PriceHistoryEntry {
  price: number;
  date: Date;
  reason?: string;
}

export interface ProductSpecification {
  name: string;
  value: string;
  unit?: string;
  category?: string;
}

export interface ProductAnalytics {
  views: number;
  favorites: number;
  inquiries: number;
  negotiations: number;
  averageOfferPrice: number;
  timeToSell?: number;
  conversionRate: number;
  lastViewed: Date;
}

export interface NegotiationSettings {
  enabled: boolean;
  maxRounds: number;
  autoAcceptThreshold?: number;
  aiPersonality: AIPersonality;
  responseTime: ResponseTime;
  allowCounterOffers: boolean;
}

export enum AIPersonality {
  FRIENDLY = 'friendly',
  PROFESSIONAL = 'professional',
  FIRM = 'firm',
  FLEXIBLE = 'flexible'
}

export enum ResponseTime {
  IMMEDIATE = 'immediate',
  FAST = 'fast',
  NORMAL = 'normal',
  SLOW = 'slow'
}

export interface CreateProductData {
  title: string;
  description: string;
  category: ProductCategory;
  condition: ProductCondition;
  basePrice: number;
  minPrice: number;
  currency: string;
  images: File[];
  specifications?: ProductSpecification[];
  tags?: string[];
  location?: Product['location'];
  negotiationSettings?: Partial<NegotiationSettings>;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  _id: string;
}

export interface ProductFilters {
  category?: ProductCategory;
  condition?: ProductCondition[];
  priceRange?: {
    min: number;
    max: number;
  };
  location?: string;
  search?: string;
  sortBy?: 'price' | 'date' | 'popularity' | 'rating';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductSearchResult {
  products: Product[];
  total: number;
  page: number;
  pages: number;
  hasMore: boolean;
}
