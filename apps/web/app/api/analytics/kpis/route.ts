// KPI Calculation and Retrieval API
// Description: API endpoints for financial KPI calculation and management
// Author: Dev Agent
// Date: 2025-01-26

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/app/utils/supabase/server';
import { KPIEngine } from '@/lib/analytics/kpi-engine';

interface KPICalculationRequest {
  kpi_ids?: string[];
  categories?: string[];
  time_period: {
    start_date: string;
    end_date: string;
    preset?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  };
  filters?: {
    service_types?: string[];
    doctor_ids?: string[];
    location_ids?: string[];
    payment_methods?: string[];
  };
  include_variance?: boolean;
  include_targets?: boolean;
  calculation_method?: 'real_time' | 'cached' | 'force_refresh';
}

const requestSchema = z.object({
  kpi_ids: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  time_period: z.object({
    start_date: z.string(),
    end_date: z.string(),
    preset: z
      .enum(['today', 'week', 'month', 'quarter', 'year', 'custom'])
      .optional(),
  }),
  filters: z
    .object({
      service_types: z.array(z.string()).optional(),
      doctor_ids: z.array(z.string()).optional(),
      location_ids: z.array(z.string()).optional(),
      payment_methods: z.array(z.string()).optional(),
    })
    .optional(),
  include_variance: z.boolean().default(true),
  include_targets: z.boolean().default(true),
  calculation_method: z
    .enum(['real_time', 'cached', 'force_refresh'])
    .default('cached'),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = requestSchema.parse(body);

    const kpiEngine = new KPIEngine();

    // Calculate KPIs
    const results = await kpiEngine.calculateKPIs({
      time_period: validatedData.time_period,
      kpi_ids: validatedData.kpi_ids,
      categories: validatedData.categories,
      filters: validatedData.filters,
      calculation_method: validatedData.calculation_method,
    });

    // Format results for API response
    const formattedResults = results.map((result) => ({
      id: result.kpi_id,
      kpi_name: result.kpi_name,
      kpi_category: result.kpi_category,
      current_value: result.current_value,
      previous_value: validatedData.include_variance
        ? result.previous_value
        : undefined,
      target_value: validatedData.include_targets
        ? result.target_value
        : undefined,
      variance_percent: validatedData.include_variance
        ? result.variance_percent
        : undefined,
      trend_direction: validatedData.include_variance
        ? result.trend_direction
        : undefined,
      calculation_date: result.calculation_date,
      last_updated:
        result.metadata?.calculation_timestamp || new Date().toISOString(),
      metadata: {
        data_points: result.metadata?.data_points,
        calculation_method: result.metadata?.calculation_method,
        confidence_score: result.metadata?.confidence_score,
      },
    }));

    return NextResponse.json({
      success: true,
      data: formattedResults,
      metadata: {
        total_kpis: formattedResults.length,
        calculation_timestamp: new Date().toISOString(),
        time_period: validatedData.time_period,
        filters_applied: validatedData.filters
          ? Object.keys(validatedData.filters).length
          : 0,
      },
    });
  } catch (error) {
    console.error('Error calculating KPIs:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const includeTargets = searchParams.get('include_targets') === 'true';
    const limit = Number.parseInt(searchParams.get('limit') || '50', 10);

    // Get cached KPIs from database
    let query = supabase
      .from('financial_kpis')
      .select(`
        *,
        kpi_targets(target_value, target_type, validity_period)
      `)
      .order('last_updated', { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq('kpi_category', category);
    }

    const { data: kpis, error } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Format results
    const formattedKpis =
      kpis?.map((kpi) => ({
        id: kpi.id,
        kpi_name: kpi.kpi_name,
        kpi_category: kpi.kpi_category,
        current_value: kpi.current_value,
        previous_value: kpi.previous_value,
        target_value:
          includeTargets && kpi.kpi_targets?.[0]?.target_value
            ? kpi.kpi_targets[0].target_value
            : undefined,
        variance_percent: kpi.variance_percent,
        trend_direction: kpi.trend_direction,
        calculation_date: kpi.calculation_date,
        last_updated: kpi.last_updated,
        metadata: kpi.metadata,
      })) || [];

    return NextResponse.json({
      success: true,
      data: formattedKpis,
      metadata: {
        total_kpis: formattedKpis.length,
        category_filter: category,
        include_targets: includeTargets,
        retrieved_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error retrieving KPIs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
