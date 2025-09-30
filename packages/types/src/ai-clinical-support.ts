/**
 * TypeScript interfaces for AI Clinical Support System
 * Replaces all 'any' types with specific, type-safe interfaces
 */

// Core Patient Data Types
export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  skinType: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
  skinConditions: string[];
  allergies: string[];
  medications: Medication[];
  medicalHistory: MedicalHistoryEntry[];
  aestheticHistory: AestheticHistoryEntry[];
  lifestyleFactors: LifestyleFactors;
  expectations: TreatmentExpectations;
  photoConsent: boolean;
  lastVisit?: Date;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  prescribedBy: string;
}

export interface MedicalHistoryEntry {
  condition: string;
  diagnosedDate: Date;
  status: 'active' | 'resolved' | 'chronic';
  treatedBy: string;
  notes?: string;
}

export interface AestheticHistoryEntry {
  procedure: string;
  date: Date;
  professional: string;
  clinic: string;
  results: 'excellent' | 'good' | 'fair' | 'poor';
  complications?: string;
  satisfaction: number; // 1-10 scale
}

export interface LifestyleFactors {
  smoking: boolean;
  alcohol: 'none' | 'occasional' | 'regular' | 'heavy';
  sunExposure: 'minimal' | 'moderate' | 'high' | 'very_high';
  stressLevel: 'low' | 'moderate' | 'high';
  sleepHours: number;
  hydration: 'poor' | 'fair' | 'good' | 'excellent';
  exercise: 'sedentary' | 'light' | 'moderate' | 'intense';
}

export interface TreatmentExpectations {
  primaryGoals: string[];
  secondaryGoals: string[];
  budgetRange: BudgetRange;
  timeCommitment: TimeCommitment;
  downtimeTolerance: 'none' | 'minimal' | 'moderate' | 'significant';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
}

export interface BudgetRange {
  min?: number;
  max?: number;
  currency: string;
  flexible: boolean;
}

export interface TimeCommitment {
  sessionsPerMonth: number;
  durationPerSession: string;
  totalTreatmentDuration: string;
  flexibility: 'strict' | 'moderate' | 'flexible';
}

// Treatment Recommendation Types
export interface TreatmentRecommendation {
  id: string;
  patientId: string;
  treatmentType: TreatmentType;
  recommendedProducts: RecommendedProduct[];
  protocol: TreatmentProtocol;
  riskLevel: 'low' | 'medium' | 'high';
  expectedOutcomes: string[];
  alternatives: string[];
  considerations: string[];
  generatedAt: Date;
  confidence: number; // 0-100
  priority: 'high' | 'medium' | 'low';
  estimatedCost: number;
  estimatedDuration: string;
}

export type TreatmentType = 
  | 'chemical_peel'
  | 'laser_therapy'
  | 'injectables'
  | 'microneedling'
  | 'dermabrasion'
  | 'phototherapy'
  | 'radiofrequency'
  | 'ultrasound_therapy'
  | 'mesotherapy'
  | 'carboxytherapy';

export interface RecommendedProduct {
  name: string;
  brand?: string;
  concentration?: string;
  applicationProtocol: string;
  expectedResults: string;
  contraindications: string[];
  sideEffects: string[];
  applicationFrequency: string;
  treatmentDuration: string;
}

export interface TreatmentProtocol {
  sessions: number;
  interval: string;
  duration: string;
  preparation: string[];
  aftercare: AftercareInstruction[];
  contraindications: string[];
  precautions: string[];
  expectedDowntime: string;
}

export interface AftercareInstruction {
  category: 'immediate' | 'first_24h' | 'first_week' | 'ongoing';
  instruction: string;
  importance: 'critical' | 'important' | 'recommended';
  timeframe?: string;
}

// Contraindication Analysis Types
export interface ContraindicationAnalysis {
  id: string;
  patientId: string;
  proposedTreatment: TreatmentType;
  absoluteContraindications: Contraindication[];
  relativeContraindications: Contraindication[];
  precautions: Precaution[];
  riskAssessment: RiskAssessment;
  recommendations: string[];
  alternativeTreatments: AlternativeTreatment[];
  analyzedAt: Date;
  requiresMedicalClearance: boolean;
}

export interface Contraindication {
  type: 'absolute' | 'relative';
  condition: string;
  severity: 'mild' | 'moderate' | 'severe';
  explanation: string;
  source: 'medical_literature' | 'manufacturer_guidelines' | 'clinical_experience';
  mitigation?: string;
}

export interface Precaution {
  category: 'pre_treatment' | 'during_treatment' | 'post_treatment';
  precaution: string;
  rationale: string;
  action: 'required' | 'recommended' | 'optional';
}

export interface RiskAssessment {
  overallRisk: 'low' | 'moderate' | 'high';
  riskFactors: RiskFactor[];
  riskMitigation: string[];
  monitoringRequirements: string[];
}

export interface RiskFactor {
  factor: string;
  impact: 'low' | 'moderate' | 'high';
  likelihood: 'rare' | 'uncommon' | 'common' | 'very_common';
  mitigation?: string;
}

