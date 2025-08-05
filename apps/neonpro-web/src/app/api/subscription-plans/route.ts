// NeonPro - Subscription Plans API Routes
// Story 6.1 - Task 2: Recurring Payment System
// Subscription plans management endpoints

import type { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";
import type { subscriptionManager } from "@/lib/payments/recurring/subscription-manager";
import type { createClient } from "@/lib/supabase/server";
import type { logger } from "@/lib/utils/logger";

// Validation Schemas
const createPlanSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  amount: z.number().min(0),
  currency: z.string().length(3).default("BRL"),
  interval: z.enum(["day", "week", "month", "year"]),
  interval_count: z.number().min(1).max(365).default(1),
  trial_period_days: z.number().min(0).max(365).optional(),
  usage_type: z.enum(["licensed", "metered"]).default("licensed"),
  billing_scheme: z.enum(["per_unit", "tiered"]).default("per_unit"),
  tiers: z
    .array(
      z.object({
        up_to: z.number().nullable(),
        flat_amount: z.number().optional(),
        unit_amount: z.number().optional(),
      }),
    )
    .optional(),
  transform_usage: z
    .object({
      divide_by: z.number().min(1),
      round: z.enum(["up", "down"]),
    })
    .optional(),
  metadata: z.record(z.any()).optional(),
  active: z.boolean().default(true),
});

const updatePlanSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  trial_period_days: z.number().min(0).max(365).optional(),
  metadata: z.record(z.any()).optional(),
  active: z.boolean().optional(),
});

// GET /api/subscription-plans - List subscription plans
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active");
    const currency = searchParams.get("currency");
    const interval = searchParams.get("interval");
    const usageType = searchParams.get("usage_type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build query
    let query = supabase
      .from("subscription_plans")
      .select("*")
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    // Apply filters
    if (active !== null) {
      query = query.eq("active", active === "true");
    }
    if (currency) {
      query = query.eq("currency", currency.toUpperCase());
    }
    if (interval) {
      query = query.eq("interval", interval);
    }
    if (usageType) {
      query = query.eq("usage_type", usageType);
    }

    const { data: plans, error, count } = await query;

    if (error) {
      logger.error("Error fetching subscription plans:", error);
      return NextResponse.json({ error: "Failed to fetch subscription plans" }, { status: 500 });
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from("subscription_plans")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      data: plans,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / limit),
      },
    });
  } catch (error) {
    logger.error("Error in GET /api/subscription-plans:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/subscription-plans - Create new subscription plan
export async function POST(request: NextRequest) {
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

    if (!userProfile || !["admin", "owner"].includes(userProfile.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();

    // Validate request body
    const validationResult = createPlanSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const planData = validationResult.data;

    // Check if plan with same name already exists
    const { data: existingPlan } = await supabase
      .from("subscription_plans")
      .select("id")
      .eq("name", planData.name)
      .single();

    if (existingPlan) {
      return NextResponse.json({ error: "Plan with this name already exists" }, { status: 409 });
    }

    // Create plan
    const plan = await subscriptionManager.createPlan(planData);

    logger.info(`Subscription plan created: ${plan.id} by user: ${user.id}`);

    return NextResponse.json(
      {
        data: plan,
        message: "Subscription plan created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error("Error in POST /api/subscription-plans:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/subscription-plans - Bulk update plans (admin only)
export async function PUT(request: NextRequest) {
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

    if (!userProfile || !["admin", "owner"].includes(userProfile.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();
    const { plan_ids, updates } = body;

    if (!Array.isArray(plan_ids) || !updates) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    // Validate updates
    const validationResult = updatePlanSchema.safeParse(updates);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid update data",
          details: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const results = [];
    const errors = [];

    // Update each plan
    for (const planId of plan_ids) {
      try {
        const updatedPlan = await subscriptionManager.updatePlan(planId, validationResult.data);
        results.push(updatedPlan);
      } catch (error) {
        errors.push({
          plan_id: planId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      data: results,
      errors: errors,
      message: `Updated ${results.length} plans, ${errors.length} errors`,
    });
  } catch (error) {
    logger.error("Error in PUT /api/subscription-plans:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/subscription-plans - Bulk deactivate plans (admin only)
export async function DELETE(request: NextRequest) {
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

    if (!userProfile || !["admin", "owner"].includes(userProfile.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();
    const { plan_ids } = body;

    if (!Array.isArray(plan_ids)) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    const results = [];
    const errors = [];

    // Deactivate each plan
    for (const planId of plan_ids) {
      try {
        const deactivatedPlan = await subscriptionManager.updatePlan(planId, { active: false });
        results.push(deactivatedPlan);
      } catch (error) {
        errors.push({
          plan_id: planId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      data: results,
      errors: errors,
      message: `Deactivated ${results.length} plans, ${errors.length} errors`,
    });
  } catch (error) {
    logger.error("Error in DELETE /api/subscription-plans:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
