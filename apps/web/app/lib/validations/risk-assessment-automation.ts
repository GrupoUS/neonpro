/**
 * Risk Assessment Automation Validation Schemas
 * Story 9.4: Comprehensive automated risk assessment with medical validation
 * 
 * This module provides Zod validation schemas for the risk assessment automation system,
 * ensuring data integrity and type safety for all risk assessment operations.
 */

import { z } from 'zod';

// Enum Schemas
export const RiskLevelSchema = z.enum(['low', 'moderate', 'high', 'critical']);
export const AssessmentTypeSchema = z.enum(['routine', 'consultation', 'treatment', 'emergency']);
export const AssessmentMethodSchema = z.enum(['automated', 'manual', 'hybrid']);
export const ValidationStatusSchema = z.enum(['pending', 'validated', 'requires_review', 'rejected']);
export const RiskCategorySchema = z.enum(['medical', 'procedural', 'patient_specific', 'environmental']);
export const ValidationDecisionSchema = z.enum(['approved', 'rejected', 'modified', 'escalated']);
export const MitigationTypeSchema = z.enum(['preventive', 'monitoring', 'intervention', 'emergency']);
export const ImplementationStatusSchema = z.enum(['planned', 'active', 'completed', 'cancelled']);
export const MonitoringFrequencySchema = z.enum(['continuous', 'hourly', 'daily', 'weekly', 'monthly']);
export const AlertTypeSchema = z.enum(['immediate', 'warning', 'monitoring', 'predictive']);
export const SeverityLevelSchema = z.enum(['info', 'warning', 'high', 'critical', 'emergency']);
export const AlertStatusSchema = z.enum(['active', 'acknowledged', 'resolved', 'escalated']);
export const ThresholdTypeSchema = z.enum(['score', 'factor', 'combination']);

// Base Score Schema (0-100)
const ScoreSchema = z.number().min(0).max(100);

// Risk Factors Schema
export const RiskFactorsSchema = z.object({
  medical: z.object({
    chronic_conditions: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
    previous_complications: z.array(z.string()).optional(),
    contraindications: z.array(z.string()).optional(),
  }).optional(),
  procedural: z.object({
    procedure_complexity: z.number().min(0).max(10).optional(),
    anesthesia_risk: z.number().min(0).max(10).optional(),
    equipment_factors: z.array(z.string()).optional(),
    technique_risks: z.array(z.string()).optional(),
  }).optional(),
  patient_specific: z.object({
    age_factor: z.number().min(0).max(10).optional(),
    bmi_factor: z.number().min(0).max(10).optional(),
    smoking_status: z.boolean().optional(),
    pregnancy_status: z.boolean().optional(),
    mobility_limitations: z.array(z.string()).optional(),
    psychological_factors: z.array(z.string()).optional(),
  }).optional(),
  environmental: z.object({
    clinic_conditions: z.array(z.string()).optional(),
    equipment_status: z.array(z.string()).optional(),
    staff_experience: z.number().min(0).max(10).optional(),
    emergency_preparedness: z.number().min(0).max(10).optional(),
  }).optional(),
});

// Risk Categories Schema
export const RiskCategoriesSchema = z.object({
  medical: z.object({
    score: ScoreSchema,
    factors: z.array(z.string()),
    severity: RiskLevelSchema,
  }),
  procedural: z.object({
    score: ScoreSchema,
    factors: z.array(z.string()),
    severity: RiskLevelSchema,
  }),
  patient_specific: z.object({
    score: ScoreSchema,
    factors: z.array(z.string()),
    severity: RiskLevelSchema,
  }),
  environmental: z.object({
    score: ScoreSchema,
    factors: z.array(z.string()),
    severity: RiskLevelSchema,
  }),
});

// Assessment Context Schema
export const AssessmentContextSchema = z.object({
  procedure_id: z.string().uuid().optional(),
  treatment_type: z.string().optional(),
  consultation_reason: z.string().optional(),
  emergency_type: z.string().optional(),
  referring_condition: z.string().optional(),
  assessment_triggers: z.array(z.string()).optional(),
});

