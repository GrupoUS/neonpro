import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { DelinquencyManager } from '@/lib/payments/delinquency/delinquency-manager';

// Validation schemas
const GetDelinquencyQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  daysOverdue: z.string().optional(),
  customerId: z.string().uuid().optional(),
  sortBy: z
    .enum(['daysOverdue', 'amount', 'riskLevel', 'customerName'])
    .optional()
    .default('daysOverdue'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

const ProcessWorkflowsSchema = z.object({
  customerIds: z.array(z.string().uuid()).optional(),
  riskLevels: z.array(z.enum(['low', 'medium', 'high', 'critical'])).optional(),
  dryRun: z.boolean().optional().default(false),
});

const CreatePaymentPlanSchema = z.object({
  customerId: z.string().uuid(),
  originalAmount: z.number().positive(),
  negotiatedAmount: z.number().positive(),
  installments: z.number().int().positive(),
  startDate: z.string().datetime(),
  interestRate: z.number().min(0).optional().default(0),
  discountAmount: z.number().min(0).optional().default(0),
  terms: z.string(),
});

const SendNotificationSchema = z.object({
  customerId: z.string().uuid(),
  type: z.enum(['reminder', 'warning', 'final_notice', 'collection', 'legal']),
  channel: z.enum(['email', 'sms', 'call', 'letter']),
  templateId: z.string().uuid(),
  metadata: z.record(z.any()).optional(),
});

const UpdateRiskProfileSchema = z.object({
  customerId: z.string().uuid(),
  riskScore: z.number().min(0).max(1000).optional(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  creditLimit: z.number().optional(),
  notes: z.string().optional(),
});

/**
 * GET /api/delinquency
 * Get overdue payments and delinquency data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = GetDelinquencyQuerySchema.parse(
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

    const delinquencyManager = new DelinquencyManager(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const page = Number.parseInt(query.page, 10);
    const limit = Number.parseInt(query.limit, 10);
    const offset = (page - 1) * limit;

    // Build query for overdue payments
    let supabaseQuery = supabase
      .from('overdue_payments_summary')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (query.riskLevel) {
      supabaseQuery = supabaseQuery.eq('risk_level', query.riskLevel);
    }

    if (query.daysOverdue) {
      const daysOverdue = Number.parseInt(query.daysOverdue, 10);
      supabaseQuery = supabaseQuery.gte('max_days_overdue', daysOverdue);
    }

    if (query.customerId) {
      supabaseQuery = supabaseQuery.eq('customer_id', query.customerId);
    }

    // Apply sorting
    const sortColumn = {
      daysOverdue: 'max_days_overdue',
      amount: 'total_overdue_amount',
      riskLevel: 'risk_level',
      customerName: 'customer_name',
    }[query.sortBy];

    supabaseQuery = supabaseQuery.order(sortColumn, {
      ascending: query.sortOrder === 'asc',
    });

    const {
      data: overduePayments,
      error: queryError,
      count,
    } = await supabaseQuery;

    if (queryError) {
      throw queryError;
    }

    // Get delinquency statistics
    const stats = await delinquencyManager.getDelinquencyStats();

    return NextResponse.json({
      data: overduePayments || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      stats,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch delinquency data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/delinquency
 * Process collection workflows, create payment plans, or send notifications
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

    const delinquencyManager = new DelinquencyManager(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        smtp: {
          host: process.env.SMTP_HOST!,
          port: Number.parseInt(process.env.SMTP_PORT!, 10),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER!,
            pass: process.env.SMTP_PASS!,
          },
        },
        from: process.env.SMTP_FROM!,
      }
    );

    switch (action) {
      case 'detect_overdue': {
        const overduePayments =
          await delinquencyManager.detectOverduePayments();
        return NextResponse.json({
          success: true,
          data: overduePayments,
          count: overduePayments.length,
        });
      }

      case 'process_workflows': {
        const validatedData = ProcessWorkflowsSchema.parse(data);

        if (validatedData.dryRun) {
          // Simulate workflow processing
          const overduePayments =
            await delinquencyManager.detectOverduePayments();
          let filteredPayments = overduePayments;

          if (validatedData.customerIds) {
            filteredPayments = filteredPayments.filter((p) =>
              validatedData.customerIds?.includes(p.customerId)
            );
          }

          if (validatedData.riskLevels) {
            filteredPayments = filteredPayments.filter((p) =>
              validatedData.riskLevels?.includes(p.riskLevel)
            );
          }

          return NextResponse.json({
            success: true,
            dryRun: true,
            affectedCustomers: filteredPayments.length,
            preview: filteredPayments.slice(0, 10),
          });
        }
        await delinquencyManager.processCollectionWorkflows();
        return NextResponse.json({
          success: true,
          message: 'Workflows processed successfully',
        });
      }

      case 'create_payment_plan': {
        const validatedData = CreatePaymentPlanSchema.parse(data);

        const installmentAmount =
          validatedData.negotiatedAmount / validatedData.installments;
        const endDate = new Date(validatedData.startDate);
        endDate.setMonth(endDate.getMonth() + validatedData.installments);

        const paymentPlan = await delinquencyManager.createPaymentPlan({
          customerId: validatedData.customerId,
          originalAmount: validatedData.originalAmount,
          negotiatedAmount: validatedData.negotiatedAmount,
          installments: validatedData.installments,
          installmentAmount,
          startDate: new Date(validatedData.startDate),
          endDate,
          interestRate: validatedData.interestRate,
          discountAmount: validatedData.discountAmount,
          terms: validatedData.terms,
        });

        return NextResponse.json({ success: true, data: paymentPlan });
      }

      case 'send_notification': {
        const validatedData = SendNotificationSchema.parse(data);

        const success = await delinquencyManager.sendNotification(
          validatedData.customerId,
          validatedData.type,
          validatedData.channel,
          validatedData.templateId,
          validatedData.metadata
        );

        return NextResponse.json({
          success,
          message: success
            ? 'Notification sent successfully'
            : 'Failed to send notification',
        });
      }

      case 'calculate_risk_score': {
        const { customerId } = z
          .object({ customerId: z.string().uuid() })
          .parse(data);

        const riskProfile =
          await delinquencyManager.calculateRiskScore(customerId);

        return NextResponse.json({ success: true, data: riskProfile });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process delinquency action' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/delinquency
 * Update risk profiles or delinquency rules
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
      case 'update_risk_profile': {
        const validatedData = UpdateRiskProfileSchema.parse(data);

        const updateData: any = {
          updated_at: new Date().toISOString(),
        };

        if (validatedData.riskScore !== undefined) {
          updateData.risk_score = validatedData.riskScore;
        }

        if (validatedData.riskLevel !== undefined) {
          updateData.risk_level = validatedData.riskLevel;
        }

        if (validatedData.creditLimit !== undefined) {
          updateData.credit_limit = validatedData.creditLimit;
        }

        const { data: updatedProfile, error } = await supabase
          .from('customer_risk_profiles')
          .update(updateData)
          .eq('customer_id', validatedData.customerId)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return NextResponse.json({ success: true, data: updatedProfile });
      }

      case 'update_payment_plan_status': {
        const { planId, status } = z
          .object({
            planId: z.string().uuid(),
            status: z.enum(['pending', 'active', 'completed', 'defaulted']),
          })
          .parse(data);

        const { data: updatedPlan, error } = await supabase
          .from('delinquency_payment_plans')
          .update({
            status,
            updated_at: new Date().toISOString(),
            ...(status === 'active'
              ? { approved_by: user.id, approved_at: new Date().toISOString() }
              : {}),
          })
          .eq('id', planId)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return NextResponse.json({ success: true, data: updatedPlan });
      }

      case 'update_collection_workflow': {
        const {
          workflowId,
          currentStage,
          nextActionType,
          nextActionDate,
          notes,
        } = z
          .object({
            workflowId: z.string().uuid(),
            currentStage: z.string().optional(),
            nextActionType: z.string().optional(),
            nextActionDate: z.string().datetime().optional(),
            notes: z.string().optional(),
          })
          .parse(data);

        const updateData: any = {
          updated_at: new Date().toISOString(),
        };

        if (currentStage) {
          updateData.current_stage = currentStage;
        }
        if (nextActionType) {
          updateData.next_action_type = nextActionType;
        }
        if (nextActionDate) {
          updateData.next_action_date = nextActionDate;
        }
        if (notes) {
          updateData.notes = notes;
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

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update delinquency data' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/delinquency
 * Delete payment plans, workflows, or notifications
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');

    if (!(action && id)) {
      return NextResponse.json(
        { error: 'Action and ID are required' },
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

    switch (action) {
      case 'payment_plan': {
        const { error } = await supabase
          .from('delinquency_payment_plans')
          .delete()
          .eq('id', id)
          .eq('status', 'pending'); // Only allow deletion of pending plans

        if (error) {
          throw error;
        }

        return NextResponse.json({
          success: true,
          message: 'Payment plan deleted successfully',
        });
      }

      case 'collection_workflow': {
        const { error } = await supabase
          .from('collection_workflows')
          .update({ status: 'completed', updated_at: new Date().toISOString() })
          .eq('id', id);

        if (error) {
          throw error;
        }

        return NextResponse.json({
          success: true,
          message: 'Collection workflow completed',
        });
      }

      case 'scheduled_notification': {
        const { error } = await supabase
          .from('scheduled_notifications')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('status', 'scheduled');

        if (error) {
          throw error;
        }

        return NextResponse.json({
          success: true,
          message: 'Scheduled notification cancelled',
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to delete delinquency data' },
      { status: 500 }
    );
  }
}
