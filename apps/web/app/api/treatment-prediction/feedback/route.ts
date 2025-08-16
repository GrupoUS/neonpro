// GET/POST /api/treatment-prediction/feedback - Prediction feedback management

import { type NextRequest, NextResponse } from 'next/server';
import { TreatmentPredictionService } from '@/app/lib/services/treatment-prediction';
import { createServerClient } from '@/app/utils/supabase/server';

// GET /api/treatment-prediction/feedback - Get prediction feedback
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate authentication
    const supabase = await createServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const predictionId = searchParams.get('prediction_id');

    const predictionService = new TreatmentPredictionService();
    const feedback = await predictionService.getFeedback(
      predictionId || undefined,
    );

    return NextResponse.json({
      feedback,
      total: feedback.length,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch prediction feedback' },
      { status: 500 },
    );
  }
}

// POST /api/treatment-prediction/feedback - Create prediction feedback
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (
      !(body.prediction_id && body.feedback_type) ||
      body.rating === undefined
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: prediction_id, feedback_type, rating',
        },
        { status: 400 },
      );
    }

    // Validate rating range
    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 },
      );
    }

    // Verify prediction exists
    const { data: prediction } = await supabase
      .from('treatment_predictions')
      .select('id')
      .eq('id', body.prediction_id)
      .single();

    if (!prediction) {
      return NextResponse.json(
        { error: 'Prediction not found' },
        { status: 404 },
      );
    }

    // Prepare feedback data
    const feedbackData = {
      ...body,
      provider_id: session.user.id,
    };

    const predictionService = new TreatmentPredictionService();
    const feedback = await predictionService.createFeedback(feedbackData);

    return NextResponse.json(
      {
        feedback,
        message: 'Prediction feedback created successfully',
      },
      { status: 201 },
    );
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to create prediction feedback' },
      { status: 500 },
    );
  }
}
