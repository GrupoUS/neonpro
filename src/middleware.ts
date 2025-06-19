// NEONPRO Middleware - AI Integration V2.0 + OpenTelemetry Observability
// GRUPO US VIBECODE SYSTEM V5.0 - Phase 8 Production Monitoring
// Next.js middleware with shared AI services integration and comprehensive observability

import { SpanKind, SpanStatusCode, trace } from "@opentelemetry/api";
import { processRequest } from "@project-core/shared-services/middleware/shared-middleware";
import { NextRequest, NextResponse } from "next/server";
import { neonproObservability } from "./lib/observability";

export async function middleware(request: NextRequest) {
  // Start OpenTelemetry span for request tracing
  const tracer = trace.getActiveTracer();
  const span = tracer?.startSpan("neonpro.middleware.request", {
    kind: SpanKind.SERVER,
    attributes: {
      "http.method": request.method,
      "http.url": request.url,
      "http.user_agent": request.headers.get("user-agent") || "unknown",
      "clinic.component": "middleware",
    },
  });

  try {
    // Add request context to span
    span?.setAttributes({
      "request.path": request.nextUrl.pathname,
      "request.search": request.nextUrl.search,
      "request.timestamp": new Date().toISOString(),
    });

    // 1. Enhanced Security Processing (AI Security, Rate Limiting, Threat Detection, Compliance)
    const securitySpan = tracer?.startSpan("neonpro.middleware.security", {
      parent: span,
      attributes: { "security.component": "enhanced_security" },
    });

    try {
      const securityResponse = await processSecurityRequest(request, "neonpro");
      if (securityResponse) {
        securitySpan?.setStatus({
          code: SpanStatusCode.OK,
          message: "Security check blocked request",
        });
        securitySpan?.end();
        span?.setStatus({
          code: SpanStatusCode.OK,
          message: "Request blocked by security",
        });
        span?.end();
        return securityResponse;
      }
      securitySpan?.setStatus({
        code: SpanStatusCode.OK,
        message: "Security check passed",
      });
    } catch (securityError) {
      securitySpan?.setStatus({
        code: SpanStatusCode.ERROR,
        message: `Security check failed: ${securityError}`,
      });
      throw securityError;
    } finally {
      securitySpan?.end();
    }

    // 2. Shared Middleware Processing (Authentication, Analytics, Basic Rate Limiting)
    const sharedSpan = tracer?.startSpan("neonpro.middleware.shared", {
      parent: span,
      attributes: { "middleware.component": "shared_processing" },
    });

    try {
      const sharedResponse = await processRequest(request, "neonpro");
      if (sharedResponse) {
        sharedSpan?.setStatus({
          code: SpanStatusCode.OK,
          message: "Shared middleware processed request",
        });
        sharedSpan?.end();
        span?.setStatus({
          code: SpanStatusCode.OK,
          message: "Request processed by shared middleware",
        });
        span?.end();
        return sharedResponse;
      }
      sharedSpan?.setStatus({
        code: SpanStatusCode.OK,
        message: "Shared middleware passed",
      });
    } catch (sharedError) {
      sharedSpan?.setStatus({
        code: SpanStatusCode.ERROR,
        message: `Shared middleware failed: ${sharedError}`,
      });
      throw sharedError;
    } finally {
      sharedSpan?.end();
    }

    // 3. Continue with normal request processing
    span?.setStatus({
      code: SpanStatusCode.OK,
      message: "Request passed all middleware checks",
    });
    span?.setAttributes({
      "middleware.result": "passed",
      "response.status": "continue",
    });

    // Record middleware performance metric
    neonproObservability.recordMetric("clinic.middleware.requests", 1, {
      "middleware.result": "success",
      "request.method": request.method,
    });

    return NextResponse.next();
  } catch (error) {
    console.error("NEONPRO Middleware error:", error);

    // Record error in span
    span?.setStatus({
      code: SpanStatusCode.ERROR,
      message: `Middleware error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    });
    span?.setAttributes({
      "error.type":
        error instanceof Error ? error.constructor.name : "UnknownError",
      "error.message": error instanceof Error ? error.message : String(error),
    });

    // Record error metric
    neonproObservability.recordMetric("clinic.middleware.errors", 1, {
      "error.type":
        error instanceof Error ? error.constructor.name : "UnknownError",
    });

    // Fallback to basic security headers
    const response = NextResponse.next();
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    return response;
  } finally {
    // Always end the span
    span?.end();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
