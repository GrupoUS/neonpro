/**
 * Type Definitions for Communication Analytics System
 * 
 * Definições de tipos TypeScript para o sistema de analytics de comunicação
 * do NeonPro Healthcare Management System.
 * 
 * @author NeonPro Development Team
 * @version 1.0.0
 * @since 2025-01-30
 */

export interface CommunicationEvent {
  id: string;
  channel: 'sms' | 'email' | 'whatsapp' | 'push';
  messageType: 'reminder' | 'confirmation' | 'marketing' | 'alert' | 'follow_up';
  patientId: string;
  clinicId: string;
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  respondedAt?: Date;
  cost: number;
  revenueAttributed?: number;
  metadata: {
    templateId?: string;
    campaignId?: string;
    messageContent?: string;
    errorCode?: string;
    userAgent?: string;
    deviceType?: string;
    location?: string;
  };
}

export interface ChannelPerformance {
  channel: string;
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  responded: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  responseRate: number;
  conversionRate: number;
  totalCost: number;
  totalRevenue: number;
  roi: number;
  avgDeliveryTime: number;
  avgOpenTime: number;
  avgClickTime: number;
  costPerMessage: number;
  revenuePerMessage: number;
}

export interface EngagementMetrics {
  totalMessages: number;
  uniquePatients: number;
  deliveryRate: number;
  openRate: number;
  clickThroughRate: number;
  responseRate: number;
  engagementScore: number;
  avgResponseTime: number;
  reachRate: number;
  frequencyRate: number;
  retentionRate: number;
  satisfactionScore: number;
}

export interface AttributionModel {
  firstTouch: number;
  lastTouch: number;
  linear: number;
  timeDecay: number;
}

export interface ROICalculation {
  totalInvestment: number;
  totalRevenue: number;
  grossProfit: number;
  roi: number;
  costPerMessage: number;
  revenuePerMessage: number;
  costPerPatient: number;
  revenuePerPatient: number;
  breakEvenPoint: number;
  paybackPeriod: number;
  attribution: AttributionModel;
  profitMargin: number;
  conversionValue: number;
  lifetimeValue: number;
}

export interface TimeSeriesData {
  date: Date;
  totalMessages: number;
  engagementScore: number;
  revenue: number;
  cost: number;
  roi: number;
  conversions: number;
}

export interface TrendAnalysis {
  historical: {
    totalMessages: number;
    totalRevenue: number;
    engagementScore: number;
    roi: number;
  };
  current: {
    totalMessages: number;
    totalRevenue: number;
    engagementScore: number;
    roi: number;
  };
  timeSeries: TimeSeriesData[];
  seasonal: {
    monthlyPatterns: Array<{ month: number; avgEngagement: number; avgRevenue: number }>;
    weeklyPatterns: Array<{ dayOfWeek: number; avgEngagement: number; avgRevenue: number }>;
    hourlyPatterns: Array<{ hour: number; avgEngagement: number; avgRevenue: number }>;
  };
  forecasting: {
    nextMonth: Array<{ date: Date; predictedMessages: number; predictedRevenue: number }>;
    nextQuarter: Array<{ month: number; predictedMessages: number; predictedRevenue: number }>;
    nextYear: Array<{ quarter: number; predictedMessages: number; predictedRevenue: number }>;
  };
  growth: {
    messagesGrowth: number;
    revenueGrowth: number;
    engagementGrowth: number;
    roiGrowth: number;
  };
  trends: {
    messageVolume: 'increasing' | 'decreasing' | 'stable';
    engagement: 'increasing' | 'decreasing' | 'stable';
    revenue: 'increasing' | 'decreasing' | 'stable';
    cost: 'increasing' | 'decreasing' | 'stable';
  };
}

export interface BenchmarkData {
  industry: {
    [channel: string]: {
      deliveryRate: number;
      openRate: number;
      responseRate: number;
    };
  };
  clinic: {
    [channel: string]: {
      deliveryRate: number;
      openRate: number;
      responseRate: number;
    };
  };
  comparisons: Array<{
    channel: string;
    deliveryRateDiff: number;
    openRateDiff: number;
    responseRateDiff: number;
    performanceScore: number;
  }>;
  overallScore: number;
  recommendations: string[];
  ranking: 'excellent' | 'good' | 'average' | 'below_average' | 'poor' | 'unknown';
}

