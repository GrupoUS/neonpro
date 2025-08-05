/**
 * Advanced Metrics Types
 * NeonPro - Sistema de métricas avançadas para análise detalhada de comunicação
 */

// ====================================================================
// CORE TYPES
// ====================================================================

export interface AdvancedMetricsConfig {
  clinicId: string;
  enabledMetrics: MetricType[];
  aggregationSettings: AggregationSettings;
  alertingConfig: AlertingConfig;
  dataRetention: DataRetentionConfig;
  calculationSettings: CalculationSettings;
  exportSettings: ExportSettings;
  customMetrics?: CustomMetricDefinition[];
}

export interface AdvancedMetricsRequest {
  clinicId: string;
  period: {
    start: Date;
    end: Date;
    timezone: string;
  };
  dimensions: DimensionConfig[];
  metrics: MetricConfig[];
  filters?: FilterConfig[];
  aggregation?: AggregationConfig;
  comparison?: ComparisonConfig;
  benchmarking?: BenchmarkingConfig;
}

export interface AdvancedMetricsResult {
  requestId: string;
  clinicId: string;
  period: {
    start: Date;
    end: Date;
    timezone: string;
  };
  metrics: CalculatedMetric[];
  trends: TrendAnalysis[];
  insights: MetricInsight[];
  benchmarks: BenchmarkComparison[];
  alerts: MetricAlert[];
  recommendations: MetricRecommendation[];
  metadata: ResultMetadata;
  generatedAt: Date;
}

// ====================================================================
// METRIC DEFINITIONS
// ====================================================================

export type MetricType =
  | "engagement_advanced"
  | "satisfaction_detailed"
  | "conversion_funnel"
  | "churn_prediction"
  | "lifetime_value"
  | "communication_effectiveness"
  | "channel_performance"
  | "content_performance"
  | "timing_effectiveness"
  | "cost_efficiency"
  | "compliance_score"
  | "quality_index"
  | "roi_advanced"
  | "custom";

export interface MetricConfig {
  type: MetricType;
  name: string;
  enabled: boolean;
  aggregationType: AggregationType;
  filters?: FilterConfig[];
  customParameters?: Record<string, any>;
  weight?: number;
}

export interface CalculatedMetric {
  type: MetricType;
  name: string;
  value: number;
  unit: string;
  trend: {
    direction: "up" | "down" | "stable";
    magnitude: number;
    significance: "low" | "medium" | "high";
  };
  breakdown: MetricBreakdown[];
  confidence: number;
  dataQuality: DataQualityScore;
  context: MetricContext;
  calculatedAt: Date;
}

export interface MetricBreakdown {
  dimension: string;
  value: string;
  metricValue: number;
  weight: number;
  contribution: number;
  rank: number;
}

export interface MetricContext {
  sampleSize: number;
  timeRange: { start: Date; end: Date };
  filters: FilterConfig[];
  methodology: string;
  assumptions: string[];
  limitations: string[];
}

// ====================================================================
// ENGAGEMENT METRICS
// ====================================================================

export interface EngagementMetrics {
  overall: OverallEngagement;
  byChannel: ChannelEngagement[];
  byContent: ContentEngagement[];
  bySegment: SegmentEngagement[];
  temporal: TemporalEngagement[];
  cohort: CohortEngagement[];
}

export interface OverallEngagement {
  score: number;
  components: {
    openRate: number;
    clickRate: number;
    responseRate: number;
    completionRate: number;
    shareRate: number;
    timeSpent: number;
  };
  trends: EngagementTrend[];
  factors: EngagementFactor[];
}

export interface ChannelEngagement {
  channel: string;
  engagement: OverallEngagement;
  crossChannelBehavior: CrossChannelBehavior;
  optimization: ChannelOptimization;
}

export interface ContentEngagement {
  contentId: string;
  contentType: string;
  subject: string;
  engagement: OverallEngagement;
  contentAnalysis: ContentAnalysis;
  variations: ContentVariation[];
}

export interface SegmentEngagement {
  segmentId: string;
  segmentName: string;
  segmentCriteria: SegmentCriteria;
  engagement: OverallEngagement;
  behaviors: SegmentBehavior[];
  preferences: SegmentPreference[];
}

