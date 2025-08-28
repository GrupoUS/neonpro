// ================================================
// API GATEWAY SERVICE
// Enterprise-grade API gateway with authentication, rate limiting, and routing
// ================================================

import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ================================================
// TYPES AND INTERFACES
// ================================================

interface ServiceRoute {
  pattern: RegExp;
  service: string;
  baseUrl: string;
  requiresAuth: boolean;
  rateLimit?: {
    windowMs: number;
    max: number;
  };
  timeout: number;
}

interface AuthContext {
  userId: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
  sessionId: string;
}

interface RequestMetrics {
  method: string;
  path: string;
  service: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  userId?: string;
  tenantId?: string;
}

// ================================================
// SERVICE CONFIGURATION
// ================================================

const SERVICE_ROUTES: ServiceRoute[] = [
  // Authentication Service
  {
    pattern: /^\/api\/auth\/.*/,
    service: "auth",
    baseUrl: process.env.AUTH_SERVICE_URL || "http://localhost:3001",
    requiresAuth: false,
    rateLimit: { windowMs: 15 * 60 * 1000, max: 100 }, // 100 requests per 15 minutes
    timeout: 5000,
  },

  // Patient Management Service
  {
    pattern: /^\/api\/patients\/.*/,
    service: "patients",
    baseUrl: process.env.PATIENTS_SERVICE_URL || "http://localhost:3002",
    requiresAuth: true,
    rateLimit: { windowMs: 60 * 1000, max: 1000 }, // 1000 requests per minute
    timeout: 10_000,
  },

  // Financial Service
  {
    pattern: /^\/api\/financial\/.*/,
    service: "financial",
    baseUrl: process.env.FINANCIAL_SERVICE_URL || "http://localhost:3003",
    requiresAuth: true,
    rateLimit: { windowMs: 60 * 1000, max: 500 }, // 500 requests per minute
    timeout: 15_000,
  },

  // Compliance Service
  {
    pattern: /^\/api\/compliance\/.*/,
    service: "compliance",
    baseUrl: process.env.COMPLIANCE_SERVICE_URL || "http://localhost:3004",
    requiresAuth: true,
    rateLimit: { windowMs: 60 * 1000, max: 200 }, // 200 requests per minute
    timeout: 20_000,
  },

  // Notification Service
  {
    pattern: /^\/api\/notifications\/.*/,
    service: "notifications",
    baseUrl: process.env.NOTIFICATIONS_SERVICE_URL || "http://localhost:3005",
    requiresAuth: true,
    rateLimit: { windowMs: 60 * 1000, max: 300 }, // 300 requests per minute
    timeout: 8000,
  },

  // Analytics Service
  {
    pattern: /^\/api\/analytics\/.*/,
    service: "analytics",
    baseUrl: process.env.ANALYTICS_SERVICE_URL || "http://localhost:3006",
    requiresAuth: true,
    rateLimit: { windowMs: 60 * 1000, max: 100 }, // 100 requests per minute
    timeout: 30_000,
  },
];

// ================================================
// RATE LIMITING CONFIGURATION
// ================================================

// ================================================
// AUTHENTICATION SERVICE
// ================================================

export class AuthenticationService {
  private static instance: AuthenticationService;

  private constructor() {}

  public static getInstance(): AuthenticationService {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService();
    }
    return AuthenticationService.instance;
  }

  async validateToken(token: string): Promise<AuthContext | null> {
    try {
      const response = await fetch(`${process.env.AUTH_SERVICE_URL}/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        timeout: 5000,
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      return data.authContext;
    } catch {
      return;
    }
  }

  async refreshToken(refreshToken: string): Promise<string | null> {
    try {
      const response = await fetch(`${process.env.AUTH_SERVICE_URL}/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
        timeout: 5000,
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      return data.accessToken;
    } catch {
      return;
    }
  }
}

// ================================================
// CIRCUIT BREAKER
// ================================================

interface CircuitBreakerState {
  failures: number;
  nextAttempt: number;
  state: "CLOSED" | "OPEN" | "HALF_OPEN";
}

export class CircuitBreaker {
  private readonly states: Map<string, CircuitBreakerState> = new Map();
  private readonly failureThreshold = 5;
  private readonly retryTimeout = 30_000; // 30 seconds

  async execute<T>(
    serviceKey: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    const state = this.getState(serviceKey);

    if (state.state === "OPEN") {
      if (Date.now() < state.nextAttempt) {
        throw new Error(`Circuit breaker is OPEN for service ${serviceKey}`);
      }
      // Try to half-open
      state.state = "HALF_OPEN";
    }

    try {
      const result = await operation();
      this.onSuccess(serviceKey);
      return result;
    } catch (error) {
      this.onFailure(serviceKey);
      throw error;
    }
  }

  private getState(serviceKey: string): CircuitBreakerState {
    if (!this.states.has(serviceKey)) {
      this.states.set(serviceKey, {
        failures: 0,
        nextAttempt: 0,
        state: "CLOSED",
      });
    }
    return this.states.get(serviceKey)!;
  }

  private onSuccess(serviceKey: string): void {
    const state = this.getState(serviceKey);
    state.failures = 0;
    state.state = "CLOSED";
  }

