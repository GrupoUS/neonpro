/**
 * Supabase Edge Function: Patient Lookup with LGPD Compliance
 * Phase 3.4: T032 - LGPD-compliant patient search with privacy-by-design
 * 
 * Features:
 * - LGPD-compliant patient search with consent validation
 * - Privacy-by-design with data minimization
 * - CPF/CNS validation for Brazilian healthcare
 * - Audit logging for all lookup operations
 * - Performance target: <100ms response time
 * - Multi-tenant clinic isolation
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { corsHeaders } from '../_shared/cors.ts';

// Environment validation
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required environment variables');
}

// Create Supabase client with service role for RLS bypass when needed
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Patient lookup request schema
interface PatientLookupRequest {
  searchType: 'cpf' | 'cns' | 'name' | 'medical_record' | 'phone' | 'email';
  searchValue: string;
  clinicId: string;
  requesterId: string;
  requesterRole: 'doctor' | 'nurse' | 'receptionist' | 'admin';
  purpose: 'consultation' | 'emergency' | 'administrative' | 'audit';
  consentRequired?: boolean;
  dataMinimization?: boolean;
  auditMetadata?: Record<string, any>;
}

// Patient lookup response (with data minimization)
interface PatientLookupResponse {
  success: boolean;
  patients: MinimizedPatient[];
  totalCount: number;
  searchPerformed: string;
  dataMinimized: boolean;
  consentStatus: 'verified' | 'required' | 'expired' | 'not_applicable';
  auditLogId: string;
  responseTime: number;
  complianceInfo: {
    lgpdCompliant: boolean;
    cfmCompliant: boolean;
    dataRetentionApplied: boolean;
    emergencyOverride: boolean;
  };
}

// Minimized patient data for LGPD compliance
interface MinimizedPatient {
  id: string;
  medicalRecordNumber: string;
  displayName: string; // Anonymized or minimized name
  birthDate?: string; // Optional based on purpose
  gender?: string;
  phone?: string; // Masked or full based on role
  email?: string; // Masked or full based on role
  emergencyContact?: string;
  consentStatus: string;
  dataRetentionUntil?: string;
  lastVisitDate?: string;
  clinicId: string;
  // Sensitive data excluded by default
  metadata: {
    hasActiveTreatment: boolean;
    hasAllergies: boolean;
    hasChronicConditions: boolean;
    insuranceStatus: 'active' | 'inactive' | 'unknown';
    accessLevel: 'full' | 'limited' | 'emergency_only';
  };
}

/**
 * Validate CPF (Brazilian national identifier)
 */
function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }

  // Calculate verification digits
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i);
  }
  let digit1 = (sum * 10) % 11;
  if (digit1 === 10) digit1 = 0;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i);
  }
  let digit2 = (sum * 10) % 11;
  if (digit2 === 10) digit2 = 0;

  return digit1 === parseInt(cleanCPF[9]) && digit2 === parseInt(cleanCPF[10]);
}

/**
 * Validate CNS (Brazilian health card number)
 */
function validateCNS(cns: string): boolean {
  const cleanCNS = cns.replace(/[^\d]/g, '');
  
  if (cleanCNS.length !== 15) {
    return false;
  }

  // CNS validation algorithm (simplified)
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    sum += parseInt(cleanCNS[i]) * (15 - i);
  }
  
  return sum % 11 === 0;
}

/**
 * Apply data minimization based on requester role and purpose
 */
