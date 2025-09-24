/**
 * Enhanced AG-UI Protocol Extension for Aesthetic Clinics
 *
 * Extends the base AG-UI protocol with specialized message types, data structures,
 * and communication patterns for aesthetic clinic operations with Brazilian healthcare compliance.
 */

import {
  AguiAction,
  AguiErrorCode,
  AguiMessage,
  AguiMessageMetadata,
  AguiMessageType,
  AguiSource,
  AISuggestion,
  ValidationResult,
} from './types';

// =====================================
// AESTHETIC CLINIC-SPECIFIC MESSAGE TYPES
// =====================================

export type AestheticAguiMessageType =
  | AguiMessageType
  | // Treatment Management
  'treatment_catalog_query'
  | 'treatment_availability_check'
  | 'treatment_scheduling_request'
  | 'treatment_consent_management'
  | 'treatment_plan_creation'
  | 'treatment_progress_update'
  | 'treatment_outcome_assessment'
  | 'treatment_inventory_management'
  | // Appointment & Scheduling
  'appointment_optimization_request'
  | 'appointment_conflict_detection'
  | 'appointment_reminder_customization'
  | 'appointment_no_show_prediction'
  | 'appointment_rescheduling_logic'
  | 'appointment_capacity_analysis'
  | // Financial Operations
  'financial_treatment_pricing'
  | 'financial_package_creation'
  | 'financial_installment_planning'
  | 'financial_promotion_application'
  | 'financial_revenue_forecasting'
  | 'financial_fraud_detection'
  | 'financial_compliance_validation'
  | // Aesthetic-Specific Analytics
  'analytics_treatment_popularity'
  | 'analytics_client_retention_aesthetic'
  | 'analytics_revenue_per_treatment'
  | 'analytics_seasonal_trends'
  | 'analytics_professional_performance'
  | 'analytics_equipment_utilization'
  | // Compliance & Security
  'compliance_anvisa_validation'
  | 'compliance_cfm_verification'
  | 'compliance_lgpd_audit'
  | 'compliance_document_verification'
  | 'compliance_emergency_protocols'
  | // Enhanced Client Features
  'client_aesthetic_profile'
  | 'client_treatment_history_detailed'
  | 'client_skin_assessment'
  | 'client_allergy_tracking'
  | 'client_photo_consent_management'
  | 'client_satisfaction_tracking'
  | // Real-time Operations
  'realtime_inventory_update'
  | 'realtime_equipment_status'
  | 'realtime_room_availability'
  | 'realtime_staff_scheduling'
  | 'realtime_emergency_alert';

// =====================================
// AESTHETIC TREATMENT DATA MODELS
// =====================================

