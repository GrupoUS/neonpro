/**
 * Advanced Patient History Types
 * Types for detailed medical history, treatment tracking, and progress monitoring
 */

export type MedicalRecordType =
  | "consultation"
  | "treatment"
  | "procedure"
  | "follow_up"
  | "emergency"
  | "referral"
  | "lab_result"
  | "imaging"
  | "prescription"
  | "allergy"
  | "vaccination"
  | "surgery"
  | "note";

export type TreatmentStatus =
  | "planned"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "postponed"
  | "on_hold";

export type ProgressIndicator =
  | "excellent"
  | "good"
  | "satisfactory"
  | "poor"
  | "concerning";

export interface MedicalRecord {
  id: string;
  patient_id: string;
  clinic_id: string;
  appointment_id?: string;
  professional_id: string;

  // Record details
  record_type: MedicalRecordType;
  title: string;
  description: string;
  notes?: string;

  // Clinical data
  symptoms?: string[];
  diagnosis?: string[];
  treatment_plan?: string;
  medications?: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }[];

  // Vital signs
  vital_signs?: {
    blood_pressure?: string;
    heart_rate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    bmi?: number;
    oxygen_saturation?: number;
  };

  // Attachments
  attachments?: {
    id: string;
    filename: string;
    file_type: string;
    file_size: number;
    url: string;
    description?: string;
  }[];

  // Metadata
  record_date: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

export interface TreatmentPlan {
  id: string;
  patient_id: string;
  clinic_id: string;
  professional_id: string;

  // Plan details
  name: string;
  description: string;
  objectives: string[];

  // Treatment phases
  phases: {
    id: string;
    name: string;
    description: string;
    duration_weeks: number;
    services: {
      service_id: string;
      service_name: string;
      frequency: string; // e.g., "2x per week"
      sessions_planned: number;
      sessions_completed: number;
    }[];
    status: TreatmentStatus;
    start_date?: string;
    end_date?: string;
    notes?: string;
  }[];

  // Progress tracking
  overall_status: TreatmentStatus;
  progress_percentage: number;
  start_date: string;
  expected_end_date: string;
  actual_end_date?: string;

  // Outcomes
  success_metrics: {
    metric: string;
    target_value: string;
    current_value?: string;
    achieved: boolean;
  }[];

  created_at: string;
  updated_at: string;
}

export interface ProgressNote {
  id: string;
  patient_id: string;
  treatment_plan_id?: string;
  appointment_id?: string;
  professional_id: string;

  // Progress details
  date: string;
  progress_indicator: ProgressIndicator;
  summary: string;
  detailed_notes: string;

  // Measurements
  measurements?: {
    name: string;
    value: number;
    unit: string;
    reference_range?: string;
    previous_value?: number;
    change_percentage?: number;
  }[];

  // Photos/documentation
  before_photos?: string[];
  after_photos?: string[];

  // Next steps
  recommendations: string[];
  next_appointment_notes?: string;

  created_at: string;
  updated_at: string;
}

export interface PatientAllergy {
  id: string;
  patient_id: string;

  // Allergy details
  allergen: string;
  allergy_type: "medication" | "food" | "environmental" | "contact" | "other";
  severity: "mild" | "moderate" | "severe" | "life_threatening";

  // Reaction details
  reactions: string[];
  onset_date?: string;

  // Management
  avoidance_instructions: string;
  emergency_treatment?: string;

  // Verification
  verified_by?: string;
  verification_date?: string;

  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientCondition {
  id: string;
  patient_id: string;

  // Condition details
  condition_name: string;
  icd_code?: string;
  category: string;
  severity: "mild" | "moderate" | "severe";

  // Timeline
  onset_date?: string;
  diagnosis_date: string;
  resolution_date?: string;

  // Status
  status: "active" | "resolved" | "chronic" | "in_remission";

  // Treatment
  current_treatments: string[];
  medications: string[];

  // Notes
  notes?: string;

  created_at: string;
  updated_at: string;
}

export interface PatientTimeline {
  patient_id: string;
  events: {
    id: string;
    date: string;
    type:
      | "appointment"
      | "treatment"
      | "medication"
      | "condition"
      | "allergy"
      | "note"
      | "milestone";
    title: string;
    description: string;
    professional_name?: string;
    service_name?: string;
    status?: string;
    importance: "low" | "medium" | "high" | "critical";
    attachments?: {
      filename: string;
      url: string;
    }[];
  }[];
}

export interface PatientSummary {
  patient_id: string;

