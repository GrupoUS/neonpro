// Treatment module exports
export * from './types';
export * from './service';

// Re-export commonly used types
export type {
  TreatmentPlan,
  TreatmentSession,
  TreatmentDetails,
  CreateTreatmentPlanData,
  UpdateTreatmentPlanData,
  CreateTreatmentSessionData,
  CompleteTreatmentSessionData,
  InjectionSite,
  LaserSettings,
  ProductUsage,
  TreatmentPhoto
} from './types';

export { TreatmentService } from './service';
export type { TreatmentRepository } from './service';
export { TreatmentStatus, AnesthesiaType } from './types';