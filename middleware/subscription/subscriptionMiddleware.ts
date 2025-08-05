/**
 * Subscription Validation Middleware
 * Epic: EPIC-001 - Advanced Subscription Management
 * Story: EPIC-001.1 - Subscription Middleware & Management System
 *
 * This middleware validates subscription status and feature access
 * for protected API endpoints based on the user's subscription tier.
 */

import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/database";

type SubscriptionPlan = Database["public"]["Tables"]["subscription_plans"]["Row"];
type UserSubscription = Database["public"]["Tables"]["user_subscriptions"]["Row"];

interface SubscriptionContext {
  subscription: UserSubscription & {
    plan: SubscriptionPlan;
  };
  hasFeature: (feature: string) => boolean;
  checkUsageLimit: (
    feature: string,
    currentUsage: number,
  ) => {
    allowed: boolean;
    limit?: number;
    remaining?: number;
  };
}

/**
 * Feature requirements mapping for different endpoints
 */
const ENDPOINT_FEATURE_MAP: Record<string, string> = {
  // BI Dashboard endpoints
  "/api/dashboard/bi": "bi_dashboard",
  "/api/dashboard/analytics": "advanced_reports",
  "/api/dashboard/custom": "custom_dashboards",

  // Inventory Management
  "/api/inventory": "inventory_management",
  "/api/stock": "inventory_management",

  // Financial Management
  "/api/financial": "financial_management",
  "/api/billing": "financial_management",

  // Advanced Features
  "/api/templates/custom": "custom_templates",
  "/api/webhooks": "webhook_integration",
  "/api/sso": "sso_integration",

  // Multi-location
  "/api/locations": "multi_location",

  // API Access
  "/api/external": "api_access",
};

/**
 * Usage limit endpoints that need validation
 */
const USAGE_LIMIT_MAP: Record<string, string> = {
  "/api/patients": "max_patients",
  "/api/appointments": "max_appointments_per_month",
  "/api/users": "max_users",
  "/api/notifications/sms": "sms_notifications",
  "/api/notifications/email": "email_notifications",
  "/api/storage": "storage_gb",
};

/**
 * Main subscription validation middleware
 */
export async function subscriptionMiddleware(
  request: NextRequest,
  _context: { params?: any },
): Promise<NextResponse | null> {
  try {
    // Get user session
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
        },
      },
    );

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's clinic and subscription
    const { data: userClinic } = await supabase
      .from("user_clinics")
      .select("clinic_id")
      .eq("user_id", session.user.id)
      .eq("is_active", true)
      .single();

    if (!userClinic) {
      return NextResponse.json({ error: "No active clinic found" }, { status: 403 });
    }

    // Get active subscription with plan details
    const { data: subscription, error: subscriptionError } = await supabase
      .from("user_subscriptions")
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq("clinic_id", userClinic.clinic_id)
      .in("status", ["trial", "active"])
      .single();

    if (subscriptionError || !subscription) {
      return NextResponse.json(
        {
          error: "No active subscription found",
          code: "SUBSCRIPTION_REQUIRED",
          message: "Esta funcionalidade requer uma assinatura ativa.",
        },
        { status: 402 }, // Payment Required
      );
    }

    // Check if subscription is expired
    if (subscription.status === "trial" && subscription.trial_end) {
      const now = new Date();
      const trialEnd = new Date(subscription.trial_end);

      if (now > trialEnd) {
        return NextResponse.json(
          {
            error: "Trial period expired",
            code: "TRIAL_EXPIRED",
            message: "Seu período de teste expirou. Faça upgrade para continuar usando.",
          },
          { status: 402 },
        );
      }
    }

    // Validate feature access for current endpoint
    const endpoint = request.nextUrl.pathname;
    const requiredFeature = getRequiredFeature(endpoint);

    if (requiredFeature) {
      const hasAccess = hasFeatureAccess(subscription.plan as SubscriptionPlan, requiredFeature);

      if (!hasAccess) {
        return NextResponse.json(
          {
            error: "Feature not available in your plan",
            code: "FEATURE_NOT_AVAILABLE",
            message: `Esta funcionalidade não está disponível no seu plano ${subscription.plan?.display_name}.`,
            required_feature: requiredFeature,
            current_plan: subscription.plan?.name,
            upgrade_required: true,
          },
          { status: 403 },
        );
      }
    }

    // Check usage limits for applicable endpoints
    const usageLimitKey = USAGE_LIMIT_MAP[endpoint];
    if (usageLimitKey) {
      const usageCheck = await checkUsageLimit(supabase, subscription, usageLimitKey);

      if (!usageCheck.allowed) {
        return NextResponse.json(
          {
            error: "Usage limit exceeded",
            code: "USAGE_LIMIT_EXCEEDED",
            message: `Você atingiu o limite de ${usageLimitKey} do seu plano.`,
            limit: usageCheck.limit,
            current_usage: usageCheck.current,
            upgrade_required: true,
          },
          { status: 429 }, // Too Many Requests
        );
      }
    }

    // Add subscription context to response headers
    const response = NextResponse.next();
    response.headers.set("x-subscription-tier", subscription.plan?.name || "unknown");
    response.headers.set("x-subscription-id", subscription.id);
    response.headers.set("x-clinic-id", subscription.clinic_id);

    return response;
  } catch (error) {
    console.error("Subscription middleware error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        code: "MIDDLEWARE_ERROR",
        message: "Erro interno do sistema. Tente novamente em alguns instantes.",
      },
      { status: 500 },
    );
  }
}

