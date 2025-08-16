import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import PatientInsights from '@/lib/ai/patient-insights';
import type { Database } from '@/types/supabase';

/**
 * Generate AI Patient Insights
 * Provides AI-powered analysis and recommendations for patient care
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
        { status: 403 },
      );
    }

    // Generate AI insights
    const insightsEngine = new PatientInsights();
    const insights = await insightsEngine.generatePatientInsights(patientId);

    if (!insights) {
      return NextResponse.json(
        { error: 'Failed to generate patient insights' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      insights,
      message: 'Patient insights generated successfully',
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * Update Risk Assessment
 * Updates patient risk assessment manually
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const patientId = id;
    const body = await request.json();

    // Get user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user permissions (only doctors can update risk assessments)
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (!(userRole && ['admin', 'doctor'].includes(userRole.role))) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 },
      );
    }

    const { risk_score, risk_level, notes } = body;

    // Update patient risk assessment
    const { data: updatedProfile, error: updateError } = await supabase
      .from('patient_profiles_extended')
      .update({
        risk_score,
        risk_level,
        risk_assessment_notes: notes,
        last_assessment_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('patient_id', patientId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update risk assessment' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      profile: updatedProfile,
      message: 'Risk assessment updated successfully',
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