// Core Entity Schemas
export const RiskAssessmentSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  
  // Risk Analysis Data
  risk_factors: RiskFactorsSchema,
  risk_score: ScoreSchema,
  risk_level: RiskLevelSchema,
  risk_categories: RiskCategoriesSchema,
  
  // Assessment Details
  assessment_type: AssessmentTypeSchema,
  assessment_method: AssessmentMethodSchema,
  assessment_context: AssessmentContextSchema,
  
  // Clinical Data
  medical_history_factors: z.record(z.any()),
  current_conditions: z.record(z.any()),
  contraindications: z.record(z.any()),
  risk_multipliers: z.record(z.any()),
  
  // Timestamps and Status
  assessment_date: z.string().datetime(),
  last_updated: z.string().datetime(),
  validation_status: ValidationStatusSchema,
  validation_required: z.boolean(),
  
  // Audit and Tracking
  created_by: z.string().uuid().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const RiskValidationSchema = z.object({
  id: z.string().uuid(),
  assessment_id: z.string().uuid(),
  validator_id: z.string().uuid(),
  
  // Validation Decision
  validation_decision: ValidationDecisionSchema,
  validation_notes: z.string().optional(),
  override_risk_score: ScoreSchema.optional(),
  override_risk_level: RiskLevelSchema.optional(),
  
  // Medical Professional Context
  validator_credentials: z.record(z.any()),
  validation_confidence: ScoreSchema.optional(),
  requires_second_opinion: z.boolean(),
  
  // Audit Trail
  validation_date: z.string().datetime(),
  validation_duration_minutes: z.number().min(0).optional(),
  
  // Timestamps
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const RiskMitigationSchema = z.object({
  id: z.string().uuid(),
  risk_assessment_id: z.string().uuid(),
  
  // Mitigation Strategy
  mitigation_type: MitigationTypeSchema,
  mitigation_strategy: z.string().min(1),
  mitigation_details: z.record(z.any()),
  
  // Implementation
  implementation_status: ImplementationStatusSchema,
  implementation_date: z.string().datetime().optional(),
  responsible_staff_id: z.string().uuid().optional(),
  
  // Effectiveness Tracking
  effectiveness_score: ScoreSchema.optional(),
  effectiveness_notes: z.string().optional(),
  monitoring_frequency: MonitoringFrequencySchema.optional(),
  
  // Timestamps
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const RiskAlertSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  assessment_id: z.string().uuid().optional(),
  
  // Alert Details
  alert_type: AlertTypeSchema,
  risk_category: RiskCategorySchema,
  severity_level: SeverityLevelSchema,
  
  // Alert Content
  alert_title: z.string().min(1),
  alert_message: z.string().min(1),
  alert_details: z.record(z.any()),
  recommended_actions: z.record(z.any()),
  
  // Status and Escalation
  alert_status: AlertStatusSchema,
  escalation_level: z.number().min(0).max(5),
  escalation_path: z.record(z.any()),
  
  // Response Tracking
  acknowledged_by: z.string().uuid().optional(),
  acknowledged_at: z.string().datetime().optional(),
  resolved_by: z.string().uuid().optional(),
  resolved_at: z.string().datetime().optional(),
  resolution_notes: z.string().optional(),
  
  // Emergency Integration
  emergency_protocol_triggered: z.boolean(),
  emergency_response_time_minutes: z.number().min(0).optional(),
  
  // Timestamps
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const RiskThresholdSchema = z.object({
  id: z.string().uuid(),
  clinic_id: z.string().uuid().optional(),
  
  // Threshold Configuration
  threshold_name: z.string().min(1),
  risk_category: RiskCategorySchema,
  threshold_type: ThresholdTypeSchema,
  
  // Threshold Values (must be in ascending order)
  low_threshold: ScoreSchema,
  moderate_threshold: ScoreSchema,
  high_threshold: ScoreSchema,
  critical_threshold: ScoreSchema,
  
  // Actions and Responses
  automated_actions: z.record(z.any()),
  notification_settings: z.record(z.any()),
  escalation_rules: z.record(z.any()),
  
  // Status
  is_active: z.boolean(),
  
  // Timestamps
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
}).refine((data) => {
  // Ensure thresholds are in logical order
  return (
    data.low_threshold <= data.moderate_threshold &&
    data.moderate_threshold <= data.high_threshold &&
    data.high_threshold <= data.critical_threshold
  );
}, {
  message: "Thresholds must be in ascending order: low ≤ moderate ≤ high ≤ critical",
});

// Request Schemas for API Operations
export const CreateRiskAssessmentRequestSchema = z.object({
  patient_id: z.string().uuid(),
  assessment_type: AssessmentTypeSchema,
  assessment_method: AssessmentMethodSchema.default('automated'),
  assessment_context: AssessmentContextSchema.optional(),
  risk_factors: RiskFactorsSchema.optional(),
  medical_history_factors: z.record(z.any()).optional(),
  current_conditions: z.record(z.any()).optional(),
});

export const UpdateRiskAssessmentRequestSchema = z.object({
  risk_factors: RiskFactorsSchema.optional(),
  risk_score: ScoreSchema.optional(),
  risk_level: RiskLevelSchema.optional(),
  assessment_context: AssessmentContextSchema.optional(),
  validation_status: ValidationStatusSchema.optional(),
});

export const CreateValidationRequestSchema = z.object({
  assessment_id: z.string().uuid(),
  validation_decision: ValidationDecisionSchema,
  validation_notes: z.string().optional(),
  override_risk_score: ScoreSchema.optional(),
  override_risk_level: RiskLevelSchema.optional(),
  validator_credentials: z.record(z.any()).optional(),
  validation_confidence: ScoreSchema.optional(),
  requires_second_opinion: z.boolean().default(false),
});

export const CreateMitigationRequestSchema = z.object({
  risk_assessment_id: z.string().uuid(),
  mitigation_type: MitigationTypeSchema,
  mitigation_strategy: z.string().min(1),
  mitigation_details: z.record(z.any()).optional(),
  responsible_staff_id: z.string().uuid().optional(),
  monitoring_frequency: MonitoringFrequencySchema.optional(),
});

export const CreateAlertRequestSchema = z.object({
  patient_id: z.string().uuid(),
  assessment_id: z.string().uuid().optional(),
  alert_type: AlertTypeSchema,
  risk_category: RiskCategorySchema,
  severity_level: SeverityLevelSchema,
  alert_title: z.string().min(1),
  alert_message: z.string().min(1),
  alert_details: z.record(z.any()).optional(),
  recommended_actions: z.record(z.any()).optional(),
});

export const UpdateAlertRequestSchema = z.object({
  alert_status: AlertStatusSchema.optional(),
  escalation_level: z.number().min(0).max(5).optional(),
  resolution_notes: z.string().optional(),
  emergency_protocol_triggered: z.boolean().optional(),
});

export const CreateThresholdRequestSchema = z.object({
  clinic_id: z.string().uuid().optional(),
  threshold_name: z.string().min(1),
  risk_category: RiskCategorySchema,
  threshold_type: ThresholdTypeSchema,
  low_threshold: ScoreSchema,
  moderate_threshold: ScoreSchema,
  high_threshold: ScoreSchema,
  critical_threshold: ScoreSchema,
  automated_actions: z.record(z.any()).optional(),
  notification_settings: z.record(z.any()).optional(),
  escalation_rules: z.record(z.any()).optional(),
}).refine((data) => {
  return (
    data.low_threshold <= data.moderate_threshold &&
    data.moderate_threshold <= data.high_threshold &&
    data.high_threshold <= data.critical_threshold
  );
}, {
  message: "Thresholds must be in ascending order: low ≤ moderate ≤ high ≤ critical",
});

export const UpdateThresholdRequestSchema = z.object({
  threshold_name: z.string().min(1).optional(),
  low_threshold: ScoreSchema.optional(),
  moderate_threshold: ScoreSchema.optional(),
  high_threshold: ScoreSchema.optional(),
  critical_threshold: ScoreSchema.optional(),
  automated_actions: z.record(z.any()).optional(),
  notification_settings: z.record(z.any()).optional(),
  escalation_rules: z.record(z.any()).optional(),
  is_active: z.boolean().optional(),
});

// Query Parameter Schemas
export const RiskAssessmentQuerySchema = z.object({
  patient_id: z.string().uuid().optional(),
  risk_level: RiskLevelSchema.optional(),
  assessment_type: AssessmentTypeSchema.optional(),
  validation_status: ValidationStatusSchema.optional(),
  from_date: z.string().datetime().optional(),
  to_date: z.string().datetime().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export const AlertQuerySchema = z.object({
  patient_id: z.string().uuid().optional(),
  alert_status: AlertStatusSchema.optional(),
  severity_level: SeverityLevelSchema.optional(),
  risk_category: RiskCategorySchema.optional(),
  from_date: z.string().datetime().optional(),
  to_date: z.string().datetime().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export const ValidationQuerySchema = z.object({
  validator_id: z.string().uuid().optional(),
  validation_decision: ValidationDecisionSchema.optional(),
  requires_second_opinion: z.boolean().optional(),
  from_date: z.string().datetime().optional(),
  to_date: z.string().datetime().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

// Dashboard Analytics Schemas
export const RiskDashboardQuerySchema = z.object({
  date_range: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  clinic_id: z.string().uuid().optional(),
  include_trends: z.boolean().default(true),
  include_alerts: z.boolean().default(true),
});

export const RiskAnalyticsQuerySchema = z.object({
  patient_id: z.string().uuid().optional(),
  risk_category: RiskCategorySchema.optional(),
  analysis_type: z.enum(['patient', 'clinic', 'compliance']).default('clinic'),
  from_date: z.string().datetime().optional(),
  to_date: z.string().datetime().optional(),
});

// Response Schemas
export const RiskAssessmentResponseSchema = z.object({
  assessment: RiskAssessmentSchema,
  validations: z.array(RiskValidationSchema).optional(),
  mitigations: z.array(RiskMitigationSchema).optional(),
  alerts: z.array(RiskAlertSchema).optional(),
});

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  });

// Error Response Schema
export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.record(z.any()).optional(),
  timestamp: z.string().datetime(),
});

// Bulk Operation Schemas
export const BulkCreateAssessmentsSchema = z.object({
  assessments: z.array(CreateRiskAssessmentRequestSchema).min(1).max(100),
});

export const BulkUpdateAlertsSchema = z.object({
  alert_ids: z.array(z.string().uuid()).min(1).max(100),
  updates: UpdateAlertRequestSchema,
});

export const BulkValidateAssessmentsSchema = z.object({
  assessment_ids: z.array(z.string().uuid()).min(1).max(50),
  validation_decision: ValidationDecisionSchema,
  validation_notes: z.string().optional(),
});

// Export all schemas for use in API routes and components
export {
    ScoreSchema
};

