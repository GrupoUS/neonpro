import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CommunicationService } from '@/app/lib/services/communication-service';

// Input schemas
const UpdateTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').optional(),
  category: z.string().min(1, 'Template category is required').optional(),
  subject: z.string().optional(),
  body: z.string().min(1, 'Template body is required').optional(),
  variables: z.array(z.string()).optional(),
  default_channel: z.enum(['sms', 'email', 'whatsapp', 'system']).optional(),
  is_active: z.boolean().optional(),
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

type RouteContext = {
  params: { id: string };
};

/**
 * GET /api/communication/templates/[id]
 * Get a specific template by ID
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
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

    const templateId = params.id;

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required', code: 'INVALID_ID' },
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

    // Get template
    const template = await communicationService.getTemplate(templateId);

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found', code: 'TEMPLATE_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { template },
    });
  } catch (error) {
    console.error('Error fetching template:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch template',
        code: 'FETCH_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/communication/templates/[id]
 * Update a specific template
 */
export async function PUT(request: NextRequest, { params }: RouteContext) {
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

    const templateId = params.id;

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = UpdateTemplateSchema.parse(body);

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

    // Check if template exists
    const existingTemplate = await communicationService.getTemplate(templateId);
    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found', code: 'TEMPLATE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if name is being changed and if it conflicts
    if (validatedData.name && validatedData.name !== existingTemplate.name) {
      const nameConflict = await communicationService.getTemplateByName(
        validatedData.name
      );
      if (nameConflict && nameConflict.id !== templateId) {
        return NextResponse.json(
          {
            error: 'Template name already exists',
            code: 'TEMPLATE_EXISTS',
          },
          { status: 409 }
        );
      }
    }

    // Update template
    const updatedTemplate = await communicationService.updateTemplate(
      templateId,
      {
        ...validatedData,
        updated_by: session.user.id,
      }
    );

    return NextResponse.json({
      success: true,
      data: { template: updatedTemplate },
      message: 'Template updated successfully',
    });
  } catch (error) {
    console.error('Error updating template:', error);

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
        error: 'Failed to update template',
        code: 'UPDATE_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/communication/templates/[id]
 * Delete a specific template
 */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
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

    const templateId = params.id;

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required', code: 'INVALID_ID' },
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

    // Check if template exists
    const existingTemplate = await communicationService.getTemplate(templateId);
    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found', code: 'TEMPLATE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if template is currently in use
    const templatesInUse = await communicationService.checkTemplatesInUse([
      templateId,
    ]);
    if (templatesInUse.length > 0) {
      return NextResponse.json(
        {
          error: 'Template is currently in use',
          code: 'TEMPLATE_IN_USE',
        },
        { status: 409 }
      );
    }

    // Delete template
    await communicationService.deleteTemplate(templateId);

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting template:', error);

    return NextResponse.json(
      {
        error: 'Failed to delete template',
        code: 'DELETE_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/communication/templates/[id]/duplicate
 * Duplicate a template
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
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

    const templateId = params.id;

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'New template name is required', code: 'INVALID_NAME' },
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

    // Check if source template exists
    const sourceTemplate = await communicationService.getTemplate(templateId);
    if (!sourceTemplate) {
      return NextResponse.json(
        { error: 'Source template not found', code: 'TEMPLATE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if new name already exists
    const nameConflict = await communicationService.getTemplateByName(name);
    if (nameConflict) {
      return NextResponse.json(
        {
          error: 'Template name already exists',
          code: 'TEMPLATE_EXISTS',
        },
        { status: 409 }
      );
    }

    // Duplicate template
    const duplicatedTemplate = await communicationService.duplicateTemplate(
      templateId,
      name,
      session.user.id
    );

    return NextResponse.json(
      {
        success: true,
        data: { template: duplicatedTemplate },
        message: 'Template duplicated successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error duplicating template:', error);

    return NextResponse.json(
      {
        error: 'Failed to duplicate template',
        code: 'DUPLICATE_ERROR',
      },
      { status: 500 }
    );
  }
}
