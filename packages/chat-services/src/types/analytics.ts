/**
 * Chat Analytics and Monitoring Types
 */

import { EnhancedChatMessage, EnhancedChatSession, ChatRole } from './chat';

// Analytics Metrics
export interface ChatAnalytics {
  sessionMetrics: SessionMetrics;
  messageMetrics: MessageMetrics;
  userMetrics: UserMetrics;
  performanceMetrics: PerformanceMetrics;
  complianceMetrics: ComplianceMetrics;
  businessMetrics: BusinessMetrics;
  healthMetrics: HealthMetrics;
}

export interface SessionMetrics {
  totalSessions: number;
  activeSessions: number;
  averageSessionDuration: number;
  sessionDurationDistribution: DurationDistribution;
  sessionTypeDistribution: SessionTypeDistribution;
  peakUsageTimes: PeakUsageAnalysis;
  deviceDistribution: DeviceDistribution;
  locationDistribution: LocationDistribution;
}

export interface DurationDistribution {
  lessThan1Minute: number;
  oneTo5Minutes: number;
  fiveTo15Minutes: number;
  fifteenTo30Minutes: number;
  thirtyTo60Minutes: number;
  moreThan60Minutes: number;
}

export interface SessionTypeDistribution {
  clinical: number;
  aesthetic: number;
  emergency: number;
  education: number;
  administrative: number;
  general: number;
}

export interface PeakUsageAnalysis {
  hourly: HourlyAnalysis[];
  daily: DailyAnalysis[];
  weekly: WeeklyAnalysis[];
  monthly: MonthlyAnalysis[];
}

export interface HourlyAnalysis {
  hour: number;
  sessionCount: number;
  messageCount: number;
  averageResponseTime: number;
}

export interface DailyAnalysis {
  day: string;
  sessionCount: number;
  messageCount: number;
  peakHour: number;
  averageResponseTime: number;
}

export interface WeeklyAnalysis {
  week: string;
  sessionCount: number;
  messageCount: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  weekOverWeekChange: number;
}

export interface MonthlyAnalysis {
  month: string;
  sessionCount: number;
  messageCount: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  monthOverMonthChange: number;
}

export interface DeviceDistribution {
  desktop: number;
  mobile: number;
  tablet: number;
  other: number;
}

export interface LocationDistribution {
  country: CountryUsage[];
  region: RegionUsage[];
  city: CityUsage[];
}

export interface CountryUsage {
  country: string;
  sessionCount: number;
  percentage: number;
}

export interface RegionUsage {
  region: string;
  sessionCount: number;
  percentage: number;
}

export interface CityUsage {
  city: string;
  sessionCount: number;
  percentage: number;
}

export interface MessageMetrics {
  totalMessages: number;
  averageMessagesPerSession: number;
  messageDistribution: MessageDistribution;
  responseTimeMetrics: ResponseTimeMetrics;
  sentimentMetrics: SentimentMetrics;
  topicMetrics: TopicMetrics;
  intentMetrics: IntentMetrics;
}

export interface MessageDistribution {
  user: number;
  assistant: number;
  system: number;
  clinical: number;
  aesthetic: number;
  emergency: number;
}

export interface ResponseTimeMetrics {
  average: number;
  median: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
  distribution: ResponseTimeDistribution;
}

export interface ResponseTimeDistribution {
  under1Second: number;
  oneTo3Seconds: number;
  threeTo5Seconds: number;
  fiveTo10Seconds: number;
  tenTo30Seconds: number;
  over30Seconds: number;
}

export interface SentimentMetrics {
  average: number;
  distribution: SentimentDistribution;
  trends: SentimentTrends;
  correlationWithTopics: TopicSentimentCorrelation[];
}

export type SentimentDistribution = {
  veryNegative: number;
  negative: number;
  neutral: number;
  positive: number;
  veryPositive: number;
};

export interface SentimentTrends {
  hourly: HourlySentiment[];
  daily: DailySentiment[];
  weekly: WeeklySentiment[];
}

export interface HourlySentiment {
  hour: number;
  averageSentiment: number;
  messageCount: number;
}

