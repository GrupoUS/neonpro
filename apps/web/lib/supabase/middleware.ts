/**
 * Modern Supabase Middleware for NeonPro Healthcare
 * Implements session management for Next.js 15 App Router
 * Healthcare compliance with audit trails and security
 */

import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Update session helper for middleware
 * Manages authentication tokens and session refresh
 * Required for proper SSR authentication flow
 */
export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Set cookies on both request and response for proper session management
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
      global: {
        headers: {
          "X-Client-Type": "neonpro-healthcare-middleware",
          "X-Compliance": "LGPD-ANVISA-CFM",
        },
      },
    },
  );

  // CRITICAL: Must call getUser() to refresh tokens
  // This is required for proper session management
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Healthcare route protection
  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth");
  const isPublicRoute = ["/", "/about", "/services", "/contact", "/privacy", "/terms"].includes(
    request.nextUrl.pathname,
  );

  // Redirect unauthenticated users from protected routes
  if (!user && !isAuthRoute && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (user && isAuthRoute && !request.nextUrl.pathname.includes("/logout")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Healthcare audit logging for route access
  if (user) {
    await logRouteAccess(user.id, request.nextUrl.pathname, request.ip);
  }

  // CRITICAL: Must return the supabaseResponse to maintain session
  return supabaseResponse;
}

/**
 * Log route access for healthcare audit compliance
 * LGPD requires comprehensive access logging
 */
async function logRouteAccess(userId: string, pathname: string, ipAddress?: string): Promise<void> {
  try {
    // Only log access to sensitive healthcare routes
    const healthcareRoutes = [
      "/dashboard",
      "/patients",
      "/appointments",
      "/treatments",
      "/medical-records",
      "/reports",
    ];

    const isHealthcareRoute = healthcareRoutes.some((route) => pathname.startsWith(route));

    if (!isHealthcareRoute) return;

    // Note: In a real implementation, this would use a background job
    // to avoid blocking the middleware response
    console.log("Healthcare route access:", {
      userId,
      pathname,
      ipAddress,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Healthcare audit logging failed:", error);
    // Don't throw - audit logging failure shouldn't block requests
  }
}
