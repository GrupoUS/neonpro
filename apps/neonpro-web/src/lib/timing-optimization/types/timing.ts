/**
 * Timing Optimization Types
 * NeonPro - Types para otimização de timing de comunicações
 */

export interface TimingPattern {
  id: string;
  clinicId: string;
  patientId?: string;
  communicationType: "email" | "sms" | "whatsapp" | "notification";
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  hour: number; // 0-23
  responseRate: number;
  openRate?: number;
  clickRate?: number;
  conversionRate?: number;
  sampleSize: number;
  confidence: number;
  lastUpdated: Date;
  timezone: string;
}

export interface OptimalTime {
  hour: number;
  minute: number;
  dayOfWeek: number;
  timezone: string;
  confidence: number;
  expectedResponseRate: number;
  alternativeTimes?: OptimalTime[];
}

export interface TimingRecommendation {
  patientId: string;
  communicationType: "email" | "sms" | "whatsapp" | "notification";
  optimalTime: OptimalTime;
  reasoning: string[];
  confidence: number;
  basedOnSegments: string[];
  fallbackTimes: OptimalTime[];
  avoidTimes: TimeWindow[];
  seasonalAdjustments?: SeasonalAdjustment[];
}

export interface TimeWindow {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  dayOfWeek?: number;
  reason: string;
}

export interface SeasonalAdjustment {
  season: "spring" | "summer" | "fall" | "winter";
  monthStart: number;
  monthEnd: number;
  adjustmentFactor: number;
  reason: string;
}

export interface PatientTimingProfile {
  patientId: string;
  timezone: string;
  preferredCommunicationHours: TimeWindow[];
  doNotDisturbHours: TimeWindow[];
  responsePatterns: TimingPattern[];
  lastAnalysisDate: Date;
  confidence: number;
  engagementScore: number;
}

export interface TimingAnalysisRequest {
  clinicId: string;
  patientIds?: string[];
  communicationType?: "email" | "sms" | "whatsapp" | "notification";
  dateRange: {
    start: Date;
    end: Date;
  };
  includeSeasonalFactors: boolean;
  includeWeatherFactors: boolean;
  includeHolidayFactors: boolean;
  segmentBy: string[];
}

export interface TimingAnalysisResult {
  requestId: string;
  clinicId: string;
  analysisDate: Date;
  timeframe: {
    start: Date;
    end: Date;
  };
  globalPatterns: TimingPattern[];
  segmentedPatterns: Record<string, TimingPattern[]>;
  recommendations: TimingRecommendation[];
  insights: TimingInsight[];
  performanceMetrics: {
    totalCommunications: number;
    averageResponseRate: number;
    optimizedCommunications: number;
    improvementRate: number;
  };
}

export interface TimingInsight {
  type:
    | "peak_hours"
    | "dead_zones"
    | "seasonal_trend"
    | "demographic_pattern"
    | "channel_preference";
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  impact: "high" | "medium" | "low";
  data: any;
}

export interface BehaviorPattern {
  patientId: string;
  pattern: "early_bird" | "night_owl" | "business_hours" | "weekend_warrior" | "irregular";
  confidence: number;
  characteristics: {
    preferredHours: number[];
    preferredDays: number[];
    responseLatency: number; // minutes
    engagementWindow: number; // minutes
  };
  lastUpdated: Date;
}

export interface MachineLearningModel {
  id: string;
  name: string;
  type: "gradient_boosting" | "random_forest" | "neural_network" | "time_series";
  version: string;
  accuracy: number;
  features: string[];
  lastTrained: Date;
  dataPoints: number;
  predictions: {
    responseRate: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
  };
}

export interface WeatherFactor {
  date: Date;
  location: string;
  temperature: number;
  humidity: number;
  pressure: number;
  weatherCondition: string;
  impactScore: number;
}

export interface HolidayFactor {
  date: Date;
  name: string;
  type: "national" | "religious" | "commercial" | "local";
  country: string;
  region?: string;
  impactScore: number;
}

export interface TimingOptimizationConfig {
  clinicId: string;
  globalSettings: {
    defaultTimezone: string;
    businessHours: TimeWindow;
    blackoutPeriods: TimeWindow[];
    minimumSampleSize: number;
    minimumConfidence: number;
    enableMLPredictions: boolean;
    enableSeasonalAdjustments: boolean;
    enableWeatherFactors: boolean;
    enableHolidayFactors: boolean;
  };
  channelSettings: Record<
    string,
    {
      enabled: boolean;
      priority: number;
      optimalFrequency: {
        daily: number;
        weekly: number;
        monthly: number;
      };
      cooldownPeriod: number; // minutes
      retryLogic: {
        maxAttempts: number;
        backoffMultiplier: number;
      };
    }
  >;
  audienceSegments: {
    id: string;
    name: string;
    criteria: any;
    timingOverrides: Partial<TimingRecommendation>;
  }[];
}