  private onFailure(serviceKey: string): void {
    const state = this.getState(serviceKey);
    state.failures++;

    if (state.failures >= this.failureThreshold) {
      state.state = "OPEN";
      state.nextAttempt = Date.now() + this.retryTimeout;
    }
  }
}

// ================================================
// REQUEST ROUTER
// ================================================

export class RequestRouter {
  private readonly circuitBreaker = new CircuitBreaker();
  private readonly authService = AuthenticationService.getInstance();

  async routeRequest(request: NextRequest): Promise<NextResponse> {
    const startTime = Date.now();
    const path = request.nextUrl.pathname;

    try {
      // Find matching service route
      const route = this.findRoute(path);
      if (!route) {
        return NextResponse.json(
          { error: "Service not found", path },
          { status: 404 },
        );
      }

      // Rate limiting
      if (route.rateLimit) {
        const rateLimitResult = await this.checkRateLimit(request, route);
        if (rateLimitResult) {
          return rateLimitResult;
        }
      }

      // Authentication
      let authContext: AuthContext | null;
      if (route.requiresAuth) {
        const authResult = await this.authenticate(request);
        if (authResult instanceof NextResponse) {
          return authResult; // Authentication failed
        }
        authContext = authResult;
      }

      // Route to service
      const response = await this.circuitBreaker.execute(route.service, () =>
        this.forwardRequest(request, route, authContext),
      );

      // Record metrics
      await this.recordMetrics({
        method: request.method,
        path,
        service: route.service,
        statusCode: response.status,
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
        userId: authContext?.userId,
        tenantId: authContext?.tenantId,
      });

      return response;
    } catch {
      // Record error metrics
      await this.recordMetrics({
        method: request.method,
        path,
        service: "unknown",
        statusCode: 500,
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
      });

      return NextResponse.json(
        {
          error: "Internal Server Error",
          message: "Service temporarily unavailable",
          requestId: crypto.randomUUID(),
        },
        { status: 500 },
      );
    }
  }

  private findRoute(path: string): ServiceRoute | null {
    return (
      SERVICE_ROUTES.find((route) => route.pattern.test(path)) || undefined
    );
  }

  private async checkRateLimit(
    _request: NextRequest,
    route: ServiceRoute,
  ): Promise<NextResponse | null> {
    if (!route.rateLimit) {
      return;
    }

    // Rate limiting logic would be implemented here
    // For now, return null (no rate limiting applied)
    return;
  }

  private async authenticate(
    request: NextRequest,
  ): Promise<AuthContext | NextResponse> {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const token = authHeader.slice(7);
    const authContext = await this.authService.validateToken(token);

    if (!authContext) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    return authContext;
  }

  private async forwardRequest(
    request: NextRequest,
    route: ServiceRoute,
    authContext: AuthContext | null,
  ): Promise<NextResponse> {
    const url = new URL(
      request.nextUrl.pathname + request.nextUrl.search,
      route.baseUrl,
    );

    const headers = new Headers(request.headers);

    // Add authentication context
    if (authContext) {
      headers.set("X-User-ID", authContext.userId);
      headers.set("X-Tenant-ID", authContext.tenantId);
      headers.set("X-User-Roles", authContext.roles.join(","));
      headers.set("X-Session-ID", authContext.sessionId);
    }

    // Add request ID for tracing
    const requestId = crypto.randomUUID();
    headers.set("X-Request-ID", requestId);
    headers.set("X-Forwarded-For", request.ip || "unknown");

    try {
      const response = await fetch(url.toString(), {
        method: request.method,
        headers,
        body: request.body,
        signal: AbortSignal.timeout(route.timeout),
      });

      // Copy response headers
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set("X-Request-ID", requestId);
      responseHeaders.set("X-Service", route.service);

      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (error) {
      if (error.name === "AbortError") {
        return NextResponse.json(
          {
            error: "Service Timeout",
            message: `Service ${route.service} took too long to respond`,
            requestId,
          },
          { status: 504 },
        );
      }

      throw error;
    }
  }

  private async recordMetrics(metrics: RequestMetrics): Promise<void> {
    try {
      // Send metrics to monitoring service (async, don't block)
      fetch(`${process.env.MONITORING_SERVICE_URL}/metrics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metrics),
      }).catch((_error) => {});
    } catch {}
  }
}

// ================================================
// MIDDLEWARE FACTORY
// ================================================

export function createApiGatewayMiddleware() {
  const router = new RequestRouter();

  return async function apiGatewayMiddleware(request: NextRequest) {
    // Skip non-API requests
    if (!request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.next();
    }

    return router.routeRequest(request);
  };
}

// ================================================
// HEALTH CHECK
// ================================================

export async function healthCheck(): Promise<{
  status: "healthy" | "unhealthy";
  services: Record<string, "up" | "down">;
  timestamp: string;
}> {
  const services: Record<string, "up" | "down"> = {};

  await Promise.allSettled(
    SERVICE_ROUTES.map(async (route) => {
      try {
        const response = await fetch(`${route.baseUrl}/health`, {
          timeout: 5000,
        });
        services[route.service] = response.ok ? "up" : "down";
      } catch {
        services[route.service] = "down";
      }
    }),
  );

  const allServicesUp = Object.values(services).every(
    (status) => status === "up",
  );

  return {
    status: allServicesUp ? "healthy" : "unhealthy",
    services,
    timestamp: new Date().toISOString(),
  };
}
