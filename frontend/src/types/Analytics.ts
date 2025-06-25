/**
 * Analytics Type Definitions
 * Comprehensive types for Day 20 analytics system
 */

export interface AnalyticsEvent {
  id: string;
  userId: string;
  sessionId: string;
  eventType: AnalyticsEventType;
  eventName: string;
  properties: Record<string, any>;
  timestamp: Date;
  source: 'web' | 'mobile' | 'api';
  userAgent?: string;
  ip?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
}

export type AnalyticsEventType = 
  | 'page_view'
  | 'user_action'
  | 'negotiation'
  | 'product'
  | 'transaction'
  | 'engagement'
  | 'performance'
  | 'error'
  | 'conversion';

export interface UserAnalytics {
  userId: string;
  period: AnalyticsPeriod;
  metrics: {
    // Activity Metrics
    totalSessions: number;
    totalPageViews: number;
    averageSessionDuration: number;
    bounceRate: number;
    
    // Engagement Metrics
    messagesExchanged: number;
    negotiationsStarted: number;
    negotiationsCompleted: number;
    offersCreated: number;
    offersAccepted: number;
    
    // Commerce Metrics
    totalSpent: number;
    totalEarned: number;
    averageOrderValue: number;
    conversionRate: number;
    
    // Product Metrics
    productsViewed: number;
    productsLiked: number;
    productsShared: number;
    
    // Time-based Metrics
    mostActiveHour: number;
    mostActiveDay: string;
    timeToFirstAction: number;
  };
  trends: {
    [key: string]: {
      current: number;
      previous: number;
      change: number;
      changePercent: number;
    };
  };
  topPages: Array<{
    path: string;
    views: number;
    uniqueViews: number;
    averageTime: number;
  }>;
  deviceInfo: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
}

export interface NegotiationAnalytics {
  negotiationId?: string;
  period: AnalyticsPeriod;
  metrics: {
    // Success Metrics
    totalNegotiations: number;
    successfulDeals: number;
    successRate: number;
    averageRounds: number;
    
    // Time Metrics
    averageNegotiationTime: number;
    timeToFirstOffer: number;
    timeToAcceptance: number;
    
    // Price Metrics
    averageInitialOffer: number;
    averageFinalPrice: number;
    averageDiscount: number;
    priceRange: {
      min: number;
      max: number;
      median: number;
    };
    
    // Communication Metrics
    averageMessages: number;
    messageToOfferRatio: number;
    averageResponseTime: number;
    
    // Outcome Distribution
    outcomes: {
      accepted: number;
      rejected: number;
      expired: number;
      cancelled: number;
    };
  };
  patterns: {
    timeOfDay: Array<{ hour: number; count: number; successRate: number }>;
    dayOfWeek: Array<{ day: string; count: number; successRate: number }>;
    pricePoints: Array<{ range: string; count: number; successRate: number }>;
    categories: Array<{ category: string; count: number; successRate: number }>;
  };
  insights: {
    bestPerformingCategories: string[];
    optimalPriceRanges: string[];
    bestNegotiationTimes: string[];
    recommendedStrategies: string[];
  };
}

export interface ProductAnalytics {
  productId?: string;
  period: AnalyticsPeriod;
  metrics: {
    // Visibility Metrics
    totalViews: number;
    uniqueViews: number;
    viewsToContact: number;
    
    // Engagement Metrics
    likes: number;
    shares: number;
    saves: number;
    inquiries: number;
    
    // Performance Metrics
    clickThroughRate: number;
    conversionRate: number;
    averageViewTime: number;
    bounceRate: number;
    
    // Geographic Data
    topCountries: Array<{ country: string; views: number }>;
    topCities: Array<{ city: string; views: number }>;
    
    // Search Performance
    searchKeywords: Array<{ keyword: string; impressions: number; clicks: number }>;
    searchRanking: number;
  };
  comparisons: {
    similarProducts: Array<{
      productId: string;
      title: string;
      views: number;
      performance: 'better' | 'similar' | 'worse';
    }>;
    categoryAverage: {
      views: number;
      likes: number;
      conversions: number;
    };
  };
}

