/**
 * =====================================================================================
 * PREDICTIVE CASH FLOW API - PREDICTIONS ENDPOINT
 * =====================================================================================
 * 
 * Comprehensive API for predictive cash flow operations.
 * Handles prediction generation, retrieval, and validation.
 * 
 * Epic: 5 - Advanced Financial Intelligence
 * Story: 5.2 - Predictive Cash Flow Analysis
 * Author: VoidBeast V4.0 BMad Method Integration
 * Created: 2025-01-27
 * 
 * Features:
 * - Generate AI-powered cash flow predictions
 * - Retrieve historical predictions with filtering
 * - Validate predictions against actual data
 * - Scenario-based prediction generation
 * - Model accuracy tracking
 * - Real-time prediction updates
 * =====================================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';
import createpredictiveAnalyticsEngine from '@/lib/financial/predictive-analytics-engine';
import {
  createCashFlowPredictionSchema,
  predictionPeriodTypeSchema,
} from '@/lib/validations/predictive-cash-flow';
import type { Database } from '@/lib/database.types';

// =====================================================================================
// REQUEST VALIDATION SCHEMAS
// =====================================================================================

const generatePredictionSchema = z.object({
  clinicId: z.string().uuid(),
  modelId: z.string().uuid().optional(),
  periodType: predictionPeriodTypeSchema,
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  scenarioId: z.string().uuid().optional(),
});

const validatePredictionSchema = z.object({
  predictionId: z.string().uuid(),
  actualInflow: z.number().int().min(0),
  actualOutflow: z.number().int().min(0),
  actualNet: z.number().int(),
});

const getPredictionsSchema = z.object({
  clinicId: z.string().uuid(),
  periodType: predictionPeriodTypeSchema.optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  scenarioId: z.string().uuid().optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  offset: z.string().regex(/^\d+$/).transform(Number).optional(),
});

// =====================================================================================
// GET - RETRIEVE PREDICTIONS
// =====================================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const validation = getPredictionsSchema.safeParse({
      clinicId: searchParams.get('clinicId'),
      periodType: searchParams.get('periodType'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      scenarioId: searchParams.get('scenarioId'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { clinicId, periodType, startDate, endDate, scenarioId, limit = 50, offset = 0 } = validation.data;

    // Build query
    let query = supabase
      .from('cash_flow_predictions')
      .select(`
        *,
        prediction_models!inner(name, model_type, algorithm_type, accuracy_rate),
        forecasting_scenarios(name, description)
      `)
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (periodType) {
      query = query.eq('period_type', periodType);
    }

    if (startDate) {
      query = query.gte('start_date', startDate);
    }

    if (endDate) {
      query = query.lte('end_date', endDate);
    }

    if (scenarioId) {
      query = query.eq('scenario_id', scenarioId);
    }

    const { data: predictions, error } = await query;

    if (error) {
      console.error('Error fetching predictions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch predictions' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('cash_flow_predictions')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId);

    if (periodType) countQuery = countQuery.eq('period_type', periodType);
    if (startDate) countQuery = countQuery.gte('start_date', startDate);
    if (endDate) countQuery = countQuery.lte('end_date', endDate);
    if (scenarioId) countQuery = countQuery.eq('scenario_id', scenarioId);

    const { count } = await countQuery;

    return NextResponse.json({
      predictions: predictions || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });

  } catch (error) {
    console.error('Error in GET /api/financial/predictive-cash-flow/predictions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =====================================================================================
// POST - GENERATE PREDICTION
// =====================================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const body = await request.json();

    // Validate request body
    const validation = generatePredictionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { clinicId, modelId, periodType, startDate, endDate, scenarioId } = validation.data;

    // Verify clinic access
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has access to the clinic
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('id')
      .eq('id', clinicId)
      .single();

    if (clinicError || !clinic) {
      return NextResponse.json(
        { error: 'Clinic not found or access denied' },
        { status: 404 }
      );
    }

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return NextResponse.json(
        { error: 'Start date must be before end date' },
        { status: 400 }
      );
    }

    if (end.getTime() - start.getTime() > 365 * 24 * 60 * 60 * 1000) {
      return NextResponse.json(
        { error: 'Date range cannot exceed 1 year' },
        { status: 400 }
      );
    }

    // Initialize prediction engine
    const engine = new createpredictiveAnalyticsEngine(supabase);

    // Generate prediction
    const { data: prediction, error: predictionError } = await engine.generatePrediction(
      clinicId,
      periodType,
      startDate,
      endDate,
      scenarioId
    );

    if (predictionError || !prediction) {
      console.error('Error generating prediction:', predictionError);
      return NextResponse.json(
        { error: predictionError || 'Failed to generate prediction' },
        { status: 500 }
      );
    }

    // Get the complete prediction with model details
    const { data: completePrediction, error: fetchError } = await supabase
      .from('cash_flow_predictions')
      .select(`
        *,
        prediction_models!inner(name, model_type, algorithm_type, accuracy_rate),
        forecasting_scenarios(name, description)
      `)
      .eq('id', prediction.id)
      .single();

    if (fetchError) {
      console.error('Error fetching complete prediction:', fetchError);
      return NextResponse.json(
        { prediction }, // Return basic prediction if fetch fails
        { status: 201 }
      );
    }

    // Log prediction generation for analytics
    await supabase
      .from('analytics_events')
      .insert({
        event_type: 'prediction_generated',
        clinic_id: clinicId,
        user_id: user.user.id,
        metadata: {
          prediction_id: prediction.id,
          period_type: periodType,
          model_id: modelId,
          confidence_score: prediction.confidence_score,
          date_range: { startDate, endDate },
        },
      });

    return NextResponse.json(
      { 
        message: 'Prediction generated successfully',
        prediction: completePrediction || prediction,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error in POST /api/financial/predictive-cash-flow/predictions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =====================================================================================
// PUT - VALIDATE PREDICTION
// =====================================================================================

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const body = await request.json();

    // Validate request body
    const validation = validatePredictionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { predictionId, actualInflow, actualOutflow, actualNet } = validation.data;

    // Verify user authentication
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if prediction exists and user has access
    const { data: prediction, error: predictionError } = await supabase
      .from('cash_flow_predictions')
      .select(`
        *,
        prediction_models!inner(name)
      `)
      .eq('id', predictionId)
      .single();

    if (predictionError || !prediction) {
      return NextResponse.json(
        { error: 'Prediction not found' },
        { status: 404 }
      );
    }

    // Verify clinic access
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('id')
      .eq('id', prediction.clinic_id)
      .single();

    if (clinicError || !clinic) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Initialize prediction engine and validate
    const engine = new createpredictiveAnalyticsEngine(supabase);
    const { accuracy, error: validationError } = await engine.validatePrediction(
      predictionId,
      actualInflow,
      actualOutflow,
      actualNet
    );

    if (validationError) {
      console.error('Error validating prediction:', validationError);
      return NextResponse.json(
        { error: validationError },
        { status: 500 }
      );
    }

    // Log validation event
    await supabase
      .from('analytics_events')
      .insert({
        event_type: 'prediction_validated',
        clinic_id: prediction.clinic_id,
        user_id: user.user.id,
        metadata: {
          prediction_id: predictionId,
          accuracy_percentage: accuracy,
          actual_values: { actualInflow, actualOutflow, actualNet },
          predicted_values: {
            inflow: prediction.predicted_inflow_amount,
            outflow: prediction.predicted_outflow_amount,
            net: prediction.predicted_net_amount,
          },
        },
      });

    return NextResponse.json({
      message: 'Prediction validated successfully',
      accuracy,
      validation: {
        predicted: {
          inflow: prediction.predicted_inflow_amount,
          outflow: prediction.predicted_outflow_amount,
          net: prediction.predicted_net_amount,
        },
        actual: {
          inflow: actualInflow,
          outflow: actualOutflow,
          net: actualNet,
        },
        confidence: prediction.confidence_score,
      },
    });

  } catch (error) {
    console.error('Error in PUT /api/financial/predictive-cash-flow/predictions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =====================================================================================
// DELETE - REMOVE PREDICTION
// =====================================================================================

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { searchParams } = new URL(request.url);
    const predictionId = searchParams.get('id');

    if (!predictionId) {
      return NextResponse.json(
        { error: 'Prediction ID is required' },
        { status: 400 }
      );
    }

    // Verify user authentication
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if prediction exists and user has access
    const { data: prediction, error: predictionError } = await supabase
      .from('cash_flow_predictions')
      .select('clinic_id')
      .eq('id', predictionId)
      .single();

    if (predictionError || !prediction) {
      return NextResponse.json(
        { error: 'Prediction not found' },
        { status: 404 }
      );
    }

    // Verify clinic access
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('id')
      .eq('id', prediction.clinic_id)
      .single();

    if (clinicError || !clinic) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Delete prediction (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('cash_flow_predictions')
      .delete()
      .eq('id', predictionId);

    if (deleteError) {
      console.error('Error deleting prediction:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete prediction' },
        { status: 500 }
      );
    }

    // Log deletion event
    await supabase
      .from('analytics_events')
      .insert({
        event_type: 'prediction_deleted',
        clinic_id: prediction.clinic_id,
        user_id: user.user.id,
        metadata: {
          prediction_id: predictionId,
        },
      });

    return NextResponse.json({
      message: 'Prediction deleted successfully',
    });

  } catch (error) {
    console.error('Error in DELETE /api/financial/predictive-cash-flow/predictions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
