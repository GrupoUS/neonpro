// GET /api/treatment-prediction/models - Get prediction models
import { TreatmentPredictionService } from '@/app/lib/services/treatment-prediction';
import { ModelFilters } from '@/app/types/treatment-prediction';
import { createServerClient } from '@/app/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validate authentication
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const filters: ModelFilters = {};
    
    if (searchParams.get('status')) {
      filters.status = searchParams.get('status') as any;
    }
    if (searchParams.get('algorithm_type')) {
      filters.algorithm_type = searchParams.get('algorithm_type') as any;
    }
    if (searchParams.get('accuracy_min')) {
      filters.accuracy_min = parseFloat(searchParams.get('accuracy_min')!);
    }
    if (searchParams.get('version')) {
      filters.version = searchParams.get('version')!;
    }
    if (searchParams.get('created_from')) {
      filters.created_from = searchParams.get('created_from')!;
    }
    if (searchParams.get('created_to')) {
      filters.created_to = searchParams.get('created_to')!;
    }

    const predictionService = new TreatmentPredictionService();
    const models = await predictionService.getModels(filters);

    return NextResponse.json({
      models,
      total: models.length
    });

  } catch (error) {
    console.error('Error fetching prediction models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prediction models' },
      { status: 500 }
    );
  }
}

// POST /api/treatment-prediction/models - Create new model
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role for creating models
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile || !['admin', 'manager'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.algorithm_type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, algorithm_type' },
        { status: 400 }
      );
    }

    const predictionService = new TreatmentPredictionService();
    const model = await predictionService.createModel(body);

    return NextResponse.json({
      model,
      message: 'Prediction model created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating prediction model:', error);
    return NextResponse.json(
      { error: 'Failed to create prediction model' },
      { status: 500 }
    );
  }
}
