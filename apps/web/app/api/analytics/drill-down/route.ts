// Drill-down Analysis API
// Description: API endpoints for interactive drill-down analysis
// Author: Dev Agent
// Date: 2025-01-26

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/app/utils/supabase/server';
import { DrillDownSystem } from '@/lib/analytics/drill-down';

const requestSchema = z.object({
  kpi_id: z.string(),
  dimension: z.string(),
  filters: z.object({
    time_period: z.object({
      start_date: z.string(),
      end_date: z.string(),
      preset: z
        .enum(['today', 'week', 'month', 'quarter', 'year', 'custom'])
        .optional(),
    }),
    service_types: z.array(z.string()).optional(),
    doctor_ids: z.array(z.string()).optional(),
    location_ids: z.array(z.string()).optional(),
    payment_methods: z.array(z.string()).optional(),
  }),
  aggregation_level: z
    .enum(['day', 'week', 'month', 'quarter', 'year'])
    .optional(),
  limit: z.number().int().min(1).max(1000).default(50),
  sort_by: z.enum(['value', 'percentage', 'variance']).default('value'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  include_variance: z.boolean().default(true),
  drill_path: z
    .array(
      z.object({
        dimension: z.string(),
        value: z.string(),
      }),
    )
    .optional(),
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
        { status: 401 },
      );
    }

    const body = await request.json();
    const validatedData = requestSchema.parse(body);

    const drillDownSystem = new DrillDownSystem();

    // Perform drill-down analysis
    const analysisResult = await drillDownSystem.performDrillDown({
      kpi_id: validatedData.kpi_id,
      dimension: validatedData.dimension,
      filters: validatedData.filters,
      aggregation_level: validatedData.aggregation_level,
      limit: validatedData.limit,
      drill_path: validatedData.drill_path,
    });

    // Sort results
    const sortedResults = [...analysisResult.results];
    switch (validatedData.sort_by) {
      case 'value':
        sortedResults.sort((a, b) =>
          validatedData.sort_order === 'desc'
            ? b.value - a.value
            : a.value - b.value,
        );
        break;
      case 'percentage':
        sortedResults.sort((a, b) =>
          validatedData.sort_order === 'desc'
            ? b.percentage_of_total - a.percentage_of_total
            : a.percentage_of_total - b.percentage_of_total,
        );
        break;
      case 'variance':
        sortedResults.sort((a, b) => {
          const aVariance = a.variance_from_previous || 0;
          const bVariance = b.variance_from_previous || 0;
          return validatedData.sort_order === 'desc'
            ? bVariance - aVariance
            : aVariance - bVariance;
        });
        break;
    }

    // Format results
    const formattedResults = sortedResults.map((result) => ({
      dimension_value: result.dimension_value,
      value: result.value,
      percentage_of_total: result.percentage_of_total,
      variance_from_previous: validatedData.include_variance
        ? result.variance_from_previous
        : undefined,
      variance_from_target: validatedData.include_variance
        ? result.variance_from_target
        : undefined,
      transaction_count: result.transaction_count,
      trend_direction: result.trend_direction,
      metadata: result.metadata,
    }));

    return NextResponse.json({
      success: true,
      data: {
        kpi_id: validatedData.kpi_id,
        dimension: validatedData.dimension,
        total_results: formattedResults.length,
        total_value: analysisResult.total_value,
        results: formattedResults,
        drill_path: validatedData.drill_path || [],
        available_dimensions: analysisResult.available_dimensions,
        metadata: {
          calculation_timestamp: analysisResult.calculation_timestamp,
          data_points: analysisResult.data_points_analyzed,
          aggregation_level: validatedData.aggregation_level,
          time_period: validatedData.filters.time_period,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
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
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const kpiId = searchParams.get('kpi_id');

    if (!kpiId) {
      return NextResponse.json(
        { success: false, error: 'KPI ID is required' },
        { status: 400 },
      );
    }

    const drillDownSystem = new DrillDownSystem();

    // Get available dimensions for this KPI
    const availableDimensions =
      await drillDownSystem.getAvailableDimensions(kpiId);

    return NextResponse.json({
      success: true,
      data: {
        kpi_id: kpiId,
        available_dimensions: availableDimensions,
        dimension_descriptions: {
          time: 'Analyze trends over time periods',
          service_type: 'Break down by medical service types',
          doctor: 'Analyze by healthcare provider',
          location: 'Break down by clinic location',
          payment_method: 'Analyze by payment methods',
          patient_age_group: 'Break down by patient demographics',
          appointment_type: 'Analyze by appointment categories',
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
