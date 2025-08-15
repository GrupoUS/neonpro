import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

/**
 * Get Patient Profile
 * Retrieves comprehensive patient profile data
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { id: patientId } = await params;

    // Get user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user permissions
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (!(userRole && ['admin', 'doctor', 'nurse'].includes(userRole.role))) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get patient profile
    const { data: profile, error: profileError } = await supabase
      .from('patient_profiles_extended')
      .select(`
        *,
        patient_documents(*),
        emergency_contacts(*),
        patient_care_team(*)
      `)
      .eq('patient_id', patientId)
      .single();

    if (profileError) {
      console.error('Error fetching patient profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch patient profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      profile,
      message: 'Patient profile retrieved successfully',
    });
  } catch (error) {
    console.error('Error in GET /api/patients/[id]/profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Update Patient Profile
 * Updates patient profile data
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { id: patientId } = await params;
    const body = await request.json();

    // Get user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user permissions
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (!(userRole && ['admin', 'doctor', 'nurse'].includes(userRole.role))) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Validate input
    const {
      demographics,
      medical_history,
      chronic_conditions,
      medications,
      allergies,
      bmi,
      blood_type,
      emergency_contacts,
      care_preferences,
    } = body;

    // Update patient profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('patient_profiles_extended')
      .update({
        demographics: demographics || {},
        medical_history: medical_history || [],
        chronic_conditions: chronic_conditions || [],
        current_medications: medications || [],
        allergies: allergies || [],
        bmi,
        blood_type,
        care_preferences: care_preferences || {},
        updated_at: new Date().toISOString(),
      })
      .eq('patient_id', patientId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating patient profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update patient profile' },
        { status: 500 }
      );
    }

    // Update emergency contacts if provided
    if (emergency_contacts && emergency_contacts.length > 0) {
      // Delete existing contacts
      await supabase
        .from('emergency_contacts')
        .delete()
        .eq('patient_id', patientId);

      // Insert new contacts
      const { error: contactsError } = await supabase
        .from('emergency_contacts')
        .insert(
          emergency_contacts.map((contact: any) => ({
            patient_id: patientId,
            ...contact,
          }))
        );

      if (contactsError) {
        console.error('Error updating emergency contacts:', contactsError);
      }
    }

    return NextResponse.json({
      profile: updatedProfile,
      message: 'Patient profile updated successfully',
    });
  } catch (error) {
    console.error('Error in PUT /api/patients/[id]/profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
