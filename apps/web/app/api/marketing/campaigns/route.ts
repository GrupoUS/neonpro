// =====================================================================================
// MARKETING CAMPAIGNS API - CAMPAIGNS ROUTE
// Epic 7 - Story 7.2: Automated marketing campaigns with personalization
// =====================================================================================

import { type NextRequest, NextResponse } from 'next/server';
import { marketingCampaignsService } from '@/app/lib/services/marketing-campaigns-service';
import type { CreateCampaignData } from '@/app/types/marketing-campaigns';

// GET /api/marketing/campaigns - List campaigns with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters = {
      status: searchParams.get('status')?.split(','),
      type: searchParams.get('type')?.split(','),
      clinicId: searchParams.get('clinic_id') || undefined,
      limit: searchParams.get('limit')
        ? Number.parseInt(searchParams.get('limit')!, 10)
        : undefined,
      offset: searchParams.get('offset')
        ? Number.parseInt(searchParams.get('offset')!, 10)
        : undefined,
    };

    // Remove undefined values
    Object.keys(filters).forEach((key) => {
      if (filters[key as keyof typeof filters] === undefined) {
        delete filters[key as keyof typeof filters];
      }
    });

    const campaigns = await marketingCampaignsService.getCampaigns(filters);

    return NextResponse.json({
      success: true,
      data: campaigns,
      total: campaigns.length,
      filters,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch campaigns',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/marketing/campaigns - Create new campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'name',
      'campaignType',
      'content',
      'triggerType',
      'createdBy',
      'clinicId',
    ];

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

    // Validate campaign type
    const validCampaignTypes = [
      'email',
      'sms',
      'whatsapp',
      'push_notification',
      'in_app',
      'multi_channel',
    ];
    if (!validCampaignTypes.includes(body.campaignType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid campaign type. Must be one of: ${validCampaignTypes.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate trigger type
    const validTriggerTypes = [
      'manual',
      'scheduled',
      'event_based',
      'segment_entry',
      'segment_exit',
      'behavioral',
      'date_based',
      'lifecycle_stage',
    ];
    if (!validTriggerTypes.includes(body.triggerType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid trigger type. Must be one of: ${validTriggerTypes.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Create campaign
    const campaignData: CreateCampaignData = {
      name: body.name,
      description: body.description,
      campaignType: body.campaignType,
      status: body.status || 'draft',
      priority: body.priority || 'normal',
      targetSegments: body.targetSegments || [],
      includeCriteria: body.includeCriteria,
      excludeCriteria: body.excludeCriteria,
      scheduledStart: body.scheduledStart
        ? new Date(body.scheduledStart)
        : undefined,
      scheduledEnd: body.scheduledEnd ? new Date(body.scheduledEnd) : undefined,
      timezone: body.timezone || 'America/Sao_Paulo',
      templateId: body.templateId,
      subject: body.subject,
      content: body.content,
      personalizationLevel: body.personalizationLevel || 'basic',
      personalizationData: body.personalizationData || {},
      triggerType: body.triggerType,
      triggerConfig: body.triggerConfig,
      autoOptimization: body.autoOptimization,
      requiresConsent: body.requiresConsent !== false, // Default to true
      consentTypes: body.consentTypes || [],
      respectUnsubscribe: body.respectUnsubscribe !== false, // Default to true
      createdBy: body.createdBy,
      clinicId: body.clinicId,
    };

    const campaign =
      await marketingCampaignsService.createCampaign(campaignData);

    return NextResponse.json(
      {
        success: true,
        data: campaign,
        message: 'Campaign created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create campaign',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
