// Session API Routes
// Story 1.4: Session Management & Security Implementation

import type { NextRequest, NextResponse } from "next/server";
import type { DeviceManager } from "../device-manager";
import type { SecurityMonitor } from "../security-monitor";
import type { SessionManager } from "../session-manager";
import type { DeviceInfo, SecurityEvent, SessionData } from "../types";
import type { ValidationUtils } from "../utils";

/**
 * Session API route handlers
 */
export class SessionRoutes {
  constructor(
    private sessionManager: SessionManager,
    private securityMonitor: SecurityMonitor,
    private deviceManager: DeviceManager,
  ) {}

  /**
   * Create new session
   * POST /api/auth/session
   */
  async createSession(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const { userId, userRole, deviceInfo, location } = body;

      // Validate required fields
      if (!userId || !userRole) {
        return NextResponse.json(
          { error: "Missing required fields: userId, userRole" },
          { status: 400 },
        );
      }

      // Validate user role
      if (!ValidationUtils.isValidRole(userRole)) {
        return NextResponse.json({ error: "Invalid user role" }, { status: 400 });
      }

      // Extract client info
      const clientIP = this.getClientIP(request);
      const userAgent = request.headers.get("user-agent") || "unknown";

      // Register device if provided
      let deviceId: string | undefined;
      if (deviceInfo) {
        deviceId = await this.deviceManager.registerDevice({
          ...deviceInfo,
          userId,
          ipAddress: clientIP,
          userAgent,
        });
      }

      // Create session
      const sessionData = await this.sessionManager.createSession({
        userId,
        userRole,
        deviceId,
        ipAddress: clientIP,
        userAgent,
        location,
      });

      // Log security event
      await this.securityMonitor.logSecurityEvent({
        type: "session_created",
        userId,
        sessionId: sessionData.sessionId,
        severity: "info",
        details: {
          deviceId,
          ipAddress: clientIP,
          userAgent,
          location,
        },
        timestamp: new Date(),
        ipAddress: clientIP,
        userAgent,
      });

      return NextResponse.json({
        success: true,
        session: sessionData,
        deviceId,
      });
    } catch (error) {
      console.error("Create session error:", error);
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
    }
  }

  /**
   * Get session info
   * GET /api/auth/session/:sessionId
   */
  async getSession(request: NextRequest, sessionId: string): Promise<NextResponse> {
    try {
      const session = await this.sessionManager.getSession(sessionId);

      if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      // Check if session belongs to requesting user
      const authHeader = request.headers.get("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const token = authHeader.substring(7);
      if (token !== sessionId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      return NextResponse.json({
        success: true,
        session,
      });
    } catch (error) {
      console.error("Get session error:", error);
      return NextResponse.json({ error: "Failed to get session" }, { status: 500 });
    }
  }

  /**
   * Update session activity
   * PUT /api/auth/session/:sessionId/activity
   */
  async updateActivity(request: NextRequest, sessionId: string): Promise<NextResponse> {
    try {
      const body = await request.json();
      const { activity } = body;

      const clientIP = this.getClientIP(request);
      const userAgent = request.headers.get("user-agent") || "unknown";

      const success = await this.sessionManager.updateActivity(sessionId, activity, {
        ipAddress: clientIP,
        userAgent,
        timestamp: new Date(),
      });

      if (!success) {
        return NextResponse.json({ error: "Failed to update activity" }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: "Activity updated successfully",
      });
    } catch (error) {
      console.error("Update activity error:", error);
      return NextResponse.json({ error: "Failed to update activity" }, { status: 500 });
    }
  }

  /**
   * Extend session
   * PUT /api/auth/session/:sessionId/extend
   */
  async extendSession(request: NextRequest, sessionId: string): Promise<NextResponse> {
    try {
      const body = await request.json();
      const { duration } = body;

      const success = await this.sessionManager.extendSession(sessionId, duration);

      if (!success) {
        return NextResponse.json({ error: "Failed to extend session" }, { status: 400 });
      }

      // Log security event
      const session = await this.sessionManager.getSession(sessionId);
      if (session) {
        await this.securityMonitor.logSecurityEvent({
          type: "session_extended",
          userId: session.userId,
          sessionId,
          severity: "info",
          details: { duration },
          timestamp: new Date(),
          ipAddress: this.getClientIP(request),
          userAgent: request.headers.get("user-agent") || "unknown",
        });
      }

      return NextResponse.json({
        success: true,
        message: "Session extended successfully",
      });
    } catch (error) {
      console.error("Extend session error:", error);
      return NextResponse.json({ error: "Failed to extend session" }, { status: 500 });
    }
  }

  /**
   * Terminate session
   * DELETE /api/auth/session/:sessionId
   */
  async terminateSession(request: NextRequest, sessionId: string): Promise<NextResponse> {
    try {
      const body = await request.json().catch(() => ({}));
      const { reason = "user_logout" } = body;

      const session = await this.sessionManager.getSession(sessionId);
      const success = await this.sessionManager.terminateSession(sessionId, reason);

      if (!success) {
        return NextResponse.json({ error: "Failed to terminate session" }, { status: 400 });
      }

      // Log security event
      if (session) {
        await this.securityMonitor.logSecurityEvent({
          type: "session_terminated",
          userId: session.userId,
          sessionId,
          severity: "info",
          details: { reason },
          timestamp: new Date(),
          ipAddress: this.getClientIP(request),
          userAgent: request.headers.get("user-agent") || "unknown",
        });
      }

      return NextResponse.json({
        success: true,
        message: "Session terminated successfully",
      });
    } catch (error) {
      console.error("Terminate session error:", error);
      return NextResponse.json({ error: "Failed to terminate session" }, { status: 500 });
    }
  }

  /**
   * Get user sessions
   * GET /api/auth/sessions/user/:userId
   */
  async getUserSessions(request: NextRequest, userId: string): Promise<NextResponse> {
    try {
      // Verify authorization
      const authResult = await this.verifyAuthorization(request, userId);
      if (authResult) return authResult;

      const sessions = await this.sessionManager.getUserSessions(userId);

      return NextResponse.json({
        success: true,
        sessions,
        count: sessions.length,
      });
    } catch (error) {
      console.error("Get user sessions error:", error);
      return NextResponse.json({ error: "Failed to get user sessions" }, { status: 500 });
    }
  }

  /**
   * Terminate all user sessions
   * DELETE /api/auth/sessions/user/:userId
   */
  async terminateUserSessions(request: NextRequest, userId: string): Promise<NextResponse> {
    try {
      // Verify authorization
      const authResult = await this.verifyAuthorization(request, userId);
      if (authResult) return authResult;

      const body = await request.json().catch(() => ({}));
      const { reason = "admin_action", excludeSessionId } = body;

      const terminatedCount = await this.sessionManager.terminateUserSessions(
        userId,
        reason,
        excludeSessionId,
      );

      // Log security event
      await this.securityMonitor.logSecurityEvent({
        type: "user_sessions_terminated",
        userId,
        severity: "warning",
        details: {
          reason,
          terminatedCount,
          excludeSessionId,
        },
        timestamp: new Date(),
        ipAddress: this.getClientIP(request),
        userAgent: request.headers.get("user-agent") || "unknown",
      });

      return NextResponse.json({
        success: true,
        message: `${terminatedCount} sessions terminated`,
        terminatedCount,
      });
    } catch (error) {
      console.error("Terminate user sessions error:", error);
      return NextResponse.json({ error: "Failed to terminate user sessions" }, { status: 500 });
    }
  }

  /**
   * Validate session
   * POST /api/auth/session/validate
   */
  async validateSession(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const { sessionId } = body;

      if (!sessionId) {
        return NextResponse.json({ error: "Session ID required" }, { status: 400 });
      }

      const clientIP = this.getClientIP(request);
      const userAgent = request.headers.get("user-agent") || "unknown";

      const isValid = await this.sessionManager.validateSession(sessionId, {
        ipAddress: clientIP,
        userAgent,
      });

      if (!isValid) {
        return NextResponse.json({ error: "Invalid session" }, { status: 401 });
      }

      const session = await this.sessionManager.getSession(sessionId);

      return NextResponse.json({
        success: true,
        valid: true,
        session,
      });
    } catch (error) {
      console.error("Validate session error:", error);
      return NextResponse.json({ error: "Failed to validate session" }, { status: 500 });
    }
  }

  /**
   * Get session metrics
   * GET /api/auth/sessions/metrics
   */
  async getSessionMetrics(request: NextRequest): Promise<NextResponse> {
    try {
      // Verify admin authorization
      const authResult = await this.verifyAdminAuthorization(request);
      if (authResult) return authResult;

      const url = new URL(request.url);
      const startDate = url.searchParams.get("startDate");
      const endDate = url.searchParams.get("endDate");
      const userId = url.searchParams.get("userId");

      const metrics = await this.sessionManager.getSessionMetrics({
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        userId: userId || undefined,
      });

      return NextResponse.json({
        success: true,
        metrics,
      });
    } catch (error) {
      console.error("Get session metrics error:", error);
      return NextResponse.json({ error: "Failed to get session metrics" }, { status: 500 });
    }
  }

  /**
   * Cleanup expired sessions
   * POST /api/auth/sessions/cleanup
   */
  async cleanupSessions(request: NextRequest): Promise<NextResponse> {
    try {
      // Verify admin authorization
      const authResult = await this.verifyAdminAuthorization(request);
      if (authResult) return authResult;

      const cleanedCount = await this.sessionManager.cleanupExpiredSessions();

      return NextResponse.json({
        success: true,
        message: `${cleanedCount} expired sessions cleaned up`,
        cleanedCount,
      });
    } catch (error) {
      console.error("Cleanup sessions error:", error);
      return NextResponse.json({ error: "Failed to cleanup sessions" }, { status: 500 });
    }
  }

  // Helper methods
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-for");
    const realIP = request.headers.get("x-real-ip");

    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }

    return realIP || "unknown";
  }

  private async verifyAuthorization(
    request: NextRequest,
    userId: string,
  ): Promise<NextResponse | null> {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionId = authHeader.substring(7);
    const session = await this.sessionManager.getSession(sessionId);

    if (!session || session.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return null;
  }

  private async verifyAdminAuthorization(request: NextRequest): Promise<NextResponse | null> {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionId = authHeader.substring(7);
    const session = await this.sessionManager.getSession(sessionId);

    if (!session || !["owner", "manager"].includes(session.userRole)) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    return null;
  }
}

/**
 * Create session routes handler
 */
export function createSessionRoutes(
  sessionManager: SessionManager,
  securityMonitor: SecurityMonitor,
  deviceManager: DeviceManager,
) {
  return new SessionRoutes(sessionManager, securityMonitor, deviceManager);
}
