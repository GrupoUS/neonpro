/**
 * Supabase Patient Management Functions
 * 
 * Provides FHIR-compliant database operations for patient management
 * with LGPD compliance and comprehensive audit logging.
 */

import { createClient } from '@/lib/supabase/client';
import { createServerClient } from '@/lib/supabase/server';
import { 
  FHIRPatient, 
  PatientDB, 
  PatientConsentDB, 
  MedicalConditionDB, 
  AllergyIntoleranceDB,
  LGPDConsent
} from '@/lib/types/fhir';
import type { 
  PatientRegistrationData, 
  PatientSearchParams 
} from '@/lib/validations/patient';

// Error types for better error handling
export class PatientError extends Error {
  constructor(message: string, public code: string, public statusCode: number = 500) {
    super(message);
    this.name = 'PatientError';
  }
}

// Transform registration data to FHIR Patient resource
export function transformRegistrationToFHIR(
  data: PatientRegistrationData,
  clinic_id: string,
  user_id: string
): { patient: Omit<PatientDB, 'id'>, consents: Omit<PatientConsentDB, 'id' | 'patient_id'>[] } {
  const now = new Date().toISOString();
  
  // Build FHIR Patient resource
  const fhir_patient: FHIRPatient = {
    resourceType: 'Patient',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
            code: 'MR',
            display: 'Medical Record Number'
          }],
          text: 'Medical Record Number'
        },
        system: `${process.env.NEXT_PUBLIC_SITE_URL}/patients`,
        value: data.medical_record_number
      }
    ],
    active: true,
    name: [{
      use: 'official',
      family: data.family_name,
      given: data.given_names,
      text: `${data.given_names.join(' ')} ${data.family_name}`
    }],
    telecom: [
      {
        system: 'phone',
        value: data.phone_primary,
        use: 'mobile',
        rank: 1
      }
    ],
    gender: data.gender,
    birthDate: data.birth_date,
    address: [{
      use: 'home',
      type: 'physical',
      line: data.address_line2 ? [data.address_line1, data.address_line2] : [data.address_line1],
      city: data.city,
      state: data.state,
      postalCode: data.postal_code,
      country: data.country || 'BR'
    }],
    contact: [{
      relationship: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/v2-0131',
          code: 'EP',
          display: 'Emergency contact person'
        }],
        text: data.emergency_contact_relationship
      }],
      name: {
        text: data.emergency_contact_name
      },
      telecom: [{
        system: 'phone',
        value: data.emergency_contact_phone,
        use: 'home'
      }]
    }]
  };

  // Add optional fields
  if (data.cpf) {
    fhir_patient.identifier?.push({
      use: 'official',
      type: {
        coding: [{
          system: 'http://www.saude.gov.br/fhir/r4/CodeSystem/BRTipoDocumento',
          code: 'CPF',
          display: 'Cadastro de Pessoa Física'
        }],
        text: 'CPF'
      },
      system: 'http://www.receita.fazenda.gov.br/cpf',
      value: data.cpf
    });
  }

  if (data.rg) {
    fhir_patient.identifier?.push({
      use: 'official',
      type: {
        coding: [{
          system: 'http://www.saude.gov.br/fhir/r4/CodeSystem/BRTipoDocumento',
          code: 'RG',
          display: 'Registro Geral'
        }],
        text: 'RG'
      },
      value: data.rg
    });
  }

  if (data.email) {
    fhir_patient.telecom?.push({
      system: 'email',
      value: data.email,
      use: 'home'
    });
  }

  if (data.phone_secondary) {
    fhir_patient.telecom?.push({
      system: 'phone',
      value: data.phone_secondary,
      use: 'home',
      rank: 2
    });
  }

  if (data.emergency_contact_email) {
    fhir_patient.contact?.[0]?.telecom?.push({
      system: 'email',
      value: data.emergency_contact_email,
      use: 'home'
    });
  }

  if (data.marital_status) {
    fhir_patient.maritalStatus = {
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/v3-MaritalStatus',
        code: data.marital_status.toUpperCase(),
        display: data.marital_status
      }],
      text: data.marital_status
    };
  }

  if (data.preferred_language && data.preferred_language !== 'pt-BR') {
    fhir_patient.communication = [{
      language: {
        coding: [{
          system: 'urn:ietf:bcp:47',
          code: data.preferred_language
        }]
      },
      preferred: true
    }];
  }

  // Create patient record
  const patient: Omit<PatientDB, 'id'> = {
    clinic_id,
    medical_record_number: data.medical_record_number,
    fhir_data: fhir_patient,
    active: true,
    created_at: now,
    updated_at: now,
    created_by: user_id,
    updated_by: user_id
  };

  // Create LGPD consents
  const consents: Omit<PatientConsentDB, 'id' | 'patient_id'>[] = [];

  // General consent (required)
  if (data.lgpd_consent_general) {
    consents.push({
      consent_type: 'explicit',
      purpose: 'Healthcare service provision and medical record management',
      data_categories: ['demographics', 'contact_information', 'medical_history', 'emergency_contacts'],
      retention_period_years: 20, // Minimum for medical records in Brazil
      consent_date: now,
      is_active: true,
      legal_basis_article: 'LGPD Article 11, Item I - Health data processing for healthcare provision',
      processing_details: 'Patient data will be used for healthcare service provision, appointment scheduling, medical record management, and emergency contact purposes.',
      created_at: now,
      updated_at: now
    });
  }  // Marketing consent (optional)
  if (data.lgpd_consent_marketing) {
    consents.push({
      consent_type: 'explicit',
      purpose: 'Marketing communications and promotional materials',
      data_categories: ['contact_information', 'demographics', 'service_preferences'],
      retention_period_years: 5,
      consent_date: now,
      is_active: true,
      legal_basis_article: 'LGPD Article 7, Item I - Explicit consent for marketing',
      processing_details: 'Patient contact information will be used to send marketing communications, promotional materials, and service updates.',
      created_at: now,
      updated_at: now
    });
  }

  // Research consent (optional)
  if (data.lgpd_consent_research) {
    consents.push({
      consent_type: 'explicit',
      purpose: 'Medical research and clinical studies (anonymized)',
      data_categories: ['medical_history', 'demographics', 'treatment_outcomes'],
      retention_period_years: 10,
      consent_date: now,
      is_active: true,
      legal_basis_article: 'LGPD Article 7, Item I - Explicit consent for research',
      processing_details: 'Anonymized patient data may be used for medical research and clinical studies to improve healthcare services.',
      created_at: now,
      updated_at: now
    });
  }

  // Third-party sharing consent (optional)
  if (data.lgpd_consent_third_party) {
    consents.push({
      consent_type: 'explicit',
      purpose: 'Data sharing with healthcare partners and insurance providers',
      data_categories: ['medical_history', 'demographics', 'treatment_records'],
      retention_period_years: 5,
      consent_date: now,
      is_active: true,
      legal_basis_article: 'LGPD Article 7, Item I - Explicit consent for third-party sharing',
      processing_details: 'Patient data may be shared with healthcare partners, insurance providers, and other authorized third parties as necessary for care coordination.',
      created_at: now,
      updated_at: now
    });
  }

  return { patient, consents };
}

