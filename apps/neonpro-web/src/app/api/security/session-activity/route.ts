import type { NextRequest, NextResponse } from "next/server";
import type { requireAuth } from "@/lib/auth";
import type { SessionTimeoutManager } from "@/lib/security/session-timeout-manager";

/**
 * Session Activity API Route
 * Handles session activity tracking and timeout management
 */

const timeoutManager = new SessionTimeoutManager();

/**
 * POST /api/security/session-activity
 * Update session activity and reset timeout
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, activityType = "user_interaction", metadata = {} } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Update session activity
    await timeoutManager.updateActivity(authResult.user!.id, sessionId, activityType, metadata);

    return NextResponse.json({
      message: "Session activity updated successfully",
      sessionId,
      activityType,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Session activity update error:", error);
    return NextResponse.json({ error: "Failed to update session activity" }, { status: 500 });
  }
}

/**
 * GET /api/security/session-activity
 * Get session timeout status and warnings
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Check session timeout status
    const timeoutStatus = await timeoutManager.checkSessionTimeout(authResult.user!.id, sessionId);

    // Get timeout warning if applicable
    const warning = await timeoutManager.getTimeoutWarning(authResult.user!.id, sessionId);

    return NextResponse.json({
      sessionId,
      timeoutStatus,
      warning,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Session timeout check error:", error);
    return NextResponse.json({ error: "Failed to check session timeout" }, { status: 500 });
  }
}

/**
 * PUT /api/security/session-activity
 * Extend session timeout
 */
export async function PUT(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, extensionMinutes = 30 } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Extend session timeout
    const result = await timeoutManager.extendSession(
      authResult.user!.id,
      sessionId,
      extensionMinutes,
    );

    return NextResponse.json({
      message: "Session timeout extended successfully",
      sessionId,
      extensionMinutes,
      newExpiresAt: result.expiresAt,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Session extension error:", error);
    return NextResponse.json({ error: "Failed to extend session timeout" }, { status: 500 });
  }
}
