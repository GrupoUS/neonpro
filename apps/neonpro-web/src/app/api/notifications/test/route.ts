import type { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import pushNotificationService from "@/lib/push-notification-service";
import type { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Send test push notification
    const result = await pushNotificationService.sendTestNotification(user.id);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Failed to send test notification",
          details: result.errors.join(", "),
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      sent: result.sent,
      message: `Test notification sent to ${result.sent} device(s)`,
    });
  } catch (error) {
    console.error("Error sending test notification:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
