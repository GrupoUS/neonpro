/**
 * Production-Ready Clerk Middleware
 * Optimized for healthcare applications with LGPD compliance
 * Based on Next.js 14+ App Router best practices
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { clerkConfig } from "@/lib/auth/clerk-config";

// Define protected routes
const isProtectedRoute = createRouteMatcher(clerkConfig.protectedRoutes);

// Define public routes that should never be protected
const isPublicRoute = createRouteMatcher(clerkConfig.publicRoutes);

// Define API routes that need authentication
const isProtectedApiRoute = createRouteMatcher([
  "/api/protected/(.*)",
  "/api/patients/(.*)",
  "/api/appointments/(.*)",
  "/api/admin/(.*)",
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;

  // Always allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  if (isProtectedRoute(req) || isProtectedApiRoute(req)) {
    const { userId, sessionId } = auth();

    // Redirect to sign-in if not authenticated
    if (!userId || !sessionId) {
      return auth().redirectToSignIn({
        returnBackUrl: req.url,
      });
    }

    // Add security headers for healthcare compliance
    const response = NextResponse.next();

    // LGPD and healthcare security headers
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    // Healthcare data protection headers
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    // Session and user context headers (for client-side usage)
    response.headers.set("X-User-ID", userId);
    response.headers.set("X-Session-ID", sessionId);

    return response;
  }

  // Allow all other routes
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
