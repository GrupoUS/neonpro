// GET /api/treatment-prediction/performance - Model performance metrics
import { TreatmentPredictionService } from '@/app/lib/services/treatment-prediction';
import { PerformanceFilters } from '@/app/types/treatment-prediction';
import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/treatment-prediction/performance - Get model performance data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validate authentication
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission for performance data
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile || !['admin', 'manager', 'practitioner'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions for performance data' }, { status: 403 });
    }

    // Parse query parameters
    const filters: PerformanceFilters = {};
    
    if (searchParams.get('model_id')) {
      filters.model_id = searchParams.get('model_id')!;
    }
    if (searchParams.get('accuracy_min')) {
      filters.accuracy_min = parseFloat(searchParams.get('accuracy_min')!);
    }
    if (searchParams.get('evaluation_date_from')) {
      filters.evaluation_date_from = searchParams.get('evaluation_date_from')!;
    }
    if (searchParams.get('evaluation_date_to')) {
      filters.evaluation_date_to = searchParams.get('evaluation_date_to')!;
    }
    if (searchParams.get('improvement_percentage_min')) {
      filters.improvement_percentage_min = parseFloat(searchParams.get('improvement_percentage_min')!);
    }

    const predictionService = new TreatmentPredictionService();
    const performance = await predictionService.getModelPerformance(filters);

    return NextResponse.json({
      performance,
      total: performance.length
    });

  } catch (error) {
    console.error('Error fetching model performance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch model performance' },
      { status: 500 }
    );
  }
}
