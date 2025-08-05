/**
 * Session Analytics API Route
 * Provides session metrics and analytics data
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

// Get session analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const timeframe = searchParams.get("timeframe") || "7d"; // 1d, 7d, 30d, 90d
    const includeDevices = searchParams.get("includeDevices") === "true";
    const includeSecurity = searchParams.get("includeSecurity") === "true";

    const manager = await getSessionManager();

    // Calculate date range based on timeframe
    const now = new Date();
    const startDate = new Date();

    switch (timeframe) {
      case "1d":
        startDate.setDate(now.getDate() - 1);
        break;
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Get session metrics
    const metrics = await manager.getSessionMetrics(userId, {
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      includeDevices,
      includeSecurity,
    });

    // Get additional analytics
    const analytics = {
      timeframe,
      period: {
        start: startDate.toISOString(),
        end: now.toISOString(),
      },
      metrics,
      summary: {
        totalSessions: metrics.totalSessions || 0,
        activeSessions: metrics.activeSessions || 0,
        averageSessionDuration: metrics.averageSessionDuration || 0,
        securityEvents: metrics.securityEvents || 0,
        uniqueDevices: metrics.uniqueDevices || 0,
        suspiciousActivities: metrics.suspiciousActivities || 0,
      },
    };

    // Add device breakdown if requested
    if (includeDevices && metrics.deviceBreakdown) {
      analytics.deviceBreakdown = metrics.deviceBreakdown;
    }

    // Add security breakdown if requested
    if (includeSecurity && metrics.securityBreakdown) {
      analytics.securityBreakdown = metrics.securityBreakdown;
    }

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Get session analytics error:", error);

    return NextResponse.json(
      { error: "Internal server error while fetching session analytics" },
      { status: 500 },
    );
  }
}

// Get real-time session status
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const manager = await getSessionManager();

    // Get real-time session data
    const activeSessions = await manager.getActiveSessions(userId);
    const recentSecurityEvents = await manager.getSecurityEvents(
      { user_id: userId },
      10, // limit
      0, // offset
    );

    // Calculate session health score
    const healthScore = await manager.calculateSessionHealthScore(userId);

    const realTimeData = {
      timestamp: new Date().toISOString(),
      activeSessions: activeSessions.length,
      sessions: activeSessions.map((session) => ({
        id: session.id,
        device: session.device_info,
        location: session.ip_address,
        lastActivity: session.last_activity,
        securityScore: session.security_score,
      })),
      recentSecurityEvents: recentSecurityEvents.slice(0, 5),
      healthScore,
      alerts: {
        suspiciousActivity: recentSecurityEvents.filter((event) => event.severity === "HIGH")
          .length,
        newDevices: recentSecurityEvents.filter((event) => event.event_type === "DEVICE_REGISTERED")
          .length,
        failedValidations: recentSecurityEvents.filter(
          (event) => event.event_type === "SESSION_VALIDATION_FAILED",
        ).length,
      },
    };

    return NextResponse.json(realTimeData);
  } catch (error) {
    console.error("Get real-time session status error:", error);

    return NextResponse.json(
      { error: "Internal server error while fetching real-time session status" },
      { status: 500 },
    );
  }
}

export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
