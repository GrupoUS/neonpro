// Story 3.2: API Endpoint - Comprehensive Patient Insights

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { PatientInsightsIntegration } from '@/lib/ai/patient-insights';
import type { PatientInsightRequest } from '@/lib/ai/patient-insights/types';

const patientInsights = new PatientInsightsIntegration();

export async function GET(
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

    // Validate patient access
    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('id', patientId)
      .single();

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const requestedInsights = searchParams.get('insights')?.split(',') || [];
    const treatmentContext = searchParams.get('context') || undefined;

    // Create comprehensive insight request
    const insightRequest: PatientInsightRequest = {
      patientId,
      requestedInsights:
        requestedInsights.length > 0 ? (requestedInsights as any[]) : undefined,
      treatmentContext,
      timestamp: new Date(),
      requestId: `req_${Date.now()}_${patientId}`,
    };

    // Generate comprehensive insights
    const comprehensiveInsights =
      await patientInsights.generateComprehensiveInsights(insightRequest);

    return NextResponse.json({
      success: true,
      data: comprehensiveInsights,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to generate comprehensive insights' },
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

    // Create detailed insight request from body
    const insightRequest: PatientInsightRequest = {
      patientId,
      requestedInsights: body.requestedInsights || [],
      treatmentContext: body.treatmentContext,
      treatmentId: body.treatmentId,
      customParameters: body.customParameters || {},
      feedbackData: body.feedbackData,
      timestamp: new Date(),
      requestId: body.requestId || `req_${Date.now()}_${patientId}`,
    };

    // Generate comprehensive insights with custom parameters
    const comprehensiveInsights =
      await patientInsights.generateComprehensiveInsights(insightRequest);

    return NextResponse.json({
      success: true,
      data: comprehensiveInsights,
      requestId: insightRequest.requestId,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to generate comprehensive insights' },
      { status: 500 }
    );
  }
}
