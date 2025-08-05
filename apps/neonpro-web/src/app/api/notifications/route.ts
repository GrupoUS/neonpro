import type { NextRequest, NextResponse } from "next/server";
import type { createClient } from "@/lib/supabase/server";
import type { AnalyticsNotificationService } from "@/lib/services/analytics-notification-service";
import type { z } from "zod";

// Validation schemas
const NotificationQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 20)),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 0)),
  unreadOnly: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  types: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(",") : undefined)),
  clinicId: z.string().optional(),
});

const MarkAsReadSchema = z.object({
  notificationId: z.string().uuid(),
  userId: z.string().uuid(),
});

const CustomNotificationSchema = z.object({
  type: z.enum([
    "trial_started",
    "trial_ending",
    "trial_expired",
    "trial_converted",
    "subscription_created",
    "subscription_updated",
    "subscription_cancelled",
    "payment_successful",
    "payment_failed",
    "analytics_milestone",
    "system_alert",
    "campaign_update",
    "revenue_milestone",
    "user_milestone",
    "conversion_alert",
    "churn_alert",
  ]),
  userId: z.string().uuid(),
  variables: z.record(z.any()).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  channels: z.array(z.enum(["database", "websocket", "email", "push"])).optional(),
  scheduledFor: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  clinicId: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * GET /api/notifications
 * Retrieve user notifications with filtering options
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const validatedQuery = NotificationQuerySchema.parse(queryParams);

    // Get user's clinic access for RLS
    const { data: userClinics, error: clinicsError } = await supabase
      .from("user_clinics")
      .select("clinic_id, role")
      .eq("user_id", user.id)
      .eq("status", "active");

    if (clinicsError) {
      return NextResponse.json({ error: "Failed to fetch user clinics" }, { status: 500 });
    }

    // If clinicId is specified, verify user has access
    if (validatedQuery.clinicId) {
      const hasAccess = userClinics?.some((uc) => uc.clinic_id === validatedQuery.clinicId);
      if (!hasAccess) {
        return NextResponse.json({ error: "Access denied to specified clinic" }, { status: 403 });
      }
    }

    // Get notifications
    const notifications = await AnalyticsNotificationService.getUserNotifications(user.id, {
      limit: validatedQuery.limit,
      offset: validatedQuery.offset,
      unreadOnly: validatedQuery.unreadOnly,
      types: validatedQuery.types as any,
      clinicId: validatedQuery.clinicId,
    });

    if (!notifications) {
      return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }

    // Get unread count
    const unreadCount = await AnalyticsNotificationService.getUnreadCount(
      user.id,
      validatedQuery.clinicId,
    );

    return NextResponse.json({
      notifications,
      unreadCount,
      pagination: {
        limit: validatedQuery.limit,
        offset: validatedQuery.offset,
        hasMore: notifications.length === validatedQuery.limit,
      },
    });
  } catch (error) {
    console.error("GET /api/notifications error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/notifications
 * Send a custom notification or mark notifications as read
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action;

    // Handle different actions
    switch (action) {
      case "markAsRead": {
        const validatedData = MarkAsReadSchema.parse(body);

        // Verify user can mark this notification as read
        if (validatedData.userId !== user.id) {
          return NextResponse.json(
            { error: "Can only mark your own notifications as read" },
            { status: 403 },
          );
        }

        const success = await AnalyticsNotificationService.markAsRead(
          validatedData.notificationId,
          validatedData.userId,
        );

        if (!success) {
          return NextResponse.json(
            { error: "Failed to mark notification as read" },
            { status: 500 },
          );
        }

        return NextResponse.json({ success: true });
      }

      case "sendCustom": {
        // Check if user has admin role for sending custom notifications
        const { data: userClinics, error: clinicsError } = await supabase
          .from("user_clinics")
          .select("clinic_id, role")
          .eq("user_id", user.id)
          .eq("status", "active");

        if (clinicsError) {
          return NextResponse.json({ error: "Failed to verify permissions" }, { status: 500 });
        }

        const isAdmin = userClinics?.some((uc) => ["admin", "owner", "manager"].includes(uc.role));

        if (!isAdmin) {
          return NextResponse.json(
            { error: "Insufficient permissions to send custom notifications" },
            { status: 403 },
          );
        }

        const validatedData = CustomNotificationSchema.parse(body);

        // If clinicId is specified, verify admin has access
        if (validatedData.clinicId) {
          const hasAccess = userClinics?.some(
            (uc) =>
              uc.clinic_id === validatedData.clinicId &&
              ["admin", "owner", "manager"].includes(uc.role),
          );

          if (!hasAccess) {
            return NextResponse.json(
              { error: "Access denied to specified clinic" },
              { status: 403 },
            );
          }
        }

        const notificationId = await AnalyticsNotificationService.sendNotification(
          validatedData.type,
          validatedData.userId,
          validatedData.variables || {},
          {
            priority: validatedData.priority,
            channels: validatedData.channels,
            scheduledFor: validatedData.scheduledFor
              ? new Date(validatedData.scheduledFor)
              : undefined,
            expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : undefined,
            clinicId: validatedData.clinicId,
            metadata: validatedData.metadata,
          },
        );

        if (!notificationId) {
          return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          notificationId,
        });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("POST /api/notifications error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/notifications
 * Bulk operations on notifications
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, notificationIds, clinicId } = body;

    // Validate input
    if (!action || !Array.isArray(notificationIds)) {
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
    }

    // Verify user has access to clinic if specified
    if (clinicId) {
      const { data: userClinics, error: clinicsError } = await supabase
        .from("user_clinics")
        .select("clinic_id, role")
        .eq("user_id", user.id)
        .eq("status", "active")
        .eq("clinic_id", clinicId);

      if (clinicsError || !userClinics || userClinics.length === 0) {
        return NextResponse.json({ error: "Access denied to specified clinic" }, { status: 403 });
      }
    }

    switch (action) {
      case "markAllAsRead": {
        let query = supabase
          .from("analytics_notifications")
          .update({
            read_at: new Date().toISOString(),
            status: "read",
          })
          .eq("user_id", user.id)
          .is("read_at", null);

        if (clinicId) {
          query = query.eq("clinic_id", clinicId);
        }

        if (notificationIds.length > 0) {
          query = query.in("id", notificationIds);
        }

        const { error } = await query;

        if (error) {
          return NextResponse.json(
            { error: "Failed to mark notifications as read" },
            { status: 500 },
          );
        }

        return NextResponse.json({ success: true });
      }

      case "delete": {
        // Only allow deletion of user's own notifications
        const { error } = await supabase
          .from("analytics_notifications")
          .delete()
          .eq("user_id", user.id)
          .in("id", notificationIds);

        if (error) {
          return NextResponse.json({ error: "Failed to delete notifications" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("PUT /api/notifications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