export interface TemporalEngagement {
  timeframe: string;
  granularity: "hour" | "day" | "week" | "month";
  engagement: OverallEngagement;
  patterns: TemporalPattern[];
  seasonality: SeasonalityData;
}

export interface CohortEngagement {
  cohortId: string;
  cohortDefinition: CohortDefinition;
  lifecycleStage: LifecycleStage;
  retention: RetentionMetrics;
  progressions: ProgressionMetrics;
}

// ====================================================================
// SATISFACTION METRICS
// ====================================================================

export interface SatisfactionMetrics {
  overall: SatisfactionScore;
  byTouchpoint: TouchpointSatisfaction[];
  byJourney: JourneySatisfaction[];
  bySegment: SegmentSatisfaction[];
  nps: NPSMetrics;
  sentiment: SentimentMetrics;
  feedback: FeedbackMetrics;
}

export interface SatisfactionScore {
  value: number;
  scale: { min: number; max: number };
  distribution: ScoreDistribution[];
  components: SatisfactionComponent[];
  trends: SatisfactionTrend[];
  factors: SatisfactionFactor[];
}

export interface TouchpointSatisfaction {
  touchpointId: string;
  touchpointType: string;
  satisfaction: SatisfactionScore;
  context: TouchpointContext;
  improvement: ImprovementOpportunity[];
}

export interface JourneySatisfaction {
  journeyId: string;
  journeyType: string;
  stages: JourneyStage[];
  overall: SatisfactionScore;
  criticalMoments: CriticalMoment[];
  painPoints: PainPoint[];
}

export interface NPSMetrics {
  nps: number;
  promoters: number;
  passives: number;
  detractors: number;
  trends: NPSTrend[];
  drivers: NPSDriver[];
  benchmarks: NPSBenchmark[];
}

export interface SentimentMetrics {
  overall: SentimentScore;
  bySource: SourceSentiment[];
  byTopic: TopicSentiment[];
  temporal: TemporalSentiment[];
  emotions: EmotionMetrics[];
}

// ====================================================================
// CONVERSION & FUNNEL METRICS
// ====================================================================

export interface ConversionMetrics {
  funnels: ConversionFunnel[];
  microConversions: MicroConversion[];
  attribution: AttributionMetrics;
  optimization: ConversionOptimization;
}

export interface ConversionFunnel {
  funnelId: string;
  funnelName: string;
  stages: FunnelStage[];
  overall: FunnelPerformance;
  segments: SegmentFunnel[];
  optimization: FunnelOptimization;
}

export interface FunnelStage {
  stageId: string;
  stageName: string;
  position: number;
  entrants: number;
  completions: number;
  conversionRate: number;
  dropoffRate: number;
  averageTime: number;
  barriers: ConversionBarrier[];
}

export interface FunnelPerformance {
  totalEntrants: number;
  totalCompletions: number;
  overallConversionRate: number;
  averageTime: number;
  valueGenerated: number;
  costPerCompletion: number;
}

export interface MicroConversion {
  name: string;
  type: string;
  value: number;
  frequency: number;
  trends: ConversionTrend[];
  impact: ImpactScore;
}

export interface AttributionMetrics {
  model: AttributionModel;
  touchpoints: TouchpointAttribution[];
  channels: ChannelAttribution[];
  content: ContentAttribution[];
  timing: TimingAttribution[];
}

// ====================================================================
// PREDICTIVE METRICS
// ====================================================================

export interface PredictiveMetrics {
  churnPrediction: ChurnPrediction;
  lifetimeValue: LifetimeValuePrediction;
  nextBestAction: NextBestActionPrediction;
  demandForecasting: DemandForecast;
  trendPrediction: TrendPrediction;
}

export interface ChurnPrediction {
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  predictedChurnDate: Date;
  confidence: number;
  factors: ChurnFactor[];
  interventions: ChurnIntervention[];
  segments: ChurnSegment[];
}

export interface LifetimeValuePrediction {
  predictedLTV: number;
  currentLTV: number;
  potential: number;
  confidence: number;
  timeframe: number;
  factors: LTVFactor[];
  scenarios: LTVScenario[];
}