export interface AlternativeTreatment {
  treatmentType: TreatmentType;
  reason: string;
  suitabilityScore: number; // 0-100
  pros: string[];
  cons: string[];
}

// Progress Monitoring Types
export interface ProgressMonitoring {
  id: string;
  patientId: string;
  treatmentId: string;
  treatmentType: TreatmentType;
  baselineData: BaselineData;
  progressEntries: ProgressEntry[];
  milestones: TreatmentMilestone[];
  alerts: ProgressAlert[];
  nextAssessmentDate: Date;
  overallProgress: ProgressPercentage;
  createdAt: Date;
  lastUpdated: Date;
}

export interface BaselineData {
  photos: TreatmentPhoto[];
  measurements: SkinMeasurement[];
  patientAssessment: PatientAssessment;
  professionalAssessment: ProfessionalAssessment;
  standardizedScores: StandardizedScore[];
}

export interface TreatmentPhoto {
  id: string;
  url: string;
  angle: 'front' | 'left' | 'right' | 'oblique_left' | 'oblique_right';
  lighting: 'standard' | 'raking' | 'cross_polarized';
  date: Date;
  annotations?: PhotoAnnotation[];
}

export interface PhotoAnnotation {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  severity?: 'mild' | 'moderate' | 'severe';
}

export interface SkinMeasurement {
  parameter: string;
  value: number;
  unit: string;
  measurementMethod: string;
  date: Date;
}

export interface PatientAssessment {
  pain: number; // 0-10 scale
  satisfaction: number; // 0-10 scale
  perceivedImprovement: number; // 0-100%
  concerns: string[];
  goalsAchieved: string[];
  newGoals: string[];
}

export interface ProfessionalAssessment {
  clinicalImprovement: number; // 0-100%
  textureImprovement: number; // 0-100%
  colorImprovement: number; // 0-100%
  overallAssessment: 'excellent' | 'good' | 'fair' | 'poor';
  professionalNotes: string;
  adjustmentsNeeded: string[];
}

export interface StandardizedScore {
  scale: string;
  score: number;
  maxScore: number;
  category: string;
  description: string;
}

export interface ProgressEntry {
  id: string;
  date: Date;
  sessionNumber: number;
  photos: TreatmentPhoto[];
  measurements: SkinMeasurement[];
  patientAssessment: PatientAssessment;
  professionalAssessment: ProfessionalAssessment;
  complications: Complication[];
  treatmentAdjustments: TreatmentAdjustment[];
  notes: string;
}

export interface Complication {
  type: 'expected' | 'unexpected';
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  actionTaken: string;
  resolution: string;
  resolvedDate?: Date;
}

export interface TreatmentAdjustment {
  parameter: string;
  previousValue: string | number;
  newValue: string | number;
  reason: string;
  date: Date;
  professional: string;
}

export interface TreatmentMilestone {
  id: string;
  description: string;
  targetDate: Date;
  actualDate?: Date;
  status: 'pending' | 'achieved' | 'delayed' | 'missed';
  criteria: string[];
}

export interface ProgressAlert {
  id: string;
  type: 'positive' | 'concern' | 'complication' | 'milestone';
  severity: 'low' | 'medium' | 'high';
  message: string;
  date: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedDate?: Date;
}

export interface ProgressPercentage {
  overall: number;
  texture: number;
  color: number;
  satisfaction: number;
  goals: number;
}

// Treatment Outcome Prediction Types
export interface TreatmentOutcomePrediction {
  id: string;
  patientId: string;
  treatmentType: TreatmentType;
  predictedOutcomes: PredictedOutcome[];
  timeline: TreatmentTimeline[];
  riskFactors: InfluencingFactor[];
  benchmarks: BenchmarkComparison[];
  alternativeScenarios: AlternativeScenario[];
  confidenceScore: number;
  generatedAt: Date;
  modelVersion: string;
}

export interface PredictedOutcome {
  outcome: string;
  probability: number; // 0-100%
  timeframe: string;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  influencingFactors: string[];
}

export interface TreatmentTimeline {
  phase: string;
  duration: string;
  expectedResults: string[];
  milestones: string[];
  potentialComplications: string[];
  probabilityOfSuccess: number;
}

export interface InfluencingFactor {
  factor: string;
  impact: 'positive' | 'negative';
  magnitude: number; // 0-100%
  description: string;
  mitigable: boolean;
  mitigationStrategy?: string;
}

export interface BenchmarkComparison {
  metric: string;
  patientScore: number;
  benchmarkAverage: number;
  benchmarkPercentile: number;
  interpretation: string;
}

export interface AlternativeScenario {
  scenario: string;
  probability: number; // 0-100%
  outcomes: string[];
  requirements: string[];
  pros: string[];
  cons: string[];
}

// Clinical Guidelines Types
export interface ClinicalGuideline {
  id: string;
  treatmentType: TreatmentType;
  title: string;
  description: string;
  indications: string[];
  contraindications: string[];
  protocol: GuidelineProtocol;
  evidence: EvidenceLevel[];
  references: Reference[];
  lastUpdated: Date;
  author: string;
  reviewedBy: string;
}