// Create a new patient with LGPD consents
export async function createPatient(
  data: PatientRegistrationData,
  user_id: string
): Promise<{ patient: PatientDB; consents: PatientConsentDB[] }> {
  const supabase = await createClient();
  
  try {
    // Get user's clinic
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', user_id)
      .single();

    if (profileError || !profile?.clinic_id) {
      throw new PatientError('User clinic not found', 'CLINIC_NOT_FOUND', 404);
    }

    // Check if medical record number already exists in this clinic
    const { data: existingPatient, error: checkError } = await supabase
      .from('patients')
      .select('id')
      .eq('clinic_id', profile.clinic_id)
      .eq('medical_record_number', data.medical_record_number)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new PatientError('Database error checking medical record number', 'DATABASE_ERROR');
    }

    if (existingPatient) {
      throw new PatientError(
        'Medical record number already exists in this clinic',
        'DUPLICATE_MEDICAL_RECORD',
        409
      );
    }

    // Transform data to FHIR format
    const { patient: patientData, consents: consentData } = transformRegistrationToFHIR(
      data,
      profile.clinic_id,
      user_id
    );

    // Insert patient
    const { data: createdPatient, error: patientError } = await supabase
      .from('patients')
      .insert([patientData])
      .select()
      .single();

    if (patientError) {
      throw new PatientError(
        `Failed to create patient: ${patientError.message}`,
        'PATIENT_CREATION_FAILED'
      );
    }

    // Insert consents
    const consentsWithPatientId = consentData.map(consent => ({
      ...consent,
      patient_id: createdPatient.id
    }));

    const { data: createdConsents, error: consentError } = await supabase
      .from('patient_consents')
      .insert(consentsWithPatientId)
      .select();

    if (consentError) {
      // Rollback patient creation if consent creation fails
      await supabase.from('patients').delete().eq('id', createdPatient.id);
      throw new PatientError(
        `Failed to create patient consents: ${consentError.message}`,
        'CONSENT_CREATION_FAILED'
      );
    }

    return {
      patient: createdPatient,
      consents: createdConsents || []
    };
  } catch (error) {
    if (error instanceof PatientError) {
      throw error;
    }
    throw new PatientError(
      `Unexpected error creating patient: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNEXPECTED_ERROR'
    );
  }
}

// Search patients with filters and pagination
export async function searchPatients(
  params: PatientSearchParams,
  user_id: string
): Promise<{
  patients: (PatientDB & { consents_count: number })[];
  total_count: number;
  has_next_page: boolean;
}> {
  const supabase = await createClient();
  
  try {
    // Get user's clinic
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', user_id)
      .single();

    if (profileError || !profile?.clinic_id) {
      throw new PatientError('User clinic not found', 'CLINIC_NOT_FOUND', 404);
    }

    // Build query
    let query = supabase
      .from('patients')
      .select(`
        *,
        consents_count:patient_consents(count)
      `, { count: 'exact' })
      .eq('clinic_id', profile.clinic_id);

    // Apply filters
    if (params.query) {
      // Search in patient name (FHIR data) and medical record number
      query = query.or(`medical_record_number.ilike.%${params.query}%,fhir_data->>name.ilike.%${params.query}%`);
    }

    if (params.medical_record_number) {
      query = query.eq('medical_record_number', params.medical_record_number);
    }

    if (params.active !== undefined) {
      query = query.eq('active', params.active);
    }

    if (params.created_from) {
      query = query.gte('created_at', params.created_from);
    }

    if (params.created_to) {
      query = query.lte('created_at', params.created_to);
    }

    // Apply sorting
    const sortField = params.sort_by === 'name' ? 'fhir_data->name->0->>text' : params.sort_by;
    query = query.order(sortField, { ascending: params.sort_order === 'asc' });

    // Apply pagination
    query = query.range(params.offset, params.offset + params.limit - 1);

    const { data: patients, error: searchError, count } = await query;

    if (searchError) {
      throw new PatientError(
        `Failed to search patients: ${searchError.message}`,
        'SEARCH_FAILED'
      );
    }

    return {
      patients: patients || [],
      total_count: count || 0,
      has_next_page: (count || 0) > params.offset + params.limit
    };
  } catch (error) {
    if (error instanceof PatientError) {
      throw error;
    }
    throw new PatientError(
      `Unexpected error searching patients: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNEXPECTED_ERROR'
    );
  }
}

