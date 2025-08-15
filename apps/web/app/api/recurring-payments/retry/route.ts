// NeonPro - Payment Retry API Routes
// Story 6.1 - Task 2: Recurring Payment System
// Payment retry processing endpoints

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { recurringPaymentProcessor } from '@/lib/payments/recurring/recurring-payment-processor';
import { logger } from '@/lib/utils/logger';

// Validation Schemas
const retryPaymentSchema = z.object({
  billing_event_id: z.string().uuid(),
  retry_attempt: z.number().min(1).max(5).optional(),
  metadata: z.record(z.any()).optional(),
});

const bulkRetrySchema = z.object({
  billing_event_ids: z.array(z.string().uuid()).max(50),
  max_retry_attempt: z.number().min(1).max(5).default(3),
  metadata: z.record(z.any()).optional(),
});

// POST /api/recurring-payments/retry - Retry failed payment
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!(userProfile && ['admin', 'owner'].includes(userProfile.role))) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = retryPaymentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { billing_event_id, retry_attempt, metadata } = validationResult.data;

    // Check if billing event exists and is retryable
    const { data: billingEvent, error: billingError } = await supabase
      .from('billing_events')
      .select(`
        *,
        subscription:subscriptions(
          id,
          status,
          customer:customers(*),
          plan:subscription_plans(*)
        ),
        payment_retry_logs(*)
      `)
      .eq('id', billing_event_id)
      .single();

    if (billingError || !billingEvent) {
      return NextResponse.json(
        { error: 'Billing event not found' },
        { status: 404 }
      );
    }

    if (billingEvent.status !== 'payment_failed') {
      return NextResponse.json(
        { error: 'Billing event is not in a retryable state' },
        { status: 400 }
      );
    }

    // Check retry limits
    const retryCount = billingEvent.payment_retry_logs?.length || 0;
    const maxRetries = billingEvent.subscription?.plan?.max_retry_attempts || 3;

    if (retryCount >= maxRetries) {
      return NextResponse.json(
        { error: 'Maximum retry attempts exceeded' },
        { status: 400 }
      );
    }

    // Process retry
    const result = await recurringPaymentProcessor.retryFailedPayment(
      billing_event_id,
      retry_attempt || retryCount + 1,
      metadata
    );

    logger.info(
      `Payment retry processed for billing event: ${billing_event_id} by user: ${user.id}`
    );

    return NextResponse.json(
      {
        data: result,
        message: 'Payment retry processed successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error in POST /api/recurring-payments/retry:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/recurring-payments/retry - Bulk retry failed payments
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!(userProfile && ['admin', 'owner'].includes(userProfile.role))) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = bulkRetrySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { billing_event_ids, max_retry_attempt, metadata } =
      validationResult.data;

    const results = [];
    const errors = [];

    // Process each retry
    for (const billingEventId of billing_event_ids) {
      try {
        // Check if billing event is retryable
        const { data: billingEvent } = await supabase
          .from('billing_events')
          .select(`
            *,
            subscription:subscriptions(
              id,
              plan:subscription_plans(max_retry_attempts)
            ),
            payment_retry_logs(*)
          `)
          .eq('id', billingEventId)
          .single();

        if (!billingEvent || billingEvent.status !== 'payment_failed') {
          errors.push({
            billing_event_id: billingEventId,
            error: 'Billing event not found or not retryable',
          });
          continue;
        }

        const retryCount = billingEvent.payment_retry_logs?.length || 0;
        const maxRetries =
          billingEvent.subscription?.plan?.max_retry_attempts || 3;

        if (retryCount >= Math.min(maxRetries, max_retry_attempt)) {
          errors.push({
            billing_event_id: billingEventId,
            error: 'Maximum retry attempts exceeded',
          });
          continue;
        }

        const result = await recurringPaymentProcessor.retryFailedPayment(
          billingEventId,
          retryCount + 1,
          metadata
        );

        results.push({
          billing_event_id: billingEventId,
          result,
        });
      } catch (error) {
        errors.push({
          billing_event_id: billingEventId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    logger.info(
      `Bulk payment retry completed: ${results.length} successful, ${errors.length} errors by user: ${user.id}`
    );

    return NextResponse.json({
      data: results,
      errors,
      summary: {
        total_processed: billing_event_ids.length,
        successful: results.length,
        failed: errors.length,
        success_rate: `${((results.length / billing_event_ids.length) * 100).toFixed(2)}%`,
      },
      message: `Processed ${results.length} retries, ${errors.length} errors`,
    });
  } catch (error) {
    logger.error('Error in PUT /api/recurring-payments/retry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/recurring-payments/retry - Get retry statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!(userProfile && ['admin', 'owner'].includes(userProfile.role))) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const days = Number.parseInt(searchParams.get('days') || '30', 10);
    const startDate = new Date(
      Date.now() - days * 24 * 60 * 60 * 1000
    ).toISOString();

    // Get retry statistics
    const { data: retryLogs } = await supabase
      .from('payment_retry_logs')
      .select(`
        *,
        billing_event:billing_events(
          id,
          amount,
          status,
          subscription:subscriptions(
            id,
            customer:customers(name, email)
          )
        )
      `)
      .gte('created_at', startDate)
      .order('created_at', { ascending: false });

    // Calculate statistics
    const totalRetries = retryLogs?.length || 0;
    const successfulRetries =
      retryLogs?.filter((log) => log.status === 'success').length || 0;
    const failedRetries =
      retryLogs?.filter((log) => log.status === 'failed').length || 0;
    const pendingRetries =
      retryLogs?.filter((log) => log.status === 'pending').length || 0;

    // Group by retry attempt
    const retryAttemptStats =
      retryLogs?.reduce(
        (acc, log) => {
          const attempt = log.retry_attempt;
          if (!acc[attempt]) {
            acc[attempt] = { total: 0, successful: 0, failed: 0 };
          }
          acc[attempt].total++;
          if (log.status === 'success') {
            acc[attempt].successful++;
          }
          if (log.status === 'failed') {
            acc[attempt].failed++;
          }
          return acc;
        },
        {} as Record<
          number,
          { total: number; successful: number; failed: number }
        >
      ) || {};

    // Get failed payments that can be retried
    const { data: retryablePayments } = await supabase
      .from('billing_events')
      .select(`
        id,
        amount,
        created_at,
        subscription:subscriptions(
          id,
          customer:customers(name, email),
          plan:subscription_plans(max_retry_attempts)
        ),
        payment_retry_logs(retry_attempt)
      `)
      .eq('status', 'payment_failed')
      .gte('created_at', startDate);

    const eligibleForRetry =
      retryablePayments?.filter((payment) => {
        const retryCount = payment.payment_retry_logs?.length || 0;
        const maxRetries = payment.subscription?.plan?.max_retry_attempts || 3;
        return retryCount < maxRetries;
      }) || [];

    return NextResponse.json({
      data: {
        retry_statistics: {
          total_retries: totalRetries,
          successful_retries: successfulRetries,
          failed_retries: failedRetries,
          pending_retries: pendingRetries,
          success_rate:
            totalRetries > 0
              ? `${((successfulRetries / totalRetries) * 100).toFixed(2)}%`
              : '0%',
        },
        retry_attempt_breakdown: retryAttemptStats,
        eligible_for_retry: {
          count: eligibleForRetry.length,
          total_amount: eligibleForRetry.reduce(
            (sum, payment) => sum + (payment.amount || 0),
            0
          ),
          payments: eligibleForRetry.slice(0, 20), // Limit to first 20 for performance
        },
        recent_retry_logs: retryLogs?.slice(0, 50), // Limit to recent 50 logs
      },
      message: 'Retry statistics retrieved successfully',
    });
  } catch (error) {
    logger.error('Error in GET /api/recurring-payments/retry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
