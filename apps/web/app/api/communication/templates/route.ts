import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CommunicationService } from '@/app/lib/services/communication-service';

// Input schemas
const CreateTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  category: z.string().min(1, 'Template category is required'),
  subject: z.string().optional(),
  body: z.string().min(1, 'Template body is required'),
  variables: z.array(z.string()).default([]),
  default_channel: z.enum(['sms', 'email', 'whatsapp', 'system']).optional(),
  is_active: z.boolean().default(true),
  scheduling: z
    .object({
      type: z
        .enum(['immediate', 'scheduled', 'business_hours'])
        .default('immediate'),
      days_of_week: z.array(z.number().min(0).max(6)).optional(),
      time_start: z.string().optional(),
      time_end: z.string().optional(),
      timezone: z.string().optional(),
    })
    .optional(),
});

const _UpdateTemplateSchema = CreateTemplateSchema.partial();

const QuerySchema = z.object({
  category: z.string().optional(),
  active: z.string().optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

/**
 * GET /api/communication/templates
 * Retrieve message templates with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const validatedQuery = QuerySchema.parse(queryParams);

    const {
      category,
      active,
      search,
      page = '1',
      limit = '20',
      sort = 'name',
      order = 'asc',
    } = validatedQuery;

    // Build filters
    const filters: any = {};

    if (category) {
      filters.category = category;
    }

    if (active !== undefined) {
      filters.is_active = active === 'true';
    }

    if (search) {
      filters.search = search;
    }

    // Parse pagination
    const pageNum = Math.max(1, Number.parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, Number.parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    // Get user's clinic ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', session.user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json(
        { error: 'Clinic not found', code: 'CLINIC_NOT_FOUND' },
        { status: 404 }
      );
    }

    const communicationService = new CommunicationService(
      supabase,
      profile.clinic_id
    );

    // Get templates with filters
    const result = await communicationService.getTemplates({
      ...filters,
      limit: limitNum,
      offset,
      sort_by: sort,
      sort_order: order,
    });

    return NextResponse.json({
      success: true,
      data: {
        templates: result.templates,
        pagination: {
          total: result.total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(result.total / limitNum),
          has_next: pageNum * limitNum < result.total,
          has_prev: pageNum > 1,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          code: 'VALIDATION_ERROR',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch templates',
        code: 'FETCH_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/communication/templates
 * Create a new message template
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = CreateTemplateSchema.parse(body);

    // Get user's clinic ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', session.user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json(
        { error: 'Clinic not found', code: 'CLINIC_NOT_FOUND' },
        { status: 404 }
      );
    }

    const communicationService = new CommunicationService(
      supabase,
      profile.clinic_id
    );

    // Check if template name already exists
    const existingTemplate = await communicationService.getTemplateByName(
      validatedData.name
    );
    if (existingTemplate) {
      return NextResponse.json(
        {
          error: 'Template name already exists',
          code: 'TEMPLATE_EXISTS',
        },
        { status: 409 }
      );
    }

    // Create template
    const template = await communicationService.createTemplate({
      ...validatedData,
      created_by: session.user.id,
    });

    return NextResponse.json(
      {
        success: true,
        data: { template },
        message: 'Template created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid template data',
          code: 'VALIDATION_ERROR',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to create template',
        code: 'CREATE_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/communication/templates
 * Bulk update templates (activate/deactivate multiple)
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { template_ids, is_active } = body;

    if (!Array.isArray(template_ids) || template_ids.length === 0) {
      return NextResponse.json(
        { error: 'Template IDs array is required', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    if (typeof is_active !== 'boolean') {
      return NextResponse.json(
        { error: 'is_active must be boolean', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    // Get user's clinic ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', session.user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json(
        { error: 'Clinic not found', code: 'CLINIC_NOT_FOUND' },
        { status: 404 }
      );
    }

    const communicationService = new CommunicationService(
      supabase,
      profile.clinic_id
    );

    // Bulk update templates
    const updatedTemplates = await communicationService.bulkUpdateTemplates(
      template_ids,
      { is_active, updated_by: session.user.id }
    );

    return NextResponse.json({
      success: true,
      data: { templates: updatedTemplates },
      message: `${updatedTemplates.length} template(s) updated successfully`,
    });
  } catch (_error) {
    return NextResponse.json(
      {
        error: 'Failed to update templates',
        code: 'UPDATE_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/communication/templates
 * Bulk delete templates
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { template_ids } = body;

    if (!Array.isArray(template_ids) || template_ids.length === 0) {
      return NextResponse.json(
        { error: 'Template IDs array is required', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    // Get user's clinic ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', session.user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json(
        { error: 'Clinic not found', code: 'CLINIC_NOT_FOUND' },
        { status: 404 }
      );
    }

    const communicationService = new CommunicationService(
      supabase,
      profile.clinic_id
    );

    // Check if any templates are currently in use
    const templatesInUse =
      await communicationService.checkTemplatesInUse(template_ids);
    if (templatesInUse.length > 0) {
      return NextResponse.json(
        {
          error: 'Some templates are currently in use',
          code: 'TEMPLATES_IN_USE',
          details: { templates_in_use: templatesInUse },
        },
        { status: 409 }
      );
    }

    // Delete templates
    await communicationService.deleteTemplates(template_ids);

    return NextResponse.json({
      success: true,
      message: `${template_ids.length} template(s) deleted successfully`,
    });
  } catch (_error) {
    return NextResponse.json(
      {
        error: 'Failed to delete templates',
        code: 'DELETE_ERROR',
      },
      { status: 500 }
    );
  }
}
