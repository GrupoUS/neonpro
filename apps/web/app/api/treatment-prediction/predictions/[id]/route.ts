// PUT /api/treatment-prediction/predictions/[id] - Update prediction outcome

import { type NextRequest, NextResponse } from 'next/server';
import { TreatmentPredictionService } from '@/app/lib/services/treatment-prediction';
import { createServerClient } from '@/app/utils/supabase/server';

interface RouteParams {
  params: { id: string };
}

// PUT /api/treatment-prediction/predictions/[id] - Update prediction outcome
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields for outcome update
    if (!(body.actual_outcome && body.outcome_date)) {
      return NextResponse.json(
        { error: 'Missing required fields: actual_outcome, outcome_date' },
        { status: 400 }
      );
    }

    // Validate outcome value
    const validOutcomes = ['success', 'partial_success', 'failure'];
    if (!validOutcomes.includes(body.actual_outcome)) {
      return NextResponse.json(
        {
          error:
            'Invalid outcome. Must be: success, partial_success, or failure',
        },
        { status: 400 }
      );
    }

    // Verify prediction exists
    const { data: prediction } = await supabase
      .from('treatment_predictions')
      .select('id, patient_id')
      .eq('id', params.id)
      .single();

    if (!prediction) {
      return NextResponse.json(
        { error: 'Prediction not found' },
        { status: 404 }
      );
    }

    const predictionService = new TreatmentPredictionService();
    const updatedPrediction = await predictionService.updatePredictionOutcome(
      params.id,
      body.actual_outcome,
      body.outcome_date
    );

    return NextResponse.json({
      prediction: updatedPrediction,
      message: 'Prediction outcome updated successfully',
    });
  } catch (error) {
    console.error('Error updating prediction outcome:', error);
    return NextResponse.json(
      { error: 'Failed to update prediction outcome' },
      { status: 500 }
    );
  }
}
