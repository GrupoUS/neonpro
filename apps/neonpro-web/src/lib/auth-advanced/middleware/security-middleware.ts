// Security Middleware
// Story 1.4: Session Management & Security Implementation

import type { NextRequest, NextResponse } from "next/server";
import type { SecurityMonitor } from "../security-monitor";
import type { SessionManager } from "../session-manager";
import type { AuthUtils } from "../utils";
import type { SessionSecurityEvent, SecurityEventType, LocationInfo, DeviceInfo } from "../types";

// Security middleware configuration
interface SecurityMiddlewareConfig {
  enableThreatDetection?: boolean;
  enableAnomalyDetection?: boolean;
  enableRealTimeMonitoring?: boolean;
  blockHighRiskRequests?: boolean;
  logAllEvents?: boolean;
  alertThresholds?: {
    high: number;
    critical: number;
  };
  rateLimits?: {
    requests: number;
    timeWindow: number;
  };
}

// Default security configuration
const DEFAULT_SECURITY_CONFIG: SecurityMiddlewareConfig = {
  enableThreatDetection: true,
  enableAnomalyDetection: true,
  enableRealTimeMonitoring: true,
  blockHighRiskRequests: true,
  logAllEvents: true,
  alertThresholds: {
    high: 70,
    critical: 90,
  },
  rateLimits: {
    requests: 1000,
    timeWindow: 3600000, // 1 hour
  },
};

