/**
 * Channel Optimization Types
 * NeonPro - Tipos para otimização inteligente de canais de comunicação
 */

export interface ChannelPreference {
  channel: CommunicationType;
  preference: number; // 0-1 (0 = avoid, 1 = prefer)
  reason: string;
  confidence: number;
  lastUpdated: Date;
  sampleSize: number;
}

export interface PatientChannelProfile {
  patientId: string;
  clinicId: string;
  preferences: ChannelPreference[];
  behaviors: ChannelBehavior[];
  demographics: PatientDemographics;
  devices: DeviceProfile[];
  accessibility: AccessibilityNeeds;
  createdAt: Date;
  lastUpdated: Date;
}

export interface ChannelBehavior {
  channel: CommunicationType;
  engagement: ChannelEngagement;
  responsePatterns: ResponsePattern[];
  usage: ChannelUsage;
  trends: EngagementTrend[];
}

export interface ChannelEngagement {
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  totalResponded: number;
  averageResponseTime: number; // minutes
  engagementScore: number; // 0-100
  lastEngagement: Date;
  declineRate: number; // rate of engagement decline
}

export interface ResponsePattern {
  timeOfDay: number; // hour 0-23
  dayOfWeek: number; // 0-6
  responseRate: number; // percentage
  averageResponseTime: number; // minutes
  quality: ResponseQuality;
}

export interface ResponseQuality {
  sentiment: 'positive' | 'neutral' | 'negative';
  completion: number; // percentage of completed actions
  satisfaction: number; // 1-5 scale
  actionTaken: boolean;
}

export interface ChannelUsage {
  frequency: UsageFrequency;
  volume: UsageVolume;
  timing: UsageTiming;
  context: UsageContext[];
}

export interface UsageFrequency {
  daily: number;
  weekly: number;
  monthly: number;
  preferred: 'low' | 'medium' | 'high';
}

export interface UsageVolume {
  totalMessages: number;
  averagePerWeek: number;
  peakVolume: number;
  sustainableVolume: number;
}

export interface UsageTiming {
  preferredHours: number[];
  avoidHours: number[];
  preferredDays: number[];
  timeZone: string;
}

export interface UsageContext {
  type: CommunicationPurpose;
  channel: CommunicationType;
  effectiveness: number; // 0-100
  appropriateness: number; // 0-100
}

export interface EngagementTrend {
  period: TrendPeriod;
  direction: 'increasing' | 'decreasing' | 'stable';
  magnitude: number; // percentage change
  confidence: number;
  factors: TrendFactor[];
}

export interface TrendFactor {
  factor: string;
  impact: number; // -1 to 1
  confidence: number;
}

export type TrendPeriod = '7d' | '30d' | '90d' | '365d';

export interface PatientDemographics {
  age: number;
  ageGroup: AgeGroup;
  gender: Gender;
  location: PatientLocation;
  digitalLiteracy: DigitalLiteracy;
  communicationStyle: CommunicationStyle;
}

export type AgeGroup = '18-24' | '25-34' | '35-44' | '45-54' | '55-64' | '65+';
export type Gender = 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';

export interface PatientLocation {
  city: string;
  state: string;
  region: string;
  timezone: string;
  connectivity: ConnectivityLevel;
}

export type ConnectivityLevel = 'excellent' | 'good' | 'fair' | 'poor';

export interface DigitalLiteracy {
  level: LiteracyLevel;
  devices: DeviceComfort[];
  features: FeatureComfort[];
  supportNeeds: SupportLevel;
}

export type LiteracyLevel = 'high' | 'medium' | 'low' | 'unknown';
export type SupportLevel = 'none' | 'minimal' | 'moderate' | 'high';

export interface DeviceComfort {
  device: DeviceType;
  comfort: number; // 0-100
  usage: DeviceUsage;
}

export type DeviceType = 'smartphone' | 'tablet' | 'computer' | 'smartwatch';

export interface DeviceUsage {
  frequency: 'daily' | 'weekly' | 'monthly' | 'rarely';
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  primaryUse: string[];
}

export interface FeatureComfort {
  feature: CommunicationFeature;
  comfort: number; // 0-100
  usage: FeatureUsage;
}

export type CommunicationFeature = 
  | 'text_messages' 
  | 'voice_calls' 
  | 'video_calls' 
  | 'email' 
  | 'push_notifications'
  | 'app_messaging'
  | 'social_media'
  | 'web_portals';

export interface FeatureUsage {
  frequency: 'high' | 'medium' | 'low' | 'never';
  preference: number; // 0-100
  effectiveness: number; // 0-100
}

