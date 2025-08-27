import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
);

// Analytics query schema
const _analyticsQuerySchema = z.object({
  metric: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  filters: z.record(z.any()).optional(),
  userId: z.string().optional(),
  granularity: z.string().optional(),
});

// Validation schemas
const eventTrackingSchema = z.object({
  event_type: z.string(),
  user_id: z.string(),
  properties: z.record(z.any()).optional(),
  timestamp: z.string().optional(),
});

/**
 * GET /api/analytics - Retrieve analytics data
 */
export async function GET(request: NextRequest) {
  try {
    // Extract user info from middleware headers
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role");
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
      metric: searchParams.get("metric"),
      granularity: searchParams.get("granularity") || "day",
      userId: searchParams.get("userId"),
      subscriptionTier: searchParams.get("subscriptionTier"),
    };

    // Validate query parameters
    const validatedParams = _analyticsQuerySchema.parse(queryParams);

    // Check permissions - only admins can view other users' data
    if (
      validatedParams.userId
      && validatedParams.userId !== userId
      && userRole !== "admin"
    ) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    // Set default date range if not provided (last 30 days)
    const endDate = validatedParams.endDate || new Date().toISOString().split("T")[0];
    const startDate = validatedParams.startDate
      || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

    let analyticsData: unknown = {};

    // Fetch different metrics based on request
    switch (validatedParams.metric) {
      case "revenue": {
        analyticsData = await getRevenueAnalytics(
          startDate,
          endDate,
          validatedParams.granularity || "day",
          validatedParams.userId || userId,
        );
        break;
      }
      case "subscriptions": {
        analyticsData = await getSubscriptionAnalytics(
          startDate,
          endDate,
          validatedParams.granularity || "day",
          validatedParams.userId || userId,
        );
        break;
      }
      case "trials": {
        analyticsData = await getTrialAnalytics(
          startDate,
          endDate,
          validatedParams.granularity || "day",
          validatedParams.userId || userId,
        );
        break;
      }
      case "conversions": {
        analyticsData = await getConversionAnalytics(
          startDate,
          endDate,
          validatedParams.granularity || "day",
          validatedParams.userId || userId,
        );
        break;
      }
      case "churn": {
        analyticsData = await getChurnAnalytics(
          startDate,
          endDate,
          validatedParams.granularity || "day",
          validatedParams.userId || userId,
        );
        break;
      }
      default: {
        // Return comprehensive dashboard data
        analyticsData = await getDashboardAnalytics(
          startDate,
          endDate,
          validatedParams.userId || userId,
          userRole,
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: analyticsData,
      metadata: {
        startDate,
        endDate,
        granularity: validatedParams.granularity || "day",
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/analytics - Track analytics events
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const validatedEvent = eventTrackingSchema.parse(body);

    // Ensure user can only track events for themselves (unless admin)
    const userRole = request.headers.get("x-user-role");
    if (validatedEvent.user_id !== userId && userRole !== "admin") {
      return NextResponse.json(
        { error: "Cannot track events for other users" },
        { status: 403 },
      );
    }

    // Insert event into analytics_events table
    const { data, error } = await supabase
      .from("analytics_events")
      .insert({
        event_type: validatedEvent.event_type,
        user_id: validatedEvent.user_id,
        properties: validatedEvent.properties || {},
        timestamp: validatedEvent.timestamp || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to track event" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      eventId: data.id,
      message: "Event tracked successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid event data",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Helper functions for different analytics queries
async function getRevenueAnalytics(
  startDate: string,
  endDate: string,
  granularity: string,
  userId: string,
) {
  const { data, error } = await (
    await supabase
  ).rpc("get_revenue_analytics", {
    start_date: startDate,
    end_date: endDate,
    granularity,
    user_id: userId,
  });

  if (error) {
    throw error;
  }
  return data;
}

async function getSubscriptionAnalytics(
  startDate: string,
  endDate: string,
  granularity: string,
  userId: string,
) {
  const { data, error } = await (
    await supabase
  ).rpc("get_subscription_analytics", {
    start_date: startDate,
    end_date: endDate,
    granularity,
    user_id: userId,
  });

  if (error) {
    throw error;
  }
  return data;
}

async function getTrialAnalytics(
  startDate: string,
  endDate: string,
  granularity: string,
  userId: string,
) {
  const { data, error } = await (
    await supabase
  ).rpc("get_trial_analytics", {
    start_date: startDate,
    end_date: endDate,
    granularity,
    user_id: userId,
  });

  if (error) {
    throw error;
  }
  return data;
}

async function getConversionAnalytics(
  startDate: string,
  endDate: string,
  granularity: string,
  userId: string,
) {
  const { data, error } = await (
    await supabase
  ).rpc("get_conversion_analytics", {
    start_date: startDate,
    end_date: endDate,
    granularity,
    user_id: userId,
  });

  if (error) {
    throw error;
  }
  return data;
}

async function getChurnAnalytics(
  startDate: string,
  endDate: string,
  granularity: string,
  userId: string,
) {
  const { data, error } = await (
    await supabase
  ).rpc("get_churn_analytics", {
    start_date: startDate,
    end_date: endDate,
    granularity,
    user_id: userId,
  });

  if (error) {
    throw error;
  }
  return data;
}

async function getDashboardAnalytics(
  startDate: string,
  endDate: string,
  userId: string,
  _userRole: string | null,
) {
  // Get comprehensive dashboard data
  const [revenue, subscriptions, trials, conversions] = await Promise.all([
    getRevenueAnalytics(startDate, endDate, "day", userId),
    getSubscriptionAnalytics(startDate, endDate, "day", userId),
    getTrialAnalytics(startDate, endDate, "day", userId),
    getConversionAnalytics(startDate, endDate, "day", userId),
  ]);

  return {
    revenue,
    subscriptions,
    trials,
    conversions,
    summary: {
      totalRevenue: revenue?.reduce(
        (sum: number, item: any) => sum + (item.revenue || 0),
        0,
      ) || 0,
      totalSubscriptions: subscriptions?.length || 0,
      totalTrials: trials?.length || 0,
      conversionRate: conversions?.conversion_rate || 0,
    },
  };
}

export const validateCSRF = () => true;

export const rateLimit = () => ({});

export const createBackupConfig = () => ({});

export const sessionConfig = {};

export class UnifiedSessionSystem {}

export const trackLoginPerformance = () => {};

export type PermissionContext = unknown;

export type SessionValidationResult = unknown;
