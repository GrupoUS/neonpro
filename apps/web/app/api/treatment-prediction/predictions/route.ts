// GET/POST /api/treatment-prediction/predictions - Get/Create predictions

import { type NextRequest, NextResponse } from 'next/server';
import { TreatmentPredictionService } from '@/app/lib/services/treatment-prediction';
import type {
  PredictionFilters,
  PredictionRequest,
} from '@/app/types/treatment-prediction';
import { createServerClient } from '@/app/utils/supabase/server';

// GET /api/treatment-prediction/predictions - Get predictions with filters
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

    // Parse query parameters
    const filters: PredictionFilters = {};

    if (searchParams.get('patient_id')) {
      filters.patient_id = searchParams.get('patient_id')!;
    }
    if (searchParams.get('treatment_type')) {
      filters.treatment_type = searchParams.get('treatment_type')!;
    }
    if (searchParams.get('prediction_score_min')) {
      filters.prediction_score_min = Number.parseFloat(
        searchParams.get('prediction_score_min')!
      );
    }
    if (searchParams.get('prediction_score_max')) {
      filters.prediction_score_max = Number.parseFloat(
        searchParams.get('prediction_score_max')!
      );
    }
    if (searchParams.get('risk_assessment')) {
      filters.risk_assessment = searchParams.get('risk_assessment') as any;
    }
    if (searchParams.get('date_from')) {
      filters.date_from = searchParams.get('date_from')!;
    }
    if (searchParams.get('date_to')) {
      filters.date_to = searchParams.get('date_to')!;
    }
    if (searchParams.get('model_id')) {
      filters.model_id = searchParams.get('model_id')!;
    }
    if (searchParams.get('outcome')) {
      filters.outcome = searchParams.get('outcome')!;
    }
    if (searchParams.get('accuracy_validated')) {
      filters.accuracy_validated =
        searchParams.get('accuracy_validated') === 'true';
    }

    // Parse pagination
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    const predictionService = new TreatmentPredictionService();
    const predictions = await predictionService.getPredictions(filters);

    // Apply pagination
    const paginatedPredictions = predictions.slice(offset, offset + limit);

    return NextResponse.json({
      predictions: paginatedPredictions,
      pagination: {
        page,
        limit,
        total: predictions.length,
        total_pages: Math.ceil(predictions.length / limit),
      },
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch predictions' },
      { status: 500 }
    );
  }
}

// POST /api/treatment-prediction/predictions - Create new prediction
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: PredictionRequest = await request.json();

    // Validate required fields
    if (!(body.patient_id && body.treatment_type)) {
      return NextResponse.json(
        { error: 'Missing required fields: patient_id, treatment_type' },
        { status: 400 }
      );
    }

    // Verify patient exists and user has access
    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('id', body.patient_id)
      .single();

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const predictionService = new TreatmentPredictionService();
    const predictionResponse = await predictionService.generatePrediction(body);

    return NextResponse.json(
      {
        ...predictionResponse,
        message: 'Treatment prediction generated successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to generate prediction' },
      { status: 500 }
    );
  }
}
