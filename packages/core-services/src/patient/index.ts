// Patient module exports
export * from './types';
export * from './service';

// Re-export commonly used types
export type {
  Patient,
  CreatePatientData,
  UpdatePatientData,
  MedicalHistory,
  AestheticHistory,
  SkinAssessment,
  ConsentForm,
  Address,
  EmergencyContact,
  Allergy,
  Medication,
  PreviousTreatment,
  WrinkleAssessment,
  PatientFilters,
  PatientStats
} from './types';

export { PatientService } from './service';
export { 
  Gender,
  PregnancyStatus,
  AllergySeverity,
  SkinType,
  SkinCondition,
  HydrationLevel,
  ElasticityLevel,
  SensitivityLevel,
  AcneGrade,
  WrinkleGrade
} from './types';

export type { PatientRepository } from './service';