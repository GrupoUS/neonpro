/**
 * Type definitions for Enhanced Aesthetic Scheduling System
 * Brazilian healthcare compliant aesthetic clinic scheduling interfaces
 */

import { z } from 'zod';

// =====================================
// AESTHETIC PROCEDURE TYPES
// =====================================

export interface AestheticProcedure {
  id: string;
  name: string;
  description: string;
  category: string;
  procedureType: 'facial' | 'body' | 'injectable' | 'laser' | 'surgical' | 'combination';
  baseDuration: number; // in minutes
  basePrice: number;
  anvisaRegistration?: string;
  requiresCertification: boolean;
  contraindications: string[];
  specialEquipment: string[];
  recoveryTime: number; // in hours
  maxSessions: number;
  minSessions: number;
  isActive: boolean;
}

export interface TreatmentPackage {
  id: string;
  name: string;
  description: string;
  category: string;
  totalPrice: number;
  packageDiscount: number; // percentage
  totalSessions: number;
  procedures: PackageProcedure[];
  isActive: boolean;
  validityPeriod: number; // in days
}

export interface PackageProcedure {
  id: string;
  procedureId: string;
  procedure: AestheticProcedure;
  sessions: number;
  price: number;
}

// =====================================
// SCHEDULING TYPES
// =====================================

export interface AestheticAppointment {
  id: string;
  patientId: string;
  professionalId: string;
  serviceTypeId: string;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  clinicId: string;
  createdBy: string;
  notes?: string;
  procedureDetails: AestheticProcedure;
  sessionNumber: number;
  totalSessions: number;
  recoveryBuffer: number; // in minutes
  specialEquipment: string[];
  assistantRequired: boolean;
  preProcedureInstructions: string[];
  postProcedureInstructions: string[];
  noShowRiskScore: number;
  noShowRiskLevel: 'low' | 'medium' | 'high';
}

export interface MultiSessionSchedulingRequest {
  patientId: string;
  procedures: string[];
  preferredDates: Date[];
  preferredProfessionals?: string[];
  urgencyLevel: 'routine' | 'priority' | 'urgent';
  specialRequirements?: string[];
  medicalHistory?: {
    pregnancyStatus?: 'none' | 'pregnant' | 'breastfeeding' | 'planning';
    contraindications?: string[];
    medications?: string[];
    allergies?: string[];
  };
}

// =====================================
// CERTIFICATION TYPES
// =====================================

export interface ProfessionalCertification {
  id: string;
  professionalId: string;
  certificationType: string;
  certificationNumber: string;
  issuedDate: Date;
  expiryDate: Date;
  issuingAuthority: string;
  isActive: boolean;
  verified: boolean;
}

