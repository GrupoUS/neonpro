// Story 3.2: API Endpoint - Risk Assessment

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { PatientInsightsIntegration } from '@/lib/ai/patient-insights';

const patientInsights = new PatientInsightsIntegration();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { patientId } = await params;

    // Validate patient access
    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('id', patientId)
      .single();

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Generate risk assessment
    const riskAssessment =
      await patientInsights.generateQuickRiskAssessment(patientId);

    return NextResponse.json({
      success: true,
      data: riskAssessment,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to generate risk assessment' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { patientId } = await params;
    const body = await request.json();
    const { includeRecommendations = true } = body;

    // Generate comprehensive risk assessment
    const riskAssessment =
      await patientInsights.generateQuickRiskAssessment(patientId);

    let recommendations = [];
    if (includeRecommendations) {
      const treatmentGuidance =
        await patientInsights.generateTreatmentGuidance(patientId);
      recommendations = treatmentGuidance.primaryRecommendations || [];
    }

    return NextResponse.json({
      success: true,
      data: {
        ...riskAssessment,
        recommendations,
      },
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to generate comprehensive risk assessment' },
      { status: 500 }
    );
  }
}
