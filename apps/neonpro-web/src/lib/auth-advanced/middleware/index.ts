// Auth Middleware Export
// Story 1.4: Session Management & Security Implementation

export type { AuthMiddlewareConfig } from "./auth-middleware";
// Authentication Middleware
export {
  clearSuspiciousActivity,
  createAuthMiddleware,
  recordSuspiciousActivity,
} from "./auth-middleware";
export type { SecurityMiddlewareConfig } from "./security-middleware";
// Security Middleware
export {
  blockIP,
  clearBlockedIP,
  createSecurityMiddleware,
  getMonitoringStats,
} from "./security-middleware";

// Combined Middleware Factory
import type { NextRequest, NextResponse } from "next/server";
import type { DeviceManager } from "../device-manager";
import type { SecurityMonitor } from "../security-monitor";
import type { SessionManager } from "../session-manager";
import type { AuthMiddlewareConfig, createAuthMiddleware } from "./auth-middleware";
import type { createSecurityMiddleware, SecurityMiddlewareConfig } from "./security-middleware";

/**
 * Combined middleware configuration
 */
export interface CombinedMiddlewareConfig {
  auth?: Partial<AuthMiddlewareConfig>;
  security?: Partial<SecurityMiddlewareConfig>;
  enableAuth?: boolean;
  enableSecurity?: boolean;
}

/**
 * Create combined authentication and security middleware
 */
export function createCombinedMiddleware(
  sessionManager: SessionManager,
  securityMonitor: SecurityMonitor,
  deviceManager: DeviceManager,
  config: CombinedMiddlewareConfig = {},
) {
  const {
    auth: authConfig = {},
    security: securityConfig = {},
    enableAuth = true,
    enableSecurity = true,
  } = config;

  const authMiddleware = enableAuth ? createAuthMiddleware(authConfig) : null;

  const securityMiddleware = enableSecurity ? createSecurityMiddleware(securityConfig) : null;

  return async function combinedMiddleware(request: NextRequest): Promise<NextResponse> {
    try {
      // Run security middleware first
      if (securityMiddleware) {
        const securityResult = await securityMiddleware(request, securityMonitor, sessionManager);

        if (securityResult && securityResult.status !== 200) {
          return securityResult;
        }
      }

      // Run authentication middleware
      if (authMiddleware) {
        const authResult = await authMiddleware(
          request,
          sessionManager,
          securityMonitor,
          deviceManager,
        );

        if (authResult && authResult.status !== 200) {
          return authResult;
        }
      }

      // Continue to the next middleware or route handler
      return NextResponse.next();
    } catch (error) {
      console.error("Combined middleware error:", error);
      return new NextResponse("Middleware error", { status: 500 });
    }
  };
}

/**
 * Middleware utilities
 */
export const MiddlewareUtils = {
  /**
   * Extract client IP from request
   */
  getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-for");
    const realIP = request.headers.get("x-real-ip");
    const remoteAddr = request.headers.get("x-remote-addr");

    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }

    return realIP || remoteAddr || "unknown";
  },

  /**
   * Extract session token from request
   */
  getSessionToken(request: NextRequest): string | null {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }

    const sessionCookie = request.cookies.get("session_token");
    if (sessionCookie) {
      return sessionCookie.value;
    }

    return null;
  },

  /**
   * Check if request is from API route
   */
  isAPIRoute(request: NextRequest): boolean {
    return request.nextUrl.pathname.startsWith("/api/");
  },

  /**
   * Check if request is for static assets
   */
  isStaticAsset(request: NextRequest): boolean {
    const pathname = request.nextUrl.pathname;
    return (
      pathname.startsWith("/_next/") || pathname.startsWith("/static/") || pathname.includes(".") // Files with extensions
    );
  },

  /**
   * Check if request is for public routes
   */
  isPublicRoute(request: NextRequest, publicRoutes: string[] = []): boolean {
    const pathname = request.nextUrl.pathname;
    const defaultPublicRoutes = [
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
      "/verify-email",
      "/",
    ];

    const allPublicRoutes = [...defaultPublicRoutes, ...publicRoutes];
    return allPublicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"));
  },
};

/**
 * Middleware configuration presets
 */
export const MiddlewarePresets = {
  /**
   * High security configuration
   */
  highSecurity: {
    auth: {
      requireAuth: true,
      requireMFA: true,
      checkDeviceTrust: true,
      logSecurityEvents: true,
      rateLimitRequests: true,
      blockSuspiciousActivity: true,
    },
    security: {
      enableThreatDetection: true,
      enableAnomalyDetection: true,
      enableRealTimeMonitoring: true,
      blockHighRiskRequests: true,
      logAllEvents: true,
      alertThresholds: {
        high: 60,
        critical: 80,
      },
      rateLimits: {
        requests: 500,
        timeWindow: 3600000,
      },
    },
  } as CombinedMiddlewareConfig,

  /**
   * Standard security configuration
   */
  standard: {
    auth: {
      requireAuth: true,
      requireMFA: false,
      checkDeviceTrust: true,
      logSecurityEvents: true,
      rateLimitRequests: true,
      blockSuspiciousActivity: true,
    },
    security: {
      enableThreatDetection: true,
      enableAnomalyDetection: true,
      enableRealTimeMonitoring: true,
      blockHighRiskRequests: true,
      logAllEvents: false,
      alertThresholds: {
        high: 70,
        critical: 90,
      },
      rateLimits: {
        requests: 1000,
        timeWindow: 3600000,
      },
    },
  } as CombinedMiddlewareConfig,

  /**
   * Development configuration (less restrictive)
   */
  development: {
    auth: {
      requireAuth: false,
      requireMFA: false,
      checkDeviceTrust: false,
      logSecurityEvents: true,
      rateLimitRequests: false,
      blockSuspiciousActivity: false,
    },
    security: {
      enableThreatDetection: true,
      enableAnomalyDetection: false,
      enableRealTimeMonitoring: false,
      blockHighRiskRequests: false,
      logAllEvents: false,
      alertThresholds: {
        high: 90,
        critical: 95,
      },
      rateLimits: {
        requests: 10000,
        timeWindow: 3600000,
      },
    },
  } as CombinedMiddlewareConfig,
};
