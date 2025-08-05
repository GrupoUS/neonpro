import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// Validation schemas
const trialCreationSchema = z.object({
  user_id: z.string(),
  trial_type: z.enum(["free", "pro", "enterprise"]),
  duration_days: z.number().min(1).max(365).default(14),
  features: z.array(z.string()).optional(),
  campaign_id: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
});

const trialUpdateSchema = z.object({
  trial_id: z.string(),
  status: z.enum(["active", "expired", "converted", "cancelled"]).optional(),
  extended_days: z.number().min(0).max(90).optional(),
  conversion_data: z
    .object({
      subscription_tier: z.string(),
      payment_method: z.string(),
      amount: z.number(),
    })
    .optional(),
});

const campaignSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  trial_type: z.enum(["free", "pro", "enterprise"]),
  duration_days: z.number().min(1).max(365),
  target_audience: z
    .object({
      demographics: z.record(z.any()).optional(),
      interests: z.array(z.string()).optional(),
      behavior: z.record(z.any()).optional(),
    })
    .optional(),
  ai_optimization: z
    .object({
      enabled: z.boolean().default(true),
      optimization_goals: z
        .array(z.enum(["conversion_rate", "trial_length", "engagement"]))
        .optional(),
      ml_model_version: z.string().optional(),
    })
    .optional(),
  start_date: z.string(),
  end_date: z.string().optional(),
  budget: z.number().min(0).optional(),
});

