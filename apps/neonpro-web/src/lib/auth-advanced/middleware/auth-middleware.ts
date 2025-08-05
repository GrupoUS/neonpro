// Authentication Middleware
// Story 1.4: Session Management & Security Implementation

import type { NextRequest, NextResponse } from "next/server";
import type { SessionManager } from "../session-manager";
import type { SecurityMonitor } from "../security-monitor";
import type { DeviceManager } from "../device-manager";
import type { AuthUtils } from "../utils";
import type { DEFAULT_SESSION_CONFIG, SESSION_POLICIES } from "../config";
import type {
  UserSession,
  SessionSecurityEvent,
  DeviceInfo,
  LocationInfo,
  UserRole,
} from "../types";

// Middleware configuration
interface AuthMiddlewareConfig {
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
  requireMFA?: boolean;
  checkDeviceTrust?: boolean;
  logSecurityEvents?: boolean;
  rateLimitRequests?: boolean;
  blockSuspiciousActivity?: boolean;
}

// Default middleware configuration
const DEFAULT_CONFIG: AuthMiddlewareConfig = {
  requireAuth: true,
  allowedRoles: ["owner", "manager", "staff", "patient"],
  requireMFA: false,
  checkDeviceTrust: true,
  logSecurityEvents: true,
  rateLimitRequests: true,
  blockSuspiciousActivity: true,
};

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Suspicious activity tracking
const suspiciousActivityStore = new Map<
  string,
  {
    attempts: number;
    lastAttempt: number;
    blocked: boolean;
  }
>();

/**
 * Authentication Middleware Factory
 */
