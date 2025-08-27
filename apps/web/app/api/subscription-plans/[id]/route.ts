// NeonPro - Individual Subscription Plan API Routes
// Story 6.1 - Task 2: Recurring Payment System
// Individual plan management endpoints

import { createClient } from "@/app/utils/supabase/server";
import { subscriptionManager } from "@/lib/payments/recurring/subscription-manager";
import { logger } from "@/lib/utils/logger";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

// Validation Schemas
const updatePlanSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  trial_period_days: z.number().min(0).max(365).optional(),
  metadata: z.record(z.any()).optional(),
  active: z.boolean().optional(),
});

// GET /api/subscription-plans/[id] - Get plan details
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; }>; },
) {
  const { id } = await params;
  const planId = id;

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 },
      );
    }

    // Get plan with subscription count
    const { data: plan, error } = await supabase
      .from("subscription_plans")
      .select(
        `
        *,
        subscriptions:subscriptions(count)
      `,
      )
      .eq("id", planId)
      .single();

    if (error || !plan) {
      logger.error(`Error fetching plan ${planId}:`, error);
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Get subscription statistics
    const { data: subscriptionStats } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("plan_id", planId);

    const stats = {
      total_subscriptions: subscriptionStats?.length || 0,
      active_subscriptions: subscriptionStats?.filter((s) => s.status === "active").length || 0,
      trialing_subscriptions: subscriptionStats?.filter((s) => s.status === "trialing").length || 0,
      canceled_subscriptions: subscriptionStats?.filter((s) => s.status === "canceled").length || 0,
    };

    return NextResponse.json({
      data: {
        ...plan,
        statistics: stats,
      },
    });
  } catch (error) {
    logger.error(`Error in GET /api/subscription-plans/${planId}:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/subscription-plans/[id] - Update plan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; }>; },
) {
  const { id } = await params;
  const planId = id;

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!(userProfile && ["admin", "owner"].includes(userProfile.role))) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const planId = id;
    const body = await request.json();

    // Validate request body
    const validationResult = updatePlanSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    // Check if plan exists
    const { data: existingPlan, error: fetchError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (fetchError || !existingPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Check if name is being changed and if it conflicts
    if (
      validationResult.data.name
      && validationResult.data.name !== existingPlan.name
    ) {
      const { data: conflictingPlan } = await supabase
        .from("subscription_plans")
        .select("id")
        .eq("name", validationResult.data.name)
        .neq("id", planId)
        .single();

      if (conflictingPlan) {
        return NextResponse.json(
          { error: "Plan with this name already exists" },
          { status: 409 },
        );
      }
    }

    // Update plan
    const updatedPlan = await subscriptionManager.updatePlan(
      planId,
      validationResult.data,
    );

    logger.info(`Plan updated: ${planId} by user: ${user.id}`);

    return NextResponse.json({
      data: updatedPlan,
      message: "Plan updated successfully",
    });
  } catch (error) {
    logger.error(`Error in PUT /api/subscription-plans/${planId}:`, error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/subscription-plans/[id] - Deactivate plan
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; }>; },
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!(userProfile && ["admin", "owner"].includes(userProfile.role))) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const planId = id;

    // Check if plan exists
    const { data: existingPlan, error: fetchError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (fetchError || !existingPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Check if plan has active subscriptions
    const { data: activeSubscriptions } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("plan_id", planId)
      .in("status", ["active", "trialing"]);

    if (activeSubscriptions && activeSubscriptions.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot deactivate plan with active subscriptions",
          details: {
            active_subscriptions: activeSubscriptions.length,
            message: "Cancel or migrate all active subscriptions before deactivating the plan",
          },
        },
        { status: 409 },
      );
    }

    // Deactivate plan
    const deactivatedPlan = await subscriptionManager.updatePlan(planId, {
      active: false,
    });

    logger.info(`Plan deactivated: ${planId} by user: ${user.id}`);

    return NextResponse.json({
      data: deactivatedPlan,
      message: "Plan deactivated successfully",
    });
  } catch (error) {
    logger.error(`Error in DELETE /api/subscription-plans/${id}:`, error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
