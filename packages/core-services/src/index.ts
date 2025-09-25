// Business Services Package
// Core business logic and healthcare services

// Health Analysis Services
export * from './services/health-analysis'

// Multi-Professional Coordination
export { MultiProfessionalCoordinationService } from './services/multi-professional-coordination-service'

// Patient Engagement
export { PatientEngagementService } from './services/patient-engagement-service'

// Treatment Planning
export { TreatmentPlanningService } from './services/treatment-planning-service'

// Aesthetic Services
export * from './services/aesthetic-appointment-service'
export { EnhancedAestheticSchedulingService } from './services/enhanced-aesthetic-scheduling-service'
export { NoShowPredictionService } from './services/no-show-prediction-service'
export { ProfessionalValidationService } from './services/professional-validation-service'
export { RecoveryPlanningService } from './services/recovery-planning-service'
export { TreatmentPackageService } from './services/treatment-package-service'

// Governance & Compliance
export * from './services/governance'
export { ComplianceManagementService } from './services/compliance-management-service'

// Audit & Compliance
export * from './audit'

// Business Models
export * from './plan'

// Type exports for aesthetic services
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