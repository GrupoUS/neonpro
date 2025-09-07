/**
 * Analytics Types for NeonPro AI-Powered Healthcare Analytics System
 * Complete TypeScript definitions for advanced healthcare analytics and predictive intelligence
 *
 * @version 1.0.0
 * @author NeonPro Healthcare AI Team
 * @description Core analytics types supporting Brazilian healthcare compliance
 */

import type { LucideIcon } from "lucide-react";

// ====== BASIC TYPE DEFINITIONS ======

export interface PopulationHealthMetrics {
  totalPopulation: number;
  healthScores: {
    average: number;
    median: number;
    stdDev: number;
  };
  demographics: {
    ageGroups: Record<string, number>;
    genderDistribution: Record<string, number>;
  };
  prevalentConditions: {
    condition: string;
    prevalence: number;
    trend: "increasing" | "decreasing" | "stable";
  }[];
}

export interface RegionalHealthTrends {
  region: string;
  trends: {
    metric: string;
    values: { date: Date; value: number; }[];
    trend: "improving" | "deteriorating" | "stable";
  }[];
  seasonalPatterns: Record<string, number>;
}

export interface CulturalHealthFactors {
  culturalPractices: {
    practice: string;
    healthImpact: "positive" | "negative" | "neutral";
    prevalence: number;
  }[];
  languageBarriers: {
    percentage: number;
    primaryLanguages: string[];
  };
  socialDeterminants: Record<string, number>;
}

export interface SocioeconomicHealthData {
  incomeDistribution: Record<string, number>;
  educationLevels: Record<string, number>;
  accessToHealthcare: {
    insured: number;
    uninsured: number;
    underinsured: number;
  };
  employmentStatus: Record<string, number>;
}

export interface EpidemiologicalInsights {
  diseaseOutbreaks: {
    disease: string;
    cases: number;
    fatalities: number;
    geography: string;
    timeline: Date[];
  }[];
  vaccinationRates: Record<string, number>;
  mortalityRates: Record<string, number>;
}

export interface RegionalBenchmarks {
  region: string;
  benchmarks: Record<string, {
    value: number;
    percentile: number;
    comparison: "above" | "below" | "at";
  }>;
}

export interface NationalAverages {
  country: string;
  metrics: Record<string, {
    average: number;
    median: number;
    range: [number, number];
  }>;
}

export interface PeerComparisonMetrics {
  peerGroup: string;
  metrics: Record<string, {
    value: number;
    peerAverage: number;
    ranking: number;
    percentile: number;
  }>;
}

export interface PerformanceRanking {
  category: string;
  rank: number;
  totalEntities: number;
  score: number;
  improvements: string[];
  achievements: string[];
}

export interface ActiveRegulation {
  id: string;
  name: string;
  authority: string;
  effectiveDate: Date;
  requirements: string[];
  penalties: {
    violation: string;
    penalty: string;
    severity: "low" | "medium" | "high" | "critical";
  }[];
}

export interface ComplianceRequirement {
  id: string;
  regulation: string;
  description: string;
  dueDate: Date;
  status: "compliant" | "non-compliant" | "partially-compliant" | "pending";
  evidence: string[];
  responsible: string;
}

export interface AuditSchedule {
  id: string;
  type: string;
  scheduledDate: Date;
  duration: number;
  auditor: string;
  scope: string[];
  preparation: string[];
}

export interface ViolationRisk {
  regulation: string;
  risk: "low" | "medium" | "high" | "critical";
  likelihood: number;
  impact: string;
  mitigation: string[];
  timeline: string;
}

export interface AnalyticsFilter {
  field: string;
  operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "between";
  value: unknown;
  label?: string;
}

export interface AnalyticsPermission {
  resource: string;
  action: "view" | "edit" | "delete" | "export";
  granted: boolean;
  conditions?: Record<string, unknown>;
}

export interface RiskFactor {
  id: string;
  name: string;
  category: string;
  weight: number;
  value: unknown;
  impact: "positive" | "negative" | "neutral";
  confidence: number;
}

export interface EscalationRule {
  id: string;
  name: string;
  conditions: {
    field: string;
    operator: string;
    value: unknown;
  }[];
  actions: {
    type: string;
    parameters: Record<string, unknown>;
  }[];
  priority: number;
}

export interface EffectivenessMetric {
  metric: string;
  value: number;
  target: number;
  variance: number;
  trend: "improving" | "declining" | "stable";
  period: string;
}

export interface BenchmarkData {
  category: string;
  value: number;
  benchmark: number;
  percentile: number;
  comparison: "above" | "below" | "at";
  peers: number;
}

export interface TrendFactor {
  factor: string;
  correlation: number;
  significance: number;
  impact: "positive" | "negative";
}

export interface TrendForecast {
  metric: string;
  forecast: {
    date: Date;
    value: number;
    confidence: number;
  }[];
  accuracy: number;
  methodology: string;
}