export interface DailySentiment {
  day: string;
  averageSentiment: number;
  messageCount: number;
  change: number;
}

export interface WeeklySentiment {
  week: string;
  averageSentiment: number;
  messageCount: number;
  change: number;
}

export interface TopicSentimentCorrelation {
  topic: string;
  averageSentiment: number;
  messageCount: number;
  confidence: number;
}

export interface TopicMetrics {
  topTopics: TopicAnalysis[];
  topicTrends: TopicTrends[];
  topicDistribution: TopicDistribution;
}

export interface TopicAnalysis {
  topic: string;
  frequency: number;
  percentage: number;
  sentiment: number;
  urgency: number;
  subtopics: string[];
}

export interface TopicTrends {
  topic: string;
  trend: 'increasing' | 'stable' | 'decreasing';
  changePercentage: number;
  period: string;
}

export interface TopicDistribution {
  clinical: TopicCategory;
  aesthetic: TopicCategory;
  administrative: TopicCategory;
  general: TopicCategory;
  emergency: TopicCategory;
}

export interface TopicCategory {
  totalTopics: number;
  topTopics: string[];
  averageSentiment: number;
}

export interface IntentMetrics {
  intentDistribution: IntentDistribution;
  intentAccuracy: IntentAccuracyMetrics;
  intentTrends: IntentTrends[];
}

export interface IntentDistribution {
  information_request: number;
  appointment_booking: number;
  symptom_report: number;
  treatment_inquiry: number;
  prescription_request: number;
  emergency_report: number;
  follow_up: number;
  feedback: number;
  complaint: number;
  other: number;
}

export interface IntentAccuracyMetrics {
  overallAccuracy: number;
  accuracyByIntent: Record<string, number>;
  confusionMatrix: ConfusionMatrix;
}

export interface ConfusionMatrix {
  [predictedIntent: string]: {
    [actualIntent: string]: number;
  };
}

export interface IntentTrends {
  intent: string;
  trend: 'increasing' | 'stable' | 'decreasing';
  changePercentage: number;
  period: string;
}

export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  userEngagement: UserEngagementMetrics;
  userDemographics: UserDemographics;
  userRetention: UserRetentionMetrics;
}

export interface UserEngagementMetrics {
  averageSessionsPerUser: number;
  averageMessagesPerUser: number;
  averageSessionDuration: number;
  engagementDistribution: EngagementDistribution;
}

export interface EngagementDistribution {
  highlyEngaged: number;
  moderatelyEngaged: number;
  lightlyEngaged: number;
  rarelyEngaged: number;
}

export interface UserDemographics {
  ageDistribution: AgeDistribution;
  genderDistribution: GenderDistribution;
  locationDistribution: LocationDistribution;
  devicePreference: DevicePreference;
}

export interface AgeDistribution {
  under18: number;
  eighteenTo24: number;
  twentyFiveTo34: number;
  thirtyFiveTo44: number;
  fortyFiveTo54: number;
  fiftyFiveTo64: number;
  sixtyFivePlus: number;
}

export interface GenderDistribution {
  male: number;
  female: number;
  nonBinary: number;
  preferNotToSay: number;
}

export interface DevicePreference {
  desktop: number;
  mobile: number;
  tablet: number;
  preferredDevice: 'desktop' | 'mobile' | 'tablet';
}

export interface UserRetentionMetrics {
  day1Retention: number;
  day7Retention: number;
  day30Retention: number;
  day90Retention: number;
  churnRate: number;
  retentionCurve: RetentionPoint[];
}

export interface RetentionPoint {
  day: number;
  retentionRate: number;
}

export interface PerformanceMetrics {
  systemPerformance: SystemPerformanceMetrics;
  aiPerformance: AIPerformanceMetrics;
  integrationPerformance: IntegrationPerformanceMetrics;
}

export interface SystemPerformanceMetrics {
  uptime: number;
  averageResponseTime: number;
  errorRate: number;
  throughput: number;
  resourceUtilization: ResourceUtilizationMetrics;
}

export interface ResourceUtilizationMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

