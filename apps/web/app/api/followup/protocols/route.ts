// Follow-up Protocols API
// Epic 7.3: Treatment Follow-up Automation
// Author: VoidBeast Agent

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { treatmentFollowupService } from '@/app/lib/services/treatment-followup-service';
import { createFollowupProtocolSchema } from '@/app/lib/validations/followup';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters = {
      treatment_type: searchParams.get('treatment_type') || undefined,
      specialty: searchParams.get('specialty') || undefined,
      is_active: searchParams.get('is_active')
        ? searchParams.get('is_active') === 'true'
        : undefined,
      limit: searchParams.get('limit')
        ? Number.parseInt(searchParams.get('limit')!, 10)
        : undefined,
      offset: searchParams.get('offset')
        ? Number.parseInt(searchParams.get('offset')!, 10)
        : undefined,
    };

    const protocols =
      await treatmentFollowupService.getFollowupProtocols(filters);

    return NextResponse.json({
      success: true,
      data: protocols,
      total: protocols.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch follow-up protocols',
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
    const validatedData = createFollowupProtocolSchema.parse(body);

    // Create protocol
    const protocol =
      await treatmentFollowupService.createFollowupProtocol(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: protocol,
        message: 'Follow-up protocol created successfully',
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
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create follow-up protocol',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
