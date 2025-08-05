// NeonPro - Installments API Routes
// Story 6.1 - Task 3: Installment Management System
// API endpoints for installment processing and management

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers';
import { z } from 'zod';
import { getInstallmentProcessor } from '@/lib/payments/installments/installment-processor';
import { getInstallmentManager } from '@/lib/payments/installments/installment-manager';

// Validation schemas
const processInstallmentSchema = z.object({
  installmentId: z.string().uuid(),
  paymentMethodId: z.string().optional(),
  customerId: z.string().uuid().optional()
});

const bulkProcessSchema = z.object({
  installmentIds: z.array(z.string().uuid()).min(1).max(50),
  paymentMethodId: z.string().optional(),
  customerId: z.string().uuid().optional(),
  maxConcurrent: z.number().int().min(1).max(10).optional().default(5)
});

const querySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().min(1)).optional().default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional().default('20'),
  status: z.enum(['pending', 'paid', 'overdue', 'cancelled']).optional(),
  paymentPlanId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  dueDateFrom: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format'
  }).optional(),
  dueDateTo: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format'
  }).optional(),
  sortBy: z.enum(['due_date', 'amount', 'status', 'created_at']).optional().default('due_date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc')
});

/**
 * GET /api/installments
 * List installments with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    const validatedQuery = querySchema.parse(queryParams);
    const { 
      page, 
      limit, 
      status, 
      paymentPlanId, 
      customerId, 
      dueDateFrom, 
      dueDateTo, 
      sortBy, 
      sortOrder 
    } = validatedQuery;

    // Get installment manager
    const installmentManager = getInstallmentManager();

    // Build filters
    const filters: any = {};
    if (status) filters.status = status;
    if (paymentPlanId) filters.paymentPlanId = paymentPlanId;
    if (customerId) filters.customerId = customerId;
    if (dueDateFrom) filters.dueDateFrom = new Date(dueDateFrom);
    if (dueDateTo) filters.dueDateTo = new Date(dueDateTo);

    // Get installments
    const result = await installmentManager.getInstallmentsList({
      page,
      limit,
      filters,
      sortBy,
      sortOrder
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      filters: {
        status,
        paymentPlanId,
        customerId,
        dueDateFrom,
        dueDateTo
      }
    });

  } catch (error) {
    console.error('Error fetching installments:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters',
          details: error.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/installments
 * Process installment payments
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    const installmentProcessor = getInstallmentProcessor();
    let result;

    switch (action) {
      case 'process_single':
        const singleData = processInstallmentSchema.parse(body.data);
        result = await installmentProcessor.processInstallmentPayment(
          singleData.installmentId,
          singleData.paymentMethodId,
          singleData.customerId
        );
        break;

      case 'process_bulk':
        const bulkData = bulkProcessSchema.parse(body.data);
        result = await installmentProcessor.processBulkInstallments(
          bulkData.installmentIds,
          {
            paymentMethodId: bulkData.paymentMethodId,
            customerId: bulkData.customerId,
            maxConcurrent: bulkData.maxConcurrent
          }
        );
        break;

      case 'process_overdue':
        const overdueOptions = {
          maxDaysOverdue: body.data?.maxDaysOverdue || 30,
          maxInstallments: body.data?.maxInstallments || 100,
          dryRun: body.data?.dryRun || false
        };
        result = await installmentProcessor.processOverdueInstallments(overdueOptions);
        break;

      case 'retry_failed':
        const retryData = z.object({
          installmentId: z.string().uuid(),
          paymentMethodId: z.string().optional()
        }).parse(body.data);
        
        result = await installmentProcessor.retryFailedPayment(
          retryData.installmentId,
          retryData.paymentMethodId
        );
        break;

      default:
        return NextResponse.json(
          { 
            error: 'Invalid action',
            supportedActions: [
              'process_single',
              'process_bulk',
              'process_overdue',
              'retry_failed'
            ]
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `Action '${action}' completed successfully`
    });

  } catch (error) {
    console.error('Error processing installments:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/installments
 * Update installment status or information
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { action, installmentIds, data: updateData } = body;

    if (!action || !installmentIds || !Array.isArray(installmentIds)) {
      return NextResponse.json(
        { error: 'Invalid request: action and installmentIds are required' },
        { status: 400 }
      );
    }

    const installmentManager = getInstallmentManager();
    let results;

    switch (action) {
      case 'mark_paid':
        const paymentData = z.object({
          paymentIntentId: z.string(),
          paymentMethod: z.string().optional().default('manual')
        }).parse(updateData);
        
        results = await Promise.all(
          installmentIds.map(async (id) => {
            try {
              await installmentManager.markInstallmentAsPaid(
                id,
                paymentData.paymentIntentId,
                paymentData.paymentMethod
              );
              return { id, success: true };
            } catch (error) {
              return { 
                id, 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error'
              };
            }
          })
        );
        break;

      case 'mark_overdue':
        results = await Promise.all(
          installmentIds.map(async (id) => {
            try {
              await installmentManager.markInstallmentAsOverdue(id);
              return { id, success: true };
            } catch (error) {
              return { 
                id, 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error'
              };
            }
          })
        );
        break;

      case 'cancel':
        const cancelReason = updateData?.reason || 'Cancelled by user';
        results = await Promise.all(
          installmentIds.map(async (id) => {
            try {
              await installmentManager.cancelInstallment(id, cancelReason);
              return { id, success: true };
            } catch (error) {
              return { 
                id, 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error'
              };
            }
          })
        );
        break;

      default:
        return NextResponse.json(
          { 
            error: 'Invalid action',
            supportedActions: ['mark_paid', 'mark_overdue', 'cancel']
          },
          { status: 400 }
        );
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      data: {
        total: installmentIds.length,
        successful,
        failed,
        results
      },
      message: `Bulk ${action} completed: ${successful} successful, ${failed} failed`
    });

  } catch (error) {
    console.error('Error in bulk installment operation:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