// Get patient by ID with full details
export async function getPatientById(
  patient_id: string,
  user_id: string
): Promise<PatientDB & {
  consents: PatientConsentDB[];
  conditions: MedicalConditionDB[];
  allergies: AllergyIntoleranceDB[];
} | null> {
  const supabase = await createClient();
  
  try {
    // Get user's clinic for security check
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', user_id)
      .single();

    if (profileError || !profile?.clinic_id) {
      throw new PatientError('User clinic not found', 'CLINIC_NOT_FOUND', 404);
    }

    // Get patient with related data
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select(`
        *,
        consents:patient_consents(*),
        conditions:medical_conditions(*),
        allergies:allergies_intolerances(*)
      `)
      .eq('id', patient_id)
      .eq('clinic_id', profile.clinic_id)
      .single();

    if (patientError) {
      if (patientError.code === 'PGRST116') {
        return null; // Patient not found
      }
      throw new PatientError(
        `Failed to get patient: ${patientError.message}`,
        'GET_PATIENT_FAILED'
      );
    }

    return patient;
  } catch (error) {
    if (error instanceof PatientError) {
      throw error;
    }
    throw new PatientError(
      `Unexpected error getting patient: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNEXPECTED_ERROR'
    );
  }
}

// Update patient LGPD consent
export async function updatePatientConsent(
  patient_id: string,
  consent_id: string,
  updates: Partial<Omit<PatientConsentDB, 'id' | 'patient_id' | 'created_at'>>,
  user_id: string
): Promise<PatientConsentDB> {
  const supabase = await createClient();
  
  try {
    // Verify patient belongs to user's clinic
    const patient = await getPatientById(patient_id, user_id);
    if (!patient) {
      throw new PatientError('Patient not found', 'PATIENT_NOT_FOUND', 404);
    }

    // Update consent
    const { data: updatedConsent, error: updateError } = await supabase
      .from('patient_consents')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', consent_id)
      .eq('patient_id', patient_id)
      .select()
      .single();

    if (updateError) {
      throw new PatientError(
        `Failed to update consent: ${updateError.message}`,
        'UPDATE_CONSENT_FAILED'
      );
    }

    return updatedConsent;
  } catch (error) {
    if (error instanceof PatientError) {
      throw error;
    }
    throw new PatientError(
      `Unexpected error updating consent: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNEXPECTED_ERROR'
    );
  }
}

