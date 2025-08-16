// Story 10.2: Progress Tracking through Computer Vision - Multi-Session Analysis API
// API endpoint for creating and managing multi-session analyses

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { progressTrackingService } from '@/app/lib/services/progress-tracking';
import { createMultiSessionAnalysisRequestSchema } from '@/app/lib/validations/progress-tracking';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validatedData = createMultiSessionAnalysisRequestSchema.parse(body);

    // Create multi-session analysis
    const analysis =
      await progressTrackingService.createMultiSessionAnalysis(validatedData);

    return NextResponse.json(analysis, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create multi-session analysis' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id') || undefined;

    // Get multi-session analyses
    const analyses =
      await progressTrackingService.getMultiSessionAnalyses(patientId);

    return NextResponse.json(analyses);
  } catch (_error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch multi-session analyses' },
      { status: 500 }
    );
  }
}
