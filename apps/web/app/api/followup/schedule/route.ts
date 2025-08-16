// Auto-schedule Follow-ups API
// Epic 7.3: Treatment Follow-up Automation
// Author: VoidBeast Agent

import { type NextRequest, NextResponse } from 'next/server';
import { treatmentFollowupService } from '@/app/lib/services/treatment-followup-service';

export async function POST(request: NextRequest) {
  try {
    const { patientId, treatmentId, protocolId } = await request.json();

    if (!(patientId && treatmentId && protocolId)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing required parameters: patientId, treatmentId, protocolId',
        },
        { status: 400 }
      );
    }

    // Schedule automatic follow-ups
    const scheduledFollowups =
      await treatmentFollowupService.scheduleAutomaticFollowups(
        patientId,
        treatmentId,
        protocolId
      );

    return NextResponse.json({
      success: true,
      data: {
        scheduledFollowups,
        totalScheduled: scheduledFollowups.length,
        scheduleDetails: scheduledFollowups.map((f) => ({
          id: f.id,
          type: f.followup_type,
          sequenceNumber: f.sequence_number,
          scheduledDate: f.scheduled_date,
          channel: f.preferred_channel,
        })),
      },
      message: `${scheduledFollowups.length} follow-ups scheduled successfully`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to schedule follow-ups',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
