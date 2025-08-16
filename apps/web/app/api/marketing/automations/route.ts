// =====================================================================================
// MARKETING CAMPAIGNS API - AUTOMATIONS ROUTE
// Epic 7 - Story 7.2: Automated marketing campaigns with personalization
// =====================================================================================

import { type NextRequest, NextResponse } from 'next/server';
import { marketingCampaignsService } from '@/app/lib/services/marketing-campaigns-service';

// GET /api/marketing/automations - List campaign automations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinic_id') || undefined;

    const automations =
      await marketingCampaignsService.getAutomations(clinicId);

    return NextResponse.json({
      success: true,
      data: automations,
      total: automations.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch automations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/marketing/automations - Create new automation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'entryConditions', 'steps', 'clinicId'];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `Missing required field: ${field}`,
          },
          { status: 400 }
        );
      }
    }

    // Validate entry conditions
    if (
      !Array.isArray(body.entryConditions) ||
      body.entryConditions.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Entry conditions must be a non-empty array',
        },
        { status: 400 }
      );
    }

    // Validate steps
    if (!Array.isArray(body.steps) || body.steps.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Steps must be a non-empty array',
        },
        { status: 400 }
      );
    }

    // Validate each step has required fields
    for (const step of body.steps) {
      if (!(step.step && step.type)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Each step must have step number and type',
          },
          { status: 400 }
        );
      }
    }

    // Create automation
    const automationData = {
      name: body.name,
      description: body.description,
      entryConditions: body.entryConditions,
      steps: body.steps,
      exitConditions: body.exitConditions || [],
      isActive: body.isActive !== false, // Default to true
      maxParticipants: body.maxParticipants,
      clinicId: body.clinicId,
    };

    const automation =
      await marketingCampaignsService.createAutomation(automationData);

    return NextResponse.json(
      {
        success: true,
        data: automation,
        message: 'Automation created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create automation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
