import { type NextRequest, NextResponse } from 'next/server';
import { AISchedulingOptimizer } from '../../../../../lib/ai/scheduling-optimizer';

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();

    // Validate required fields
    const { patient_id, action_type, feedback_data } = requestData;

    if (!(patient_id && action_type && feedback_data)) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: patient_id, action_type, feedback_data',
        },
        { status: 400 }
      );
    }

    // Validate action type
    const validActions = [
      'appointment_scheduled',
      'appointment_rescheduled',
      'appointment_cancelled',
      'preference_updated',
    ];
    if (!validActions.includes(action_type)) {
      return NextResponse.json(
        {
          error: `Invalid action_type. Must be one of: ${validActions.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const optimizer = new AISchedulingOptimizer();

    // Process feedback to improve future recommendations
    const feedbackResult = await optimizer.processFeedback({
      patient_id,
      action_type,
      feedback_data: {
        ...feedback_data,
        timestamp: new Date().toISOString(),
        source: 'api',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        feedback_processed: true,
        improvement_applied: feedbackResult.improvement_applied,
        preference_updates: feedbackResult.preference_updates,
        model_learning_impact: {
          confidence_adjustment: feedbackResult.confidence_adjustment,
          pattern_recognition_updates: feedbackResult.pattern_updates,
          future_recommendation_improvements:
            feedbackResult.recommendation_improvements,
        },
        recommendations: [
          'Feedback has been processed to improve future scheduling suggestions',
          'Patient preference model has been updated based on this interaction',
          'AI will apply these learnings to subsequent scheduling optimizations',
        ],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to process scheduling feedback',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    if (!patientId) {
      return NextResponse.json(
        { error: 'patient_id parameter is required' },
        { status: 400 }
      );
    }

    const optimizer = new AISchedulingOptimizer();

    // Get feedback history for analysis
    const feedbackHistory = await optimizer.getFeedbackHistory({
      patient_id: patientId,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    });

    return NextResponse.json({
      success: true,
      data: {
        feedback_history: feedbackHistory.feedback_records,
        analytics: {
          total_feedback_points: feedbackHistory.total_count,
          positive_feedback_ratio: feedbackHistory.positive_ratio,
          learning_velocity: feedbackHistory.learning_velocity,
          model_confidence_trend: feedbackHistory.confidence_trend,
        },
        insights: {
          strongest_patterns:
            feedbackHistory.insights?.strongest_patterns || [],
          improvement_areas: feedbackHistory.insights?.improvement_areas || [],
          recommendation_accuracy:
            feedbackHistory.insights?.accuracy_metrics || {},
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to retrieve feedback history',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
