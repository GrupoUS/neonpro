/**
 * Resource Allocation API - Story 11.1 Task 3
 * Generate intelligent resource allocation recommendations based on demand forecasts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DemandForecastingEngine } from '@/lib/analytics/demand-forecasting';
import { z } from 'zod';

// Request validation schemas
const ResourceAllocationRequestSchema = z.object({
  forecastIds: z.array(z.string().uuid()).min(1),
  optimizationType: z.enum(['cost', 'efficiency', 'quality', 'balanced']).default('balanced'),
  constraints: z.object({
    budget_limit: z.number().min(0).optional(),
    staff_availability: z.number().min(0).max(1).optional(),
    equipment_constraints: z.array(z.string()).optional()
  }).optional()
});

/**
 * GET /api/forecasting/resource-allocation
 * Get resource allocation recommendations for specific forecasts
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const forecastIds = searchParams.getAll('forecastId');
    
    if (forecastIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'At least one forecast ID is required',
            code: 'MISSING_FORECAST_IDS'
          }
        },
        { status: 400 }
      );
    }

    // Get forecasts from database
    const supabase = createClient();
    const { data: forecasts, error: fetchError } = await supabase
      .from('demand_forecasts')
      .select('*')
      .in('id', forecastIds);

    if (fetchError) {
      console.error('Error fetching forecasts:', fetchError);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Failed to fetch forecasts',
            code: 'DATABASE_ERROR',
            details: fetchError
          }
        },
        { status: 500 }
      );
    }

    if (!forecasts || forecasts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'No forecasts found for the provided IDs',
            code: 'FORECASTS_NOT_FOUND'
          }
        },
        { status: 404 }
      );
    }

    // Generate resource allocation recommendations
    const forecastingEngine = new DemandForecastingEngine();
    const recommendations = await forecastingEngine.generateResourceAllocationRecommendations(forecasts);

    // Calculate summary metrics
    const totalCostImpact = recommendations.reduce((sum, rec) => sum + rec.cost_optimization.total_cost_impact, 0);
    const averageEfficiencyGain = recommendations.reduce((sum, rec) => sum + rec.cost_optimization.efficiency_gains, 0) / recommendations.length;

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        summary: {
          total_cost_impact: totalCostImpact,
          average_efficiency_gain: averageEfficiencyGain,
          total_recommendations: recommendations.length,
          high_priority_count: recommendations.filter(r => r.priority_level === 'high' || r.priority_level === 'critical').length
        },
        metadata: {
          generated_at: new Date().toISOString(),
          forecasts_analyzed: forecasts.length,
          optimization_type: 'balanced'
        }
      }
    });

  } catch (error) {
    console.error('Error generating resource allocation:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Internal server error during resource allocation',
          code: 'INTERNAL_ERROR',
          details: error.message
        }
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/forecasting/resource-allocation
 * Generate optimized resource allocation recommendations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedRequest = ResourceAllocationRequestSchema.parse(body);

    // Get forecasts from database
    const supabase = createClient();
    const { data: forecasts, error: fetchError } = await supabase
      .from('demand_forecasts')
      .select('*')
      .in('id', validatedRequest.forecastIds);

    if (fetchError) {
      console.error('Error fetching forecasts:', fetchError);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Failed to fetch forecasts',
            code: 'DATABASE_ERROR',
            details: fetchError
          }
        },
        { status: 500 }
      );
    }

    if (!forecasts || forecasts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'No forecasts found for the provided IDs',
            code: 'FORECASTS_NOT_FOUND'
          }
        },
        { status: 404 }
      );
    }

    // Generate resource allocation recommendations
    const forecastingEngine = new DemandForecastingEngine();
    const recommendations = await forecastingEngine.generateResourceAllocationRecommendations(forecasts);

    // Calculate metrics
    const totalCostImpact = recommendations.reduce((sum, rec) => sum + rec.cost_optimization.total_cost_impact, 0);
    const efficiencyGains = recommendations.reduce((sum, rec) => sum + rec.cost_optimization.efficiency_gains, 0) / recommendations.length;

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        total_cost_impact: totalCostImpact,
        efficiency_gains: efficiencyGains,
        optimization_summary: {
          type: validatedRequest.optimizationType,
          constraints_applied: validatedRequest.constraints ? Object.keys(validatedRequest.constraints).length : 0,
          recommendations_count: recommendations.length,
          high_priority_actions: recommendations.filter(r => r.priority_level === 'high' || r.priority_level === 'critical').length
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating resource allocation:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid request data',
            code: 'VALIDATION_ERROR',
            details: error.errors
          }
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Internal server error during resource allocation creation',
          code: 'INTERNAL_ERROR',
          details: error.message
        }
      },
      { status: 500 }
    );
  }
}