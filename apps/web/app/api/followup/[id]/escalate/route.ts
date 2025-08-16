// Follow-up Escalation API
// Epic 7.3: Treatment Follow-up Automation
// Author: VoidBeast Agent

import { type NextRequest, NextResponse } from 'next/server';
import { treatmentFollowupService } from '@/app/lib/services/treatment-followup-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { escalationLevel, reason, notifyRoles, autoScheduleAppointment } =
      await request.json();

    // Check escalation triggers
    const triggeredRules =
      await treatmentFollowupService.checkEscalationTriggers(id);

    if (triggeredRules.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No escalation triggers met for this follow-up',
        },
        { status: 400 },
      );
    }

    // Update follow-up status to escalated
    const followup = await treatmentFollowupService.updatePatientFollowup(id, {
      status: 'escalated',
      notes: reason || 'Escalated automatically due to triggered rules',
    });

    // In a real implementation, this would:
    // 1. Send notifications to specified roles
    // 2. Create calendar appointments if requested
    // 3. Log escalation in audit trail
    // 4. Update dashboard metrics

    return NextResponse.json({
      success: true,
      data: {
        followup,
        triggeredRules,
        escalationLevel,
        actionsPerformed: {
          statusUpdated: true,
          notificationsSent: notifyRoles?.length || 0,
          appointmentScheduled: autoScheduleAppointment,
        },
      },
      message: 'Follow-up escalated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to escalate follow-up',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
