// NeonPro - Individual Payment Plan API Routes
// Story 6.1 - Task 3: Installment Management System
// API endpoints for individual payment plan management

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/app/utils/supabase/server';
import { getInstallmentManager } from '@/lib/payments/installments/installment-manager';

// Validation schemas
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

const paramsSchema = z.object({
  id: z.string().uuid(),
});

/**
 * GET /api/payment-plans/[id]
 * Get a specific payment plan with its installments
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate parameters
    const resolvedParams = await params;
    const validatedParams = paramsSchema.parse(resolvedParams);
    const { id } = validatedParams;

    // Get installment manager
    const installmentManager = getInstallmentManager();

    // Get payment plan details
    const paymentPlan = await installmentManager.getPaymentPlan(id);

    if (!paymentPlan) {
      return NextResponse.json(
        { error: 'Payment plan not found' },
        { status: 404 }
      );
    }

    // Get installments for this payment plan
    const installments = await installmentManager.getInstallments(id);

    // Get payment plan statistics
    const stats = await installmentManager.getPaymentPlanStats(id);

    return NextResponse.json({
      success: true,
      data: {
        paymentPlan,
        installments,
        stats,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid payment plan ID',
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
 * PUT /api/payment-plans/[id]
 * Update a specific payment plan
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate parameters
    const resolvedParams = await params;
    const validatedParams = paramsSchema.parse(resolvedParams);
    const { id } = validatedParams;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updatePaymentPlanSchema.parse(body);

    // Get installment manager
    const installmentManager = getInstallmentManager();

    // Update payment plan
    const updatedPaymentPlan = await installmentManager.modifyPaymentPlan(id, {
      ...validatedData,
      startDate: validatedData.startDate
        ? new Date(validatedData.startDate)
        : undefined,
    });

    return NextResponse.json({
      success: true,
      data: updatedPaymentPlan,
      message: 'Payment plan updated successfully',
    });
  } catch (error) {
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
      if (error.message.includes('Payment plan not found')) {
        return NextResponse.json(
          { error: 'Payment plan not found' },
          { status: 404 }
        );
      }

      if (error.message.includes('Cannot modify completed payment plan')) {
        return NextResponse.json(
          { error: 'Cannot modify completed payment plan' },
          { status: 400 }
        );
      }

      if (error.message.includes('Cannot modify cancelled payment plan')) {
        return NextResponse.json(
          { error: 'Cannot modify cancelled payment plan' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/payment-plans/[id]
 * Cancel a specific payment plan
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate parameters
    const resolvedParams = await params;
    const validatedParams = paramsSchema.parse(resolvedParams);
    const { id } = validatedParams;

    // Parse request body for cancellation reason
    let reason = 'Cancelled by user';
    try {
      const body = await request.json();
      if (body.reason) {
        reason = body.reason;
      }
    } catch {
      // Body is optional for DELETE requests
    }

    // Get installment manager
    const installmentManager = getInstallmentManager();

    // Cancel payment plan
    await installmentManager.cancelPaymentPlan(id, reason);

    return NextResponse.json({
      success: true,
      message: 'Payment plan cancelled successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid payment plan ID',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      // Check for specific business logic errors
      if (error.message.includes('Payment plan not found')) {
        return NextResponse.json(
          { error: 'Payment plan not found' },
          { status: 404 }
        );
      }

      if (error.message.includes('Payment plan already cancelled')) {
        return NextResponse.json(
          { error: 'Payment plan already cancelled' },
          { status: 400 }
        );
      }

      if (error.message.includes('Cannot cancel completed payment plan')) {
        return NextResponse.json(
          { error: 'Cannot cancel completed payment plan' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/payment-plans/[id]
 * Perform specific actions on a payment plan
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate parameters
    const resolvedParams = await params;
    const validatedParams = paramsSchema.parse(resolvedParams);
    const { id } = validatedParams;

    // Parse request body
    const body = await request.json();
    const { action, data } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    const installmentManager = getInstallmentManager();
    let result;

    switch (action) {
      case 'regenerate_installments':
        // Regenerate installments for the payment plan
        result = await installmentManager.regenerateInstallments(id);
        break;

      case 'recalculate_amounts':
        // Recalculate installment amounts
        result = await installmentManager.recalculateInstallmentAmounts(id);
        break;

      case 'mark_as_defaulted': {
        // Mark payment plan as defaulted
        const reason = data?.reason || 'Marked as defaulted';
        result = await installmentManager.markAsDefaulted(id, reason);
        break;
      }

      case 'reactivate':
        // Reactivate a cancelled payment plan
        result = await installmentManager.reactivatePaymentPlan(id);
        break;

      default:
        return NextResponse.json(
          {
            error: 'Invalid action',
            supportedActions: [
              'regenerate_installments',
              'recalculate_amounts',
              'mark_as_defaulted',
              'reactivate',
            ],
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `Action '${action}' completed successfully`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid payment plan ID',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      // Check for specific business logic errors
      if (error.message.includes('Payment plan not found')) {
        return NextResponse.json(
          { error: 'Payment plan not found' },
          { status: 404 }
        );
      }

      if (error.message.includes('Invalid action for current status')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
