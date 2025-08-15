import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const GetWorkflowsQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  status: z.enum(['active', 'paused', 'completed', 'escalated']).optional(),
  assignedTo: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  priority: z.string().optional(),
  sortBy: z
    .enum(['created_at', 'next_action_date', 'priority', 'customer_name'])
    .optional()
    .default('next_action_date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

const CreateWorkflowSchema = z.object({
  customerId: z.string().uuid(),
  currentStage: z.string(),
  nextActionType: z.string().optional(),
  nextActionDate: z.string().datetime().optional(),
  priority: z.number().int().min(1).max(5).optional().default(1),
  assignedTo: z.string().uuid().optional(),
  notes: z.string().optional(),
});

const AddActivitySchema = z.object({
  workflowId: z.string().uuid(),
  activityType: z.enum([
    'call',
    'email',
    'sms',
    'meeting',
    'payment',
    'promise',
    'escalation',
  ]),
  description: z.string(),
  outcome: z.string().optional(),
  nextAction: z.string().optional(),
  nextActionDate: z.string().datetime().optional(),
  amountCollected: z.number().min(0).optional().default(0),
});

const UpdateWorkflowSchema = z.object({
  currentStage: z.string().optional(),
  nextActionType: z.string().optional(),
  nextActionDate: z.string().datetime().optional(),
  status: z.enum(['active', 'paused', 'completed', 'escalated']).optional(),
  assignedTo: z.string().uuid().optional(),
  priority: z.number().int().min(1).max(5).optional(),
  notes: z.string().optional(),
});

const BulkUpdateSchema = z.object({
  workflowIds: z.array(z.string().uuid()),
  updates: z.object({
    status: z.enum(['active', 'paused', 'completed', 'escalated']).optional(),
    assignedTo: z.string().uuid().optional(),
    priority: z.number().int().min(1).max(5).optional(),
  }),
});

/**
 * GET /api/delinquency/workflows
 * Get collection workflows with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = GetWorkflowsQuerySchema.parse(
      Object.fromEntries(searchParams)
    );

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const page = Number.parseInt(query.page, 10);
    const limit = Number.parseInt(query.limit, 10);
    const offset = (page - 1) * limit;

    // Build query for collection workflows
    let supabaseQuery = supabase
      .from('collection_workflow_status')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (query.status) {
      supabaseQuery = supabaseQuery.eq('status', query.status);
    }

    if (query.assignedTo) {
      supabaseQuery = supabaseQuery.eq('assigned_to', query.assignedTo);
    }

    if (query.customerId) {
      supabaseQuery = supabaseQuery.eq('customer_id', query.customerId);
    }

    if (query.priority) {
      supabaseQuery = supabaseQuery.eq(
        'priority',
        Number.parseInt(query.priority, 10)
      );
    }

    // Apply sorting
    const sortColumn = {
      created_at: 'created_at',
      next_action_date: 'next_action_date',
      priority: 'priority',
      customer_name: 'customer_name',
    }[query.sortBy];

    supabaseQuery = supabaseQuery.order(sortColumn, {
      ascending: query.sortOrder === 'asc',
    });

    const { data: workflows, error: queryError, count } = await supabaseQuery;

    if (queryError) {
      throw queryError;
    }

    // Get workflow statistics
    const { data: stats, error: statsError } = await supabase.rpc(
      'get_workflow_statistics'
    );

    if (statsError) {
      console.warn('Failed to get workflow statistics:', statsError);
    }

    return NextResponse.json({
      data: workflows || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      stats: stats || {
        active: 0,
        paused: 0,
        completed: 0,
        escalated: 0,
        totalCollected: 0,
      },
    });
  } catch (error) {
    console.error('Error fetching collection workflows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection workflows' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/delinquency/workflows
 * Create new collection workflow or add activity to existing workflow
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    switch (action) {
      case 'create_workflow': {
        const validatedData = CreateWorkflowSchema.parse(data);

        // Check if customer already has an active workflow
        const { data: existingWorkflow } = await supabase
          .from('collection_workflows')
          .select('id')
          .eq('customer_id', validatedData.customerId)
          .eq('status', 'active')
          .single();

        if (existingWorkflow) {
          return NextResponse.json(
            { error: 'Customer already has an active collection workflow' },
            { status: 409 }
          );
        }

        const { data: newWorkflow, error } = await supabase
          .from('collection_workflows')
          .insert({
            customer_id: validatedData.customerId,
            current_stage: validatedData.currentStage,
            next_action_type: validatedData.nextActionType,
            next_action_date: validatedData.nextActionDate,
            priority: validatedData.priority,
            assigned_to: validatedData.assignedTo,
            notes: validatedData.notes,
            status: 'active',
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        return NextResponse.json({ success: true, data: newWorkflow });
      }

      case 'add_activity': {
        const validatedData = AddActivitySchema.parse(data);

        // Get workflow details
        const { data: workflow, error: workflowError } = await supabase
          .from('collection_workflows')
          .select('customer_id')
          .eq('id', validatedData.workflowId)
          .single();

        if (workflowError || !workflow) {
          return NextResponse.json(
            { error: 'Workflow not found' },
            { status: 404 }
          );
        }

        // Add activity
        const { data: newActivity, error } = await supabase
          .from('collection_activities')
          .insert({
            workflow_id: validatedData.workflowId,
            customer_id: workflow.customer_id,
            activity_type: validatedData.activityType,
            description: validatedData.description,
            outcome: validatedData.outcome,
            next_action: validatedData.nextAction,
            next_action_date: validatedData.nextActionDate,
            amount_collected: validatedData.amountCollected,
            performed_by: user.id,
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        // Update workflow with activity history
        const { data: currentWorkflow } = await supabase
          .from('collection_workflows')
          .select('action_history')
          .eq('id', validatedData.workflowId)
          .single();

        const actionHistory = currentWorkflow?.action_history || [];
        actionHistory.push({
          action: validatedData.activityType,
          date: new Date().toISOString(),
          result: validatedData.outcome || 'Pending',
          performedBy: user.id,
        });

        await supabase
          .from('collection_workflows')
          .update({
            action_history: actionHistory,
            next_action_type: validatedData.nextAction,
            next_action_date: validatedData.nextActionDate,
            updated_at: new Date().toISOString(),
          })
          .eq('id', validatedData.workflowId);

        return NextResponse.json({ success: true, data: newActivity });
      }

      case 'bulk_assign': {
        const { workflowIds, assignedTo } = z
          .object({
            workflowIds: z.array(z.string().uuid()),
            assignedTo: z.string().uuid(),
          })
          .parse(data);

        const { data: updatedWorkflows, error } = await supabase
          .from('collection_workflows')
          .update({
            assigned_to: assignedTo,
            updated_at: new Date().toISOString(),
          })
          .in('id', workflowIds)
          .select();

        if (error) {
          throw error;
        }

        return NextResponse.json({
          success: true,
          message: `${updatedWorkflows?.length || 0} workflows assigned successfully`,
          data: updatedWorkflows,
        });
      }

      case 'escalate_workflow': {
        const { workflowId, escalationReason, escalateTo } = z
          .object({
            workflowId: z.string().uuid(),
            escalationReason: z.string(),
            escalateTo: z.string().uuid().optional(),
          })
          .parse(data);

        // Update workflow status to escalated
        const { data: updatedWorkflow, error } = await supabase
          .from('collection_workflows')
          .update({
            status: 'escalated',
            assigned_to: escalateTo,
            notes: escalationReason,
            updated_at: new Date().toISOString(),
          })
          .eq('id', workflowId)
          .select()
          .single();

        if (error) {
          throw error;
        }

        // Add escalation activity
        await supabase.from('collection_activities').insert({
          workflow_id: workflowId,
          customer_id: updatedWorkflow.customer_id,
          activity_type: 'escalation',
          description: `Workflow escalated: ${escalationReason}`,
          performed_by: user.id,
        });

        return NextResponse.json({ success: true, data: updatedWorkflow });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing workflow action:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process workflow action' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/delinquency/workflows
 * Update collection workflows
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    switch (action) {
      case 'update_workflow': {
        const { workflowId, ...updates } = z
          .object({
            workflowId: z.string().uuid(),
          })
          .merge(UpdateWorkflowSchema)
          .parse(data);

        const updateData: any = {
          updated_at: new Date().toISOString(),
        };

        if (updates.currentStage) {
          updateData.current_stage = updates.currentStage;
        }
        if (updates.nextActionType) {
          updateData.next_action_type = updates.nextActionType;
        }
        if (updates.nextActionDate) {
          updateData.next_action_date = updates.nextActionDate;
        }
        if (updates.status) {
          updateData.status = updates.status;
        }
        if (updates.assignedTo) {
          updateData.assigned_to = updates.assignedTo;
        }
        if (updates.priority) {
          updateData.priority = updates.priority;
        }
        if (updates.notes) {
          updateData.notes = updates.notes;
        }

        const { data: updatedWorkflow, error } = await supabase
          .from('collection_workflows')
          .update(updateData)
          .eq('id', workflowId)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return NextResponse.json({ success: true, data: updatedWorkflow });
      }

      case 'bulk_update': {
        const validatedData = BulkUpdateSchema.parse(data);

        const updateData: any = {
          updated_at: new Date().toISOString(),
        };

        if (validatedData.updates.status) {
          updateData.status = validatedData.updates.status;
        }
        if (validatedData.updates.assignedTo) {
          updateData.assigned_to = validatedData.updates.assignedTo;
        }
        if (validatedData.updates.priority) {
          updateData.priority = validatedData.updates.priority;
        }

        const { data: updatedWorkflows, error } = await supabase
          .from('collection_workflows')
          .update(updateData)
          .in('id', validatedData.workflowIds)
          .select();

        if (error) {
          throw error;
        }

        return NextResponse.json({
          success: true,
          message: `${updatedWorkflows?.length || 0} workflows updated successfully`,
          data: updatedWorkflows,
        });
      }

      case 'pause_workflow': {
        const { workflowId, reason } = z
          .object({
            workflowId: z.string().uuid(),
            reason: z.string().optional(),
          })
          .parse(data);

        const { data: updatedWorkflow, error } = await supabase
          .from('collection_workflows')
          .update({
            status: 'paused',
            notes: reason,
            updated_at: new Date().toISOString(),
          })
          .eq('id', workflowId)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return NextResponse.json({ success: true, data: updatedWorkflow });
      }

      case 'resume_workflow': {
        const { workflowId } = z
          .object({
            workflowId: z.string().uuid(),
          })
          .parse(data);

        const { data: updatedWorkflow, error } = await supabase
          .from('collection_workflows')
          .update({
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', workflowId)
          .eq('status', 'paused')
          .select()
          .single();

        if (error) {
          throw error;
        }

        return NextResponse.json({ success: true, data: updatedWorkflow });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating workflow:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update workflow' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/delinquency/workflows
 * Complete or cancel collection workflows
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflowId');
    const action = searchParams.get('action') || 'complete';

    if (!workflowId) {
      return NextResponse.json(
        { error: 'Workflow ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const newStatus = action === 'complete' ? 'completed' : 'cancelled';

    const { data: updatedWorkflow, error } = await supabase
      .from('collection_workflows')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', workflowId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Add completion activity
    await supabase.from('collection_activities').insert({
      workflow_id: workflowId,
      customer_id: updatedWorkflow.customer_id,
      activity_type: action === 'complete' ? 'payment' : 'escalation',
      description: `Workflow ${newStatus}`,
      performed_by: user.id,
    });

    return NextResponse.json({
      success: true,
      message: `Workflow ${newStatus} successfully`,
      data: updatedWorkflow,
    });
  } catch (error) {
    console.error('Error completing workflow:', error);
    return NextResponse.json(
      { error: 'Failed to complete workflow' },
      { status: 500 }
    );
  }
}
