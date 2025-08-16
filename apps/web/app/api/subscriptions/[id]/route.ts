// NeonPro - Individual Subscription API Routes
// Story 6.1 - Task 2: Recurring Payment System
// Individual subscription management endpoints

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { subscriptionManager } from '@/lib/payments/recurring/subscription-manager';
import { logger } from '@/lib/utils/logger';

// Validation Schemas
const updateSubscriptionSchema = z.object({
  plan_id: z.string().uuid().optional(),
  cancel_at_period_end: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
  proration_behavior: z
    .enum(['create_prorations', 'none', 'always_invoice'])
    .optional(),
});

const _pauseSubscriptionSchema = z.object({
  pause_collection: z.object({
    behavior: z.enum(['keep_as_draft', 'mark_uncollectible', 'void']),
    resumes_at: z.string().datetime().optional(),
  }),
});

// GET /api/subscriptions/[id] - Get subscription details
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscriptionId = params.id;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 },
      );
    }

    // Get subscription with related data
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select(
        `
        *,
        plan:subscription_plans(*),
        customer:customers(*),
        usage:subscription_usage(*),
        billing_events:billing_events(
          *,
          payment_retry_logs(*)
        )
      `,
      )
      .eq('id', subscriptionId)
      .single();

    if (error || !subscription) {
      logger.error(`Error fetching subscription ${subscriptionId}:`, error);
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 },
      );
    }

    // Check if user has permission to view this subscription
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role, organization_id')
      .eq('user_id', user.id)
      .single();

    const isAdmin =
      userProfile && ['admin', 'owner'].includes(userProfile.role);
    const isCustomerOwner = subscription.customer.user_id === user.id;
    const isSameOrganization =
      subscription.customer.organization_id === userProfile?.organization_id;

    if (!(isAdmin || isCustomerOwner || isSameOrganization)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 },
      );
    }

    return NextResponse.json({
      data: subscription,
    });
  } catch (error) {
    logger.error(`Error in GET /api/subscriptions/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// PUT /api/subscriptions/[id] - Update subscription
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscriptionId = params.id;
    const body = await request.json();

    // Validate request body
    const validationResult = updateSubscriptionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    // Check if subscription exists and user has permission
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select(
        `
        *,
        customer:customers(*)
      `,
      )
      .eq('id', subscriptionId)
      .single();

    if (fetchError || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 },
      );
    }

    // Check permissions
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role, organization_id')
      .eq('user_id', user.id)
      .single();

    const isAdmin =
      userProfile && ['admin', 'owner'].includes(userProfile.role);
    const isCustomerOwner = subscription.customer.user_id === user.id;
    const isSameOrganization =
      subscription.customer.organization_id === userProfile?.organization_id;

    if (!(isAdmin || isCustomerOwner || isSameOrganization)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 },
      );
    }

    // Update subscription
    const updatedSubscription = await subscriptionManager.updateSubscription(
      subscriptionId,
      validationResult.data,
    );

    logger.info(`Subscription updated: ${subscriptionId} by user: ${user.id}`);

    return NextResponse.json({
      data: updatedSubscription,
      message: 'Subscription updated successfully',
    });
  } catch (error) {
    logger.error(`Error in PUT /api/subscriptions/${params.id}:`, error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// DELETE /api/subscriptions/[id] - Cancel subscription
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscriptionId = params.id;
    const { searchParams } = new URL(request.url);
    const immediate = searchParams.get('immediate') === 'true';

    // Check if subscription exists and user has permission
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select(
        `
        *,
        customer:customers(*)
      `,
      )
      .eq('id', subscriptionId)
      .single();

    if (fetchError || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 },
      );
    }

    // Check permissions
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role, organization_id')
      .eq('user_id', user.id)
      .single();

    const isAdmin =
      userProfile && ['admin', 'owner'].includes(userProfile.role);
    const isCustomerOwner = subscription.customer.user_id === user.id;
    const isSameOrganization =
      subscription.customer.organization_id === userProfile?.organization_id;

    if (!(isAdmin || isCustomerOwner || isSameOrganization)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 },
      );
    }

    // Cancel subscription
    const canceledSubscription = await subscriptionManager.cancelSubscription(
      subscriptionId,
      immediate,
    );

    logger.info(
      `Subscription canceled: ${subscriptionId} by user: ${user.id}, immediate: ${immediate}`,
    );

    return NextResponse.json({
      data: canceledSubscription,
      message: immediate
        ? 'Subscription canceled immediately'
        : 'Subscription will be canceled at the end of the current period',
    });
  } catch (error) {
    logger.error(`Error in DELETE /api/subscriptions/${params.id}:`, error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
