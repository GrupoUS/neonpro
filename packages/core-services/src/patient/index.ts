// Patient module exports

export type { PatientRepository } from './service';
export * from './service';
export { PatientService } from './service';
// Re-export commonly used types
export type {
  Address,
  AestheticHistory,
  Allergy,
  ConsentForm,
  CreatePatientData,
  EmergencyContact,
  MedicalHistory,
  Medication,
  Patient,
  PatientFilters,
  PatientStats,
  PreviousTreatment,
  SkinAssessment,
  UpdatePatientData,
  WrinkleAssessment,
} from './types';
export * from './types';
export {
  AcneGrade,
  AllergySeverity,
  ElasticityLevel,
  Gender,
  HydrationLevel,
  PregnancyStatus,
  SensitivityLevel,
  SkinCondition,
  SkinType,
  WrinkleGrade,
} from './types';
