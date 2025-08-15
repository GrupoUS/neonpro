// NeonPro - Subscriptions API Routes
// Story 6.1 - Task 2: Recurring Payment System
// Main subscription management endpoints

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { subscriptionManager } from '@/lib/payments/recurring/subscription-manager';
import { logger } from '@/lib/utils/logger';

// Validation Schemas
const createSubscriptionSchema = z.object({
  customer_id: z.string().uuid(),
  plan_id: z.string().uuid(),
  payment_method_id: z.string().optional(),
  trial_days: z.number().min(0).max(365).optional(),
  metadata: z.record(z.any()).optional(),
  proration_behavior: z.enum(['create_prorations', 'none']).optional(),
});

const updateSubscriptionSchema = z.object({
  plan_id: z.string().uuid().optional(),
  cancel_at_period_end: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
  proration_behavior: z
    .enum(['create_prorations', 'none', 'always_invoice'])
    .optional(),
});

// GET /api/subscriptions - List subscriptions
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

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customer_id');
    const status = searchParams.get('status');
    const planId = searchParams.get('plan_id');
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '10', 10);

    // Build query
    let query = supabase
      .from('subscriptions')
      .select(`
        *,
        plan:subscription_plans(*),
        customer:customers(*),
        usage:subscription_usage(*)
      `)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    // Apply filters
    if (customerId) {
      query = query.eq('customer_id', customerId);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (planId) {
      query = query.eq('plan_id', planId);
    }

    const { data: subscriptions, error, count } = await query;

    if (error) {
      logger.error('Error fetching subscriptions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      data: subscriptions,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / limit),
      },
    });
  } catch (error) {
    logger.error('Error in GET /api/subscriptions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions - Create new subscription
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

    const body = await request.json();

    // Validate request body
    const validationResult = createSubscriptionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const subscriptionData = validationResult.data;

    // Check if user has permission to create subscription for this customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', subscriptionData.customer_id)
      .single();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Check if customer already has an active subscription
    const { data: existingSubscriptions } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('customer_id', subscriptionData.customer_id)
      .in('status', ['active', 'trialing']);

    if (existingSubscriptions && existingSubscriptions.length > 0) {
      return NextResponse.json(
        { error: 'Customer already has an active subscription' },
        { status: 409 }
      );
    }

    // Create subscription
    const subscription =
      await subscriptionManager.createSubscription(subscriptionData);

    logger.info(
      `Subscription created: ${subscription.id} for customer: ${subscriptionData.customer_id}`
    );

    return NextResponse.json(
      {
        data: subscription,
        message: 'Subscription created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Error in POST /api/subscriptions:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/subscriptions - Bulk update subscriptions (admin only)
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
    const { subscription_ids, updates } = body;

    if (!(Array.isArray(subscription_ids) && updates)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Validate updates
    const validationResult = updateSubscriptionSchema.safeParse(updates);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid update data',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    // Update each subscription
    for (const subscriptionId of subscription_ids) {
      try {
        const updatedSubscription =
          await subscriptionManager.updateSubscription(
            subscriptionId,
            validationResult.data
          );
        results.push(updatedSubscription);
      } catch (error) {
        errors.push({
          subscription_id: subscriptionId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      data: results,
      errors,
      message: `Updated ${results.length} subscriptions, ${errors.length} errors`,
    });
  } catch (error) {
    logger.error('Error in PUT /api/subscriptions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/subscriptions - Bulk cancel subscriptions (admin only)
export async function DELETE(request: NextRequest) {
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
    const { subscription_ids, immediate = false } = body;

    if (!Array.isArray(subscription_ids)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    // Cancel each subscription
    for (const subscriptionId of subscription_ids) {
      try {
        const canceledSubscription =
          await subscriptionManager.cancelSubscription(
            subscriptionId,
            immediate
          );
        results.push(canceledSubscription);
      } catch (error) {
        errors.push({
          subscription_id: subscriptionId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      data: results,
      errors,
      message: `Canceled ${results.length} subscriptions, ${errors.length} errors`,
    });
  } catch (error) {
    logger.error('Error in DELETE /api/subscriptions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
