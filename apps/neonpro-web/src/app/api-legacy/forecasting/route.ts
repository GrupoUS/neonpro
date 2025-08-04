/**
 * Demand Forecasting API - Main Route
 * Story 11.1: Demand Forecasting Engine (≥80% Accuracy)
 * 
 * GET: Generate demand forecasts with ≥80% accuracy
 * POST: Create new forecast configurations
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/app/utils/supabase/server';
import { DemandForecastingEngine } from '@/lib/analytics/demand-forecasting';
import { 
  DemandForecastSchema,
  FORECASTING_CONSTANTS,
  type DemandForecast 
} from '@/types/demand-forecasting';
import { z } from 'zod';

// Request validation schemas
const ForecastingRequestSchema = z.object({
  serviceId: z.string().uuid().optional(),
  forecastPeriod: z.enum(['daily', 'weekly', 'monthly', 'quarterly']).default('weekly'),
  lookAheadDays: z.number().min(1).max(365).default(30),
  includeSeasonality: z.boolean().default(true),
  includeExternalFactors: z.boolean().default(true),
  confidenceLevel: z.number().min(0.5).max(0.99).default(0.95)
});

const ForecastCreateSchema = z.object({
  forecast_type: z.enum(['demand_prediction', 'capacity_forecast', 'resource_forecast']),
  service_id: z.string().uuid().optional(),
  period_start: z.string().datetime(),
  period_end: z.string().datetime(),
  predicted_demand: z.number().min(0),
  confidence_level: z.number().min(0).max(1)
});

/**
 * GET /api/forecasting
 * Generate demand forecasts with machine learning models
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryParams = {
      serviceId: searchParams.get('serviceId') || undefined,
      forecastPeriod: searchParams.get('forecastPeriod') || 'weekly',
      lookAheadDays: parseInt(searchParams.get('lookAheadDays') || '30'),
      includeSeasonality: searchParams.get('includeSeasonality') !== 'false',
      includeExternalFactors: searchParams.get('includeExternalFactors') !== 'false',
      confidenceLevel: parseFloat(searchParams.get('confidenceLevel') || '0.95')
    };

    const validatedParams = ForecastingRequestSchema.parse(queryParams);

    // Initialize forecasting engine
    const forecastingEngine = new DemandForecastingEngine();
    
    // Generate forecast with ≥80% accuracy requirement
    const forecastResult = await forecastingEngine.generateForecast(validatedParams);
    
    // Validate accuracy threshold
    if (forecastResult.accuracy < FORECASTING_CONSTANTS.MIN_ACCURACY_THRESHOLD) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Forecast accuracy ${(forecastResult.accuracy * 100).toFixed(1)}% is below required ≥80% threshold`,
            code: 'ACCURACY_BELOW_THRESHOLD',
            details: {
              current_accuracy: forecastResult.accuracy,
              required_accuracy: FORECASTING_CONSTANTS.MIN_ACCURACY_THRESHOLD,
              improvement_suggestions: [
                'Include more historical data',
                'Enable seasonality analysis',
                'Include external factors',
                'Increase model complexity'
              ]
            }
          }
        },
        { status: 422 }
      );
    }

    // Store forecasts in database
    const supabase = createServerSupabaseClient();
    const forecastsToStore = forecastResult.predictions.map(forecast => ({
      ...forecast,
      id: undefined // Let database generate ID
    }));

    const { data: storedForecasts, error: storeError } = await supabase
      .from('demand_forecasts')
      .insert(forecastsToStore)
      .select();

    if (storeError) {
      console.error('Error storing forecasts:', storeError);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Failed to store forecast results',
            code: 'DATABASE_ERROR',
            details: storeError
          }
        },
        { status: 500 }
      );
    }

    // Return successful forecast response
    return NextResponse.json({
      success: true,
      data: {
        forecasts: storedForecasts,
        accuracy: forecastResult.accuracy,
        confidence: forecastResult.confidence,
        factors: forecastResult.factors,
        uncertaintyRange: forecastResult.uncertaintyRange,
        metadata: {
          model_version: '1.0.0',
          generated_at: new Date().toISOString(),
          valid_until: new Date(Date.now() + (validatedParams.lookAheadDays * 24 * 60 * 60 * 1000)).toISOString(),
          parameters_used: validatedParams
        }
      }
    });

  } catch (error) {
    console.error('Error generating forecasts:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid request parameters',
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
          message: 'Internal server error during forecast generation',
          code: 'INTERNAL_ERROR',
          details: error.message
        }
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/forecasting
 * Create and store custom demand forecasts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ForecastCreateSchema.parse(body);

    // Add timestamps and ID
    const forecastData = {
      ...validatedData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Validate the complete forecast object
    const validatedForecast = DemandForecastSchema.parse(forecastData);

    // Store in database
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('demand_forecasts')
      .insert(validatedForecast)
      .select()
      .single();

    if (error) {
      console.error('Error creating forecast:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Failed to create forecast',
            code: 'DATABASE_ERROR',
            details: error
          }
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        forecast: data,
        message: 'Forecast created successfully'
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating forecast:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid forecast data',
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
          message: 'Internal server error during forecast creation',
          code: 'INTERNAL_ERROR',
          details: error.message
        }
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/forecasting
 * Update existing forecasts with real-time data
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { forecastId, realTimeData } = body;

    if (!forecastId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Forecast ID is required for updates',
            code: 'MISSING_FORECAST_ID'
          }
        },
        { status: 400 }
      );
    }

    // Initialize forecasting engine
    const forecastingEngine = new DemandForecastingEngine();
    
    // Update forecast with real-time data
    const updatedForecast = await forecastingEngine.updateForecastRealTime(
      forecastId,
      realTimeData
    );

    return NextResponse.json({
      success: true,
      data: {
        forecast: updatedForecast,
        message: 'Forecast updated successfully with real-time data'
      }
    });

  } catch (error) {
    console.error('Error updating forecast:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to update forecast',
          code: 'UPDATE_ERROR',
          details: error.message
        }
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/forecasting
 * Delete specific forecasts
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const forecastId = searchParams.get('id');

    if (!forecastId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Forecast ID is required for deletion',
            code: 'MISSING_FORECAST_ID'
          }
        },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { error } = await supabase
      .from('demand_forecasts')
      .delete()
      .eq('id', forecastId);

    if (error) {
      console.error('Error deleting forecast:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Failed to delete forecast',
            code: 'DATABASE_ERROR',
            details: error
          }
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Forecast deleted successfully'
      }
    });

  } catch (error) {
    console.error('Error deleting forecast:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Internal server error during forecast deletion',
          code: 'INTERNAL_ERROR',
          details: error.message
        }
      },
      { status: 500 }
    );
  }
}