export type CommunicationStyle = 'formal' | 'casual' | 'technical' | 'empathetic' | 'direct' | 'detailed';

export interface DeviceProfile {
  deviceId: string;
  type: DeviceType;
  os: OperatingSystem;
  capabilities: DeviceCapabilities;
  usage: DeviceUsagePattern;
  notifications: NotificationSettings;
}

export type OperatingSystem = 'ios' | 'android' | 'windows' | 'macos' | 'web';

export interface DeviceCapabilities {
  pushNotifications: boolean;
  sms: boolean;
  email: boolean;
  calling: boolean;
  internet: boolean;
  camera: boolean;
  microphone: boolean;
  accessibility: AccessibilityFeature[];
}

export type AccessibilityFeature = 
  | 'voice_over' 
  | 'large_text' 
  | 'high_contrast' 
  | 'reduced_motion' 
  | 'hearing_aid_compatible';

export interface DeviceUsagePattern {
  primaryHours: number[];
  activeHours: number[];
  timezone: string;
  batteryAware: boolean;
  dataAware: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  quietHours: TimeWindow;
  urgencyLevels: UrgencyLevel[];
  channels: EnabledChannel[];
}

export interface TimeWindow {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  timezone: string;
}

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export interface EnabledChannel {
  channel: CommunicationType;
  enabled: boolean;
  urgencyThreshold: UrgencyLevel;
}

export interface AccessibilityNeeds {
  hasNeeds: boolean;
  needs: AccessibilityRequirement[];
  accommodations: Accommodation[];
  supportContacts: SupportContact[];
}

export interface AccessibilityRequirement {
  type: AccessibilityType;
  severity: 'mild' | 'moderate' | 'severe';
  accommodationRequired: boolean;
  description: string;
}

export type AccessibilityType = 
  | 'visual_impairment' 
  | 'hearing_impairment' 
  | 'motor_impairment' 
  | 'cognitive_impairment'
  | 'language_barrier';

export interface Accommodation {
  type: AccommodationType;
  implementation: string;
  effectiveness: number; // 0-100
  lastReviewed: Date;
}

export type AccommodationType = 
  | 'large_text' 
  | 'high_contrast' 
  | 'voice_output' 
  | 'simplified_interface'
  | 'multilingual_support'
  | 'caregiver_copy';

export interface SupportContact {
  name: string;
  relationship: string;
  contact: ContactInformation;
  permissions: SupportPermission[];
}

export interface ContactInformation {
  phone?: string;
  email?: string;
  preferredMethod: CommunicationType;
}

export type SupportPermission = 
  | 'receive_notifications' 
  | 'emergency_contact' 
  | 'medical_updates' 
  | 'appointment_reminders';

export type CommunicationType = 'email' | 'sms' | 'whatsapp' | 'push' | 'voice' | 'video';

export type CommunicationPurpose = 
  | 'appointment_reminder'
  | 'appointment_confirmation'
  | 'appointment_reschedule'
  | 'treatment_followup'
  | 'medication_reminder'
  | 'results_notification'
  | 'marketing'
  | 'educational'
  | 'emergency'
  | 'satisfaction_survey'
  | 'payment_reminder'
  | 'promotional';

export interface ChannelOptimizationRequest {
  patientId: string;
  clinicId: string;
  purpose: CommunicationPurpose;
  urgency: UrgencyLevel;
  content: CommunicationContent;
  constraints: OptimizationConstraints;
  preferences?: ChannelPreferenceOverride[];
}

export interface CommunicationContent {
  type: ContentType;
  length: ContentLength;
  complexity: ContentComplexity;
  mediaTypes: MediaType[];
  interactivity: InteractivityLevel;
  personalization: PersonalizationLevel;
}

export type ContentType = 'informational' | 'actionable' | 'promotional' | 'emergency' | 'educational';
export type ContentLength = 'short' | 'medium' | 'long';
export type ContentComplexity = 'simple' | 'moderate' | 'complex';
export type MediaType = 'text' | 'image' | 'video' | 'audio' | 'document' | 'interactive';
export type InteractivityLevel = 'none' | 'low' | 'medium' | 'high';
export type PersonalizationLevel = 'none' | 'basic' | 'moderate' | 'high';

export interface OptimizationConstraints {
  maxChannels: number;
  timeConstraints: TimeConstraint[];
  budgetConstraints: BudgetConstraint[];
  complianceRequirements: ComplianceRequirement[];
  exclusions: ChannelExclusion[];
}

export interface TimeConstraint {
  type: 'send_before' | 'send_after' | 'send_between';
  value: Date | TimeWindow;
}