export interface GuidelineProtocol {
  patientSelection: PatientSelectionCriteria;
  preparation: PreparationStep[];
  procedure: ProcedureStep[];
  postTreatment: PostTreatmentCare[];
  followUp: FollowUpSchedule[];
  emergencyProtocols: EmergencyProtocol[];
}

export interface PatientSelectionCriteria {
  inclusion: string[];
  exclusion: string[];
  idealCandidates: string[];
  cautionGroups: string[];
}

export interface PreparationStep {
  step: number;
  action: string;
  rationale: string;
  timing: string;
  requiredProducts: string[];
}

export interface ProcedureStep {
  step: number;
  action: string;
  technique: string;
  parameters: ProcedureParameter[];
  duration: string;
  expectedOutcome: string;
  troubleshooting: string[];
}

export interface ProcedureParameter {
  name: string;
  value: string | number;
  unit?: string;
  range?: {
    min: number;
    max: number;
  };
  critical: boolean;
}

export interface PostTreatmentCare {
  timeframe: string;
  instructions: string[];
  products: string[];
  restrictions: string[];
  warningSigns: string[];
}

export interface FollowUpSchedule {
  appointmentNumber: number;
  timeframe: string;
  assessment: string[];
  photos: boolean;
  measurements: boolean[];
}

export interface EmergencyProtocol {
  situation: string;
  immediateAction: string;
  secondaryAction: string;
  whenToSeekHelp: string;
  contactInformation: string;
}

export interface EvidenceLevel {
  level: 'IA' | 'IB' | 'IIA' | 'IIB' | 'III' | 'IV';
  description: string;
  studyCount: number;
  totalPatients: number;
  qualityScore: number;
}

export interface Reference {
  id: string;
  authors: string[];
  title: string;
  journal: string;
  year: number;
  volume: string;
  pages: string;
  doi?: string;
  pmid?: string;
  type: 'RCT' | 'meta_analysis' | 'case_series' | 'review' | 'guideline';
}

// Emergency Protocol Types
export interface EmergencyProtocol {
  id: string;
  situation: EmergencySituation;
  immediateActions: EmergencyAction[];
  secondaryActions: EmergencyAction[];
  whenToSeekHelp: SeekHelpCriteria;
  contactInformation: EmergencyContact;
  prevention: PreventionMeasure[];
  lastUpdated: Date;
  approvedBy: string;
}

export type EmergencySituation = 
  | 'anaphylaxis'
  | 'severe_burn'
  | 'infection'
  | 'hyperpigmentation'
  | 'hypopigmentation'
  | 'scarring'
  | 'vascular_compromise'
  | 'nerve_damage'
  | 'severe_pain'
  | 'allergic_reaction';

export interface EmergencyAction {
  action: string;
  priority: 'immediate' | 'urgent' | 'important';
  timeframe: string;
  requiredEquipment: string[];
  requiredMedications: string[];
  instructions: string;
}

export interface SeekHelpCriteria {
  criteria: string[];
  urgencyLevel: 'immediate' | 'within_hours' | 'within_24h' | 'next_appointment';
  contactMethod: 'emergency_services' | 'emergency_room' | 'physician' | 'clinic';
}

export interface EmergencyContact {
  primaryContact: string;
  secondaryContact: string;
  emergencyServices: string;
  emergencyRoom: string;
  poisonControl: string;
}

export interface PreventionMeasure {
  measure: string;
  implementation: string;
  effectiveness: 'proven' | 'likely' | 'possible' | 'theoretical';
  evidence: string;
}

// Input Validation Types
export interface TreatmentRecommendationInput {
  patientId: string;
  concerns: string[];
  goals: string[];
  budget?: BudgetRange;
  timeCommitment?: TimeCommitment;
  preferences?: TreatmentPreferences;
}

export interface TreatmentPreferences {
  preferredModalities: TreatmentType[];
  avoidedModalities: TreatmentType[];
  downtimeAcceptance: 'none' | 'minimal' | 'moderate' | 'flexible';
  riskAcceptance: 'conservative' | 'moderate' | 'progressive';
  priorityFactors: ('cost' | 'time' | 'results' | 'safety' | 'comfort')[];
}

export interface ContraindicationAnalysisInput {
  patientId: string;
  proposedTreatment: TreatmentType;
  treatmentParameters?: Record<string, string | number>;
  patientNotes?: string;
}

export interface ProgressMonitoringInput {
  patientId: string;
  treatmentId: string;
  sessionNumber: number;
  photos: TreatmentPhoto[];
  measurements: SkinMeasurement[];
  patientAssessment: PatientAssessment;
  professionalNotes: string;
  complications?: Complication[];
}

export interface OutcomePredictionInput {
  patientId: string;
  treatmentType: TreatmentType;
  treatmentPlan: TreatmentProtocol;
  patientCompliance: 'high' | 'moderate' | 'low';
  environmentalFactors: EnvironmentalFactor[];
}

export interface EnvironmentalFactor {
  factor: string;
  impact: 'positive' | 'negative';
  severity: 'low' | 'moderate' | 'high';
  description: string;
}