export interface AIPerformanceMetrics {
  averageResponseTime: number;
  successRate: number;
  tokenUsage: TokenUsageMetrics;
  costMetrics: CostMetrics;
  modelAccuracy: ModelAccuracyMetrics;
}

export interface TokenUsageMetrics {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  averageTokensPerRequest: number;
  costPerToken: number;
}

export interface CostMetrics {
  totalCost: number;
  averageCostPerRequest: number;
  costByProvider: Record<string, number>;
  costTrends: CostTrend[];
}

export interface CostTrend {
  period: string;
  cost: number;
  changePercentage: number;
}

export interface ModelAccuracyMetrics {
  overallAccuracy: number;
  accuracyByTask: Record<string, number>;
  confidenceDistribution: ConfidenceDistribution;
  feedbackScore: number;
}

export interface ConfidenceDistribution {
  highConfidence: number;
  mediumConfidence: number;
  lowConfidence: number;
}

export interface IntegrationPerformanceMetrics {
  aguiProtocol: ProtocolPerformanceMetrics;
  copilotKit: ProtocolPerformanceMetrics;
  database: DatabasePerformanceMetrics;
  externalAPIs: ExternalAPIPerformanceMetrics;
}

export interface ProtocolPerformanceMetrics {
  uptime: number;
  averageLatency: number;
  errorRate: number;
  throughput: number;
}

export interface DatabasePerformanceMetrics {
  queryLatency: number;
  connectionPool: number;
  errorRate: number;
  throughput: number;
}

export interface ExternalAPIPerformanceMetrics {
  uptime: number;
  averageLatency: number;
  errorRate: number;
  successRate: number;
}

export interface ComplianceMetrics {
  overallScore: number;
  frameworkScores: Record<string, number>;
  violations: ComplianceViolationMetrics;
  auditMetrics: AuditMetrics;
}

export interface ComplianceViolationMetrics {
  totalViolations: number;
  violationsByType: Record<string, number>;
  violationsBySeverity: Record<string, number>;
  averageResolutionTime: number;
  openViolations: number;
  resolvedViolations: number;
}

export interface AuditMetrics {
  totalAudits: number;
  passedAudits: number;
  failedAudits: number;
  averageAuditScore: number;
  auditFrequency: number;
}

export interface BusinessMetrics {
  conversionMetrics: ConversionMetrics;
  revenueMetrics: RevenueMetrics;
  customerSatisfaction: CustomerSatisfactionMetrics;
  operationalEfficiency: OperationalEfficiencyMetrics;
}

export interface ConversionMetrics {
  appointmentConversions: number;
  appointmentConversionRate: number;
  treatmentInquiries: number;
  treatmentConversionRate: number;
  referralConversions: number;
  referralConversionRate: number;
  revenuePerSession: number;
}

export interface RevenueMetrics {
  totalRevenue: number;
  revenueBySessionType: Record<string, number>;
  revenueGrowth: number;
  averageRevenuePerUser: number;
  customerLifetimeValue: number;
}

export interface CustomerSatisfactionMetrics {
  averageSatisfactionScore: number;
  satisfactionDistribution: SatisfactionDistribution;
  feedbackResponseRate: number;
  netPromoterScore: number;
  sentimentScore: number;
}

export interface SatisfactionDistribution {
  verySatisfied: number;
  satisfied: number;
  neutral: number;
  dissatisfied: number;
  veryDissatisfied: number;
}

export interface OperationalEfficiencyMetrics {
  averageHandlingTime: number;
  firstContactResolution: number;
  agentUtilization: number;
  costPerConversation: number;
  automationRate: number;
}

export interface HealthMetrics {
  clinicalOutcomes: ClinicalOutcomeMetrics;
  patientEngagement: PatientEngagementMetrics;
  qualityMetrics: QualityMetrics;
  accessibilityMetrics: AccessibilityMetrics;
}

export interface ClinicalOutcomeMetrics {
  symptomImprovement: number;
  treatmentAdherence: number;
  complicationRate: number;
  readmissionRate: number;
  patientRecovery: number;
}

