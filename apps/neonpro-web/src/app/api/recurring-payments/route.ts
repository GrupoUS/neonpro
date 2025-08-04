// NeonPro - Recurring Payments API Routes
// Story 6.1 - Task 2: Recurring Payment System
// Recurring payment processing endpoints

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client'
import { cookies } from 'next/headers';
import { recurringPaymentProcessor } from '@/lib/payments/recurring/recurring-payment-processor';
import { logger } from '@/lib/utils/logger';
import { z } from 'zod';

// Validation Schemas
const processPaymentSchema = z.object({
  subscription_id: z.string().uuid(),
  amount: z.number().min(0).optional(),
  force_process: z.boolean().default(false),
  metadata: z.record(z.any()).optional()
});

const retryPaymentSchema = z.object({
  billing_event_id: z.string().uuid(),
  retry_attempt: z.number().min(1).max(5).optional(),
  metadata: z.record(z.any()).optional()
});

const bulkProcessSchema = z.object({
  subscription_ids: z.array(z.string().uuid()).max(100),
  force_process: z.boolean().default(false),
  metadata: z.record(z.any()).optional()
});

// GET /api/recurring-payments - Get payment processing status
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!userProfile || !['admin', 'owner'].includes(userProfile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const subscriptionId = searchParams.get('subscription_id');
    const customerId = searchParams.get('customer_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query for billing events
    let query = supabase
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
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (subscriptionId) {
      query = query.eq('subscription_id', subscriptionId);
    }
    if (customerId) {
      query = query.eq('subscription.customer_id', customerId);
    }

    const { data: billingEvents, error } = await query;

    if (error) {
      logger.error('Error fetching billing events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch billing events' },
        { status: 500 }
      );
    }

    // Get summary statistics
    const { data: summaryData } = await supabase
      .from('billing_events')
      .select('status, amount')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const summary = {
      total_events: summaryData?.length || 0,
      successful_payments: summaryData?.filter(e => e.status === 'paid').length || 0,
      failed_payments: summaryData?.filter(e => e.status === 'payment_failed').length || 0,
      pending_payments: summaryData?.filter(e => e.status === 'pending').length || 0,
      total_amount: summaryData?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0,
      success_rate: summaryData?.length ? 
        ((summaryData.filter(e => e.status === 'paid').length / summaryData.length) * 100).toFixed(2) : '0'
    };

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('billing_events')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      data: billingEvents,
      summary,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / limit)
      }
    });
  } catch (error) {
    logger.error('Error in GET /api/recurring-payments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/recurring-payments - Process recurring payment
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!userProfile || !['admin', 'owner'].includes(userProfile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validationResult = processPaymentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const paymentData = validationResult.data;

    // Check if subscription exists and is active
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select(`
        *,
        customer:customers(*),
        plan:subscription_plans(*)
      `)
      .eq('id', paymentData.subscription_id)
      .single();

    if (subscriptionError || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    if (!['active', 'trialing'].includes(subscription.status)) {
      return NextResponse.json(
        { error: 'Subscription is not active or trialing' },
        { status: 400 }
      );
    }

    // Process payment
    const result = await recurringPaymentProcessor.processSubscriptionPayment(
      paymentData.subscription_id,
      paymentData.amount,
      paymentData.force_process,
      paymentData.metadata
    );

    logger.info(`Recurring payment processed for subscription: ${paymentData.subscription_id} by user: ${user.id}`);

    return NextResponse.json({
      data: result,
      message: 'Payment processed successfully'
    }, { status: 201 });
  } catch (error) {
    logger.error('Error in POST /api/recurring-payments:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/recurring-payments - Bulk process payments
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!userProfile || !['admin', 'owner'].includes(userProfile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validationResult = bulkProcessSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { subscription_ids, force_process, metadata } = validationResult.data;

    const results = [];
    const errors = [];

    // Process each subscription payment
    for (const subscriptionId of subscription_ids) {
      try {
        const result = await recurringPaymentProcessor.processSubscriptionPayment(
          subscriptionId,
          undefined,
          force_process,
          metadata
        );
        results.push({
          subscription_id: subscriptionId,
          result
        });
      } catch (error) {
        errors.push({
          subscription_id: subscriptionId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    logger.info(`Bulk payment processing completed: ${results.length} successful, ${errors.length} errors by user: ${user.id}`);

    return NextResponse.json({
      data: results,
      errors: errors,
      summary: {
        total_processed: subscription_ids.length,
        successful: results.length,
        failed: errors.length,
        success_rate: ((results.length / subscription_ids.length) * 100).toFixed(2) + '%'
      },
      message: `Processed ${results.length} payments, ${errors.length} errors`
    });
  } catch (error) {
    logger.error('Error in PUT /api/recurring-payments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}