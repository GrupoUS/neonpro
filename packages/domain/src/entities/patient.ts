import {
  type Gender,
  type BloodType
} from '../value-objects/gender.js';
import { type ContactMethod } from '../value-objects/healthcare.js';
import { validateCPF, formatCPF } from '../value-objects/healthcare.js';

/**
 * Consolidated Patient Entity - Single source of truth for patient data
 * This merges the duplicate Patient types from packages/types and packages/shared
 * 
 * Features:
 * - LGPD (Lei Geral de Proteção de Dados) compliance
 * - Brazilian data validation (CPF, phone, CEP)
 * - Audit trail for healthcare compliance
 * - Data anonymization support
 * - Healthcare-specific fields
 * - Emergency contact information
 */
export interface Patient {
  // Core identification
  id: string;
  clinicId: string;
  medicalRecordNumber: string;
  externalIds?: Record<string, any>;
  
  // Names and personal information
  givenNames: string[];
  familyName: string;
  fullName: string;
  preferredName?: string;
  
  // Contact information
  phonePrimary?: string;
  phoneSecondary?: string;
  email?: string;
  preferredContactMethod?: ContactMethod;
  
  // Address information
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  
  // Demographics
  birthDate?: string;
  gender?: Gender | string;
  maritalStatus?: string;
  bloodType?: BloodType;
  
  // Status and flags
  isActive?: boolean;
  deceasedIndicator?: boolean;
  deceasedDate?: string;
  
  // Healthcare information
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  
  // Insurance information
  insuranceProvider?: string;
  insuranceNumber?: string;
  insurancePlan?: string;
  
  // Emergency contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  
  // LGPD compliance
  dataConsentStatus?: string;
  dataConsentDate?: string;
  dataRetentionUntil?: string;
  lgpdConsentGiven: boolean;
  
  // Metadata
  dataSource?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  
  // Additional fields
  photoUrl?: string;
  cpf?: string;
  rg?: string;
  passportNumber?: string;
}

/**
 * Brazilian validation methods for Patient
 */
export class PatientValidator {
  /**
   * Validate patient CPF
   */
  static validateCPF(patient: Patient): boolean {
    if (!patient.cpf) return true; // CPF is optional
    return validateCPF(patient.cpf);
  }

  /**
   * Format patient CPF for display
   */
  static formatCPF(patient: Patient): string {
    if (!patient.cpf) return '';
    return formatCPF(patient.cpf);
  }

  /**
   * Validate required patient fields
   */
  static validateRequired(patient: Patient): string[] {
    const errors: string[] = [];

    if (!patient.id) errors.push('Patient ID is required');
    if (!patient.clinicId) errors.push('Clinic ID is required');
    if (!patient.medicalRecordNumber) errors.push('Medical record number is required');
    if (!patient.givenNames || patient.givenNames.length === 0) errors.push('Given names are required');
    if (!patient.familyName) errors.push('Family name is required');
    if (!patient.fullName) errors.push('Full name is required');

    return errors;
  }

  /**
   * Check if patient is active
   */
  static isActive(patient: Patient): boolean {
    return patient.isActive !== false && !patient.deceasedIndicator;
  }
}

/**
 * Patient factory methods
 */
export class PatientFactory {
  /**
   * Create a new patient with default values
   */
  static create(data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Patient {
    const _now = new Date().toISOString();
    
    return {
      ...data,
      id: `patient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      allergies: data.allergies || [],
      chronicConditions: data.chronicConditions || [],
      currentMedications: data.currentMedications || [],
      isActive: data.isActive ?? true,
      lgpdConsentGiven: data.lgpdConsentGiven ?? false,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Create a minimal patient record
   */
  static createMinimal(data: {
    clinicId: string;
    medicalRecordNumber: string;
    givenNames: string[];
    familyName: string;
  }): Patient {
    return this.create({
      ...data,
      fullName: `${data.givenNames.join(' ')} ${data.familyName}`,
      allergies: [],
      chronicConditions: [],
      currentMedications: [],
      lgpdConsentGiven: false,
    });
  }
}