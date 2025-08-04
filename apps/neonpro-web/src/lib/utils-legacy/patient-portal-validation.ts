import { NextRequest } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export interface PatientSessionValidation {
  success: boolean;
  error?: string;
  patientSession?: {
    id: string;
    patient_id: string;
    clinic_id: string;
    session_token: string;
    expires_at: string;
    patient: {
      id: string;
      name: string;
      email: string;
      phone?: string;
    };
    clinic: {
      id: string;
      name: string;
    };
  };
}

export async function validatePatientSession(
  request: NextRequest
): Promise<PatientSessionValidation> {
  try {
    const supabase = await createClient();

    // Get session from Supabase auth
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    // Validate patient portal session
    const { data: patientSession, error: sessionError } = await supabase
      .from('patient_portal_sessions')
      .select(`
        id,
        patient_id,
        clinic_id,
        session_token,
        expires_at,
        patient:patients(
          id,
          name,
          email,
          phone
        ),
        clinic:clinics(
          id,
          name
        )
      `)
      .eq('session_token', session.access_token)
      .eq('is_active', true)
      .single();

    if (sessionError || !patientSession) {
      return {
        success: false,
        error: 'Invalid patient session'
      };
    }

    // Check if session is expired
    const expiresAt = new Date(patientSession.expires_at);
    const now = new Date();

    if (expiresAt < now) {
      // Deactivate expired session
      await supabase
        .from('patient_portal_sessions')
        .update({ is_active: false })
        .eq('id', patientSession.id);

      return {
        success: false,
        error: 'Session expired'
      };
    }

    return {
      success: true,
      patientSession: {
        id: patientSession.id,
        patient_id: patientSession.patient_id,
        clinic_id: patientSession.clinic_id,
        session_token: patientSession.session_token,
        expires_at: patientSession.expires_at,
        patient: patientSession.patient,
        clinic: patientSession.clinic
      }
    };

  } catch (error) {
    console.error('Session validation error:', error);
    return {
      success: false,
      error: 'Session validation failed'
    };
  }
}