export interface TreatmentPhase {
  phase: string;
  startDate: Date;
  endDate?: Date;
  status: "planned" | "active" | "completed" | "cancelled";
  outcomes: Record<string, unknown>;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  completedDate?: Date;
}

export interface RiskProfile {
  patientId: string;
  overallRisk: "low" | "medium" | "high" | "critical";
  factors: RiskFactor[];
  score: number;
  lastUpdated: Date;
}

export interface CFMViolation {
  id: string;
  violationType: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  detectedDate: Date;
  status: "open" | "investigating" | "resolved";
  penalty?: string;
}

export interface ANVISAViolation {
  id: string;
  violationType: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  detectedDate: Date;
  status: "open" | "investigating" | "resolved";
  penalty?: string;
}

export interface LGPDViolation {
  id: string;
  violationType: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  detectedDate: Date;
  status: "open" | "investigating" | "resolved";
  penalty?: string;
}

export interface SUSPerformanceMetrics {
  indicator: string;
  value: number;
  target: number;
  compliance: boolean;
  trend: "improving" | "declining" | "stable";
  period: string;
}

export interface AutoAction {
  id: string;
  name: string;
  type: string;
  trigger: string;
  parameters: Record<string, unknown>;
  enabled: boolean;
}

export interface RequiredAction {
  id: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  dueDate: Date;
  assignee: string;
  status: "pending" | "in_progress" | "completed";
}

export interface TriggerCondition {
  field: string;
  operator: string;
  value: unknown;
  logicalOperator?: "AND" | "OR";
}

export interface EmergencyResponse {
  id: string;
  name: string;
  triggers: TriggerCondition[];
  actions: AutoAction[];
  notifications: string[];
  priority: "low" | "medium" | "high" | "critical";
}

export interface EscalationStep {
  step: number;
  description: string;
  timeframe: number;
  assignee: string;
  actions: string[];
}

export interface NotifiedPerson {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  notificationMethods: string[];
}

export interface ActionResult {
  actionId: string;
  status: "success" | "failed" | "pending";
  result?: unknown;
  error?: string;
  timestamp: Date;
}

export interface EscalationTrigger {
  condition: TriggerCondition;
  threshold: number;
  timeframe: number;
  escalationPath: EscalationStep[];
}

export interface OverrideRule {
  id: string;
  condition: TriggerCondition;
  action: "allow" | "deny" | "modify";
  parameters: Record<string, unknown>;
  reason: string;
}

export interface ChartMetadata {
  title: string;
  description?: string;
  type: string;
  dataSource: string;
  lastUpdated: Date;
  refreshRate?: number;
}

export interface ChartScales {
  x: {
    type: "linear" | "logarithmic" | "category" | "time";
    min?: number;
    max?: number;
    ticks?: unknown;
  };
  y: {
    type: "linear" | "logarithmic" | "category" | "time";
    min?: number;
    max?: number;
    ticks?: unknown;
  };
}

export interface ChartPlugins {
  legend: boolean;
  tooltip: boolean;
  zoom?: boolean;
  annotations?: unknown[];
}

export interface ChartAnimation {
  duration: number;
  easing: string;
  delay?: number;
}

