/**
 * AI Prediction Feedback API Route
 * POST /api/ai/feedback
 * 
 * Handles feedback submission for AI predictions to improve model accuracy
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AIDurationPredictionService, ModelPerformanceService } from '@/lib/ai/duration-prediction';

// Request/Response types
interface SubmitFeedbackRequest {
  appointmentId: string;
  actualDuration: number;
  feedbackNotes?: string;
  manualOverride?: boolean;
  overrideReason?: string;
  completionStatus: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

interface SubmitFeedbackResponse {
  success: boolean;
  feedback?: {
    accuracyScore: number;
    predictionError: number;
    modelVersion: string;
  };
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body: SubmitFeedbackRequest = await request.json();
    
    // Validate required fields
    if (!body.appointmentId || body.actualDuration === undefined || !body.completionStatus) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: appointmentId, actualDuration, completionStatus'
        },
        { status: 400 }
      );
    }

    // Validate actualDuration is positive
    if (body.actualDuration <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'actualDuration must be a positive number'
        },
        { status: 400 }
      );
    }

    // Get current user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check user permissions (must be healthcare staff)
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'manager', 'scheduler', 'professional'])
      .single();

    if (roleError || !userRole) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Initialize services
    const aiService = new AIDurationPredictionService();
    const performanceService = new ModelPerformanceService();

    // Check if appointment has a prediction
    const prediction = await aiService.getPredictionForAppointment(body.appointmentId);
    
    if (!prediction) {
      return NextResponse.json(
        {
          success: false,
          error: 'No AI prediction found for this appointment'
        },
        { status: 404 }
      );
    }

    // Update prediction with actual duration
    await aiService.updatePredictionWithActual(
      body.appointmentId,
      body.actualDuration,
      body.feedbackNotes
    );

    // Calculate accuracy metrics
    const predictionError = prediction.predictedDuration - body.actualDuration;
    const accuracyScore = 1.0 - Math.min(
      Math.abs(predictionError) / Math.max(prediction.predictedDuration, body.actualDuration),
      1.0
    );

    // Submit additional feedback if provided
    if (body.manualOverride || body.overrideReason) {
      const { error: updateError } = await supabase
        .from('prediction_feedback')
        .update({
          manual_override: body.manualOverride || false,
          override_reason: body.overrideReason,
          completion_status: body.completionStatus,
          updated_at: new Date().toISOString()
        })
        .eq('appointment_id', body.appointmentId);

      if (updateError) {
        console.error('Failed to update additional feedback:', updateError);
        // Don't fail the request for this non-critical update
      }
    }

    // Trigger model performance update (async)
    try {
      await performanceService.updateModelPerformance(prediction.modelVersion);
    } catch (performanceError) {
      console.error('Failed to update model performance:', performanceError);
      // Don't fail the request for this background task
    }

    return NextResponse.json({
      success: true,
      feedback: {
        accuracyScore: Math.round(accuracyScore * 10000) / 10000, // Round to 4 decimal places
        predictionError,
        modelVersion: prediction.modelVersion
      }
    });

  } catch (error) {
    console.error('AI Feedback API Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error occurred while processing feedback'
      },
      { status: 500 }
    );
  }
}

// Get feedback for appointment
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('appointmentId');

    if (!appointmentId) {
      return NextResponse.json(
        { success: false, error: 'appointmentId parameter is required' },
        { status: 400 }
      );
    }

    // Get current user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check user permissions
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'manager', 'scheduler', 'professional'])
      .single();

    if (roleError || !userRole) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get feedback data
    const { data, error } = await supabase
      .from('prediction_feedback')
      .select(`
        id,
        actual_duration,
        accuracy_score,
        prediction_error,
        feedback_notes,
        manual_override,
        override_reason,
        completion_status,
        created_at,
        updated_at,
        ml_duration_predictions (
          predicted_duration,
          confidence_score,
          model_version
        )
      `)
      .eq('appointment_id', appointmentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'No feedback found for this appointment' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      feedback: {
        id: data.id,
        appointmentId,
        actualDuration: data.actual_duration,
        predictedDuration: data.ml_duration_predictions?.predicted_duration,
        accuracyScore: data.accuracy_score,
        predictionError: data.prediction_error,
        confidenceScore: data.ml_duration_predictions?.confidence_score,
        modelVersion: data.ml_duration_predictions?.model_version,
        feedbackNotes: data.feedback_notes,
        manualOverride: data.manual_override,
        overrideReason: data.override_reason,
        completionStatus: data.completion_status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    });

  } catch (error) {
    console.error('AI Feedback GET API Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error occurred while retrieving feedback'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported HTTP methods
export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed. Use POST to submit feedback or GET to retrieve.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed. Use POST to submit feedback or GET to retrieve.' },
    { status: 405 }
  );
}

