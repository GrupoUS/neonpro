import type { createClient } from "@supabase/supabase-js";
import type { NextRequest, NextResponse } from "next/server";
import type { IntegratedSessionSecurity } from "./integrated-session-security";

/**
 * Session Security Middleware
 * Integrates all session security features into a single middleware
 */

interface SecurityCheckResult {
  allowed: boolean;
  action: "allow" | "challenge" | "block" | "terminate";
  riskScore: number;
  reason?: string;
  headers?: Record<string, string>;
}

interface MiddlewareConfig {
  enableCSRF: boolean;
  enableSessionHijackingProtection: boolean;
  enableSessionTimeout: boolean;
  enableConcurrentSessionLimit: boolean;
  skipPaths?: string[];
  trustedIPs?: string[];
  maxConcurrentSessions?: number;
}

const DEFAULT_CONFIG: MiddlewareConfig = {
  enableCSRF: true,
  enableSessionHijackingProtection: true,
  enableSessionTimeout: true,
  enableConcurrentSessionLimit: true,
  skipPaths: [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/callback",
    "/api/health",
    "/api/public",
  ],
  maxConcurrentSessions: 3,
};

export class SessionSecurityMiddleware {
  private security: IntegratedSessionSecurity;
  private config: MiddlewareConfig;
  private supabase: any;

  constructor(config: Partial<MiddlewareConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.security = new IntegratedSessionSecurity();

    // Initialize Supabase client
    this.supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  }

  /**
   * Main middleware function
   */
  async middleware(request: NextRequest): Promise<NextResponse> {
    try {
      // Skip security checks for certain paths
      if (this.shouldSkipPath(request.nextUrl.pathname)) {
        return NextResponse.next();
      }

      // Extract session information
      const sessionId = this.extractSessionId(request);
      const userId = await this.extractUserId(request);

      if (!sessionId) {
        return this.createErrorResponse("Missing session ID", 401);
      }

      // Perform comprehensive security check
      const securityResult = await this.performSecurityCheck(request, sessionId, userId);

      // Handle security check result
      return this.handleSecurityResult(request, securityResult);
    } catch (error) {
      console.error("Session security middleware error:", error);

      // Log security event
      await this.logSecurityEvent({
        eventType: "middleware_error",
        riskScore: 5,
        eventDetails: { error: error instanceof Error ? error.message : "Unknown error" },
        request,
      });

      // In case of error, allow request but log the incident
      return NextResponse.next();
    }
  }

  /**
   * Perform comprehensive security check
   */
  private async performSecurityCheck(
    request: NextRequest,
    sessionId: string,
    userId?: string,
  ): Promise<SecurityCheckResult> {
    let totalRiskScore = 0;
    const reasons: string[] = [];
    const headers: Record<string, string> = {};

    // 1. CSRF Protection Check
    if (this.config.enableCSRF && this.requiresCSRFCheck(request)) {
      const csrfResult = await this.checkCSRF(request, sessionId);
      if (!csrfResult.valid) {
        return {
          allowed: false,
          action: "block",
          riskScore: 10,
          reason: "CSRF token validation failed",
        };
      }
    }

    // 2. Session Hijacking Protection
    if (this.config.enableSessionHijackingProtection && userId) {
      const hijackResult = await this.checkSessionHijacking(request, sessionId, userId);
      totalRiskScore += hijackResult.riskScore;

      if (hijackResult.action === "block" || hijackResult.action === "terminate") {
        return {
          allowed: false,
          action: hijackResult.action,
          riskScore: hijackResult.riskScore,
          reason: hijackResult.reason,
        };
      }

      if (hijackResult.reason) {
        reasons.push(hijackResult.reason);
      }
    }

    // 3. Session Timeout Check
    if (this.config.enableSessionTimeout && userId) {
      const timeoutResult = await this.checkSessionTimeout(sessionId, userId);
      if (!timeoutResult.valid) {
        return {
          allowed: false,
          action: "terminate",
          riskScore: 8,
          reason: "Session timeout exceeded",
        };
      }

      if (timeoutResult.warning) {
        headers["X-Session-Warning"] = timeoutResult.warning;
      }
    }

    // 4. Concurrent Session Limit Check
    if (this.config.enableConcurrentSessionLimit && userId) {
      const concurrentResult = await this.checkConcurrentSessions(userId);
      if (!concurrentResult.allowed) {
        totalRiskScore += 3;
        reasons.push("Excessive concurrent sessions detected");
      }
    }

    // 5. Rate Limiting Check
    const rateLimitResult = await this.checkRateLimit(request, userId);
    if (!rateLimitResult.allowed) {
      return {
        allowed: false,
        action: "block",
        riskScore: 6,
        reason: "Rate limit exceeded",
      };
    }

    // Determine final action based on total risk score
    let action: SecurityCheckResult["action"] = "allow";
    if (totalRiskScore >= 8) {
      action = "block";
    } else if (totalRiskScore >= 5) {
      action = "challenge";
    }

    return {
      allowed: action === "allow" || action === "challenge",
      action,
      riskScore: totalRiskScore,
      reason: reasons.length > 0 ? reasons.join("; ") : undefined,
      headers,
    };
  }

