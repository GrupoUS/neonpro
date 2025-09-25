/**
 * Healthcare-Specific Chat Types
 */

import { 
  EnhancedChatMessage, 
  EnhancedChatSession, 
  ChatRequest, 
  ChatResponse,
  ConsultationType,
  MedicalSpecialty,
  UrgencyLevel 
} from './chat';

// Clinical chat types
export interface ClinicalChatMessage extends EnhancedChatMessage {
  messageType: 'clinical_consultation' | 'diagnosis' | 'treatment_plan' | 'follow_up' | 'prescription' | 'lab_result';
  clinicalData: ClinicalData;
  assessment: ClinicalAssessment;
  recommendations: ClinicalRecommendation[];
  requiresHumanReview: boolean;
  confidence: number;
}

export interface ClinicalData {
  symptoms: Symptom[];
  vitalSigns?: VitalSigns;
  medicalHistory?: MedicalHistory;
  currentMedications?: Medication[];
  allergies?: Allergy[];
  lifestyleFactors?: LifestyleFactors;
  socialDeterminants?: SocialDeterminants;
}

export interface Symptom {
  id: string;
  name: string;
  severity: SymptomSeverity;
  duration: string;
  onset: string;
  location?: string;
  characteristics?: string[];
  aggravatingFactors?: string[];
  relievingFactors?: string[];
  associatedSymptoms?: string[];
}

export type SymptomSeverity = 'mild' | 'moderate' | 'severe' | 'debilitating';

export interface VitalSigns {
  temperature?: { value: number; unit: 'C' | 'F'; timestamp: string };
  bloodPressure?: { systolic: number; diastolic: number; timestamp: string };
  heartRate?: { value: number; timestamp: string };
  respiratoryRate?: { value: number; timestamp: string };
  oxygenSaturation?: { value: number; timestamp: string };
  weight?: { value: number; unit: 'kg' | 'lbs'; timestamp: string };
  height?: { value: number; unit: 'cm' | 'in'; timestamp: string };
  bloodGlucose?: { value: number; unit: 'mg/dL'; timestamp: string; type: 'fasting' | 'random' | 'postprandial' };
}

export interface MedicalHistory {
  conditions: MedicalCondition[];
  surgeries: SurgicalHistory[];
  hospitalizations: Hospitalization[];
  familyHistory: FamilyMedicalHistory[];
  immunizations: Immunization[];
}

export interface MedicalCondition {
  id: string;
  name: string;
  code: string; // ICD-10 code
  diagnosisDate: string;
  status: 'active' | 'resolved' | 'chronic' | 'in_remission';
  severity: SymptomSeverity;
  treatment?: string;
  notes?: string;
}

export interface SurgicalHistory {
  id: string;
  procedure: string;
  date: string;
  surgeon?: string;
  hospital?: string;
  complications?: string;
  outcome?: string;
}

export interface Hospitalization {
  id: string;
  reason: string;
  admissionDate: string;
  dischargeDate: string;
  hospital: string;
  treatingPhysician?: string;
  procedures?: string[];
  dischargeSummary?: string;
}

export interface FamilyMedicalHistory {
  relationship: string;
  condition: string;
  ageOfOnset?: number;
  status: 'active' | 'resolved';
  notes?: string;
}

export interface Immunization {
  id: string;
  vaccine: string;
  date: string;
  dose: string;
  lotNumber?: string;
  administrator?: string;
  nextDue?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: MedicationRoute;
  startDate: string;
  endDate?: string;
  indication: string;
  prescriber?: string;
  isActive: boolean;
  notes?: string;
}

export type MedicationRoute = 'oral' | 'intravenous' | 'intramuscular' | 'subcutaneous' | 'topical' | 'inhalation' | 'other';

export interface Allergy {
  id: string;
  substance: string;
  type: AllergyType;
  severity: AllergySeverity;
  reaction: string;
  firstObserved: string;
  lastObserved?: string;
  notes?: string;
}

export type AllergyType = 'medication' | 'food' | 'environmental' | 'other';
export type AllergySeverity = 'mild' | 'moderate' | 'severe' | 'life_threatening';

