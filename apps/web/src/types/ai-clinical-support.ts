/**
 * Type definitions for AI Clinical Decision Support System
 * Brazilian healthcare compliant AI-powered clinical decision support interfaces
 */

import { z } from 'zod';

// =====================================
// PATIENT ASSESSMENT TYPES
// =====================================

export interface PatientAssessment {
  id: string;
  patientId: string;
  assessmentDate: Date;
  skinType: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
  fitzpatrickScale: number;
  skinConditions: string[];
  medicalHistory: {
    allergies: string[];
    medications: string[];
    previousTreatments: string[];
    chronicConditions: string[];
    pregnancyStatus: 'none' | 'pregnant' | 'breastfeeding' | 'planning';
  };
  aestheticGoals: string[];
  budgetRange: {
    min: number;
    max: number;
    currency: 'BRL' | 'USD' | 'EUR';
  };
  riskFactors: string[];
  photos?: AssessmentPhoto[];
}

export interface AssessmentPhoto {
  id: string;
  url: string;
  angle: string;
  date: Date;
  description?: string;
}

// =====================================
// TREATMENT RECOMMENDATION TYPES
// =====================================

export interface TreatmentRecommendation {
  id: string;
  procedureId: string;
  procedureName: string;
  confidence: number; // 0-1
  efficacy: number; // 0-1
  safety: number; // 0-1
  suitability: number; // 0-1
  expectedResults: {
    timeline: string;
    improvement: string;
    longevity: string;
  };
  risks: TreatmentRisk[];
  contraindications: string[];
  alternatives: string[];
  cost: number;
  sessions: number;
  recovery: {
    downtime: string;
    activityRestrictions: string[];
  };
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  compliance: {
    cfmCompliant: boolean;
    anvisaCompliant: boolean;
    warnings: string[];
    restrictions: string[];
  };
}

export interface TreatmentRisk {
  type: 'common' | 'rare' | 'serious';
  description: string;
  probability: number; // 0-1
  mitigation?: string;
}

// =====================================
// TREATMENT PLAN TYPES
// =====================================

export interface TreatmentPlan {
  id: string;
  patientId: string;
  primaryGoals: string[];
  recommendations: TreatmentRecommendation[];
  prioritizedPlan: TreatmentPhase[];
  budgetBreakdown: BudgetBreakdown;
  riskAssessment: RiskAssessment;
  followUpSchedule: FollowUpSchedule[];
}

export interface TreatmentPhase {
  phase: number;
  procedures: string[];
  timeline: string;
  objectives: string[];
  estimatedDuration: number; // in days
  estimatedCost: number;
}

export interface BudgetBreakdown {
  total: number;
  byPhase: PhaseBudget[];
  currency: 'BRL' | 'USD' | 'EUR';
  paymentOptions: PaymentOption[];
}

export interface PhaseBudget {
  phase: number;
  cost: number;
  procedures: string[];
  discount?: number;
}

export interface PaymentOption {
  type: 'full' | 'installments' | 'package';
  installments?: number;
  interestRate?: number;
  description: string;
}

export interface RiskAssessment {
  overall: 'low' | 'medium' | 'high';
  factors: string[];
  mitigations: string[];
  requiresMedicalSupervision: boolean;
  emergencyProtocols: string[];
}

export interface FollowUpSchedule {
  procedure: string;
  timing: string;
  purpose: string;
  mandatory: boolean;
}

// =====================================
// CONTRAINDICATION ANALYSIS TYPES
// =====================================

export interface ContraindicationAnalysis {
  patientId: string;
  procedureId: string;
  absoluteContraindications: string[];
  relativeContraindications: string[];
  riskFactors: string[];
  recommendations: string[];
  canProceed: boolean;
  modifiedApproach?: string;
  compliance: {
    cfmCompliant: boolean;
    warnings: string[];
    restrictions: string[];
  };
}

// =====================================
// TREATMENT GUIDELINES TYPES
// =====================================

export interface TreatmentGuidelines {
  guidelines: ProcedureGuidelines;
  personalizedRecommendations: string[];
  precautions: string[];
}

export interface ProcedureGuidelines {
  procedureId: string;
  indications: string[];
  contraindications: {
    absolute: string[];
    relative: string[];
  };
  patientSelection: {
    idealCandidate: string[];
    cautionFactors: string[];
  };
  protocol: {
    preparation: string[];
    procedure: string[];
    aftercare: string[];
  };
  expectedOutcomes: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  complications: GuidelineComplication[];
  evidenceReferences: EvidenceReference[];
}

