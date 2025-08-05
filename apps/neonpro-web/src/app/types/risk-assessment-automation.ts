/**
 * Risk Assessment Automation Types
 * Story 9.4: Comprehensive automated risk assessment with medical validation
 *
 * This module provides TypeScript types for the risk assessment automation system,
 * including automated risk scoring, human-in-the-loop medical validation,
 * risk mitigation strategies, and real-time alert management.
 */

// Core Risk Assessment Types
export type RiskLevel = "low" | "moderate" | "high" | "critical";
export type AssessmentType = "routine" | "consultation" | "treatment" | "emergency";
export type AssessmentMethod = "automated" | "manual" | "hybrid";
export type ValidationStatus = "pending" | "validated" | "requires_review" | "rejected";

// Risk Category Types
export type RiskCategory = "medical" | "procedural" | "patient_specific" | "environmental";

// Validation Decision Types
export type ValidationDecision = "approved" | "rejected" | "modified" | "escalated";

// Mitigation Types
export type MitigationType = "preventive" | "monitoring" | "intervention" | "emergency";
export type ImplementationStatus = "planned" | "active" | "completed" | "cancelled";
export type MonitoringFrequency = "continuous" | "hourly" | "daily" | "weekly" | "monthly";

// Alert Types
export type AlertType = "immediate" | "warning" | "monitoring" | "predictive";
export type SeverityLevel = "info" | "warning" | "high" | "critical" | "emergency";
export type AlertStatus = "active" | "acknowledged" | "resolved" | "escalated";

// Threshold Types
export type ThresholdType = "score" | "factor" | "combination";

// Risk Factors Structure
export interface RiskFactors {
  medical: {
    chronic_conditions?: string[];
    allergies?: string[];
    medications?: string[];
    previous_complications?: string[];
    contraindications?: string[];
  };
  procedural: {
    procedure_complexity?: number;
    anesthesia_risk?: number;
    equipment_factors?: string[];
    technique_risks?: string[];
  };
  patient_specific: {
    age_factor?: number;
    bmi_factor?: number;
    smoking_status?: boolean;
    pregnancy_status?: boolean;
    mobility_limitations?: string[];
    psychological_factors?: string[];
  };
  environmental: {
    clinic_conditions?: string[];
    equipment_status?: string[];
    staff_experience?: number;
    emergency_preparedness?: number;
  };
}

// Risk Categories Structure
export interface RiskCategories {
  medical: {
    score: number;
    factors: string[];
    severity: RiskLevel;
  };
  procedural: {
    score: number;
    factors: string[];
    severity: RiskLevel;
  };
  patient_specific: {
    score: number;
    factors: string[];
    severity: RiskLevel;
  };
  environmental: {
    score: number;
    factors: string[];
    severity: RiskLevel;
  };
}

// Assessment Context Structure
export interface AssessmentContext {
  procedure_id?: string;
  treatment_type?: string;
  consultation_reason?: string;
  emergency_type?: string;
  referring_condition?: string;
  assessment_triggers?: string[];
}

// Risk Assessment Interface
export interface RiskAssessment {
  id: string;
  patient_id: string;

  // Risk Analysis Data
  risk_factors: RiskFactors;
  risk_score: number; // 0-100
  risk_level: RiskLevel;
  risk_categories: RiskCategories;

  // Assessment Details
  assessment_type: AssessmentType;
  assessment_method: AssessmentMethod;
  assessment_context: AssessmentContext;

  // Clinical Data
  medical_history_factors: Record<string, any>;
  current_conditions: Record<string, any>;
  contraindications: Record<string, any>;
  risk_multipliers: Record<string, any>;

  // Timestamps and Status
  assessment_date: string;
  last_updated: string;
  validation_status: ValidationStatus;
  validation_required: boolean;

  // Audit and Tracking
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Risk Validation Interface
export interface RiskValidation {
  id: string;
  assessment_id: string;
  validator_id: string;

  // Validation Decision
  validation_decision: ValidationDecision;
  validation_notes?: string;
  override_risk_score?: number;
  override_risk_level?: RiskLevel;

  // Medical Professional Context
  validator_credentials: Record<string, any>;
  validation_confidence?: number; // 0-100
  requires_second_opinion: boolean;

  // Audit Trail
  validation_date: string;
  validation_duration_minutes?: number;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// Risk Mitigation Interface
export interface RiskMitigation {
  id: string;
  risk_assessment_id: string;

  // Mitigation Strategy
  mitigation_type: MitigationType;
  mitigation_strategy: string;
  mitigation_details: Record<string, any>;

  // Implementation
  implementation_status: ImplementationStatus;
  implementation_date?: string;
  responsible_staff_id?: string;

  // Effectiveness Tracking
  effectiveness_score?: number; // 0-100
  effectiveness_notes?: string;
  monitoring_frequency?: MonitoringFrequency;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// Risk Alert Interface
export interface RiskAlert {
  id: string;
  patient_id: string;
  assessment_id?: string;

  // Alert Details
  alert_type: AlertType;
  risk_category: RiskCategory;
  severity_level: SeverityLevel;

