// Patient Follow-ups API
// Epic 7.3: Treatment Follow-up Automation
// Author: VoidBeast Agent

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { treatmentFollowupService } from '@/app/lib/services/treatment-followup-service';
import { createPatientFollowupSchema } from '@/app/lib/validations/followup';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters = {
      patient_id: searchParams.get('patient_id') || undefined,
      protocol_id: searchParams.get('protocol_id') || undefined,
      status: searchParams.get('status') || undefined,
      followup_type: searchParams.get('followup_type') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      limit: searchParams.get('limit')
        ? Number.parseInt(searchParams.get('limit')!, 10)
        : undefined,
      offset: searchParams.get('offset')
        ? Number.parseInt(searchParams.get('offset')!, 10)
        : undefined,
    };

    const followups =
      await treatmentFollowupService.getPatientFollowups(filters);

    return NextResponse.json({
      success: true,
      data: followups,
      total: followups.length,
    });
  } catch (error) {
    console.error('Error fetching patient follow-ups:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch patient follow-ups',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request data
    const validatedData = createPatientFollowupSchema.parse(body);

    // Create follow-up
    const followup =
      await treatmentFollowupService.createPatientFollowup(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: followup,
        message: 'Patient follow-up created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error('Error creating patient follow-up:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create patient follow-up',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
