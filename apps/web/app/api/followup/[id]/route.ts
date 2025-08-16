// Individual Patient Follow-up API
// Epic 7.3: Treatment Follow-up Automation
// Author: VoidBeast Agent

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { treatmentFollowupService } from '@/app/lib/services/treatment-followup-service';
import { updateFollowupStatusSchema } from '@/app/lib/validations/followup';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const followup = await treatmentFollowupService.getPatientFollowupById(id);

    if (!followup) {
      return NextResponse.json(
        {
          success: false,
          error: 'Patient follow-up not found',
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: followup,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch patient follow-up',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate request data
    const validatedData = updateFollowupStatusSchema.parse(body);

    // Update follow-up
    const followup = await treatmentFollowupService.updatePatientFollowup(
      id,
      validatedData,
    );

    return NextResponse.json({
      success: true,
      data: followup,
      message: 'Patient follow-up updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 },
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update patient follow-up',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
