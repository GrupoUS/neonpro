import { auditLog } from '@/lib/audit-legacy/communication-audit';
import { createClient } from '@/lib/supabase/server';
import { CommunicationError, CommunicationTemplate } from '@/types/communication';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema validation
const createTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(500).optional(),
  template_type: z.enum(['email', 'sms', 'push', 'chat', 'whatsapp']),
  category: z.enum(['appointment_reminder', 'treatment_followup', 'promotional', 'emergency', 'general']),
  subject: z.string().max(255).optional(),
  content: z.string().min(1).max(4000),
  variables: z.array(z.string()).default([]),
  triggers: z.array(z.string()).default([]),
  active: z.boolean().default(true),
});

const updateTemplateSchema = createTemplateSchema.partial();

const templateFiltersSchema = z.object({
  template_type: z.enum(['email', 'sms', 'push', 'chat', 'whatsapp']).optional(),
  category: z.enum(['appointment_reminder', 'treatment_followup', 'promotional', 'emergency', 'general']).optional(),
  active: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

/**
 * GET /api/communication/templates
 * List communication templates for the clinic
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const filters = templateFiltersSchema.parse({
      template_type: searchParams.get('template_type'),
      category: searchParams.get('category'),
      active: searchParams.get('active') === 'true' ? true : searchParams.get('active') === 'false' ? false : undefined,
      search: searchParams.get('search'),
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    });

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' } as CommunicationError,
        { status: 401 }
      );
    }

    // Get user's clinic_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json(
        { error: 'User clinic not found' } as CommunicationError,
        { status: 400 }
      );
    }

    // Build query
    let query = supabase
      .from('communication_templates')
      .select(`
        *,
        created_by_profile:created_by (
          profiles (
            name,
            role
          )
        )
      `)
      .eq('clinic_id', profile.clinic_id)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.template_type) {
      query = query.eq('template_type', filters.template_type);
    }

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.active !== undefined) {
      query = query.eq('active', filters.active);
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
    }

    // Apply pagination
    const from = (filters.page - 1) * filters.limit;
    const to = from + filters.limit - 1;
    query = query.range(from, to);

    // Execute query
    const { data: templates, error, count } = await query;

    if (error) {
      console.error('Error fetching templates:', error);
      return NextResponse.json(
        { error: 'Failed to fetch templates' } as CommunicationError,
        { status: 500 }
      );
    }

    // Transform data
    const transformedTemplates: CommunicationTemplate[] = templates?.map(template => ({
      id: template.id,
      clinic_id: template.clinic_id,
      name: template.name,
      description: template.description,
      template_type: template.template_type,
      category: template.category,
      subject: template.subject,
      content: template.content,
      variables: template.variables || [],
      triggers: template.triggers || [],
      active: template.active,
      created_by: template.created_by,
      created_at: new Date(template.created_at),
      updated_at: new Date(template.updated_at),
    })) || [];

    return NextResponse.json({
      templates: transformedTemplates,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / filters.limit),
      },
    });

  } catch (error) {
    console.error('Error in GET /api/communication/templates:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          code: 'VALIDATION_ERROR',
          message: 'Invalid request parameters',
          details: error.errors 
        } as CommunicationError,
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' } as CommunicationError,
      { status: 500 }
    );
  }
}

/**
 * POST /api/communication/templates
 * Create a new communication template
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    // Validate request body
    const templateData = createTemplateSchema.parse(body);

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' } as CommunicationError,
        { status: 401 }
      );
    }

    // Get user's clinic_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json(
        { error: 'User clinic not found' } as CommunicationError,
        { status: 400 }
      );
    }

    // Check if user has permission to create templates
    if (!['admin', 'manager', 'professional'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create templates' } as CommunicationError,
        { status: 403 }
      );
    }

    // Extract and validate template variables from content
    const variablePattern = /\{\{(\w+)\}\}/g;
    const contentVariables = [];
    let match;
    while ((match = variablePattern.exec(templateData.content)) !== null) {
      if (!contentVariables.includes(match[1])) {
        contentVariables.push(match[1]);
      }
    }

    // Also check subject for variables
    if (templateData.subject) {
      variablePattern.lastIndex = 0;
      while ((match = variablePattern.exec(templateData.subject)) !== null) {
        if (!contentVariables.includes(match[1])) {
          contentVariables.push(match[1]);
        }
      }
    }

    // Update variables list with detected variables
    const allVariables = [...new Set([...templateData.variables, ...contentVariables])];

    // Insert template
    const { data: template, error: insertError } = await supabase
      .from('communication_templates')
      .insert({
        clinic_id: profile.clinic_id,
        name: templateData.name,
        description: templateData.description,
        template_type: templateData.template_type,
        category: templateData.category,
        subject: templateData.subject,
        content: templateData.content,
        variables: allVariables,
        triggers: templateData.triggers,
        active: templateData.active,
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating template:', insertError);
      return NextResponse.json(
        { error: 'Failed to create template' } as CommunicationError,
        { status: 500 }
      );
    }

    // Transform response data
    const transformedTemplate: CommunicationTemplate = {
      id: template.id,
      clinic_id: template.clinic_id,
      name: template.name,
      description: template.description,
      template_type: template.template_type,
      category: template.category,
      subject: template.subject,
      content: template.content,
      variables: template.variables || [],
      triggers: template.triggers || [],
      active: template.active,
      created_by: template.created_by,
      created_at: new Date(template.created_at),
      updated_at: new Date(template.updated_at),
    };

    // Audit log
    await auditLog({
      action: 'template_created',
      entity_type: 'template',
      entity_id: template.id,
      user_id: user.id,
      clinic_id: profile.clinic_id,
      details: {
        name: template.name,
        template_type: template.template_type,
        category: template.category,
        variable_count: allVariables.length,
      },
    });

    return NextResponse.json({
      template: transformedTemplate,
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/communication/templates:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.errors 
        } as CommunicationError,
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' } as CommunicationError,
      { status: 500 }
    );
  }
}

/**
 * PUT /api/communication/templates/[id]
 * Update an existing template
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('id');
    const body = await request.json();

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' } as CommunicationError,
        { status: 400 }
      );
    }

    // Validate request body
    const templateData = updateTemplateSchema.parse(body);

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' } as CommunicationError,
        { status: 401 }
      );
    }

    // Get user's clinic_id and role
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json(
        { error: 'User clinic not found' } as CommunicationError,
        { status: 400 }
      );
    }

    // Check if template exists and belongs to user's clinic
    const { data: existingTemplate, error: fetchError } = await supabase
      .from('communication_templates')
      .select('id, clinic_id, created_by')
      .eq('id', templateId)
      .eq('clinic_id', profile.clinic_id)
      .single();

    if (fetchError || !existingTemplate) {
      return NextResponse.json(
        { 
          code: 'TEMPLATE_NOT_FOUND',
          message: 'Template not found' 
        } as CommunicationError,
        { status: 404 }
      );
    }

    // Check permissions (can edit own templates or admin/manager can edit any)
    const canEdit = existingTemplate.created_by === user.id || 
                   ['admin', 'manager'].includes(profile.role);

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Insufficient permissions to edit this template' } as CommunicationError,
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Extract variables if content is being updated
    if (templateData.content) {
      const variablePattern = /\{\{(\w+)\}\}/g;
      const contentVariables = [];
      let match;
      while ((match = variablePattern.exec(templateData.content)) !== null) {
        if (!contentVariables.includes(match[1])) {
          contentVariables.push(match[1]);
        }
      }

      // Also check subject for variables
      if (templateData.subject) {
        variablePattern.lastIndex = 0;
        while ((match = variablePattern.exec(templateData.subject)) !== null) {
          if (!contentVariables.includes(match[1])) {
            contentVariables.push(match[1]);
          }
        }
      }

      const allVariables = [...new Set([...(templateData.variables || []), ...contentVariables])];
      updateData.variables = allVariables;
    }

    // Copy other fields
    Object.keys(templateData).forEach(key => {
      if (templateData[key as keyof typeof templateData] !== undefined) {
        updateData[key] = templateData[key as keyof typeof templateData];
      }
    });

    // Update template
    const { data: template, error: updateError } = await supabase
      .from('communication_templates')
      .update(updateData)
      .eq('id', templateId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating template:', updateError);
      return NextResponse.json(
        { error: 'Failed to update template' } as CommunicationError,
        { status: 500 }
      );
    }

    // Transform response data
    const transformedTemplate: CommunicationTemplate = {
      id: template.id,
      clinic_id: template.clinic_id,
      name: template.name,
      description: template.description,
      template_type: template.template_type,
      category: template.category,
      subject: template.subject,
      content: template.content,
      variables: template.variables || [],
      triggers: template.triggers || [],
      active: template.active,
      created_by: template.created_by,
      created_at: new Date(template.created_at),
      updated_at: new Date(template.updated_at),
    };

    // Audit log
    await auditLog({
      action: 'template_updated',
      entity_type: 'template',
      entity_id: templateId,
      user_id: user.id,
      clinic_id: profile.clinic_id,
      details: {
        updates: updateData,
      },
    });

    return NextResponse.json({
      template: transformedTemplate,
    });

  } catch (error) {
    console.error('Error in PUT /api/communication/templates:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.errors 
        } as CommunicationError,
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' } as CommunicationError,
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/communication/templates/[id]
 * Delete a template (soft delete by setting active = false)
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('id');

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' } as CommunicationError,
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' } as CommunicationError,
        { status: 401 }
      );
    }

    // Get user's clinic_id and role
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json(
        { error: 'User clinic not found' } as CommunicationError,
        { status: 400 }
      );
    }

    // Check if template exists and belongs to user's clinic
    const { data: existingTemplate, error: fetchError } = await supabase
      .from('communication_templates')
      .select('id, clinic_id, created_by, name')
      .eq('id', templateId)
      .eq('clinic_id', profile.clinic_id)
      .single();

    if (fetchError || !existingTemplate) {
      return NextResponse.json(
        { 
          code: 'TEMPLATE_NOT_FOUND',
          message: 'Template not found' 
        } as CommunicationError,
        { status: 404 }
      );
    }

    // Check permissions (can delete own templates or admin/manager can delete any)
    const canDelete = existingTemplate.created_by === user.id || 
                     ['admin', 'manager'].includes(profile.role);

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Insufficient permissions to delete this template' } as CommunicationError,
        { status: 403 }
      );
    }

    // Soft delete by setting active = false
    const { error: deleteError } = await supabase
      .from('communication_templates')
      .update({ 
        active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', templateId);

    if (deleteError) {
      console.error('Error deleting template:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete template' } as CommunicationError,
        { status: 500 }
      );
    }

    // Audit log
    await auditLog({
      action: 'template_deleted',
      entity_type: 'template',
      entity_id: templateId,
      user_id: user.id,
      clinic_id: profile.clinic_id,
      details: {
        template_name: existingTemplate.name,
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in DELETE /api/communication/templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' } as CommunicationError,
      { status: 500 }
    );
  }
}