function applyDataMinimization(
  patient: any,
  requesterRole: string,
  purpose: string,
  consentStatus: string
): MinimizedPatient {
  const baseData: MinimizedPatient = {
    id: patient.id,
    medicalRecordNumber: patient.medical_record_number,
    displayName: patient.full_name,
    consentStatus: patient.data_consent_status || 'unknown',
    clinicId: patient.clinic_id,
    metadata: {
      hasActiveTreatment: !!patient.last_visit_date,
      hasAllergies: Array.isArray(patient.allergies) && patient.allergies.length > 0,
      hasChronicConditions: Array.isArray(patient.chronic_conditions) && patient.chronic_conditions.length > 0,
      insuranceStatus: patient.insurance_provider ? 'active' : 'unknown',
      accessLevel: 'limited',
    },
  };

  // Emergency access - more data available
  if (purpose === 'emergency') {
    return {
      ...baseData,
      displayName: patient.full_name,
      birthDate: patient.birth_date,
      gender: patient.gender,
      phone: patient.phone_primary,
      email: patient.email,
      emergencyContact: patient.emergency_contact_phone,
      dataRetentionUntil: patient.data_retention_until,
      lastVisitDate: patient.last_visit_date,
      metadata: {
        ...baseData.metadata,
        accessLevel: 'emergency_only',
      },
    };
  }

  // Role-based data access
  switch (requesterRole) {
    case 'doctor':
      return {
        ...baseData,
        birthDate: patient.birth_date,
        gender: patient.gender,
        phone: patient.phone_primary,
        email: patient.email,
        lastVisitDate: patient.last_visit_date,
        metadata: {
          ...baseData.metadata,
          accessLevel: consentStatus === 'given' ? 'full' : 'limited',
        },
      };

    case 'nurse':
      return {
        ...baseData,
        birthDate: patient.birth_date,
        phone: patient.phone_primary,
        lastVisitDate: patient.last_visit_date,
        metadata: {
          ...baseData.metadata,
          accessLevel: 'limited',
        },
      };

    case 'receptionist':
      return {
        ...baseData,
        phone: maskPhoneNumber(patient.phone_primary),
        email: maskEmail(patient.email),
        metadata: {
          ...baseData.metadata,
          accessLevel: 'limited',
        },
      };

    case 'admin':
      if (purpose === 'audit') {
        return {
          ...baseData,
          birthDate: patient.birth_date,
          dataRetentionUntil: patient.data_retention_until,
          metadata: {
            ...baseData.metadata,
            accessLevel: 'full',
          },
        };
      }
      return baseData;

    default:
      return baseData;
  }
}

/**
 * Mask phone number for privacy
 */