export interface SystemAnalytics {
  period: AnalyticsPeriod;
  performance: {
    averageResponseTime: number;
    errorRate: number;
    uptime: number;
    throughput: number;
    
    // API Performance
    apiEndpoints: Array<{
      endpoint: string;
      calls: number;
      averageTime: number;
      errorRate: number;
    }>;
    
    // Database Performance
    databaseQueries: {
      total: number;
      averageTime: number;
      slowQueries: number;
    };
    
    // Cache Performance
    cacheHits: number;
    cacheMisses: number;
    cacheHitRate: number;
  };
  usage: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    returningUsers: number;
    
    // Feature Usage
    featureUsage: Array<{
      feature: string;
      users: number;
      usageRate: number;
    }>;
    
    // Geographic Distribution
    usersByCountry: Array<{ country: string; users: number }>;
    
    // Platform Distribution
    platforms: {
      web: number;
      mobile: number;
      tablet: number;
    };
  };
  errors: {
    total: number;
    byType: Record<string, number>;
    byPage: Record<string, number>;
    recentErrors: Array<{
      timestamp: Date;
      error: string;
      count: number;
      affected: number;
    }>;
  };
}

export interface AnalyticsReport {
  id: string;
  title: string;
  description: string;
  type: 'user' | 'negotiation' | 'product' | 'system' | 'custom';
  period: AnalyticsPeriod;
  filters: AnalyticsFilters;
  data: UserAnalytics | NegotiationAnalytics | ProductAnalytics | SystemAnalytics;
  generatedAt: Date;
  generatedBy: string;
  format: 'json' | 'csv' | 'pdf' | 'xlsx';
  downloadUrl?: string;
  scheduled?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    nextRun: Date;
    recipients: string[];
  };
}

export interface AnalyticsPeriod {
  start: Date;
  end: Date;
  granularity: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface AnalyticsFilters {
  userIds?: string[];
  productIds?: string[];
  categories?: string[];
  locations?: string[];
  devices?: string[];
  sources?: string[];
  customFilters?: Record<string, any>;
}

export interface AnalyticsDashboard {
  id: string;
  name: string;
  description?: string;
  widgets: AnalyticsWidget[];
  layout: AnalyticsLayout;
  permissions: {
    view: string[];
    edit: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  isDefault: boolean;
}

export interface AnalyticsWidget {
  id: string;
  type: AnalyticsWidgetType;
  title: string;
  description?: string;
  dataSource: string;
  config: AnalyticsWidgetConfig;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  refreshInterval?: number; // seconds
}

export type AnalyticsWidgetType = 
  | 'metric'
  | 'chart'
  | 'table'
  | 'heatmap'
  | 'funnel'
  | 'gauge'
  | 'progress'
  | 'list'
  | 'map'
  | 'timeline';

export interface AnalyticsWidgetConfig {
  metric?: string;
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  xAxis?: string;
  yAxis?: string;
  groupBy?: string;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  period?: AnalyticsPeriod;
  filters?: AnalyticsFilters;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  customOptions?: Record<string, any>;
}

export interface AnalyticsLayout {
  columns: number;
  rows: number;
  gap: number;
  responsive: boolean;
}

export interface AnalyticsInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'opportunity' | 'warning';
  title: string;
  description: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-1
  relatedMetrics: string[];
  recommendations: string[];
  createdAt: Date;
  expiresAt?: Date;
}

export interface AnalyticsQuery {
  metrics: string[];
  dimensions?: string[];
  filters?: AnalyticsFilters;
  period: AnalyticsPeriod;
  granularity: 'hour' | 'day' | 'week' | 'month';
  limit?: number;
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  }[];
}

export interface AnalyticsResponse<T = any> {
  data: T;
  metadata: {
    totalRecords: number;
    period: AnalyticsPeriod;
    generatedAt: Date;
    queryTime: number;
  };
}