export interface BudgetConstraint {
  channel: CommunicationType;
  maxCost: number;
  currency: string;
}

export interface ComplianceRequirement {
  type: 'lgpd' | 'anvisa' | 'cfm' | 'custom';
  rule: string;
  mandatory: boolean;
}

export interface ChannelExclusion {
  channel: CommunicationType;
  reason: string;
  until?: Date;
}

export interface ChannelPreferenceOverride {
  channel: CommunicationType;
  override: 'force_include' | 'force_exclude' | 'prefer' | 'avoid';
  reason: string;
}

export interface ChannelOptimizationResult {
  requestId: string;
  patientId: string;
  recommendations: ChannelRecommendation[];
  alternativeChannels: AlternativeChannel[];
  reasoning: OptimizationReasoning;
  confidence: number;
  estimatedEffectiveness: EffectivenessEstimate;
  estimatedCost: CostEstimate;
  complianceValidation: ComplianceValidation;
  generatedAt: Date;
}

export interface ChannelRecommendation {
  channel: CommunicationType;
  priority: number; // 1 = highest
  confidence: number; // 0-1
  reasoning: string[];
  adaptations: ContentAdaptation[];
  timing: RecommendedTiming;
  expectedOutcome: OutcomeExpectation;
}

export interface ContentAdaptation {
  type: AdaptationType;
  description: string;
  required: boolean;
  impact: AdaptationImpact;
}

export type AdaptationType = 
  | 'format_change' 
  | 'length_adjustment' 
  | 'tone_modification' 
  | 'accessibility_enhancement'
  | 'personalization_increase'
  | 'simplification';

export interface AdaptationImpact {
  effectiveness: number; // percentage change
  accessibility: number; // percentage improvement
  compliance: number; // percentage improvement
}

export interface RecommendedTiming {
  preferredTime: Date;
  timeWindow: TimeWindow;
  avoidTimes: TimeWindow[];
  factors: TimingFactor[];
}

export interface TimingFactor {
  factor: string;
  impact: number; // -1 to 1
  reasoning: string;
}

export interface OutcomeExpectation {
  responseRate: number; // percentage
  engagementRate: number; // percentage
  satisfactionScore: number; // 1-10
  completionRate: number; // percentage
  timeToResponse: number; // minutes
}

export interface AlternativeChannel {
  channel: CommunicationType;
  reason: string;
  whenToUse: string;
  expectedEffectiveness: number; // percentage
}

export interface OptimizationReasoning {
  primaryFactors: ReasoningFactor[];
  considerations: Consideration[];
  tradeoffs: Tradeoff[];
  assumptions: Assumption[];
}

export interface ReasoningFactor {
  factor: string;
  weight: number; // 0-1
  impact: number; // -1 to 1
  evidence: Evidence[];
}

export interface Evidence {
  type: EvidenceType;
  source: string;
  confidence: number;
  description: string;
}

export type EvidenceType = 'historical_data' | 'patient_preference' | 'clinical_guideline' | 'research_study' | 'expert_opinion';

export interface Consideration {
  aspect: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  importance: 'low' | 'medium' | 'high';
}

export interface Tradeoff {
  option1: string;
  option2: string;
  benefit1: string;
  benefit2: string;
  recommendation: string;
  reasoning: string;
}

export interface Assumption {
  assumption: string;
  confidence: number;
  impact: string;
  validation: string;
}

export interface EffectivenessEstimate {
  overall: number; // percentage
  byChannel: ChannelEffectiveness[];
  byOutcome: OutcomeEffectiveness[];
  factors: EffectivenessFactor[];
}

export interface ChannelEffectiveness {
  channel: CommunicationType;
  effectiveness: number; // percentage
  confidence: number;
  comparison: ChannelComparison;
}

export interface ChannelComparison {
  vsBaseline: number; // percentage difference
  vsAlternatives: AlternativeComparison[];
  ranking: number; // 1 = best
}

export interface AlternativeComparison {
  channel: CommunicationType;
  difference: number; // percentage
  reasoning: string;
}

export interface OutcomeEffectiveness {
  outcome: string;
  effectiveness: number; // percentage
  confidence: number;
}

export interface EffectivenessFactor {
  factor: string;
  contribution: number; // percentage
  confidence: number;
}

export interface CostEstimate {
  total: number;
  currency: string;
  breakdown: CostBreakdown[];
  comparison: CostComparison;
}

export interface CostBreakdown {
  channel: CommunicationType;
  cost: number;
  type: CostType;
  volume: number;
  unitCost: number;
}