export interface LifestyleFactors {
  smoking?: SmokingStatus;
  alcohol?: AlcoholConsumption;
  diet?: DietType;
  exercise?: ExerciseLevel;
  sleep?: SleepPattern;
  stress?: StressLevel;
  occupation?: string;
  environment?: string;
}

export type SmokingStatus = 'never' | 'former' | 'current';
export type AlcoholConsumption = 'none' | 'occasional' | 'moderate' | 'heavy';
export type DietType = 'regular' | 'vegetarian' | 'vegan' | 'keto' | 'mediterranean' | 'other';
export type ExerciseLevel = 'sedentary' | 'light' | 'moderate' | 'vigorous' | 'very_vigorous';
export type SleepPattern = 'excellent' | 'good' | 'fair' | 'poor';
export type StressLevel = 'low' | 'moderate' | 'high' | 'very_high';

export interface SocialDeterminants {
  education: EducationLevel;
  income: IncomeLevel;
  housing: HousingStatus;
  employment: EmploymentStatus;
  socialSupport: SocialSupportLevel;
  accessToCare: AccessToCareLevel;
  transportation: TransportationAccess;
}

export type EducationLevel = 'less_than_high_school' | 'high_school' | 'some_college' | 'college' | 'graduate';
export type IncomeLevel = 'low' | 'medium' | 'high' | 'very_high';
export type HousingStatus = 'stable' | 'unstable' | 'homeless';
export type EmploymentStatus = 'employed' | 'unemployed' | 'retired' | 'student' | 'disabled';
export type SocialSupportLevel = 'none' | 'limited' | 'moderate' | 'strong';
export type AccessToCareLevel = 'excellent' | 'good' | 'fair' | 'poor' | 'none';
export type TransportationAccess = 'excellent' | 'good' | 'fair' | 'poor' | 'none';

export interface ClinicalAssessment {
  primaryDiagnosis?: string;
  differentialDiagnoses: DifferentialDiagnosis[];
  severity: SymptomSeverity;
  urgency: UrgencyLevel;
  requiresImmediateAttention: boolean;
  recommendedActions: string[];
  redFlags: string[];
  confidence: number;
  aiConfidence: number;
  requiresHumanReview: boolean;
}

export interface DifferentialDiagnosis {
  condition: string;
  probability: number;
  reasoning: string;
  supportingEvidence: string[];
  rulingOutEvidence: string[];
}

export interface ClinicalRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  evidence?: EvidenceLevel;
  timeline?: string;
  cost?: CostEstimate;
  risks?: string[];
  benefits?: string[];
  alternatives?: string[];
  references?: string[];
}

export type RecommendationType = 
  | 'diagnostic_test' 
  | 'medication' 
  | 'procedure' 
  | 'referral' 
  | 'lifestyle_change' 
  | 'follow_up' 
  | 'emergency_care'
  | 'patient_education';

export type EvidenceLevel = 'A' | 'B' | 'C' | 'D' | 'Expert Opinion' | 'Clinical_Experience';

export interface CostEstimate {
  minimum: number;
  maximum: number;
  currency: string;
  insuranceCoverage?: number;
  notes?: string;
}

// Aesthetic chat types
export interface AestheticChatMessage extends EnhancedChatMessage {
  messageType: 'aesthetic_consultation' | 'treatment_planning' | 'before_after' | 'recovery_guidance';
  aestheticData: AestheticData;
  skinAnalysis?: SkinAnalysis;
  treatmentRecommendations: AestheticTreatmentRecommendation[];
  visualAssessment?: VisualAssessment;
}

export interface AestheticData {
  skinType: FitzpatrickScale;
  skinConditions: SkinCondition[];
  aestheticGoals: AestheticGoal[];
  budgetRange: BudgetRange;
  previousTreatments: PreviousTreatment[];
  concerns: AestheticConcern[];
  lifestyle: LifestyleFactors;
  medicalContraindications: string[];
}

export type FitzpatrickScale = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';

export interface SkinCondition {
  id: string;
  name: string;
  severity: SymptomSeverity;
  affectedArea: string;
  duration: string;
  triggers?: string[];
  previousTreatments?: string[];
  notes?: string;
}