export interface NextBestActionPrediction {
  recommendations: ActionRecommendation[];
  timing: OptimalTiming;
  channels: OptimalChannel[];
  content: OptimalContent;
  personalization: PersonalizationStrategy;
}

export interface DemandForecast {
  predictions: DemandPrediction[];
  seasonality: SeasonalityForecast;
  trends: TrendForecast[];
  scenarios: DemandScenario[];
  confidence: ForecastConfidence;
}

// ====================================================================
// QUALITY & COMPLIANCE METRICS
// ====================================================================

export interface QualityMetrics {
  overall: QualityIndex;
  dataQuality: DataQualityMetrics;
  communication: CommunicationQuality;
  experience: ExperienceQuality;
  operational: OperationalQuality;
}

export interface QualityIndex {
  score: number;
  components: QualityComponent[];
  trends: QualityTrend[];
  benchmarks: QualityBenchmark[];
  improvements: QualityImprovement[];
}

export interface ComplianceMetrics {
  overall: ComplianceScore;
  regulations: RegulationCompliance[];
  dataProtection: DataProtectionCompliance;
  consent: ConsentCompliance;
  audit: AuditCompliance;
}

export interface ComplianceScore {
  score: number;
  level: "non_compliant" | "partially_compliant" | "compliant" | "fully_compliant";
  requirements: ComplianceRequirement[];
  violations: ComplianceViolation[];
  remediation: RemediationPlan[];
}

// ====================================================================
// BENCHMARKING & COMPARISON
// ====================================================================

export interface BenchmarkingConfig {
  enabled: boolean;
  sources: BenchmarkSource[];
  metrics: BenchmarkMetric[];
  segments: BenchmarkSegment[];
  frequency: "real_time" | "daily" | "weekly" | "monthly";
}

export interface BenchmarkComparison {
  metric: string;
  clinicValue: number;
  benchmarkValue: number;
  percentile: number;
  gap: number;
  performance: "below" | "at" | "above";
  insights: BenchmarkInsight[];
}

export interface BenchmarkSource {
  type: "industry" | "region" | "size" | "specialty" | "custom";
  identifier: string;
  confidence: number;
  lastUpdated: Date;
}

// ====================================================================
// TREND ANALYSIS
// ====================================================================

export interface TrendAnalysis {
  metric: string;
  timeframe: string;
  trend: TrendData;
  seasonality: SeasonalityData;
  anomalies: AnomalyData[];
  forecasts: ForecastData[];
  insights: TrendInsight[];
}

export interface TrendData {
  direction: "increasing" | "decreasing" | "stable" | "volatile";
  magnitude: number;
  velocity: number;
  acceleration: number;
  confidence: number;
  significance: "low" | "medium" | "high";
}

export interface SeasonalityData {
  patterns: SeasonalPattern[];
  strength: number;
  frequency: string;
  peaks: SeasonalPeak[];
  troughs: SeasonalTrough[];
}

export interface AnomalyData {
  timestamp: Date;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: "low" | "medium" | "high" | "critical";
  type: AnomalyType;
  explanation: string[];
}

// ====================================================================
// INSIGHTS & RECOMMENDATIONS
// ====================================================================

export interface MetricInsight {
  type: InsightType;
  title: string;
  description: string;
  confidence: number;
  impact: ImpactScore;
  urgency: "low" | "medium" | "high" | "critical";
  evidence: Evidence[];
  recommendations: string[];
  relatedMetrics: string[];
}

export interface MetricRecommendation {
  type: RecommendationType;
  title: string;
  description: string;
  priority: number;
  effort: EffortLevel;
  impact: ImpactScore;
  implementation: ImplementationGuide;
  success: SuccessMetrics;
  timeline: Timeline;
}

export interface MetricAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  metric: string;
  threshold: ThresholdConfig;
  currentValue: number;
  message: string;
  recommendations: string[];
  timestamp: Date;
  acknowledged: boolean;
}

// ====================================================================
// CONFIGURATION TYPES
// ====================================================================

export interface DimensionConfig {
  name: string;
  type: DimensionType;
  aggregation: AggregationType;
  filters?: FilterConfig[];
}

export interface FilterConfig {
  field: string;
  operator: FilterOperator;
  value: any;
  logic?: "and" | "or";
}

