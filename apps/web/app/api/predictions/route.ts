// Story 10.2: Progress Tracking through Computer Vision - Predictions API
// API endpoint for managing progress predictions

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { progressTrackingService } from '@/app/lib/services/progress-tracking';
import { createProgressPredictionRequestSchema } from '@/app/lib/validations/progress-tracking';

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
    const validatedData = createProgressPredictionRequestSchema.parse(body);

    // Create progress prediction
    const prediction =
      await progressTrackingService.createProgressPrediction(validatedData);

    return NextResponse.json(prediction, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create progress prediction' },
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

    // Get progress predictions
    const predictions =
      await progressTrackingService.getProgressPredictions(patientId);

    return NextResponse.json(predictions);
  } catch (_error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch progress predictions' },
      { status: 500 }
    );
  }
}
