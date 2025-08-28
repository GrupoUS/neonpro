// Types for No-Show Prediction System

export interface NoShowPrediction {
  id: string;
  appointmentId: string;
  patientId: string;
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  confidence: number;
  factors: RiskFactor[];
  recommendation: string;
  interventionSuggested?: InterventionStrategy;
  modelVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RiskFactor {
  id: string;
  name: string;
  description: string;
  weight: number;
  value: string | number | boolean;
  impact: "positive" | "negative" | "neutral";
  category:
    | "historical"
    | "demographic"
    | "behavioral"
    | "contextual"
    | "external";
}

export interface InterventionStrategy {
  id: string;
  name: string;
  description: string;
  type:
    | "reminder"
    | "confirmation"
    | "incentive"
    | "rescheduling"
    | "personal_contact";
  timing:
    | "immediate"
    | "24h_before"
    | "48h_before"
    | "72h_before"
    | "week_before";
  channel: "sms" | "whatsapp" | "email" | "phone" | "app_notification";
  priority: "low" | "medium" | "high" | "urgent";
  estimatedEffectiveness: number; // 0-100%
  cost: number;
}

export interface NoShowAnalytics {
  totalPredictions: number;
  accuracyRate: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  interventionSuccessRate: number;
  costSavings: number;
  timeframe: {
    start: Date;
    end: Date;
  };
  byRiskLevel: {
    low: NoShowMetrics;
    medium: NoShowMetrics;
    high: NoShowMetrics;
    critical: NoShowMetrics;
  };
}

export interface NoShowMetrics {
  total: number;
  predicted: number;
  actual: number;
  prevented: number;
  accuracy: number;
}

export interface PatientRiskProfile {
  patientId: string;
  overallRiskScore: number;
  riskTrend: "improving" | "stable" | "worsening";
  historicalNoShows: number;
  totalAppointments: number;
  noShowRate: number;
  lastNoShow?: Date;
  riskFactors: RiskFactor[];
  preferredInterventions: InterventionStrategy[];
  notes?: string;
}

export interface AppointmentRiskAssessment {
  appointmentId: string;
  patientRiskProfile: PatientRiskProfile;
  contextualFactors: RiskFactor[];
  finalRiskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  recommendedInterventions: InterventionStrategy[];
  confidence: number;
  reasoning: string;
}

export interface NoShowModel {
  id: string;
  name: string;
  version: string;
  type: "ml" | "rule_based" | "hybrid";
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingData: {
    size: number;
    dateRange: {
      start: Date;
      end: Date;
    };
  };
  features: ModelFeature[];
  isActive: boolean;
  deployedAt: Date;
  lastRetrained?: Date;
}

export interface ModelFeature {
  name: string;
  type: "categorical" | "numerical" | "boolean" | "datetime";
  importance: number;
  description: string;
}

export interface NoShowPredictionRequest {
  appointmentId: string;
  patientId: string;
  appointmentDate: Date;
  appointmentType: string;
  providerType: string;
  timeSlot: string;
  isFirstVisit: boolean;
  daysSinceLastAppointment?: number;
  weatherConditions?: WeatherConditions;
  additionalContext?: Record<string, any>;
}

export interface WeatherConditions {
  temperature: number;
  condition: "sunny" | "cloudy" | "rainy" | "stormy" | "snowy";
  precipitation: number;
  windSpeed: number;
}

export interface NoShowPredictionResponse {
  prediction: NoShowPrediction;
  alternatives?: NoShowPrediction[]; // Different model predictions
  explanation: PredictionExplanation;
  recommendations: InterventionStrategy[];
}

export interface PredictionExplanation {
  topFactors: RiskFactor[];
  modelReasoning: string;
  confidenceFactors: string[];
  limitations: string[];
}

// Configuration types
export interface NoShowPredictionConfig {
  models: {
    primary: string;
    fallback?: string;
  };
  thresholds: {
    low: number;
    medium: number;
    high: number;
  };
  interventions: {
    enabled: boolean;
    autoTrigger: boolean;
    channels: string[];
  };
  analytics: {
    trackingEnabled: boolean;
    retentionDays: number;
  };
}

// API Response types
export interface NoShowPredictionApiResponse {
  success: boolean;
  data?: NoShowPrediction | NoShowPrediction[];
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
    processingTime?: number;
  };
}

// Event types for real-time updates
export interface NoShowPredictionEvent {
  type: "prediction_updated" | "intervention_triggered" | "outcome_recorded";
  appointmentId: string;
  patientId: string;
  data: any;
  timestamp: Date;
}

// Utility types
export type RiskLevelType = NoShowPrediction["riskLevel"];
export type InterventionType = InterventionStrategy["type"];
export type RiskFactorCategory = RiskFactor["category"];

// Form types for UI
export interface NoShowPredictionFilters {
  riskLevel?: RiskLevelType[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  patientId?: string;
  providerId?: string;
  appointmentType?: string;
}

export interface NoShowPredictionSort {
  field: "riskScore" | "appointmentDate" | "patientName" | "createdAt";
  direction: "asc" | "desc";
}

// Constants
export const RISK_LEVEL_COLORS = {
  low: "#10B981",
  medium: "#F59E0B",
  high: "#EF4444",
  critical: "#DC2626",
} as const;

export const RISK_LEVEL_LABELS = {
  low: "Baixo Risco",
  medium: "Risco Médio",
  high: "Alto Risco",
  critical: "Risco Crítico",
} as const;

export const INTERVENTION_TYPE_LABELS = {
  reminder: "Lembrete",
  confirmation: "Confirmação",
  incentive: "Incentivo",
  rescheduling: "Reagendamento",
  personal_contact: "Contato Pessoal",
} as const;

export const INTERVENTION_ACTIONS_PT = {
  reminder: "Enviar Lembrete",
  confirmation: "Solicitar Confirmação",
  incentive: "Oferecer Incentivo",
  rescheduling: "Sugerir Reagendamento",
  personal_contact: "Contato Direto",
} as const;

// Type guards
export function isNoShowPrediction(obj: any): obj is NoShowPrediction {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.id === "string" &&
    typeof obj.appointmentId === "string" &&
    typeof obj.riskScore === "number" &&
    ["low", "medium", "high", "critical"].includes(obj.riskLevel)
  );
}

export function isRiskFactor(obj: any): obj is RiskFactor {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.weight === "number"
  );
}

export default NoShowPrediction;
