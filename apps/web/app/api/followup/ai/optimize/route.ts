// AI-Powered Follow-up Optimization API
// Epic 7.3: Treatment Follow-up Automation
// Author: VoidBeast Agent

import { type NextRequest, NextResponse } from 'next/server';
import { treatmentFollowupService } from '@/app/lib/services/treatment-followup-service';

export async function POST(request: NextRequest) {
  try {
    const { patientId, protocolId, channel } = await request.json();

    if (!(patientId && protocolId && channel)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: patientId, protocolId, channel',
        },
        { status: 400 }
      );
    }

    // Calculate optimal timing
    const optimalTiming =
      await treatmentFollowupService.calculateOptimalTiming(patientId);

    // Generate personalized message
    const personalizedMessage =
      await treatmentFollowupService.generatePersonalizedMessage(
        patientId,
        protocolId,
        channel
      );

    return NextResponse.json({
      success: true,
      data: {
        optimalTiming,
        personalizedMessage,
        recommendations: {
          bestTimeToSend: `${optimalTiming.optimal_hour.toString().padStart(2, '0')}:00`,
          bestDayOfWeek: optimalTiming.optimal_day_of_week,
          confidenceScore: optimalTiming.confidence_score,
          channel,
          messageLength: personalizedMessage.length,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to optimize follow-up',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
