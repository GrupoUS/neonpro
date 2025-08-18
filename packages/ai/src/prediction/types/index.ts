/**
 * TypeScript Type Definitions for NeonPro AI Prediction Engine
 * Comprehensive types for aesthetic treatment prediction system
 * Target: 85%+ accuracy with LGPD compliance
 */

// ==================== CORE MODEL TYPES ====================

export type ModelType =
  | 'treatment-outcome'
  | 'duration-estimation'
  | 'success-probability'
  | 'risk-assessment'
  | 'botox-optimization'
  | 'filler-volume'
  | 'laser-settings';

export interface PredictionConfig {
  modelPath: string;
  inputShape: number[];
  outputShape: number[];
  accuracy: number;
  version: string;
}

export interface ModelMetadata {
  type: ModelType;
  version: string;
  accuracy: number;
  loadedAt: Date;
  inputShape: number[];
  outputShape: number[];
} // ==================== PATIENT DATA TYPES ====================

export interface PatientProfile {
  id: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  skinType: SkinType;
  medicalHistory: MedicalHistory;
  lifestyle: LifestyleFactors;
  previousTreatments: TreatmentHistory[];
  goals: TreatmentGoals;
  consentStatus: LGPDConsent;
}

export type SkinType =
  | 'fitzpatrick-1' // Very fair, always burns
  | 'fitzpatrick-2' // Fair, usually burns
  | 'fitzpatrick-3' // Medium, sometimes burns
  | 'fitzpatrick-4' // Olive, rarely burns
  | 'fitzpatrick-5' // Brown, very rarely burns
  | 'fitzpatrick-6'; // Dark brown/black, never burns

export interface MedicalHistory {
  allergies: string[];
  medications: Medication[];
  conditions: MedicalCondition[];
  pregnancyStatus?: boolean;
  breastfeedingStatus?: boolean;
  autoimmuneDiseases: string[];
  bloodThinnersUse: boolean;
  keloidProneness: boolean;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  isBloodThinner: boolean;
  affectsHealing: boolean;
}
export interface MedicalCondition {
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  treatmentRelevant: boolean;
  contraindication: boolean;
}

export interface LifestyleFactors {
  smoking: boolean;
  smokingFrequency?: 'occasional' | 'daily' | 'heavy';
  alcohol: boolean;
  alcoholFrequency?: 'occasional' | 'moderate' | 'heavy';
  sunExposure: 'minimal' | 'moderate' | 'high';
  skincare: SkincareRoutine;
  exerciseLevel: 'sedentary' | 'light' | 'moderate' | 'high';
  stressLevel: number; // 1-10 scale
  sleepQuality: number; // 1-10 scale
}

export interface SkincareRoutine {
  cleansing: boolean;
  moisturizing: boolean;
  sunscreenUse: boolean;
  retinoidUse: boolean;
  exfoliation: boolean;
  professionalTreatments: string[];
}

// ==================== TREATMENT TYPES ====================

export interface TreatmentRequest {
  patientId: string;
  treatmentType: TreatmentType;
  targetAreas: TargetArea[];
  goals: TreatmentGoals;
  urgency: 'low' | 'moderate' | 'high';
  budgetRange: BudgetRange;
  timeframe: TimeframePreference;
}
export type TreatmentType =
  | 'botox'
  | 'dermal-fillers'
  | 'laser-resurfacing'
  | 'laser-hair-removal'
  | 'chemical-peel'
  | 'microneedling'
  | 'coolsculpting'
  | 'radiofrequency'
  | 'photofacial'
  | 'thread-lift';

export interface TargetArea {
  region: FacialRegion | BodyRegion;
  concern: AestheticConcern;
  severity: number; // 1-10 scale
  priority: number; // 1-5 scale
}

export type FacialRegion =
  | 'forehead'
  | 'glabella'
  | 'crows-feet'
  | 'under-eyes'
  | 'cheeks'
  | 'nasolabial-folds'
  | 'marionette-lines'
  | 'lips'
  | 'jawline'
  | 'neck';

export type BodyRegion =
  | 'abdomen'
  | 'thighs'
  | 'arms'
  | 'back'
  | 'chest'
  | 'flanks'
  | 'buttocks';

export type AestheticConcern =
  | 'wrinkles'
  | 'fine-lines'
  | 'volume-loss'
  | 'sagging'
  | 'pigmentation'
  | 'acne-scars'
  | 'texture'
  | 'excess-fat'
  | 'cellulite'
  | 'unwanted-hair';

export interface TreatmentGoals {
  primary: string;
  secondary: string[];
  expectations: ExpectationLevel;
  maintenance: boolean;
  naturalLook: boolean;
}

export type ExpectationLevel = 'subtle' | 'moderate' | 'dramatic';