export interface AestheticGoal {
  id: string;
  area: string;
  desiredOutcome: string;
  priority: 'low' | 'medium' | 'high';
  timeline: string;
  budget: BudgetRange;
  flexibility: 'flexible' | 'moderate' | 'strict';
}

export interface BudgetRange {
  minimum: number;
  maximum: number;
  currency: string;
  flexible: boolean;
}

export interface PreviousTreatment {
  id: string;
  procedure: string;
  date: string;
  provider: string;
  results: TreatmentResult;
  satisfaction: number; // 1-10
  complications?: string[];
  cost: number;
}

export type TreatmentResult = 'excellent' | 'good' | 'fair' | 'poor' | 'complications';

export interface AestheticConcern {
  id: string;
  concern: string;
  severity: SymptomSeverity;
  impactOnQualityOfLife: number; // 1-10
  duration: string;
  previousAttempts?: string[];
  photos?: string[];
}

export interface SkinAnalysis {
  overallCondition: SkinConditionType;
  concerns: SkinConcern[];
  texture: SkinTexture;
  tone: SkinTone;
  elasticity: SkinElasticity;
  hydration: SkinHydration;
  sunDamage: SunDamageLevel;
  recommendations: string[];
}

export type SkinConditionType = 'excellent' | 'good' | 'fair' | 'poor';
export type SkinTexture = 'smooth' | 'normal' | 'rough' | 'very_rough';
export type SkinTone = 'very_fair' | 'fair' | 'medium' | 'olive' | 'brown' | 'dark_brown';
export type SkinElasticity = 'excellent' | 'good' | 'fair' | 'poor';
export type SkinHydration = 'well_hydrated' | 'normal' | 'dry' | 'very_dry';
export type SunDamageLevel = 'none' | 'minimal' | 'moderate' | 'severe';

export interface SkinConcern {
  concern: string;
  severity: SymptomSeverity;
  location: string;
  description: string;
  recommendedTreatments: string[];
}

export interface VisualAssessment {
  symmetry: SymmetryAssessment;
  proportion: ProportionAssessment;
  harmony: HarmonyAssessment;
  recommendations: string[];
  notes?: string;
}

export interface SymmetryAssessment {
  facial: SymmetryRating;
  overall: SymmetryRating;
  notes?: string;
}

export interface ProportionAssessment {
  facial: ProportionRating;
  body: ProportionRating;
  notes?: string;
}

export interface HarmonyAssessment {
  overall: HarmonyRating;
  notes?: string;
}

export type SymmetryRating = 'excellent' | 'good' | 'fair' | 'poor';
export type ProportionRating = 'ideal' | 'good' | 'acceptable' | 'needs_improvement';
export type HarmonyRating = 'excellent' | 'good' | 'fair' | 'poor';

export interface AestheticTreatmentRecommendation {
  id: string;
  procedure: string;
  description: string;
  suitability: number; // 0-1
  expectedResults: string[];
  timeline: string;
  recovery: RecoveryInfo;
  cost: CostEstimate;
  risks: RiskAssessment;
  alternatives: string[];
  provider?: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
}

export interface RecoveryInfo {
  duration: string;
  downtime: string;
  activityRestrictions: string[];
  followUpAppointments: number;
  expectedResultsTimeline: string;
}

export interface RiskAssessment {
  overallRisk: RiskLevel;
  commonRisks: string[];
  seriousRisks: string[];
  contraindications: string[];
  mitigation: string[];
}

export type RiskLevel = 'minimal' | 'low' | 'moderate' | 'high' | 'very_high';

// Patient education chat types
export interface PatientEducationChatMessage extends EnhancedChatMessage {
  messageType: 'patient_education' | 'health_literacy' | 'treatment_instructions' | 'discharge_instructions';
  educationData: EducationData;
  content: EducationContent;
  comprehension: ComprehensionAssessment;
  followUp: EducationFollowUp;
}

export interface EducationData {
  topic: EducationTopic;
  patientLevel: HealthLiteracyLevel;
  language: string;
  culturalContext?: string;
  learningStyle?: LearningStyle;
  previousKnowledge?: string[];
}