export interface PatientEngagementMetrics {
  appointmentAttendance: number;
  medicationAdherence: number;
  lifestyleCompliance: number;
  followUpCompletion: number;
  patientPortalUsage: number;
}

export interface QualityMetrics {
  careQualityScore: number;
  guidelineAdherence: number;
  documentationQuality: number;
  patientSafety: number;
}

export interface AccessibilityMetrics {
  averageWaitTime: number;
  appointmentAvailability: number;
  geographicAccessibility: number;
  financialAccessibility: number;
  digitalAccessibility: number;
}

// Real-time Analytics
export interface RealtimeAnalytics {
  currentSessionCount: number;
  activeUsers: number;
  messageThroughput: number;
  averageResponseTime: number;
  errorRate: number;
  systemHealth: SystemHealthStatus;
  alerts: AnalyticsAlert[];
}

export interface SystemHealthStatus {
  overall: 'healthy' | 'warning' | 'critical';
  components: ComponentHealth[];
  lastUpdate: string;
}

export interface ComponentHealth {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  metrics: Record<string, number>;
  lastCheck: string;
}

export interface AnalyticsAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  timestamp: string;
  source: string;
  metrics: Record<string, number>;
  threshold: number;
  actionRequired: boolean;
}

export type AlertType = 
  | 'performance_degradation' 
  | 'error_spike' 
  | 'user_anomaly' 
  | 'security_incident' 
  | 'compliance_violation' 
  | 'business_metric' 
  | 'system_capacity';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

// Analytics Configuration
export interface AnalyticsConfig {
  enabled: boolean;
  collection: AnalyticsCollectionConfig;
  processing: AnalyticsProcessingConfig;
  storage: AnalyticsStorageConfig;
  reporting: AnalyticsReportingConfig;
  realTime: RealtimeAnalyticsConfig;
}

export interface AnalyticsCollectionConfig {
  metrics: string[];
  dimensions: string[];
  samplingRate: number;
  retentionPeriod: number;
  anonymization: boolean;
  piiFiltering: boolean;
}

export interface AnalyticsProcessingConfig {
  aggregationWindows: string[];
  aggregationFunctions: string[];
  enrichmentEnabled: boolean;
  mlEnabled: boolean;
  realTimeProcessing: boolean;
}

export interface AnalyticsStorageConfig {
  provider: 'postgres' | 'clickhouse' | 'bigquery' | 'redshift' | 'snowflake';
  connectionString: string;
  retention: {
    raw: number;
    aggregated: number;
    summarized: number;
  };
  compression: boolean;
  partitioning: boolean;
}

export interface AnalyticsReportingConfig {
  enabled: boolean;
  frequency: string;
  formats: string[];
  destinations: ReportDestination[];
  dashboards: DashboardConfig[];
}

export interface ReportDestination {
  type: 'email' | 'webhook' | 's3' | 'slack' | 'teams';
  config: Record<string, unknown>;
}

export interface DashboardConfig {
  id: string;
  name: string;
  description: string;
  widgets: WidgetConfig[];
  layout: DashboardLayout;
  access: string[];
}

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  metrics: string[];
  dimensions: string[];
  timeRange: string;
  refreshInterval: number;
  visualization: VisualizationConfig;
}

export type WidgetType = 
  | 'metric' 
  | 'chart' 
  | 'table' 
  | 'gauge' 
  | 'heatmap' 
  | 'funnel' 
  | 'map';

export interface VisualizationConfig {
  chartType: string;
  colorScheme: string;
  showLabels: boolean;
  showLegend: boolean;
  threshold?: number;
  targetLine?: number;
}

export interface DashboardLayout {
  columns: number;
  widgets: WidgetLayout[];
}

export interface WidgetLayout {
  widgetId: string;
  row: number;
  column: number;
  width: number;
  height: number;
}

export interface RealtimeAnalyticsConfig {
  enabled: boolean;
  updateInterval: number;
  metrics: string[];
  alerts: AlertConfig[];
  dashboards: string[];
}

export interface AlertConfig {
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  window: string;
  severity: AlertSeverity;
  channels: string[];
}