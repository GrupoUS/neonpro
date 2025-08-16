/**
 * AI Duration Prediction API Route
 * POST /api/ai/predict-duration
 *
 * Provides AI-powered appointment duration predictions with A/B testing support
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import type { PredictionFeatures } from '@/lib/ai/duration-prediction';
import {
  AIABTestingService,
  AIDurationPredictionService,
} from '@/lib/ai/duration-prediction';

// Request/Response types
type PredictDurationRequest = {
  appointmentId: string;
  treatmentType: string;
  professionalId: string;
  patientAge?: number;
  isFirstVisit: boolean;
  patientAnxietyLevel?: 'low' | 'medium' | 'high';
  treatmentComplexity?: 'simple' | 'standard' | 'complex';
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  dayOfWeek: number; // 0-6
  historicalDuration?: number;
  specialRequirements?: string[];
};

type PredictDurationResponse = {
  success: boolean;
  prediction?: {
    predictedDuration: number;
    confidenceScore: number;
    modelVersion: string;
    uncertaintyRange: {
      min: number;
      max: number;
    };
    isAIPrediction: boolean;
    testGroup: 'control' | 'ai_prediction';
  };
  fallbackDuration?: number;
  error?: string;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body: PredictDurationRequest = await request.json();

    // Validate required fields
    if (!(body.appointmentId && body.treatmentType && body.professionalId)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing required fields: appointmentId, treatmentType, professionalId',
        },
        { status: 400 },
      );
    }

    // Get current user
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
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
        { status: 403 },
      );
    }

    // Initialize services
    const aiService = new AIDurationPredictionService();
    const abTestService = new AIABTestingService();

    // Check A/B test assignment
    const shouldUseAI = await abTestService.shouldUseAIPredictions(user.id);
    const _testGroup = shouldUseAI ? 'ai_prediction' : 'control';

    // Prepare prediction features
    const features: PredictionFeatures = {
      treatmentType: body.treatmentType,
      professionalId: body.professionalId,
      patientAge: body.patientAge,
      isFirstVisit: body.isFirstVisit,
      patientAnxietyLevel: body.patientAnxietyLevel,
      treatmentComplexity: body.treatmentComplexity,
      timeOfDay: body.timeOfDay,
      dayOfWeek: body.dayOfWeek,
      historicalDuration: body.historicalDuration,
      specialRequirements: body.specialRequirements,
    };

    if (shouldUseAI) {
      // Use AI prediction
      try {
        const prediction = await aiService.predictDuration(
          body.appointmentId,
          features,
        );

        return NextResponse.json({
          success: true,
          prediction: {
            predictedDuration: prediction.predictedDuration,
            confidenceScore: prediction.confidenceScore,
            modelVersion: prediction.modelVersion,
            uncertaintyRange: prediction.uncertaintyRange,
            isAIPrediction: true,
            testGroup: 'ai_prediction',
          },
        });
      } catch (_aiError) {
        const fallbackDuration = getFallbackDuration(body.treatmentType);

        return NextResponse.json({
          success: true,
          fallbackDuration,
          prediction: {
            predictedDuration: fallbackDuration,
            confidenceScore: 0.5,
            modelVersion: 'fallback',
            uncertaintyRange: {
              min: Math.round(fallbackDuration * 0.8),
              max: Math.round(fallbackDuration * 1.2),
            },
            isAIPrediction: false,
            testGroup: 'ai_prediction',
          },
        });
      }
    } else {
      // Control group - use baseline duration
      const baselineDuration = getFallbackDuration(body.treatmentType);

      return NextResponse.json({
        success: true,
        prediction: {
          predictedDuration: baselineDuration,
          confidenceScore: 0.5,
          modelVersion: 'baseline',
          uncertaintyRange: {
            min: Math.round(baselineDuration * 0.8),
            max: Math.round(baselineDuration * 1.2),
          },
          isAIPrediction: false,
          testGroup: 'control',
        },
      });
    }
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        error:
          'Internal server error occurred while processing prediction request',
      },
      { status: 500 },
    );
  }
}

/**
 * Get fallback duration for treatment types
 */
function getFallbackDuration(treatmentType: string): number {
  const fallbackDurations: Record<string, number> = {
    consultation: 30,
    cleaning: 45,
    treatment: 60,
    surgery: 120,
    checkup: 20,
    emergency: 90,
    follow_up: 25,
  };

  return fallbackDurations[treatmentType] || fallbackDurations.consultation;
}

// Handle unsupported HTTP methods
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed. Use POST.' },
    { status: 405 },
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed. Use POST.' },
    { status: 405 },
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed. Use POST.' },
    { status: 405 },
  );
}
