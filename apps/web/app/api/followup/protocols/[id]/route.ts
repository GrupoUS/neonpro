// Individual Follow-up Protocol API
// Epic 7.3: Treatment Follow-up Automation
// Author: VoidBeast Agent

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { treatmentFollowupService } from '@/app/lib/services/treatment-followup-service';
import { createFollowupProtocolSchema } from '@/app/lib/validations/followup';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const protocol = await treatmentFollowupService.getFollowupProtocolById(
      params.id
    );

    if (!protocol) {
      return NextResponse.json(
        {
          success: false,
          error: 'Follow-up protocol not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: protocol,
    });
  } catch (error) {
    console.error('Error fetching follow-up protocol:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch follow-up protocol',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validate request data (partial validation for updates)
    const updateSchema = createFollowupProtocolSchema.partial();
    const validatedData = updateSchema.parse(body);

    // Update protocol
    const protocol = await treatmentFollowupService.updateFollowupProtocol(
      params.id,
      validatedData
    );

    return NextResponse.json({
      success: true,
      data: protocol,
      message: 'Follow-up protocol updated successfully',
    });
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

    console.error('Error updating follow-up protocol:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update follow-up protocol',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await treatmentFollowupService.deleteFollowupProtocol(params.id);

    return NextResponse.json({
      success: true,
      message: 'Follow-up protocol deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting follow-up protocol:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete follow-up protocol',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