export interface AnalyticsMetrics {
  id: string;
  clinicId: string;
  dateRange: DateRange;
  channelPerformance: ChannelPerformance[];
  engagement: EngagementMetrics;
  roi: ROICalculation;
  trends: TrendAnalysis;
  benchmarks: BenchmarkData;
  totalMessages: number;
  totalCost: number;
  totalRevenue: number;
  lastUpdated: Date;
  metadata: {
    analysisVersion: string;
    dataQuality: number;
    confidence: number;
  };
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface AnalyticsFilter {
  clinicId: string;
  dateRange: DateRange;
  channels?: string[];
  messageTypes?: string[];
  patientSegments?: string[];
  campaigns?: string[];
}

export interface AlertConfig {
  id: string;
  clinicId: string;
  name: string;
  description: string;
  isActive: boolean;
  conditions: {
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    threshold: number;
    timeframe: number; // em minutos
  }[];
  actions: {
    type: 'email' | 'sms' | 'webhook' | 'dashboard';
    recipients: string[];
    payload?: any;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SegmentAnalysis {
  segment: string;
  criteria: {
    ageRange?: { min: number; max: number };
    gender?: 'M' | 'F' | 'other';
    location?: string;
    treatmentType?: string[];
    loyaltyLevel?: 'new' | 'regular' | 'vip';
    communicationPreference?: string[];
  };
  metrics: {
    totalPatients: number;
    totalMessages: number;
    engagementScore: number;
    conversionRate: number;
    avgRevenue: number;
    preferredChannels: string[];
    optimalTimes: {
      dayOfWeek: number[];
      hoursOfDay: number[];
    };
  };
}

// Database Schema Types
export interface CommunicationEventDB {
  event_id: string;
  channel_type: string;
  message_type: string;
  patient_id: string;
  clinic_id: string;
  sent_at: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  responded_at?: string;
  cost: number;
  revenue_attributed?: number;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface CommunicationAlertDB {
  id: string;
  clinic_id: string;
  name: string;
  description: string;
  is_active: boolean;
  conditions: any;
  actions: any;
  created_at: string;
  updated_at: string;
}

export interface CommunicationMetricsDB {
  id: string;
  clinic_id: string;
  date: string;
  channel_type: string;
  total_sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  responded: number;
  total_cost: number;
  total_revenue: number;
  created_at: string;
}

// API Response Types
export interface AnalyticsResponse {
  success: boolean;
  data: AnalyticsMetrics;
  error?: string;
  timestamp: Date;
}

export interface ChannelPerformanceResponse {
  success: boolean;
  data: ChannelPerformance[];
  error?: string;
  timestamp: Date;
}

export interface TrendAnalysisResponse {
  success: boolean;
  data: TrendAnalysis;
  error?: string;
  timestamp: Date;
}

export interface BenchmarkResponse {
  success: boolean;
  data: BenchmarkData;
  error?: string;
  timestamp: Date;
}

// Dashboard Component Props
export interface AnalyticsDashboardProps {
  clinicId: string;
  initialDateRange?: DateRange;
  refreshInterval?: number;
  showBenchmarks?: boolean;
  showTrends?: boolean;
  showSegments?: boolean;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  metadata?: any;
}

export interface KPICardProps {
  title: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  format?: 'number' | 'currency' | 'percentage';
  icon?: string;
  color?: 'primary' | 'success' | 'warning' | 'error';
}

// Export all types for easy importing
export type {
  CommunicationEvent,
  ChannelPerformance,
  EngagementMetrics,
  ROICalculation,
  TrendAnalysis,
  BenchmarkData,
  AnalyticsMetrics,
  AnalyticsFilter,
  AlertConfig,
  SegmentAnalysis,
  TimeSeriesData,
  AttributionModel,
  DateRange
};
