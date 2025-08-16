// API Routes for Individual Threshold Management
// Story 6.2: Automated Reorder Alerts + Threshold Management

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { IntelligentThresholdService } from '@/app/lib/services/intelligent-threshold-service';
import { updateReorderThresholdSchema } from '@/app/lib/validations/reorder-alerts';

const thresholdService = new IntelligentThresholdService();

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const threshold = await thresholdService.getThreshold(params.id);

    if (!threshold) {
      return NextResponse.json(
        { success: false, error: 'Threshold not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: threshold,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch threshold',
        details: error.message,
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const validatedUpdates = updateReorderThresholdSchema.parse(body);

    const threshold = await thresholdService.updateThreshold(
      params.id,
      validatedUpdates,
    );

    return NextResponse.json({
      success: true,
      data: threshold,
      message: 'Threshold updated successfully with intelligent recalculations',
    });
  } catch (error: any) {
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
        error: 'Failed to update threshold',
        details: error.message,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Soft delete by marking as inactive
    const threshold = await thresholdService.updateThreshold(params.id, {
      is_active: false,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: threshold,
      message: 'Threshold deactivated successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to deactivate threshold',
        details: error.message,
      },
      { status: 500 },
    );
  }
}
