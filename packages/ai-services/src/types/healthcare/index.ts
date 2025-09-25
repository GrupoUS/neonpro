/**
 * Healthcare-specific types for unified AI services
 * @package @neonpro/ai-services
 */

// Healthcare event types
export * from './clinical-events';
export * from './aesthetic-events';

// Healthcare-specific type exports
export type {
  HealthcareEvent,
  ClinicalEventType,
  AestheticEventType,
  EventSeverity,
  EventPriority,
  PatientContext,
  ClinicalContext,
  AestheticContext,
  PatientAssessmentEvent,
  ClinicalDecisionSupportEvent,
  TreatmentPlanningEvent,
  FollowUpEvent,
  AestheticConsultationEvent,
  AestheticTreatmentEvent,
  OutcomeMonitoringEvent,
  ComplianceCheckEvent
} from './clinical-events';

export type {
  AestheticEvent,
  AestheticEventType,
  ConsultationEvent,
  TreatmentPlanningEvent,
  OutcomePredictionEvent,
  PatientAssessment,
  TreatmentPlan,
  OutcomePrediction,
  AestheticProcedure,
  TreatmentRecommendation,
  RiskAssessment,
  ExpectedOutcome,
  RecoveryTimeline,
  CostEstimate
} from './aesthetic-events';