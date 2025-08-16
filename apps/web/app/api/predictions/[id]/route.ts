// Story 10.2: Progress Tracking through Computer Vision - Individual Prediction API
// API endpoint for individual prediction operations

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { progressTrackingService } from '@/app/lib/services/progress-tracking';

const verifyPredictionSchema = z.object({
  actual_outcome: z.record(z.any()),
  accuracy_score: z.number().min(0).max(100),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Validate request body
    const { actual_outcome, accuracy_score } =
      verifyPredictionSchema.parse(body);

    // Verify prediction
    const prediction = await progressTrackingService.verifyPrediction(
      id,
      actual_outcome,
      accuracy_score,
    );

    return NextResponse.json(prediction);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to verify prediction' },
      { status: 500 },
    );
  }
}
