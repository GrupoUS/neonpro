// NeonPro - Payment Plans API Routes
// Story 6.1 - Task 3: Installment Management System
// API endpoints for payment plan management

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getInstallmentManager } from '@/lib/payments/installments/installment-manager';

// Validation schemas
const createPaymentPlanSchema = z.object({
  customerId: z.string().uuid(),
  totalAmount: z.number().positive(),
  currency: z.string().length(3).default('BRL'),
  installmentCount: z.number().int().min(1).max(60),
  frequency: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly']),
  startDate: z.string().refine((date) => !Number.isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional().default({}),
});

const updatePaymentPlanSchema = z.object({
  totalAmount: z.number().positive().optional(),
  installmentCount: z.number().int().min(1).max(60).optional(),
  frequency: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly']).optional(),
  startDate: z
    .string()
    .refine((date) => !Number.isNaN(Date.parse(date)), {
      message: 'Invalid date format',
    })
    .optional(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const querySchema = z.object({
  page: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1))
    .optional()
    .default('1'),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1).max(100))
    .optional()
    .default('20'),
  status: z.enum(['active', 'completed', 'cancelled', 'defaulted']).optional(),
  customerId: z.string().uuid().optional(),
  frequency: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly']).optional(),
  sortBy: z
    .enum(['created_at', 'start_date', 'total_amount', 'status'])
    .optional()
    .default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * GET /api/payment-plans
 * List payment plans with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const validatedQuery = querySchema.parse(queryParams);
    const { page, limit, status, customerId, frequency, sortBy, sortOrder } =
      validatedQuery;

    // Get installment manager
    const installmentManager = getInstallmentManager();

    // Build filters
    const filters: any = {};
    if (status) {
      filters.status = status;
    }
    if (customerId) {
      filters.customerId = customerId;
    }
    if (frequency) {
      filters.frequency = frequency;
    }

    // Get payment plans
    const result = await installmentManager.getPaymentPlans({
      page,
      limit,
      filters,
      sortBy,
      sortOrder,
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      filters: {
        status,
        customerId,
        frequency,
      },
    });
  } catch (error) {
    console.error('Error fetching payment plans:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: error.errors,
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
 * POST /api/payment-plans
 * Create a new payment plan
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createPaymentPlanSchema.parse(body);

    // Get installment manager
    const installmentManager = getInstallmentManager();

    // Create payment plan
    const paymentPlan = await installmentManager.createPaymentPlan({
      customerId: validatedData.customerId,
      totalAmount: validatedData.totalAmount,
      currency: validatedData.currency,
      installmentCount: validatedData.installmentCount,
      frequency: validatedData.frequency,
      startDate: new Date(validatedData.startDate),
      description: validatedData.description,
      metadata: validatedData.metadata,
    });

    return NextResponse.json(
      {
        success: true,
        data: paymentPlan,
        message: 'Payment plan created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating payment plan:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      // Check for specific business logic errors
      if (error.message.includes('Customer not found')) {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        );
      }

      if (error.message.includes('Invalid installment configuration')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/payment-plans
 * Bulk update payment plans
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { action, paymentPlanIds, data: updateData } = body;

    if (!(action && paymentPlanIds && Array.isArray(paymentPlanIds))) {
      return NextResponse.json(
        { error: 'Invalid request: action and paymentPlanIds are required' },
        { status: 400 }
      );
    }

    const installmentManager = getInstallmentManager();
    let results;

    switch (action) {
      case 'cancel':
        results = await Promise.all(
          paymentPlanIds.map((id) =>
            installmentManager.cancelPaymentPlan(id, updateData?.reason)
          )
        );
        break;

      case 'update': {
        if (!updateData) {
          return NextResponse.json(
            { error: 'Update data is required for update action' },
            { status: 400 }
          );
        }

        const validatedUpdateData = updatePaymentPlanSchema.parse(updateData);
        results = await Promise.all(
          paymentPlanIds.map((id) =>
            installmentManager.modifyPaymentPlan(id, validatedUpdateData)
          )
        );
        break;
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: cancel, update' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: results,
      message: `Bulk ${action} completed successfully`,
    });
  } catch (error) {
    console.error('Error in bulk payment plan operation:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: error.errors,
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
 * DELETE /api/payment-plans
 * Bulk delete payment plans (soft delete by cancelling)
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { paymentPlanIds, reason } = body;

    if (!(paymentPlanIds && Array.isArray(paymentPlanIds))) {
      return NextResponse.json(
        { error: 'paymentPlanIds array is required' },
        { status: 400 }
      );
    }

    const installmentManager = getInstallmentManager();

    // Cancel all specified payment plans
    const results = await Promise.all(
      paymentPlanIds.map(async (id) => {
        try {
          await installmentManager.cancelPaymentPlan(
            id,
            reason || 'Bulk deletion'
          );
          return { id, success: true };
        } catch (error) {
          return {
            id,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      data: {
        total: paymentPlanIds.length,
        successful,
        failed,
        results,
      },
      message: `Bulk deletion completed: ${successful} successful, ${failed} failed`,
    });
  } catch (error) {
    console.error('Error in bulk payment plan deletion:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