export interface GuidelineComplication {
  type: string;
  frequency: string;
  management: string;
  prevention: string;
}

export interface EvidenceReference {
  study: string;
  year: number;
  journal: string;
  findings: string;
  level: 'I' | 'II' | 'III' | 'IV';
  url?: string;
}

// =====================================
// OUTCOME PREDICTION TYPES
// =====================================

export interface OutcomePrediction {
  efficacy: number; // 0-1
  satisfaction: number; // 0-1
  risks: PredictedRisk[];
  timeline: OutcomeTimeline;
  recommendations: string[];
  confidenceInterval: {
    min: number;
    max: number;
    confidence: number; // 0-1
  };
}

export interface PredictedRisk {
  type: string;
  probability: number; // 0-1
  severity: 'low' | 'medium' | 'high';
  prevention: string[];
  treatment: string[];
}

export interface OutcomeTimeline {
  initialResults: string;
  optimalResults: string;
  maintenance: string;
  milestones: TimelineMilestone[];
}

export interface TimelineMilestone {
  period: string;
  expectedImprovement: string;
  confidence: number; // 0-1
}

// =====================================
// PROGRESS MONITORING TYPES
// =====================================

export interface ProgressMonitoring {
  progress: 'ahead' | 'on_track' | 'behind' | 'concerns';
  recommendations: string[];
  adjustments: ProgressAdjustment[];
  nextSessionPlan: string;
  riskAlerts: RiskAlert[];
}

export interface ProgressAdjustment {
  type: 'intensity' | 'frequency' | 'technique' | 'aftercare';
  current: string;
  recommended: string;
  reason: string;
  urgency: 'immediate' | 'next_session' | 'future';
}

export interface RiskAlert {
  type: 'complication' | 'side_effect' | 'non_compliance' | 'unexpected_result';
  severity: 'low' | 'medium' | 'high';
  description: string;
  action: string;
}

export interface PatientFeedback {
  satisfaction: number; // 0-100
  sideEffects: string[];
  adherenceToAftercare: 'excellent' | 'good' | 'fair' | 'poor';
  concerns: string[];
  improvements: string[];
}

export interface ClinicalAssessment {
  improvement: number; // 0-100
  complications: string[];
  healing: 'excellent' | 'good' | 'fair' | 'poor';
  observations: string[];
  measurements: Measurement[];
}

export interface Measurement {
  type: string;
  value: number;
  unit: string;
  date: Date;
  notes?: string;
}

// =====================================
// TREATMENT HISTORY TYPES
// =====================================

export interface TreatmentHistory {
  treatments: TreatmentRecord[];
  summary: TreatmentSummary;
  patterns: TreatmentPattern[];
  outcomes: TreatmentOutcome[];
}

export interface TreatmentRecord {
  id: string;
  appointmentId: string;
  procedureName: string;
  date: Date;
  professional: string;
  outcome: 'successful' | 'partial' | 'failed';
  complications: string[];
  patientSatisfaction: number;
  notes: string;
  cost: number;
}

export interface TreatmentSummary {
  totalTreatments: number;
  completedTreatments: number;
  totalSessions: number;
  lastTreatment: Date | null;
  totalInvestment: number;
  satisfactionTrend: 'improving' | 'stable' | 'declining';
}

export interface TreatmentPattern {
  pattern: string;
  frequency: number;
  description: string;
  recommendation: string;
}

export interface TreatmentOutcome {
  procedure: string;
  averageImprovement: number;
  satisfaction: number;
  complicationRate: number;
  recommendation: string;
}

// =====================================
// AI MODEL STATUS TYPES
// =====================================

export interface ModelStatus {
  models: ModelInfo[];
  systemHealth: SystemHealth;
}

export interface ModelInfo {
  name: string;
  status: 'healthy' | 'degraded' | 'unavailable';
  accuracy: number;
  lastTrained: Date;
  version: string;
  description: string;
  dataVersion: string;
  performance: ModelPerformance;
}

export interface ModelPerformance {
  responseTime: number; // in ms
  throughput: number; // requests per second
  errorRate: number; // percentage
  uptime: number; // percentage
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unavailable';
  uptime: string;
  responseTime: string;
  lastHealthCheck: Date;
  alerts: HealthAlert[];
}