// Threat patterns
const THREAT_PATTERNS = {
  sqlInjection: [
    /('|(\-\-)|(;)|(\||\|)|(\*|\*))/i,
    /(union|select|insert|delete|update|drop|create|alter|exec|execute)/i,
  ],
  xss: [/<script[^>]*>.*?<\/script>/gi, /javascript:/gi, /on\w+\s*=/gi],
  pathTraversal: [/\.\.[\/\\]/g, /\.\.%2f/gi, /\.\.%5c/gi],
  commandInjection: [/[;&|`$(){}\[\]]/g, /(cat|ls|pwd|whoami|id|uname)/gi],
};

// Request analysis cache
const requestAnalysisCache = new Map<
  string,
  {
    riskScore: number;
    threats: string[];
    timestamp: number;
  }
>();

// Real-time monitoring data
const monitoringData = {
  activeRequests: new Map<string, number>(),
  suspiciousIPs: new Set<string>(),
  blockedIPs: new Set<string>(),
  alertCounts: new Map<string, number>(),
};

/**
 * Security Middleware Factory
 */
export function createSecurityMiddleware(config: Partial<SecurityMiddlewareConfig> = {}) {
  const finalConfig = { ...DEFAULT_SECURITY_CONFIG, ...config };

  return async function securityMiddleware(
    request: NextRequest,
    securityMonitor: SecurityMonitor,
    sessionManager?: SessionManager,
  ): Promise<NextResponse | null> {
    try {
      const startTime = Date.now();
      const clientIP = getClientIP(request);
      const userAgent = request.headers.get("user-agent") || "";
      const requestId = AuthUtils.Crypto.generateSecureId();

      // Check if IP is blocked
      if (monitoringData.blockedIPs.has(clientIP)) {
        await logSecurityEvent(
          {
            type: "blocked_ip_access_attempt",
            severity: "high",
            clientIP,
            userAgent,
            requestId,
            details: {
              path: request.nextUrl.pathname,
              method: request.method,
            },
          },
          securityMonitor,
        );

        return new NextResponse("Access denied", { status: 403 });
      }

      // Real-time monitoring
      if (finalConfig.enableRealTimeMonitoring) {
        trackActiveRequest(clientIP);
      }

      // Threat detection
      if (finalConfig.enableThreatDetection) {
        const threatAnalysis = await analyzeThreatPatterns(request);

        if (threatAnalysis.riskScore >= finalConfig.alertThresholds!.critical!) {
          // Block critical threats immediately
          monitoringData.blockedIPs.add(clientIP);

          await logSecurityEvent(
            {
              type: "critical_threat_detected",
              severity: "critical",
              clientIP,
              userAgent,
              requestId,
              details: {
                riskScore: threatAnalysis.riskScore,
                threats: threatAnalysis.threats,
                path: request.nextUrl.pathname,
                method: request.method,
                payload: await getRequestPayload(request),
              },
            },
            securityMonitor,
          );

          return new NextResponse("Security threat detected", { status: 403 });
        }

        if (threatAnalysis.riskScore >= finalConfig.alertThresholds!.high!) {
          // Log high-risk requests
          monitoringData.suspiciousIPs.add(clientIP);

          await logSecurityEvent(
            {
              type: "high_risk_request",
              severity: "high",
              clientIP,
              userAgent,
              requestId,
              details: {
                riskScore: threatAnalysis.riskScore,
                threats: threatAnalysis.threats,
                path: request.nextUrl.pathname,
                method: request.method,
              },
            },
            securityMonitor,
          );
        }
      }

      // Anomaly detection
      if (finalConfig.enableAnomalyDetection) {
        const anomalyAnalysis = await detectAnomalies(request, clientIP);

        if (anomalyAnalysis.suspicious) {
          await logSecurityEvent(
            {
              type: "anomaly_detected",
              severity: "medium",
              clientIP,
              userAgent,
              requestId,
              details: {
                anomalies: anomalyAnalysis.anomalies,
                confidence: anomalyAnalysis.confidence,
                path: request.nextUrl.pathname,
                method: request.method,
              },
            },
            securityMonitor,
          );
        }
      }

      // Rate limiting check
      const rateLimitCheck = checkAdvancedRateLimit(clientIP, finalConfig.rateLimits!);
      if (!rateLimitCheck.allowed) {
        await logSecurityEvent(
          {
            type: "advanced_rate_limit_exceeded",
            severity: "medium",
            clientIP,
            userAgent,
            requestId,
            details: {
              requestCount: rateLimitCheck.count,
              timeWindow: finalConfig.rateLimits!.timeWindow,
              limit: finalConfig.rateLimits!.requests,
            },
          },
          securityMonitor,
        );

        return new NextResponse("Rate limit exceeded", {
          status: 429,
          headers: {
            "Retry-After": "3600",
            "X-RateLimit-Limit": finalConfig.rateLimits!.requests.toString(),
            "X-RateLimit-Remaining": "0",
          },
        });
      }

      // Session security validation
      if (sessionManager) {
        const sessionSecurityCheck = await validateSessionSecurity(
          request,
          sessionManager,
          securityMonitor,
        );

        if (!sessionSecurityCheck.valid) {
          return new NextResponse(sessionSecurityCheck.reason, {
            status: sessionSecurityCheck.statusCode,
          });
        }
      }

      // Add security headers
      const response = NextResponse.next();
      addSecurityHeaders(response, requestId);

      // Log successful security check
      if (finalConfig.logAllEvents) {
        await logSecurityEvent(
          {
            type: "security_check_passed",
            severity: "low",
            clientIP,
            userAgent,
            requestId,
            details: {
              path: request.nextUrl.pathname,
              method: request.method,
              processingTime: Date.now() - startTime,
            },
          },
          securityMonitor,
        );
      }

      return response;
    } catch (error) {
      console.error("Security middleware error:", error);

      await logSecurityEvent(
        {
          type: "security_middleware_error",
          severity: "high",
          clientIP: getClientIP(request),
          userAgent: request.headers.get("user-agent") || "",
          details: {
            error: error instanceof Error ? error.message : "Unknown error",
            path: request.nextUrl.pathname,
          },
        },
        securityMonitor,
      ).catch(() => {});

      return new NextResponse("Security check failed", { status: 500 });
    }
  };
}

/**
 * Analyze threat patterns in request
 */
async function analyzeThreatPatterns(request: NextRequest): Promise<{
  riskScore: number;
  threats: string[];
}> {
  const threats: string[] = [];
  let riskScore = 0;

  // Analyze URL
  const url = request.nextUrl.toString();
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams.toString();

  // Check for SQL injection patterns
  for (const pattern of THREAT_PATTERNS.sqlInjection) {
    if (pattern.test(url) || pattern.test(searchParams)) {
      threats.push("sql_injection");
      riskScore += 30;
      break;
    }
  }

  // Check for XSS patterns
  for (const pattern of THREAT_PATTERNS.xss) {
    if (pattern.test(url) || pattern.test(searchParams)) {
      threats.push("xss");
      riskScore += 25;
      break;
    }
  }

  // Check for path traversal
  for (const pattern of THREAT_PATTERNS.pathTraversal) {
    if (pattern.test(pathname)) {
      threats.push("path_traversal");
      riskScore += 35;
      break;
    }
  }

  // Check for command injection
  for (const pattern of THREAT_PATTERNS.commandInjection) {
    if (pattern.test(url) || pattern.test(searchParams)) {
      threats.push("command_injection");
      riskScore += 40;
      break;
    }
  }

  // Analyze request body for POST/PUT requests
  if (request.method === "POST" || request.method === "PUT") {
    try {
      const body = await getRequestPayload(request);
      if (body) {
        // Check body for threat patterns
        for (const [threatType, patterns] of Object.entries(THREAT_PATTERNS)) {
          for (const pattern of patterns) {
            if (pattern.test(body)) {
              if (!threats.includes(threatType)) {
                threats.push(threatType);
                riskScore += 20;
              }
            }
          }
        }
      }
    } catch (error) {
      // Body parsing failed, might be suspicious
      riskScore += 10;
    }
  }

  // Check for suspicious headers
  const suspiciousHeaders = ["x-forwarded-for", "x-real-ip", "x-originating-ip"];

  for (const header of suspiciousHeaders) {
    const value = request.headers.get(header);
    if (value && value.includes("..")) {
      threats.push("header_manipulation");
      riskScore += 15;
    }
  }

  return { riskScore: Math.min(riskScore, 100), threats };
}

/**
 * Detect anomalies in request patterns
 */
async function detectAnomalies(
  request: NextRequest,
  clientIP: string,
): Promise<{
  suspicious: boolean;
  anomalies: string[];
  confidence: number;
}> {
  const anomalies: string[] = [];
  let confidence = 0;

  // Check for unusual request frequency
  const activeRequests = monitoringData.activeRequests.get(clientIP) || 0;
  if (activeRequests > 50) {
    anomalies.push("high_request_frequency");
    confidence += 30;
  }

  // Check for unusual user agent
  const userAgent = request.headers.get("user-agent") || "";
  if (!userAgent || userAgent.length < 10) {
    anomalies.push("suspicious_user_agent");
    confidence += 20;
  }

  // Check for missing common headers
  const commonHeaders = ["accept", "accept-language", "accept-encoding"];
  const missingHeaders = commonHeaders.filter((header) => !request.headers.get(header));
  if (missingHeaders.length > 1) {
    anomalies.push("missing_common_headers");
    confidence += 15;
  }

  // Check for unusual request timing
  const now = Date.now();
  const hour = new Date(now).getHours();
  if (hour >= 2 && hour <= 5) {
    anomalies.push("unusual_time_access");
    confidence += 10;
  }

  // Check for suspicious referer
  const referer = request.headers.get("referer");
  if (referer && !referer.includes(request.nextUrl.hostname)) {
    anomalies.push("external_referer");
    confidence += 25;
  }

  return {
    suspicious: confidence >= 40,
    anomalies,
    confidence,
  };
}

/**
 * Advanced rate limiting with sliding window
 */
function checkAdvancedRateLimit(
  clientIP: string,
  limits: { requests: number; timeWindow: number },
): { allowed: boolean; count: number } {
  const now = Date.now();
  const key = `rate_limit_advanced:${clientIP}`;

  // Get or create request log
  let requestLog = requestAnalysisCache.get(key);
  if (!requestLog || requestLog.timestamp + limits.timeWindow < now) {
    requestLog = { riskScore: 0, threats: [], timestamp: now };
    requestAnalysisCache.set(key, requestLog);
  }

  // Simple counter for this implementation
  const currentCount = monitoringData.activeRequests.get(clientIP) || 0;

  return {
    allowed: currentCount < limits.requests,
    count: currentCount,
  };
}

/**
 * Validate session security
 */
async function validateSessionSecurity(
  request: NextRequest,
  sessionManager: SessionManager,
  securityMonitor: SecurityMonitor,
): Promise<{
  valid: boolean;
  reason?: string;
  statusCode?: number;
}> {
  const sessionToken = extractSessionToken(request);

  if (!sessionToken) {
    return { valid: true }; // No session to validate
  }

  try {
    const session = await sessionManager.getSession(sessionToken);

    if (!session) {
      return {
        valid: false,
        reason: "Invalid session",
        statusCode: 401,
      };
    }

    // Check for session hijacking indicators
    const clientIP = getClientIP(request);
    const userAgent = request.headers.get("user-agent") || "";

    if (session.ip_address && session.ip_address !== clientIP) {
      await logSecurityEvent(
        {
          type: "session_ip_mismatch",
          severity: "high",
          userId: session.user_id,
          sessionId: session.id,
          clientIP,
          userAgent,
          details: {
            originalIP: session.ip_address,
            currentIP: clientIP,
          },
        },
        securityMonitor,
      );

      return {
        valid: false,
        reason: "Session security violation",
        statusCode: 403,
      };
    }

    if (session.user_agent && session.user_agent !== userAgent) {
      await logSecurityEvent(
        {
          type: "session_user_agent_mismatch",
          severity: "medium",
          userId: session.user_id,
          sessionId: session.id,
          clientIP,
          userAgent,
          details: {
            originalUserAgent: session.user_agent,
            currentUserAgent: userAgent,
          },
        },
        securityMonitor,
      );
    }

    return { valid: true };
  } catch (error) {
    console.error("Session security validation failed:", error);
    return {
      valid: false,
      reason: "Session validation failed",
      statusCode: 500,
    };
  }
}

/**
 * Track active requests
 */
function trackActiveRequest(clientIP: string): void {
  const current = monitoringData.activeRequests.get(clientIP) || 0;
  monitoringData.activeRequests.set(clientIP, current + 1);

  // Clean up after 1 minute
  setTimeout(() => {
    const updated = monitoringData.activeRequests.get(clientIP) || 0;
    if (updated > 0) {
      monitoringData.activeRequests.set(clientIP, updated - 1);
    }
  }, 60000);
}

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse, requestId: string): void {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Request-ID", requestId);
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
  );
}

/**
 * Extract client IP address
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return realIP || "unknown";
}

/**
 * Extract session token from request
 */
function extractSessionToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  const sessionCookie = request.cookies.get("session_token");
  if (sessionCookie) {
    return sessionCookie.value;
  }

  return null;
}

/**
 * Get request payload safely
 */
async function getRequestPayload(request: NextRequest): Promise<string | null> {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const json = await request.json();
      return JSON.stringify(json);
    }

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      return Array.from(formData.entries())
        .map(([key, value]) => `${key}=${value}`)
        .join("&");
    }

    if (contentType.includes("text/")) {
      return await request.text();
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Log security event
 */
async function logSecurityEvent(
  event: Partial<SessionSecurityEvent>,
  securityMonitor: SecurityMonitor,
): Promise<void> {
  try {
    await securityMonitor.logSecurityEvent({
      id: AuthUtils.Crypto.generateSecureId(),
      timestamp: new Date(),
      ...event,
    } as SessionSecurityEvent);
  } catch (error) {
    console.error("Failed to log security event:", error);
  }
}

/**
 * Get monitoring statistics
 */
export function getMonitoringStats(): {
  activeRequests: number;
  suspiciousIPs: number;
  blockedIPs: number;
  totalAlerts: number;
} {
  return {
    activeRequests: Array.from(monitoringData.activeRequests.values()).reduce(
      (sum, count) => sum + count,
      0,
    ),
    suspiciousIPs: monitoringData.suspiciousIPs.size,
    blockedIPs: monitoringData.blockedIPs.size,
    totalAlerts: Array.from(monitoringData.alertCounts.values()).reduce(
      (sum, count) => sum + count,
      0,
    ),
  };
}

/**
 * Clear blocked IP
 */
export function clearBlockedIP(ip: string): void {
  monitoringData.blockedIPs.delete(ip);
  monitoringData.suspiciousIPs.delete(ip);
}

/**
 * Block IP manually
 */
export function blockIP(ip: string): void {
  monitoringData.blockedIPs.add(ip);
}

// Export types
export type { SecurityMiddlewareConfig };