export type EducationTopic = 
  | 'disease_management' 
  | 'medication_instructions' 
  | 'lifestyle_modifications' 
  | 'prevention' 
  | 'treatment_process' 
  | 'recovery_care' 
  | 'symptom_management'
  | 'emergency_preparedness';

export type HealthLiteracyLevel = 'basic' | 'intermediate' | 'advanced';
export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'reading/writing';

export interface EducationContent {
  title: string;
  content: string;
  format: ContentFormat[];
  readingLevel: number; // Grade level
  complexity: ComplexityLevel;
  keyPoints: string[];
  actionItems: string[];
  resources: EducationResource[];
  warnings?: string[];
  contraindications?: string[];
}

export type ContentFormat = 'text' | 'image' | 'video' | 'audio' | 'interactive' | 'infographic';
export type ComplexityLevel = 'simple' | 'moderate' | 'complex';

export interface EducationResource {
  id: string;
  type: ResourceType;
  title: string;
  url?: string;
  description: string;
  language: string;
  credibility: CredibilityLevel;
}

export type ResourceType = 'article' | 'video' | 'website' | 'app' | 'book' | 'pamphlet';
export type CredibilityLevel = 'high' | 'medium' | 'low';

export interface ComprehensionAssessment {
  understanding: number; // 0-1
  confidence: number; // 0-1
  questions: string[];
  misconceptions: string[];
  clarificationNeeded: boolean;
}

export interface EducationFollowUp {
  schedule: FollowUpSchedule;
  milestones: LearningMilestone[];
  assessment: string;
  supportContact: string;
}

export interface FollowUpSchedule {
  immediate: string[];
  shortTerm: string[];
  longTerm: string[];
}

export interface LearningMilestone {
  milestone: string;
  timeframe: string;
  indicators: string[];
  assessment: string;
}

// Emergency chat types
export interface EmergencyChatMessage extends EnhancedChatMessage {
  messageType: 'emergency_triage' | 'emergency_guidance' | 'emergency_response';
  emergencyData: EmergencyData;
  triageLevel: TriageLevel;
  guidance: EmergencyGuidance;
  responsePlan: EmergencyResponsePlan;
}

export interface EmergencyData {
  chiefComplaint: string;
  symptoms: EmergencySymptom[];
  onset: string;
  location: string;
  currentLocation: string;
  contactInfo: EmergencyContactInfo;
  medicalHistory: EmergencyMedicalHistory;
  allergies: EmergencyAllergyInfo;
  currentMedications: string[];
}

export interface EmergencySymptom {
  symptom: string;
  severity: SymptomSeverity;
  duration: string;
  aggravatingFactors?: string[];
  relievingFactors?: string[];
}

export interface EmergencyContactInfo {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface EmergencyMedicalHistory {
  conditions: string[];
  surgeries: string[];
  hospitalizations: string[];
}

export interface EmergencyAllergyInfo {
  allergens: string[];
  reactions: string[];
  severity: AllergySeverity;
}

export type TriageLevel = 'immediate' | 'urgent' | 'delayed' | 'minimal' | 'expectant';

export interface EmergencyGuidance {
  immediateActions: string[];
  whatToExpect: string[];
  whatNotToDo: string[];
  whenToCall: string[];
  whenToGoToER: string[];
  firstAidInstructions?: string[];
  comfortMeasures?: string[];
}

export interface EmergencyResponsePlan {
  recommendedAction: EmergencyAction;
  transportationNeeded: boolean;
  emergencyServicesContacted: boolean;
  estimatedResponseTime?: string;
  nearestFacility?: EmergencyFacility;
  followUpInstructions: string[];
}

export type EmergencyAction = 'call_911' | 'go_to_er' | 'call_doctor' | 'self_care' | 'monitor';

export interface EmergencyFacility {
  name: string;
  type: 'hospital' | 'urgent_care' | 'clinic';
  distance: number;
  address: string;
  phone: string;
  services: string[];
  capabilities: EmergencyCapability[];
}

export type EmergencyCapability = 
  | 'emergency_medicine' 
  | 'trauma' 
  | 'cardiac_care' 
  | 'stroke_care' 
  | 'pediatric_emergency' 
  | 'mental_health'
  | 'surgery';