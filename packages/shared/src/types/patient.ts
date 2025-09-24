/**
 * Patient Model with LGPD Compliance (T031)
 * Comprehensive patient data model with Brazilian healthcare compliance
 *
 * Features:
 * - LGPD (Lei Geral de Proteção de Dados) compliance
 * - Brazilian data validation (CPF, phone, CEP)
 * - Audit trail for healthcare compliance
 * - Data anonymization support
 * - Healthcare-specific fields
 * - Emergency contact information
 */

// Gender enum following Brazilian healthcare standards
export enum Gender {
  MALE = 'M',
  FEMALE = 'F',
  OTHER = 'O',
  NOT_INFORMED = 'N',
}

// Patient status enum
export enum PatientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  DECEASED = 'deceased',
}

// LGPD legal basis enum
export enum LegalBasis {
  CONSENT = 'consent',
  CONTRACT = 'contract',
  LEGAL_OBLIGATION = 'legal_obligation',
  VITAL_INTERESTS = 'vital_interests',
  PUBLIC_TASK = 'public_task',
  LEGITIMATE_INTERESTS = 'legitimate_interests',
}

// Address interface with Brazilian CEP validation
export interface Address {
  street: string;
  number?: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Emergency contact information
export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: Address;
}

// Healthcare-specific information
export interface HealthcareInfo {
  healthInsurance?: string;
  healthInsuranceNumber?: string;
  allergies: string[];
  medications: string[];
  medicalConditions: string[];
  bloodType?: string;
  organDonor: boolean;
  medicalNotes?: string;
}

// LGPD consent tracking
export interface LGPDConsent {
  dataProcessing: boolean;
  marketing: boolean;
  analytics: boolean;
  consentDate: Date;
  withdrawalDate?: Date;
  ipAddress: string;
  userAgent: string;
  legalBasis: LegalBasis | string;
  consentVersion?: string;
  processingPurposes: string[];
}

// Audit log entry for LGPD compliance
export interface AuditLogEntry {
  _userId: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'export' | 'anonymize';
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  details?: Record<string, any>;
}

// Audit trail for LGPD compliance
export interface AuditTrail {
  createdBy: string;
  updatedBy: string;
  accessLog: AuditLogEntry[];
  dataRetentionDate?: Date;
  anonymizationDate?: Date;
}

// Main Patient interface
export interface Patient {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  birthDate: Date;
  gender: Gender | string;
  status: PatientStatus;

  // Address information
  address?: Address;

  // Emergency contact
  emergencyContact?: EmergencyContact;

  // Healthcare information
  healthcareInfo?: HealthcareInfo;

  // LGPD compliance
  lgpdConsent: LGPDConsent;
  auditTrail: AuditTrail;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  // Additional fields
  notes?: string;
  tags?: string[];
  profilePicture?: string;
}

// Brazilian CPF validation
export function validateCPF(cpf: string): boolean {
  // Remove formatting
  const cleanCPF = cpf.replace(/[^\d]/g, '');

  // Check length
  if (cleanCPF.length !== 11) return false;

  // Check for known invalid CPFs
  const invalidCPFs = [
    '00000000000',
    '11111111111',
    '22222222222',
    '33333333333',
    '44444444444',
    '55555555555',
    '66666666666',
    '77777777777',
    '88888888888',
    '99999999999',
  ];

  if (invalidCPFs.includes(cleanCPF)) return false;

  // Validate check digits
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }

  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;

  return true;
}

// Brazilian phone validation
export function validateBrazilianPhone(phone: string): boolean {
  // Remove formatting
  const cleanPhone = phone.replace(/[^\d]/g, '');

  // Check length (10 or 11 digits)
  if (cleanPhone.length !== 10 && cleanPhone.length !== 11) return false;

  // Check area code (11-99)
  const areaCode = parseInt(cleanPhone.substring(0, 2));
  if (areaCode < 11 || areaCode > 99) return false;

  // Check mobile number format (9 digits starting with 9)
  if (cleanPhone.length === 11) {
    const firstDigit = parseInt(cleanPhone.charAt(2));
    if (firstDigit !== 9) return false;
  }

  return true;
}

// Brazilian CEP validation
export function validateCEP(cep: string): boolean {
  // Remove formatting
  const cleanCEP = cep.replace(/[^\d]/g, '');

  // Check length
  if (cleanCEP.length !== 8) return false;

  // Check for valid pattern (not all zeros)
  if (cleanCEP === '00000000') return false;

  return true;
}

// Data anonymization for LGPD compliance
export function anonymizePatientData(
  patient: Partial<Patient>,
): Partial<Patient> {
  const anonymized = { ...patient };

  if (anonymized.name) {
    anonymized.name = `ANON_${Date.now()}`;
  }

  if (anonymized.cpf) {
    anonymized.cpf = '***.***.***-**';
  }

  if (anonymized.email) {
    anonymized.email = `anon_${Date.now()}@anonymized.com`;
  }

  if (anonymized.phone) {
    anonymized.phone = '(**) *****-****';
  }

  if (anonymized.address) {
    anonymized.address = {
      ...anonymized.address,
      street: 'ENDEREÇO ANONIMIZADO',
      number: '***',
      complement: undefined,
    };
  }

  if (anonymized.emergencyContact) {
    anonymized.emergencyContact = {
      ...anonymized.emergencyContact,
      name: 'CONTATO ANONIMIZADO',
      phone: '(**) *****-****',
      email: `anon_contact_${Date.now()}@anonymized.com`,
    };
  }

  return anonymized;
}

// Format CPF for display
export function formatCPF(cpf: string): string {
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Format Brazilian phone for display
export function formatBrazilianPhone(phone: string): string {
  const cleanPhone = phone.replace(/[^\d]/g, '');

  if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  return phone;
}

// Format CEP for display
export function formatCEP(cep: string): string {
  const cleanCEP = cep.replace(/[^\d]/g, '');
  return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2');
}

// Create patient with default LGPD compliance
export function createPatientWithDefaults(
  patientData: Omit<
    Patient,
    'id' | 'createdAt' | 'updatedAt' | 'lgpdConsent' | 'auditTrail' | 'status'
  >,
): Patient {
  const now = new Date();

  return {
    ...patientData,
    id: `patient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: PatientStatus.ACTIVE,
    createdAt: now,
    updatedAt: now,
    lgpdConsent: {
      dataProcessing: true,
      marketing: false,
      analytics: false,
      consentDate: now,
      ipAddress: '0.0.0.0',
      userAgent: 'Unknown',
      legalBasis: LegalBasis.CONSENT,
      processingPurposes: ['healthcare_treatment', 'appointment_management'],
    },
    auditTrail: {
      createdBy: 'system',
      updatedBy: 'system',
      accessLog: [
        {
          _userId: 'system',
          action: 'create',
          timestamp: now,
          ipAddress: '0.0.0.0',
          userAgent: 'Unknown',
        },
      ],
    },
  };
}