/**
 * GET /api/trial-management - Retrieve trial data
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role");

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "trials";
    const targetUserId = searchParams.get("userId");
    const status = searchParams.get("status");
    const campaignId = searchParams.get("campaignId");

    // Permission check - users can only see their own trials unless admin
    if (targetUserId && targetUserId !== userId && userRole !== "admin") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    switch (action) {
      case "trials":
        return await getTrials(targetUserId || userId, status, campaignId);

      case "campaigns":
        if (userRole !== "admin") {
          return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }
        return await getCampaigns();

      case "analytics":
        return await getTrialAnalytics(targetUserId || userId, userRole);

      case "ai-insights":
        if (userRole !== "admin") {
          return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }
        return await getAIInsights();

      default:
        return NextResponse.json({ error: "Invalid action parameter" }, { status: 400 });
    }
  } catch (error) {
    console.error("Trial management GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/trial-management - Create trials or campaigns
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role");

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action || "create-trial";

    switch (action) {
      case "create-trial":
        return await createTrial(body, userId, userRole);

      case "create-campaign":
        if (userRole !== "admin") {
          return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }
        return await createCampaign(body, userId);

      case "ai-optimize":
        if (userRole !== "admin") {
          return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }
        return await triggerAIOptimization(body, userId);

      default:
        return NextResponse.json({ error: "Invalid action parameter" }, { status: 400 });
    }
  } catch (error) {
    console.error("Trial management POST error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/trial-management - Update trials
 */
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role");

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const validatedUpdate = trialUpdateSchema.parse(body);

    // Check if user owns the trial or is admin
    const { data: trial, error: trialError } = await supabase
      .from("trials")
      .select("user_id")
      .eq("id", validatedUpdate.trial_id)
      .single();

    if (trialError || !trial) {
      return NextResponse.json({ error: "Trial not found" }, { status: 404 });
    }

    if (trial.user_id !== userId && userRole !== "admin") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Update trial
    const updateData: any = {};

    if (validatedUpdate.status) {
      updateData.status = validatedUpdate.status;
      updateData.updated_at = new Date().toISOString();

      if (validatedUpdate.status === "converted" && validatedUpdate.conversion_data) {
        updateData.conversion_data = validatedUpdate.conversion_data;
        updateData.converted_at = new Date().toISOString();
      }
    }

    if (validatedUpdate.extended_days) {
      // Extend trial duration
      const { data: currentTrial } = await supabase
        .from("trials")
        .select("end_date")
        .eq("id", validatedUpdate.trial_id)
        .single();

      if (currentTrial) {
        const newEndDate = new Date(currentTrial.end_date);
        newEndDate.setDate(newEndDate.getDate() + validatedUpdate.extended_days);
        updateData.end_date = newEndDate.toISOString();
        updateData.extended_days = validatedUpdate.extended_days;
      }
    }

    const { data, error } = await supabase
      .from("trials")
      .update(updateData)
      .eq("id", validatedUpdate.trial_id)
      .select()
      .single();

    if (error) {
      console.error("Trial update error:", error);
      return NextResponse.json({ error: "Failed to update trial" }, { status: 500 });
    }

    // Track analytics event
    await supabase.from("analytics_events").insert({
      event_type: "trial_updated",
      user_id: userId,
      properties: {
        trial_id: validatedUpdate.trial_id,
        updates: updateData,
      },
    });

    return NextResponse.json({
      success: true,
      data,
      message: "Trial updated successfully",
    });
  } catch (error) {
    console.error("Trial update API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid update data",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Helper functions

async function getTrials(userId: string, status?: string | null, campaignId?: string | null) {
  let query = supabase
    .from("trials")
    .select(`
      *,
      campaigns(name, description),
      users(email, created_at)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  if (campaignId) {
    query = query.eq("campaign_id", campaignId);
  }

  const { data, error } = await query;

  if (error) throw error;

  return NextResponse.json({
    success: true,
    data,
    count: data?.length || 0,
  });
}

async function getCampaigns() {
  const { data, error } = await supabase
    .from("campaigns")
    .select(`
      *,
      trials(count)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return NextResponse.json({
    success: true,
    data,
  });
}

async function getTrialAnalytics(userId: string, userRole: string | null) {
  // Get trial analytics data
  const { data, error } = await supabase.rpc("get_trial_analytics_detailed", {
    user_id: userRole === "admin" ? null : userId,
  });

  if (error) throw error;

  return NextResponse.json({
    success: true,
    data,
  });
}

async function getAIInsights() {
  // Get AI-powered insights for trial optimization
  const { data, error } = await supabase.rpc("get_ai_trial_insights");

  if (error) throw error;

  return NextResponse.json({
    success: true,
    data,
  });
}

async function createTrial(body: any, userId: string, userRole: string | null) {
  const validatedTrial = trialCreationSchema.parse(body);

  // Users can only create trials for themselves unless admin
  if (validatedTrial.user_id !== userId && userRole !== "admin") {
    return NextResponse.json({ error: "Cannot create trial for other users" }, { status: 403 });
  }

  // Check if user already has an active trial
  const { data: existingTrial } = await supabase
    .from("trials")
    .select("id")
    .eq("user_id", validatedTrial.user_id)
    .eq("status", "active")
    .single();

  if (existingTrial) {
    return NextResponse.json({ error: "User already has an active trial" }, { status: 409 });
  }

  // Calculate end date
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + validatedTrial.duration_days);

  // Create trial
  const { data, error } = await supabase
    .from("trials")
    .insert({
      user_id: validatedTrial.user_id,
      trial_type: validatedTrial.trial_type,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      duration_days: validatedTrial.duration_days,
      features: validatedTrial.features || [],
      campaign_id: validatedTrial.campaign_id,
      utm_data: {
        source: validatedTrial.utm_source,
        medium: validatedTrial.utm_medium,
        campaign: validatedTrial.utm_campaign,
      },
      status: "active",
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    console.error("Trial creation error:", error);
    return NextResponse.json({ error: "Failed to create trial" }, { status: 500 });
  }

  // Track analytics event
  await supabase.from("analytics_events").insert({
    event_type: "trial_created",
    user_id: validatedTrial.user_id,
    properties: {
      trial_id: data.id,
      trial_type: validatedTrial.trial_type,
      duration_days: validatedTrial.duration_days,
      campaign_id: validatedTrial.campaign_id,
    },
  });

  return NextResponse.json({
    success: true,
    data,
    message: "Trial created successfully",
  });
}

async function createCampaign(body: any, userId: string) {
  const validatedCampaign = campaignSchema.parse(body);

  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      ...validatedCampaign,
      created_by: userId,
      status: "active",
    })
    .select()
    .single();

  if (error) {
    console.error("Campaign creation error:", error);
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data,
    message: "Campaign created successfully",
  });
}

async function triggerAIOptimization(body: any, userId: string) {
  // Trigger AI optimization for trial campaigns
  const { campaign_id, optimization_type } = body;

  // This would typically trigger an ML pipeline
  // For now, we'll simulate the process
  const { data, error } = await supabase
    .from("ai_optimization_jobs")
    .insert({
      campaign_id,
      optimization_type,
      status: "queued",
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    console.error("AI optimization trigger error:", error);
    return NextResponse.json({ error: "Failed to trigger AI optimization" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data,
    message: "AI optimization job queued successfully",
  });
}
