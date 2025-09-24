/**
 * Aesthetic Clinic Type Definitions
 * Comprehensive type system for aesthetic clinic operations with Brazilian healthcare compliance
 */

// Core Client Profile Types
export interface AestheticClientProfile {
  id: string;
  patient_id: string;
  clinic_id: string;
  personal_info: ClientPersonalInfo;
  treatment_preferences: TreatmentPreferences;
  skin_analysis: SkinAnalysis;
  medical_history: AestheticMedicalHistory;
  aesthetic_concerns: AestheticConcern[];
  communication_preferences: CommunicationPreferences;
  financial_data: FinancialData;
  privacy_settings: PrivacySettings;
  retention_metrics: AestheticClientRetentionMetrics;
  created_at: string;
  updated_at: string;
}

export interface ClientPersonalInfo {
  fullName: string;
  email?: string;
  phone: string;
  dateOfBirth: string;
  cpf?: string;
  rg?: string;
  gender?: string;
  nationality: string;
  occupation?: string;
  emergencyContact: EmergencyContact;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface TreatmentPreferences {
  preferredTreatments: string[];
  treatmentGoals: string[];
  budgetRange: {
    min: number;
    max: number;
  };
  preferredProviders: string[];
  availability: AvailabilityPreferences;
}

export interface AvailabilityPreferences {
  preferredDays: string[];
  preferredTimes: string[];
  flexibility: 'high' | 'medium' | 'low';
  lastMinuteAvailability: boolean;
}

export interface SkinAnalysis {
  skinType: 'oily' | 'dry' | 'combination' | 'sensitive' | 'normal';
  skinConditions: SkinCondition[];
  concerns: SkinConcern[];
  allergies: string[];
  previousTreatments: PreviousTreatment[];
  photos: SkinPhoto[];
  assessmentDate: string;
}

export interface SkinCondition {
  condition: string;
  severity: 'mild' | 'moderate' | 'severe';
  diagnosed: boolean;
  treatment: string;
}

export interface SkinConcern {
  concern: string;
  priority: 'high' | 'medium' | 'low';
  duration: string;
  impact: 'cosmetic' | 'functional';
}

export interface PreviousTreatment {
  treatment: string;
  date: string;
  provider: string;
  results: string;
  complications?: string;
}

export interface SkinPhoto {
  id: string;
  url: string;
  type: 'front' | 'side' | 'closeup' | 'before' | 'after';
  date: string;
  consent: PhotoConsent;
}

export interface PhotoConsent {
  given: boolean;
  date: string;
  purpose: 'treatment' | 'progress' | 'marketing' | 'education';
  expiration?: string;
}

export interface AestheticMedicalHistory {
  allergies: Allergy[];
  medications: Medication[];
  medicalConditions: MedicalCondition[];
  surgicalHistory: SurgicalProcedure[];
  familyHistory: FamilyMedicalHistory;
  lifestyleFactors: LifestyleFactors;
}

export interface Allergy {
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
  onset: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  purpose: string;
  startDate: string;
  endDate?: string;
}

export interface MedicalCondition {
  condition: string;
  diagnosed: string;
  severity: 'mild' | 'moderate' | 'severe';
  treatment: string;
  controlled: boolean;
}

export interface SurgicalProcedure {
  procedure: string;
  date: string;
  provider: string;
  complications?: string;
}

export interface FamilyMedicalHistory {
  conditions: FamilyCondition[];
  geneticDisorders: string[];
}

export interface FamilyCondition {
  condition: string;
  relationship: string;
  ageOfOnset?: number;
}

export interface LifestyleFactors {
  smoking: SmokingStatus;
  alcohol: AlcoholStatus;
  sunExposure: SunExposureLevel;
  diet: DietType;
  exercise: ExerciseFrequency;
  stress: StressLevel;
  sleep: SleepPattern;
}

type SmokingStatus = 'never' | 'former' | 'current';
type AlcoholStatus = 'never' | 'occasional' | 'moderate' | 'frequent';
type SunExposureLevel = 'minimal' | 'moderate' | 'high' | 'very-high';
type DietType = 'balanced' | 'vegetarian' | 'vegan' | 'keto' | 'mediterranean' | 'other';
type ExerciseFrequency = 'sedentary' | 'light' | 'moderate' | 'intense';
type StressLevel = 'low' | 'moderate' | 'high';
type SleepPattern = 'excellent' | 'good' | 'fair' | 'poor';

export interface AestheticConcern {
  area: string;
  concern: string;
  severity: number; // 1-10 scale
  duration: string;
  previousTreatments: string[];
  goals: string[];
  expectations: string[];
}

export interface CommunicationPreferences {
  preferredChannel: 'whatsapp' | 'email' | 'sms' | 'phone';
  language: 'pt-BR' | 'en-US';
  notificationFrequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
  marketingConsent: boolean;
  appointmentReminders: boolean;
  followUpMessages: boolean;
}

export interface FinancialData {
  paymentMethods: PaymentMethod[];
  insuranceProvider?: string;
  insurancePlan?: string;
  paymentHistory: PaymentRecord[];
  creditInformation?: CreditInformation;
}

export interface PaymentMethod {
  type: 'credit_card' | 'debit_card' | 'cash' | 'installment' | 'financing';
  cardNumber?: string; // Encrypted
  expiryDate?: string;
  bank?: string;
  preferred: boolean;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  description: string;
}

export interface CreditInformation {
  creditScore?: number;
  approvedLimit?: number;
  creditHistory: CreditHistoryEntry[];
}

export interface CreditHistoryEntry {
  date: string;
  action: 'inquiry' | 'approval' | 'rejection';
  amount?: number;
  institution: string;
  result: string;
}

export interface PrivacySettings {
  consentGiven: boolean;
  dataProcessingAccepted: boolean;
  marketingConsent: boolean;
  dataRetention: number; // Days
  photoUsageConsent: PhotoUsageConsent;
  thirdPartySharing: ThirdPartySharingSettings;
  rightToBeForgotten: boolean;
  dataPortability: boolean;
  dataCorrection: boolean;
  consentDate: string;
  consentVersion: string;
}

export interface PhotoUsageConsent {
  treatment: boolean;
  education: boolean;
  marketing: boolean;
  research: boolean;
  expiration?: string;
}

export interface ThirdPartySharingSettings {
  laboratories: boolean;
  specialists: boolean;
  insurance: boolean;
  research: boolean;
}

export interface AestheticClientRetentionMetrics {
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number; // 0-100
  factors: {
    demographics: number;
    behavior: number;
    treatment: number;
    financial: number;
  };
  nextAssessmentDate: string;
  interventions: RetentionIntervention[];
  engagementScore: number; // 0-100
  lastTreatmentDate?: string;
  lifetimeValue: number;
  churnProbability: number; // 0-1
}

export interface RetentionIntervention {
  id: string;
  type: 'communication' | 'incentive' | 'follow_up' | 'education';
  status: 'pending' | 'sent' | 'responded' | 'completed';
  date: string;
  message: string;
  response?: string;
  outcome: string;
}

// Treatment Management Types
export interface AestheticTreatment {
  id: string;
  clinic_id: string;
  client_id: string;
  treatment_type: string;
  treatment_category: string;
  provider_id: string;
  scheduled_date: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'paused' | 'failed';
  treatment_plan: TreatmentPlan;
  before_photo?: string;
  after_photo?: string;
  expected_outcomes: string[];
  actual_outcomes?: string[];
  contraindications: string[];
  complications?: string[];
  cost: number;
  payment_status: 'pending' | 'partial' | 'paid' | 'overdue' | 'refunded';
  anvisa_protocol: ANVISAProtocol;
  compliance_data: ANVISAComplianceData;
  sessions_completed: number;
  total_sessions: number;
  next_session_date?: string;
  satisfaction_score?: number; // 1-5
  follow_up_required: boolean;
  follow_up_date?: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface TreatmentPlan {
  procedures: TreatmentProcedure[];
  products: TreatmentProduct[];
  timeline: TreatmentTimeline;
  risks: TreatmentRisk[];
  aftercare: AftercareInstructions;
  expectedResults: ExpectedResults;
  alternatives: AlternativeTreatment[];
}

export interface TreatmentProcedure {
  name: string;
  description: string;
  technique: string;
  duration: number; // minutes
  anesthesia: 'none' | 'local' | 'topical' | 'sedation';
  provider_requirements: string[];
  equipment: string[];
}

export interface TreatmentProduct {
  name: string;
  brand: string;
  anvisa_registration: string;
  quantity: number;
  dosage: string;
  application_method: string;
}

export interface TreatmentTimeline {
  total_sessions: number;
  session_interval: number; // days
  expected_completion: string;
  milestones: TimelineMilestone[];
}

export interface TimelineMilestone {
  session: number;
  date: string;
  goal: string;
  assessment_required: boolean;
}

export interface TreatmentRisk {
  risk: string;
  probability: 'low' | 'medium' | 'high';
  severity: 'mild' | 'moderate' | 'severe';
  mitigation: string;
}

export interface AftercareInstructions {
  immediate_care: string[];
  restrictions: string[];
  medications: AftercareMedication[];
  follow_up: string[];
  emergency_instructions: string[];
}

export interface AftercareMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  purpose: string;
}

export interface ExpectedResults {
  timeline: string[];
  improvements: string[];
  limitations: string[];
  maintenance_required: string[];
  longevity: string;
}

export interface AlternativeTreatment {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  cost_comparison: number;
}

export interface ANVISAProtocol {
  protocol_number?: string;
  registration_number?: string;
  safety_guidelines: string[];
  contraindications: string[];
  required_equipment: string[];
  quality_standards: string[];
}

export interface ANVISAComplianceData {
  anvisa_registered: boolean;
  protocol_followed: boolean;
  safety_checks: boolean;
  documentation_complete: boolean;
  provider_qualified: boolean;
  last_validated: string;
  validation_score: number; // 0-100
  violations: ComplianceViolation[];
}

export interface ComplianceViolation {
  type: 'documentation' | 'safety' | 'protocol' | 'qualification';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  date: string;
  resolved: boolean;
  resolution_date?: string;
}

// Session Management Types
export interface AestheticTreatmentSession {
  id: string;
  treatment_id: string;
  session_number: number;
  date: string;
  provider_id: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  duration: number; // minutes
  procedures_performed: string[];
  products_used: string[];
  photos_taken: SessionPhoto[];
  notes: string;
  complications?: string;
  patient_feedback: PatientFeedback;
  provider_assessment: ProviderAssessment;
  next_session_plan: string;
  created_at: string;
}

export interface SessionPhoto {
  id: string;
  url: string;
  type: 'before' | 'during' | 'after';
  angle: string;
  lighting: string;
  distance: string;
  timestamp: string;
}

export interface PatientFeedback {
  pain_level: number; // 0-10
  satisfaction: number; // 1-5
  comfort_level: number; // 1-5
  comments: string;
  side_effects?: string[];
}

export interface ProviderAssessment {
  procedure_success: boolean;
  patient_cooperation: 'excellent' | 'good' | 'fair' | 'poor';
  complications: string[];
  adjustments_made: string[];
  recommendations: string[];
  session_rating: number; // 1-5
}

// Photo Assessment Types
export interface AestheticPhotoAssessment {
  id: string;
  client_id: string;
  treatment_id?: string;
  session_id?: string;
  photo_type: 'before' | 'during' | 'after' | 'follow_up';
  photo_url: string;
  assessment_date: string;
  ai_analysis?: AIAnalysisResult;
  provider_assessment?: ProviderPhotoAssessment;
  comparison_results?: ComparisonResult[];
  consent_record: string;
  created_at: string;
}

export interface AIAnalysisResult {
  skin_quality_metrics: SkinQualityMetrics;
  treatment_progress: TreatmentProgress;
  concerns_identified: string[];
  recommendations: string[];
  confidence_score: number;
  analysis_method: string;
}

export interface SkinQualityMetrics {
  texture_score: number;
  tone_uniformity: number;
  elasticity: number;
  hydration_level: number;
  pigment_score: number;
  wrinkle_depth: number;
  overall_score: number;
}

export interface TreatmentProgress {
  improvement_percentage: number;
  areas_improved: string[];
  areas_needing_attention: string[];
  progress_velocity: 'slow' | 'expected' | 'rapid';
  expected_timeline: string;
}

export interface ProviderPhotoAssessment {
  overall_assessment: string;
  specific_observations: string[];
  satisfaction_level: number;
  adjustment_recommendations: string[];
  follow_up_actions: string[];
}

export interface ComparisonResult {
  comparison_with: string; // Reference photo ID
  differences: string[];
  improvements: string[];
  areas_of_concern: string[];
  overall_progress: number; // -100 to 100
}

// Treatment Catalog Types
export interface AestheticTreatmentCatalog {
  id: string;
  clinic_id: string;
  name: string;
  category: string;
  description: string;
  duration: number; // minutes
  base_price: number;
  anvisa_registration?: string;
  requirements: TreatmentRequirement[];
  contraindications: string[];
  expected_results: string[];
  recovery_time: string;
  pain_level: number; // 0-10
  popularity_score: number;
  availability: boolean;
  provider_requirements: string[];
  equipment_required: string[];
  photos: string[];
  videos: string[];
  faq: FAQ[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TreatmentRequirement {
  type: 'age' | 'medical' | 'skin_type' | 'pregnancy' | 'medication';
  condition: string;
  mandatory: boolean;
  description: string;
}

export interface FAQ {
  question: string;
  answer: string;
  category: string;
  priority: number;
}

// Financial Types
export interface AestheticFinancialTransaction {
  id: string;
  clinic_id: string;
  client_id: string;
  treatment_id?: string;
  type: 'payment' | 'refund' | 'credit' | 'adjustment';
  amount: number;
  method: string;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  description: string;
  invoice_id?: string;
  installments?: InstallmentInfo;
  created_at: string;
  processed_at?: string;
}

export interface InstallmentInfo {
  total_installments: number;
  current_installment: number;
  installment_amount: number;
  next_payment_date?: string;
  payment_history: InstallmentPayment[];
}

export interface InstallmentPayment {
  installment_number: number;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
  method: string;
}

// Analytics and Reporting Types
export interface AestheticClientEngagementMetrics {
  client_id: string;
  period: string;
  appointment_attendance_rate: number;
  communication_response_rate: number;
  treatment_compliance_rate: number;
  satisfaction_score: number;
  referral_count: number;
  social_media_engagement: number;
  feedback_frequency: number;
  engagement_score: number; // 0-100
}

export interface AestheticTreatmentOutcomes {
  treatment_id: string;
  patient_satisfaction: number;
  provider_satisfaction: number;
  clinical_outcome: number;
  complication_rate: number;
  recovery_time_actual: number;
  recovery_time_expected: number;
  cost_efficiency: number;
  overall_success: boolean;
  lessons_learned: string[];
}

// Device and Product Management
export interface AestheticDeviceData {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  serial_number: string;
  anvisa_registration: string;
  maintenance_schedule: MaintenanceSchedule[];
  usage_statistics: UsageStatistics;
  calibration_records: CalibrationRecord[];
  safety_certifications: SafetyCertification[];
  status: 'active' | 'maintenance' | 'retired' | 'decommissioned';
}

export interface MaintenanceSchedule {
  type: string;
  frequency: string;
  last_performed: string;
  next_due: string;
  performed_by: string;
  notes: string;
}

export interface UsageStatistics {
  total_hours: number;
  total_sessions: number;
  success_rate: number;
  error_rate: number;
  last_used: string;
}

export interface CalibrationRecord {
  date: string;
  performed_by: string;
  results: string;
  next_calibration: string;
  certificate_number?: string;
}

export interface SafetyCertification {
  type: string;
  issued_by: string;
  issue_date: string;
  expiry_date: string;
  certificate_number: string;
}

export interface AestheticProductInventory {
  id: string;
  product_name: string;
  brand: string;
  anvisa_registration: string;
  category: string;
  current_stock: number;
  minimum_stock: number;
  unit_cost: number;
  unit_price: number;
  expiry_date: string;
  storage_requirements: string[];
  supplier: string;
  batch_number: string;
  received_date: string;
  last_inventory_check: string;
}

// Provider Management
export interface AestheticProviderSpecialization {
  id: string;
  provider_id: string;
  clinic_id: string;
  specializations: Specialization[];
  certifications: Certification[];
  training_records: TrainingRecord[];
  performance_metrics: PerformanceMetrics;
  availability: ProviderAvailability[];
  treatment_preferences: string[];
  patient_satisfaction_avg: number;
  complication_rate: number;
  created_at: string;
  updated_at: string;
}

export interface Specialization {
  field: string;
  level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  certified: boolean;
  certification_date?: string;
  experience_years: number;
}

export interface Certification {
  name: string;
  issuing_organization: string;
  issue_date: string;
  expiry_date: string;
  certificate_number: string;
  verification_url?: string;
}

export interface TrainingRecord {
  program: string;
  institution: string;
  completion_date: string;
  duration: string;
  certificate_url?: string;
  skills_acquired: string[];
}

export interface PerformanceMetrics {
  treatments_performed: number;
  average_rating: number;
  complication_rate: number;
  patient_retention: number;
  revenue_generated: number;
  efficiency_score: number;
}

export interface ProviderAvailability {
  day_of_week: string;
  start_time: string;
  end_time: string;
  break_times: TimeSlot[];
  max_appointments: number;
  available_for_emergencies: boolean;
}

export interface TimeSlot {
  start: string;
  end: string;
}

// Workflow and Process Types
export interface AestheticTreatmentWorkflow {
  id: string;
  treatment_type: string;
  steps: WorkflowStep[];
  requirements: WorkflowRequirement[];
  quality_checks: QualityCheck[];
  documentation_requirements: DocumentationRequirement[];
  safety_protocols: SafetyProtocol[];
  emergency_procedures: EmergencyProcedure[];
}

export interface WorkflowStep {
  step_number: number;
  name: string;
  description: string;
  duration: number;
  required_skills: string[];
  required_equipment: string[];
  dependencies: string[];
  quality_standards: string[];
}

export interface WorkflowRequirement {
  type: 'pre_condition' | 'resource' | 'personnel' | 'environment';
  description: string;
  mandatory: boolean;
  verification_method: string;
}

export interface QualityCheck {
  checkpoint: string;
  criteria: string[];
  method: string;
  frequency: string;
  responsible_role: string;
  documentation_required: boolean;
}

export interface DocumentationRequirement {
  document_type: string;
  content_required: string[];
  format: string;
  retention_period: string;
  access_level: string;
}

export interface SafetyProtocol {
  risk_area: string;
  preventive_measures: string[];
  emergency_response: string[];
  required_training: string[];
  equipment_needed: string[];
}

export interface EmergencyProcedure {
  emergency_type: string;
  immediate_actions: string[];
  personnel_required: string[];
  equipment_required: string[];
  communication_protocol: string[];
  follow_up_procedures: string[];
}

// Request and Response Types
export interface CreateAestheticClientProfileRequest {
  personalInfo: ClientPersonalInfo;
  treatmentPreferences: TreatmentPreferences;
  skinAnalysis: SkinAnalysis;
  medicalHistory: AestheticMedicalHistory;
  aestheticConcerns: AestheticConcern[];
  communicationPreferences: CommunicationPreferences;
  financialData: FinancialData;
  privacySettings: PrivacySettings;
  createdBy?: string;
}

export interface UpdateAestheticClientProfileRequest {
  personalInfo?: Partial<ClientPersonalInfo>;
  treatmentPreferences?: Partial<TreatmentPreferences>;
  skinAnalysis?: Partial<SkinAnalysis>;
  medicalHistory?: Partial<AestheticMedicalHistory>;
  aestheticConcerns?: AestheticConcern[];
  communicationPreferences?: Partial<CommunicationPreferences>;
  financialData?: Partial<FinancialData>;
  privacySettings?: Partial<PrivacySettings>;
  updatedBy?: string;
}

export interface CreateAestheticTreatmentRequest {
  clientId: string;
  treatmentType: string;
  treatmentCategory: string;
  providerId: string;
  scheduledDate: Date;
  treatmentPlan: TreatmentPlan;
  beforePhoto?: string;
  expectedOutcomes: string[];
  contraindications: string[];
  cost: number;
  paymentStatus?: string;
  anvisaProtocol: ANVISAProtocol;
  createdBy?: string;
}

export interface UpdateAestheticTreatmentRequest {
  status?: string;
  treatmentPlan?: TreatmentPlan;
  afterPhoto?: string;
  actualOutcomes?: string[];
  complications?: string[];
  cost?: number;
  paymentStatus?: string;
  satisfaction_score?: number;
  follow_up_required?: boolean;
  follow_up_date?: string;
  notes?: string;
  updatedBy?: string;
}

export interface CreateAestheticTreatmentPlanRequest {
  clientId: string;
  treatmentType: string;
  providerId: string;
  goals: string[];
  timeline: TreatmentTimeline;
  estimated_cost: number;
  special_instructions?: string;
}

export interface CreateAestheticTreatmentSessionRequest {
  treatmentId: string;
  sessionNumber: number;
  providerId: string;
  scheduledDate: Date;
  duration: number;
  procedures_planned: string[];
  products_planned: string[];
  notes?: string;
}

// Search and Query Types
export interface AestheticClientSearchCriteria {
  query?: string;
  skinType?: string;
  treatmentType?: string;
  retentionRisk?: 'low' | 'medium' | 'high';
  registrationDateRange?: {
    start: Date;
    end: Date;
  };
  lastVisitDateRange?: {
    start: Date;
    end: Date;
  };
  treatmentStatus?: string;
  providerId?: string;
}

export interface AestheticTreatmentSearchCriteria {
  client_id?: string;
  provider_id?: string;
  treatment_type?: string;
  status?: string;
  category?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  costRange?: {
    min: number;
    max: number;
  };
  anvisa_compliant?: boolean;
}

export interface AestheticAnalyticsQuery {
  dateRange: {
    start: Date;
    end: Date;
  };
  metrics: string[];
  groupBy?: string;
  filters?: Record<string, any>;
}

// AI and Recommendation Types
export interface AestheticTreatmentRecommendation {
  client_id: string;
  recommended_treatments: RecommendedTreatment[];
  confidence_score: number;
  reasoning: string[];
  contraindications: string[];
  alternatives: string[];
  estimated_outcomes: string[];
}

export interface RecommendedTreatment {
  treatment_type: string;
  category: string;
  priority_score: number;
  expected_results: string[];
  estimated_cost: number;
  recovery_time: string;
  provider_recommendation: string;
}

// Compliance and Validation Types
export interface AestheticComplianceValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  complianceScore: number;
  recommendations: string[];
  lastValidated: string;
}

export interface LGPDDataHandlingConfig {
  encryption_enabled: boolean;
  data_retention_days: number;
  automatic_anonymization: boolean;
  consent_required: boolean;
  audit_logging: boolean;
  right_to_forgotten_enabled: boolean;
  data_portability_enabled: boolean;
  breach_detection_enabled: boolean;
}

export interface ANVISAComplianceData {
  anvisa_registered: boolean;
  protocol_followed: boolean;
  safety_checks: boolean;
  documentation_complete: boolean;
  provider_qualified: boolean;
  last_validated: string;
  validation_score: number;
}

export interface CFMComplianceData {
  cfm_licensed: boolean;
  ethics_compliant: boolean;
  telemedicine_authorized: boolean;
  documentation_complete: boolean;
  peer_review_required: boolean;
  last_validated: string;
  validation_score: number;
}

// Assessment and Evaluation Types
export interface AestheticClientAssessment {
  id: string;
  client_id: string;
  assessment_type: 'initial' | 'follow_up' | 'pre_treatment' | 'post_treatment';
  assessment_date: string;
  assessor_id: string;
  findings: AssessmentFinding[];
  recommendations: AssessmentRecommendation[];
  risk_assessment: RiskAssessment;
  treatment_plan_adjustments: string[];
  next_assessment_date: string;
  created_at: string;
}

export interface AssessmentFinding {
  category: string;
  finding: string;
  severity: 'low' | 'medium' | 'high';
  evidence: string;
  impact: 'minimal' | 'moderate' | 'significant';
}

export interface AssessmentRecommendation {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  recommendation: string;
  rationale: string;
  expected_outcome: string;
  timeframe: string;
  required_actions: string[];
}

export interface RiskAssessment {
  overall_risk_level: 'low' | 'medium' | 'high';
  risk_factors: RiskFactor[];
  mitigation_strategies: string[];
  monitoring_required: boolean;
  follow_up_frequency: string;
}

export interface RiskFactor {
  factor: string;
  level: 'low' | 'medium' | 'high';
  likelihood: 'rare' | 'unlikely' | 'possible' | 'likely' | 'certain';
  impact: 'minimal' | 'moderate' | 'significant' | 'severe';
  mitigation: string;
}

// Appointment and Scheduling Types
export interface AestheticAppointmentPreferences {
  preferred_days: string[];
  preferred_times: string[];
  preferred_provider?: string;
  flexibility_level: 'high' | 'medium' | 'low';
  advance_booking_days: number;
  reminder_preferences: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
    advance_notice: number; // hours
  };
  cancellation_policy: string;
  no_show_policy: string;
}