export type CostType = 'fixed' | 'per_message' | 'per_minute' | 'per_engagement';

export interface CostComparison {
  vsBaseline: number; // percentage difference
  vsAlternatives: number; // percentage difference
  roi: ROIEstimate;
}

export interface ROIEstimate {
  estimated: number; // percentage
  confidence: number;
  timeframe: string;
  assumptions: string[];
}

export interface ComplianceValidation {
  overall: boolean;
  requirements: RequirementValidation[];
  risks: ComplianceRisk[];
  recommendations: ComplianceRecommendation[];
}

export interface RequirementValidation {
  requirement: string;
  compliant: boolean;
  evidence: string;
  actions: string[];
}

export interface ComplianceRisk {
  risk: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // percentage
  mitigation: string[];
}

export interface ComplianceRecommendation {
  recommendation: string;
  priority: 'low' | 'medium' | 'high';
  implementation: string;
  impact: string;
}

export interface ChannelOptimizationConfig {
  clinicId: string;
  globalSettings: GlobalOptimizationSettings;
  channelSettings: Record<CommunicationType, ChannelSettings>;
  contentSettings: ContentOptimizationSettings;
  complianceSettings: ComplianceSettings;
}

export interface GlobalOptimizationSettings {
  enabled: boolean;
  defaultStrategy: OptimizationStrategy;
  learningEnabled: boolean;
  adaptationRate: number; // 0-1
  confidenceThreshold: number; // 0-1
  fallbackChannels: CommunicationType[];
  maxChannelsPerCommunication: number;
  optimizationFrequency: OptimizationFrequency;
}

export type OptimizationStrategy = 'effectiveness' | 'cost' | 'speed' | 'compliance' | 'patient_preference';
export type OptimizationFrequency = 'realtime' | 'daily' | 'weekly' | 'monthly';

export interface ChannelSettings {
  enabled: boolean;
  priority: number; // 1-10
  costModel: CostModel;
  constraints: ChannelConstraints;
  adaptations: ChannelAdaptation[];
  qualityThresholds: QualityThresholds;
}

export interface CostModel {
  type: CostType;
  baseCost: number;
  volumeDiscounts: VolumeDiscount[];
  additionalCosts: AdditionalCost[];
}

export interface VolumeDiscount {
  threshold: number;
  discount: number; // percentage
}

export interface AdditionalCost {
  service: string;
  cost: number;
  type: CostType;
}

export interface ChannelConstraints {
  maxDaily: number;
  maxWeekly: number;
  maxMonthly: number;
  cooldownPeriod: number; // minutes
  blackoutPeriods: TimeWindow[];
  requiresConsent: boolean;
}

export interface ChannelAdaptation {
  trigger: AdaptationTrigger;
  modification: ContentModification;
  conditions: AdaptationCondition[];
}

export interface AdaptationTrigger {
  type: TriggerType;
  threshold: number;
  metric: string;
}

export type TriggerType = 'effectiveness_drop' | 'engagement_drop' | 'complaint' | 'accessibility_need';

export interface ContentModification {
  type: ModificationType;
  parameters: Record<string, any>;
  validation: ValidationRule[];
}

export type ModificationType = 
  | 'shorten_content' 
  | 'simplify_language' 
  | 'add_personalization' 
  | 'change_tone'
  | 'add_accessibility_features'
  | 'modify_timing';

export interface ValidationRule {
  rule: string;
  required: boolean;
  error: string;
}

export interface AdaptationCondition {
  condition: string;
  value: any;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in_range';
}

export interface QualityThresholds {
  minEffectiveness: number; // percentage
  minSatisfaction: number; // 1-10
  maxComplaints: number;
  minCompliance: number; // percentage
}

export interface ContentOptimizationSettings {
  personalizationLevel: PersonalizationLevel;
  adaptationEnabled: boolean;
  a11yRequired: boolean;
  languageAdaptation: boolean;
  toneAdaptation: boolean;
  lengthOptimization: boolean;
}

export interface ComplianceSettings {
  strictMode: boolean;
  requiredConsents: ConsentType[];
  auditingEnabled: boolean;
  dataRetention: DataRetentionPolicy;
  privacySettings: PrivacySettings;
}

export type ConsentType = 'marketing' | 'treatment' | 'research' | 'data_sharing' | 'communication';

export interface DataRetentionPolicy {
  defaultPeriod: number; // days
  byDataType: Record<string, number>;
  autoDelete: boolean;
  archivingEnabled: boolean;
}

export interface PrivacySettings {
  anonymizeAnalytics: boolean;
  encryptPersonalData: boolean;
  minimizeDataCollection: boolean;
  respectDoNotContact: boolean;
}

