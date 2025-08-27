/**
 * Security Middleware for NeonPro
 * Provides comprehensive security middleware for API protection
 * Story 3.3: Security Hardening & Audit
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { securityAPI } from "./index";

// Types
interface SecurityContext {
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
}

interface SecurityConfig {
  enableRateLimit: boolean;
  rateLimitRequests: number;
  rateLimitWindow: number;
  enableAuditLog: boolean;
  enableThreatDetection: boolean;
  blockedIPs: string[];
  allowedOrigins: string[];
}

// Default security configuration
const defaultSecurityConfig: SecurityConfig = {
  enableRateLimit: true,
  rateLimitRequests: 100,
  rateLimitWindow: 60_000, // 1 minute
  enableAuditLog: true,
  enableThreatDetection: true,
  blockedIPs: [],
  allowedOrigins: ["http://localhost:3000", "https://*.neonpro.com"],
};

// Security middleware class
export class SecurityMiddleware {
  private config: SecurityConfig;
  private readonly rateLimitStore: Map<
    string,
    { count: number; resetTime: number; }
  > = new Map();

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = { ...defaultSecurityConfig, ...config };
  }

  // Main middleware function
  async middleware(request: NextRequest): Promise<NextResponse | null> {
    const context = this.extractSecurityContext(request);

    try {
      // 1. IP blocking check
      if (this.isBlockedIP(context.ipAddress)) {
        await this.logSecurityEvent("blocked_ip_access", context, "warning");
        return new NextResponse("Access Denied", { status: 403 });
      }

      // 2. Rate limiting
      if (this.config.enableRateLimit && this.isRateLimited(context)) {
        await this.logSecurityEvent("rate_limit_exceeded", context, "warning");
        return new NextResponse("Rate Limit Exceeded", { status: 429 });
      }

      // 3. CORS validation
      if (!this.isValidOrigin(request)) {
        await this.logSecurityEvent("invalid_origin", context, "warning");
        return new NextResponse("Invalid Origin", { status: 403 });
      }

      // 4. Threat detection
      if (
        this.config.enableThreatDetection
        && this.detectThreat(request, context)
      ) {
        await this.logSecurityEvent("threat_detected", context, "critical");
        return new NextResponse("Threat Detected", { status: 403 });
      }

      // 5. Audit logging
      if (this.config.enableAuditLog) {
        await this.logSecurityEvent("api_access", context, "info");
      }

      return null; // Continue to next middleware/handler
    } catch {
      await this.logSecurityEvent("middleware_error", context, "error");
      return new NextResponse("Internal Security Error", { status: 500 });
    }
  }

  // Extract security context from request
  private extractSecurityContext(request: NextRequest): SecurityContext {
    const url = new URL(request.url);
    return {
      ipAddress: request.headers.get("x-forwarded-for")
        || request.headers.get("x-real-ip")
        || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
      endpoint: url.pathname,
      method: request.method,
    };
  }

  // Check if IP is blocked
  private isBlockedIP(ipAddress?: string): boolean {
    if (!ipAddress) {
      return false;
    }
    return this.config.blockedIPs.includes(ipAddress);
  }

  // Rate limiting check
  private isRateLimited(context: SecurityContext): boolean {
    if (!context.ipAddress) {
      return false;
    }

    const { ipAddress: key } = context;
    const now = Date.now();
    const entry = this.rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + this.config.rateLimitWindow,
      });
      return false;
    }

    if (entry.count >= this.config.rateLimitRequests) {
      return true;
    }

    entry.count++;
    return false;
  }

  // CORS origin validation
  private isValidOrigin(request: NextRequest): boolean {
    const origin = request.headers.get("origin");
    if (!origin) {
      return true; // Allow requests without origin (like server-to-server)
    }

    return this.config.allowedOrigins.some((allowed) => {
      if (allowed.includes("*")) {
        const pattern = allowed.replaceAll(String.raw`\*`, ".*");
        return new RegExp(pattern).test(origin);
      }
      return allowed === origin;
    });
  }

  // Simple threat detection
  private detectThreat(
    request: NextRequest,
    context: SecurityContext,
  ): boolean {
    // Check for common attack patterns
    const suspiciousPatterns = [
      /\.\.\//, // Directory traversal
      /<script/i, // XSS attempts
      /union.*select/i, // SQL injection
      /\beval\(/i, // Code injection
    ];

    const { url } = request;
    const userAgent = context.userAgent || "";

    return suspiciousPatterns.some(
      (pattern) => pattern.test(url) || pattern.test(userAgent),
    );
  }

  // Log security events
  private async logSecurityEvent(
    eventType: string,
    context: SecurityContext,
    severity: "info" | "warning" | "error" | "critical",
  ): Promise<void> {
    try {
      await securityAPI.createSecurityEvent({
        event_type: eventType,
        severity,
        title: `Security Event: ${eventType}`,
        description: `${eventType} detected from ${context.ipAddress}`,
        user_id: context.userId,
        session_id: context.sessionId,
        ip_address: context.ipAddress,
        user_agent: context.userAgent,
        event_data: {
          endpoint: context.endpoint,
          method: context.method,
        },
      });
    } catch {}
  }

  // Utility methods for configuration
  addBlockedIP(ip: string): void {
    if (!this.config.blockedIPs.includes(ip)) {
      this.config.blockedIPs.push(ip);
    }
  }

  removeBlockedIP(ip: string): void {
    const index = this.config.blockedIPs.indexOf(ip);
    if (index !== -1) {
      this.config.blockedIPs.splice(index, 1);
    }
  }

  updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export default instance
export const securityMiddleware = new SecurityMiddleware();