export interface AestheticTreatment {
  id: string;
  name: string;
  category: TreatmentCategory;
  description: string;
  basePrice: number;
  currency: 'BRL' | 'USD' | 'EUR';
  durationMinutes: number;
  recoveryTimeDays?: number;
  requiredSessions?: number;
  contraindications: string[];
  benefits: string[];
  sideEffects: string[];
  anvisaRegistration?: string;
  equipmentRequired?: string[];
  professionalLevelRequired: 'basic' | 'intermediate' | 'advanced';
  skinTypes?: SkinType[];
  ageGroups?: AgeGroup[];
  seasons?: Season[];
  popularity: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TreatmentCategory =
  | 'injectables' // Botox, fillers
  | 'laser_treatments' // Hair removal, skin rejuvenation
  | 'chemical_peels' // Various acid treatments
  | 'skincare' // Facials, cleansing
  | 'body_treatments' // Massage, lymphatic drainage
  | 'hair_treatments' // Hair restoration, treatments
  | 'nail_care' // Manicure, pedicure
  | 'permanent_makeup' // Microblading, micropigmentation
  | 'non_surgical_face' // Radiofrequency, ultrasound
  | 'wellness'; // Relaxation, stress reduction;

export type SkinType =
  | 'I' // Very fair, always burns, never tans
  | 'II' // Fair, burns easily, tans minimally
  | 'III' // Light, sometimes burns, tans gradually
  | 'IV' // Olive, burns minimally, tans easily
  | 'V' // Brown, rarely burns, tans darkly
  | 'VI'; // Dark, never burns, always tans darkly

export type AgeGroup =
  | 'adolescent' // 13-17
  | 'young_adult' // 18-25
  | 'adult' // 26-40
  | 'middle_age' // 41-60
  | 'senior'; // 61+

export type Season = 'summer' | 'winter' | 'spring' | 'fall';

export interface TreatmentPackage {
  id: string;
  name: string;
  description: string;
  treatments: Array<{
    treatmentId: string;
    sessions: number;
    pricePerSession: number;
  }>;
  totalPackagePrice: number;
  discountPercentage: number;
  validityDays: number;
  installmentOptions: InstallmentOption[];
  promotionalTerms?: string;
  isActive: boolean;
}

export interface InstallmentOption {
  installments: number;
  interestRate: number;
  monthlyAmount: number;
  totalAmount: number;
  cardBrands: string[];
}

// =====================================
// ENHANCED APPOINTMENT SYSTEM
// =====================================

export interface AestheticAppointment {
  id: string;
  clientId: string;
  professionalId: string;
  treatmentId: string;
  roomId?: string;
  scheduledAt: string;
  estimatedDuration: number;
  status: AppointmentStatus;
  priority: AppointmentPriority;
  notes?: string;
  preAppointmentInstructions?: string[];
  postAppointmentInstructions?: string[];
  contraindications?: string[];
  specialRequirements?: string;
  photoConsentGiven: boolean;
  confidentialityLevel: 'standard' | 'enhanced' | 'maximum';
  totalAmount: number;
  paymentStatus: PaymentStatus;
  installmentPlan?: InstallmentPlan;
  noShowPrediction?: NoShowPrediction;
  optimizationScore?: number;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'rescheduled'
  | 'waiting_list';

export type AppointmentPriority = 'low' | 'normal' | 'high' | 'urgent';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded' | 'overdue';

export interface InstallmentPlan {
  totalAmount: number;
  paidAmount: number;
  installments: number;
  paidInstallments: number;
  nextPaymentDate: string;
  paymentMethod: 'credit_card' | 'debit_card' | 'pix' | 'cash';
  installmentAmount: number;
  dueDates: string[];
  status: 'active' | 'completed' | 'defaulted';
}

export interface NoShowPrediction {
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number; // 0-1
  factors: RiskFactor[];
  recommendations: string[];
  lastUpdated: string;
}

export interface RiskFactor {
  factor: string;
  impact: 'positive' | 'negative';
  weight: number;
  description: string;
  value: any;
}

// =====================================
// ENHANCED CLIENT PROFILE FOR AESTHETICS
// =====================================

export interface AestheticClientProfile {
  id: string;
  clientId: string;
  skinAssessment: SkinAssessment;
  treatmentHistory: AestheticTreatmentHistory[];
  preferences: ClientAestheticPreferences;
  allergies: AestheticAllergy[];
  contraindications: MedicalContraindication[];
  photoConsent: PhotoConsentRecord;
  satisfactionHistory: SatisfactionRecord[];
  budgetRange: {
    minimum: number;
    maximum: number;
    preferredPayment: string[];
  };
  aestheticGoals: AestheticGoal[];
  skinType: SkinType;
  concerns: SkinConcern[];
  previousComplications?: string[];
  preferredProfessionals: string[];
  communication: ClientAestheticCommunication;
  createdAt: string;
  updatedAt: string;
}

export interface SkinAssessment {
  type: SkinType;
  conditions: SkinCondition[];
  sensitivities: string[];
  currentConcerns: SkinConcern[];
  previousTreatments: string[];
  assessmentDate: string;
  assessedBy: string;
  nextAssessmentDate?: string;
  photos?: SkinAssessmentPhoto[];
}

export interface SkinCondition {
  condition: string;
  severity: 'mild' | 'moderate' | 'severe';
  affectedAreas: string[];
  duration?: string;
  treatment?: string;
  isActive: boolean;
}

export type SkinConcern =
  | 'acne'
  | 'aging'
  | 'pigmentation'
  | 'dryness'
  | 'oiliness'
  | 'sensitivity'
  | 'wrinkles'
  | 'scars'
  | 'redness'
  | 'uneven_texture'
  | 'pores'
  | 'dark_circles'
  | 'loss_of_elasticity'
  | 'stretch_marks';

export interface SkinAssessmentPhoto {
  id: string;
  url: string;
  date: string;
  angle: 'front' | 'left' | 'right' | 'close_up';
  lighting: 'natural' | 'studio' | 'mixed';
  notes?: string;
  consentGiven: boolean;
}

export interface AestheticTreatmentHistory {
  treatmentId: string;
  treatmentName: string;
  dates: string[];
  professionalId: string;
  results: TreatmentResult[];
  satisfaction: number; // 1-5
  sideEffects?: string[];
  notes?: string;
  totalInvested: number;
}

export interface TreatmentResult {
  area: string;
  beforePhoto?: string;
  afterPhoto?: string;
  satisfaction: number;
  duration: string;
  notes?: string;
}

export interface AestheticAllergy {
  substance: string;
  severity: 'mild' | 'moderate' | 'severe';
  reaction: string;
  firstIdentified: string;
  lastExposure?: string;
  treatmentReceived?: string;
}

export interface MedicalContraindication {
  condition: string;
  severity: 'absolute' | 'relative';
  explanation: string;
  identifiedDate: string;
  identifiedBy: string;
  documentation?: string;
}

export interface PhotoConsentRecord {
  consentGiven: boolean;
  consentDate: string;
  consentVersion: string;
  restrictions: string[];
  expirationDate?: string;
  withdrawalDate?: string;
  digitalSignature?: string;
}

export interface SatisfactionRecord {
  appointmentId: string;
  treatmentId: string;
  satisfaction: number; // 1-5
  comments?: string;
  areasForImprovement?: string[];
  recommendationsForOthers?: string;
  date: string;
}

export interface AestheticGoal {
  goal: string;
  priority: 'low' | 'medium' | 'high';
  targetDate?: string;
  progress: number; // 0-100
  treatmentsPlanned: string[];
  estimatedBudget?: number;
  status: 'active' | 'achieved' | 'paused' | 'cancelled';
}

export interface ClientAestheticCommunication {
  preferredLanguage: 'pt-BR' | 'en-US';
  appointmentReminders: {
    enabled: boolean;
    methods: ('whatsapp' | 'sms' | 'email')[];
    timing: number; // hours before
  };
  promotionalMessages: {
    enabled: boolean;
    frequency: 'weekly' | 'monthly' | 'quarterly';
    interests: string[];
  };
  resultUpdates: {
    enabled: boolean;
    includePhotos: boolean;
  };
}

// =====================================
// FINANCIAL OPERATIONS FOR AESTHETICS
// =====================================

export interface AestheticFinancialOperation {
  id: string;
  type: FinancialOperationType;
  clientId: string;
  appointmentId?: string;
  treatmentId?: string;
  amount: number;
  currency: 'BRL';
  paymentMethod: PaymentMethod;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  installmentInfo?: InstallmentInfo;
  discountApplied?: DiscountInfo;
  promotionApplied?: PromotionInfo;
  staffCommission?: StaffCommission;
  metadata: FinancialMetadata;
  createdAt: string;
  processedAt?: string;
}

export type FinancialOperationType =
  | 'treatment_payment'
  | 'package_purchase'
  | 'deposit'
  | 'installment_payment'
  | 'refund'
  | 'cancellation_fee'
  | 'no_show_fee'
  | 'product_purchase'
  | 'membership_fee';

export type PaymentMethod = 'credit_card' | 'debit_card' | 'pix' | 'cash' | 'bank_transfer';

export interface InstallmentInfo {
  totalInstallments: number;
  currentInstallment: number;
  installmentAmount: number;
  totalAmount: number;
  nextDueDate: string;
  status: 'active' | 'completed' | 'late';
}

export interface DiscountInfo {
  type: 'percentage' | 'fixed_amount';
  value: number;
  reason: string;
  authorizedBy: string;
}

export interface PromotionInfo {
  promotionId: string;
  name: string;
  discountType: 'percentage' | 'fixed_amount' | 'buy_x_get_y';
  discountValue: number;
  conditions: string[];
}

export interface StaffCommission {
  professionalId: string;
  commissionType: 'percentage' | 'fixed_amount';
  commissionValue: number;
  calculatedOn: number; // Amount commission is based on
  status: 'pending' | 'paid';
  payoutDate?: string;
}

export interface FinancialMetadata {
  anvisaCompliant: boolean;
  taxIncluded: boolean;
  invoiceGenerated: boolean;
  category: 'service' | 'product' | 'package';
  source: 'pos' | 'online' | 'mobile';
}

// =====================================
// COMPLIANCE AND SECURITY TYPES
// =====================================

export interface AestheticComplianceCheck {
  id: string;
  checkType: ComplianceCheckType;
  targetId: string;
  targetType: 'treatment' | 'professional' | 'client' | 'procedure';
  status: 'passed' | 'failed' | 'warning' | 'pending';
  checkedAt: string;
  checkedBy: string;
  findings: ComplianceFinding[];
  recommendations: string[];
  nextReviewDate: string;
  documentation?: string;
}

export type ComplianceCheckType =
  | 'anvisa_registration'
  | 'professional_license'
  | 'treatment_safety'
  | 'equipment_certification'
  | 'documentation_completeness'
  | 'emergency_procedures';

export interface ComplianceFinding {
  severity: 'low' | 'medium' | 'high' | 'critical';
  finding: string;
  requirement: string;
  evidence?: string;
  correctiveAction?: string;
  deadline?: string;
  status: 'open' | 'in_progress' | 'resolved';
}

export interface AestheticEmergencyProtocol {
  id: string;
  treatmentType: string;
  emergencyType: 'allergic_reaction' | 'adverse_effect' | 'equipment_failure' | 'medical_emergency';
  symptoms: string[];
  immediateActions: string[];
  requiredEquipment: string[];
  emergencyContacts: EmergencyContact[];
  hospitalProcedures: string[];
  reportingRequirements: {
    toAnvisa: boolean;
    toHealthDepartment: boolean;
    internalReport: boolean;
  };
  lastUpdated: string;
  approvedBy: string;
}

export interface EmergencyContact {
  name: string;
  role: string;
  phone: string;
  backupPhone?: string;
  availability: string;
  specialization: string;
}

// =====================================
// UTILITY TYPES AND INTERFACES
// =====================================

export interface ClientAestheticPreferences {
  preferredTreatments: string[];
  avoidedTreatments: string[];
  communicationStyle: 'detailed' | 'concise' | 'visual';
  appointmentPreferences: {
    preferredDays: number[];
    preferredTimes: string[];
    advanceNoticeDays: number;
  };
  financialPreferences: {
    prefersInstallments: boolean;
    priceSensitivity: 'low' | 'medium' | 'high';
    interestedInPromotions: boolean;
  };
}

export interface AestheticAnalyticsData {
  treatmentPopularity: Array<{
    treatmentId: string;
    name: string;
    bookings: number;
    revenue: number;
    satisfaction: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  clientRetention: {
    newClients: number;
    returningClients: number;
    retentionRate: number;
    averageVisitsPerClient: number;
  };
  professionalPerformance: Array<{
    professionalId: string;
    name: string;
    appointments: number;
    revenue: number;
    satisfaction: number;
    noShowRate: number;
  }>;
  seasonalTrends: Array<{
    month: number;
    revenue: number;
    popularTreatments: string[];
  }>;
}

export interface AestheticSessionContext {
  sessionId: string;
  userId: string;
  clientId?: string;
  currentInquiry?: string;
  treatmentContext?: {
    activeTreatments: string[];
    upcomingAppointments: string[];
    treatmentHistory: string[];
  };
  financialContext?: {
    outstandingBalance: number;
    paymentHistory: PaymentHistory[];
    creditLimit?: number;
  };
  complianceContext?: {
    pendingChecks: string[];
    lastComplianceAudit: string;
    riskLevel: 'low' | 'medium' | 'high';
  };
}

export interface PaymentHistory {
  date: string;
  amount: number;
  method: string;
  status: string;
  appointmentId?: string;
}

// Export all types for easy importing
export type {
  AestheticAppointment,
  AestheticClientProfile,
  // Export new aesthetic types
  AestheticTreatment,
  AgeGroup,
  AguiAction,
  AguiErrorCode,
  // Re-export base types
  AguiMessage,
  AguiMessageMetadata,
  AguiMessageType,
  AguiSource,
  AISuggestion,
  AppointmentPriority,
  AppointmentStatus,
  ClientSegment,
  ComplianceCheckType,
  FinancialOperationType,
  PaymentMethod,
  PaymentStatus,
  PricingStrategy,
  Season,
  SkinConcern,
  SkinType,
  TreatmentCategory,
  ValidationResult,
};
