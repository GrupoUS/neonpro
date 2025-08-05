// AI System Types for Epic 4 Implementation
// Based on technical architecture in docs/ai/neonpro-ai-technical-deep-dive.md

import type { Database } from "@/types/supabase";

// Core AI System Types
export interface AISystemArchitecture {
  chatEngine: {
    provider: "OpenAI GPT-4" | "Anthropic Claude" | "Custom LLM";
    fallbackProviders: string[];
    contextWindow: number;
    maxTokens: number;
    temperature: number;
  };

  visionModels: {
    medicalImageAnalysis: "GPT-4 Vision" | "Custom Medical Vision Model";
    progressComparison: "Computer Vision API";
    skinAnalysis: "Dermatology AI Model";
  };

  dataProcessing: {
    embeddingModel: "text-embedding-ada-002" | "sentence-transformers";
    vectorDatabase: "Pinecone" | "Weaviate" | "Supabase pgvector";
    cacheLayer: "Redis" | "Supabase Edge Cache";
  };

  integrationLayer: {
    dataAccess: "Supabase RLS + Custom Policies";
    realTimeUpdates: "Supabase Realtime";
    eventStreaming: "Supabase Edge Functions";
  };
}

// Universal Chat Context (Story 4.1)
export interface UniversalChatContext {
  // User and clinic information
  user: {
    id: string;
    name: string;
    role: string;
    permissions: string[];
  };

  clinic: {
    id: string;
    name: string;
    settings: Record<string, any>;
  };

  // Epic 1 - Authentication & Appointments
  appointments: {
    upcoming: Appointment[];
    conflicts: ConflictAnalysis;
    utilization: ProfessionalUtilization;
    patientFlow: PatientFlowMetrics;
  };

  // Epic 2 - Financial Management
  financial: {
    cashFlow: RealTimeCashPosition;
    receivables: ReceivablesAging;
    payables: PayablesStatus;
    profitability: TreatmentProfitability;
    forecasting: FinancialForecasting;
  };

  // Epic 3 - Clinical Operations
  clinical: {
    patientRecords: ComprehensivePatientData;
    treatmentProtocols: ProtocolLibrary;
    professionalPerformance: ProfessionalMetrics;
    complianceStatus: RegulatoryCompliance;
  };

  // Cross-Epic Analytics
  businessIntelligence: {
    kpis: BusinessKPIs;
    trends: DataTrends;
    opportunities: BusinessOpportunities;
    alerts: SystemAlerts;
  };
}

// Query Classification Types
export interface QueryClassification {
  epic: "epic1" | "epic2" | "epic3" | "epic4" | "cross_functional";
  category: string;
  confidence: number;
  requiredPermissions: string[];
  suggestedActions: string[];
  affectedSystems: string[];
}

// AI Response Types
export interface AIResponse {
  message: string;
  sources: string[];
  visualizations: string[];
  actions: string[];

  chatResponse?: {
    message: string;
    confidence: number;
    sources: string[];
    visualizations?: ChartData[];
    actions?: SuggestedAction[];
  };
  suggestions?: CrossFunctionalSuggestion[];
  predictions?: PredictiveInsight[];
  automations?: AutomationRecommendation[];
  metadata?: {
    confidenceScore: number;
    processingTime: number;
    dataSourcesUsed: string[];
    nextActions: string[];
  };
}

// Cross-Functional Suggestions (Story 4.2)
export interface CrossFunctionalSuggestion {
  id: string;
  category: "financial_optimization" | "clinical_excellence" | "operational_efficiency";
  title: string;
  description: string;
  affectedEpics: string[];
  priorityScore: number;
  estimatedImpact: {
    revenue?: number;
    costSaving?: number;
    timeReduction?: number;
    satisfactionImprovement?: number;
  };
  implementationSteps: ImplementationStep[];
  status: "pending" | "accepted" | "rejected" | "implemented";
  confidence: number;
  requiredResources: string[];
}

export interface ImplementationStep {
  step: number;
  description: string;
  estimatedTime: string;
  requiredPermissions: string[];
  dependencies: string[];
}

// Predictive Analytics Types (Story 4.3)
export interface PredictiveInsight {
  type: "outcome_prediction" | "financial_forecast" | "demand_forecast" | "risk_assessment";
  title: string;
  prediction: string;
  confidence: number;
  timeframe: string;
  affectedMetrics: string[];
  recommendedActions: string[];
  supportingData: any;
}

export interface ForecastingResult {
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  trend: "increasing" | "decreasing" | "stable";
  factors: string[];
  accuracy?: number;
}

// Process Automation Types (Story 4.4)
export interface AutomationRecommendation {
  id: string;
  name: string;
  description: string;
  category: "workflow" | "clinical" | "financial" | "operational";
  estimatedTimesSaved: number;
  estimatedCostSavings: number;
  implementation: {
    complexity: "low" | "medium" | "high";
    estimatedDuration: string;
    requiredResources: string[];
    risks: string[];
  };
  status: "suggested" | "approved" | "in_progress" | "completed";
}

// Data Access Types
export interface FinancialContext {
  cashFlow: RealTimeCashPosition;
  receivables: ReceivablesAging;
  payables: PayablesStatus;
  profitability: TreatmentProfitability;
  insights: FinancialInsight[];
}

