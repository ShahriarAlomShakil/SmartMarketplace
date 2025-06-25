/**
 * AnalyticsService - Comprehensive analytics data management
 * Handles user behavior tracking, performance metrics, and reporting
 */

import type {
  AnalyticsEvent,
  UserAnalytics,
  NegotiationAnalytics,
  ProductAnalytics,
  SystemAnalytics,
  AnalyticsReport,
  AnalyticsPeriod,
  AnalyticsFilters,
  AnalyticsQuery,
  AnalyticsResponse,
  AnalyticsInsight
} from '../types/Analytics';

class AnalyticsService {
  private static instance: AnalyticsService;
  private apiBaseUrl: string;
  private sessionId: string;
  private eventQueue: AnalyticsEvent[] = [];
  private flushInterval: number = 5000; // 5 seconds
  private maxQueueSize: number = 50;
  private isTracking: boolean = true;

  constructor() {
    this.apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
    this.sessionId = this.generateSessionId();
    this.initializeTracking();
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private initializeTracking(): void {
    // Auto-flush events periodically
    setInterval(() => {
      this.flushEvents();
    }, this.flushInterval);

    // Flush events before page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flushEvents(true);
      });

      // Track page views automatically
      this.trackPageView();
      
      // Track page visibility changes
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.trackEvent('engagement', 'page_hidden');
        } else {
          this.trackEvent('engagement', 'page_visible');
        }
      });
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Event Tracking
  trackEvent(
    eventType: string,
    eventName: string,
    properties: Record<string, any> = {},
    userId?: string
  ): void {
    if (!this.isTracking) return;

    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      userId: userId || this.getCurrentUserId(),
      sessionId: this.sessionId,
      eventType: eventType as any,
      eventName,
      properties: {
        ...properties,
        url: typeof window !== 'undefined' ? window.location.href : '',
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        viewport: typeof window !== 'undefined' ? {
          width: window.innerWidth,
          height: window.innerHeight
        } : null,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      source: this.getSource()
    };

    this.eventQueue.push(event);

    // Flush if queue is full
    if (this.eventQueue.length >= this.maxQueueSize) {
      this.flushEvents();
    }
  }

  trackPageView(page?: string): void {
    const currentPage = page || (typeof window !== 'undefined' ? window.location.pathname : '');
    
    this.trackEvent('page_view', 'page_viewed', {
      page: currentPage,
      title: typeof document !== 'undefined' ? document.title : '',
      loadTime: typeof window !== 'undefined' && window.performance ? 
        window.performance.timing.loadEventEnd - window.performance.timing.navigationStart : null
    });
  }

  trackUserAction(action: string, target?: string, properties: Record<string, any> = {}): void {
    this.trackEvent('user_action', action, {
      target,
      ...properties
    });
  }

  trackNegotiationEvent(
    negotiationId: string,
    event: string,
    properties: Record<string, any> = {}
  ): void {
    this.trackEvent('negotiation', event, {
      negotiationId,
      ...properties
    });
  }

  trackProductEvent(
    productId: string,
    event: string,
    properties: Record<string, any> = {}
  ): void {
    this.trackEvent('product', event, {
      productId,
      ...properties
    });
  }

  trackPerformance(
    metric: string,
    value: number,
    properties: Record<string, any> = {}
  ): void {
    this.trackEvent('performance', metric, {
      value,
      ...properties
    });
  }

  trackError(
    error: Error | string,
    context: Record<string, any> = {}
  ): void {
    const errorData = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : { message: error };

    this.trackEvent('error', 'error_occurred', {
      ...errorData,
      ...context
    });
  }

  trackConversion(
    type: string,
    value?: number,
    properties: Record<string, any> = {}
  ): void {
    this.trackEvent('conversion', type, {
      value,
      ...properties
    });
  }

  // Analytics Queries
  async getUserAnalytics(
    userId: string,
    period: AnalyticsPeriod,
    filters?: AnalyticsFilters
  ): Promise<UserAnalytics | null> {
    try {
      const response = await this.makeRequest<UserAnalytics>('/analytics/user', {
        method: 'POST',
        body: JSON.stringify({ userId, period, filters })
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get user analytics:', error);
      return null;
    }
  }

  async getNegotiationAnalytics(
    period: AnalyticsPeriod,
    negotiationId?: string,
    filters?: AnalyticsFilters
  ): Promise<NegotiationAnalytics | null> {
    try {
      const response = await this.makeRequest<NegotiationAnalytics>('/analytics/negotiations', {
        method: 'POST',
        body: JSON.stringify({ negotiationId, period, filters })
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get negotiation analytics:', error);
      return null;
    }
  }

  async getProductAnalytics(
    period: AnalyticsPeriod,
    productId?: string,
    filters?: AnalyticsFilters
  ): Promise<ProductAnalytics | null> {
    try {
      const response = await this.makeRequest<ProductAnalytics>('/analytics/products', {
        method: 'POST',
        body: JSON.stringify({ productId, period, filters })
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get product analytics:', error);
      return null;
    }
  }

  async getSystemAnalytics(
    period: AnalyticsPeriod,
    filters?: AnalyticsFilters
  ): Promise<SystemAnalytics | null> {
    try {
      const response = await this.makeRequest<SystemAnalytics>('/analytics/system', {
        method: 'POST',
        body: JSON.stringify({ period, filters })
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get system analytics:', error);
      return null;
    }
  }

  async runCustomQuery(query: AnalyticsQuery): Promise<any> {
    try {
      const response = await this.makeRequest('/analytics/query', {
        method: 'POST',
        body: JSON.stringify(query)
      });
      return response.data;
    } catch (error) {
      console.error('Failed to run custom query:', error);
      return null;
    }
  }

  // Reports
  async generateReport(
    type: 'user' | 'negotiation' | 'product' | 'system' | 'custom',
    period: AnalyticsPeriod,
    filters?: AnalyticsFilters,
    format: 'json' | 'csv' | 'pdf' | 'xlsx' = 'json'
  ): Promise<AnalyticsReport | null> {
    try {
      const response = await this.makeRequest<AnalyticsReport>('/analytics/reports/generate', {
        method: 'POST',
        body: JSON.stringify({ type, period, filters, format })
      });
      return response.data;
    } catch (error) {
      console.error('Failed to generate report:', error);
      return null;
    }
  }

  async getReports(page = 1, limit = 20): Promise<{
    reports: AnalyticsReport[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/analytics/reports?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      return response.json();
    } catch (error) {
      console.error('Failed to get reports:', error);
      return { reports: [], total: 0, hasMore: false };
    }
  }

  async downloadReport(reportId: string): Promise<Blob | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/analytics/reports/${reportId}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      return response.blob();
    } catch (error) {
      console.error('Failed to download report:', error);
      return null;
    }
  }

  // Insights
  async getInsights(
    type?: string,
    limit = 10
  ): Promise<AnalyticsInsight[]> {
    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      params.append('limit', limit.toString());

      const response = await fetch(`${this.apiBaseUrl}/analytics/insights?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch insights');
      }

      return response.json();
    } catch (error) {
      console.error('Failed to get insights:', error);
      return [];
    }
  }

  // Real-time Analytics
  subscribeToRealtimeAnalytics(callback: (data: any) => void): () => void {
    if (typeof window !== 'undefined' && (window as any).io) {
      const socket = (window as any).io;
      
      socket.on('analytics:update', callback);
      
      return () => {
        socket.off('analytics:update', callback);
      };
    }
    
    return () => {};
  }

  // Utility Methods
  async flushEvents(immediate = false): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const method = immediate ? 'sendBeacon' : 'fetch';
      
      if (immediate && 'navigator' in window && navigator.sendBeacon) {
        navigator.sendBeacon(
          `${this.apiBaseUrl}/analytics/events`,
          JSON.stringify({ events })
        );
      } else {
        await fetch(`${this.apiBaseUrl}/analytics/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          body: JSON.stringify({ events })
        });
      }
    } catch (error) {
      console.error('Failed to flush analytics events:', error);
      // Re-queue events on failure (but limit to prevent memory issues)
      if (this.eventQueue.length < this.maxQueueSize) {
        this.eventQueue.unshift(...events.slice(0, this.maxQueueSize - this.eventQueue.length));
      }
    }
  }

  enableTracking(): void {
    this.isTracking = true;
  }

  disableTracking(): void {
    this.isTracking = false;
    this.flushEvents(true);
  }

  setUserId(userId: string): void {
    localStorage.setItem('analytics_user_id', userId);
  }

  private getCurrentUserId(): string {
    return localStorage.getItem('analytics_user_id') || 'anonymous';
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getSource(): 'web' | 'mobile' | 'api' {
    if (typeof window === 'undefined') return 'api';
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    return isMobile ? 'mobile' : 'web';
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit
  ): Promise<AnalyticsResponse<T>> {
    const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`Analytics request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Time period helpers
  static createPeriod(
    start: Date,
    end: Date,
    granularity: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year' = 'day'
  ): AnalyticsPeriod {
    return { start, end, granularity };
  }

  static getLastDays(days: number): AnalyticsPeriod {
    const end = new Date();
    const start = new Date(end.getTime() - (days * 24 * 60 * 60 * 1000));
    return this.createPeriod(start, end);
  }

  static getLastWeeks(weeks: number): AnalyticsPeriod {
    const end = new Date();
    const start = new Date(end.getTime() - (weeks * 7 * 24 * 60 * 60 * 1000));
    return this.createPeriod(start, end, 'week');
  }

  static getLastMonths(months: number): AnalyticsPeriod {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth() - months, 1);
    return this.createPeriod(start, end, 'month');
  }

  static getCurrentMonth(): AnalyticsPeriod {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return this.createPeriod(start, end, 'day');
  }

  static getCurrentWeek(): AnalyticsPeriod {
    const now = new Date();
    const start = new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000));
    const end = new Date(start.getTime() + (6 * 24 * 60 * 60 * 1000));
    return this.createPeriod(start, end, 'day');
  }
}

export default AnalyticsService;
