/**
 * Analytics Types for NeonPro AI-Powered Healthcare Analytics System
 * Complete TypeScript definitions for advanced healthcare analytics and predictive intelligence
 *
 * @version 1.0.0
 * @author NeonPro Healthcare AI Team
 * @description Core analytics types supporting Brazilian healthcare compliance
 */

import type { LucideIcon } from "lucide-react";

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

export interface ComplianceAlert
  extends Omit<CriticalAlert, "type" | "severity"> {
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
  parameters: Record<string, any>;
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
  hyperparameters: Record<string, any>;
  trainingDataSize: number;
  validationMetrics: ValidationMetrics;
}

export interface PredictionResult {
  modelId: string;
  prediction: any;
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
  value: any;
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
  data: any;
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