export interface AggregationConfig {
  type: AggregationType;
  timeframe: string;
  granularity: "minute" | "hour" | "day" | "week" | "month" | "quarter" | "year";
  fillGaps: boolean;
}

export interface ComparisonConfig {
  type: ComparisonType;
  baseline: BaselineConfig;
  target?: TargetConfig;
}

export interface AggregationSettings {
  defaultGranularity: "hour" | "day" | "week" | "month";
  aggregationMethods: Record<MetricType, AggregationType>;
  customAggregations: CustomAggregation[];
}

export interface AlertingConfig {
  enabled: boolean;
  channels: AlertChannel[];
  thresholds: AlertThreshold[];
  frequency: AlertFrequency;
  escalation: EscalationConfig;
}

export interface DataRetentionConfig {
  rawData: number; // days
  aggregatedData: number; // days
  archivedData: number; // days
  complianceData: number; // days
  autoCleanup: boolean;
}

export interface CalculationSettings {
  precision: number;
  roundingMode: "floor" | "ceil" | "round";
  confidenceInterval: number;
  significanceLevel: number;
  outlierHandling: "include" | "exclude" | "cap";
}

export interface ExportSettings {
  formats: ExportFormat[];
  scheduling: ExportSchedule[];
  destinations: ExportDestination[];
  templates: ExportTemplate[];
}

// ====================================================================
// SUPPORTING TYPES
// ====================================================================

export type DimensionType =
  | "temporal"
  | "demographic"
  | "behavioral"
  | "channel"
  | "content"
  | "journey"
  | "segment"
  | "geographic"
  | "device"
  | "custom";

export type AggregationType =
  | "sum"
  | "average"
  | "median"
  | "mode"
  | "min"
  | "max"
  | "count"
  | "distinct"
  | "percentile"
  | "weighted_average"
  | "custom";

export type FilterOperator =
  | "equals"
  | "not_equals"
  | "greater_than"
  | "less_than"
  | "greater_equal"
  | "less_equal"
  | "in"
  | "not_in"
  | "contains"
  | "not_contains"
  | "starts_with"
  | "ends_with"
  | "regex"
  | "is_null"
  | "is_not_null";

export type ComparisonType =
  | "period_over_period"
  | "year_over_year"
  | "vs_target"
  | "vs_benchmark"
  | "vs_forecast"
  | "custom";

export type InsightType =
  | "trend"
  | "anomaly"
  | "correlation"
  | "pattern"
  | "opportunity"
  | "risk"
  | "optimization"
  | "prediction";

export type RecommendationType =
  | "optimization"
  | "enhancement"
  | "fix"
  | "experiment"
  | "strategy"
  | "tactical"
  | "preventive"
  | "corrective";

export type AlertType =
  | "threshold"
  | "anomaly"
  | "trend"
  | "quality"
  | "compliance"
  | "performance"
  | "system";

export type AlertSeverity = "info" | "warning" | "error" | "critical";

export type EffortLevel = "minimal" | "low" | "medium" | "high" | "significant";

export type AnomalyType = "spike" | "dip" | "shift" | "drift" | "seasonal" | "outlier";

export type ExportFormat = "csv" | "xlsx" | "pdf" | "json" | "xml" | "api";

// ====================================================================
// COMPLEX TYPES
// ====================================================================

export interface CustomMetricDefinition {
  id: string;
  name: string;
  description: string;
  formula: string;
  dependencies: string[];
  aggregation: AggregationType;
  unit: string;
  category: string;
  tags: string[];
}

export interface DataQualityScore {
  overall: number;
  completeness: number;
  accuracy: number;
  consistency: number;
  timeliness: number;
  issues: DataQualityIssue[];
}

export interface DataQualityIssue {
  type: string;
  severity: "low" | "medium" | "high";
  description: string;
  affectedRecords: number;
  resolution: string;
}

export interface ResultMetadata {
  requestId: string;
  processingTime: number;
  dataPoints: number;
  confidence: number;
  limitations: string[];
  methodology: string;
  version: string;
}

export interface ImpactScore {
  overall: number;
  revenue: number;
  efficiency: number;
  satisfaction: number;
  retention: number;
  acquisition: number;
}

export interface Evidence {
  type: "metric" | "correlation" | "pattern" | "benchmark" | "historical";
  source: string;
  value: any;
  confidence: number;
  timestamp: Date;
}

