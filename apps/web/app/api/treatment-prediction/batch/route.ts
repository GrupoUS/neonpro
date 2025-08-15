// POST /api/treatment-prediction/batch - Batch prediction generation

import { type NextRequest, NextResponse } from 'next/server';
import { TreatmentPredictionService } from '@/app/lib/services/treatment-prediction';
import type { BatchPredictionRequest } from '@/app/types/treatment-prediction';
import { createServerClient } from '@/app/utils/supabase/server';

// POST /api/treatment-prediction/batch - Generate batch predictions
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission for batch operations
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (
      !(profile && ['admin', 'manager', 'practitioner'].includes(profile.role))
    ) {
      return NextResponse.json(
        { error: 'Insufficient permissions for batch operations' },
        { status: 403 }
      );
    }

    const body: BatchPredictionRequest = await request.json();

    // Validate request
    if (
      !(body.predictions && Array.isArray(body.predictions)) ||
      body.predictions.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid request: predictions array is required and must not be empty',
        },
        { status: 400 }
      );
    }

    // Limit batch size for performance
    if (body.predictions.length > 100) {
      return NextResponse.json(
        { error: 'Batch size limited to 100 predictions per request' },
        { status: 400 }
      );
    }

    // Validate each prediction request
    for (const [index, pred] of body.predictions.entries()) {
      if (!(pred.patient_id && pred.treatment_type)) {
        return NextResponse.json(
          {
            error: `Invalid prediction at index ${index}: patient_id and treatment_type are required`,
          },
          { status: 400 }
        );
      }
    }

    // Verify all patients exist
    const patientIds = body.predictions.map((p) => p.patient_id);
    const { data: patients } = await supabase
      .from('patients')
      .select('id')
      .in('id', patientIds);

    if (!patients || patients.length !== patientIds.length) {
      return NextResponse.json(
        { error: 'One or more patients not found' },
        { status: 404 }
      );
    }

    const predictionService = new TreatmentPredictionService();
    const batchResponse =
      await predictionService.generateBatchPredictions(body);

    return NextResponse.json(
      {
        ...batchResponse,
        message: `Batch prediction completed: ${batchResponse.predictions.length} predictions generated`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error generating batch predictions:', error);
    return NextResponse.json(
      { error: 'Failed to generate batch predictions' },
      { status: 500 }
    );
  }
}
