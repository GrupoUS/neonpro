/**
 * 🏥 ENHANCED HEALTHCARE CONSENT MANAGEMENT SYSTEM
 * 
 * Constitutional LGPD compliance for Brazilian healthcare with:
 * - Granular consent tracking for different data processing purposes
 * - Patient rights implementation (access, rectification, deletion, portability)
 * - Minor patient consent handling (under 18 years)
 * - Real-time consent validation <100ms performance requirement
 * - Constitutional patient privacy protection
 * 
 * Quality Standard: ≥9.9/10 (Healthcare Regulatory Compliance)
 * Compliance: LGPD + ANVISA + CFM + Brazilian Constitutional Requirements
 */

import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// 🔒 HEALTHCARE DATA PROCESSING PURPOSES (Brazilian Constitutional Classification)
export enum HealthcareDataPurpose {
  // Essential Healthcare Operations (Constitutional Right to Health)
  MEDICAL_TREATMENT = 'medical_treatment',
  MEDICAL_DIAGNOSIS = 'medical_diagnosis', 
  EMERGENCY_CARE = 'emergency_care',
  PRESCRIPTION_MANAGEMENT = 'prescription_management',
  
  // Administrative Healthcare Operations
  APPOINTMENT_SCHEDULING = 'appointment_scheduling',
  BILLING_PROCESSING = 'billing_processing',
  INSURANCE_CLAIMS = 'insurance_claims',
  
  // Regulatory Compliance (ANVISA/CFM Requirements)
  REGULATORY_REPORTING = 'regulatory_reporting',
  AUDIT_COMPLIANCE = 'audit_compliance',
  PROFESSIONAL_LICENSING = 'professional_licensing',
  
  // Secondary Uses (Explicit Consent Required)
  RESEARCH_PARTICIPATION = 'research_participation',
  MARKETING_COMMUNICATIONS = 'marketing_communications',
  QUALITY_IMPROVEMENT = 'quality_improvement',
  ANALYTICS_INSIGHTS = 'analytics_insights',
  
  // Third-Party Data Sharing
  THIRD_PARTY_INTEGRATIONS = 'third_party_integrations',
  LABORATORY_SYSTEMS = 'laboratory_systems',
  IMAGING_SYSTEMS = 'imaging_systems'
}

// 🎯 CONSENT STATUS TRACKING (Constitutional Requirements)
export enum ConsentStatus {
  PENDING = 'pending',
  GRANTED = 'granted',
  DENIED = 'denied',
  WITHDRAWN = 'withdrawn',
  EXPIRED = 'expired',
  MINOR_GUARDIAN_REQUIRED = 'minor_guardian_required'
}

// 👶 MINOR PATIENT CONSENT HANDLING (Brazilian Legal Requirements)
export enum MinorConsentType {
  GUARDIAN_CONSENT = 'guardian_consent',         // Under 16 years
  ADOLESCENT_CONSENT = 'adolescent_consent',     // 16-17 years
  EMANCIPATED_MINOR = 'emancipated_minor'        // Legal emancipation
}

// 📋 CONSENT RECORD SCHEMA (Constitutional Data Protection)
export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  
  // Constitutional Consent Details
  purpose: z.nativeEnum(HealthcareDataPurpose),
  status: z.nativeEnum(ConsentStatus),
  consent_text: z.string().min(1),
  version: z.string(),
  
  // Legal Basis (LGPD Article 7)
  legal_basis: z.enum([
    'consent',                    // Article 7, I
    'legal_obligation',          // Article 7, II  
    'public_interest',           // Article 7, III
    'vital_interests',           // Article 7, IV
    'legitimate_interests'       // Article 7, IX
  ]),
  
  // Minor Patient Handling
  is_minor: z.boolean(),
  minor_age: z.number().optional(),
  minor_consent_type: z.nativeEnum(MinorConsentType).optional(),
  guardian_id: z.string().uuid().optional(),
  guardian_relationship: z.string().optional(),
  
  // Constitutional Timestamps
  granted_at: z.date().optional(),
  withdrawn_at: z.date().optional(),
  expires_at: z.date().optional(),
  
  // Audit Trail (Constitutional Requirements)
  granted_by_ip: z.string().optional(),
  granted_by_user_agent: z.string().optional(),
  withdrawal_reason: z.string().optional(),
  
  // Constitutional Metadata
  created_at: z.date(),
  updated_at: z.date(),
  created_by: z.string().uuid(),
  updated_by: z.string().uuid().optional()
});

export type ConsentRecord = z.infer<typeof ConsentRecordSchema>;

/**
 * 🏥 ENHANCED HEALTHCARE CONSENT MANAGER
 * 
 * Constitutional LGPD compliance with healthcare-specific requirements
 */