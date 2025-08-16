// =====================================================================================
// MARKETING CAMPAIGNS API - TEMPLATES ROUTE
// Epic 7 - Story 7.2: Automated marketing campaigns with personalization
// =====================================================================================

import { type NextRequest, NextResponse } from 'next/server';
import { marketingCampaignsService } from '@/app/lib/services/marketing-campaigns-service';
import type { CreateTemplateData } from '@/app/types/marketing-campaigns';

// GET /api/marketing/templates - List campaign templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters = {
      category: searchParams.get('category') || undefined,
      campaignType: searchParams.get('campaign_type') || undefined,
      isActive: searchParams.get('is_active')
        ? searchParams.get('is_active') === 'true'
        : undefined,
      clinicId: searchParams.get('clinic_id') || undefined,
    };

    // Remove undefined values
    Object.keys(filters).forEach((key) => {
      if (filters[key as keyof typeof filters] === undefined) {
        delete filters[key as keyof typeof filters];
      }
    });

    const templates = await marketingCampaignsService.getTemplates(filters);

    return NextResponse.json({
      success: true,
      data: templates,
      total: templates.length,
      filters,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch templates',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/marketing/templates - Create new template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'name',
      'category',
      'campaignType',
      'contentTemplate',
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

    // Validate category
    const validCategories = [
      'welcome',
      'appointment_reminder',
      'treatment_followup',
      'promotional',
      'educational',
      'birthday',
      'retention',
      'winback',
      'testimonial_request',
    ];
    if (!validCategories.includes(body.category)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
        },
        { status: 400 }
      );
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

    // Create template
    const templateData: CreateTemplateData = {
      name: body.name,
      description: body.description,
      category: body.category,
      campaignType: body.campaignType,
      subjectTemplate: body.subjectTemplate,
      contentTemplate: body.contentTemplate,
      previewText: body.previewText,
      availableVariables: body.availableVariables || [],
      requiredVariables: body.requiredVariables || [],
      personalizationRules: body.personalizationRules || [],
      designConfig: body.designConfig || {},
      variants: body.variants || [],
      isActive: body.isActive !== false, // Default to true
      clinicId: body.clinicId,
    };

    const template =
      await marketingCampaignsService.createTemplate(templateData);

    return NextResponse.json(
      {
        success: true,
        data: template,
        message: 'Template created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create template',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