/**
 * Get required feature for a given endpoint
 */
function getRequiredFeature(endpoint: string): string | null {
  // Direct match
  if (ENDPOINT_FEATURE_MAP[endpoint]) {
    return ENDPOINT_FEATURE_MAP[endpoint];
  }

  // Pattern matching for dynamic routes
  for (const [pattern, feature] of Object.entries(ENDPOINT_FEATURE_MAP)) {
    if (endpoint.startsWith(pattern)) {
      return feature;
    }
  }

  return null;
}

/**
 * Check if subscription plan has access to a specific feature
 */
function hasFeatureAccess(plan: SubscriptionPlan, feature: string): boolean {
  if (!plan.features || typeof plan.features !== "object") {
    return false;
  }

  const features = plan.features as Record<string, boolean>;
  return features[feature] === true;
}

/**
 * Check usage limits for a subscription
 */
async function checkUsageLimit(
  supabase: any,
  subscription: UserSubscription & { plan: SubscriptionPlan },
  limitKey: string,
): Promise<{ allowed: boolean; limit?: number; current?: number }> {
  const limits = (subscription.plan?.limits as Record<string, number>) || {};
  const limit = limits[limitKey];

  // -1 means unlimited
  if (limit === -1 || limit === undefined) {
    return { allowed: true };
  }

  // Get current usage based on limit type
  let currentUsage = 0;

  try {
    switch (limitKey) {
      case "max_patients": {
        const { count: patientCount } = await supabase
          .from("patients")
          .select("*", { count: "exact", head: true })
          .eq("clinic_id", subscription.clinic_id)
          .eq("is_active", true);
        currentUsage = patientCount || 0;
        break;
      }

      case "max_appointments_per_month": {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count: appointmentCount } = await supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("clinic_id", subscription.clinic_id)
          .gte("appointment_date", startOfMonth.toISOString());
        currentUsage = appointmentCount || 0;
        break;
      }

      case "max_users": {
        const { count: userCount } = await supabase
          .from("user_clinics")
          .select("*", { count: "exact", head: true })
          .eq("clinic_id", subscription.clinic_id)
          .eq("is_active", true);
        currentUsage = userCount || 0;
        break;
      }

      case "sms_notifications":
      case "email_notifications": {
        // Get usage from subscription_usage table
        const { data: usage } = await supabase
          .from("subscription_usage")
          .select("usage_count")
          .eq("subscription_id", subscription.id)
          .eq("feature_name", limitKey)
          .gte(
            "usage_period_start",
            new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
          )
          .single();
        currentUsage = usage?.usage_count || 0;
        break;
      }

      default:
        // For unknown limits, allow by default
        return { allowed: true };
    }

    return {
      allowed: currentUsage < limit,
      limit,
      current: currentUsage,
    };
  } catch (error) {
    console.error(`Error checking usage limit for ${limitKey}:`, error);
    // On error, allow the request to proceed
    return { allowed: true };
  }
}

/**
 * Helper function to create subscription context for API routes
 */
export async function getSubscriptionContext(
  _request: NextRequest,
): Promise<SubscriptionContext | null> {
  // This will be used in API routes to get subscription context
  // Implementation similar to middleware but returns context object
  // instead of NextResponse

  return null; // Placeholder - will be implemented in next chunk
}