export interface HealthAlert {
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

// =====================================
// FORM SCHEMAS
// =====================================

export const PatientAssessmentSchema = z.object({
  id: z.string().uuid('ID da avaliação inválido'),
  patientId: z.string().uuid('ID do paciente inválido'),
  assessmentDate: z.date(),
  skinType: z.enum(['I', 'II', 'III', 'IV', 'V', 'VI']),
  fitzpatrickScale: z.number().min(1).max(6, 'Escala Fitzpatrick deve ser 1-6'),
  skinConditions: z.array(z.string()).default([]),
  medicalHistory: z.object({
    allergies: z.array(z.string()).default([]),
    medications: z.array(z.string()).default([]),
    previousTreatments: z.array(z.string()).default([]),
    chronicConditions: z.array(z.string()).default([]),
    pregnancyStatus: z.enum(['none', 'pregnant', 'breastfeeding', 'planning']),
  }),
  aestheticGoals: z.array(z.string()).min(1, 'É necessário fornecer ao menos um objetivo estético'),
  budgetRange: z.object({
    min: z.number().min(0, 'Valor mínimo não pode ser negativo'),
    max: z.number().min(0, 'Valor máximo não pode ser negativo'),
    currency: z.enum(['BRL', 'USD', 'EUR']),
  }).refine(data => data.max >= data.min, {
    message: 'Valor máximo deve ser maior ou igual ao mínimo',
    path: ['max'],
  }),
  riskFactors: z.array(z.string()).default([]),
  photos: z.array(z.object({
    id: z.string().uuid('ID da foto inválido'),
    url: z.string().url('URL da foto inválida'),
    angle: z.string(),
    date: z.date(),
  })).optional(),
});

export const TreatmentPlanSchema = z.object({
  patientId: z.string().uuid('ID do paciente inválido'),
  selectedRecommendations: z.array(z.object({
    id: z.string(),
    procedureId: z.string(),
    procedureName: z.string(),
    confidence: z.number().min(0).max(1),
    efficacy: z.number().min(0).max(1),
    safety: z.number().min(0).max(1),
    suitability: z.number().min(0).max(1),
  })).min(1, 'Selecione ao menos uma recomendação'),
  goals: z.array(z.string()).min(1, 'É necessário fornecer ao menos um objetivo'),
});

export const ContraindicationAnalysisSchema = z.object({
  patientId: z.string().uuid('ID do paciente inválido'),
  procedureIds: z.array(z.string().uuid('ID do procedimento inválido')).min(
    1,
    'Selecione ao menos um procedimento',
  ),
});

export const TreatmentGuidelinesSchema = z.object({
  procedureId: z.string().uuid('ID do procedimento inválido'),
  patientFactors: z.object({
    skinType: z.string(),
    age: z.number().min(0).max(120, 'Idade inválida'),
    gender: z.string(),
    concerns: z.array(z.string()).default([]),
  }),
});

export const OutcomePredictionSchema = z.object({
  patientId: z.string().uuid('ID do paciente inválido'),
  procedureId: z.string().uuid('ID do procedimento inválido'),
  treatmentPlan: z.object({
    sessions: z.number().min(1, 'Número de sessões inválido'),
    intensity: z.enum(['low', 'medium', 'high']),
    frequency: z.string().min(1, 'Frequência é obrigatória'),
  }),
});

export const ProgressMonitoringSchema = z.object({
  treatmentPlanId: z.string().uuid('ID do plano de tratamento inválido'),
  currentSession: z.number().min(1, 'Número da sessão atual inválido'),
  patientFeedback: z.object({
    satisfaction: z.number().min(0).max(100, 'Satisfação deve ser 0-100'),
    sideEffects: z.array(z.string()).default([]),
    adherenceToAftercare: z.enum(['excellent', 'good', 'fair', 'poor']),
  }),
  clinicalAssessment: z.object({
    improvement: z.number().min(0).max(100, 'Melhora deve ser 0-100'),
    complications: z.array(z.string()).default([]),
    healing: z.enum(['excellent', 'good', 'fair', 'poor']),
  }),
});

// =====================================
// UTILITY TYPES
// =====================================

export type SkinType = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
export type EvidenceLevel = 'A' | 'B' | 'C' | 'D';
export type RiskLevel = 'low' | 'medium' | 'high';
export type PregnancyStatus = 'none' | 'pregnant' | 'breastfeeding' | 'planning';
export type ProgressStatus = 'ahead' | 'on_track' | 'behind' | 'concerns';
export type AdjustmentType = 'intensity' | 'frequency' | 'technique' | 'aftercare';
export type AlertType = 'warning' | 'error' | 'info';
export type ModelStatusType = 'healthy' | 'degraded' | 'unavailable';
