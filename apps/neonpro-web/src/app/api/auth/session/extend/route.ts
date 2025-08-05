/**
 * Session Extend API Route
 * Extends session timeout with custom duration
 */

import type { NextRequest } from "next/server";
import type { SessionManager } from "@/lib/auth/session/SessionManager";

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
    const { extendMinutes, reason } = await request.json();
    // Cookie instantiation moved inside request handlers;
    const sessionToken = cookieStore.get("session-token")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "No session token found" }, { status: 401 });
    }

    if (!extendMinutes || extendMinutes <= 0 || extendMinutes > 480) {
      // Max 8 hours
      return NextResponse.json(
        { error: "Invalid extension duration. Must be between 1 and 480 minutes." },
        { status: 400 },
      );
    }

    const manager = await getSessionManager();
    const clientIP =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "Unknown";

    // Validate current session first
    const validation = await manager.validateSession(sessionToken, {
      ip_address: clientIP,
      user_agent: userAgent,
    });

    if (!validation.valid) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Get current session
    const currentSession = await manager.getSession(sessionToken);
    if (!currentSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Extend the session
    const extendedSession = await manager.extendSession(sessionToken, extendMinutes);

    if (!extendedSession) {
      return NextResponse.json({ error: "Failed to extend session" }, { status: 500 });
    }

    // Log session extension event
    await manager.logSecurityEvent({
      session_id: sessionToken,
      event_type: SecurityEventType.SESSION_EXTENDED,
      severity: SecuritySeverity.LOW,
      description: `Session extended by ${extendMinutes} minutes`,
      ip_address: clientIP,
      user_agent: userAgent,
      metadata: {
        extension_minutes: extendMinutes,
        reason: reason || "User request",
        old_expires_at: currentSession.expires_at,
        new_expires_at: extendedSession.expires_at,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      session: extendedSession,
      message: `Session extended by ${extendMinutes} minutes`,
    });
  } catch (error) {
    console.error("Session extension error:", error);

    return NextResponse.json(
      { error: "Internal server error during session extension" },
      { status: 500 },
    );
  }
}

export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
