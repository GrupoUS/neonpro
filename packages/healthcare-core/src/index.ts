/**
 * NeonPro Healthcare Core - Ultra Simplified
 * Comprehensive healthcare business logic with absorbed services
 */

// Core Healthcare Services
export * from './healthcare'

// Essential Business Services  
export * from './services/multi-professional-coordination-service'
export * from './services/patient-engagement-service'
export * from './services/treatment-planning-service'

// Aesthetic Services Core
export * from './services/enhanced-aesthetic-scheduling-service'
export * from './services/no-show-prediction-service'
export * from './services/professional-validation-service'

// Analytics & Business Intelligence
export * from './services/analytics-service'

// Governance & Compliance
export * from './services/compliance-management-service'

// Patient Data Models
export * from './patient/base-patient.schema'
export * from './patient/brazilian-patient.schema'

// Validation Schemas
export * from './lgpd.valibot'
export * from './appointment.valibot'
export * from './prescription.valibot'

// Utilities & Helpers
export * from './guards'
export * from './analytics'

// Re-export essential types
export type {
  AestheticAppointment,
  AestheticProcedureDetails,
  FollowUpAppointment,
  ProfessionalAssignment,
  RecoveryPlan,
} from './services/enhanced-aesthetic-scheduling-service'

export type {
  NoShowPredictionFeatures,
  NoShowPredictionResult,
} from './services/no-show-prediction-service'