/**
 * Get patient statistics for dashboard
 * 
 * Returns aggregated statistics for patient management dashboard
 * including total patients, new patients, active patients, etc.
 */
export async function getPatientStats(clinicId?: string) {
  try {
    const supabase = await createClient();
    
    // Get current user and clinic
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new PatientError('Authentication required', 'AUTH_REQUIRED', 401);
    }

    // Use provided clinicId or get from user metadata
    const activeClinicId = clinicId || user.user_metadata?.clinic_id;
    if (!activeClinicId) {
      throw new PatientError('Clinic ID required', 'CLINIC_ID_REQUIRED', 400);
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));

    // Get total patients count
    const { count: totalPatients, error: totalError } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', activeClinicId)
      .is('deleted_at', null);

    if (totalError) {
      throw new PatientError(
        `Failed to get total patients: ${totalError.message}`,
        'STATS_FETCH_FAILED'
      );
    }

    // Get new patients this month
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const { count: newPatients, error: newError } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', activeClinicId)
      .gte('created_at', firstDayOfMonth.toISOString())
      .is('deleted_at', null);

    if (newError) {
      throw new PatientError(
        `Failed to get new patients: ${newError.message}`,
        'STATS_FETCH_FAILED'
      );
    }

    // Get active patients (with appointments in last 30 days)
    const { count: activePatients, error: activeError } = await supabase
      .from('appointments')
      .select('patient_id', { count: 'exact', head: true })
      .eq('clinic_id', activeClinicId)
      .gte('appointment_date', thirtyDaysAgo.toISOString())
      .is('deleted_at', null);

    if (activeError) {
      throw new PatientError(
        `Failed to get active patients: ${activeError.message}`,
        'STATS_FETCH_FAILED'
      );
    }

    // Get scheduled appointments for next 7 days
    const { count: scheduledAppointments, error: scheduledError } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', activeClinicId)
      .gte('appointment_date', now.toISOString())
      .lte('appointment_date', sevenDaysFromNow.toISOString())
      .in('status', ['scheduled', 'confirmed'])
      .is('deleted_at', null);

    if (scheduledError) {
      throw new PatientError(
        `Failed to get scheduled appointments: ${scheduledError.message}`,
        'STATS_FETCH_FAILED'
      );
    }

    const stats = {
      totalPatients: totalPatients || 0,
      newPatients: newPatients || 0,
      activePatients: activePatients || 0,
      scheduledAppointments: scheduledAppointments || 0,
    };

    return {
      success: true,
      data: stats,
      message: 'Patient statistics retrieved successfully'
    };

  } catch (error) {
    if (error instanceof PatientError) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
    
    return {
      success: false,
      error: `Unexpected error getting patient statistics: ${error instanceof Error ? error.message : 'Unknown error'}`,
      code: 'UNEXPECTED_ERROR'
    };
  }
}