  // Basic info
  name: string;
  age: number;
  gender: string;

  // Medical summary
  active_conditions: PatientCondition[];
  active_allergies: PatientAllergy[];
  current_medications: string[];

  // Treatment summary
  active_treatments: TreatmentPlan[];
  recent_appointments: {
    date: string;
    service_name: string;
    professional_name: string;
    status: string;
  }[];

  // Progress indicators
  overall_progress: ProgressIndicator;
  last_visit_date?: string;
  next_appointment_date?: string;

  // Risk factors
  risk_factors: {
    factor: string;
    level: "low" | "medium" | "high";
    description: string;
  }[];

  // Statistics
  total_appointments: number;
  total_treatments: number;
  satisfaction_score?: number;

  last_updated: string;
}

export interface CreateMedicalRecordRequest {
  appointment_id?: string;
  professional_id: string;
  record_type: MedicalRecordType;
  title: string;
  description: string;
  notes?: string;
  symptoms?: string[];
  diagnosis?: string[];
  treatment_plan?: string;
  medications?: MedicalRecord["medications"];
  vital_signs?: MedicalRecord["vital_signs"];
  record_date: string;
}

export interface UpdateMedicalRecordRequest
  extends Partial<CreateMedicalRecordRequest> {}

export interface CreateTreatmentPlanRequest {
  professional_id: string;
  name: string;
  description: string;
  objectives: string[];
  phases: TreatmentPlan["phases"];
  start_date: string;
  expected_end_date: string;
  success_metrics: TreatmentPlan["success_metrics"];
}

export interface UpdateTreatmentPlanRequest
  extends Partial<CreateTreatmentPlanRequest> {
  overall_status?: TreatmentStatus;
  progress_percentage?: number;
  actual_end_date?: string;
}

export interface CreateProgressNoteRequest {
  treatment_plan_id?: string;
  appointment_id?: string;
  professional_id: string;
  date: string;
  progress_indicator: ProgressIndicator;
  summary: string;
  detailed_notes: string;
  measurements?: ProgressNote["measurements"];
  before_photos?: string[];
  after_photos?: string[];
  recommendations: string[];
  next_appointment_notes?: string;
}

export interface PatientHistoryFilters {
  record_type?: MedicalRecordType;
  professional_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  include_attachments?: boolean;
}

// Utility functions
export function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

export function calculateBMI(weight: number, height: number): number {
  // weight in kg, height in cm
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return "Abaixo do peso";
  if (bmi < 25) return "Peso normal";
  if (bmi < 30) return "Sobrepeso";
  return "Obesidade";
}

export function getProgressColor(indicator: ProgressIndicator): string {
  switch (indicator) {
    case "excellent":
      return "green";
    case "good":
      return "blue";
    case "satisfactory":
      return "yellow";
    case "poor":
      return "orange";
    case "concerning":
      return "red";
    default:
      return "gray";
  }
}

export function formatVitalSigns(
  vitalSigns: MedicalRecord["vital_signs"],
): string[] {
  if (!vitalSigns) return [];

  const formatted: string[] = [];

  if (vitalSigns.blood_pressure) {
    formatted.push(`PA: ${vitalSigns.blood_pressure}`);
  }
  if (vitalSigns.heart_rate) {
    formatted.push(`FC: ${vitalSigns.heart_rate} bpm`);
  }
  if (vitalSigns.temperature) {
    formatted.push(`Temp: ${vitalSigns.temperature}°C`);
  }
  if (vitalSigns.weight) {
    formatted.push(`Peso: ${vitalSigns.weight} kg`);
  }
  if (vitalSigns.height) {
    formatted.push(`Altura: ${vitalSigns.height} cm`);
  }
  if (vitalSigns.bmi) {
    formatted.push(`IMC: ${vitalSigns.bmi.toFixed(1)}`);
  }
  if (vitalSigns.oxygen_saturation) {
    formatted.push(`SpO2: ${vitalSigns.oxygen_saturation}%`);
  }

  return formatted;
}