export interface ImplementationGuide {
  steps: ImplementationStep[];
  resources: RequiredResource[];
  timeline: Timeline;
  risks: ImplementationRisk[];
  success: SuccessMetrics;
}

export interface ImplementationStep {
  order: number;
  title: string;
  description: string;
  duration: number;
  dependencies: string[];
  deliverables: string[];
}

export interface RequiredResource {
  type: "human" | "technical" | "financial" | "external";
  name: string;
  quantity: number;
  unit: string;
  cost?: number;
}

export interface ImplementationRisk {
  type: string;
  probability: number;
  impact: number;
  mitigation: string;
  contingency: string;
}

export interface SuccessMetrics {
  primary: SuccessMetric[];
  secondary: SuccessMetric[];
  timeline: MilestoneMetric[];
}

export interface SuccessMetric {
  name: string;
  target: number;
  unit: string;
  measurement: string;
  frequency: string;
}

export interface MilestoneMetric {
  milestone: string;
  date: Date;
  metrics: SuccessMetric[];
}

export interface Timeline {
  startDate: Date;
  endDate: Date;
  phases: TimelinePhase[];
  milestones: Milestone[];
}

export interface TimelinePhase {
  name: string;
  startDate: Date;
  endDate: Date;
  deliverables: string[];
  dependencies: string[];
}

export interface Milestone {
  name: string;
  date: Date;
  description: string;
  criteria: string[];
  dependencies: string[];
}

// ====================================================================
// SPECIALIZED METRIC TYPES
// ====================================================================

export interface CrossChannelBehavior {
  sequences: ChannelSequence[];
  preferences: ChannelPreference[];
  attribution: CrossChannelAttribution;
  synergies: ChannelSynergy[];
}

export interface ChannelSequence {
  sequence: string[];
  frequency: number;
  conversionRate: number;
  averageTime: number;
  value: number;
}

export interface ChannelPreference {
  channel: string;
  preference: number;
  confidence: number;
  context: PreferenceContext[];
}

export interface ChannelOptimization {
  current: ChannelPerformance;
  potential: ChannelPerformance;
  recommendations: ChannelRecommendation[];
  experiments: ChannelExperiment[];
}

export interface ChannelPerformance {
  engagement: number;
  conversion: number;
  cost: number;
  satisfaction: number;
  quality: number;
}

export interface ChannelRecommendation {
  type: string;
  description: string;
  impact: ImpactScore;
  effort: EffortLevel;
  priority: number;
}

export interface ChannelExperiment {
  id: string;
  name: string;
  hypothesis: string;
  design: ExperimentDesign;
  status: ExperimentStatus;
  results?: ExperimentResults;
}

export interface ContentAnalysis {
  topics: TopicAnalysis[];
  sentiment: SentimentScore;
  readability: ReadabilityScore;
  effectiveness: ContentEffectiveness;
}

export interface TopicAnalysis {
  topic: string;
  relevance: number;
  sentiment: number;
  engagement: number;
}

export interface SentimentScore {
  overall: number;
  positive: number;
  negative: number;
  neutral: number;
  emotions: EmotionScore[];
}

export interface EmotionScore {
  emotion: string;
  score: number;
  confidence: number;
}

export interface ReadabilityScore {
  overall: number;
  complexity: number;
  clarity: number;
  accessibility: number;
  recommendations: string[];
}

export interface ContentEffectiveness {
  engagement: number;
  conversion: number;
  retention: number;
  virality: number;
  factors: EffectivenessFactor[];
}

export interface EffectivenessFactor {
  factor: string;
  impact: number;
  confidence: number;
  explanation: string;
}

export interface ContentVariation {
  id: string;
  type: string;
  description: string;
  performance: ContentPerformance;
  significance: number;
}

export interface ContentPerformance {
  engagement: OverallEngagement;
  conversion: ConversionMetrics;
  quality: QualityScore;
  feedback: FeedbackScore;
}

export interface QualityScore {
  overall: number;
  accuracy: number;
  relevance: number;
  timeliness: number;
  completeness: number;
}

export interface FeedbackScore {
  overall: number;
  satisfaction: number;
  usefulness: number;
  clarity: number;
  actionability: number;
}

