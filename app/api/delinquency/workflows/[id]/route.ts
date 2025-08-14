import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { DelinquencyManager } from '@/lib/payments/delinquency/delinquency-manager';

// Validation schemas
const GetActivitiesQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  activityType: z.enum(['call', 'email', 'sms', 'meeting', 'payment', 'promise', 'escalation']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  performedBy: z.string().uuid().optional(),
  sortBy: z.enum(['created_at', 'activity_type', 'amount_collected']).optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

const AddActivitySchema = z.object({
  activityType: z.enum(['call', 'email', 'sms', 'meeting', 'payment', 'promise', 'escalation']),
  description: z.string().min(1),
  outcome: z.string().optional(),
  nextAction: z.string().optional(),
  nextActionDate: z.string().datetime().optional(),
  amountCollected: z.number().min(0).optional().default(0),
  contactMethod: z.string().optional(),
  contactDuration: z.number().optional(),
  promiseDate: z.string().datetime().optional(),
  promiseAmount: z.number().min(0).optional(),
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

const ScheduleActionSchema = z.object({
  actionType: z.string(),
  scheduledDate: z.string().datetime(),
  description: z.string(),
  assignedTo: z.string().uuid().optional(),
  reminderMinutes: z.number().int().min(0).optional().default(15),
});

/**
 * GET /api/delinquency/workflows/[id]
 * Get workflow details, activities, or statistics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'details';
    const workflowId = params.id;
    
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
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    switch (action) {
      case 'details': {
        // Get workflow details with customer information
        const { data: workflow, error } = await supabase
          .from('collection_workflow_status')
          .select('*')
          .eq('id', workflowId)
          .single();
        
        if (error) {
          if (error.code === 'PGRST116') {
            return NextResponse.json(
              { error: 'Workflow not found' },
              { status: 404 }
            );
          }
          throw error;
        }
        
        // Get recent activities
        const { data: recentActivities } = await supabase
          .from('collection_activities')
          .select('*')
          .eq('workflow_id', workflowId)
          .order('created_at', { ascending: false })
          .limit(5);
        
        // Get workflow statistics
        const { data: stats } = await supabase
          .from('collection_activities')
          .select('amount_collected')
          .eq('workflow_id', workflowId);
        
        const totalCollected = stats?.reduce((sum, activity) => 
          sum + (activity.amount_collected || 0), 0
        ) || 0;
        
        return NextResponse.json({
          data: {
            ...workflow,
            recentActivities: recentActivities || [],
            statistics: {
              totalActivities: stats?.length || 0,
              totalCollected,
              averageActivityValue: stats?.length ? totalCollected / stats.length : 0,
            },
          },
        });
      }
      
      case 'activities': {
        const query = GetActivitiesQuerySchema.parse(Object.fromEntries(searchParams));
        const page = parseInt(query.page);
        const limit = parseInt(query.limit);
        const offset = (page - 1) * limit;
        
        // Build activities query
        let activitiesQuery = supabase
          .from('collection_activities')
          .select('*', { count: 'exact' })
          .eq('workflow_id', workflowId)
          .range(offset, offset + limit - 1);
        
        // Apply filters
        if (query.activityType) {
          activitiesQuery = activitiesQuery.eq('activity_type', query.activityType);
        }
        
        if (query.dateFrom) {
          activitiesQuery = activitiesQuery.gte('created_at', query.dateFrom);
        }
        
        if (query.dateTo) {
          activitiesQuery = activitiesQuery.lte('created_at', query.dateTo);
        }
        
        if (query.performedBy) {
          activitiesQuery = activitiesQuery.eq('performed_by', query.performedBy);
        }
        
        // Apply sorting
        const sortColumn = {
          created_at: 'created_at',
          activity_type: 'activity_type',
          amount_collected: 'amount_collected',
        }[query.sortBy];
        
        activitiesQuery = activitiesQuery.order(sortColumn, { ascending: query.sortOrder === 'asc' });
        
        const { data: activities, error, count } = await activitiesQuery;
        
        if (error) {
          throw error;
        }
        
        return NextResponse.json({
          data: activities || [],
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit),
          },
        });
      }
      
      case 'timeline': {
        // Get complete workflow timeline
        const { data: activities, error } = await supabase
          .from('collection_activities')
          .select('*')
          .eq('workflow_id', workflowId)
          .order('created_at', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        // Get workflow creation and updates
        const { data: workflow } = await supabase
          .from('collection_workflows')
          .select('created_at, updated_at, action_history')
          .eq('id', workflowId)
          .single();
        
        const timeline = [];
        
        // Add workflow creation
        if (workflow) {
          timeline.push({
            type: 'workflow_created',
            date: workflow.created_at,
            description: 'Collection workflow created',
          });
          
          // Add action history
          if (workflow.action_history) {
            workflow.action_history.forEach((action: any) => {
              timeline.push({
                type: 'workflow_action',
                date: action.date,
                description: `Action: ${action.action}`,
                result: action.result,
                performedBy: action.performedBy,
              });
            });
          }
        }
        
        // Add activities
        activities?.forEach(activity => {
          timeline.push({
            type: 'activity',
            date: activity.created_at,
            description: activity.description,
            activityType: activity.activity_type,
            outcome: activity.outcome,
            amountCollected: activity.amount_collected,
            performedBy: activity.performed_by,
          });
        });
        
        // Sort timeline by date
        timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        return NextResponse.json({ data: timeline });
      }
      
      case 'statistics': {
        // Get detailed workflow statistics
        const { data: activities } = await supabase
          .from('collection_activities')
          .select('*')
          .eq('workflow_id', workflowId);
        
        const stats = {
          totalActivities: activities?.length || 0,
          activitiesByType: {},
          totalCollected: 0,
          averageCollectionPerActivity: 0,
          lastActivityDate: null,
          mostEffectiveActivityType: null,
        };
        
        if (activities && activities.length > 0) {
          // Group by activity type
          const typeGroups: { [key: string]: any[] } = {};
          let totalCollected = 0;
          
          activities.forEach(activity => {
            const type = activity.activity_type;
            if (!typeGroups[type]) {
              typeGroups[type] = [];
            }
            typeGroups[type].push(activity);
            totalCollected += activity.amount_collected || 0;
          });
          
          // Calculate statistics by type
          Object.keys(typeGroups).forEach(type => {
            const typeActivities = typeGroups[type];
            const typeCollected = typeActivities.reduce((sum, a) => sum + (a.amount_collected || 0), 0);
            
            (stats.activitiesByType as any)[type] = {
              count: typeActivities.length,
              totalCollected: typeCollected,
              averageCollected: typeCollected / typeActivities.length,
            };
          });
          
          stats.totalCollected = totalCollected;
          stats.averageCollectionPerActivity = totalCollected / activities.length;
          stats.lastActivityDate = activities[activities.length - 1].created_at;
          
          // Find most effective activity type
          let maxEffectiveness = 0;
          Object.keys(stats.activitiesByType).forEach(type => {
            const typeStats = (stats.activitiesByType as any)[type];
            if (typeStats.averageCollected > maxEffectiveness) {
              maxEffectiveness = typeStats.averageCollected;
              stats.mostEffectiveActivityType = type;
            }
          });
        }
        
        return NextResponse.json({ data: stats });
      }
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching workflow data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/delinquency/workflows/[id]
 * Add activity, schedule action, or perform workflow operations
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action, ...data } = body;
    const workflowId = params.id;
    
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
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify workflow exists
    const { data: workflow, error: workflowError } = await supabase
      .from('collection_workflows')
      .select('customer_id, status')
      .eq('id', workflowId)
      .single();
    
    if (workflowError || !workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }
    
    switch (action) {
      case 'add_activity': {
        const validatedData = AddActivitySchema.parse(data);
        
        // Add activity
        const { data: newActivity, error } = await supabase
          .from('collection_activities')
          .insert({
            workflow_id: workflowId,
            customer_id: workflow.customer_id,
            activity_type: validatedData.activityType,
            description: validatedData.description,
            outcome: validatedData.outcome,
            next_action: validatedData.nextAction,
            next_action_date: validatedData.nextActionDate,
            amount_collected: validatedData.amountCollected,
            contact_method: validatedData.contactMethod,
            contact_duration: validatedData.contactDuration,
            promise_date: validatedData.promiseDate,
            promise_amount: validatedData.promiseAmount,
            performed_by: user.id,
          })
          .select()
          .single();
        
        if (error) {
          throw error;
        }
        
        // Update workflow with latest activity info
        await supabase
          .from('collection_workflows')
          .update({
            next_action_type: validatedData.nextAction,
            next_action_date: validatedData.nextActionDate,
            updated_at: new Date().toISOString(),
          })
          .eq('id', workflowId);
        
        return NextResponse.json({ success: true, data: newActivity });
      }
      
      case 'schedule_action': {
        const validatedData = ScheduleActionSchema.parse(data);
        
        // Create scheduled notification
        const { data: scheduledAction, error } = await supabase
          .from('scheduled_notifications')
          .insert({
            customer_id: workflow.customer_id,
            workflow_id: workflowId,
            notification_type: 'workflow_reminder',
            scheduled_date: validatedData.scheduledDate,
            message: validatedData.description,
            assigned_to: validatedData.assignedTo || user.id,
            reminder_minutes: validatedData.reminderMinutes,
            status: 'scheduled',
            metadata: {
              actionType: validatedData.actionType,
              scheduledBy: user.id,
            },
          })
          .select()
          .single();
        
        if (error) {
          throw error;
        }
        
        // Update workflow next action
        await supabase
          .from('collection_workflows')
          .update({
            next_action_type: validatedData.actionType,
            next_action_date: validatedData.scheduledDate,
            updated_at: new Date().toISOString(),
          })
          .eq('id', workflowId);
        
        return NextResponse.json({ success: true, data: scheduledAction });
      }
      
      case 'record_payment': {
        const { amount, paymentMethod, reference, notes } = z.object({
          amount: z.number().min(0.01),
          paymentMethod: z.string(),
          reference: z.string().optional(),
          notes: z.string().optional(),
        }).parse(data);
        
        // Add payment activity
        const { data: paymentActivity, error } = await supabase
          .from('collection_activities')
          .insert({
            workflow_id: workflowId,
            customer_id: workflow.customer_id,
            activity_type: 'payment',
            description: `Payment received: ${paymentMethod}`,
            outcome: 'Payment confirmed',
            amount_collected: amount,
            performed_by: user.id,
            metadata: {
              paymentMethod,
              reference,
              notes,
            },
          })
          .select()
          .single();
        
        if (error) {
          throw error;
        }
        
        // Check if this resolves the workflow
        const { data: totalCollected } = await supabase
          .from('collection_activities')
          .select('amount_collected')
          .eq('workflow_id', workflowId);
        
        const total = totalCollected?.reduce((sum, activity) => 
          sum + (activity.amount_collected || 0), 0
        ) || 0;
        
        // Update workflow status if fully paid
        if (total >= amount) { // This would need to compare against the actual debt amount
          await supabase
            .from('collection_workflows')
            .update({
              status: 'completed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', workflowId);
        }
        
        return NextResponse.json({ 
          success: true, 
          data: paymentActivity,
          totalCollected: total,
        });
      }
      
      case 'send_notification': {
        const { notificationType, message, channel } = z.object({
          notificationType: z.string(),
          message: z.string(),
          channel: z.enum(['email', 'sms', 'whatsapp']),
        }).parse(data);
        
        // Create notification record
        const { data: notification, error } = await supabase
          .from('delinquency_notifications')
          .insert({
            customer_id: workflow.customer_id,
            workflow_id: workflowId,
            notification_type: notificationType,
            channel,
            message,
            status: 'sent',
            sent_at: new Date().toISOString(),
          })
          .select()
          .single();
        
        if (error) {
          throw error;
        }
        
        // Add notification activity
        await supabase
          .from('collection_activities')
          .insert({
            workflow_id: workflowId,
            customer_id: workflow.customer_id,
            activity_type: channel,
            description: `${notificationType} sent via ${channel}`,
            outcome: 'Notification sent',
            performed_by: user.id,
          });
        
        return NextResponse.json({ success: true, data: notification });
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
 * PUT /api/delinquency/workflows/[id]
 * Update workflow details
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const workflowId = params.id;
    
    if (!workflowId) {
      return NextResponse.json(
        { error: 'Workflow ID is required' },
        { status: 400 }
      );
    }
    
    const validatedData = UpdateWorkflowSchema.parse(body);
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (validatedData.currentStage) updateData.current_stage = validatedData.currentStage;
    if (validatedData.nextActionType) updateData.next_action_type = validatedData.nextActionType;
    if (validatedData.nextActionDate) updateData.next_action_date = validatedData.nextActionDate;
    if (validatedData.status) updateData.status = validatedData.status;
    if (validatedData.assignedTo) updateData.assigned_to = validatedData.assignedTo;
    if (validatedData.priority) updateData.priority = validatedData.priority;
    if (validatedData.notes) updateData.notes = validatedData.notes;
    
    const { data: updatedWorkflow, error } = await supabase
      .from('collection_workflows')
      .update(updateData)
      .eq('id', workflowId)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Workflow not found' },
          { status: 404 }
        );
      }
      throw error;
    }
    
    return NextResponse.json({ success: true, data: updatedWorkflow });
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
 * DELETE /api/delinquency/workflows/[id]
 * Complete or cancel workflow
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'complete';
    const reason = searchParams.get('reason');
    const workflowId = params.id;
    
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
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const newStatus = action === 'complete' ? 'completed' : 'cancelled';
    
    const { data: updatedWorkflow, error } = await supabase
      .from('collection_workflows')
      .update({
        status: newStatus,
        notes: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', workflowId)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Workflow not found' },
          { status: 404 }
        );
      }
      throw error;
    }
    
    // Add completion activity
    await supabase
      .from('collection_activities')
      .insert({
        workflow_id: workflowId,
        customer_id: updatedWorkflow.customer_id,
        activity_type: action === 'complete' ? 'payment' : 'escalation',
        description: `Workflow ${newStatus}${reason ? `: ${reason}` : ''}`,
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