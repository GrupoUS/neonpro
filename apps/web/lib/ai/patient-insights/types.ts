// Patient insights types
export interface PatientInsightRequest {
  patient_id: string;
  include_history?: boolean;
  analysis_depth?: "basic" | "detailed" | "comprehensive";
  date_range?: {
    start: string;
    end: string;
  };
  requestedInsights?: unknown[];
  treatmentContext?: unknown;
  treatmentId?: string;
  customParameters?: unknown;
  feedbackData?: unknown;
  timestamp?: Date;
  requestId?: string;
}

export interface PatientAlert {
  id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  created_at: string;
  patient_id: string;
}

export interface PatientInsight {
  id: string;
  type: string;
  category: string;
  content: string;
  confidence: number;
  patient_id: string;
  generated_at: string;
}

export interface RiskFactor {
  factor: string;
  risk_level: "low" | "medium" | "high" | "critical";
  description: string;
  recommendations?: string[];
}

export interface TreatmentRecommendation {
  id: string;
  type: string;
  priority: "low" | "medium" | "high";
  description: string;
  rationale: string;
  estimated_impact: number;
  patient_id: string;
}

export const placeholder = false;