export interface ChartInteraction {
  hover: boolean;
  click: boolean;
  select?: boolean;
  brush?: boolean;
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  widgets: {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
}

export interface DashboardFilter {
  field: string;
  type: "select" | "multiselect" | "date" | "range";
  options?: unknown[];
  value: unknown;
}

export interface DashboardPermission {
  userId: string;
  dashboardId: string;
  permissions: string[];
  granted: boolean;
}

export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WidgetSize {
  minWidth: number;
  minHeight: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface WidgetConfiguration {
  type: string;
  parameters: Record<string, unknown>;
  styling: Record<string, unknown>;
  behavior: Record<string, unknown>;
}

export interface DataSource {
  id: string;
  name: string;
  type: string;
  connection: Record<string, unknown>;
  schema?: Record<string, unknown>;
  lastSync?: Date;
}

export interface WidgetPermission {
  widgetId: string;
  userId: string;
  permissions: string[];
  restrictions?: Record<string, unknown>;
}

export interface ReportSection {
  id: string;
  title: string;
  content: unknown;
  order: number;
  type: "chart" | "table" | "text" | "image";
}

export interface ReportParameter {
  name: string;
  type: "string" | "number" | "date" | "boolean";
  required: boolean;
  defaultValue?: unknown;
  options?: unknown[];
}

export interface AuditDetails {
  auditId: string;
  timestamp: Date;
  action: string;
  userId: string;
  resource: string;
  changes: Record<string, unknown>;
}

export interface AuditRetention {
  category: string;
  retentionPeriod: number;
  archiveLocation?: string;
  compressionEnabled: boolean;
}

export interface AuthenticationMethod {
  type: "oauth" | "saml" | "ldap" | "api_key";
  configuration: Record<string, unknown>;
  enabled: boolean;
}

export interface SyncSchedule {
  id: string;
  dataSource: string;
  frequency: "realtime" | "hourly" | "daily" | "weekly";
  nextRun: Date;
  enabled: boolean;
}

export interface IntegrationMetrics {
  integration: string;
  requests: number;
  failures: number;
  latency: number;
  uptime: number;
  lastSync: Date;
}

export interface DataTransformation {
  field: string;
  operation: "map" | "filter" | "aggregate" | "join";
  parameters: Record<string, unknown>;
  order: number;
}

export interface ValidationRule {
  field: string;
  rule: string;
  parameters: Record<string, unknown>;
  errorMessage: string;
  severity: "warning" | "error";
}

export interface ValidationMetrics {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  warnings: number;
  errors: number;
  validationRate: number;
}

export interface DisplayOptions {
  theme: "light" | "dark" | "auto";
  fontSize: "small" | "medium" | "large";
  colorScheme: string;
  animations: boolean;
}

export interface ExportPreferences {
  format: "csv" | "excel" | "pdf" | "json";
  includeCharts: boolean;
  includeData: boolean;
  compression?: boolean;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: number;
  screenReader: boolean;
  keyboardNavigation: boolean;
  alternativeText: boolean;
}

export interface PreventiveAction {
  id: string;
  name: string;
  description: string;
  type: "medication" | "lifestyle" | "monitoring" | "procedure";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate: Date;
  completed: boolean;
  completedDate?: Date;
}

export interface ProfessionalMetrics {
  professionalId: string;
  specialization: string;
  experienceYears: number;
  patientSatisfactionScore: number;
  successRate: number;
  averageTreatmentTime: number;
  certifications: string[];
}

export interface AbnormalPattern {
  id: string;
  pattern: string;
  severity: "low" | "medium" | "high" | "critical";
  frequency: number;
  description: string;
  detectedAt: Date;
}

export interface EmergencyProtocol {
  id: string;
  name: string;
  triggers: string[];
  steps: {
    order: number;
    description: string;
    timeframe: string;
    responsible: string;
  }[];
  priority: "low" | "medium" | "high" | "critical";
}

export interface AutoNotification {
  id: string;
  type: "email" | "sms" | "push" | "in_app";
  recipient: string;
  message: string;
  scheduledFor: Date;
  sent: boolean;
  sentAt?: Date;
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  diagnosis: string;
  objectives: string[];
  procedures: {
    name: string;
    scheduledDate: Date;
    status: "planned" | "completed" | "cancelled";
  }[];
  estimatedDuration: number;
  cost: number;
}

export interface PreventionAction {
  id: string;
  category: "primary" | "secondary" | "tertiary";
  action: string;
  target: string;
  effectiveness: number;
  cost: number;
  timeframe: string;
}

export interface FollowUpPlan {
  id: string;
  patientId: string;
  schedule: {
    date: Date;
    type: "consultation" | "exam" | "procedure";
    description: string;
  }[];
  duration: number;
  completed: boolean;
}

export interface RiskMitigationStep {
  id: string;
  riskFactor: string;
  mitigation: string;
  priority: number;
  status: "pending" | "in_progress" | "completed";
  effectiveness: number;
}

export interface ResourceRecommendation {
  id: string;
  resource: string;
  type: "equipment" | "personnel" | "training" | "procedure";
  justification: string;
  priority: "low" | "medium" | "high";
  cost: number;
}

export interface HealthIndicatorTrends {
  indicator: string;
  values: {
    date: Date;
    value: number;
  }[];
  trend: "improving" | "stable" | "declining";
  projection: {
    date: Date;
    projectedValue: number;
    confidence: number;
  }[];
}

export interface RiskFactorMonitoring {
  riskFactor: string;
  currentLevel: number;
  targetLevel: number;
  monitoringFrequency: "daily" | "weekly" | "monthly";
  alerts: {
    threshold: number;
    action: string;
  }[];
}

export interface BehavioralMonitoring {
  patientId: string;
  behaviors: {
    behavior: string;
    frequency: number;
    trend: "improving" | "stable" | "declining";
    impact: "positive" | "negative" | "neutral";
  }[];
  interventions: string[];
}

export interface BloodPressureReading {
  systolic: number;
  diastolic: number;
  timestamp: Date;
  device: string;
  notes?: string;
}

export interface AbnormalReading {
  type: string;
  value: number;
  threshold: number;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: Date;
  followUpRequired: boolean;
}

export interface VitalTrendAnalysis {
  vital: string;
  trend: "improving" | "stable" | "declining";
  rate: number;
  significance: "low" | "medium" | "high";
  prediction: {
    date: Date;
    value: number;
  }[];
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  sideEffects: string[];
  interactions: string[];
}

export interface MissedDose {
  medicationId: string;
  scheduledTime: Date;
  reportedTime?: Date;
  reason?: string;
  impact: "low" | "medium" | "high";
}

export interface SideEffect {
  medicationId: string;
  effect: string;
  severity: "mild" | "moderate" | "severe";
  onset: Date;
  resolved: boolean;
  resolvedDate?: Date;
}

export interface DrugInteraction {
  medications: string[];
  interactionType: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  recommendation: string;
}

export interface AppointmentRecord {
  id: string;
  patientId: string;
  professionalId: string;
  scheduledDate: Date;
  actualDate?: Date;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  type: string;
  notes?: string;
}

export interface SeasonalPattern {
  season: "spring" | "summer" | "fall" | "winter";
  condition: string;
  prevalence: number;
  severity: number;
  recommendations: string[];
}

export interface ANSConnectivityStatus {
  connected: boolean;
  lastSync: Date;
  dataCompleteness: number;
  errors: string[];
  nextSync: Date;
}

// ====== CORE ANALYTICS INTERFACES ======

export interface HealthcareAnalytics {
  patientId: string;
  clinicId: string;
  generatedAt: Date;
  analytics: {
    patientOutcomePrediction: OutcomePrediction;
    riskAssessment: RiskAssessment;
    treatmentEffectiveness: TreatmentAnalytics;
    complianceMetrics: ComplianceAnalytics;
    emergencyIndicators: EmergencyRiskIndicators;
  };
  insights: AIInsight[];
  recommendations: AIRecommendation[];
  trends: HealthTrend[];
  confidence: number; // 0-1 AI confidence level
}

export interface OutcomePrediction {
  treatmentId: string;
  outcomeScore: number; // 0-100 likelihood of successful treatment
  predictionAccuracy: number; // Historical accuracy of this model
  factors: PredictiveFactor[];
  timeline: TreatmentTimeline;
  alternatives: AlternativeTreatment[];
  riskFactors: string[];
  confidenceInterval: [number, number];
}

export interface RiskAssessment {
  patientId: string;
  assessmentDate: Date;
  overallRisk: RiskLevel;
  riskFactors: RiskFactor[];
  complicationProbability: number;
  recommendedActions: PreventiveAction[];
  reassessmentDate: Date;
  escalationTriggers: EscalationTrigger[];
}

export interface TreatmentAnalytics {
  treatmentType: string;
  successRate: number;
  patientSatisfaction: number;
  complicationRate: number;
  recoveryTime: {
    average: number;
    median: number;
    range: [number, number];
  };
  costEffectiveness: number;
  professionalPerformance: ProfessionalMetrics;
  benchmarkComparison: BenchmarkData;
}

export interface ComplianceAnalytics {
  cfmCompliance: CFMComplianceScore;
  anvisaCompliance: ANVISAComplianceScore;
  lgpdCompliance: LGPDComplianceScore;
  overallScore: number;
  violations: ComplianceViolation[];
  auditReadiness: number; // 0-100 score
  lastAuditDate: Date;
  nextAuditDue: Date;
}

export interface EmergencyRiskIndicators {
  criticalAlerts: CriticalAlert[];
  abnormalPatterns: AbnormalPattern[];
  escalationRequired: boolean;
  emergencyProtocols: EmergencyProtocol[];
  responseTime: number; // Expected response time in minutes
  autoNotifications: AutoNotification[];
}

// ====== PREDICTIVE INTELLIGENCE TYPES ======

export interface PredictiveIntelligence {
  patientId: string;
  generatedAt: Date;
  predictions: {
    outcomeScore: number; // 0-100 likelihood of successful treatment
    riskLevel: RiskLevel;
    noShowProbability: number; // 0-1 probability of appointment no-show
    treatmentDuration: number; // Predicted treatment duration in days
    complications: ComplicationPrediction[];
    recoveryTimeline: RecoveryMilestone[];
  };
  recommendations: {
    optimalTreatment: TreatmentPlan;
    preventiveMeasures: PreventionAction[];
    followUpSchedule: FollowUpPlan;
    riskMitigation: RiskMitigationStep[];
    resourceAllocation: ResourceRecommendation[];
  };
  confidence: number; // AI model confidence level
  modelVersion: string;
  trainingDataDate: Date;
}

export interface ComplicationPrediction {
  type: string;
  probability: number; // 0-1
  severity: "minor" | "moderate" | "severe" | "critical";
  timeframe: number; // Days from treatment start
  preventionStrategies: string[];
  warningSignals: string[];
}

export interface RecoveryMilestone {
  milestone: string;
  expectedDay: number;
  probability: number; // 0-1
  dependencies: string[];
  criticalFactors: string[];
}

// ====== REAL-TIME MONITORING TYPES ======

export interface HealthcareMonitoring {
  patientId: string;
  monitoringStart: Date;
  isActive: boolean;
  monitoringData: {
    vitalSigns: VitalSignsMonitoring;
    medicationCompliance: MedicationTracking;
    appointmentAttendance: AttendancePatterns;
    healthIndicators: HealthIndicatorTrends;
    riskFactors: RiskFactorMonitoring;
    behavioralPatterns: BehavioralMonitoring;
  };
  alerts: {
    criticalAlerts: CriticalAlert[];
    warningAlerts: WarningAlert[];
    complianceAlerts: ComplianceAlert[];
    emergencyTriggers: EmergencyTrigger[];
  };
  automatedActions: AutomatedAction[];
  escalationPaths: EscalationPath[];
  lastUpdate: Date;
}

export interface VitalSignsMonitoring {
  bloodPressure: TimeSeries<BloodPressureReading>;
  heartRate: TimeSeries<number>;
  temperature: TimeSeries<number>;
  weight: TimeSeries<number>;
  oxygenSaturation: TimeSeries<number>;
  abnormalReadings: AbnormalReading[];
  trendAnalysis: VitalTrendAnalysis;
}

export interface MedicationTracking {
  currentMedications: Medication[];
  adherenceRate: number; // 0-1
  missedDoses: MissedDose[];
  sideEffects: SideEffect[];
  drugInteractions: DrugInteraction[];
  effectivenessScore: number; // 0-100
}

export interface AttendancePatterns {
  appointmentHistory: AppointmentRecord[];
  noShowRate: number; // 0-1
  cancellationRate: number; // 0-1
  rescheduleFrequency: number;
  punctualityScore: number; // 0-100
  seasonalPatterns: SeasonalPattern[];
}

// ====== BRAZILIAN HEALTHCARE INTELLIGENCE ======

export interface BrazilianHealthcareIntelligence {
  clinicId: string;
  region: BrazilianRegion;
  lastUpdated: Date;
  compliance: {
    cfmCompliance: CFMComplianceScore;
    anvisaCompliance: ANVISAComplianceScore;
    lgpdCompliance: LGPDComplianceScore;
    susIntegration: SUSIntegrationStatus;
    ansConnectivity: ANSConnectivityStatus;
  };
  demographics: {
    populationHealth: PopulationHealthMetrics;
    regionalTrends: RegionalHealthTrends;
    culturalFactors: CulturalHealthFactors;
    socioeconomicIndicators: SocioeconomicHealthData;
    epidemiologicalData: EpidemiologicalInsights;
  };
  benchmarking: {
    regionalBenchmarks: RegionalBenchmarks;
    nationalAverages: NationalAverages;
    peerComparison: PeerComparisonMetrics;
    performanceRanking: PerformanceRanking;
  };
  regulations: {
    activeRegulations: ActiveRegulation[];
    complianceRequirements: ComplianceRequirement[];
    auditSchedule: AuditSchedule[];
    violationRisks: ViolationRisk[];
  };
}

// ====== ANALYTICS COMPONENT TYPES ======

export interface AnalyticsDashboardProps {
  clinicId: string;
  dateRange: DateRange;
  refreshInterval?: number; // Minutes
  realTimeEnabled?: boolean;
  exportEnabled?: boolean;
  customFilters?: AnalyticsFilter[];
  permissions?: AnalyticsPermission[];
}

export interface PatientOutcomePredictionProps {
  patientId: string;
  treatmentId?: string;
  predictionModels: string[]; // Model names to use
  confidenceThreshold?: number; // Minimum confidence to display
  showAlternatives?: boolean;
  interactiveCharts?: boolean;
}

export interface RiskAssessmentPanelProps {
  patientId: string;
  assessmentType: "comprehensive" | "focused" | "emergency";
  riskFactors: RiskFactor[];
  autoRefresh?: boolean;
  alertsEnabled?: boolean;
  escalationRules?: EscalationRule[];
}

export interface TreatmentEffectivenessChartsProps {
  treatmentTypes: string[];
  dateRange: DateRange;
  comparisonMode: "time" | "treatment" | "provider" | "clinic";
  metrics: EffectivenessMetric[];
  benchmarkData?: BenchmarkData;
  drillDownEnabled?: boolean;
}

// ====== SUPPORTING TYPES ======

export type RiskLevel = "low" | "medium" | "high" | "critical";
export type TreatmentStatus =
  | "planned"
  | "active"
  | "completed"
  | "cancelled"
  | "paused";
export type AlertSeverity = "info" | "warning" | "error" | "critical";
export type ComplianceStatus =
  | "compliant"
  | "warning"
  | "violation"
  | "unknown";

export interface DateRange {
  start: Date;
  end: Date;
  preset?: "today" | "week" | "month" | "quarter" | "year" | "custom";
}

export interface TimeSeries<T> {
  timestamps: Date[];
  values: T[];
  interpolated?: boolean;
  confidence?: number[];
}

export interface AIInsight {
  id: string;
  type: "trend" | "anomaly" | "prediction" | "recommendation";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  confidence: number; // 0-1
  actionRequired: boolean;
  relatedData: string[];
  generatedAt: Date;
  validUntil?: Date;
}

export interface AIRecommendation {
  id: string;
  category: "treatment" | "prevention" | "optimization" | "compliance";
  title: string;
  description: string;
  expectedOutcome: string;
  confidenceLevel: number; // 0-1
  evidenceLevel: "A" | "B" | "C" | "D"; // Evidence-based medicine levels
  implementation: {
    difficulty: "easy" | "moderate" | "difficult";
    timeRequired: number; // Hours
    resources: string[];
    dependencies: string[];
  };
  metrics: {
    expectedImprovement: number; // Percentage
    costImpact: number; // BRL
    riskReduction: number; // Percentage
  };
}

export interface HealthTrend {
  metric: string;
  direction: "improving" | "stable" | "declining";
  magnitude: number; // Percentage change
  timeframe: number; // Days
  significance: number; // Statistical significance (p-value)
  factors: TrendFactor[];
  forecast: TrendForecast;
}

export interface PredictiveFactor {
  name: string;
  impact: number; // -1 to 1 (negative to positive impact)
  confidence: number; // 0-1
  category: "demographic" | "medical" | "behavioral" | "environmental";
  description: string;
  evidence: string[];
}

export interface TreatmentTimeline {
  phases: TreatmentPhase[];
  totalDuration: number; // Days
  criticalMilestones: Milestone[];
  flexibilityScore: number; // 0-100 how adaptable the timeline is
}

export interface AlternativeTreatment {
  treatmentId: string;
  name: string;
  successProbability: number; // 0-1
  costDifference: number; // BRL difference from primary
  timeDifference: number; // Days difference
  riskProfile: RiskProfile;
  suitabilityScore: number; // 0-100
}

// ====== BRAZILIAN SPECIFIC TYPES ======

export type BrazilianRegion =
  | "norte"
  | "nordeste"
  | "centro-oeste"
  | "sudeste"
  | "sul"
  | "distrito-federal";

export type BrazilianState =
  | "AC"
  | "AL"
  | "AP"
  | "AM"
  | "BA"
  | "CE"
  | "DF"
  | "ES"
  | "GO"
  | "MA"
  | "MT"
  | "MS"
  | "MG"
  | "PA"
  | "PB"
  | "PR"
  | "PE"
  | "PI"
  | "RJ"
  | "RN"
  | "RS"
  | "RO"
  | "RR"
  | "SC"
  | "SP"
  | "SE"
  | "TO";

export interface CFMComplianceScore {
  overallScore: number; // 0-100
  licenseValidation: number; // 0-100
  professionalEthics: number; // 0-100
  continuingEducation: number; // 0-100
  patientSafety: number; // 0-100
  lastAudit: Date;
  nextAudit: Date;
  violations: CFMViolation[];
}

export interface ANVISAComplianceScore {
  overallScore: number; // 0-100
  controlledSubstances: number; // 0-100
  sanitaryLicense: number; // 0-100
  equipmentValidation: number; // 0-100
  adverseEventReporting: number; // 0-100
  lastInspection: Date;
  nextInspection: Date;
  violations: ANVISAViolation[];
}

export interface LGPDComplianceScore {
  overallScore: number; // 0-100
  dataProcessing: number; // 0-100
  consentManagement: number; // 0-100
  dataSubjectRights: number; // 0-100
  securityMeasures: number; // 0-100
  incidentResponse: number; // 0-100
  lastAssessment: Date;
  nextAssessment: Date;
  violations: LGPDViolation[];
}

export interface SUSIntegrationStatus {
  connected: boolean;
  dataExchangeActive: boolean;
  lastSyncDate: Date;
  integrationHealth: number; // 0-100
  pendingUpdates: number;
  errorCount: number;
  performanceMetrics: SUSPerformanceMetrics;
}

// ====== ALERT AND MONITORING TYPES ======

export interface CriticalAlert {
  id: string;
  type: "medical" | "system" | "compliance" | "security";
  severity: AlertSeverity;
  title: string;
  message: string;
  patientId?: string;
  clinicId: string;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  acknowledgedBy?: string;
  resolvedBy?: string;
  escalationLevel: number;
  autoActions: AutoAction[];
  requiredActions: RequiredAction[];
}

export interface WarningAlert extends Omit<CriticalAlert, "severity"> {
  severity: "warning";
  dismissible: boolean;
  expiresAt?: Date;
}

export interface ComplianceAlert extends Omit<CriticalAlert, "type" | "severity"> {
  type: "compliance";
  severity: "warning" | "error";
  regulatoryBody: "CFM" | "ANVISA" | "ANS" | "LGPD";
  violationType: string;
  correctionDeadline: Date;
  penaltyRisk: number; // 0-100
}

export interface EmergencyTrigger {
  id: string;
  patientId: string;
  triggerType: "vital_signs" | "medication" | "behavior" | "external";
  severity: "urgent" | "emergency" | "life_threatening";
  detectedAt: Date;
  conditions: TriggerCondition[];
  automaticResponse: EmergencyResponse;
  escalationChain: EscalationStep[];
  notifiedPersons: NotifiedPerson[];
}

export interface AutomatedAction {
  id: string;
  type:
    | "notification"
    | "data_update"
    | "workflow_trigger"
    | "alert_escalation";
  triggeredBy: string;
  executedAt: Date;
  status: "pending" | "executing" | "completed" | "failed";
  parameters: Record<string, unknown>;
  result?: ActionResult;
  retryCount: number;
  maxRetries: number;
}

export interface EscalationPath {
  id: string;
  name: string;
  triggers: EscalationTrigger[];
  steps: EscalationStep[];
  timeouts: number[]; // Minutes for each step
  overrideRules: OverrideRule[];
  isActive: boolean;
  lastUsed?: Date;
}

// ====== CHART AND VISUALIZATION TYPES ======

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
  options?: ChartOptions;
  metadata?: ChartMetadata;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
  pointRadius?: number;
  pointHoverRadius?: number;
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  scales?: ChartScales;
  plugins?: ChartPlugins;
  animation?: ChartAnimation;
  interaction?: ChartInteraction;
}

export interface MetricCard {
  id: string;
  title: string;
  value: number | string;
  previousValue?: number | string;
  change?: number; // Percentage change
  changeDirection?: "up" | "down" | "stable";
  trend?: number[]; // Sparkline data
  unit?: string;
  format?: "number" | "currency" | "percentage" | "duration";
  status?: "good" | "warning" | "critical";
  icon?: LucideIcon;
  color?: string;
  target?: number;
  benchmark?: number;
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
  permissions: DashboardPermission[];
  refreshInterval?: number; // Minutes
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardWidget {
  id: string;
  type: "chart" | "metric" | "table" | "map" | "text" | "iframe";
  title: string;
  position: WidgetPosition;
  size: WidgetSize;
  configuration: WidgetConfiguration;
  dataSource: DataSource;
  refreshRate?: number; // Minutes
  permissions?: WidgetPermission[];
}

// ====== PERFORMANCE AND OPTIMIZATION ======

export interface PerformanceMetrics {
  queryResponseTime: number; // Milliseconds
  dataProcessingTime: number; // Milliseconds
  renderTime: number; // Milliseconds
  memoryUsage: number; // MB
  cacheHitRate: number; // 0-1
  errorRate: number; // 0-1
  throughput: number; // Requests per second
  availability: number; // 0-1 uptime percentage
}

export interface OptimizationSuggestion {
  id: string;
  category: "performance" | "cost" | "user_experience" | "compliance";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  expectedBenefit: string;
  implementationEffort: "low" | "medium" | "high";
  estimatedImpact: number; // Percentage improvement
  prerequisites: string[];
  documentation: string[];
}

// ====== EXPORT AND REPORTING ======

export interface ReportConfiguration {
  id: string;
  name: string;
  description?: string;
  format: "pdf" | "excel" | "csv" | "json";
  schedule?: ReportSchedule;
  recipients: string[];
  sections: ReportSection[];
  parameters: ReportParameter[];
  template?: string;
  isActive: boolean;
}

export interface ReportSchedule {
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "annual";
  time: string; // HH:MM format
  timezone: string;
  weekday?: number; // 0-6 for weekly reports
  monthDay?: number; // 1-31 for monthly reports
}

export interface AnalyticsExport {
  id: string;
  type: "dashboard" | "widget" | "dataset" | "report";
  format: "pdf" | "excel" | "csv" | "json" | "image";
  status: "pending" | "processing" | "completed" | "failed";
  progress: number; // 0-100
  fileSize?: number; // Bytes
  downloadUrl?: string;
  expiresAt: Date;
  createdBy: string;
  createdAt: Date;
}

// ====== AUDIT AND COMPLIANCE TRACKING ======

export interface AuditTrail {
  id: string;
  entityType: "patient" | "provider" | "clinic" | "analytics";
  entityId: string;
  action: "view" | "create" | "update" | "delete" | "export";
  userId: string;
  userType: "patient" | "provider" | "admin" | "system";
  timestamp: Date;
  ipAddress: string;
  userAgent?: string;
  details: AuditDetails;
  classification: "normal" | "sensitive" | "critical";
  retention: AuditRetention;
}

export interface ComplianceViolation {
  id: string;
  type:
    | "data_protection"
    | "professional_ethics"
    | "patient_safety"
    | "regulatory";
  severity: "minor" | "major" | "critical";
  description: string;
  regulatoryFramework: "LGPD" | "CFM" | "ANVISA" | "ANS";
  detectedAt: Date;
  reportedAt?: Date;
  resolvedAt?: Date;
  correctionPlan?: string;
  responsiblePerson: string;
  penaltyRisk: number; // 0-100
  evidenceFiles: string[];
}

// ====== INTEGRATION TYPES ======

export interface ExternalIntegration {
  id: string;
  name: string;
  type: "api" | "database" | "file" | "webhook";
  endpoint: string;
  authentication: AuthenticationMethod;
  dataMapping: DataMapping[];
  scheduleSync?: SyncSchedule;
  lastSync?: Date;
  syncStatus: "active" | "paused" | "error" | "disabled";
  errorCount: number;
  performanceMetrics: IntegrationMetrics;
}

export interface DataMapping {
  sourceField: string;
  targetField: string;
  transformation?: DataTransformation;
  validation?: ValidationRule[];
  required: boolean;
}

// ====== AI AND MACHINE LEARNING ======

export interface MLModel {
  id: string;
  name: string;
  type: "classification" | "regression" | "clustering" | "anomaly_detection";
  version: string;
  accuracy: number; // 0-1
  precision: number; // 0-1
  recall: number; // 0-1
  f1Score: number; // 0-1
  trainingDate: Date;
  deploymentDate: Date;
  lastRetraining: Date;
  featureImportance: FeatureImportance[];
  hyperparameters: Record<string, unknown>;
  trainingDataSize: number;
  validationMetrics: ValidationMetrics;
}

export interface PredictionResult {
  modelId: string;
  prediction: unknown;
  confidence: number; // 0-1
  probability?: number; // 0-1
  explanation: string;
  featureContributions: FeatureContribution[];
  timestamp: Date;
  processingTime: number; // Milliseconds
  modelVersion: string;
}

export interface FeatureImportance {
  feature: string;
  importance: number; // 0-1
  description: string;
  category: string;
}

export interface FeatureContribution {
  feature: string;
  value: unknown;
  contribution: number; // -1 to 1
  explanation: string;
}

// ====== USER INTERFACE TYPES ======

export interface AnalyticsTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    accent: string;
  };
  chart: {
    colors: string[];
    gradients: string[];
    backgrounds: string[];
  };
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export interface UserPreferences {
  userId: string;
  dashboardLayout: string;
  defaultDateRange: string;
  refreshInterval: number;
  notifications: NotificationPreferences;
  displayOptions: DisplayOptions;
  exportSettings: ExportPreferences;
  accessibilitySettings: AccessibilitySettings;
}

export interface NotificationPreferences {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  alertTypes: string[];
  quietHours: {
    start: string; // HH:MM
    end: string; // HH:MM
  };
  frequency: "immediate" | "hourly" | "daily" | "weekly";
}

// ====== UTILITY TYPES ======

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Analytics = {
  [K in keyof HealthcareAnalytics]: HealthcareAnalytics[K];
};

export interface AnalyticsEvent {
  type: string;
  data: unknown;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

// ====== DEFAULT CONFIGURATIONS ======

export const DEFAULT_ANALYTICS_CONFIG: Partial<AnalyticsDashboardProps> = {
  refreshInterval: 5, // 5 minutes
  realTimeEnabled: true,
  exportEnabled: true,
  dateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date(),
    preset: "month",
  },
};

export const BRAZILIAN_HEALTHCARE_COLORS = {
  cfmActive: "#059669",
  cfmPending: "#d97706",
  cfmExpired: "#dc2626",
  cfmSuspended: "#6b7280",
  ansActive: "#16a34a",
  ansPartial: "#f59e0b",
  ansDenied: "#ef4444",
  lgpdCompliant: "#10b981",
  lgpdWarning: "#f59e0b",
  lgpdViolation: "#ef4444",
  susConnected: "#059669",
  susDisconnected: "#dc2626",
} as const;

export const PERFORMANCE_THRESHOLDS = {
  queryResponseTime: 2000, // 2 seconds
  dataProcessingTime: 5000, // 5 seconds
  renderTime: 1000, // 1 second
  cacheHitRate: 0.8, // 80%
  errorRate: 0.01, // 1%
  availability: 0.999, // 99.9%
} as const;

// ====== UTILITY FUNCTIONS ======

/**
 * Safely parses a string or number value to a number
 * Returns NaN if the value cannot be parsed as a valid number
 */
export function safeParseNumber(value: string | number | null | undefined): number {
  if (typeof value === "number") {
    return isFinite(value) ? value : NaN;
  }

  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return isFinite(parsed) ? parsed : NaN;
  }

  return NaN;
}

/**
 * Safely parses a string or number value to a number with a default fallback
 */
export function safeParseNumberWithDefault(
  value: string | number | null | undefined,
  defaultValue: number,
): number {
  const parsed = safeParseNumber(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

// ====== DATABASE TYPES ======

/**
 * Generic database row type for MVP
 */
export interface DatabaseRow {
  id: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}
