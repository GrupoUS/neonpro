// Executive Dashboard API - KPI Period Comparison
// Story 7.1: Executive Dashboard Implementation
// GET /api/executive-dashboard/kpis/comparison

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { executiveDashboardService } from '@/src/lib/services/executive-dashboard';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinic_id');
    const kpiName = searchParams.get('kpi_name');
    const periodType = searchParams.get('period_type') || 'monthly';

    if (!(clinicId && kpiName)) {
      return NextResponse.json(
        { error: 'clinic_id and kpi_name parameters are required' },
        { status: 400 },
      );
    }

    // Verify user has access to this clinic
    const { data: professional } = await supabase
      .from('professionals')
      .select('id')
      .eq('user_id', user.id)
      .eq('clinic_id', clinicId)
      .single();

    if (!professional) {
      return NextResponse.json(
        { error: 'Access denied to this clinic' },
        { status: 403 },
      );
    }

    // Get KPI comparison
    const comparison = await executiveDashboardService.getKPIComparison(
      clinicId,
      kpiName,
      periodType,
    );

    return NextResponse.json({
      success: true,
      data: comparison,
      metadata: {
        clinic_id: clinicId,
        kpi_name: kpiName,
        period_type: periodType,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch KPI comparison',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