export interface ChannelAnalytics {
  period: AnalyticsPeriod;
  metrics: ChannelMetrics[];
  optimization: OptimizationMetrics;
  insights: ChannelInsight[];
  recommendations: AnalyticsRecommendation[];
}

export interface AnalyticsPeriod {
  start: Date;
  end: Date;
  granularity: 'hour' | 'day' | 'week' | 'month';
}

export interface ChannelMetrics {
  channel: CommunicationType;
  volume: VolumeMetrics;
  engagement: EngagementMetrics;
  effectiveness: EffectivenessMetrics;
  cost: CostMetrics;
  quality: QualityMetrics;
}

export interface VolumeMetrics {
  total: number;
  successful: number;
  failed: number;
  trend: TrendData;
}

export interface EngagementMetrics {
  openRate: number;
  clickRate: number;
  responseRate: number;
  conversionRate: number;
  trend: TrendData;
}

export interface EffectivenessMetrics {
  completionRate: number;
  satisfactionScore: number;
  timeToAction: number; // minutes
  goalAchievementRate: number;
}

export interface CostMetrics {
  total: number;
  perMessage: number;
  perEngagement: number;
  roi: number;
}

export interface QualityMetrics {
  deliveryRate: number;
  errorRate: number;
  complaintRate: number;
  complianceScore: number;
}

export interface TrendData {
  direction: 'up' | 'down' | 'stable';
  magnitude: number; // percentage
  confidence: number;
}

export interface OptimizationMetrics {
  optimizationRate: number; // percentage of communications optimized
  improvementRate: number; // average improvement
  adoptionRate: number; // percentage using recommendations
  successRate: number; // percentage of successful optimizations
}

export interface ChannelInsight {
  type: InsightType;
  insight: string;
  data: InsightData;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
}

export type InsightType = 'trend' | 'anomaly' | 'opportunity' | 'risk' | 'pattern';

export interface InsightData {
  metric: string;
  value: number;
  comparison: ComparisonData;
  context: string[];
}

export interface ComparisonData {
  baseline: number;
  change: number;
  significance: number;
}

export interface AnalyticsRecommendation {
  type: RecommendationType;
  description: string;
  impact: ImpactEstimate;
  effort: EffortEstimate;
  timeline: string;
  dependencies: string[];
}

export type RecommendationType = 
  | 'channel_optimization' 
  | 'content_adaptation' 
  | 'timing_adjustment'
  | 'audience_segmentation'
  | 'cost_optimization'
  | 'compliance_improvement';

export interface ImpactEstimate {
  effectiveness: number; // percentage improvement
  cost: number; // percentage change
  satisfaction: number; // percentage improvement
  compliance: number; // percentage improvement
}

export interface EffortEstimate {
  technical: 'low' | 'medium' | 'high';
  operational: 'low' | 'medium' | 'high';
  training: 'low' | 'medium' | 'high';
  timeline: string;
}

