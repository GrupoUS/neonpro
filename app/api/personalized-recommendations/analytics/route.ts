// Story 9.2: Personalized Treatment Recommendations - API Analytics Route
// Recommendation analytics API endpoint

import { personalizedRecommendationsService } from '@/app/lib/services/personalized-recommendations';
import { 
  recordPerformanceRequestSchema,
  updateEffectivenessSchema 
} from '@/app/lib/validations/personalized-recommendations';
import { RecordPerformanceRequest } from '@/app/types/personalized-recommendations';
import { NextRequest, NextResponse } from 'next/server';

// Get recommendation analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const providerId = searchParams.get('provider_id');
    const patientId = searchParams.get('patient_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    const analytics = await personalizedRecommendationsService.getAnalytics({
      provider_id: providerId || undefined,
      patient_id: patientId || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined
    });
    
    return NextResponse.json({
      analytics,
      success: true
    });
  } catch (error) {
    console.error('Error fetching recommendation analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendation analytics', success: false },
      { status: 500 }
    );
  }
}

// Record performance metric
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = recordPerformanceSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid performance data', 
          details: validationResult.error.issues,
          success: false 
        },
        { status: 400 }
      );
    }

    const performanceData: RecordPerformanceRequest = validationResult.data;
    const performance = await personalizedRecommendationsService.recordPerformance(performanceData);
    
    return NextResponse.json({
      performance,
      success: true
    }, { status: 201 });
  } catch (error) {
    console.error('Error recording performance metric:', error);
    return NextResponse.json(
      { error: 'Failed to record performance metric', success: false },
      { status: 500 }
    );
  }
}
