/**
 * Medical History Model (T032)
 * Comprehensive medical history tracking for Brazilian healthcare
 *
 * Features:
 * - Medical history entries with LGPD compliance
 * - Vital signs tracking
 * - Prescription management
 * - Medical procedures tracking
 * - File attachments support
 * - Brazilian healthcare context
 */

// Medical history entry types
export enum MedicalHistoryType {
  CONSULTATION = 'consultation',
  EXAM = 'exam',
  SURGERY = 'surgery',
  HOSPITALIZATION = 'hospitalization',
  VACCINATION = 'vaccination',
  EMERGENCY = 'emergency',
  FOLLOW_UP = 'follow_up',
  PROCEDURE = 'procedure',
}

// Prescription status
export enum PrescriptionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  SUSPENDED = 'suspended',
}

// Medical procedure status
export enum ProcedureStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  POSTPONED = 'postponed',
}

// Vital signs interface
export interface VitalSigns {
  bloodPressure?: string; // e.g., "120/80"
  heartRate?: number; // bpm
  temperature?: number; // Celsius
  weight?: number; // kg
  height?: number; // cm
  respiratoryRate?: number; // breaths per minute
  oxygenSaturation?: number; // percentage
  bmi?: number; // calculated or measured
  bloodGlucose?: number; // mg/dL
  notes?: string;
}

// Medical attachment interface
export interface MedicalAttachment {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  description?: string;
  category?: 'exam' | 'prescription' | 'report' | 'image' | 'other';
}

// Prescription interface
export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  prescribedBy: string;
  prescribedAt: Date;
  status: PrescriptionStatus | string;
  startDate?: Date;
  endDate?: Date;
  refills?: number;
  notes?: string;
}

// Medical procedure interface
export interface MedicalProcedure {
  id: string;
  name: string;
  code?: string; // TUSS code or internal code
  description?: string;
  duration?: number; // minutes
  cost?: number;
  performedBy: string;
  performedAt?: Date;
  scheduledAt?: Date;
  status: ProcedureStatus | string;
  notes?: string;
  complications?: string;
  followUpRequired?: boolean;
}

// Main medical history interface
export interface MedicalHistory {
  id: string;
  patientId: string;
  type: MedicalHistoryType | string;
  date: Date;
  title: string;
  description?: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string[];
  allergies?: string[];

  // Vital signs
  vitalSigns?: VitalSigns;

  // Prescriptions
  prescriptions?: Prescription[];

  // Procedures
  procedures?: MedicalProcedure[];

  // Attachments
  attachments?: MedicalAttachment[];

  // Healthcare provider information
  createdBy: string;
  facility?: string;
  department?: string;

  // Follow-up information
  followUpDate?: Date;
  followUpNotes?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  // LGPD compliance
  accessLog?: Array<{
    _userId: string;
    action: string;
    timestamp: Date;
    ipAddress?: string;
  }>;
}

// Calculate BMI from weight and height
export function calculateBMI(weight: number, height: number): number {
  if (!weight || !height || weight <= 0 || height <= 0) {
    return 0;
  }

  // Convert height from cm to meters
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);

  return Math.round(bmi * 10) / 10; // Round to 1 decimal place
}

// Validate medical history entry
export function validateMedicalHistoryEntry(
  entry: Partial<MedicalHistory>,
): boolean {
  if (!entry.patientId || entry.patientId.trim() === '') {
    return false;
  }

  if (
    !entry.type
    || !Object.values(MedicalHistoryType).includes(
      entry.type as MedicalHistoryType,
    )
  ) {
    return false;
  }

  if (!entry.date || !(entry.date instanceof Date)) {
    return false;
  }

  if (!entry.title || entry.title.trim() === '') {
    return false;
  }

  if (!entry.createdBy || entry.createdBy.trim() === '') {
    return false;
  }

  return true;
}

// Format medical history for display
export function formatMedicalHistoryForDisplay(
  history: Partial<MedicalHistory>,
): string {
  const parts: string[] = [];

  if (history.title) {
    parts.push(history.title);
  }

  if (history.date) {
    const dateStr = history.date.toLocaleDateString('pt-BR');
    parts.push(`Data: ${dateStr}`);
  }

  if (history.createdBy) {
    parts.push(`Profissional: ${history.createdBy}`);
  }

  if (history.diagnosis) {
    parts.push(`Diagnóstico: ${history.diagnosis}`);
  }

  if (history.treatment) {
    parts.push(`Tratamento: ${history.treatment}`);
  }

  return parts.join(' | ');
}

// Anonymize medical history for LGPD compliance
export function anonymizeMedicalHistory(
  history: Partial<MedicalHistory>,
): Partial<MedicalHistory> {
  const anonymized = { ...history };

  if (anonymized.description) {
    anonymized.description = `DADOS MÉDICOS ANONIMIZADOS - ${Date.now()}`;
  }

  if (anonymized.diagnosis) {
    anonymized.diagnosis = `DIAGNÓSTICO ANONIMIZADO - ${Date.now()}`;
  }

  if (anonymized.treatment) {
    anonymized.treatment = `TRATAMENTO ANONIMIZADO - ${Date.now()}`;
  }

  if (anonymized.medications) {
    anonymized.medications = ['MEDICAÇÃO ANONIMIZADA'];
  }

  if (anonymized.createdBy) {
    anonymized.createdBy = `PROFISSIONAL_ANON_${Date.now()}`;
  }

  if (anonymized.prescriptions) {
    anonymized.prescriptions = anonymized.prescriptions.map(prescription => ({
      ...prescription,
      medication: 'MEDICAÇÃO ANONIMIZADA',
      instructions: 'INSTRUÇÕES ANONIMIZADAS',
      prescribedBy: `PRESCRITOR_ANON_${Date.now()}`,
    }));
  }

  return anonymized;
}

// Create medical history entry with defaults
export function createMedicalHistoryEntry(
  data: Omit<MedicalHistory, 'id' | 'createdAt' | 'updatedAt'>,
): MedicalHistory {
  const now = new Date();

  return {
    ...data,
    id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };
}

// Get vital signs summary
export function getVitalSignsSummary(vitalSigns: VitalSigns): string {
  const parts: string[] = [];

  if (vitalSigns.bloodPressure) {
    parts.push(`PA: ${vitalSigns.bloodPressure}`);
  }

  if (vitalSigns.heartRate) {
    parts.push(`FC: ${vitalSigns.heartRate} bpm`);
  }

  if (vitalSigns.temperature) {
    parts.push(`T: ${vitalSigns.temperature}°C`);
  }

  if (vitalSigns.weight) {
    parts.push(`Peso: ${vitalSigns.weight} kg`);
  }

  if (vitalSigns.height) {
    parts.push(`Altura: ${vitalSigns.height} cm`);
  }

  if (vitalSigns.bmi) {
    parts.push(`IMC: ${vitalSigns.bmi}`);
  }

  return parts.join(' | ');
}

// Check if prescription is active
export function isPrescriptionActive(prescription: Prescription): boolean {
  if (prescription.status !== PrescriptionStatus.ACTIVE) {
    return false;
  }

  if (prescription.endDate && prescription.endDate < new Date()) {
    return false;
  }

  return true;
}

// Get medical history by type
export function filterMedicalHistoryByType(
  histories: MedicalHistory[],
  type: MedicalHistoryType,
): MedicalHistory[] {
  return histories.filter(history => history.type === type);
}

// Get recent medical history
export function getRecentMedicalHistory(
  histories: MedicalHistory[],
  days: number = 30,
): MedicalHistory[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return histories
    .filter(history => history.date >= cutoffDate)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}