export interface ChannelOptimizationJob {
  id: string;
  clinicId: string;
  type: JobType;
  status: JobStatus;
  parameters: JobParameters;
  progress: JobProgress;
  results?: ChannelOptimizationResult;
  error?: JobError;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export type JobType = 
  | 'profile_update' 
  | 'batch_optimization' 
  | 'analytics_calculation'
  | 'model_training'
  | 'compliance_audit';

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface JobParameters {
  patientIds?: string[];
  dateRange?: { start: Date; end: Date };
  channels?: CommunicationType[];
  configuration?: Partial<ChannelOptimizationConfig>;
}

export interface JobProgress {
  percentage: number;
  currentStep: string;
  estimatedCompletion?: Date;
  itemsProcessed: number;
  totalItems: number;
}

export interface JobError {
  code: string;
  message: string;
  details: Record<string, any>;
  retryable: boolean;
}

export interface ChannelLearningData {
  patientId: string;
  communicationId: string;
  prediction: ChannelRecommendation;
  actualOutcome: ActualOutcome;
  feedback: LearningFeedback;
  confidence: number;
  timestamp: Date;
}

export interface ActualOutcome {
  channel: CommunicationType;
  opened: boolean;
  clicked: boolean;
  responded: boolean;
  completed: boolean;
  responseTime?: number; // minutes
  satisfaction?: number; // 1-10
  feedback?: string;
}

export interface LearningFeedback {
  predictionAccuracy: number; // 0-1
  factors: FeedbackFactor[];
  improvements: Improvement[];
  confidence: number;
}

export interface FeedbackFactor {
  factor: string;
  expected: number;
  actual: number;
  impact: number;
}

export interface Improvement {
  area: string;
  suggestion: string;
  priority: 'low' | 'medium' | 'high';
  implementation: string;
}

export interface ChannelTestResult {
  testId: string;
  type: TestType;
  hypothesis: string;
  setup: TestSetup;
  results: TestResults;
  conclusion: TestConclusion;
  createdAt: Date;
  completedAt?: Date;
}

export type TestType = 'ab_test' | 'multivariate' | 'champion_challenger' | 'canary';

export interface TestSetup {
  variants: TestVariant[];
  allocation: AllocationStrategy;
  duration: TestDuration;
  successMetrics: SuccessMetric[];
  segments: TestSegment[];
}

export interface TestVariant {
  id: string;
  name: string;
  description: string;
  configuration: ChannelConfiguration;
  allocation: number; // percentage
}

export interface ChannelConfiguration {
  channels: CommunicationType[];
  timing: TimingConfiguration;
  content: ContentConfiguration;
  personalization: PersonalizationConfiguration;
}

export interface TimingConfiguration {
  strategy: TimingStrategy;
  windows: TimeWindow[];
  delays: DelayConfiguration[];
}

export type TimingStrategy = 'immediate' | 'optimal' | 'batch' | 'triggered';

export interface DelayConfiguration {
  type: DelayType;
  duration: number; // minutes
  conditions: DelayCondition[];
}

export type DelayType = 'fixed' | 'adaptive' | 'conditional';

export interface DelayCondition {
  condition: string;
  value: any;
  operator: string;
}

export interface ContentConfiguration {
  template: string;
  personalization: PersonalizationRule[];
  adaptations: ContentAdaptationRule[];
  localization: LocalizationRule[];
}

export interface PersonalizationRule {
  field: string;
  source: DataSource;
  fallback: string;
  formatting: FormattingRule[];
}

export interface DataSource {
  type: SourceType;
  path: string;
  conditions: SourceCondition[];
}

export type SourceType = 'patient_data' | 'appointment_data' | 'clinic_data' | 'external_api';

export interface SourceCondition {
  field: string;
  operator: string;
  value: any;
}

export interface FormattingRule {
  type: FormatType;
  parameters: Record<string, any>;
}

export type FormatType = 'date' | 'currency' | 'phone' | 'name' | 'address';

export interface ContentAdaptationRule {
  trigger: ContentTrigger;
  adaptation: ContentAdaptation;
  priority: number;
}

export interface ContentTrigger {
  type: TriggerType;
  conditions: TriggerCondition[];
}

export interface TriggerCondition {
  field: string;
  operator: string;
  value: any;
}

export interface LocalizationRule {
  locale: string;
  translations: Record<string, string>;
  formatting: LocaleFormatting;
}

export interface LocaleFormatting {
  dateFormat: string;
  timeFormat: string;
  currencyFormat: string;
  phoneFormat: string;
}

export interface PersonalizationConfiguration {
  level: PersonalizationLevel;
  rules: PersonalizationRule[];
  fallbacks: PersonalizationFallback[];
}

export interface PersonalizationFallback {
  condition: string;
  fallback: PersonalizationRule;
  priority: number;
}

export interface AllocationStrategy {
  type: AllocationType;
  distribution: AllocationDistribution[];
  constraints: AllocationConstraint[];
}

export type AllocationType = 'random' | 'stratified' | 'cohort' | 'geographic';

export interface AllocationDistribution {
  variant: string;
  percentage: number;
  constraints: DistributionConstraint[];
}

export interface DistributionConstraint {
  field: string;
  operator: string;
  value: any;
}

export interface AllocationConstraint {
  type: ConstraintType;
  rule: string;
  value: any;
}

export type ConstraintType = 'demographic' | 'behavioral' | 'temporal' | 'geographic';

export interface TestDuration {
  type: DurationType;
  value: number;
  conditions: StoppingCondition[];
}

export type DurationType = 'fixed_time' | 'sample_size' | 'significance' | 'conditional';

export interface StoppingCondition {
  metric: string;
  threshold: number;
  direction: 'greater_than' | 'less_than' | 'significant_difference';
}

export interface SuccessMetric {
  name: string;
  type: MetricType;
  calculation: MetricCalculation;
  target: MetricTarget;
  weight: number; // 0-1
}

export type MetricType = 'conversion' | 'engagement' | 'satisfaction' | 'cost' | 'time';

export interface MetricCalculation {
  formula: string;
  parameters: Record<string, any>;
  filters: MetricFilter[];
}

export interface MetricFilter {
  field: string;
  operator: string;
  value: any;
}

export interface MetricTarget {
  type: TargetType;
  value: number;
  tolerance: number;
}

export type TargetType = 'absolute' | 'relative' | 'lift' | 'improvement';

export interface TestSegment {
  name: string;
  criteria: SegmentCriteria[];
  allocation: SegmentAllocation;
}

export interface SegmentCriteria {
  field: string;
  operator: string;
  value: any;
  weight: number;
}

export interface SegmentAllocation {
  strategy: SegmentStrategy;
  distribution: Record<string, number>; // variant -> percentage
}

export type SegmentStrategy = 'proportional' | 'equal' | 'weighted' | 'custom';

export interface TestResults {
  summary: ResultSummary;
  variants: VariantResult[];
  metrics: MetricResult[];
  significance: SignificanceResult;
  segments: SegmentResult[];
}

export interface ResultSummary {
  winner: string;
  confidence: number;
  improvement: number; // percentage
  significance: boolean;
  recommendedAction: RecommendedAction;
}

export type RecommendedAction = 'implement_winner' | 'continue_testing' | 'stop_test' | 'redesign_test';

export interface VariantResult {
  variant: string;
  metrics: VariantMetrics;
  sample: SampleMetrics;
  performance: PerformanceMetrics;
}

export interface VariantMetrics {
  conversions: number;
  engagements: number;
  cost: number;
  satisfaction: number;
  errors: number;
}

export interface SampleMetrics {
  size: number;
  allocation: number; // percentage
  demographics: DemographicBreakdown;
}

export interface DemographicBreakdown {
  age: Record<AgeGroup, number>;
  gender: Record<Gender, number>;
  location: Record<string, number>;
}

export interface MetricResult {
  metric: string;
  results: MetricValues[];
  significance: MetricSignificance;
  recommendation: MetricRecommendation;
}

export interface MetricValues {
  variant: string;
  value: number;
  confidence: ConfidenceInterval;
  trend: TrendAnalysis;
}

export interface ConfidenceInterval {
  lower: number;
  upper: number;
  level: number; // percentage
}

export interface TrendAnalysis {
  direction: 'improving' | 'declining' | 'stable';
  rate: number; // percentage per day
  confidence: number;
}

export interface MetricSignificance {
  pValue: number;
  significant: boolean;
  effect: EffectSize;
  power: number;
}

export interface EffectSize {
  cohens_d: number;
  practical: boolean;
  interpretation: string;
}

export interface MetricRecommendation {
  action: MetricAction;
  reasoning: string;
  confidence: number;
  next_steps: string[];
}

export type MetricAction = 'implement' | 'investigate' | 'ignore' | 'monitor';

export interface SignificanceResult {
  overall: SignificanceTest;
  pairwise: PairwiseComparison[];
  bonferroni: BonferroniCorrection;
}

export interface SignificanceTest {
  test: TestStatistic;
  pValue: number;
  significant: boolean;
  alpha: number;
}

export interface TestStatistic {
  type: StatisticType;
  value: number;
  degreesOfFreedom?: number;
}

export type StatisticType = 'chi_square' | 't_test' | 'f_test' | 'z_test';

export interface PairwiseComparison {
  variant1: string;
  variant2: string;
  difference: number;
  significance: SignificanceTest;
  interpretation: string;
}

export interface BonferroniCorrection {
  adjustedAlpha: number;
  corrections: CorrectionResult[];
}

export interface CorrectionResult {
  comparison: string;
  originalP: number;
  adjustedP: number;
  significant: boolean;
}

export interface SegmentResult {
  segment: string;
  results: SegmentPerformance[];
  insights: SegmentInsight[];
}

export interface SegmentPerformance {
  variant: string;
  metrics: SegmentMetrics;
  significance: SegmentSignificance;
}

export interface SegmentMetrics {
  sample: number;
  conversions: number;
  rate: number;
  improvement: number;
}

export interface SegmentSignificance {
  significant: boolean;
  confidence: number;
  effect: number;
}

export interface SegmentInsight {
  type: SegmentInsightType;
  description: string;
  impact: number;
  actionable: boolean;
}

export type SegmentInsightType = 'performance_difference' | 'demographic_pattern' | 'behavioral_pattern' | 'opportunity';

export interface TestConclusion {
  decision: TestDecision;
  reasoning: ConclusionReasoning;
  implementation: ImplementationPlan;
  followUp: FollowUpPlan;
}

export interface TestDecision {
  action: DecisionAction;
  variant: string;
  confidence: number;
  timeline: string;
}

export type DecisionAction = 'implement' | 'iterate' | 'abandon' | 'extend_test';

export interface ConclusionReasoning {
  primary: string[];
  secondary: string[];
  limitations: string[];
  assumptions: string[];
}

export interface ImplementationPlan {
  phases: ImplementationPhase[];
  timeline: ImplementationTimeline;
  resources: ResourceRequirement[];
  risks: ImplementationRisk[];
}

export interface ImplementationPhase {
  phase: string;
  description: string;
  duration: string;
  deliverables: string[];
  dependencies: string[];
}

export interface ImplementationTimeline {
  start: Date;
  milestones: Milestone[];
  completion: Date;
}

export interface Milestone {
  name: string;
  date: Date;
  criteria: string[];
  responsible: string;
}

export interface ResourceRequirement {
  type: ResourceType;
  description: string;
  quantity: number;
  duration: string;
}

export type ResourceType = 'engineering' | 'design' | 'data' | 'clinical' | 'marketing';

export interface ImplementationRisk {
  risk: string;
  probability: number; // percentage
  impact: RiskImpact;
  mitigation: string[];
}

export type RiskImpact = 'low' | 'medium' | 'high' | 'critical';

export interface FollowUpPlan {
  monitoring: MonitoringPlan;
  optimization: OptimizationPlan;
  iteration: IterationPlan;
}

export interface MonitoringPlan {
  metrics: string[];
  frequency: MonitoringFrequency;
  alerts: AlertConfiguration[];
  reporting: ReportingConfiguration;
}

export type MonitoringFrequency = 'realtime' | 'hourly' | 'daily' | 'weekly';

export interface AlertConfiguration {
  metric: string;
  threshold: number;
  direction: 'above' | 'below' | 'change';
  recipients: string[];
}

export interface ReportingConfiguration {
  frequency: ReportingFrequency;
  format: ReportFormat;
  recipients: string[];
  content: string[];
}

export type ReportingFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly';
export type ReportFormat = 'dashboard' | 'email' | 'pdf' | 'api';

export interface OptimizationPlan {
  opportunities: OptimizationOpportunity[];
  timeline: OptimizationTimeline;
  success_criteria: string[];
}

export interface OptimizationOpportunity {
  area: string;
  description: string;
  potential: number; // percentage improvement
  effort: EffortLevel;
  priority: OpportunityPriority;
}

export type EffortLevel = 'low' | 'medium' | 'high';
export type OpportunityPriority = 'low' | 'medium' | 'high' | 'critical';

export interface OptimizationTimeline {
  quick_wins: string[]; // 0-30 days
  medium_term: string[]; // 30-90 days
  long_term: string[]; // 90+ days
}

export interface IterationPlan {
  next_tests: NextTest[];
  learnings: LearningApplication[];
  roadmap: TestingRoadmap;
}

export interface NextTest {
  hypothesis: string;
  variables: string[];
  timeline: string;
  priority: TestPriority;
}

export type TestPriority = 'low' | 'medium' | 'high' | 'critical';

export interface LearningApplication {
  learning: string;
  application: string;
  impact: string;
  timeline: string;
}

export interface TestingRoadmap {
  quarters: QuarterPlan[];
  themes: TestingTheme[];
  capacity: CapacityPlan;
}

export interface QuarterPlan {
  quarter: string;
  tests: PlannedTest[];
  resources: ResourceAllocation;
  goals: QuarterGoal[];
}

export interface PlannedTest {
  name: string;
  type: TestType;
  scope: TestScope;
  duration: string;
  resources: string[];
}

export type TestScope = 'single_channel' | 'multi_channel' | 'full_journey' | 'segment_specific';

export interface ResourceAllocation {
  engineering: number; // person-days
  design: number; // person-days
  data: number; // person-days
  clinical: number; // person-days
}

export interface QuarterGoal {
  goal: string;
  metric: string;
  target: number;
  confidence: number;
}

export interface TestingTheme {
  theme: string;
  description: string;
  tests: string[];
  timeline: string;
}

export interface CapacityPlan {
  team: TeamCapacity[];
  tools: ToolRequirement[];
  infrastructure: InfrastructureRequirement[];
}

export interface TeamCapacity {
  role: string;
  capacity: number; // percentage available
  skills: string[];
  development: SkillDevelopment[];
}

export interface SkillDevelopment {
  skill: string;
  current: SkillLevel;
  target: SkillLevel;
  timeline: string;
}

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface ToolRequirement {
  tool: string;
  purpose: string;
  timeline: string;
  cost: number;
}

export interface InfrastructureRequirement {
  component: string;
  specification: string;
  timeline: string;
  cost: number;
}