export interface PredictiveModel {
  modelId: string;
  algorithm: string;
  features: ModelFeature[];
  performance: ModelPerformance;
  trainingData: {
    startDate: Date;
    endDate: Date;
    sampleSize: number;
  };
  predictions: TimingPrediction[];
}

export interface ModelFeature {
  name: string;
  type: "numerical" | "categorical" | "temporal" | "derived";
  importance: number;
  correlation: number;
  description: string;
}

export interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  mse: number;
  mae: number;
  crossValidationScore: number;
}

export interface TimingPrediction {
  patientId: string;
  communicationType: string;
  predictedOptimalTime: OptimalTime;
  confidence: number;
  factors: string[];
  modelVersion: string;
  predictionDate: Date;
}

export interface EngagementWindow {
  start: Date;
  end: Date;
  timezone: string;
  responseRate: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  sampleSize: number;
  segments: string[];
}

export interface TimeZoneMapping {
  patientId: string;
  timezone: string;
  confidence: number;
  detectionMethod: "ip_lookup" | "user_provided" | "historical_activity" | "phone_number";
  lastVerified: Date;
}

export interface CommunicationFrequency {
  patientId: string;
  communicationType: string;
  daily: number;
  weekly: number;
  monthly: number;
  optimalFrequency: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  saturationPoint: number;
  lastCalculated: Date;
}

export interface ResponseLatency {
  communicationId: string;
  patientId: string;
  sentAt: Date;
  firstOpenAt?: Date;
  firstClickAt?: Date;
  responseAt?: Date;
  latencyMinutes: {
    toOpen?: number;
    toClick?: number;
    toResponse?: number;
  };
  deviceType?: "mobile" | "desktop" | "tablet";
  location?: string;
}

export interface DemographicPattern {
  ageGroup: string;
  gender: string;
  location: string;
  occupation?: string;
  patterns: {
    preferredHours: number[];
    preferredDays: number[];
    responseRate: number;
    engagementDuration: number;
    channelPreference: string[];
  };
  sampleSize: number;
  confidence: number;
  lastUpdated: Date;
}

export interface A_BTestTiming {
  testId: string;
  name: string;
  hypothesis: string;
  controlTime: OptimalTime;
  variantTimes: OptimalTime[];
  startDate: Date;
  endDate?: Date;
  status: "active" | "completed" | "paused";
  results?: {
    winner: "control" | number;
    improvement: number;
    confidence: number;
    significance: string;
  };
  metrics: {
    impressions: number;
    responses: number;
    responseRate: number;
  };
}

export interface OptimizationRules {
  id: string;
  name: string;
  description: string;
  condition: string; // JSON rule condition
  action: {
    type: "delay" | "reschedule" | "change_channel" | "skip";
    parameters: any;
  };
  priority: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  usage: {
    applied: number;
    successful: number;
    failed: number;
  };
}

export interface RealTimeFactors {
  timestamp: Date;
  patientId: string;
  factors: {
    deviceActivity: boolean;
    emailClientOpen: boolean;
    websiteVisit: boolean;
    appUsage: boolean;
    socialMediaActivity: boolean;
  };
  engagement: {
    recentOpens: number;
    recentClicks: number;
    lastActivity: Date;
  };
  context: {
    location?: string;
    weather?: string;
    localTime: Date;
    dayType: "weekday" | "weekend" | "holiday";
  };
}

export interface SendTimeOptimization {
  communicationId: string;
  originalScheduledTime: Date;
  optimizedTime: Date;
  reason: string;
  confidence: number;
  factors: string[];
  expectedImprovement: number;
  algorithm: string;
  version: string;
}

export interface PerformanceMetrics {
  period: {
    start: Date;
    end: Date;
  };
  baseline: {
    totalCommunications: number;
    averageResponseRate: number;
    averageOpenRate: number;
    averageClickRate: number;
    averageConversionRate: number;
  };
  optimized: {
    totalCommunications: number;
    averageResponseRate: number;
    averageOpenRate: number;
    averageClickRate: number;
    averageConversionRate: number;
  };
  improvement: {
    responseRate: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
  };
  segments: Record<string, PerformanceMetrics>;
}

// Query and Filter Types
export interface TimingQueryFilter {
  clinicId: string;
  patientIds?: string[];
  communicationTypes?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  segments?: string[];
  minimumSampleSize?: number;
  minimumConfidence?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface TimingQueryResult {
  patterns: TimingPattern[];
  recommendations: TimingRecommendation[];
  totalCount: number;
  hasMore: boolean;
  aggregations: {
    byChannel: Record<string, number>;
    byHour: Record<number, number>;
    byDayOfWeek: Record<number, number>;
    averageResponseRate: number;
    totalCommunications: number;
  };
}
