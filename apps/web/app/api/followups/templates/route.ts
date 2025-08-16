// =====================================================================================
// FOLLOW-UP TEMPLATES API ROUTES
// Epic 7.3: REST API endpoints for follow-up templates
// GET /api/followups/templates - List templates with filters
// POST /api/followups/templates - Create new template
// =====================================================================================

import { type NextRequest, NextResponse } from 'next/server';
import { treatmentFollowupService } from '@/app/lib/services/treatment-followup-service';
import type {
  CreateFollowupTemplateData,
  TemplateFilters,
} from '@/app/types/treatment-followups';
import { createClient } from '@/app/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);

    const filters: TemplateFilters = {};

    // Extract filters from query params
    if (searchParams.get('treatment_type')) {
      filters.treatment_type = searchParams
        .get('treatment_type')
        ?.split(',') as any[];
    }
    if (searchParams.get('followup_type')) {
      filters.followup_type = searchParams
        .get('followup_type')
        ?.split(',') as any[];
    }
    if (searchParams.get('communication_method')) {
      filters.communication_method = searchParams
        .get('communication_method')
        ?.split(',') as any[];
    }
    if (searchParams.get('active')) {
      filters.active = searchParams.get('active') === 'true';
    }
    if (searchParams.get('clinic_id')) {
      filters.clinic_id = searchParams.get('clinic_id')!;
    }
    if (searchParams.get('created_by')) {
      filters.created_by = searchParams.get('created_by')!;
    }
    if (searchParams.get('limit')) {
      filters.limit = Number.parseInt(searchParams.get('limit')!, 10);
    }
    if (searchParams.get('offset')) {
      filters.offset = Number.parseInt(searchParams.get('offset')!, 10);
    }

    // Fetch templates
    const templates = await treatmentFollowupService.getTemplates(filters);

    return NextResponse.json({
      data: templates,
      count: templates.length,
      filters,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'clinic_id',
      'name',
      'treatment_type',
      'followup_type',
      'communication_method',
      'message_template',
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            error: 'Validation error',
            message: `Field '${field}' is required`,
          },
          { status: 400 }
        );
      }
    }

    const templateData: CreateFollowupTemplateData = {
      ...body,
      created_by: session.user.id,
    };

    // Create template
    const newTemplate =
      await treatmentFollowupService.createTemplate(templateData);

    return NextResponse.json(
      {
        data: newTemplate,
        message: 'Follow-up template created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
