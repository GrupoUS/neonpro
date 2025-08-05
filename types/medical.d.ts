// Medical domain types
export interface Patient {
  id: string;
  user_id?: string; // If patient has user account
  personal_info: PersonalInfo;
  medical_info: MedicalInfo;
  contact_info: ContactInfo;
  emergency_contact: EmergencyContact;
  insurance_info?: InsuranceInfo;
  healthcare_provider_id: string;
  created_at: string;
  updated_at: string;
}

export interface PersonalInfo {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: Gender;
  document_number: string; // CPF, SSN, etc.
  document_type: DocumentType;
  nationality: string;
  marital_status: MaritalStatus;
  occupation?: string;
}

export type Gender = "male" | "female" | "other" | "prefer_not_to_say";
export type DocumentType = "cpf" | "rg" | "passport" | "driver_license";
export type MaritalStatus = "single" | "married" | "divorced" | "widowed" | "other";

export interface MedicalInfo {
  blood_type?: BloodType;
  allergies: Allergy[];
  chronic_conditions: ChronicCondition[];
  medications: Medication[];
  immunizations: Immunization[];
  height?: number; // cm
  weight?: number; // kg
  bmi?: number;
}

export type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export interface Allergy {
  id: string;
  allergen: string;
  reaction: string;
  severity: AllergySeverity;
  discovered_date?: string;
  notes?: string;
}

export type AllergySeverity = "mild" | "moderate" | "severe" | "life_threatening";

export interface ChronicCondition {
  id: string;
  condition: string;
  icd_code?: string;
  diagnosed_date?: string;
  status: ConditionStatus;
  notes?: string;
}

export type ConditionStatus = "active" | "resolved" | "remission" | "managed";

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: MedicationRoute;
  start_date: string;
  end_date?: string;
  prescribing_doctor?: string;
  notes?: string;
}

export type MedicationRoute = "oral" | "topical" | "injection" | "inhalation" | "other";

export interface Immunization {
  id: string;
  vaccine: string;
  date_administered: string;
  lot_number?: string;
  administered_by?: string;
  location?: string;
  next_due_date?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: Address;
}

export interface InsuranceInfo {
  provider: string;
  policy_number: string;
  group_number?: string;
  plan_type: string;
  coverage_start: string;
  coverage_end?: string;
  copay_amount?: number;
  deductible_amount?: number;
}

// Appointment types
export interface Appointment {
  id: string;
  patient_id: string;
  healthcare_provider_id: string;
  doctor_id?: string;
  appointment_type: AppointmentType;
  status: AppointmentStatus;
  scheduled_date: string;
  duration: number; // minutes
  reason: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type AppointmentType =
  | "consultation"
  | "follow_up"
  | "routine_checkup"
  | "emergency"
  | "surgery"
  | "diagnostic"
  | "therapy";

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "checked_in"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

// Medical Record types
export interface MedicalRecord {
  id: string;
  patient_id: string;
  appointment_id?: string;
  healthcare_provider_id: string;
  doctor_id: string;
  record_type: RecordType;
  date: string;
  chief_complaint?: string;
  history_present_illness?: string;
  assessment: string;
  plan: string;
  vital_signs?: VitalSigns;
  diagnoses: Diagnosis[];
  procedures: Procedure[];
  attachments: MedicalAttachment[];
  created_at: string;
  updated_at: string;
}

export type RecordType =
  | "consultation"
  | "procedure"
  | "diagnostic"
  | "surgery"
  | "follow_up"
  | "emergency";

export interface VitalSigns {
  temperature?: number; // Celsius
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number; // BPM
  respiratory_rate?: number;
  oxygen_saturation?: number; // %
  height?: number; // cm
  weight?: number; // kg
  bmi?: number;
  recorded_at: string;
}

export interface Diagnosis {
  id: string;
  primary: boolean;
  icd_code: string;
  description: string;
  status: DiagnosisStatus;
  confidence: DiagnosisConfidence;
  notes?: string;
}

export type DiagnosisStatus = "provisional" | "confirmed" | "ruled_out" | "differential";
export type DiagnosisConfidence = "low" | "medium" | "high" | "definitive";

export interface Procedure {
  id: string;
  code: string; // CPT or other coding system
  name: string;
  description?: string;
  performed_by: string;
  performed_at: string;
  duration?: number; // minutes
  location?: string;
  notes?: string;
}

export interface MedicalAttachment {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  url: string;
  category: AttachmentCategory;
  uploaded_by: string;
  uploaded_at: string;
}

export type AttachmentCategory =
  | "lab_result"
  | "imaging"
  | "document"
  | "prescription"
  | "referral"
  | "consent_form";

// Lab Results
export interface LabResult {
  id: string;
  patient_id: string;
  order_id?: string;
  test_name: string;
  test_code: string;
  result_value: string;
  reference_range: string;
  unit: string;
  status: LabResultStatus;
  abnormal_flag?: AbnormalFlag;
  performed_date: string;
  reported_date: string;
  laboratory: string;
  notes?: string;
}

export type LabResultStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type AbnormalFlag = "normal" | "high" | "low" | "critical_high" | "critical_low";

// Doctor/Provider types
export interface Doctor {
  id: string;
  user_id: string;
  healthcare_provider_id: string;
  specialties: MedicalSpecialty[];
  license_number: string;
  license_state: string;
  license_expiry: string;
  board_certifications: BoardCertification[];
  education: Education[];
  languages: string[];
  experience_years: number;
  consultation_fee?: number;
  availability: DoctorAvailability[];
  created_at: string;
  updated_at: string;
}

export interface MedicalSpecialty {
  name: string;
  board: string;
  certification_date?: string;
}

export interface BoardCertification {
  board: string;
  specialty: string;
  certification_date: string;
  expiry_date?: string;
  certificate_number?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field_of_study: string;
  graduation_year: number;
  location: string;
}

export interface DoctorAvailability {
  day_of_week: number; // 0-6
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  appointment_types: AppointmentType[];
  is_available: boolean;
}