  /**
   * Check CSRF token
   */
  private async checkCSRF(
    request: NextRequest,
    sessionId: string,
  ): Promise<{ valid: boolean; reason?: string }> {
    try {
      const token = request.headers.get("X-CSRF-Token") || request.headers.get("x-csrf-token");

      if (!token) {
        return { valid: false, reason: "Missing CSRF token" };
      }

      const isValid = await this.security.csrfProtection.validateToken(token, sessionId);

      return { valid: isValid };
    } catch (error) {
      return { valid: false, reason: "CSRF validation error" };
    }
  }

  /**
   * Check for session hijacking
   */
  private async checkSessionHijacking(
    request: NextRequest,
    sessionId: string,
    userId: string,
  ): Promise<{
    riskScore: number;
    action: "allow" | "challenge" | "block" | "terminate";
    reason?: string;
  }> {
    try {
      const result = await this.security.hijackingProtection.validateSessionFingerprint(
        request,
        sessionId,
        userId,
      );

      return {
        riskScore: result.riskScore,
        action: result.action,
        reason: result.reason,
      };
    } catch (error) {
      return {
        riskScore: 5,
        action: "allow",
        reason: "Hijacking check error",
      };
    }
  }

  /**
   * Check session timeout
   */
  private async checkSessionTimeout(
    sessionId: string,
    userId: string,
  ): Promise<{ valid: boolean; warning?: string }> {
    try {
      const result = await this.security.timeoutManager.checkSessionTimeout(sessionId, userId);

      if (result.shouldTimeout) {
        return { valid: false };
      }

      if (result.requiresReauth) {
        return {
          valid: true,
          warning: "Session requires reauthentication",
        };
      }

      const warning = await this.security.timeoutManager.getTimeoutWarning(sessionId);

      return {
        valid: true,
        warning: warning || undefined,
      };
    } catch (error) {
      return { valid: true }; // Allow on error, but log it
    }
  }

  /**
   * Check concurrent sessions
   */
  private async checkConcurrentSessions(userId: string): Promise<{ allowed: boolean }> {
    try {
      const sessions = await this.security.hijackingProtection.detectConcurrentSessions(
        userId,
        this.config.maxConcurrentSessions || 3,
      );

      return { allowed: sessions.length <= (this.config.maxConcurrentSessions || 3) };
    } catch (error) {
      return { allowed: true }; // Allow on error
    }
  }

  /**
   * Check rate limiting
   */
  private async checkRateLimit(
    request: NextRequest,
    userId?: string,
  ): Promise<{ allowed: boolean }> {
    try {
      // This would integrate with your existing rate limiting logic
      // For now, return true as placeholder
      return { allowed: true };
    } catch (error) {
      return { allowed: true };
    }
  }

  /**
   * Handle security check result
   */
  private handleSecurityResult(request: NextRequest, result: SecurityCheckResult): NextResponse {
    // Add security headers
    const response = result.allowed
      ? NextResponse.next()
      : this.createErrorResponse(result.reason || "Security check failed", 403);

    // Add custom headers
    if (result.headers) {
      Object.entries(result.headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }

    // Add risk score header for monitoring
    response.headers.set("X-Risk-Score", result.riskScore.toString());

    // Log security event if risk score is high
    if (result.riskScore >= 5) {
      this.logSecurityEvent({
        eventType: result.action === "block" ? "access_blocked" : "suspicious_activity",
        riskScore: result.riskScore,
        eventDetails: { reason: result.reason, action: result.action },
        request,
      });
    }

    return response;
  }

  /**
   * Utility methods
   */
  private shouldSkipPath(pathname: string): boolean {
    return this.config.skipPaths?.some((path) => pathname.startsWith(path)) || false;
  }

  private requiresCSRFCheck(request: NextRequest): boolean {
    const method = request.method;
    return ["POST", "PUT", "DELETE", "PATCH"].includes(method);
  }

  private extractSessionId(request: NextRequest): string | null {
    // Try to get session ID from various sources
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      return authHeader.substring(7); // Remove 'Bearer ' prefix
    }

    // Try cookies
    const sessionCookie = request.cookies.get("session-id");
    if (sessionCookie) {
      return sessionCookie.value;
    }

    // Try custom header
    return request.headers.get("x-session-id");
  }

  private async extractUserId(request: NextRequest): Promise<string | undefined> {
    try {
      const authHeader = request.headers.get("authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return undefined;
      }

      // This would integrate with your auth system
      // For now, return undefined as placeholder
      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  private createErrorResponse(message: string, status: number): NextResponse {
    return NextResponse.json({ error: message, timestamp: new Date().toISOString() }, { status });
  }

  private async logSecurityEvent(params: {
    eventType: string;
    riskScore: number;
    eventDetails: any;
    request: NextRequest;
  }): Promise<void> {
    try {
      const { eventType, riskScore, eventDetails, request } = params;

      await this.supabase.from("security_events").insert({
        event_type: eventType,
        risk_score: riskScore,
        event_details: eventDetails,
        ip_address: this.getClientIP(request),
        user_agent: request.headers.get("user-agent"),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to log security event:", error);
    }
  }

  private getClientIP(request: NextRequest): string {
    return (
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      request.headers.get("cf-connecting-ip") ||
      request.ip ||
      "unknown"
    );
  }
}

/**
 * Create session security middleware with default configuration
 */
export function createSessionSecurityMiddleware(config?: Partial<MiddlewareConfig>) {
  const middleware = new SessionSecurityMiddleware(config);
  return (request: NextRequest) => middleware.middleware(request);
}

/**
 * Export types for external use
 */
export type { MiddlewareConfig, SecurityCheckResult };