// ====================================================================
// ADDITIONAL SUPPORTING TYPES
// ====================================================================

export interface ThresholdConfig {
  metric: string;
  operator: FilterOperator;
  value: number;
  severity: AlertSeverity;
  conditions?: ThresholdCondition[];
}

export interface ThresholdCondition {
  field: string;
  operator: FilterOperator;
  value: any;
}

export interface BaselineConfig {
  type: "historical" | "target" | "benchmark" | "forecast";
  period?: { start: Date; end: Date };
  value?: number;
  source?: string;
}

export interface TargetConfig {
  value: number;
  type: "absolute" | "relative" | "percentile";
  confidence?: number;
  source: string;
}

export interface ScoreDistribution {
  range: { min: number; max: number };
  count: number;
  percentage: number;
}

export interface SatisfactionComponent {
  component: string;
  weight: number;
  score: number;
  trend: TrendData;
}

export interface SatisfactionTrend {
  period: string;
  score: number;
  change: number;
  significance: "low" | "medium" | "high";
}

export interface SatisfactionFactor {
  factor: string;
  impact: number;
  confidence: number;
  recommendation: string;
}

// ====================================================================
// EXPORT TYPES
// ====================================================================

export interface ExportSchedule {
  id: string;
  name: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly";
  time: string;
  timezone: string;
  enabled: boolean;
}

export interface ExportDestination {
  type: "email" | "ftp" | "api" | "storage";
  configuration: Record<string, any>;
  credentials?: Record<string, any>;
}

export interface ExportTemplate {
  id: string;
  name: string;
  format: ExportFormat;
  structure: ExportStructure;
  styling?: ExportStyling;
}

export interface ExportStructure {
  sections: ExportSection[];
  charts: ChartConfig[];
  tables: TableConfig[];
  formatting: FormattingConfig;
}

export interface ExportSection {
  title: string;
  type: "summary" | "detail" | "chart" | "table" | "narrative";
  content: string;
  order: number;
}

export interface ChartConfig {
  type: string;
  data: string;
  options: Record<string, any>;
}

export interface TableConfig {
  columns: TableColumn[];
  sorting: SortConfig[];
  filtering: FilterConfig[];
  pagination: boolean;
}

export interface TableColumn {
  key: string;
  title: string;
  type: "text" | "number" | "date" | "percentage" | "currency";
  format?: string;
  sortable: boolean;
}

export interface SortConfig {
  column: string;
  direction: "asc" | "desc";
}

export interface FormattingConfig {
  numberFormat: string;
  dateFormat: string;
  currencyFormat: string;
  percentageFormat: string;
}

export interface ExportStyling {
  theme: string;
  colors: string[];
  fonts: FontConfig[];
  layout: LayoutConfig;
}

export interface FontConfig {
  family: string;
  size: number;
  weight: string;
  color: string;
}

export interface LayoutConfig {
  orientation: "portrait" | "landscape";
  margins: { top: number; right: number; bottom: number; left: number };
  spacing: number;
}

// ====================================================================
// HEALTHCARE-SPECIFIC TYPES
// ====================================================================

export interface HealthcareComplianceMetrics {
  lgpd: LGPDComplianceMetrics;
  anvisa: ANVISAComplianceMetrics;
  cfm: CFMComplianceMetrics;
  iso27001: ISO27001Metrics;
}

export interface LGPDComplianceMetrics {
  dataProcessingCompliance: number;
  consentManagement: number;
  dataSubjectRights: number;
  dataProtectionOfficer: number;
  breachManagement: number;
  overall: number;
}

export interface ANVISAComplianceMetrics {
  softwareClassification: number;
  regulatoryDocumentation: number;
  qualityManagement: number;
  riskManagement: number;
  clinicalEvaluation: number;
  overall: number;
}

export interface CFMComplianceMetrics {
  medicalEthics: number;
  patientPrivacy: number;
  professionalResponsibility: number;
  dataAccuracy: number;
  accessControl: number;
  overall: number;
}

export interface ISO27001Metrics {
  informationSecurity: number;
  riskAssessment: number;
  accessControl: number;
  incidentManagement: number;
  businessContinuity: number;
  overall: number;
}