export interface ClinicalContext {
  patients: ComprehensivePatientData[];
  treatmentProtocols: ProtocolLibrary;
  professionalMetrics: ProfessionalMetrics;
  complianceStatus: RegulatoryCompliance;
}

export interface OperationalContext {
  appointments: AppointmentAnalytics;
  utilization: ProfessionalUtilization;
  conflicts: ScheduleConflict[];
  optimization: OptimizationOpportunity[];
}

// Epic Integration Types
export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type Patient = Database["public"]["Tables"]["patients"]["Row"];
export type Professional = Database["public"]["Tables"]["professionals"]["Row"];
export type TreatmentSession = Database["public"]["Tables"]["treatment_sessions"]["Row"];

// Supporting Types
export interface ConflictAnalysis {
  totalConflicts: number;
  conflictTypes: Record<string, number>;
  resolutionSuggestions: string[];
}

export interface ProfessionalUtilization {
  professionalId: string;
  utilizationRate: number;
  appointmentsCount: number;
  availableSlots: number;
  efficiency: number;
}

export interface PatientFlowMetrics {
  averageWaitTime: number;
  appointmentDuration: number;
  noShowRate: number;
  cancellationRate: number;
}

export interface RealTimeCashPosition {
  currentBalance: number;
  projectedBalance: number;
  inflow: number;
  outflow: number;
  burnRate: number;
}

export interface ReceivablesAging {
  current: number;
  thirtyDays: number;
  sixtyDays: number;
  ninetyDaysPlus: number;
  totalReceivables: number;
}

export interface PayablesStatus {
  currentPayables: number;
  overduePayables: number;
  upcomingPayments: number;
  averagePaymentDays: number;
}

export interface TreatmentProfitability {
  treatmentType: string;
  revenue: number;
  costs: number;
  margin: number;
  profitabilityRate: number;
}

export interface FinancialForecasting {
  revenue: ForecastingResult;
  expenses: ForecastingResult;
  cashFlow: ForecastingResult;
  profitability: ForecastingResult;
}

export interface ComprehensivePatientData {
  patientId: string;
  personalInfo: Patient;
  medicalHistory: any[];
  treatmentSessions: TreatmentSession[];
  progressTracking: any[];
  satisfactionScores: number[];
  riskFactors: string[];
}

export interface ProtocolLibrary {
  protocols: TreatmentProtocol[];
  successRates: Record<string, number>;
  averageDuration: Record<string, number>;
  contraindications: Record<string, string[]>;
}

export interface TreatmentProtocol {
  id: string;
  name: string;
  description: string;
  steps: string[];
  duration: number;
  requiredEquipment: string[];
  contraindications: string[];
  expectedOutcomes: string[];
}

export interface ProfessionalMetrics {
  professionalId: string;
  performanceScore: number;
  patientSatisfaction: number;
  treatmentSuccessRate: number;
  efficiency: number;
  specialties: string[];
}

export interface RegulatoryCompliance {
  cfmCompliance: boolean;
  anvisaCompliance: boolean;
  lgpdCompliance: boolean;
  lastAuditDate: string;
  complianceScore: number;
  violations: string[];
  recommendations: string[];
}

export interface BusinessKPIs {
  revenue: number;
  profitMargin: number;
  customerSatisfaction: number;
  appointmentUtilization: number;
  professionalEfficiency: number;
  complianceScore: number;
}

export interface DataTrends {
  revenueGrowth: number;
  patientRetention: number;
  servicePopularity: Record<string, number>;
  seasonalPatterns: any[];
  competitivePosition: string;
}

export interface BusinessOpportunities {
  revenueOpportunities: OpportunityItem[];
  costReductionOpportunities: OpportunityItem[];
  operationalImprovements: OpportunityItem[];
  marketExpansion: OpportunityItem[];
}

export interface OpportunityItem {
  title: string;
  description: string;
  estimatedValue: number;
  implementation: string;
  probability: number;
}

export interface SystemAlerts {
  critical: AlertItem[];
  warning: AlertItem[];
  info: AlertItem[];
}

export interface AlertItem {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  timestamp: string;
  source: string;
  resolved: boolean;
}

export interface ChartData {
  type: "line" | "bar" | "pie" | "scatter";
  data: any;
  options: any;
  title: string;
}

export interface SuggestedAction {
  id: string;
  title: string;
  description: string;
  actionType: "navigation" | "function" | "external";
  target: string;
  parameters?: Record<string, any>;
}

// API Types
export interface AIRequest {
  query: string;
  context: UniversalChatContext;
  sessionId?: string;
  userId: string;
  clinicId: string;
}

export interface EnrichedContext extends UniversalChatContext {
  enrichedData: any;
  queryClassification: QueryClassification;
  relevantData?: Record<string, any>;
  searchResults?: any[];
  suggestedQueries?: string[];
  permissions?: string[];
}

// Security Types
export interface SecurityValidation {
  isValid: boolean;
  reason: string;
}

export interface AISecurityFramework {
  dataAccess: {
    rls: string;
    encryption: string;
    anonymization: string;
    auditTrails: string;
  };

  compliance: {
    lgpd: string;
    medical: string;
    financial: string;
    retention: string;
  };

  access: {
    roleBasedPermissions: string;
    professionalLicensing: string;
    contextualAccess: string;
    emergencyOverrides: string;
  };
}