export interface CertificationValidation {
  isValid: boolean;
  professionalId: string;
  professional: {
    id: string;
    name: string;
    council: string;
    councilNumber: string;
    specialty: string;
  };
  procedures: Array<{
    id: string;
    name: string;
    certified: boolean;
    requirements: string[];
  }>;
  complianceStatus: 'compliant' | 'non-compliant' | 'partial';
  recommendations: string[];
  warnings: string[];
  missingCertifications?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

// =====================================
// ROOM ALLOCATION TYPES
// =====================================

export interface Room {
  id: string;
  name: string;
  type: 'treatment' | 'consultation' | 'recovery' | 'surgical';
  capacity: number;
  equipment: string[];
  isOperational: boolean;
  maintenanceSchedule?: Date[];
}

export interface RoomAllocation {
  appointmentId: string;
  roomId: string;
  startTime: Date;
  endTime: Date;
  equipment: string[];
  requiresSetup: boolean;
  setupTime: number; // in minutes
}

export interface OptimizationResult {
  success: boolean;
  roomAssignments: Map<string, string>;
  conflicts: Conflict[];
  utilization: number;
  recommendations: string[];
}

export interface Conflict {
  type: 'room' | 'equipment' | 'professional' | 'time';
  appointmentIds: string[];
  description: string;
  severity: 'low' | 'medium' | 'high';
  resolution?: string;
}

// =====================================
// CONTRAINDICATION TYPES
// =====================================

export interface ContraindicationCheck {
  patientId: string;
  procedureIds: string[];
  medicalHistory?: {
    pregnancyStatus?: 'none' | 'pregnant' | 'breastfeeding' | 'planning';
    chronicConditions?: string[];
    medications?: string[];
    allergies?: string[];
    previousSurgeries?: string[];
  };
}

export interface ContraindicationResult {
  safe: boolean;
  contraindications: string[];
  warnings: string[];
  recommendations: string[];
  severity: 'low' | 'medium' | 'high';
  complianceStatus: {
    anvisaCompliant: boolean;
    brazilianHealthcareStandards: boolean;
    patientSafetyPrioritized: boolean;
  };
}

// =====================================
// DURATION CALCULATION TYPES
// =====================================

export interface DurationFactor {
  type:
    | 'patient_complexity'
    | 'procedure_modification'
    | 'equipment_setup'
    | 'recovery_time'
    | 'staff_experience';
  description: string;
  impact: number; // percentage increase
  mandatory: boolean;
}

export interface DurationCalculation {
  baseDuration: number;
  factors: DurationFactor[];
  totalDuration: number;
  durationIncrease: number;
  percentageIncrease: number;
  calculationMethod: string;
  complianceStatus: {
    anvisaCompliant: boolean;
    timeStandardsMet: boolean;
    safetyBufferIncluded: boolean;
  };
}

// =====================================
// API RESPONSE TYPES
// =====================================

export interface AestheticSchedulingResponse {
  success: boolean;
  appointments: AestheticAppointment[];
  totalCost: number;
  totalDuration: number;
  recoveryPlan: RecoveryPlan;
  professionalAssignments: ProfessionalAssignment[];
  contraindications: string[];
  warnings: string[];
  complianceStatus: {
    anvisaCompliant: boolean;
    cfmValidated: boolean;
    lgpdCompliant: boolean;
    auditTrail: boolean;
    emergencyProtocolVerified: boolean;
  };
  brazilianHealthcareStandards: {
    cfmResolution2314: boolean;
    anvisaRegulations: boolean;
    lgpdCompliance: boolean;
    patientConsentVerified: boolean;
  };
}

export interface RecoveryInstruction {
  id: string;
  title: string;
  description: string;
  category: 'daily_care' | 'restrictions' | 'warnings' | 'medications';
  timing?: string;
  mandatory: boolean;
}

export interface WarningSign {
  id: string;
  sign: string;
  description: string;
  severity: 'mild' | 'moderate' | 'critical';
  actionRequired: string;
}

export interface RiskFactor {
  id: string;
  factor: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  severity: 'minor' | 'moderate' | 'major';
  mitigation: string[];
}

export interface RecoveryPlan {
  patientId?: string;
  appointmentId?: string;
  procedureId?: string;
  recoveryPeriodDays: number;
  followUpAppointments: FollowUpAppointment[];
  activityRestrictions: string[];
  careInstructions: string[];
  emergencyContacts: string[];
  // Propriedades adicionais para compatibilidade com componente React
  phases?: RecoveryPhase[];
  totalRecoveryTime?: number;
  instructions?: RecoveryInstruction[];
  warningSigns?: WarningSign[];
  risks?: RiskFactor[];
  careLevel?: 'low' | 'medium' | 'high' | 'intensive';
  customNotes?: string;
}

export interface RecoveryPhase {
  id: string;
  name: string;
  description: string;
  duration: number; // in days
  instructions: string[];
  restrictions: string[];
  warnings: string[];
  followUpRequired: boolean;
  // Propriedades adicionais para compatibilidade com componente React
  phaseNumber?: number;
  phase?: 'immediate' | 'early' | 'intermediate' | 'late' | 'maintenance';
  startDate?: Date | string;
  endDate?: Date | string;
  keyActivities?: string[];
  milestones?: string[];
  warningSigns?: string[];
}

export interface FollowUpAppointment {
  purpose: string;
  recommendedTiming: string; // e.g., "24 hours after", "1 week after"
  mandatory: boolean;
}

export interface ProfessionalAssignment {
  appointmentId: string;
  professionalId: string;
  role: 'primary' | 'assistant' | 'anesthesiologist' | 'consultant';
  startTime: Date;
  endTime: Date;
}

export interface TreatmentPackageResponse {
  success: boolean;
  booking: PackageBooking;
  appointments: AestheticAppointment[];
  recoveryPlan: RecoveryPlan;
  professionalAssignments: ProfessionalAssignment[];
  packageDetails: {
    name: string;
    description: string;
    totalSessions: number;
    totalPrice: number;
    discountApplied: number;
    finalPrice: number;
  };
  complianceStatus: {
    anvisaCompliant: boolean;
    cfmValidated: boolean;
    lgpdCompliant: boolean;
    packagePricingTransparent: boolean;
  };
}

export interface PackageBooking {
  id: string;
  packageId: string;
  patientId: string;
  clinicId: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  startDate: Date;
  totalSessions: number;
  totalPrice: number;
  discountApplied: number;
  bookedBy: string;
  metadata: {
    preferences: Record<string, any>;
    scheduledAppointments: string[];
    recoveryPlan: RecoveryPlan;
  };
}

// =====================================
// FORM SCHEMAS
// =====================================

export const MultiSessionSchedulingSchema = z.object({
  patientId: z.string().uuid('ID do paciente inválido'),
  procedures: z.array(z.string().uuid('ID do procedimento inválido')).min(
    1,
    'Selecione ao menos um procedimento',
  ),
  preferredDates: z.array(z.date()).min(1, 'Selecione ao menos uma data preferida'),
  preferredProfessionals: z.array(z.string().uuid()).optional(),
  urgencyLevel: z.enum(['routine', 'priority', 'urgent']).refine(val => val, {
    message: 'Nível de urgência inválido',
  }),
  specialRequirements: z.array(z.string()).optional(),
  medicalHistory: z.object({
    pregnancyStatus: z.enum(['none', 'pregnant', 'breastfeeding', 'planning']).optional(),
    contraindications: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
  }).optional(),
});

export const TreatmentPackageSchedulingSchema = z.object({
  packageId: z.string().uuid('ID do pacote inválido'),
  patientId: z.string().uuid('ID do paciente inválido'),
  startDate: z.date('Data de início inválida'),
  preferences: z.record(z.string(), z.any()).optional(),
});

export const CertificationValidationSchema = z.object({
  professionalId: z.string().uuid('ID do profissional inválido'),
  procedureIds: z.array(z.string().uuid('ID do procedimento inválido')).min(
    1,
    'Selecione ao menos um procedimento',
  ),
});

export const RoomOptimizationSchema = z.object({
  appointments: z.array(z.object({
    id: z.string(),
    procedureId: z.string(),
    startTime: z.date(),
    endTime: z.date(),
    specialRequirements: z.array(z.string()).optional(),
  })),
});

export const ContraindicationCheckSchema = z.object({
  patientId: z.string().uuid('ID do paciente inválido'),
  procedureIds: z.array(z.string().uuid('ID do procedimento inválido')).min(
    1,
    'Selecione ao menos um procedimento',
  ),
  medicalHistory: z.object({
    pregnancyStatus: z.enum(['none', 'pregnant', 'breastfeeding', 'planning']).optional(),
    chronicConditions: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    previousSurgeries: z.array(z.string()).optional(),
  }).optional(),
});

export const DurationCalculationSchema = z.object({
  baseDuration: z.number().min(1, 'Duração base deve ser maior que 0'),
  factors: z.array(z.object({
    type: z.enum([
      'patient_complexity',
      'procedure_modification',
      'equipment_setup',
      'recovery_time',
      'staff_experience',
    ]),
    description: z.string().min(1, 'Descrição é obrigatória'),
    impact: z.number().min(0, 'Impacto deve ser maior ou igual a 0'),
    mandatory: z.boolean(),
  })),
});

// =====================================
// UTILITY TYPES
// =====================================

export type ProcedureCategory =
  | 'facial'
  | 'body'
  | 'injectable'
  | 'laser'
  | 'surgical'
  | 'combination';

export type RiskLevel = 'low' | 'medium' | 'high';

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type PregnancyStatus =
  | 'none'
  | 'pregnant'
  | 'breastfeeding'
  | 'planning';

export type CertificationType =
  | 'cfm'
  | 'anvisa'
  | 'specialization'
  | 'training'
  | 'experience';
