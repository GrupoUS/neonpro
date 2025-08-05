import { NextRequest, NextResponse } from 'next/server';
import { PatientPreferenceLearner } from '../../../../../lib/ai/preference-learner';

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    
    // Validate required fields
    const { patient_id, learning_data } = requestData;
    
    if (!patient_id || !learning_data) {
      return NextResponse.json(
        { error: 'Missing required fields: patient_id, learning_data' },
        { status: 400 }
      );
    }

    const learner = new PatientPreferenceLearner();
    
    // Process learning data to update patient preferences
    const learningResult = await learner.updatePreferences(patient_id, learning_data);

    return NextResponse.json({
      success: true,
      data: {
        preferences_updated: true,
        learning_applied: learningResult.learning_applied,
        confidence_scores: learningResult.confidence_scores,
        pattern_insights: {
          discovered_patterns: learningResult.discovered_patterns,
          preference_strength: learningResult.preference_strength,
          prediction_accuracy: learningResult.prediction_accuracy
        },
        recommendations: [
          'Patient preferences have been updated based on recent behavior',
          'AI will use these learnings for improved scheduling suggestions',
          'Prediction accuracy is expected to improve with continued learning'
        ]
      }
    });

  } catch (error) {
    console.error('Patient preference learning error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to update patient preferences',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const includeHistory = searchParams.get('include_history') === 'true';
    
    if (!patientId) {
      return NextResponse.json(
        { error: 'patient_id parameter is required' },
        { status: 400 }
      );
    }

    const learner = new PatientPreferenceLearner();
    
    // Get current patient preferences and insights
    const preferences = await learner.getPatientPreferences(patientId, includeHistory);
    
    return NextResponse.json({
      success: true,
      data: {
        patient_preferences: preferences.current_preferences,
        confidence_metrics: {
          overall_confidence: preferences.overall_confidence,
          preference_reliability: preferences.preference_reliability,
          data_completeness: preferences.data_completeness
        },
        learned_patterns: {
          time_preferences: preferences.patterns?.time_preferences || [],
          staff_preferences: preferences.patterns?.staff_preferences || [],
          treatment_preferences: preferences.patterns?.treatment_preferences || [],
          scheduling_behaviors: preferences.patterns?.scheduling_behaviors || []
        },
        ...(includeHistory && {
          learning_history: preferences.learning_history
        })
      }
    });

  } catch (error) {
    console.error('Get patient preferences error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve patient preferences',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