  // Alert Content
  alert_title: string;
  alert_message: string;
  alert_details: Record<string, any>;
  recommended_actions: Record<string, any>;

  // Status and Escalation
  alert_status: AlertStatus;
  escalation_level: number; // 0-5
  escalation_path: Record<string, any>;

  // Response Tracking
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes?: string;

  // Emergency Integration
  emergency_protocol_triggered: boolean;
  emergency_response_time_minutes?: number;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// Risk Threshold Interface
export interface RiskThreshold {
  id: string;
  clinic_id?: string; // NULL for global thresholds

  // Threshold Configuration
  threshold_name: string;
  risk_category: RiskCategory;
  threshold_type: ThresholdType;

  // Threshold Values
  low_threshold: number; // 0-100
  moderate_threshold: number; // 0-100
  high_threshold: number; // 0-100
  critical_threshold: number; // 0-100

  // Actions and Responses
  automated_actions: Record<string, any>;
  notification_settings: Record<string, any>;
  escalation_rules: Record<string, any>;

  // Status
  is_active: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// Request/Response Types for API
export interface CreateRiskAssessmentRequest {
  patient_id: string;
  assessment_type: AssessmentType;
  assessment_method?: AssessmentMethod;
  assessment_context?: AssessmentContext;
  risk_factors?: Partial<RiskFactors>;
  medical_history_factors?: Record<string, any>;
  current_conditions?: Record<string, any>;
}

export interface UpdateRiskAssessmentRequest {
  risk_factors?: Partial<RiskFactors>;
  risk_score?: number;
  risk_level?: RiskLevel;
  assessment_context?: AssessmentContext;
  validation_status?: ValidationStatus;
}

export interface CreateValidationRequest {
  assessment_id: string;
  validation_decision: ValidationDecision;
  validation_notes?: string;
  override_risk_score?: number;
  override_risk_level?: RiskLevel;
  validator_credentials?: Record<string, any>;
  validation_confidence?: number;
  requires_second_opinion?: boolean;
}

export interface CreateMitigationRequest {
  risk_assessment_id: string;
  mitigation_type: MitigationType;
  mitigation_strategy: string;
  mitigation_details?: Record<string, any>;
  responsible_staff_id?: string;
  monitoring_frequency?: MonitoringFrequency;
}

export interface CreateAlertRequest {
  patient_id: string;
  assessment_id?: string;
  alert_type: AlertType;
  risk_category: RiskCategory;
  severity_level: SeverityLevel;
  alert_title: string;
  alert_message: string;
  alert_details?: Record<string, any>;
  recommended_actions?: Record<string, any>;
}

export interface UpdateAlertRequest {
  alert_status?: AlertStatus;
  escalation_level?: number;
  resolution_notes?: string;
  emergency_protocol_triggered?: boolean;
}

// Assessment Engine Types
export interface RiskAssessmentEngine {
  calculateRiskScore(factors: RiskFactors, context: AssessmentContext): number;
  determineRiskLevel(score: number): RiskLevel;
  identifyRiskFactors(patientData: any, procedureData: any): RiskFactors;
  generateRecommendations(assessment: RiskAssessment): RiskMitigation[];
  requiresValidation(assessment: RiskAssessment): boolean;
}

// Medical Validation Types
export interface MedicalValidator {
  validateAssessment(assessment: RiskAssessment): Promise<RiskValidation>;
  requiresSecondOpinion(assessment: RiskAssessment): boolean;
  escalateToSpecialist(assessment: RiskAssessment): Promise<void>;
  generateAuditTrail(validation: RiskValidation): void;
}

// Alert System Types
export interface AlertManager {
  createAlert(alert: CreateAlertRequest): Promise<RiskAlert>;
  escalateAlert(alertId: string): Promise<void>;
  acknowledgeAlert(alertId: string, userId: string): Promise<void>;
  resolveAlert(alertId: string, userId: string, notes?: string): Promise<void>;
  triggerEmergencyProtocol(alertId: string): Promise<void>;
}

// Dashboard and Analytics Types
export interface RiskDashboardData {
  totalAssessments: number;
  highRiskPatients: number;
  pendingValidations: number;
  activeAlerts: number;
  recentAssessments: RiskAssessment[];
  alertsByCategory: Record<RiskCategory, number>;
  riskTrends: {
    date: string;
    assessments: number;
    averageRisk: number;
  }[];
  validationMetrics: {
    totalValidations: number;
    averageValidationTime: number;
    validationAccuracy: number;
  };
}

export interface RiskAnalytics {
  patientRiskProfile: {
    patient_id: string;
    riskHistory: RiskAssessment[];
    riskTrend: "increasing" | "stable" | "decreasing";
    predictiveRisk: number;
  };
  clinicRiskMetrics: {
    averageRiskScore: number;
    riskDistribution: Record<RiskLevel, number>;
    mostCommonRiskFactors: string[];
    mitigationEffectiveness: number;
  };
  complianceMetrics: {
    validationCompliance: number;
    documentationCompleteness: number;
    protocolAdherence: number;
  };
}

// All types are already exported individually above
