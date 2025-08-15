// Executive Dashboard API - KPI Management
// Story 7.1: Executive Dashboard Implementation
// GET/POST /api/executive-dashboard/kpis

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
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinic_id');
    const periodType = searchParams.get('period_type') || 'monthly';
    const kpiNames = searchParams.get('kpi_names')?.split(',');
    const customStart = searchParams.get('custom_start')
      ? new Date(searchParams.get('custom_start')!)
      : undefined;
    const customEnd = searchParams.get('custom_end')
      ? new Date(searchParams.get('custom_end')!)
      : undefined;

    if (!clinicId) {
      return NextResponse.json(
        { error: 'clinic_id parameter is required' },
        { status: 400 }
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
        { status: 403 }
      );
    }

    // Get KPI values
    const kpis = await executiveDashboardService.getKPIValues(
      clinicId,
      periodType,
      kpiNames,
      customStart,
      customEnd
    );

    return NextResponse.json({
      success: true,
      data: kpis,
      metadata: {
        clinic_id: clinicId,
        period_type: periodType,
        kpi_names: kpiNames,
        custom_period: Boolean(customStart) && Boolean(customEnd),
        count: kpis.length,
      },
    });
  } catch (error) {
    console.error('KPI API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch KPI data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
        { status: 401 }
      );
    }

    // Parse request body
    const kpiData = await request.json();

    // Validate required fields
    if (
      !(
        kpiData.clinic_id &&
        kpiData.kpi_name &&
        kpiData.kpi_value &&
        kpiData.period_type
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: clinic_id, kpi_name, kpi_value, period_type',
        },
        { status: 400 }
      );
    }

    // Verify user has access to this clinic
    const { data: professional } = await supabase
      .from('professionals')
      .select('id')
      .eq('user_id', user.id)
      .eq('clinic_id', kpiData.clinic_id)
      .single();

    if (!professional) {
      return NextResponse.json(
        { error: 'Access denied to this clinic' },
        { status: 403 }
      );
    }

    // Create or update KPI value
    const kpi = await executiveDashboardService.upsertKPIValue(kpiData);

    return NextResponse.json({
      success: true,
      data: kpi,
      message: 'KPI value saved successfully',
    });
  } catch (error) {
    console.error('KPI create/update API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to save KPI data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
