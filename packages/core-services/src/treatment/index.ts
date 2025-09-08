// Treatment module exports

export type { TreatmentRepository, } from './service'
export * from './service'
export { TreatmentService, } from './service'
// Re-export commonly used types
export type {
  CompleteTreatmentSessionData,
  CreateTreatmentPlanData,
  CreateTreatmentSessionData,
  InjectionSite,
  LaserSettings,
  ProductUsage,
  TreatmentDetails,
  TreatmentPhoto,
  TreatmentPlan,
  TreatmentSession,
  UpdateTreatmentPlanData,
} from './types'
export * from './types'
export { AnesthesiaType, TreatmentStatus, } from './types'
