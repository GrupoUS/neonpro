// API Routes for Intelligent Threshold Management
// Story 6.2: Automated Reorder Alerts + Threshold Management

import { IntelligentThresholdService } from '@/app/lib/services/intelligent-threshold-service';
import { createReorderThresholdSchema, updateReorderThresholdSchema } from '@/app/lib/validations/reorder-alerts';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const thresholdService = new IntelligentThresholdService();

// Query params validation
const queryParamsSchema = z.object({
  clinic_id: z.string(),
  item_category: z.string().optional(),
  auto_reorder_enabled: z.string().optional().transform(val => val === 'true'),
  needs_optimization: z.string().optional().transform(val => val === 'true'),
});

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    
    const { clinic_id, item_category, auto_reorder_enabled, needs_optimization } = queryParamsSchema.parse(params);

    const filters: any = {};
    if (item_category) filters.item_category = [item_category];
    if (auto_reorder_enabled !== undefined) filters.auto_reorder_enabled = auto_reorder_enabled;
    if (needs_optimization !== undefined) filters.needs_optimization = needs_optimization;

    const thresholds = await thresholdService.getThresholdsByClinic(clinic_id, filters);

    return NextResponse.json({
      success: true,
      data: thresholds,
      count: thresholds.length,
    });
  } catch (error: any) {
    console.error('Error fetching thresholds:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch thresholds',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createReorderThresholdSchema.parse(body);

    const threshold = await thresholdService.createThreshold(validatedData);

    return NextResponse.json({
      success: true,
      data: threshold,
      message: 'Threshold created successfully with intelligent calculations',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating threshold:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create threshold',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Threshold ID is required' },
        { status: 400 }
      );
    }

    const validatedUpdates = updateReorderThresholdSchema.parse(updates);
    const threshold = await thresholdService.updateThreshold(id, validatedUpdates);

    return NextResponse.json({
      success: true,
      data: threshold,
      message: 'Threshold updated successfully with recalculations',
    });
  } catch (error: any) {
    console.error('Error updating threshold:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update threshold',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
