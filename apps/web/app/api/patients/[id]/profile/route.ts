import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/app/utils/supabase/server';
import { PatientProfileUpdateSchema } from '@/lib/validations/patient-profile';

// GET - Retrieve patient profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch patient profile with related data
    const { data: patient, error } = await supabase
      .from('patients')
      .select(
        `
        *,
        patient_profiles (*),
        emergency_contacts (*),
        lgpd_consents (*),
        contact_preferences (*)
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Log data access for LGPD audit
    await supabase.from('lgpd_audit_log').insert({
      patient_id: id,
      action: 'read',
      data_fields: ['profile', 'emergency_contacts', 'preferences'],
      legal_basis: 'Consentimento do titular (Art. 7°, I, LGPD)',
      user_agent: request.headers.get('user-agent'),
      ip_address: request.ip || 'unknown',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ data: patient });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} // PUT - Update patient profile
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();

    // Validate LGPD consent
    if (
      !(
        body.lgpdConsent?.dataProcessingConsent &&
        body.lgpdConsent?.sensitiveDataConsent
      )
    ) {
      return NextResponse.json(
        { error: 'LGPD consent required for processing health data' },
        { status: 400 }
      );
    }

    // Validate profile data
    const validatedData = PatientProfileUpdateSchema.parse(body);

    const { id } = await params;

    // Start transaction
    const { data: updatedPatient, error: updateError } = await supabase.rpc(
      'update_patient_profile_with_lgpd_audit',
      {
        p_patient_id: id,
        p_profile_data: validatedData,
        p_user_agent: request.headers.get('user-agent') || 'unknown',
        p_ip_address: request.ip || 'unknown',
      }
    );

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update patient profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Patient profile updated successfully',
      data: updatedPatient,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Partial update patient profile
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();

    const { id } = await params;

    // Check if patient exists and user has permission
    const { data: patient, error: fetchError } = await supabase
      .from('patients')
      .select('id, clinic_id')
      .eq('id', id)
      .single();

    if (fetchError || !patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Log data modification for LGPD audit
    await supabase.from('lgpd_audit_log').insert({
      patient_id: id,
      action: 'update',
      data_fields: Object.keys(body),
      legal_basis: 'Legítimo interesse (Art. 7°, IX, LGPD)',
      user_agent: request.headers.get('user-agent'),
      ip_address: request.ip || 'unknown',
      timestamp: new Date().toISOString(),
    });

    // Perform partial update
    const { data: updatedPatient, error: updateError } = await supabase
      .from('patients')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update patient profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Patient profile updated successfully',
      data: updatedPatient,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