export function createAuthMiddleware(config: Partial<AuthMiddlewareConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return async function authMiddleware(
    request: NextRequest,
    sessionManager: SessionManager,
    securityMonitor: SecurityMonitor,
    deviceManager: DeviceManager,
  ): Promise<NextResponse | null> {
    try {
      const startTime = Date.now();
      const clientIP = getClientIP(request);
      const userAgent = request.headers.get("user-agent") || "";
      const deviceInfo = extractDeviceInfo(request);
      const locationInfo = await extractLocationInfo(request);

      // Rate limiting check
      if (finalConfig.rateLimitRequests) {
        const rateLimitResult = checkRateLimit(clientIP);
        if (!rateLimitResult.allowed) {
          await logSecurityEvent(
            {
              type: "rate_limit_exceeded",
              severity: "medium",
              clientIP,
              userAgent,
              details: {
                requestCount: rateLimitResult.count,
                timeWindow: "1m",
              },
            },
            securityMonitor,
          );

          return new NextResponse("Rate limit exceeded", { status: 429 });
        }
      }

      // Suspicious activity check
      if (finalConfig.blockSuspiciousActivity) {
        const suspiciousCheck = checkSuspiciousActivity(clientIP);
        if (suspiciousCheck.blocked) {
          await logSecurityEvent(
            {
              type: "suspicious_activity_blocked",
              severity: "high",
              clientIP,
              userAgent,
              details: {
                attempts: suspiciousCheck.attempts,
                reason: "Multiple failed authentication attempts",
              },
            },
            securityMonitor,
          );

          return new NextResponse("Access blocked due to suspicious activity", {
            status: 403,
          });
        }
      }

      // Extract session token
      const sessionToken = extractSessionToken(request);

      if (!sessionToken && finalConfig.requireAuth) {
        return new NextResponse("Authentication required", { status: 401 });
      }

      if (sessionToken) {
        // Validate session
        const session = await sessionManager.getSession(sessionToken);

        if (!session) {
          await logSecurityEvent(
            {
              type: "invalid_session_token",
              severity: "medium",
              clientIP,
              userAgent,
              sessionToken,
            },
            securityMonitor,
          );

          return new NextResponse("Invalid session", { status: 401 });
        }

        // Check session expiry
        if (session.expires_at < new Date()) {
          await sessionManager.terminateSession(sessionToken, "expired");

          await logSecurityEvent(
            {
              type: "session_expired",
              severity: "low",
              userId: session.user_id,
              sessionId: session.id,
              clientIP,
              userAgent,
            },
            securityMonitor,
          );

          return new NextResponse("Session expired", { status: 401 });
        }

        // Role-based access control
        if (finalConfig.allowedRoles && !finalConfig.allowedRoles.includes(session.user_role)) {
          await logSecurityEvent(
            {
              type: "unauthorized_access_attempt",
              severity: "high",
              userId: session.user_id,
              sessionId: session.id,
              clientIP,
              userAgent,
              details: {
                userRole: session.user_role,
                requiredRoles: finalConfig.allowedRoles,
                path: request.nextUrl.pathname,
              },
            },
            securityMonitor,
          );

          return new NextResponse("Insufficient permissions", { status: 403 });
        }

        // MFA requirement check
        if (finalConfig.requireMFA && !session.mfa_verified) {
          return new NextResponse("MFA verification required", { status: 403 });
        }

        // Device trust check
        if (finalConfig.checkDeviceTrust) {
          const deviceCheck = await checkDeviceTrust(session, deviceInfo, deviceManager);

          if (!deviceCheck.trusted) {
            await logSecurityEvent(
              {
                type: "untrusted_device_access",
                severity: "medium",
                userId: session.user_id,
                sessionId: session.id,
                clientIP,
                userAgent,
                details: {
                  deviceFingerprint: deviceCheck.fingerprint,
                  trustScore: deviceCheck.trustScore,
                  reason: deviceCheck.reason,
                },
              },
              securityMonitor,
            );

            // Allow access but require additional verification
            // In production, you might redirect to device verification page
          }
        }

        // Location anomaly detection
        const locationCheck = await checkLocationAnomaly(session, locationInfo, securityMonitor);

        if (locationCheck.suspicious) {
          await logSecurityEvent(
            {
              type: "unusual_location",
              severity: "medium",
              userId: session.user_id,
              sessionId: session.id,
              clientIP,
              userAgent,
              location: locationInfo,
              details: {
                distance: locationCheck.distance,
                previousLocation: locationCheck.previousLocation,
                timeElapsed: locationCheck.timeElapsed,
              },
            },
            securityMonitor,
          );
        }

        // Update session activity
        await sessionManager.updateSessionActivity(sessionToken, {
          ip_address: clientIP,
          user_agent: userAgent,
          location: locationInfo,
        });

        // Add session info to request headers for downstream use
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("x-session-id", session.id);
        requestHeaders.set("x-user-id", session.user_id);
        requestHeaders.set("x-user-role", session.user_role);
        requestHeaders.set("x-session-verified", session.mfa_verified.toString());

        // Log successful authentication
        if (finalConfig.logSecurityEvents) {
          await logSecurityEvent(
            {
              type: "successful_authentication",
              severity: "low",
              userId: session.user_id,
              sessionId: session.id,
              clientIP,
              userAgent,
              location: locationInfo,
              details: {
                path: request.nextUrl.pathname,
                method: request.method,
                processingTime: Date.now() - startTime,
              },
            },
            securityMonitor,
          );
        }

        // Continue with modified request
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      }

      // No authentication required, continue
      return null;
    } catch (error) {
      console.error("Auth middleware error:", error);

      // Log security event for middleware errors
      await logSecurityEvent(
        {
          type: "middleware_error",
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

      return new NextResponse("Internal server error", { status: 500 });
    }
  };
}

/**
 * Extract client IP address
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const remoteAddr = request.headers.get("x-remote-addr");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return realIP || remoteAddr || "unknown";
}

/**
 * Extract session token from request
 */
function extractSessionToken(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Try cookies
  const sessionCookie = request.cookies.get("session_token");
  if (sessionCookie) {
    return sessionCookie.value;
  }

  return null;
}

/**
 * Extract device information from request
 */
function extractDeviceInfo(request: NextRequest): DeviceInfo {
  const userAgent = request.headers.get("user-agent") || "";
  const acceptLanguage = request.headers.get("accept-language") || "";

  return {
    userAgent,
    platform: AuthUtils.Device.detectPlatform(userAgent),
    screenWidth: 0, // Would be sent by client
    screenHeight: 0, // Would be sent by client
    timezone: "", // Would be sent by client
    language: acceptLanguage.split(",")[0] || "en",
  };
}

/**
 * Extract location information from request
 */
async function extractLocationInfo(request: NextRequest): Promise<LocationInfo | null> {
  const clientIP = getClientIP(request);

  if (clientIP === "unknown" || clientIP.startsWith("192.168.") || clientIP.startsWith("10.")) {
    return null;
  }

  try {
    // In production, use a proper IP geolocation service
    // This is a mock implementation
    return {
      ip_address: clientIP,
      country: "Brazil",
      city: "São Paulo",
      latitude: -23.5505,
      longitude: -46.6333,
      isVPN: false,
      isTor: false,
    };
  } catch (error) {
    console.error("Failed to get location info:", error);
    return null;
  }
}

/**
 * Check rate limiting
 */
function checkRateLimit(clientIP: string): { allowed: boolean; count: number } {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100;

  const key = `rate_limit:${clientIP}`;
  const current = rateLimitStore.get(key);

  if (!current || current.resetTime < now) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, count: 1 };
  }

  current.count++;
  rateLimitStore.set(key, current);

  return {
    allowed: current.count <= maxRequests,
    count: current.count,
  };
}

