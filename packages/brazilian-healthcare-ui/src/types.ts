// Healthcare-specific types for Brazilian market
export interface PatientInfo {
  id: string;
  name: string;
  cpf: string;
  sus?: string; // Sistema Único de Saúde number
  phone: string;
  email?: string;
  birthDate: string;
  gender: 'M' | 'F' | 'O';
  address: Address;
  emergencyContact: EmergencyContact;
  lgpdConsent: LGPDConsent;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  region: 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul';
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  alternativePhone?: string;
}

export interface LGPDConsent {
  dataProcessing: boolean;
  marketing: boolean;
  dataSharing: boolean;
  consentDate: string;
  consentVersion: string;
  ipAddress: string;
  userAgent: string;
}

export interface HealthcareProfessional {
  id: string;
  name: string;
  crm: string; // Conselho Regional de Medicina
  specialty: string;
  phone: string;
  email: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  professionalId: string;
  date: string;
  type: 'consultation' | 'procedure' | 'emergency' | 'followup';
  description: string;
  diagnosis?: string;
  treatment?: string;
  medications?: Medication[];
  attachments?: MedicalAttachment[];
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  anvisaCode?: string;
}

export interface MedicalAttachment {
  id: string;
  filename: string;
  type: 'image' | 'document' | 'exam';
  url: string;
  uploadDate: string;
  lgpdClassification: 'public' | 'internal' | 'confidential' | 'restricted';
}

// UI/UX specific types
export interface EmergencyAlert {
  id: string;
  type: 'critical' | 'high' | 'medium';
  message: string;
  patientId?: string;
  roomNumber?: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
}

export interface ConnectivityLevel {
  type: '2G' | '3G' | '4G' | '5G' | 'wifi';
  strength: 'weak' | 'medium' | 'strong';
  latency: number; // ms
}

export interface RegionalSettings {
  region: 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul';
  connectivity: ConnectivityLevel;
  language: 'pt-BR';
  timezone: string;
  currency: 'BRL';
  dateFormat: 'DD/MM/YYYY';
}

// Accessibility types
export interface AccessibilityOptions {
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  voiceNavigation: boolean;
  colorBlindSupport: boolean;
  language: 'pt-BR';
}

// LGPD Compliance types
export interface LGPDCompliance {
  consentRequired: boolean;
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
  retentionPeriod: number; // days
  auditRequired: boolean;
  anonymizationRequired: boolean;
}

export interface AuditEvent {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  outcome: 'success' | 'failure';
  details?: Record<string, any>;
}
