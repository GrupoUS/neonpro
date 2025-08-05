/**
 * Session Terminate API Route
 * Terminates an existing session and logs security event
 */

import type { NextRequest, NextResponse } from "next/server";
import type { cookies } from "next/headers";
import type { SessionManager } from "@/lib/auth/session/SessionManager";
import type { createClient } from "@/lib/supabase/server";
import type { SecurityEventType, SecuritySeverity } from "@/types/session";

// Initialize session manager
let sessionManager: SessionManager | null = null;

async function getSessionManager() {
  if (!sessionManager) {
    const supabase = await createClient();
    sessionManager = new SessionManager(supabase, {
      defaultTimeout: 30,
      maxConcurrentSessions: 5,
      enableDeviceTracking: true,
      enableSecurityMonitoring: true,
      enableSuspiciousActivityDetection: true,
      sessionCleanupInterval: 300000,
      securityEventRetention: 30 * 24 * 60 * 60 * 1000,
      encryptionKey: process.env.SESSION_ENCRYPTION_KEY || "default-key-change-in-production",
    });
  }
  return sessionManager;
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, reason } = await request.json();
    // Cookie instantiation moved inside request handlers;
    const sessionToken = sessionId || cookieStore.get("session-token")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "No session token provided" }, { status: 400 });
    }

    const manager = await getSessionManager();
    const clientIP =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "Unknown";

    // Get session info before termination for logging
    const session = await manager.getSession(sessionToken);

    // Terminate the session
    const terminated = await manager.terminateSession(sessionToken);

    if (!terminated) {
      return NextResponse.json(
        { error: "Failed to terminate session or session not found" },
        { status: 404 },
      );
    }

    // Log session termination event
    await manager.logSecurityEvent({
      session_id: sessionToken,
      event_type: SecurityEventType.SESSION_TERMINATED,
      severity: SecuritySeverity.MEDIUM,
      description: `Session terminated: ${reason || "User logout"}`,
      ip_address: clientIP,
      user_agent: userAgent,
      metadata: {
        reason: reason || "User logout",
        terminated_at: new Date().toISOString(),
        session_duration: session
          ? new Date().getTime() - new Date(session.created_at).getTime()
          : null,
      },
    });

    // Clear session cookie
    const response = NextResponse.json({
      success: true,
      message: "Session terminated successfully",
    });

    response.cookies.set("session-token", "", {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return response;
  } catch (error) {
    console.error("Session termination error:", error);

    return NextResponse.json(
      { error: "Internal server error during session termination" },
      { status: 500 },
    );
  }
}

// Terminate all sessions for a user
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const manager = await getSessionManager();
    const clientIP =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "Unknown";

    // Get all active sessions for the user
    const activeSessions = await manager.getActiveSessions(userId);

    // Terminate all sessions
    const terminatedCount = await manager.terminateAllSessions(userId);

    // Log bulk termination event
    await manager.logSecurityEvent({
      session_id: "bulk-termination",
      event_type: SecurityEventType.BULK_SESSION_TERMINATION,
      severity: SecuritySeverity.HIGH,
      description: `All sessions terminated for user: ${userId}`,
      ip_address: clientIP,
      user_agent: userAgent,
      metadata: {
        user_id: userId,
        terminated_count: terminatedCount,
        terminated_sessions: activeSessions.map((s) => s.id),
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `${terminatedCount} sessions terminated successfully`,
      terminatedCount,
    });
  } catch (error) {
    console.error("Bulk session termination error:", error);

    return NextResponse.json(
      { error: "Internal server error during bulk session termination" },
      { status: 500 },
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
