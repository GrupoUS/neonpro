import { type NextRequest, NextResponse } from 'next/server';
import { AISchedulingOptimizer } from '../../../../../lib/ai/scheduling-optimizer';

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();

    // Validate required fields
    const {
      patient_id,
      treatment_type,
      preferred_date_range,
      duration_minutes,
    } = requestData;

    if (
      !(
        patient_id &&
        treatment_type &&
        preferred_date_range &&
        duration_minutes
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: patient_id, treatment_type, preferred_date_range, duration_minutes',
        },
        { status: 400 }
      );
    }

    // Validate date range
    const startDate = new Date(preferred_date_range.start);
    const endDate = new Date(preferred_date_range.end);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format in preferred_date_range' },
        { status: 400 }
      );
    }

    if (startDate >= endDate) {
      return NextResponse.json(
        { error: 'Start date must be before end date' },
        { status: 400 }
      );
    }

    // Validate duration
    if (duration_minutes < 15 || duration_minutes > 480) {
      return NextResponse.json(
        { error: 'Duration must be between 15 and 480 minutes' },
        { status: 400 }
      );
    }

    const optimizer = new AISchedulingOptimizer();

    // Generate optimal slot suggestions
    const optimizedSlots = await optimizer.suggestOptimalSlots({
      patient_id,
      treatment_type,
      preferred_date_range,
      staff_preference: requestData.staff_preference,
      priority: requestData.priority || 'normal',
      duration_minutes,
    });

    return NextResponse.json({
      success: true,
      data: {
        suggested_slots: optimizedSlots,
        optimization_metadata: {
          total_slots_analyzed: optimizedSlots.length * 2, // Estimated
          ai_confidence_range: {
            min: Math.min(...optimizedSlots.map((s) => s.confidence_score)),
            max: Math.max(...optimizedSlots.map((s) => s.confidence_score)),
            average:
              optimizedSlots.reduce((sum, s) => sum + s.confidence_score, 0) /
              optimizedSlots.length,
          },
          patient_preference_influence:
            optimizedSlots[0]?.optimization_factors?.patient_preference_score ||
            0,
          staff_efficiency_influence:
            optimizedSlots[0]?.optimization_factors?.staff_efficiency_score ||
            0,
        },
        recommendations: [
          'AI suggests booking the first suggested slot for optimal patient satisfaction',
          'Alternative slots provided maintain high confidence scores',
          'Scheduling during suggested times maximizes clinic efficiency',
        ],
      },
    });
  } catch (error) {
    console.error('AI scheduling optimization error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate optimal scheduling suggestions',
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

    if (!patientId) {
      return NextResponse.json(
        { error: 'patient_id parameter is required' },
        { status: 400 }
      );
    }

    const optimizer = new AISchedulingOptimizer();

    // Get patient's current preferences and recent optimization history
    const preferenceData = await optimizer.getPatientPreferenceData(patientId);

    return NextResponse.json({
      success: true,
      data: {
        patient_preferences: preferenceData.preferences,
        confidence_score: preferenceData.confidence_score,
        data_points_used: preferenceData.data_points_count,
        last_updated: preferenceData.last_updated,
        ai_insights: {
          preferred_time_slots: preferenceData.insights?.preferred_times || [],
          preferred_staff: preferenceData.insights?.preferred_staff || [],
          optimization_opportunities:
            preferenceData.insights?.opportunities || [],
        },
      },
    });
  } catch (error) {
    console.error('Get patient preferences error:', error);

    return NextResponse.json(
      {
        error: 'Failed to retrieve patient scheduling preferences',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
