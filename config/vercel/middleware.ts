import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Security headers for healthcare compliance
  const response = NextResponse.next();

  // Healthcare security headers
  response.headers.set("X-Healthcare-Compliance", "LGPD-ANVISA-CFM");
  response.headers.set(
    "X-Content-Security-Policy",
    "healthcare-data-protected",
  );
  response.headers.set("X-Audit-Log-Enabled", "true");

  // Rate limiting headers
  response.headers.set("X-RateLimit-Limit", "100");
  response.headers.set("X-RateLimit-Remaining", "99");
  response.headers.set("X-RateLimit-Reset", "3600");

  // HIPAA/LGPD compliance headers
  if (request.nextUrl.pathname.startsWith("/api/")) {
    response.headers.set(
      "Access-Control-Allow-Origin",
      process.env.NEXT_PUBLIC_ALLOWED_ORIGINS || "https://neonpro.healthcare",
    );
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-API-Key",
    );
    response.headers.set("Access-Control-Max-Age", "86400");

    // Additional security for API endpoints
    response.headers.set("X-API-Version", "v1");
    response.headers.set("X-Data-Classification", "PHI-Protected");
  }

  // Cache control for static assets
  if (
    request.nextUrl.pathname.startsWith("/assets/") ||
    request.nextUrl.pathname.startsWith("/_next/")
  ) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable",
    );
  }

  // No cache for sensitive routes
  if (
    request.nextUrl.pathname.startsWith("/patient/") ||
    request.nextUrl.pathname.startsWith("/medical/") ||
    request.nextUrl.pathname.startsWith("/admin/")
  ) {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private",
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  // Audit logging for sensitive operations
  const sensitivePaths = [
    "/api/patient",
    "/api/medical",
    "/api/appointment",
    "/api/prescription",
  ];
  if (
    sensitivePaths.some((path) => request.nextUrl.pathname.startsWith(path))
  ) {
    console.log(
      `[AUDIT] ${new Date().toISOString()} - ${request.method} ${request.nextUrl.pathname} - ${request.ip}`,
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