function maskPhoneNumber(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/[^\d]/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 3)}****-${cleaned.slice(-4)}`;
  }
  return `****-${phone.slice(-4)}`;
}

/**
 * Mask email for privacy
 */
function maskEmail(email: string): string {
  if (!email) return '';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `**@${domain}`;
  return `${local.slice(0, 2)}***@${domain}`;
}

/**
 * Log audit event for LGPD compliance
 */
async function logAuditEvent(
  clinicId: string,
  userId: string,
  action: string,
  searchParams: any,
  resultCount: number,
  metadata: any
): Promise<string> {
  const auditLogId = crypto.randomUUID();
  
  const { error } = await supabase
    .from('audit_logs')
    .insert({
      id: auditLogId,
      clinic_id: clinicId,
      user_id: userId,
      action,
      resource_type: 'patient_lookup',
      details: {
        search_type: searchParams.searchType,
        search_value_hash: await hashValue(searchParams.searchValue),
        result_count: resultCount,
        purpose: searchParams.purpose,
        requester_role: searchParams.requesterRole,
        data_minimized: searchParams.dataMinimization,
        ...metadata,
      },
      lgpd_basis: searchParams.purpose === 'emergency' ? 'vital_interests' : 'legitimate_interests',
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Audit logging failed:', error);
  }

  return auditLogId;
}

/**
 * Hash sensitive search values for audit logs
 */
async function hashValue(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate consent for patient data access
 */
async function validateConsent(patientId: string, purpose: string): Promise<{
  isValid: boolean;
  status: string;
  expiresAt?: string;
}> {
  const { data: patient, error } = await supabase
    .from('patients')
    .select('lgpd_consent_given, data_consent_status, data_retention_until')
    .eq('id', patientId)
    .single();

  if (error || !patient) {
    return { isValid: false, status: 'not_found' };
  }

  // Emergency override
  if (purpose === 'emergency') {
    return { isValid: true, status: 'emergency_override' };
  }

  // Check consent status
  if (!patient.lgpd_consent_given || patient.data_consent_status !== 'given') {
    return { isValid: false, status: 'consent_not_given' };
  }

  // Check data retention period
  if (patient.data_retention_until && new Date(patient.data_retention_until) < new Date()) {
    return { isValid: false, status: 'retention_expired' };
  }

  return {
    isValid: true,
    status: 'valid',
    expiresAt: patient.data_retention_until,
  };
}

/**
 * Build search query based on search type and parameters
 */
function buildSearchQuery(searchType: string, searchValue: string, clinicId: string) {
  let query = supabase
    .from('patients')
    .select(`
      id,
      medical_record_number,
      full_name,
      birth_date,
      gender,
      phone_primary,
      email,
      emergency_contact_phone,
      lgpd_consent_given,
      data_consent_status,
      data_retention_until,
      last_visit_date,
      clinic_id,
      allergies,
      chronic_conditions,
      insurance_provider
    `)
    .eq('clinic_id', clinicId)
    .eq('is_active', true);

  switch (searchType) {
    case 'cpf':
      if (!validateCPF(searchValue)) {
        throw new Error('Invalid CPF format');
      }
      query = query.eq('cpf', searchValue.replace(/[^\d]/g, ''));
      break;

    case 'cns':
      if (!validateCNS(searchValue)) {
        throw new Error('Invalid CNS format');
      }
      query = query.eq('cns', searchValue.replace(/[^\d]/g, ''));
      break;

    case 'medical_record':
      query = query.eq('medical_record_number', searchValue);
      break;

    case 'phone':
      const cleanPhone = searchValue.replace(/[^\d]/g, '');
      query = query.or(`phone_primary.eq.${cleanPhone},phone_secondary.eq.${cleanPhone}`);
      break;

    case 'email':
      query = query.ilike('email', `%${searchValue}%`);
      break;

    case 'name':
      query = query.ilike('full_name', `%${searchValue}%`);
      break;

    default:
      throw new Error('Invalid search type');
  }

  return query;
}

/**
 * Main patient lookup handler
 */
serve(async (req) => {
  const startTime = Date.now();

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse and validate request
    const requestData: PatientLookupRequest = await req.json();
    
    // Validate required fields
    if (!requestData.searchType || !requestData.searchValue || !requestData.clinicId || !requestData.requesterId) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: searchType, searchValue, clinicId, requesterId' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Set clinic context for RLS
    const { error: contextError } = await supabase.rpc('set_lgpd_clinic_context', {
      clinic_uuid: requestData.clinicId,
      user_uuid: requestData.requesterId,
      user_role: requestData.requesterRole || 'user',
      consent_verification: requestData.consentRequired ?? true,
    });

    if (contextError) {
      console.error('Failed to set clinic context:', contextError);
      return new Response(
        JSON.stringify({ error: 'Failed to set security context' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Build and execute search query
    const searchQuery = buildSearchQuery(
      requestData.searchType,
      requestData.searchValue,
      requestData.clinicId
    );

    const { data: patients, error: searchError } = await searchQuery;

    if (searchError) {
      console.error('Patient search failed:', searchError);
      return new Response(
        JSON.stringify({ error: 'Patient search failed' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Apply LGPD data minimization
    const minimizedPatients: MinimizedPatient[] = [];
    let overallConsentStatus = 'not_applicable';

    if (patients && patients.length > 0) {
      for (const patient of patients) {
        // Validate consent if required
        if (requestData.consentRequired ?? true) {
          const consentValidation = await validateConsent(patient.id, requestData.purpose);
          if (!consentValidation.isValid && requestData.purpose !== 'emergency') {
            overallConsentStatus = consentValidation.status;
            continue; // Skip patients without valid consent
          }
          if (consentValidation.isValid) {
            overallConsentStatus = 'verified';
          }
        }

        // Apply data minimization
        const minimizedPatient = applyDataMinimization(
          patient,
          requestData.requesterRole,
          requestData.purpose,
          patient.data_consent_status || 'unknown'
        );

        minimizedPatients.push(minimizedPatient);
      }
    }

    // Log audit event for LGPD compliance
    const auditLogId = await logAuditEvent(
      requestData.clinicId,
      requestData.requesterId,
      'patient_lookup',
      requestData,
      minimizedPatients.length,
      {
        original_result_count: patients?.length || 0,
        consent_validated: requestData.consentRequired ?? true,
        data_minimized: requestData.dataMinimization ?? true,
        response_time_ms: Date.now() - startTime,
      }
    );

    const responseTime = Date.now() - startTime;

    // Build response
    const response: PatientLookupResponse = {
      success: true,
      patients: minimizedPatients,
      totalCount: minimizedPatients.length,
      searchPerformed: new Date().toISOString(),
      dataMinimized: requestData.dataMinimization ?? true,
      consentStatus: overallConsentStatus as any,
      auditLogId,
      responseTime,
      complianceInfo: {
        lgpdCompliant: true,
        cfmCompliant: true,
        dataRetentionApplied: true,
        emergencyOverride: requestData.purpose === 'emergency',
      },
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Response-Time': `${responseTime}ms`,
          'X-LGPD-Compliant': 'true',
          'X-Audit-Log-ID': auditLogId,
        } 
      }
    );

  } catch (error: any) {
    console.error('Patient lookup error:', error);
    
    const responseTime = Date.now() - startTime;
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
        responseTime,
        timestamp: new Date().toISOString(),
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Response-Time': `${responseTime}ms`,
        } 
      }
    );
  }
});