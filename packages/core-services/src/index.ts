export * from './realtime/realtime-manager'
export * from './resilience/index'
export * from './services/ai-clinical-decision-support'
export * from './services/ai-service-management'
export * from './services/AIService'
export * from './services/governance/index'
export * from './services/health-analysis/index'

// Phase 4 Compliance & Audit Module
export * from './audit/index'

// Error handling utilities
export * from './errors/map'

// Phase 1 AI Chat models/services
export * from './models/audit-event'
export * from './models/chat-message'
export * from './models/chat-session'
export * from './services/ai-provider'
export * from './services/ai-provider-factory'
export * from './services/anthropic-provider'
export * from './services/chat-service'
export * from './services/consent-validation'
export * from './services/google-provider'
export * from './services/openai-provider'
export * from './services/pii-redaction'
export * from './services/rate-counter'

// Enhanced AI Usage Counter models/services (T017)
export * from './models/plan'
export * from './models/recommendation'
export * from './models/usage-counter'
export * from './models/user-plan'
export * from './usage/repository'

// Enhanced AI Abuse Window Tracker (T018)
export * from './usage/abuseWindow'

// Config utilities
export * from './config/logger'

export { MultiProfessionalCoordinationService } from './services/multi-professional-coordination-service'
export { PatientEngagementService } from './services/patient-engagement-service'
export { TreatmentPlanningService } from './services/treatment-planning-service'

// Performance Management Services
// export * from './services/performance-threshold-service' // Temporarily disabled
// export * from './services/performance-monitoring-service' // Temporarily disabled

// Enhanced Aesthetic Scheduling Services (Decomposed)
export * from './services/aesthetic-appointment-service'
export type {
  AestheticAppointment,
  AestheticProcedureDetails,
  FollowUpAppointment,
  ProfessionalAssignment,
  RecoveryPlan,
} from './services/enhanced-aesthetic-scheduling-service'
export { EnhancedAestheticSchedulingService } from './services/enhanced-aesthetic-scheduling-service'
export type {
  NoShowPredictionFeatures,
  NoShowPredictionResult,
} from './services/no-show-prediction-service'
export { NoShowPredictionService } from './services/no-show-prediction-service'
export * from './services/professional-validation-service'
export * from './services/recovery-planning-service'
export * from './services/treatment-package-service'