/**
 * Check for suspicious activity
 */
function checkSuspiciousActivity(clientIP: string): {
  blocked: boolean;
  attempts: number;
} {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 10;

  const key = `suspicious:${clientIP}`;
  const current = suspiciousActivityStore.get(key);

  if (!current) {
    return { blocked: false, attempts: 0 };
  }

  // Reset if window expired
  if (current.lastAttempt + windowMs < now) {
    suspiciousActivityStore.delete(key);
    return { blocked: false, attempts: 0 };
  }

  return {
    blocked: current.blocked || current.attempts >= maxAttempts,
    attempts: current.attempts,
  };
}

/**
 * Check device trust
 */
async function checkDeviceTrust(
  session: UserSession,
  deviceInfo: DeviceInfo,
  deviceManager: DeviceManager,
): Promise<{
  trusted: boolean;
  fingerprint: string;
  trustScore: number;
  reason?: string;
}> {
  const fingerprint = AuthUtils.Device.generateFingerprint(deviceInfo);

  try {
    const device = await deviceManager.getDeviceByFingerprint(session.user_id, fingerprint);

    if (!device) {
      return {
        trusted: false,
        fingerprint,
        trustScore: 0,
        reason: "Unknown device",
      };
    }

    const trustScore = await deviceManager.calculateTrustScore(device.id);

    return {
      trusted: device.is_trusted && !device.is_blocked,
      fingerprint,
      trustScore,
      reason: device.is_blocked ? "Device blocked" : undefined,
    };
  } catch (error) {
    console.error("Device trust check failed:", error);
    return {
      trusted: false,
      fingerprint,
      trustScore: 0,
      reason: "Trust check failed",
    };
  }
}

/**
 * Check for location anomalies
 */
async function checkLocationAnomaly(
  session: UserSession,
  currentLocation: LocationInfo | null,
  securityMonitor: SecurityMonitor,
): Promise<{
  suspicious: boolean;
  distance?: number;
  previousLocation?: LocationInfo;
  timeElapsed?: number;
}> {
  if (!currentLocation || !session.last_location) {
    return { suspicious: false };
  }

  try {
    const distance = AuthUtils.Location.calculateDistance(
      session.last_location.latitude,
      session.last_location.longitude,
      currentLocation.latitude,
      currentLocation.longitude,
    );

    const timeElapsed = Date.now() - new Date(session.last_activity).getTime();
    const maxSpeed = 1000; // km/h (commercial aircraft speed)
    const possibleDistance = (timeElapsed / (1000 * 60 * 60)) * maxSpeed;

    return {
      suspicious: distance > possibleDistance,
      distance,
      previousLocation: session.last_location,
      timeElapsed,
    };
  } catch (error) {
    console.error("Location anomaly check failed:", error);
    return { suspicious: false };
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
 * Record suspicious activity
 */
export function recordSuspiciousActivity(clientIP: string): void {
  const now = Date.now();
  const key = `suspicious:${clientIP}`;
  const current = suspiciousActivityStore.get(key);

  if (!current) {
    suspiciousActivityStore.set(key, {
      attempts: 1,
      lastAttempt: now,
      blocked: false,
    });
  } else {
    current.attempts++;
    current.lastAttempt = now;
    current.blocked = current.attempts >= 10;
    suspiciousActivityStore.set(key, current);
  }
}

/**
 * Clear suspicious activity record
 */
export function clearSuspiciousActivity(clientIP: string): void {
  const key = `suspicious:${clientIP}`;
  suspiciousActivityStore.delete(key);
}

// Export middleware types
export type { AuthMiddlewareConfig };
